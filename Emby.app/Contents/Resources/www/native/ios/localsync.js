define(['events'], function (events) {
    'use strict';

    var isSyncing;

    var localSync = {

        sync: function (options) {

            console.log('localSync.sync starting...');

            window.webkit.messageHandlers.nativeSync.postMessage({
                cmd: "startSync"
            });
        },

        setProgressUpdatesEnabled: function (enabled) {
            // tell native code to start or stop sending updates to the UI
            window.webkit.messageHandlers.appSettings.postMessage({
                key: "downloadProgressEnabled",
                value: (enabled || false).toString()
            });
        },

        onProgress: function (numItems, numItemsComplete, totalPercentComplete) {

            events.trigger(localSync, 'progress', [{

                numItems: numItems,
                numItemsComplete: numItemsComplete,
                totalPercentComplete: totalPercentComplete
            }]);
        }
    };

    // native code can call this
    window.LocalSync = localSync;

    return localSync;
});