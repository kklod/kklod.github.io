define(['appSettings', 'userSettings', 'subtitleAppearanceHelper', 'events', 'playbackManager', 'playQueueManager', 'connectionManager', 'apphost', 'itemHelper', 'appRouter', 'globalize', 'queryString'], function (appSettings, userSettings, subtitleAppearanceHelper, events, playbackManager, PlayQueueManager, connectionManager, appHost, itemHelper, appRouter, globalize, queryString) {

    'use strict';

    function MpvPlayer() {

        var self = this;

        self.name = 'LibMpv Audio Player';

        self.type = 'mediaplayer';
        self.id = 'mpvaudioplayer';
        self.isLocalPlayer = true;
        self.playerState = {};
        self.playQueueState = {};

        window.MpvAudioPlayer = self;

        var currentMediaSource;
        var currentItem;
        var currentAspectRatio = 'bestfit';
        var currentPlayResolve;
        var currentPlayReject;
        var stopResolve;
        var destroyResolve;

        function onTimeUpdate() {
            events.trigger(self, 'timeupdate');
        }

        function onVolumeChange() {
            events.trigger(self, 'volumechange');
        }

        function onUnpause() {
            events.trigger(self, 'unpause');
        }

        function onPause() {
            events.trigger(self, 'pause');
        }

        function onRateChange() {
            events.trigger(self, 'playbackratechange');
        }

        function onRepeatModeChange(value) {
            self.playQueueState.repeatMode = value;
            events.trigger(self, 'repeatmodechange');
        }

        function onError() {

            var reject = currentPlayReject;
            var state = self.playerState;

            if (reject) {
                state.started = null;
                currentPlayReject = null;
                currentPlayResolve = null;

                reject();
                self.destroy();
                return;
            }

            if (state.started) {

                state.started = null;

                events.trigger(self, 'error', [
                    {
                        type: 'mediadecodeerror'
                    }]);
            }
        }

        function onEnded() {

            var state = self.playerState;
            var resolve = stopResolve;

            var item = self.currentItem();
            if (item && !self._reportedStopped) {

                self._reportedStopped = true;

                state.started = null;
                currentPlayReject = null;
                currentPlayResolve = null;

                var hasNext;
                if (resolve) {
                    hasNext = false;
                }
                else {
                    let nextIndex = self.playQueueState.currentPlaylistIndex + 1;   
                    hasNext = self.playQueueState.repeatMode !== 'RepeatNone' || nextIndex < self.getCurrentPlaylistLength();
                }

                events.trigger(self, 'itemstopped', [{
                    item: item,
                    mediaSource: self.currentMediaSource(),
                    positionMs: self.currentTime(),
                    nextMediaType: hasNext ? "Audio" : null
                }]);
            }

            // Handle nothing to play next
            if (resolve) {
                stopResolve = null;
                resetPlayQueueState();
                resolve();
            }
        }

        function resetPlayQueueState() {
            self.playQueueState.playlist = [];
            self.playQueueState.currentPlaylistItemId = null;
            self.playQueueState.currentPlaylistIndex = -1;
            self.playQueueState.repeatMode = 'RepeatNone';
        }

        self.canSetAudioStreamIndex = function () {
            return true;
        };

        var supportedFeatures;
        function getSupportedFeatures() {

            var list = [];

            //list.push('SetBrightness');
            list.push('SetAspectRatio');
            list.push('SetPlaybackRate');

            //list.push('PictureInPicture');

            return list;
        }

        self.supports = function (feature) {

            if (!supportedFeatures) {
                supportedFeatures = getSupportedFeatures();
            }

            return supportedFeatures.indexOf(feature) !== -1;
        };

        self.setAspectRatio = function (val) {

            currentAspectRatio = val;
            sendMpvCommand("setAspectRatio", val);
        };

        self.getAspectRatio = function () {

            return currentAspectRatio;
        };

        self.getSupportedAspectRatios = function () {

            return [
                { name: '4:3', id: '4_3' },
                { name: '16:9', id: '16_9' },
                { name: globalize.translate('Auto'), id: 'bestfit' },
                { name: globalize.translate('Fill'), id: 'fill' },
                { name: globalize.translate('Original'), id: 'original' }
            ];
        };

        self.setSubtitleStreamIndex = function (index) {

            sendMpvCommand('setSubtitleStreamIndex', index);
        };

        self.setAudioStreamIndex = function (index) {
            sendMpvCommand("setAudioStreamIndex", index);
        };

        self.canPlayMediaType = function (mediaType) {

            mediaType = (mediaType || '').toLowerCase();

            if (mediaType === 'audio') {
                return true;
            }

            if (mediaType === 'video') {
                return false;
            }

            return false;
        };

        self.getDeviceProfile = function (item) {
            var profile = {};

            // Only setting MaxStaticBitrate for older servers
            profile.MaxStreamingBitrate = profile.MaxStaticBitrate = 200000000;
            profile.MusicStreamingTranscodingBitrate = 192000;

            profile.DirectPlayProfiles = [];

            // leave container null for all
            profile.DirectPlayProfiles.push({
                Type: 'Video',
                AudioCodec: '-dts,dca,truehd'
            });

            // leave container null for all
            profile.DirectPlayProfiles.push({
                Type: 'Audio'
            });

            profile.TranscodingProfiles = [];

            profile.TranscodingProfiles.push({
                Container: 'ts',
                Type: 'Video',
                AudioCodec: 'ac3,mp3,aac',
                VideoCodec: 'h264,hevc,mpeg2video',
                Context: 'Streaming',
                Protocol: 'hls',
                MaxAudioChannels: '6',
                MinSegments: '1',
                BreakOnNonKeyFrames: true,
                SegmentLength: '3'
            });

            profile.TranscodingProfiles.push({

                Container: 'ts',
                Type: 'Audio',
                AudioCodec: 'aac',
                Context: 'Streaming',
                Protocol: 'hls',
                MinSegments: '1',
                SegmentLength: '3',
                BreakOnNonKeyFrames: true
            });

            profile.TranscodingProfiles.push({
                Container: 'mp3',
                Type: 'Audio',
                AudioCodec: 'mp3',
                Context: 'Streaming',
                Protocol: 'http'
            });

            profile.ContainerProfiles = [];

            profile.CodecProfiles = [];

            profile.CodecProfiles.push({
                Type: 'Video',
                Codec: 'hevc',
                Conditions: [
                    {
                        Condition: 'EqualsAny',
                        Property: 'VideoProfile',
                        Value: 'Main|Main 10'
                    }]
            });

            // Subtitle profiles
            // External vtt or burn in
            profile.SubtitleProfiles = [];
            profile.SubtitleProfiles.push({
                Format: 'srt',
                Method: 'External'
            });
            profile.SubtitleProfiles.push({
                Format: 'ssa',
                Method: 'External'
            });
            profile.SubtitleProfiles.push({
                Format: 'ass',
                Method: 'External'
            });
            profile.SubtitleProfiles.push({
                Format: 'vtt',
                Method: 'External'
            });
            profile.SubtitleProfiles.push({
                Format: 'srt',
                Method: 'Embed'
            });
            profile.SubtitleProfiles.push({
                Format: 'subrip',
                Method: 'Embed'
            });
            profile.SubtitleProfiles.push({
                Format: 'ass',
                Method: 'Embed'
            });
            profile.SubtitleProfiles.push({
                Format: 'ssa',
                Method: 'Embed'
            });
            profile.SubtitleProfiles.push({
                Format: 'dvb_teletext',
                Method: 'Embed'
            });
            profile.SubtitleProfiles.push({
                Format: 'dvb_subtitle',
                Method: 'Embed'
            });
            profile.SubtitleProfiles.push({
                Format: 'dvbsub',
                Method: 'Embed'
            });
            profile.SubtitleProfiles.push({
                Format: 'pgs',
                Method: 'Embed'
            });
            profile.SubtitleProfiles.push({
                Format: 'pgssub',
                Method: 'Embed'
            });
            profile.SubtitleProfiles.push({
                Format: 'dvdsub',
                Method: 'Embed'
            });
            profile.SubtitleProfiles.push({
                Format: 'vtt',
                Method: 'Embed'
            });
            profile.SubtitleProfiles.push({
                Format: 'sub',
                Method: 'Embed'
            });
            profile.SubtitleProfiles.push({
                Format: 'idx',
                Method: 'Embed'
            });
            profile.SubtitleProfiles.push({
                Format: 'smi',
                Method: 'Embed'
            });

            profile.ResponseProfiles = [];

            return Promise.resolve(profile);
        };

        self.currentTime = function (val) {

            if (val != null) {
                return self.seek(val);
            }

            if (self.playerState) {
                return Math.round(self.playerState.currentTime);
            }

            return null;
        };

        self.seek = function (val) {

            sendMpvCommand("setPosition", val);
        };
        
        self.seekRelative = function (val) {
            
            sendMpvCommand("seekRelative", val);
        }

        self.duration = function (val) {

            if (self.playerState) {
                return self.playerState.duration;
            }

            return null;
        };

        self.stop = function (destroyPlayer) {

            if (self.isPlaying()) {
                return new Promise(function (resolve, reject) {
                    sendMpvCommand("stop", (destroyPlayer || false).toString());

                    stopResolve = resolve;
                });
            }
            else {
                return Promise.resolve();
            }
        };

        self.playPause = function () {
            sendMpvCommand("playPause", null);
        };

        self.pause = function () {
            sendMpvCommand("pause", null);
        };

        self.unpause = function () {
            sendMpvCommand("unpause", null);
        };

        var brightnessValue = 100;
        self.setBrightness = function (val) {
            brightnessValue = val;
            sendMpvCommand("setBrightness", val.toString());
            events.trigger(self, 'brightnesschange');
        };

        self.getBrightness = function () {
            return brightnessValue;
        };

        self.setVolume = function (val) {
            if (val != null) {
                sendMpvCommand("setVolume", val.toString());
            }
        };

        self.getVolume = function () {
            if (self.playerState) {
                return self.playerState.volume;
            }
        };

        self.volume = function (val) {
            if (val != null) {
                return self.setVolume(val);
            }

            return self.getVolume();
        };

        self.volumeUp = function () {
            sendMpvCommand("volumeUp");
        };

        self.volumeDown = function () {
            sendMpvCommand("volumeDown");
        };

        self.notifyVolumeChange = function (val, changedByUser) {
            self.playerState.volume = val;
            if (changedByUser) {
                onVolumeChange();
            }
        };

        self.setMute = function (mute) {
            sendMpvCommand("setMute", mute.toString());
        };

        self.isMuted = function () {
            if (self.playerState) {
                return self.playerState.muted;
            }

            return false;
        };

        self.play = function (options) {

            return new Promise(function (resolve, reject) {

                currentPlayResolve = resolve;
                currentPlayReject = reject;

                resetPlayQueueState();

                var items = options.items;
                var startIndex = options.startIndex || 0;

                self.playQueueState.playlist = items;
                self.playQueueState.currentPlaylistIndex = startIndex;
                self.playQueueState.playlist.forEach(addUniquePlaylistId);

                var mediaItems = items.map(convertToMediaItem);

                var startPosMs = (options.startPositionTicks || 0) / 10000;

                var mediaSource = self.currentMediaSource();
                currentMediaSource = mediaSource;
                currentItem = self.currentItem();

                self.playerState.mediaType = currentItem.MediaType;

                if (currentItem.MediaType === 'Audio') {

                    window.webkit.messageHandlers.playAudio.postMessage({
                        items: stringify(mediaItems),
                        isLocal: mediaSource.IsLocal || mediaSource.Protocol === 'File',
                        mediaSourceJson: stringify(mediaSource),
                        startIndex: startIndex,
                        startPosMs: startPosMs,
                    });
                    onAfterSendPlayCommand(startPosMs);

                }

            });
        };

        function onAfterSendPlayCommand(startPositionMs) {

            var state = self.playerState;

            currentAspectRatio = 'bestfit';

            state.duration = null;
            state.paused = false;
            state.muted = false;
            state.volume = 100;
            state.cacheStart = null;
            state.cacheEnd = null;
            state.started = null;
            state.playbackRate = 1;

            state.currentTime = startPositionMs;
        }

        self.getBufferedRanges = function () {

            var state = self.playerState;
            if (state) {

                var offset;
                //var currentPlayOptions = instance._currentPlayOptions;
                //if (currentPlayOptions) {
                //    offset = currentPlayOptions.transcodingOffsetTicks;
                //}

                offset = offset || 0;

                var cacheStart = state.cacheStart;
                var cacheEnd = state.cacheEnd;

                return [{
                    start: ((cacheStart || 0) * 10000) + offset,
                    end: ((cacheEnd || 0) * 10000) + offset
                }];
            }

            return [];
        };

        self.currentSrc = function () {
            if (self.playerState) {
                return self.playerState.currentSrc;
            }
        };

        self.paused = function () {

            if (self.playerState) {
                return self.playerState.paused;
            }

            return false;
        };

        self.seekable = function () {

            return true;
        };

        function onPlayerDestroy() {
            brightnessValue = 100;
            self.playerState = {};
            currentPlayReject = null;
            currentPlayResolve = null;
        }

        self.destroy = function () {

            return new Promise(function (resolve, reject) {

                sendMpvCommand('destroyPlayer', null);
                destroyResolve = resolve;
            });
        };

        function onItemStarted() {

            self._reportedStopped = false;

            var state = self.playerState;
            state.started = true;

            var resolve = currentPlayResolve;
            state.currentTime = state.currentTime || 0;

            if (resolve) { // first item has started playback
                currentPlayResolve = null;
                currentPlayReject = null;
                resolve();
            }
        }

        function onPlaylistItemIdChanged(currentPlaylistItemId) {

            self.playQueueState.currentPlaylistItemId = currentPlaylistItemId;
        }

        function onPlaylistPosChanged(pos) {

            var state = self.playerState;

            var index = parseInt(pos);
            if (isNaN(index)) {
                index = 0;
            }
            console.log('Item started at index: ' + index);

            self.playQueueState.currentPlaylistIndex = index;

            currentMediaSource = self.currentMediaSource();
            currentItem = self.currentItem();
            events.trigger(self, 'itemstarted', [currentItem, currentMediaSource]);

            state.currentSrc = getMediaUrl(currentItem);
        }

        self.onEvent = function (name, value) {

            if (name === 'start-file') {
                onItemStarted();
            }
            else if (name === 'file-loaded') {
                // onItemStarted();
            }
            else if (name === 'end-file') {
                onEnded();
            }
            else if (name === 'ended') {
                onEnded();
            }
            else if (name === 'error') {
                onError();
            }
            else if (name === 'shutdown') {
                onShutdown();
            }
        };

        function onShutdown() {

            onEnded();

            events.trigger(self, 'shutdown');

            onPlayerDestroy();

            var resolve = destroyResolve;
            if (resolve) {
                destroyResolve = null;
                resolve();
            }
        }

        self.onPropertyChange = function (name, value) {

            if (name === 'pause') {

                if (value === true) {
                    self.playerState.paused = true;
                    onPause();
                } else {
                    self.playerState.paused = false;
                    onUnpause();
                }
            }
            else if (name === 'time-pos') {

                self.playerState.currentTime = Math.round(value);
                onTimeUpdate();
            }
            else if (name === 'duration') {

                self.playerState.duration = value;
            }
            else if (name === 'playlist-pos') {
                onPlaylistPosChanged(value);
            }
            else if (name === 'playlistItemId') {

                onPlaylistItemIdChanged(value);
            }
            else if (name === 'speed') {

                self.playerState.playbackRate = value;
                onRateChange();
            }
            else if (name === 'repeat-mode') {

                onRepeatModeChange(value);
            }
        };

        self.onCacheUpdate = function (start, end) {

            var state = self.playerState;
            state.cacheStart = start;
            state.cacheEnd = end;
        };

        self.onPlaylistItemRemoved = function (removedId) {

            events.trigger(self, 'playlistitemremove', [
            {
                PlaylistItemIds: [removedId]
            }]);
        }

        self.onPlaylistItemMoved = function (playlistItemId, newIndex) {

            events.trigger(self, 'playlistitemmove', [
            {
                playlistItemId: playlistItemId,
                newIndex: newIndex
            }]);
        }

        self.onPlaylistChanged = function (jsonItems) {
            let items = []
            jsonItems.forEach(function (json) {
                items.push(JSON.parse(json));
            });
            self.playQueueState.playlist = items;
        }

        self.getPlaybackRate = function () {

            if (self.playerState) {
                return self.playerState.playbackRate;
            }
            return 1;
        };
    }

    function sendMpvCommand(command, value) {
        try {
            var postObject = {
                'command': command,
                'arg': value
            };
            window.webkit.messageHandlers.sendMpvCommand.postMessage(postObject);
        } catch (err) {
            console.log('There was an error posting to native app');
        }
    }

    function getMediaUrl(item) {

        var mediaSource = item.MediaSources[0];

        var url = mediaSource.StreamUrl || mediaSource.Path;

        return url;
    }

    function imageUrl(item, options) {

        options = options || {};
        options.type = options.type || "Primary";

        if (item.ImageTags && item.ImageTags[options.type]) {

            options.tag = item.ImageTags[options.type];
            return connectionManager.getApiClient(item.ServerId).getScaledImageUrl(item.Id, options);
        }

        if (item.AlbumId && item.AlbumPrimaryImageTag) {

            options.tag = item.AlbumPrimaryImageTag;
            return connectionManager.getApiClient(item.ServerId).getScaledImageUrl(item.AlbumId, options);
        }

        return null;
    }

    function stringify(obj) {
        return JSON.stringify(obj, getCircularReplacer());
    }

    const getCircularReplacer = () => {
        const seen = new WeakSet();
        return (key, value) => {
            if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
            }
            return value;
        };
    };

    function convertToMediaItem(item) {

        var mediaItem = {};

        var val = getMediaUrl(item);

        var tIndex = val.indexOf('#t=');
        if (tIndex !== -1) {
            val = val.split('#')[0];
        }

        var posterUrl = imageUrl(item, {
            type: 'Primary'
        });

        mediaItem.Path = val;
        mediaItem.Title = item.Name || "";
        mediaItem.Album = item.Album || "";
        mediaItem.Artist = item.AlbumArtist || "";
        mediaItem.CoverUrl = posterUrl || "";
        mediaItem.ItemId = item.Id;
        mediaItem.ServerId = item.ServerId;
        mediaItem.PlaylistItemId = item.PlaylistItemId;

        mediaItem.ItemJson = stringify(item);

        console.log('Sending ' + val + ' to mpv player');

        return mediaItem;
    }

    let uniquePlaylistNumber = 0;
    function addUniquePlaylistId(item) {

        if (!item.PlaylistItemId) {

            item.PlaylistItemId = "playlistItem" + uniquePlaylistNumber;
            uniquePlaylistNumber++;
        }
    }

    MpvPlayer.prototype.setPictureInPictureEnabled = function (isEnabled) {

    };

    MpvPlayer.prototype.isPictureInPictureEnabled = function () {

        return false;
    };

    MpvPlayer.prototype.togglePictureInPicture = function () {
        return this.setPictureInPictureEnabled(!this.isPictureInPictureEnabled());
    };

    // Required for players that manage their own playlist
    MpvPlayer.prototype.getPlaylist = function (options) {
        let queue = this.playQueueState.playlist;

        options = options || {};
        let start = options.StartIndex || 0;
        let limit = Math.min(options.Limit || queue.length, queue.length);

        return Promise.resolve({
            Items: queue.slice(start, limit + start),
            TotalRecordCount: queue.length
        });
    };

    // Required for players that manage their own playlist
    MpvPlayer.prototype.setRepeatMode = function (value) {
        sendMpvCommand("setRepeatMode", value);
    };

    // Required for players that manage their own playlist
    MpvPlayer.prototype.getRepeatMode = function () {

        return this.playQueueState.repeatMode;
    };

    // Required for players that manage their own playlist
    MpvPlayer.prototype.queue = function (items) {
        this.playQueueState.playlist.push(...items);
        this.playQueueState.playlist.forEach(addUniquePlaylistId);

        var mediaItems = items.map(convertToMediaItem);

        window.webkit.messageHandlers.queueItems.postMessage({ items: stringify(mediaItems), next: false });
        return Promise.resolve();
    };

    // Required for players that manage their own playlist
    MpvPlayer.prototype.queueNext = function (items) {
        this.playQueueState.playlist.unshift(...items);
        this.playQueueState.playlist.forEach(addUniquePlaylistId);

        var mediaItems = items.map(convertToMediaItem);

        window.webkit.messageHandlers.queueItems.postMessage({ items: stringify(mediaItems), next: true });
        return Promise.resolve();
    };

    // Required for players that manage their own playlist
    MpvPlayer.prototype.previousTrack = function () {
        this._reportedStopped = true;
        sendMpvCommand("prevTrack");
    };

    // Required for players that manage their own playlist
    MpvPlayer.prototype.nextTrack = function () {
        this._reportedStopped = true;
        sendMpvCommand("nextTrack");
    };

    // Required for players that manage their own playlist
    MpvPlayer.prototype.getCurrentPlaylistIndex = function () {
        return this.playQueueState.currentPlaylistIndex;
    };

    // Required for players that manage their own playlist
    MpvPlayer.prototype.getCurrentPlaylistLength = function () {
        return this.playQueueState.playlist.length;
    };

    // Required for players that manage their own playlist
    MpvPlayer.prototype.getCurrentPlaylistItemId = function () {
        return this.playQueueState.currentPlaylistItemId;
    };

    // Required for players that manage their own playlist
    MpvPlayer.prototype.setCurrentPlaylistItem = function (playlistItemId) {

        var newItem;
        var newItemIndex;
        var playlist = this.playQueueState.playlist;

        for (var i = 0, length = playlist.length; i < length; i++) {
            if (playlist[i].PlaylistItemId === playlistItemId) {
                newItem = playlist[i];
                newItemIndex = i;
                break;
            }
        }

        if (newItem) {
            this.playAtIndex(newItemIndex);
        }
    };

    // Required for players that manage their own playlist
    MpvPlayer.prototype.playAtIndex = function (index) {

        this._reportedStopped = true;
        sendMpvCommand('playAtIndex', index);

        return Promise.resolve();
    };

    // Required for players that manage their own playlist
    MpvPlayer.prototype.removeFromPlaylist = function (playlistItemIds) {

        var self = this;

        playlistItemIds.forEach(function (itemId) {

            var index = self.playQueueState.playlist.findIndex(function (item) {
                return item.PlaylistItemId === itemId;
            });

            if (index > -1) {
                window.webkit.messageHandlers.removeFromPlaylist.postMessage({ index: index });
            }
        });

        return Promise.resolve();
    };

    // Required for players that manage their own playlist
    MpvPlayer.prototype.movePlaylistItem = function (playlistItemId, newIndex) {

        let playlist = this.playQueueState.playlist

        let oldIndex = -1;
        for (let i = 0, length = playlist.length; i < length; i++) {
            if (playlist[i].PlaylistItemId === playlistItemId) {
                oldIndex = i;
                break;
            }
        }

        window.webkit.messageHandlers.movePlaylistItem.postMessage(
            {
                oldIndex: oldIndex,
                newIndex: newIndex
            });
    };

    // Required for players that manage their own playlist
    MpvPlayer.prototype.currentItem = function () {
        return this.playQueueState.playlist[this.playQueueState.currentPlaylistIndex];
    };

    // Required for players that manage their own playlist
    MpvPlayer.prototype.currentMediaSource = function () {

        var item = this.currentItem();

        if (item) {
            // Audio items always use PresetMediaSource
            return item.MediaSources[0];
        }

        return null;
    };

    // Required for players that manage their own playlist
    MpvPlayer.prototype.isPlaying = function (mediaType) {

        // If mediaType == null then that means are we playing anything at all

        if (!mediaType || mediaType === 'Audio') {
            var started = this.playerState.started;
            if (started) {
                return started;
            }
        }

        return false;
    };

    // Required for players that manage their own playlist
    MpvPlayer.prototype.getAudioStreamIndex = function () {
        return null;
    };

    // Required for players that manage their own playlist
    MpvPlayer.prototype.getSubtitleStreamIndex = function () {
        return null;
    };

    // Required for players that manage their own playlist
    MpvPlayer.prototype.playMethod = function () {

        // null for unknown for these preset audio urls
        return null;
    };

    // Required for players that manage their own playlist
    MpvPlayer.prototype.playSessionId = function () {

        var mediaSource = this.currentMediaSource();

        if (mediaSource && mediaSource.StreamUrl) {
            var url = mediaSource.StreamUrl;
            var index = url.indexOf('?');
            var params = index === -1 ? {} : queryString.parse(url.substring(index + 1));
            return params.PlaySessionId;
        }

        return null;
    };

    MpvPlayer.prototype.setPlaybackRate = function (value) {
        window.webkit.messageHandlers.sendMpvCommand.postMessage({
            command: 'setPlaybackRate',
            arg: value
        });
    };

    return MpvPlayer;
});
