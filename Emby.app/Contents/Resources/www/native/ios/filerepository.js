define(['appSettings'], function (appSettings) {
    'use strict';

    function getDocumentsPath() {
    }

    function getValidFileName(path) {

        return path;
    }

    function getFullMetadataPath(pathArray) {

        return getPathFromArray(pathArray);
    }

    function getFullLocalPath(pathArray) {

        return getPathFromArray(pathArray);
    }

    function getPathFromArray(pathArray) {

        var path = pathArray.join('/');

        if (path.indexOf('/') !== 0 && path.indexOf(':/') === -1) {
            path = '/' + path;
        }

        return path;
    }

    function getImageUrl(pathArray) {

        return 'http://localhost:12344/Documents' + getFullMetadataPath(pathArray);
    }

    function deleteFile(path) {

        console.log('Deleting ' + path);
        window.webkit.messageHandlers.fileSystem.postMessage({
            command: "deleteFile",
            path: path,
        });
        return Promise.resolve();
    }

    function fileExists(path) {

        return new Promise(function(resolve, reject) {

            window.webkit.messageHandlers.fileSystem.postMessage({
                command: "fileExists",
                path: path,
            });

            var timeoutHandle = setTimeout(function() {
                resolve(false);
            }, 2000);

            // Called from native side
            window.fileExistsResult = function (fileInfo) {

                clearTimeout(timeoutHandle);

                console.log('fileExists: ' + fileInfo.exists + ' - path: ' + path);

                resolve(fileInfo.exists);
            };
        });
    }

    function getItemFileSize(path) {

        return new Promise(function(resolve, reject) {

            window.webkit.messageHandlers.fileSystem.postMessage({
                command: "fileSize",
                path: path,
            });

            var timeoutHandle = setTimeout(function() {
                resolve(0);
            }, 2000);

            // Called from native side
            window.fileSizeResult = function (fileInfo) {

                clearTimeout(timeoutHandle);

                if (!fileInfo) { // file doesn't exists
                    // return 0 to check if it's queued for download
                    resolve(0);
                }
                else {
                    resolve(fileInfo.size);
                    console.log('fileSize: ' + fileInfo.size + ' - path: ' + path);
                }
            };
        });
    }

    function deleteDirectory(path) {

        // TODO
        return Promise.resolve();
    }

    function createDirectory(path) {

        return new Promise(function (resolve, reject) {
            createDirectoryPart(path, 0, resolve, reject);
        });
    }

    function createDirectoryPart(path, index, resolve, reject) {

        var parts = path.split('/');
        if (index >= parts.length) {
            resolve();
            return;
        }

        parts.length = index + 1;
        var pathToCreate = parts.join('/');

        createDirectoryInternal(pathToCreate).then(function () {

            createDirectoryPart(path, index + 1, resolve, reject);

        }, reject);
    }

    function createDirectoryInternal(path) {

        if (!path) {
            return Promise.resolve();
        }

        console.log('creating directory: ' + path);

        return new Promise(function (resolve, reject) {

            window.webkit.messageHandlers.fileSystem.postMessage({
                command: "createDirectory",
                path: path,
            });

            resolve();
        });
    }

    // Called from native side
    window.createDirectoryResult = function (fileInfo) {
        if (fileInfo) {
            console.log('createDirectory succeeded: ' + fileInfo.path);
        }
        else {
            console.log('createDirectory failed');
        }
    };

    function getParentDirectoryPath(path) {

        var parts = path.split('/');
        parts.length--;

        return parts.join('/');
    }

    // transfer manager methods
    var activeTransfers = {};
    function downloadWithFileTransfer(url, localPath) {

        console.log('downloading: ' + url + ' to ' + localPath);

        return createDirectory(getParentDirectoryPath(localPath)).then(function () {

            return new Promise(function (resolve, reject) {

                window.webkit.messageHandlers.startDownload.postMessage({
                    uri: url,
                    targetFile: localPath,
                    inBackground: false,
                    onlyOnWifi: appSettings.syncOnlyOnWifi()
                });

                var timeoutHandle = setTimeout(function() {
                    resolve({
                        isComplete: false,
                        path: localPath
                    });
                    delete activeTransfers[url];
                }, 500);

                function doResolve() {
                    clearTimeout(timeoutHandle);
                    resolve({
                        isComplete: true,
                        path: localPath
                    });
                }
                activeTransfers[url] = doResolve;
            });
        });
    }

    function onFileTransferComplete(info) {

        console.log('fileTransfer complete from url: ' + info.url);

        var resolve = activeTransfers[info.url];
        if (resolve) {
            delete activeTransfers[info.url];
            resolve();
        }
    }
    if (!window.onFileTransferComplete) {
        window.onFileTransferComplete = onFileTransferComplete;
    }

    function downloadInBackground(url, localPath) {

        console.log('downloading: ' + url + ' to ' + localPath);

        return createDirectory(getParentDirectoryPath(localPath)).then(function () {

            return new Promise(function (resolve, reject) {

                window.webkit.messageHandlers.startDownload.postMessage({
                    uri: url,
                    targetFile: localPath,
                    inBackground: true,
                    onlyOnWifi: appSettings.syncOnlyOnWifi()
                });

                resolve({
                    path: localPath,
                    isComplete: false
                });
            });
        });
    }


    function onBackgroundDownloadComplete(info) {

        console.log('Downloaded url: ' + info.url + ' to ' + info.path);

        setTimeout(syncNow, 3000);
    }

    if (!window.onBackgroundDownloadComplete) {
        window.onBackgroundDownloadComplete = onBackgroundDownloadComplete;
    }

    function onBackgroundDownloadFailed(info) {

        // on error
        console.log('Error downloading to path: ' + info.path + ' ======> ' + info.error);
    }
    if (!window.onBackgroundDownloadFailed) {
        window.onBackgroundDownloadFailed = onBackgroundDownloadFailed;
    }

    function onBackgroundDownloadProgress(info) {

        // on progress
        // console.log('Download progress for path: ' + info.path + ' - ' + info.progress);
    }
    if (!window.onBackgroundDownloadProgress) {
        window.onBackgroundDownloadProgress = onBackgroundDownloadProgress;
    }

    function syncNow() {
        require(['localsync'], function (localSync) {
            localSync.sync();
        });
    }

    function createDownload(url, localPath, monitorCompletion, imageUrl) {

        if (localPath.indexOf('/') !== 0) {
            localPath = '/' + localPath;
        }

        if (monitorCompletion) {
            return downloadInBackground(url, localPath);
        }

        return downloadWithFileTransfer(url, localPath);
    }

    function downloadFile(url, localItem, imageUrl) {

        var localPath = getFullLocalPath(localItem.LocalPathParts);

        return createDownload(url, localPath, true, imageUrl);
    }

    function downloadSubtitles(url, filePath) {

        return createDownload(url, filePath, false);
    }

    function downloadImage(url, localPathParts) {

        var localPath = getFullMetadataPath(localPathParts);

        return createDownload(url, localPath, false);
    }

    function isDownloadFileInQueue(filePath) {
        return getItemFileSize(filePath).then(function (size) {
            return size === 0;
        });
    }

    function getDownloadItemCount() {
        return Promise.resolve(0);
    }

    function resyncTransfers() {
        return Promise.resolve();
    }

    var PathSeparator = '/';

    function getParentPath(path) {
        var pathArray = path.split(PathSeparator);

        if (pathArray.length === 0) {
            return null;
        }

        pathArray = pathArray.slice(0, pathArray.length - 1);
        return pathArray.join(PathSeparator);
    }

    function combinePath(path1, path2) {

        if (path1.endsWith(PathSeparator)) {
            path1 = path1.substr(0, path1.length - 1);
        }

        if (path2.startsWith(PathSeparator)) {
            path2 = path2.substr(1);
        }

        return path1 + PathSeparator + path2;
    }

    return {
        getValidFileName: getValidFileName,
        deleteFile: deleteFile,
        deleteDirectory: deleteDirectory,
        fileExists: fileExists,
        getItemFileSize: getItemFileSize,
        downloadFile: downloadFile,
        downloadSubtitles: downloadSubtitles,
        downloadImage: downloadImage,
        isDownloadFileInQueue: isDownloadFileInQueue,
        getDownloadItemCount: getDownloadItemCount,
        resyncTransfers: resyncTransfers,
        getFullMetadataPath: getFullMetadataPath,
        getImageUrl: getImageUrl,
        getParentPath: getParentPath,
        combinePath: combinePath
    };
});