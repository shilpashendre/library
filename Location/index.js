import {
    NativeModules, Platform, Linking,
    PermissionsAndroid,
} from 'react-native';

import LocationError from './LocationError';

const { OS } = Platform;
const Version = parseInt(Platform.Version);
const { ReactNativeGetLocation } = NativeModules;

async function openUrlIfCan(url) {
    if (await Linking.canOpenURL(url)) {
        await Linking.openURL(url);
        return true;
    }
    return false;
}

async function openIOSSettings(root, path = '') {
    if (await openUrlIfCan(`App-Prefs:root=${root}${path ? `&path=${path}` : ''}`)) {
        return true;
    }
    if (await openUrlIfCan('App-Prefs:')) {
        return true;
    }
    return false;
};

async function requestAndroidPermission(enableHighAccuracy = false) {
    const { PERMISSIONS, RESULTS } = PermissionsAndroid;
    const granted = await PermissionsAndroid.request(enableHighAccuracy
        ? PERMISSIONS.ACCESS_FINE_LOCATION
        : PERMISSIONS.ACCESS_COARSE_LOCATION);
    if (granted !== RESULTS.GRANTED) {
        throw new LocationError('UNAUTHORIZED', 'Authorization denied');
    }
    return true;
}

export default {
    async getCurrentPosition(options = {
        enableHighAccuracy: false,
        timeout: 0,
    }) {
        if (OS === 'android') {
            await requestAndroidPermission(options.enableHighAccuracy);
        }
        try {
            const location = await ReactNativeGetLocation.getCurrentPosition(options);
            return location;
        } catch (error) {
            const { code, message } = error;
            const locationError = new LocationError(code, message);
            locationError.stack = error.stack;
            throw locationError;
        }
    },

    // Extra functions

    openAppSettings() {
        return ReactNativeGetLocation.openAppSettings();
    },

    /**
     * Only for Android
     */
    async openWifiSettings() {
        if (OS === 'android') {
            return ReactNativeGetLocation.openWifiSettings();
        }

        if (await openIOSSettings('WIFI')) {
            return true;
        }

        return ReactNativeGetLocation.openAppSettings();
    },

    /**
     * Only for Android
     */
    async openCelularSettings() {
        if (OS === 'android') {
            return ReactNativeGetLocation.openCelularSettings();
        }

        if (await openIOSSettings('MOBILE_DATA_SETTINGS_ID')) {
            return true;
        }

        return ReactNativeGetLocation.openAppSettings();
    },

    /**
     * Only for Android
     */
    async openGpsSettings() {
        if (OS === 'android') {
            return ReactNativeGetLocation.openGpsSettings();
        }

        if (Version >= 10) {
            if (await openIOSSettings('Privacy', 'LOCATION')) {
                return true;
            }
        } else {
            if (await openIOSSettings('LOCATION_SERVICES')) {
                return true;
            }
        }

        return ReactNativeGetLocation.openAppSettings();
    },
};
