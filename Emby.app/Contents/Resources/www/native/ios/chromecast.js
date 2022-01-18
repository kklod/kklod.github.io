define(['appSettings', 'apphost', 'userSettings', 'events', 'playbackManager', 'globalize', 'connectionManager'], function (appSettings, appHost, userSettings, events, playbackManager, globalize, connectionManager) {

    'use strict';

    function normalizePrimaryImage(state) {

        if (state && state.NowPlayingItem) {
            if (!state.NowPlayingItem.ImageTags || !state.NowPlayingItem.ImageTags.Primary) {
                if (state.NowPlayingItem.PrimaryImageTag) {
                    state.NowPlayingItem.ImageTags = state.NowPlayingItem.ImageTags || {};
                    state.NowPlayingItem.ImageTags.Primary = state.NowPlayingItem.PrimaryImageTag;
                }
            }
        }
    }

    function mapItemForLoadMedia(i) {
        return {
            Id: i.Id,
            ServerId: i.ServerId,
            Name: i.Name,
            Type: i.Type,
            MediaType: i.MediaType,
            IsFolder: i.IsFolder,
            ChannelId: i.ChannelId
        };
    }

    function ChromecastPlayer() {

        var self = this;

        window.Chromecast = self;

        var PlayerName = "Chromecast";
        var ApplicationID = "2D4B1DA3";
        var currentTarget;

        self.name = PlayerName;
        self.type = 'mediaplayer';
        self.id = 'chromecast';
        self.isLocalPlayer = false;

        this.resetLastPlayerData();

        self.getItemsForPlayback = function (apiClient, query) {

            var userId = apiClient.getCurrentUserId();

            if (query.Ids && query.Ids.split(',').length === 1) {
                return new Promise(function (resolve, reject) {

                    apiClient.getItem(userId, query.Ids.split(',')).then(function (item) {
                        resolve({
                            Items: [item],
                            TotalRecordCount: 1
                        });
                    });
                });
            }
            else {

                query.Limit = query.Limit || 200;
                query.ExcludeLocationTypes = "Virtual";

                return apiClient.getItems(userId, query);
            }
        };

        var castPlayer = {};

        events.on(castPlayer, "playbackstart", function (e, data) {

            console.log('cc: playbackstart');

            var state = self.getPlayerStateInternal(data);
            events.trigger(self, "playbackstart", [state]);
        });

        events.on(castPlayer, "playbackstop", function (e, data) {

            console.log('cc: playbackstop');
            var state = self.getPlayerStateInternal(data);

            events.trigger(self, "playbackstop", [state]);

            // Reset this so the next query doesn't make it appear like content is playing.
            self.resetLastPlayerData();
        });

        events.on(castPlayer, "playbackprogress", function (e, data) {

            console.log('cc: positionchange');
            var state = self.getPlayerStateInternal(data);

            events.trigger(self, "timeupdate", [state]);
        });

        events.on(castPlayer, "volumechange", function (e, data) {

            console.log('cc: volumechange');
            var state = self.getPlayerStateInternal(data);
            events.trigger(self, "volumechange", [state]);
        });

        events.on(castPlayer, "repeatmodechange", function (e, data) {

            console.log('cc: repeatmodechange');
            var state = self.getPlayerStateInternal(data);
            events.trigger(self, "repeatmodechange", [state]);
        });

        events.on(castPlayer, "subtitleoffsetchange", function (e, data) {

            console.log('cc: subtitleoffsetchange');
            var state = self.getPlayerStateInternal(data);
            events.trigger(self, "subtitleoffsetchange", [state]);
        });

        events.on(castPlayer, "playbackratechange", function (e, data) {

            console.log('cc: playbackratechange');
            var state = self.getPlayerStateInternal(data);
            events.trigger(self, "playbackratechange", [state]);
        });

        events.on(castPlayer, "pause", function (e, data) {

            console.log('cc: pause');
            var state = self.getPlayerStateInternal(data);

            events.trigger(self, "pause", [state]);
        });

        events.on(castPlayer, "unpause", function (e, data) {

            console.log('cc: unpause');
            var state = self.getPlayerStateInternal(data);

            events.trigger(self, "unpause", [state]);
        });

        events.on(castPlayer, "audiotrackchange", function (e, data) {

            console.log('cc: audiotrackchange');
            var state = self.getPlayerStateInternal(data);

            events.trigger(self, "audiotrackchange", [state]);
        });

        events.on(castPlayer, "subtitletrackchange", function (e, data) {

            console.log('cc: subtitletrackchange');
            var state = self.getPlayerStateInternal(data);

            events.trigger(self, "subtitletrackchange", [state]);
        });

        events.on(castPlayer, "qualitychange", function (e, data) {

            console.log('cc: qualitychange');
            var state = self.getPlayerStateInternal(data);

            events.trigger(self, "qualitychange", [state]);
        });

        events.on(castPlayer, "playlistitemmove", function (e, data) {

            console.log('cc: playlistitemmove');
            var state = self.getPlayerStateInternal(data);

            events.trigger(self, "playlistitemmove", [state]);
        });

        events.on(castPlayer, "playlistitemremove", function (e, data) {

            console.log('cc: playlistitemremove');

            events.trigger(self, "playlistitemremove", [data]);
        });

        events.on(castPlayer, "playlistitemadd", function (e, data) {

            console.log('cc: playlistitemadd');
            var state = self.getPlayerStateInternal(data);

            events.trigger(self, "playlistitemadd", [state]);
        });

        function sendMessageToDevice(message, apiClient) {

            apiClient = apiClient || ApiClient;

            message = Object.assign(message, {
                userId: apiClient.getCurrentUserId(),
                deviceId: apiClient.deviceId(),
                accessToken: apiClient.accessToken(),
                serverId: apiClient.serverId(),
                serverVersion: apiClient.serverVersion(),
                serverAddress: apiClient.serverAddress(),
                receiverName: (currentTarget ? currentTarget.name : null) || PlayerName
            });

            var bitrateSetting = appSettings.maxChromecastBitrate();
            if (bitrateSetting) {
                message.maxBitrate = bitrateSetting;
            }

            if (message.options && message.options.items) {
                message.subtitleAppearance = userSettings.getSubtitleAppearanceSettings();
            }

            console.log('Sending command to Chromecast: ' + message.command);

            return require(['chromecastHelper']).then(function (responses) {

                var chromecastHelper = responses[0];

                return chromecastHelper.getServerAddress(apiClient).then(function (serverAddress) {
                    message.serverAddress = serverAddress;
                    return sendMessageInternal(message);
                });
            });
        }

        function sendMessageInternal(message) {
            var json = JSON.stringify(message);

            // TODO: Send message
            window.webkit.messageHandlers.sendChromecastMessage.postMessage({ 'message': json });

            return Promise.resolve();
        }

        self.play = function (options) {

            var apiClient = ApiClient;

            if (options.items) {

                return self.playWithCommand(apiClient, options, 'PlayNow');

            } else {

                return self.getItemsForPlayback(apiClient, {

                    Ids: options.ids.join(',')

                }).then(function (result) {

                    options.items = result.Items;
                    return self.playWithCommand(apiClient, options, 'PlayNow');
                });
            }
        };

        self.playWithCommand = function (apiClient, options, command) {

            if (!options.items) {
                return apiClient.getItem(apiClient.getCurrentUserId(), options.ids[0]).then(function (item) {

                    options.items = [item];
                    return self.playWithCommand(apiClient, options, command);
                });
            }

            // Convert the items to smaller stubs to send the minimal amount of information
            options.items = options.items.map(mapItemForLoadMedia);

            return sendMessageToDevice({
                options: options,
                command: command
            }, apiClient);
        };

        self.unpause = function () {
            return sendMessageToDevice({
                command: 'Unpause'
            });
        };

        self.pause = function () {
            return sendMessageToDevice({
                command: 'Pause'
            });
        };

        self.playPause = function () {
            return sendMessageToDevice({
                command: 'PlayPause'
            });
        };

        self.currentTime = function (val) {

            if (val != null) {
                return self.seek(val);
            }

            var state = self.lastPlayerData || {};
            state = state.PlayState || {};
            return state.PositionTicks;
        };

        self.setAudioStreamIndex = function (index) {
            return sendMessageToDevice({
                options: {
                    index: index
                },
                command: 'SetAudioStreamIndex'
            });
        };

        self.getAudioStreamIndex = function () {
            var state = self.lastPlayerData || {};
            state = state.PlayState || {};
            return state.AudioStreamIndex;
        };

        self.getSubtitleStreamIndex = function () {
            var state = self.lastPlayerData || {};
            state = state.PlayState || {};
            return state.SubtitleStreamIndex;
        };

        self.setSubtitleStreamIndex = function (index, refreshMediaSource) {
            return sendMessageToDevice({
                options: {
                    index: index,
                    RefreshMediaSource: refreshMediaSource
                },
                command: 'SetSubtitleStreamIndex'
            });
        };

        self.getMaxStreamingBitrate = function () {
            var state = self.lastPlayerData || {};
            state = state.PlayState || {};
            return state.MaxStreamingBitrate;
        };

        self.getBufferedRanges = function () {
            var state = this.lastPlayerData || {};
            state = state.PlayState || {};
            return state.BufferedRanges || [];
        };

        self.setMaxStreamingBitrate = function (bitrate) {
            return sendMessageToDevice({
                options: {
                    bitrate: bitrate
                },
                command: 'SetMaxStreamingBitrate'
            });
        };

        self.isFullscreen = function () {
            var state = self.lastPlayerData || {};
            state = state.PlayState || {};
            return state.IsFullscreen;
        };

        self.isPlaying = function () {
            var state = self.lastPlayerData || {};
            return state.NowPlayingItem != null;
        };

        self.isPlayingVideo = function () {
            var state = self.lastPlayerData || {};
            state = state.NowPlayingItem || {};
            return state.MediaType === 'Video';
        };

        self.isPlayingAudio = function () {
            var state = self.lastPlayerData || {};
            state = state.NowPlayingItem || {};
            return state.MediaType === 'Audio';
        };

        self.shuffle = function (item) {

            var apiClient = connectionManager.getApiClient(item);
            var userId = apiClient.getCurrentUserId();

            apiClient.getItem(userId, item.Id).then(function (item) {

                self.playWithCommand(apiClient, {

                    items: [item]

                }, 'Shuffle');

            });
        };

        self.instantMix = function (item) {

            var apiClient = connectionManager.getApiClient(item);
            var userId = apiClient.getCurrentUserId();

            return apiClient.getItem(userId, item.Id).then(function (item) {

                return self.playWithCommand(apiClient, {

                    items: [item]

                }, 'InstantMix');

            });
        };

        self.canPlayMediaType = function (mediaType) {

            mediaType = (mediaType || '').toLowerCase();
            return mediaType === 'audio' || mediaType === 'video';
        };

        self.canQueueMediaType = function (mediaType) {
            return self.canPlayMediaType(mediaType);
        };

        self.queue = function (options) {
            var apiClient = ApiClient;

            return self.playWithCommnd(apiClient, options, 'PlayLast');
        };

        self.queueNext = function (options) {

            var apiClient = ApiClient;

            return self.playWithCommand(apiClient, options, 'PlayNext');
        };

        self.stop = function () {
            return sendMessageToDevice({
                command: 'Stop'
            });
        };

        self.displayContent = function (options) {

            return sendMessageToDevice({
                options: options,
                command: 'DisplayContent'
            });
        };

        self.playTrailers = function (item) {

            return sendMessageToDevice({
                options: {
                    ItemId: item.Id,
                    ServerId: item.ServerId
                },
                command: 'PlayTrailers'
            });
        };

        self.mute = function () {
            window.webkit.messageHandlers.setMute.postMessage({
                mute: true
            });
        };

        self.unMute = function () {
            window.webkit.messageHandlers.setMute.postMessage({
                mute: false
            });
        };

        self.getRepeatMode = function () {
            var state = self.lastPlayerData || {};
            state = state.PlayState || {};
            return state.RepeatMode;
        };

        self.setRepeatMode = function (mode) {
            return sendMessageToDevice({
                options: {
                    RepeatMode: mode
                },
                command: 'SetRepeatMode'
            });
        };

        self.getSubtitleOffset = function () {
            var state = self.lastPlayerData || {};
            state = state.PlayState || {};
            return state.SubtitleOffset;
        };

        self.setSubtitleOffset = function (value) {
            return sendMessageToDevice({
                options: {
                    SubtitleOffset: value
                },
                command: 'SetSubtitleOffset'
            });
        };

        self.incrementSubtitleOffset = function (value) {
            return sendMessageToDevice({
                options: {
                    Increment: value
                },
                command: 'IncrementSubtitleOffset'
            });
        };

        self.getPlaybackRate = function () {
            var state = self.lastPlayerData || {};
            state = state.PlayState || {};
            return state.PlaybackRate;
        };

        self.setPlaybackRate = function (value) {
            return sendMessageToDevice({
                options: {
                    PlaybackRate: value
                },
                command: 'SetPlaybackRate'
            });
        };

        self.setMute = function (isMuted) {

            if (isMuted) {
                return self.mute();
            } else {
                return self.unMute();
            }
        };

        self.toggleMute = function () {

            window.webkit.messageHandlers.toggleMute.postMessage({});
        };

        self.setCurrentPlaylistItem = function (playlistItemId) {
            return sendMessageToDevice({
                options: {
                    PlaylistItemId: playlistItemId
                },
                command: 'SetCurrentPlaylistItem'
            });
        };

        self.movePlaylistItem = function (playlistItemId, newIndex) {
            return sendMessageToDevice({
                options: {
                    PlaylistItemId: playlistItemId,
                    NewIndex: newIndex
                },
                command: 'MovePlaylistItem'
            });
        };

        self.removeFromPlaylist = function (playlistItemIds) {
            return sendMessageToDevice({
                options: {
                    PlaylistItemIds: playlistItemIds.join(',')
                },
                command: 'RemoveFromPlaylist'
            });
        };

        function convertRouteToTarget(route) {

            return {
                name: route.name,
                id: route.id,
                playerName: PlayerName,
                playableMediaTypes: ["Audio", "Video"],
                isLocalPlayer: false,
                appName: PlayerName,
                deviceName: route.name,
                supportedCommands: [
                    "VolumeUp",
                    "VolumeDown",
                    "Mute",
                    "Unmute",
                    "ToggleMute",
                    "SetVolume",
                    "SetAudioStreamIndex",
                    "SetSubtitleStreamIndex",
                    "DisplayContent",
                    "SetRepeatMode",
                    "SetPlaybackRate",
                    "SetSubtitleOffset",
                    "EndSession",
                    "PlayMediaSource",
                    "PlayTrailers",
                    "RefreshMediaSource"
                ]
            };
        }

        var deviceListPromise;
        self.getTargets = function () {

            return new Promise(function (resolve, reject) {

                window.webkit.messageHandlers.getDevices.postMessage({});
                deviceListPromise = resolve;

                setTimeout(function () {

                    self.getTargetsResponse([]);
                }, 700);
            });
        };

        self.getTargetsResponse = function (deviceList) {

            var resolve = deviceListPromise;

            if (resolve) {
                deviceListPromise = null;

                if (!Array.isArray(deviceList)) {
                    resolve([]);
                }

                resolve(deviceList.map(convertRouteToTarget));
            }
        };

        self.seek = function (position) {

            position = parseInt(position);
            position = position / 10000000;

            return sendMessageToDevice({
                options: {
                    position: position
                },
                command: 'Seek'
            });
        };

        self.seekRelative = function (offsetTicks) {

            offsetTicks = parseInt(offsetTicks);

            return sendMessageToDevice({
                options: {
                    offset: offsetTicks
                },
                command: 'SeekRelative'
            });
        };

        self.rewind = function () {
            return sendMessageToDevice({
                options: {},
                command: 'Rewind'
            });
        };

        self.fastForward = function () {
            return sendMessageToDevice({
                options: {},
                command: 'FastForward'
            });
        };

        self.nextTrack = function () {
            return sendMessageToDevice({
                options: {},
                command: 'NextTrack'
            });
        };

        self.previousTrack = function () {
            return sendMessageToDevice({
                options: {},
                command: 'PreviousTrack'
            });
        };

        self.getVolume = function () {
            var state = self.lastPlayerData || {};
            state = state.PlayState || {};

            return state.VolumeLevel == null ? 100 : state.VolumeLevel;
        };

        self.volumeDown = function () {

            var state = self.lastPlayerData || {};
            state = state.PlayState || {};

            var vol = state.VolumeLevel || 105;
            vol -= 5;

            self.setVolume(vol);
        };

        self.volumeUp = function () {

            var state = self.lastPlayerData || {};
            state = state.PlayState || {};

            var vol = state.VolumeLevel || 95;
            vol += 5;

            self.setVolume(vol);
        };

        self.setVolume = function (vol) {

            vol = Math.min(vol, 100);
            vol = Math.max(vol, 0);

            window.webkit.messageHandlers.setVolume.postMessage({
                volume: vol
            });
        };

        self.onDeviceVolumeChanged = function (newVol, muted) {

            if (isNaN(newVol)) {
                return;
            }

            var state = self.lastPlayerData || {};
            state = state.PlayState || {};

            newVol = Math.min(newVol, 100);
            newVol = Math.max(newVol, 0);

            state.VolumeLevel = newVol;
        };

        self.getPlayerState = function () {

            return self.getPlayerStateInternal() || {};
        };

        self.lastPlayerData = null;

        self.getPlayerStateInternal = function (data) {

            var lastPlayerData = this.lastPlayerData;
            var triggerStateChange = false;

            if (data) {
                //console.log(JSON.stringify(data));
                // this isn't provided (yet), and NowPlayingItem is almost the same thing
                if (!data.MediaSource) {
                    data.MediaSource = data.NowPlayingItem;
                }

                if (!data.NowPlayingQueue && lastPlayerData) {
                    data.NowPlayingQueue = lastPlayerData.NowPlayingQueue;
                }
                if (!lastPlayerData) {
                    triggerStateChange = true;
                }
            }

            data = data || lastPlayerData;
            self.lastPlayerData = data;

            normalizePrimaryImage(data);

            //console.log(JSON.stringify(data));

            if (triggerStateChange) {
                events.trigger(self, "statechange", [data]);
            }

            return data;
        };

        function onMessage(message) {

            if (message.type === 'playbackerror') {

                var errorCode = message.data;

                setTimeout(function () {
                    require(['alert'], function (alert) {
                        alert({
                            text: globalize.translate('MessagePlaybackError' + errorCode),
                            title: globalize.translate('HeaderPlaybackError')
                        });
                    });
                }, 300);

            }
            else if (message.type === 'connectionerror') {

                setTimeout(function () {
                    require(['alert'], function (alert) {
                        alert({
                            text: globalize.translate('MessageChromecastConnectionError'),
                            title: globalize.translate('HeaderError')
                        });
                    });
                }, 300);

            }
            else if (message.type) {
                events.trigger(castPlayer, message.type, [message.data]);
            }
        }

        function handleMessage(message) {
            // message could be either a string or an object
            if (typeof message === 'string') {
                onMessage(JSON.parse(message));
            } else {
                onMessage(message);
            }
        }

        function sendIdentifyMessage() {

            return sendMessageToDevice({
                options: {},
                command: 'Identify'
            });
        }

        function handleSessionError() {
            console.log('chromecast session connect error');
            cleanupSession();
            playbackManager.removeActivePlayer(PlayerName);
        }

        function cleanupSession() {

            self.lastPlayerData = {};
            currentTarget = null;
        }

        function startSession(target) {

            if (typeof (target) === 'undefined') {
                return Promise.reject(Error('Undefined device'));
            }

            return new Promise(function (resolve, reject) {

                function unbind() {
                    events.off(self, "sessionStarted", onSessionStarted);
                    events.off(self, "failToStartSession", onSessionFailed);
                }

                function onSessionStarted(e, target) {
                    unbind();
                    resolve(target);
                }

                function onSessionFailed(e, error) {

                    setTimeout(function () {
                        unbind();
                        reject(error);
                    }, 500);
                }

                events.on(self, "sessionStarted", onSessionStarted);
                events.on(self, "failToStartSession", onSessionFailed);
                window.webkit.messageHandlers.startSession.postMessage({ "device": target.id });
            });
        }

        self.tryPair = function (target) {

            console.log('Will attempt to connect to Chromecast');

            return startSession(target).then(function () {
                currentTarget = target;

                // Reset this so that statechange will fire
                self.lastPlayerData = null;

                // in iOS, we don't wait for the opening of the text channel, so give this sufficient time
                setTimeout(sendIdentifyMessage, 2000);
            });
        };

        self.onSessionEvent = function (eventName, response) {

            if (eventName === 'sessionStarted') {
                events.trigger(self, 'sessionStarted', response);
            }
            else if (eventName === 'failToStartSession') {
                events.trigger(self, 'failToStartSession', response);
            }
        };

        self.endSession = function () {

            console.log('Ending Chromecast session');

            self.stop().then(function () {

                setTimeout(function () {

                    endSessionInternal(true);

                }, 1000);
            });
        };

        function disconnectFromSession() {
            window.webkit.messageHandlers.endSession.postMessage({});
        }

        function endSessionInternal(closeWebApp) {

            if (closeWebApp) {
                disconnectFromSession();
            }

            cleanupSession();

            currentTarget = null;
        }

        function onResume() {

            var target = currentTarget;

            if (target) {

                setTimeout(function () {
                    self.tryPair(target);
                }, 0);
            }
        }

        events.on(appHost, 'resume', onResume);

        self.deviceRemoved = function (device) {

            var deviceId = device.Id;

            var currentDeviceId = currentTarget ? currentTarget.id : null;
            if (deviceId === currentDeviceId) {
                handleSessionError();
            }
        };

        self.onMessageReceived = function (message) {
            handleMessage(message);
        };

        self.onDisconnectWithError = function () {
            handleSessionError();
        };

        // kick off device discovery in native app
        window.webkit.messageHandlers.getDevices.postMessage({});
    }

    ChromecastPlayer.prototype.resetLastPlayerData = function () {

        var newData = {

        };

        var lastPlayerData = this.lastPlayerData;
        if (lastPlayerData && lastPlayerData.NowPlayingQueue) {
            newData.NowPlayingQueue = lastPlayerData.NowPlayingQueue;
        }

        this.lastPlayerData = newData;
    };

    ChromecastPlayer.prototype.playbackStartTime = function () {

        var state = this.lastPlayerData || {};
        state = state.PlayState || {};
        return state.PlaybackStartTimeTicks;
    };

    ChromecastPlayer.prototype.duration = function () {
        var state = this.lastPlayerData || {};
        state = state.MediaSource || {};
        return state.RunTimeTicks;
    };

    ChromecastPlayer.prototype.paused = function () {
        var state = this.lastPlayerData || {};
        state = state.PlayState || {};

        return state.IsPaused;
    };

    ChromecastPlayer.prototype.isMuted = function () {
        var state = this.lastPlayerData || {};
        state = state.PlayState || {};

        return state.IsMuted;
    };

    ChromecastPlayer.prototype.toggleFullscreen = function () {
        // not supported
    };

    ChromecastPlayer.prototype.beginPlayerUpdates = function () {
        // Setup polling here
    };

    ChromecastPlayer.prototype.endPlayerUpdates = function () {
        // Stop polling here
    };

    ChromecastPlayer.prototype.currentMediaSource = function () {
        var state = this.lastPlayerData || {};
        return state.MediaSource;
    };

    ChromecastPlayer.prototype.getPlaylist = function () {
        var state = this.lastPlayerData || {};
        var items = state.NowPlayingQueue || [];
        return Promise.resolve({ Items: items, TotalRecordCount: items.length });
    };

    ChromecastPlayer.prototype.getCurrentPlaylistItemId = function () {
        var state = this.lastPlayerData || {};
        return state.PlaylistItemId;
    };

    ChromecastPlayer.prototype.getCurrentPlaylistIndex = function () {
        var state = this.lastPlayerData || {};
        return state.PlaylistIndex;
    };

    ChromecastPlayer.prototype.getCurrentPlaylistLength = function () {
        var state = this.lastPlayerData || {};
        return state.PlaylistLength;
    };

    return ChromecastPlayer;
});
