define([], function () {
    'use strict';

    function send(info) {

        return new Promise(function(resolve, reject) {

            window.webkit.messageHandlers.wakeOnLan.postMessage({
                broadcastAddress: info.BroadcastAddress || "255.255.255.255",
                macAddress: info.MacAddress,
                port: info.Port
            });

            resolve();
        });
    }

    function onWolStatus(info) {
        if (info.success) {
            console.log('wakeonlan sent to ' + info.MacAddress);
        }
        else {
            console.log('wakeonlan failed to send to ' + info.MacAddress);
        }
    }
    if (!window.onWolStatus){ window.onWolStatus = onWolStatus; }

    function isSupported() {
        return true;
    }

    return {
        send: send,
        isSupported: isSupported
    };

});
