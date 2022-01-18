define(['events', 'playbackManager'], function (events, playbackManager) {

    'use strict';

    // A MediaSession polyfill that will delegate responsbility to the native app

    function MediaSession() {

    }

    function MediaMetadata(obj) {
        Object.assign(this, obj);
    }

    var lastUpdateTime = 0;
    var lastPaused;
    var enableMediaSession = true;

    function updateNativeMediaSession(metadata) {

        var now = new Date().getTime();

        var paused = metadata.paused;

        // Don't go crazy reporting position changes
        if ((now - lastUpdateTime) < 500 && lastPaused === paused) {
            // Only report if this item hasn't been reported yet, or if there's an actual playback change.
            // Don't report on simple time updates
            return;
        }

        var canSeek = (metadata.duration || 0) > 0;

        var artwork = metadata.artwork && metadata.artwork.length ? metadata.artwork[metadata.artwork.length - 1] : null;
        var imageUrl = artwork ? artwork.src : null;

        try {
            window.webkit.messageHandlers.updateMediaSession.postMessage({
                artist: metadata.artist,
                title: metadata.title,
                album: metadata.album,
                duration: metadata.duration,
                currentTime: metadata.currentTime,
                coverUrl: imageUrl,
                canSeek: canSeek,
                paused: paused
            });
        } catch (error) {
            console.log('Error posting updateMediaSession to native');
        }

        lastUpdateTime = now;
        lastPaused = paused;
    }

    function onPlayPause(obj) {
        // mediaSession doesn't have a command for this
        playbackManager.playPause();
    }

    function onPlay(obj) {
        events.trigger(obj, 'play');
    }

    function onPause(obj) {
        events.trigger(obj, 'pause');
    }

    function onNextTrack(obj) {
        events.trigger(obj, 'nexttrack');
    }

    function onPreviousTrack(obj) {
        events.trigger(obj, 'previoustrack');
    }

    function onSeekForward(obj) {
        events.trigger(obj, 'seekforward');
    }

    function onSeekBackward(obj) {
        events.trigger(obj, 'seekbackward');
    }

    function onSeekTo(timeMs) {

        var ticks = timeMs * 10000;
        playbackManager.seek(ticks);
    }

    MediaSession.prototype.onRemoteEvent = function (event, data) {
        switch (event) {
            case 'playPause':
                onPlayPause(this);
                break;
            case 'play':
                onPlay(this);
                break;
            case 'pause':
                onPause(this);
                break;
            case 'nextTrack':
                onNextTrack(this);
                break;
            case 'previousTrack':
                onPreviousTrack(this);
                break;
            case 'seekForward':
                onSeekForward(this);
                break;
            case 'seekBackward':
                onSeekBackward(this);
                break;
            case 'seekTo':
                onSeekTo(data);
                break;
            default:
                break;
        }
    };

    MediaSession.prototype.setActionHandler = function (name, callback) {
        events.on(this, name, callback);
    };

    Object.defineProperty(MediaSession.prototype, "metadata", {
        get: function metadata() {
            return this.mediaMetadata;
        },
        set: function metadata(value) {
            this.mediaMetadata = value;

            if (!enableMediaSession) {
                return;
            }

            if (value) {
                updateNativeMediaSession(value);
            } else {
                try {
                    window.webkit.messageHandlers.hideMediaSession.postMessage({});
                } catch (error) {
                    console.log('Error posting updateMediaSession to native');
                }
                lastUpdateTime = 0;
            }
        }
    });

    navigator.mediaSession = new MediaSession();

    if (!window.MediaMetadata) {
        window.MediaMetadata = MediaMetadata;
    }

    window.AppCloseHandler = {
        onAppClose: function () {
            playbackManager.onAppClose();
        }
    };

    events.on(playbackManager, 'playerchange', function (e, newPlayer) {

        var isLocalPlayer = !newPlayer || newPlayer.isLocalPlayer;

        enableMediaSession = !(isLocalPlayer && newPlayer && newPlayer.getPlaylist);

        window.webkit.messageHandlers.setPlaybackMode.postMessage({ 
            isLocalPlayback: isLocalPlayer,
            playerId: (newPlayer || {}).id
        });
    });

    // With the polyfill in place, now load the app's mediaSession handler
    require(['mediaSession']);
});