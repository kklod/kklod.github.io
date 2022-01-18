define(['idbcore'], function (idb) {
    'use strict';

    var indexedDB = self.indexedDB; // || self.mozIndexedDB || self.webkitIndexedDB || self.msIndexedDB;

    // Database version
    var libraryDbVersion = 3;

    // array containing all opened databases
    var databases = {};

    function openLibraryDatabase(dbName) {

        return new Promise(function (resolve, reject) {

            if (dbName in databases) {
                resolve(databases[dbName]);
                return;
            }

            var request = indexedDB.open(dbName, libraryDbVersion);

            request.onerror = reject;
            request.onblocked = reject;

            request.onupgradeneeded = function (event) {
                var db = request.result;

                if (event.oldVersion < 1) {
                    // Version 1 is the first version of the database.
                    db.createObjectStore(dbName);
                }

                if (event.oldVersion < 3) {
                    // Version 3 introduces new indexes:
                    var objectStore = request.transaction.objectStore(dbName);
                    objectStore.createIndex('Index_ItemType', 'Item.Type');
                    objectStore.createIndex('Index_SyncStatus', 'SyncStatus');
                }
            };

            request.onsuccess = function (event) {
                var db = event.target.result;

                db.onversionchange = function () {
                    // Close immediately to allow the upgrade requested by another instance to proceed.
                    db.close();
                    delete databases[dbName];
                };

                databases[dbName] = db;
                resolve(db);
            };
        });
    }

    function getLibraryDb(serverId) {

        var storeName = "items_" + serverId;
        return openLibraryDatabase(storeName);
    }

    var getAllLibraryItemsResolves = [];
    var getLibarytemTypesResolves = [];
    var getLibraryItemsByIdsResolves = [];
    var getLibraryItemsByTypeResolves = [];
    var getLibraryItemResolves = [];
    window.ItemRepositoryCallback = {

        getAllLibraryItemsCallback: function (items) {
            var resolve = getAllLibraryItemsResolves.shift();
            if (resolve) {
                resolve(items || []);
            }
        },
        getLibarytemTypesCallback: function (types) {
            var resolve = getLibarytemTypesResolves.shift();
            if (resolve) {
                resolve(types || []);
            }
        },
        getLibraryItemsByIdsCallback: function (items) {
            var resolve = getLibraryItemsByIdsResolves.shift();
            if (resolve) {
                resolve(items || []);
            }
        },
        getLibraryItemsByTypeCallback: function (items) {
            var resolve = getLibraryItemsByTypeResolves.shift();
            if (resolve) {
                resolve(items || []);
            }
        },
        getLibraryItemCallback: function (item) {
            var resolve = getLibraryItemResolves.shift();
            if (resolve) {
                resolve(item);
            }
        }
    };

    function getLibarytemTypes(serverId) {

        return new Promise(function (resolve, reject) {

            window.webkit.messageHandlers.localDatabase.postMessage({
                command: 'getLibarytemTypes',
                args: [serverId]
            });

            getLibarytemTypesResolves.push(resolve);
        });
    }

    function getLibraryItemsByIds(serverId, ids) {

        return new Promise(function (resolve, reject) {

            window.webkit.messageHandlers.localDatabase.postMessage({
                command: 'getLibraryItemsByIds',
                args: [serverId, JSON.stringify(ids)]
            });

            getLibraryItemsByIdsResolves.push(resolve);
        });
    }

    function getLibraryItemPathsByIds(serverId, ids) {

        return getLibraryItemsByIds(serverId, ids).then(function (items) {

            var paths = items.reduce(function (result, item) {

                if (item) {
                    var id_path = { ItemId: item.ItemId, LocalPath: '' };
                    if (item.LocalPath) {
                        id_path.LocalPath = item.LocalPath;
                    }
                    else if (item.Item && item.Item.MediaSources && item.Item.MediaSources.length) {

                        var mediaSource = item.Item.MediaSources[0];
                        id_path.LocalPath = mediaSource.StreamUrl || mediaSource.Path;
                    }
                    result.push(id_path);
                }
                return result;
            }, []);

            return Promise.resolve(paths);
        }).catch(function (error) {
            return Promise.resolve([]);
        });
    }

    function getLibraryItemsBySyncStatus(serverId, syncStati) {

        throw new Error('getLibraryItemsBySyncStatus not implemented');
    }

    function getLibraryItemsByType(serverId, itemTypes, options) {

        return new Promise(function (resolve, reject) {

            window.webkit.messageHandlers.localDatabase.postMessage({
                command: 'getLibraryItemsByType',
                args: [serverId, JSON.stringify(itemTypes)]
            });

            getLibraryItemsByTypeResolves.push(resolve);
        });
    }

    function getAllLibraryItems(serverId) {

        return new Promise(function (resolve, reject) {

            window.webkit.messageHandlers.localDatabase.postMessage({
                command: 'getAllLibraryItems',
                args: [serverId]
            });

            getAllLibraryItemsResolves.push(resolve);
        });
    }

    function getLibraryItem(serverId, key) {

        return new Promise(function (resolve, reject) {
            window.webkit.messageHandlers.localDatabase.postMessage({
                command: 'getLibraryItem',
                args: [serverId, key]
            });

            getLibraryItemResolves.push(resolve);
        });
    }

    function addLibraryItem(serverId, key, val) {

        throw new Error('addLibraryItem not implemented');
    }

    function updateLibraryItem(serverId, key, val) {

        window.webkit.messageHandlers.localDatabase.postMessage({
            command: 'updateLibraryItem',
            args: [serverId, key, JSON.stringify(val)]
        });

        return Promise.resolve();
    }

    function deleteLibraryItem(serverId, key) {

        window.webkit.messageHandlers.localDatabase.postMessage({
            command: 'deleteLibraryItem',
            args: [serverId, key]
        });

        return Promise.resolve();
    }

    function clearLibrary(serverId) {

        throw new Error('clearLibrary not implemented');
    }

    function getLibraryItems(serverId, options) {

        var searchParentId = options.ParentId;

        searchParentId = normalizeId(searchParentId);
        var seasonId = normalizeId(options.SeasonId || options.seasonId);
        var seriesId = normalizeId(options.SeriesId || options.seriesId);
        var albumIds = normalizeIdList(options.AlbumIds || options.albumIds);

        var includeItemTypes = options.IncludeItemTypes ? options.IncludeItemTypes.split(',') : [];
        var filters = options.Filters ? options.Filters.split(',') : [];
        var mediaTypes = options.MediaTypes ? options.MediaTypes.split(',') : [];

        if (updateFiltersForTopLevelView(searchParentId, mediaTypes, includeItemTypes, options)) {
            searchParentId = null;
        }

        var getPromise = Promise.resolve();

        if (searchParentId) {
            getPromise = getLibraryItem(serverId, searchParentId).then(function (item) {
                if (item && item.Item) {
                    if (item.Item.Type === 'MusicAlbum') {
                        options.Recursive = true;
                        includeItemTypes.push('Audio');

                        if (!albumIds.includes(searchParentId)) {
                            albumIds.push(searchParentId);
                            searchParentId = null;
                        }
                        options.SortBy = options.SortBy || "ParentIndexNumber,IndexNumber,SortName";
                    }
                    else if (item.Item.Type === "Series") {
                        seriesId = searchParentId;
                        searchParentId = null;
                        options.SortBy = options.SortBy || options.Recursive ? "ParentIndexNumber,IndexNumber" : "IndexNumber";
                    }
                    else if (item.Item.Type === "Season") {
                        seriesId = searchParentId;
                        searchParentId = null;
                        options.SortBy = options.SortBy || "ParentIndexNumber,IndexNumber,SortName";
                    }
                }
            });
        }

        if (includeItemTypes.length) {
            getPromise = getPromise.then(function () {
                var includeSet = Array.from(new Set(includeItemTypes));
                includeItemTypes = [];
                return getLibraryItemsByType(serverId, includeSet);
            });
        } else {
            getPromise = getPromise.then(function () {
                return getAllLibraryItems(serverId);
            });
        }

        return getPromise.then(function (items) {

            var itemsMap = new Map();
            var subtreeIdSet = new Set();

            // create a map for quick access
            items.forEach(function (item) {
                item.Item.LocalChildren = [];
                itemsMap.set(item.Item.Id, item.Item);
            });

            // add each item to its parent's LocalChildren collection if parent exists
            itemsMap.forEach(function (item) {
                if (item.ParentId && itemsMap.has(item.ParentId)) {
                    var parentItem = itemsMap.get(item.ParentId);
                    parentItem.LocalChildren.push(item);
                }
            });

            // create a set containing all item ids that are descendants from searchParentId
            if (options.Recursive && searchParentId && itemsMap.has(searchParentId)) {

                var addSubtreeIds = function (recurseItem) {

                    if (!subtreeIdSet.has(recurseItem.Id)) {
                        subtreeIdSet.add(recurseItem.Id);
                    }

                    recurseItem.LocalChildren.forEach(function (childItem) {
                        addSubtreeIds(childItem);
                    });
                };

                var searchParentItem = itemsMap.get(searchParentId);
                addSubtreeIds(searchParentItem);
            }

            var resultItems = items.filter(function (item) {

                if (item.SyncStatus && item.SyncStatus !== 'synced') {
                    return false;
                }

                if (mediaTypes.length) {
                    if (mediaTypes.indexOf(item.Item.MediaType || '') === -1) {
                        return false;
                    }
                }

                if (seriesId && item.Item.SeriesId !== seriesId) {
                    return false;
                }

                if (seasonId && item.Item.SeasonId !== seasonId) {
                    return false;
                }

                if (albumIds.length && albumIds.indexOf(item.Item.AlbumId || '') === -1) {
                    return false;
                }

                if (item.Item.IsFolder && filters.indexOf('IsNotFolder') !== -1) {
                    return false;
                } else if (!item.Item.IsFolder && filters.indexOf('IsFolder') !== -1) {
                    return false;
                }

                if (includeItemTypes.length) {
                    if (includeItemTypes.indexOf(item.Item.Type || '') === -1) {
                        return false;
                    }
                }

                if (searchParentId) {
                    if (options.Recursive) {
                        return subtreeIdSet.has(item.Item.Id);
                    } else {
                        return item.Item.ParentId === searchParentId;
                    }
                }
                return true;
            }).map(function (item2) {
                return item2.Item;
            });

            resultItems = sortItems(resultItems, options);

            var totalRecordCount = resultItems.length;

            if (options.StartIndex) {
                resultItems = resultItems.slice(options.StartIndex);
            }

            if (options.Limit != null) {
                resultItems = resultItems.slice(0, options.Limit);
            }

            return Promise.resolve({
                Items: resultItems,
                TotalRecordCount: totalRecordCount
            });
        });
    }

    function sortItems(items, query) {

        if (query.LocalSortBy && query.LocalSortBy.length !== 0) {
            // option LocalSortBy overrides SortBy option
            query.SortBy = query.LocalSortBy;
        }

        if (!query.SortBy || query.SortBy.length === 0) {
            return items;
        }

        if (query.SortBy === 'Random') {
            return shuffle(items);
        }

        var sortSpec = getSortSpec(query);

        items.sort(function (a, b) {

            for (var i = 0; i < sortSpec.length; i++) {
                var result = compareValues(a, b, sortSpec[i].Field, sortSpec[i].OrderDescending);
                if (result !== 0) {
                    return result;
                }
            }

            return 0;
        });

        return items;
    }

    function compareValues(a, b, field, orderDesc) {

        if (!a.hasOwnProperty(field) || !b.hasOwnProperty(field)) {
            // property doesn't exist on both objects
            return 0;
        }

        var valA = a[field];
        var valB = b[field];

        var result = 0;

        if (typeof valA === 'string' || typeof valB === 'string') {
            valA = valA || '';
            valB = valB || '';
            result = valA.toLowerCase().localeCompare(valB.toLowerCase());
        } else {
            if (valA > valB) {
                result = 1;
            } else if (valA < valB) {
                result = -1;
            }
        }

        if (orderDesc) {
            result *= -1;
        }

        return result;
    }

    function shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    function getSortSpec(query) {

        var sortFields = (query.SortBy || '').split(',');
        var sortOrders = (query.SortOrder || '').split(',');
        var sortSpec = [];

        for (var i = 0; i < sortFields.length; i++) {
            var orderDesc = false;

            if (i < sortOrders.length && sortOrders[i].toLowerCase().indexOf('desc') !== -1) {
                orderDesc = true;
            }

            sortSpec.push({ Field: sortFields[i], OrderDescending: orderDesc });
        }

        return sortSpec;
    }

    function updateFiltersForTopLevelView(parentId, mediaTypes, includeItemTypes, query) {

        switch (parentId) {
            case 'MusicView':
                if (query.Recursive) {
                    includeItemTypes.push('Audio');
                } else {
                    includeItemTypes.push('MusicAlbum');
                }
                return true;
            case 'PhotosView':
                if (query.Recursive) {
                    includeItemTypes.push('Photo');
                } else {
                    includeItemTypes.push('PhotoAlbum');
                }
                return true;
            case 'TVView':
                if (query.Recursive) {
                    includeItemTypes.push('Episode');
                } else {
                    includeItemTypes.push('Series');
                }
                return true;
            case 'VideosView':
                if (query.Recursive) {
                    includeItemTypes.push('Video');
                } else {
                    includeItemTypes.push('Video');
                }
                return true;
            case 'MoviesView':
                if (query.Recursive) {
                    includeItemTypes.push('Movie');
                } else {
                    includeItemTypes.push('Movie');
                }
                return true;
            case 'MusicVideosView':
                if (query.Recursive) {
                    includeItemTypes.push('MusicVideo');
                } else {
                    includeItemTypes.push('MusicVideo');
                }
                return true;
            case 'TrailersView':
                if (query.Recursive) {
                    includeItemTypes.push('Trailer');
                } else {
                    includeItemTypes.push('Trailer');
                }
                return true;
        }

        return false;
    }

    function normalizeId(id) {

        if (id) {
            id = stripStart(id, 'localview:');
            id = stripStart(id, 'local:');
            return id;
        }

        return null;
    }

    function normalizeIdList(val) {

        if (val) {
            return val.split(',').map(normalizeId);
        }

        return [];
    }

    function stripStart(str, find) {
        if (startsWith(str, find)) {
            return str.substr(find.length);
        }

        return str;
    }

    function startsWith(str, find) {

        if (str && find && str.length > find.length) {
            if (str.indexOf(find) === 0) {
                return true;
            }
        }

        return false;
    }


    return {
        getLibarytemTypes: getLibarytemTypes,
        getLibraryItemsByIds: getLibraryItemsByIds,
        getLibraryItemPathsByIds: getLibraryItemPathsByIds,
        getLibraryItemsBySyncStatus: getLibraryItemsBySyncStatus,
        getLibraryItemsByType: getLibraryItemsByType,
        getAllLibraryItems: getAllLibraryItems,
        getLibraryItem: getLibraryItem,
        getLibraryItems: getLibraryItems,
        addLibraryItem: addLibraryItem,
        updateLibraryItem: updateLibraryItem,
        deleteLibraryItem: deleteLibraryItem,
        clearLibrary: clearLibrary
    };
});