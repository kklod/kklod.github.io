define(['globalize', 'events', 'appSettings', 'layoutManager'], function (globalize, events, appSettings, layoutManager) {

    'use strict';

    var updatedProducts = [];

    var iapManager = {};

    var PlaybackUnlockId = 'playbackunlock';
    var LegacyAppUnlockId = 'appunlock';
    var MontlySubscriptionId = 'emby.subscription.monthly';

    function getPremiumInfoUrl() {

        return 'https://emby.media/premiere';
    }

    function getStoreFeatureId(feature) {

        switch (feature) {

            case 'embypremieremonthly':
                return MontlySubscriptionId;
            case 'playback':
                if (window.applePlatform === 'maccatalyst' || layoutManager.tv) {
                    return null;
                }
                return PlaybackUnlockId;

            // this shouldn't happen, but if it does
            case PlaybackUnlockId:
                return PlaybackUnlockId;
            case MontlySubscriptionId:
                return MontlySubscriptionId;
            default:
                return null;
        }

        return null;
    }

    function updateProductInfo(product) {

        updatedProducts = updatedProducts.filter(function (r) {
            return r.id !== product.id;
        });

        updatedProducts.push(product);

        events.trigger(iapManager, 'productupdated', [product]);
    }
    if (!window.updateProductInfo) {
        window.updateProductInfo = updateProductInfo;
    }

    function getProduct(feature) {

        var id = getStoreFeatureId(feature);

        if (!id) {
            return null;
        }

        var products = updatedProducts.filter(function (r) {
            return r.id === id;
        });

        return products.length ? products[0] : null;
    }

    function hasPurchasedByStoreProductId(productId) {

        var products = updatedProducts.filter(function (r) {
            return r.id === productId;
        });

        if (products.length) {
            return products[0].owned;
        }

        return false;
    }

    function beginPurchase(feature, email) {

        var id = getStoreFeatureId(feature);

        var localServerValidateUrl;

        if (email) {
            localServerValidateUrl = ApiClient.getUrl("Appstore/Register", {
                api_key: ApiClient.accessToken()
            });
        }

        window.webkit.messageHandlers.iap.postMessage({
            cmd: 'purchase',
            productId: id,
            email: email,
            localServerValidateUrl: localServerValidateUrl
        });
    }

    function restorePurchase() {
        window.webkit.messageHandlers.iap.postMessage({
            cmd: 'restore'
        });
    }

    function registerProducts(productIds) {

        if (!Array.isArray(productIds)) {
            productIds = [productIds];
        }

        window.webkit.messageHandlers.iap.postMessage({
            cmd: 'register',
            productIds: productIds
        });
    }

    function initializeStore() {

        if (window.applePlatform === 'maccatalyst') {
            registerProducts([MontlySubscriptionId]);
        }
        else {
            registerProducts([LegacyAppUnlockId, PlaybackUnlockId, MontlySubscriptionId]);
        }
    }

    function getSubscriptionOptions() {

        var options = [];

        options.push({

            feature: 'embypremieremonthly',
            id: MontlySubscriptionId,
            title: 'EmbyPremiereMonthlyWithPrice'
        });

        options = options.filter(function (o) {

            var internalProduct = getProduct(o.feature);
            return internalProduct != null;

        }).map(function (o) {

            var internalProduct = getProduct(o.feature);
            o.title = globalize.translate(o.title, internalProduct.price);
            o.owned = internalProduct.owned;
            return o;
        });

        return Promise.resolve(options);
    }

    function isUnlockedByDefault(feature) {

        // playback-tv is only used by the settings screen to determine requirements of playback in tv mode
        if (feature === 'playback' || feature === 'playback-tv') {

            if (layoutManager.tv || feature === 'playback-tv') {
                return Promise.reject();
            }
        }

        if (feature === 'playback' || feature === 'livetv') {

            var settingsKey = 'ioslegacyunlock';
            if (appSettings.get(settingsKey) === '1') {
                return Promise.resolve();
            }

            if (hasPurchasedByStoreProductId(LegacyAppUnlockId)) {
                appSettings.set(settingsKey, '1');
                return Promise.resolve();
            }
        }

        return Promise.reject();
    }

    function getAdminFeatureName(feature) {

        if (feature === 'playback') {
            return 'iosappunlock';
        }

        return feature;
    }

    function getPeriodicMessageIntervalMs(feature) {
        return 0;
    }

    function getRestoreButtonText() {
        return globalize.translate('ButtonRestorePreviousPurchase');
    }

    function getTermsOfPurchase() {

        var list = [];

        list.push('Payment will be charged to iTunes Account at confirmation of purchase.');
        list.push('Subscription automatically renews unless auto-renew is turned off at least 24-hours before the end of the current period.');
        list.push('Account will be charged for renewal within 24-hours prior to the end of the current period.');
        list.push('Subscriptions may be managed and auto-renewal may be turned off by going to your iTunes Account Settings after purchase');
        list.push('Any unused portion of a free trial period, if offered, will be forfeited when the user purchases a subscription to that publication, where applicable.');

        return list;
    }

    function clearPurchaseHistory() {
        window.webkit.messageHandlers.iap.postMessage({
            cmd: 'clearPurchaseHistory'
        });
    }

    iapManager.getProductInfo = getProduct;
    iapManager.beginPurchase = beginPurchase;
    iapManager.restorePurchase = restorePurchase;
    iapManager.getSubscriptionOptions = getSubscriptionOptions;
    iapManager.isUnlockedByDefault = isUnlockedByDefault;
    iapManager.getAdminFeatureName = getAdminFeatureName;
    iapManager.getPeriodicMessageIntervalMs = getPeriodicMessageIntervalMs;
    iapManager.getRestoreButtonText = getRestoreButtonText;
    iapManager.getTermsOfPurchase = getTermsOfPurchase;
    iapManager.getPremiumInfoUrl = getPremiumInfoUrl;

    initializeStore();
    //restorePurchase();
    //setTimeout(clearPurchaseHistory, 10000);
    return iapManager;
});