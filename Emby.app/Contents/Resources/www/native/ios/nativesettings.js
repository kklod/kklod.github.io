define(['appSettings', 'events', 'connectionManager', 'userSettings', 'registrationServices'], function (appSettings, events, connectionManager, userSettings, registrationServices) {
    'use strict';

    function syncSetting(name, value) {

        // Make sure to handle value being null/empty
        if (value == null) {

            // clear value stored on native side
            window.webkit.messageHandlers.appSettings.postMessage({
                key: name,
                value: null
            });

        } else {

            // value could be a boolean or int, so convert to a plain string for native storage
            value = value.toString();

            window.webkit.messageHandlers.appSettings.postMessage({
                key: name,
                value: value
            });
        }
    }

    events.on(appSettings, 'change', function (e, name, value) {

        switch (name) {

            case 'cameraUploadServers':

                syncSetting(name, value);

                if (value) {
                    window.webkit.messageHandlers.authorizePhoto.postMessage({});
                }

                break;
            case 'syncOnlyOnWifi':
            case 'cameraUploadOnlyOnWifi':
            case 'cameraUploadAllFolders':
            case 'cameraUploadFolders':
                syncSetting(name, value);
                break;
            default:
                break;
        }
    });

    events.on(userSettings, 'change', function (e, name, value) {

        switch (name) {
            case 'localplayersubtitleappearance3':
            case 'skipForwardLength':
            case 'skipBackLength':
                syncSetting(name, value);
                break;
            default:
                break;
        }
    });

    events.on(userSettings, 'load', function () {
        syncSetting('localplayersubtitleappearance3', JSON.stringify(userSettings.getSubtitleAppearanceSettings()));
        syncSetting('skipForwardLength', userSettings.skipForwardLength());
        syncSetting('skipBackLength', userSettings.skipBackLength());
    });

    function syncPremiereStatus(serverId) {

        return registrationServices.validateFeature('dvr', {

            showDialog: false,
            viewOnly: true

        }).then(function () {
            syncSetting('premiere-' + serverId, 'true');
        }, function () {
            syncSetting('premiere-' + serverId, 'false');
        });
    }

    events.on(connectionManager, 'localusersignedin', function (e, serverId, userId) {
        syncPremiereStatus(serverId);
    });
});