define(['connectionManager', 'events'], function (connectionManager, events) {
    'use strict';

    events.on(connectionManager, 'credentialsupdated', function (e, data) {

        // sync the credentials object to the native side
        // Use whichever one you need
        //var obj = data.credentials;
        //var json = data.credentialsJson;
        window.webkit.messageHandlers.nativeCredentials.postMessage({
            data: data.credentialsJson
        });
    });
});