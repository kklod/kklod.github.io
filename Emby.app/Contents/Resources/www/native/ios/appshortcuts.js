define(['connectionManager', 'events', 'appRouter', 'globalize'], function (connectionManager, events, appRouter, globalize) {

    'use strict';

    function setShortcuts(user) {

        connectionManager.getApiClient(user.ServerId).getUserViews().then(function (result) {

            var views = result.Items;
            var shortcuts = [];

            if (user.Policy.IsAdministrator) {
                shortcuts.push({
                    Label: globalize.translate('ManageEmbyServer'),
                    LongLabel: globalize.translate('ManageEmbyServer'),
                    Id: 'manageserver'
                });
            }

            if (user.Policy.EnableContentDownloading) {
                shortcuts.push({
                    Label: globalize.translate('Downloads'),
                    LongLabel: globalize.translate('Downloads'),
                    Id: 'downloads'
                });
            }

            for (var i = 0, length = views.length; i < length; i++) {

                if (shortcuts.length >= 4) {
                    break;
                }

                var view = views[i];

                if (view.CollectionType === 'livetv') {
                    shortcuts.push({
                        Label: view.Name,
                        LongLabel: view.Name,
                        Id: 'livetv' + '_' + user.ServerId
                    });
                }
                else {
                    shortcuts.push({
                        Label: view.Name,
                        LongLabel: view.Name,
                        Id: 'library-' + view.Id + '_' + view.ServerId
                    });
                }
            }

            window.webkit.messageHandlers.shortcuts.postMessage({ shortcuts: JSON.stringify(shortcuts) });
        });
    }

    function clearShortcuts() {
        window.webkit.messageHandlers.shortcuts.postMessage({ shortcuts: '[]'});
    }

    events.on(connectionManager, 'localusersignedin', function (e, serverId, userId) {

        var apiClient = connectionManager.getApiClient(serverId);
        apiClient.getCurrentUser().then(setShortcuts);
    });

    events.on(connectionManager, 'localusersignedout', clearShortcuts);

    window.AppShortcuts = {
        execute: function (id) {
            appRouter.invokeShortcut(id);
        }
    };
});