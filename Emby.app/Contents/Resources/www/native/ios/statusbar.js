define(['events', 'playbackManager'], function (events, playbackManager) {
    'use strict';

    var isHidden;

    events.on(playbackManager, 'playbackstart', function (e, player, state) {

        if (player.isLocalPlayer && state.NowPlayingItem && state.NowPlayingItem.MediaType === 'Video') {
            isHidden = true;
            window.webkit.messageHandlers.setStatusBarHidden.postMessage({ 'hidden' : true });
        }
    });

    events.on(playbackManager, 'playbackstop', function (e, stopInfo) {

        if (stopInfo.nextMediaType !== 'Video' && isHidden) {
            isHidden = false;
            window.webkit.messageHandlers.setStatusBarHidden.postMessage({ 'hidden' : false });
        }
    });

});