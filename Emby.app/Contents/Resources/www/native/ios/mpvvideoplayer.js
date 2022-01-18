define(['appSettings', 'userSettings', 'subtitleAppearanceHelper', 'events', 'playbackManager', 'connectionManager', 'apphost', 'itemHelper', 'appRouter', 'globalize'], function (appSettings, userSettings, subtitleAppearanceHelper, events, playbackManager, connectionManager, appHost, itemHelper, appRouter, globalize) {

    'use strict';

    function MpvPlayer() {

        var self = this;

        self.name = 'LibMpv Video Player';

        self.type = 'mediaplayer';
        self.id = 'mpvvideoplayer';
        self.isLocalPlayer = true;

        window.MpvVideoPlayer = self;

        var currentMediaSource;
        var currentItem;
        var currentAspectRatio = 'auto';
        var currentPlayResolve;
        var currentPlayReject;
        var playerState = {};

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

        function onError() {

            var reject = currentPlayReject;

            if (reject) {
                playerState.started = null;
                currentPlayReject = null;
                currentPlayResolve = null;

                reject();
                self.destroy();
                return;
            }

            if (playerState.started) {

                playerState.started = null;

                events.trigger(self, 'error', [
                    {
                        type: 'mediadecodeerror'
                    }]);
            }
        }

        function onEnded() {

            var state = playerState;

            if (state.started) {

                state.started = null;
                currentPlayReject = null;
                currentPlayResolve = null;

                var stopInfo = {
                    self: state.currentSrc
                };

                events.trigger(self, 'stopped', [stopInfo]);
            }
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
            list.push('SetSubtitleOffset');

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
                { name: globalize.translate('Auto'), id: 'auto' },
                { name: globalize.translate('Cover'), id: 'cover' },
                { name: globalize.translate('Fill'), id: 'fill' }
            ];
        };

        function getTextTrackUrl(subtitleStream, item, mediaSource) {

            if ((itemHelper.isLocalItem(item) || mediaSource.IsLocal) && subtitleStream.Path) {
                return subtitleStream.Path;
            }

            return playbackManager.getSubtitleUrl(subtitleStream, item.ServerId);
        }

        self.setSubtitleStreamIndex = function (index) {

            sendMpvCommand('setSubtitleStreamIndex', index);
        };

        self.setAudioStreamIndex = function (index) {
            sendMpvCommand("setAudioStreamIndex", index);
        };

        self.canPlayMediaType = function (mediaType) {

            mediaType = (mediaType || '').toLowerCase();

            if (mediaType === 'audio') {
                return false;
            }

            if (mediaType === 'video') {
                return true;
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
            if (window.applePlatform === 'maccatalyst' && window.buildScheme === 'direct-download') {
                profile.DirectPlayProfiles.push({
                    Type: 'Video'
                });
            }
            else {
                profile.DirectPlayProfiles.push({
                    Type: 'Video',
                    AudioCodec: '-dts,dca,truehd'
                });
            }

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

            if (playerState) {
                return playerState.currentTime;
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

            if (playerState) {
                return playerState.duration;
            }

            return null;
        };

        self.stop = function (destroyPlayer) {

            return new Promise(function (resolve, reject) {
                sendMpvCommand("stop", (destroyPlayer || false).toString());

                setTimeout(function () {

                    onEnded();

                    if (destroyPlayer) {
                        onPlayerDestroy();
                    }

                    resolve();

                }, 500);
            });
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
            if (playerState) {
                return playerState.volume;
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
            playerState.volume = val;
            if (changedByUser) {
                onVolumeChange();
            }
        };

        self.setMute = function (mute) {
            sendMpvCommand("setMute", mute.toString());
        };

        self.isMuted = function () {
            if (playerState) {
                return playerState.muted;
            }

            return false;
        };

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

        self.play = function (options) {

            return new Promise(function (resolve, reject) {

                currentPlayResolve = resolve;
                currentPlayReject = reject;

                var item = options.item;
                var mediaSource = options.mediaSource;

                var val = options.url;

                console.log('Sending ' + val + ' to mpv player');

                var tIndex = val.indexOf('#t=');
                var startPosMs = (options.playerStartPositionTicks || 0) / 10000;

                if (tIndex !== -1) {
                    val = val.split('#')[0];
                }

                currentMediaSource = mediaSource;
                currentItem = item;

                var apiClient = connectionManager.getApiClient(item.ServerId);

                playerState.mediaType = options.mediaType;

                var posterUrl = imageUrl(item, {
                    type: 'Primary'
                });

                if (options.mediaType === 'Video') {

                    // Implement later
                    var videoStreamIndex = -1;
                    var audioStreamIndex = mediaSource.DefaultAudioStreamIndex == null ? -1 : mediaSource.DefaultAudioStreamIndex;

                    var subtitleTrackIndexToSetOnPlaying = -1;
                    for (var i = 0, length = mediaSource.MediaStreams.length; i < length; i++) {

                        var track = mediaSource.MediaStreams[i];

                        if (track.Type === 'Subtitle') {

                            // TODO: remove after a release.
                            if ((itemHelper.isLocalItem(item) || mediaSource.IsLocal) && !track.DeliveryMethod && !track.IsExternal) {
                                track.DeliveryMethod = 'Embed';
                            }
                            // ----------------------------

                            if (track.DeliveryMethod === 'External') {
                                track.DeliveryUrl = getTextTrackUrl(track, item, mediaSource);
                            }

                            if (track.Index === mediaSource.DefaultSubtitleStreamIndex && (track.DeliveryMethod === 'Embed' || track.DeliveryMethod === 'External')) {
                                subtitleTrackIndexToSetOnPlaying = track.Index;
                            }
                        }
                    }

                    var isTranscoding = options.playMethod === 'Transcode';

                    try {
                        var postObject = {
                            'path': val,
                            'isLocal': mediaSource.IsLocal,
                            'itemId': item.Id,
                            'itemJson': JSON.stringify(item),
                            'mediaSourceJson': JSON.stringify(mediaSource),
                            'isTranscoding': isTranscoding,
                            'startPosMs': startPosMs,
                            'videoStreamIndex': videoStreamIndex,
                            'audioStreamIndex': audioStreamIndex,
                            'subtitleStreamIndex': subtitleTrackIndexToSetOnPlaying,
                            'posterUrl': posterUrl
                        };

                        window.webkit.messageHandlers.playVideo.postMessage(postObject);
                    } catch (err) {
                        console.log('There was an error posting to native app');
                    }

                    onAfterSendPlayCommand(val, startPosMs);
                }
            });
        };

        function onAfterSendPlayCommand(src, startPositionMs) {

            var state = playerState;

            currentAspectRatio = 'auto';

            state.currentSrc = src;
            state.duration = null;
            state.paused = false;
            state.muted = false;
            state.volume = 100;
            state.cacheStart = null;
            state.cacheEnd = null;
            state.started = null;
            state.subDelay = 0;
            state.playbackRate = 1;

            state.currentTime = startPositionMs;
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

        self.getBufferedRanges = function () {

            var state = playerState;
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
            if (playerState) {
                return playerState.currentSrc;
            }
        };

        self.paused = function () {

            if (playerState) {
                return playerState.paused;
            }

            return false;
        };

        self.seekable = function () {

            return true;
        };

        function onPlayerDestroy() {
            appRouter.setTransparency('none');
            brightnessValue = 100;
            playerState = {};
            currentPlayReject = null;
            currentPlayResolve = null;
        }

        self.destroy = function () {

            sendMpvCommand('destroyPlayer', null);
            onPlayerDestroy();
        };

        self.onEvent = function (name) {

            if (name === 'start-file') {
            }
            else if (name === 'file-loaded') {

                // TODO: Do this here or on file-loaded?
                playerState.started = true;

                var resolve = currentPlayResolve;
                playerState.currentTime = playerState.currentTime || 0;

                if (resolve) {
                    currentPlayResolve = null;
                    currentPlayReject = null;
                    resolve();

                    if (playerState.mediaType === 'Video') {
                        appRouter.showVideoOsd();
                    }
                }
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
        };

        self.onPropertyChange = function (name, value) {

            if (name === 'pause') {

                if (value === true) {
                    playerState.paused = true;
                    onPause();
                } else {
                    playerState.paused = false;
                    onUnpause();
                }
            }
            else if (name === 'time-pos') {

                playerState.currentTime = value;
                onTimeUpdate();
            }
            else if (name === 'duration') {

                playerState.duration = value;
            }
            else if (name === 'sub-delay') {

                playerState.subDelay = value;
            }
            else if (name === 'speed') {

                playerState.playbackRate = value;
                onRateChange();
            }
        };

        self.onCacheUpdate = function (start, end) {

            var state = playerState;
            state.cacheStart = start;
            state.cacheEnd = end;
        };

        self.getSubtitleOffset = function () {

            if (playerState) {
                return playerState.subDelay;
            }
            return 0;
        };

        self.getPlaybackRate = function () {

            if (playerState) {
                return playerState.playbackRate;
            }
            return 1;
        };
    }

    MpvPlayer.prototype.setPictureInPictureEnabled = function (isEnabled) {

    };

    MpvPlayer.prototype.isPictureInPictureEnabled = function () {

        return false;
    };

    MpvPlayer.prototype.togglePictureInPicture = function () {
        return this.setPictureInPictureEnabled(!this.isPictureInPictureEnabled());
    };

    MpvPlayer.prototype.setPlaybackRate = function (value) {
        window.webkit.messageHandlers.sendMpvCommand.postMessage({
            command: 'setPlaybackRate',
            arg: value
        });
    };

    MpvPlayer.prototype.setSubtitleOffset = function (val) {
        window.webkit.messageHandlers.sendMpvCommand.postMessage({
            command: 'setSubtitleOffset',
            arg: val
        });
    };

    MpvPlayer.prototype.incrementSubtitleOffset = function (val) {
        window.webkit.messageHandlers.sendMpvCommand.postMessage({
            command: 'incrementSubtitleOffset',
            arg: val
        });
    };

    return MpvPlayer;
});
