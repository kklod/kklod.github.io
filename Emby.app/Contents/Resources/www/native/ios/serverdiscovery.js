define([], function () {
    'use strict';

    var foundServerResolve;

    return {

        findServers: function (timeoutMs) {

            if (!window.ServerDiscovery) {
                window.ServerDiscovery = this;
            }

            return new Promise(function (resolve, reject) {
                
                if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.serverDiscovery) {
                    // Call server locator in Objective C which will call the JavaScript function passed in
                    window.webkit.messageHandlers.serverDiscovery.postMessage({
                        'callback':'serversFound',
                        'timeoutMs':timeoutMs
                    });

                    foundServerResolve = resolve;
                }
                else {
                    return Promise.reject(Error('serverDiscovery Wkwebview context not initialized'));
                }

            });
        },

        serversFound: function (servers) {
            foundServerResolve(servers);
        }
    
    };

});