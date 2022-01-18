define(['events'], function (events) {
    'use strict';

    var availableFoldersResolve;

    var cameraUpload = {

        start: function () {
            // don't disrupt current operations if already running
            window.webkit.messageHandlers.nativeSync.postMessage({
                cmd: "startCameraUpload"
            });
        },

        setProgressUpdatesEnabled: function (enabled) {
            // tell native code to start or stop sending updates to the UI
            window.webkit.messageHandlers.appSettings.postMessage({
                key: "cameraUploadProgressEnabled",
                value: (enabled || false).toString()
            });
        },

        onProgress: function (numItems, numItemsComplete, totalPercentComplete) {

            events.trigger(cameraUpload, 'progress', [{

                numItems: numItems,
                numItemsComplete: numItemsComplete,
                totalPercentComplete: totalPercentComplete
            }]);
        },

        getAvailableFolders: function () {

            // an array of objects with name and id properties.
            return new Promise(function (resolve, reject) {

                window.webkit.messageHandlers.nativeSync.postMessage({
                    cmd: "getCameraUploadFolders",
                });
                
                availableFoldersResolve = resolve;
            });
        },

        onAvailableFoldersResult: function(folders) {
            availableFoldersResolve(folders || []);
        }
    };

    // native code can call this
    window.CameraUpload = cameraUpload;

    return cameraUpload;
});
