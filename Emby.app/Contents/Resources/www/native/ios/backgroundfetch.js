(function () {

    'use strict';

    function onDeviceReady() {

        window.onBackgroundFetch = onBackgroundFetch;
        window.onBackgroundFetchFailed = onBackgroundFetchFailed;

        window.webkit.messageHandlers.backgroundFetch.postMessage(
            {
                command: 'configure',
                callback: 'onBackgroundFetch',
                failureCallback: 'onBackgroundFetchFailed'
            });
    }

    function onSyncFinish() {

        console.log('BackgroundFetch completed');

        finish(true); // <-- N.B. You MUST called #finish so that native-side can signal completion of the background-thread to the os.
    }

    function onSyncFail() {

        console.log('BackgroundFetch completed - sync failed');

        finish(false); // <-- N.B. You MUST called #finish so that native-side can signal completion of the background-thread to the os.
    }

    function finish(success) {
        window.webkit.messageHandlers.backgroundFetch.postMessage(
            {
                command: 'finish',
                result: success
            });
    }

    function onBackgroundFetch() {

        console.log('BackgroundFetch initiated');

        require(['localsync', 'apphost'], function (localSync, appHost) {

            if (!appHost.supports('sync')) {
                onSyncFinish();
                return;
            }

            localSync.sync({}).then(onSyncFinish, onSyncFail);
        }, function (err) {
            
            finish(false);
        });
    }

    function onBackgroundFetchFailed() {
        console.log('- BackgroundFetch failed');
    }

    onDeviceReady();
})();