define(['idbcore'], function (idb) {
    'use strict';

    function getByServerId(serverId) {

        throw new Error('getByServerId not implemented');
    }

    function getUserAction(key) {

        throw new Error('getUserAction not implemented');
    }

    function addUserAction(key, val) {

        window.webkit.messageHandlers.localDatabase.postMessage({
            command: 'addUserAction',
            args: [JSON.stringify(val)]
        });

        return Promise.resolve();
    }

    function deleteUserActions(keys) {

        throw new Error('deleteUserActions not implemented');
    }

    function deleteUserAction(key) {

        throw new Error('deleteUserAction not implemented');
    }

    function clearUserActions() {

        throw new Error('clearUserActions not implemented');
    }

    return {
        getUserAction: getUserAction,
        addUserAction: addUserAction,
        deleteUserAction: deleteUserAction,
        deleteUserActions: deleteUserActions,
        clearUserActions: clearUserActions,
        getByServerId: getByServerId
    };
});