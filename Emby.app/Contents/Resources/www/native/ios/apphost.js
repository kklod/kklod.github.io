define(['appSettings', 'browser', 'events'], function (appSettings, browser, events) {

    'use strict';

    console.log = function () { };

    window.addEventListener('error', function (evt) {

        var msg = "error";
        if (evt) {
            if (evt.message) { // Chrome sometimes provides this
                msg = evt.message + " at linenumber: " + evt.lineno + " of file: " + evt.filename;
            } else {
                msg = evt.type + " from element: " + (evt.srcElement || evt.target);
            }
            if (evt.error) {
                msg += "\n" + JSON.stringify(evt.error);
            }
        }
        window.webkit.messageHandlers.errorHandler.postMessage({ error: msg });
    });

    window.addEventListener("unhandledrejection", function (evt) {

        var msg = "Unhandled Promise Rejection";
        if (evt) {
            msg += " (from element: " + (evt.srcElement || evt.target) + ", reason: " + evt.reason + ")";
        }
        window.webkit.messageHandlers.errorHandler.postMessage({ error: msg });
    });

    function getSyncProfile(item) {

        var profile = {};

        // Only setting MaxStaticBitrate for older servers
        profile.MaxStreamingBitrate = profile.MaxStaticBitrate = 200000000;

        profile.MusicStreamingTranscodingBitrate = 192000;
        profile.MaxStaticMusicBitrate = appSettings.maxStaticMusicBitrate();

        profile.DirectPlayProfiles = [];

        // leave container null for all
        profile.DirectPlayProfiles.push({
            Type: 'Video',
            AudioCodec: '-dts,dca,truehd'
        });

        // leave container null for all
        profile.DirectPlayProfiles.push({
            Type: 'Audio'
        });

        profile.TranscodingProfiles = [];

        profile.TranscodingProfiles.push({
            Container: 'mkv',
            Type: 'Video',
            AudioCodec: 'aac,mp3,ac3',
            VideoCodec: 'h264',
            Context: 'Static',
            MaxAudioChannels: '2'
        });

        profile.TranscodingProfiles.push({
            Container: 'mp3',
            Type: 'Audio',
            AudioCodec: 'mp3',
            Context: 'Static',
            Protocol: 'http',
            MaxAudioChannels: '2'
        });

        profile.ContainerProfiles = [];

        profile.CodecProfiles = [];

        profile.CodecProfiles.push({
            Type: 'Video',
            Codec: 'hevc',
            Conditions: [
                {
                    Condition: 'EqualsAny',
                    Property: 'VideoProfile',
                    Value: 'Main|Main 10'
                }]
        });

        // Subtitle profiles
        // External vtt or burn in
        profile.SubtitleProfiles = [];
        profile.SubtitleProfiles.push({
            Format: 'srt',
            Method: 'External'
        });
        profile.SubtitleProfiles.push({
            Format: 'ssa',
            Method: 'External'
        });
        profile.SubtitleProfiles.push({
            Format: 'ass',
            Method: 'External'
        });
        profile.SubtitleProfiles.push({
            Format: 'vtt',
            Method: 'External'
        });
        profile.SubtitleProfiles.push({
            Format: 'srt',
            Method: 'Embed'
        });
        profile.SubtitleProfiles.push({
            Format: 'subrip',
            Method: 'Embed'
        });
        profile.SubtitleProfiles.push({
            Format: 'ass',
            Method: 'Embed'
        });
        profile.SubtitleProfiles.push({
            Format: 'ssa',
            Method: 'Embed'
        });
        profile.SubtitleProfiles.push({
            Format: 'dvb_teletext',
            Method: 'Embed'
        });
        profile.SubtitleProfiles.push({
            Format: 'dvb_subtitle',
            Method: 'Embed'
        });
        profile.SubtitleProfiles.push({
            Format: 'dvbsub',
            Method: 'Embed'
        });
        profile.SubtitleProfiles.push({
            Format: 'pgs',
            Method: 'Embed'
        });
        profile.SubtitleProfiles.push({
            Format: 'pgssub',
            Method: 'Embed'
        });
        profile.SubtitleProfiles.push({
            Format: 'dvdsub',
            Method: 'Embed'
        });
        profile.SubtitleProfiles.push({
            Format: 'vtt',
            Method: 'Embed'
        });
        profile.SubtitleProfiles.push({
            Format: 'sub',
            Method: 'Embed'
        });
        profile.SubtitleProfiles.push({
            Format: 'idx',
            Method: 'Embed'
        });
        profile.SubtitleProfiles.push({
            Format: 'smi',
            Method: 'Embed'
        });

        profile.ResponseProfiles = [];

        return Promise.resolve(profile);
    }

    function sharePolyfill(data) {
        return new Promise(function (resolve, reject) {
            if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.share) {
                window.webkit.messageHandlers.share.postMessage({
                    'message': data.text,
                    'subject': data.title,
                    'files': data.imageUrl,
                    'url': data.url
                });
                resolve();
            } else {
                reject(Error('Error sending share message to native app'));
            }
        });
    }

    function syncNow() {
        require(['localsync'], function (localSync) {
            localSync.sync();
        });
    }

    var deviceId;
    var deviceName;
    var appName;
    var appVersion;
    var fcmToken;

    var supportedFeatures = function () {

        var features = {};

        features.sync = true;
        features.cameraupload = true;

        features.sharing = true;
        features.exit = true;
        features.exitmenu = true;

        features.htmlaudioautoplay = true;
        features.htmlvideoautoplay = true;
        features.externallinks = true;

        features.multiserver = true;

        features.physicalvolumecontrol = true;
        features.nativevolumeosd = true;

        features.remotecontrol = true;
        features.targetblank = true;

        features.subtitleappearancesettings = true;

        features.displaylanguage = true;
        features.youtube = true;

        features.chromecast = true;

        features.connectsignup = true;
        features.restrictedplugins = true;
        features.displaymode = true;
        features.serversetup = true;

        return features;
    }();

    var appHost = {
        getWindowState: function () {
            return document.windowState || 'Normal';
        },
        setWindowState: function (state) {
            throw new Error('setWindowState is not supported and should not be called');
        },
        exit: function () {

            if (navigator.app && navigator.app.exitApp) {
                navigator.app.exitApp();
            } else {
                window.close();
            }
        },
        supports: function (command) {
            return supportedFeatures[command];
        },

        moreIcon: 'dots-horiz',
        getSyncProfile: getSyncProfile,

        init: function () {

            return getDeviceId().then(function (resolvedDeviceId) {

                deviceId = resolvedDeviceId;
                return getDeviceFcmToken().then(function (resolvedFcmToken) {

                    fcmToken = resolvedFcmToken;
                    return getDeviceName().then(function (resolvedDeviceName) {

                        // Remove special characters
                        deviceName = resolvedDeviceName || getDefaultDeviceName();
                        return getAppVersion().then(function (resolvedAppVersion) {

                            appVersion = resolvedAppVersion;
                            return getAppName().then(function (resolvedAppName) {

                                appName = resolvedAppName || getDefaultAppName();
                            });
                        });
                    });
                });

            });
        },

        deviceName: function () {
            return deviceName;
        },

        deviceId: function () {
            return deviceId;
        },

        appName: function () {
            return appName;
        },

        appVersion: function () {
            return appVersion;
        },

        getPushTokenInfo: function () {

            var info = {};

            if (fcmToken) {
                info.PushToken = fcmToken;
                info.PushTokenType = "firebase";
            }

            return info;
        },

        setTheme: function (themeSettings) {

            var metaThemeColor = document.querySelector("meta[name=theme-color]");
            if (metaThemeColor) {
                metaThemeColor.setAttribute("content", themeSettings.themeColor);
            }

            var isLightStatusBar = (themeSettings.themeColor || '').toLowerCase() === '#ffffff';

            window.webkit.messageHandlers.setStatusBarColor.postMessage({
                color: themeSettings.themeColor,
                isLightStatusBar: isLightStatusBar
            });
        },

        setUserScalable: function (scalable) {

            if (browser.tv) {
                return;
            }

            var att = scalable ?
                'viewport-fit=cover, width=device-width, initial-scale=1, minimum-scale=1, user-scalable=yes' :
                'viewport-fit=cover, width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no';

            document.querySelector('meta[name=viewport]').setAttribute('content', att);
        },

        deviceIconUrl: function () {

            if (browser.ipod || browser.iphone) {
                return 'https://github.com/MediaBrowser/Emby.Resources/raw/master/images/devices/iphone.png';
            }

            if (browser.ipad || browser.osx) {
                return 'https://github.com/MediaBrowser/Emby.Resources/raw/master/images/devices/ipad.png';
            }

            return 'https://github.com/MediaBrowser/Emby.Resources/raw/master/images/devices/ios.png';
        }
    };

    if (!navigator.share) {
        navigator.share = sharePolyfill;
    }

    var lastSyncTime = 0;
    function syncIfNeeded() {

        if (!appHost.supports('sync')) {
            return;
        }

        var now = new Date().getTime();
        if ((now - lastSyncTime) > 900000) {

            lastSyncTime = now;
            setTimeout(syncNow, 10000);
        }
    }

    function getAppVersion() {
        return new Promise(function (resolve, reject) {
            appHost.init.resolveAppVersion = resolve;
            try {
                window.webkit.messageHandlers.deviceInfo.postMessage({ command: 'getAppVersion' });
            }
            catch (err) {
                reject(err);
            }
        });
    }

    function getDeviceId() {

        return new Promise(function (resolve, reject) {
            appHost.init.resolveDeviceId = resolve;
            try {
                window.webkit.messageHandlers.deviceInfo.postMessage({ command: 'getDeviceId' });
            }
            catch (err) {
                reject(err);
            }
        });
    }

    function getDefaultDeviceName() {

        // browser.osx = ipados
        if (browser.ipad || browser.osx) {
            return 'iPad';
        }
        if (browser.iphone) {
            return 'iPhone';
        }
        if (browser.ipod) {
            return 'iPod';
        }

        return 'iOS Device';
    }

    function getDeviceName() {

        return new Promise(function (resolve, reject) {
            appHost.init.resolveDeviceName = resolve;
            try {
                window.webkit.messageHandlers.deviceInfo.postMessage({ command: 'getDeviceName' });
            }
            catch (err) {
                resolve(getDefaultDeviceName());
            }
        });
    }

    function getAppName() {

        return new Promise(function (resolve, reject) {
            appHost.init.resolveAppName = resolve;
            try {
                window.webkit.messageHandlers.deviceInfo.postMessage({ command: 'getAppName' });
            }
            catch (err) {
                resolve(getDefaultAppName());
            }
        });
    }

    function getDefaultAppName() {
        return window.applePlatform === 'maccatalyst' ? 'Emby for macOS' : 'Emby for iOS';
    }

    function getDeviceFcmToken() {

        return new Promise(function (resolve, reject) {
            appHost.resolveFcmToken = resolve;
            try {
                window.webkit.messageHandlers.deviceInfo.postMessage({ command: 'getFcmToken' });
            }
            catch (err) {
                reject(err);
            }
        });
    }

    function onAppResume() {
        console.log('triggering app resume event');
        events.trigger(appHost, 'resume');
        syncIfNeeded();
    }

    appHost.onNativeEvent = function (name) {

        // name = ios event name

        switch (name) {
            case 'resume':
                onAppResume();
                break;
            case 'closing':
                // this isn't used and instead AppCloseHandler.onAppClose is called. See mediasession.js
                break;
            default:
                break;
        }
    };

    window.AppHost = appHost;

    if (!screen.orientation) {
        screen.orientation = {};
    }

    screen.orientation.lock = function (mode) {

        window.webkit.messageHandlers.lockOrientation.postMessage({});

        return Promise.resolve();
    };

    screen.orientation.unlock = function () {
        window.webkit.messageHandlers.unlockOrientation.postMessage({});
    };

    function validateServerAddressWithEndpoint(connectionManager, ajax, url, endpoint) {

        return ajax({

            url: connectionManager.getEmbyServerUrl(url, endpoint),
            timeout: 20000,
            type: 'GET',
            dataType: 'text'

        }).then(function (result) {

            if ((result || '').toLowerCase().indexOf(String.fromCharCode(106) + String.fromCharCode(101) + String.fromCharCode(108) + String.fromCharCode(108)) !== -1) {
                return Promise.reject();
            }

            return Promise.resolve();
        });
    }

    function validateServerAddress(connectionManager, ajax, url) {

        return Promise.all([
            validateServerAddressWithEndpoint(connectionManager, ajax, url, 'web/manifest.json'),
            validateServerAddressWithEndpoint(connectionManager, ajax, url, 'web/index.html'),
            validateServerAddressWithEndpoint(connectionManager, ajax, url, 'web/strings/en-US.json')
        ]);
    }

    appHost.validateServerAddress = function (connectionManager, ajax, url) {

        return validateServerAddress(connectionManager, ajax, url);
    };

    if (!navigator.connection) {
        navigator.connection = {};
    }

    document.addEventListener('viewshow', function viewDidLoad() {
        document.removeEventListener('viewshow', viewDidLoad);
        window.webkit.messageHandlers.appHostLoaded.postMessage({});
    });

    return appHost;
});