package com.rnproject;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.bridge.Promise;
import android.net.wifi.WifiInfo;
import java.net.NetworkInterface;

import java.net.InetAddress;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.lang.Runtime;
import java.math.BigInteger;
import java.util.Locale;
import java.util.Map;
import android.net.wifi.WifiManager;
import android.content.Context;
import android.content.pm.PackageManager;

import android.location.Criteria;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.os.Looper;
import androidx.annotation.RequiresPermission;
import android.util.Log;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.*;
import android.net.wifi.ScanResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.rnproject.GetLocation;
import com.rnproject.SettingsUtil;

import java.util.Timer;
import java.util.TimerTask;
import com.facebook.react.module.annotations.ReactModule;

@ReactModule(name = DeviceDetailsManager.NAME)
public class DeviceDetailsManager extends ReactContextBaseJavaModule {
    public static final String NAME = "ReactNativeGetLocation";

    private LocationManager locationManager;
    private GetLocation getLocation; 
    WifiManager wifi;

    public DeviceDetailsManager(ReactApplicationContext reactcontext) {
        super(reactcontext);
        wifi = (WifiManager)reactcontext.getSystemService(Context.WIFI_SERVICE);
        try {
            locationManager = (LocationManager) reactcontext.getApplicationContext()
                    .getSystemService(Context.LOCATION_SERVICE);
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    @Override
    public String getName() {
        return NAME;
    }

    public WifiInfo getWifiInfo() {
        WifiManager manager = (WifiManager) getReactApplicationContext().getApplicationContext()
                .getSystemService(Context.WIFI_SERVICE);
        if (manager != null) {
            return manager.getConnectionInfo();
        }
        return null;
    }

    // Custom function that we are going to export to JS
    @ReactMethod
    public void getDeviceName(Callback cb) {
        try {
            cb.invoke(null, android.os.Build.MODEL);
        } catch (Exception e) {
            cb.invoke(e.toString(), null);
        }
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public String getMacAddressSync() {
        WifiInfo wifiInfo = getWifiInfo();
        String macAddress = "";
        if (wifiInfo != null) {
            macAddress = wifiInfo.getMacAddress();
        }

        String permission = "android.permission.INTERNET";
        int res = getReactApplicationContext().checkCallingOrSelfPermission(permission);

        if (res == PackageManager.PERMISSION_GRANTED) {
            try {
                List<NetworkInterface> all = Collections.list(NetworkInterface.getNetworkInterfaces());
                for (NetworkInterface nif : all) {
                    if (!nif.getName().equalsIgnoreCase("wlan0"))
                        continue;

                    byte[] macBytes = nif.getHardwareAddress();
                    if (macBytes == null) {
                        macAddress = "";
                    } else {

                        StringBuilder res1 = new StringBuilder();
                        for (byte b : macBytes) {
                            res1.append(String.format("%02X:", b));
                        }

                        if (res1.length() > 0) {
                            res1.deleteCharAt(res1.length() - 1);
                        }

                        macAddress = res1.toString();
                    }
                }
            } catch (Exception ex) {
                // do nothing
            }
        }

        return macAddress;
    }

    @ReactMethod
    public void getMacAddress(Callback cb) {
        try {
            cb.invoke(null, getMacAddressSync());
        } catch (Exception e) {
            cb.invoke(e.toString(), null);
        }
    }

    @ReactMethod
    public void getInfo(Callback cb) {
        try {
            cb.invoke(null, getWifiInfo());
        } catch (Exception e) {
            cb.invoke(e.toString(), null);
        }
    }

    @ReactMethod
    public void openWifiSettings(final Promise primise) {
        try {
            SettingsUtil.openWifiSettings(getReactApplicationContext());
            primise.resolve(null);
        } catch (Throwable ex) {
            primise.reject(ex);
        }
    }

    @ReactMethod
    public void openCelularSettings(final Promise primise) {
        try {
            SettingsUtil.openCelularSettings(getReactApplicationContext());
            primise.resolve(null);
        } catch (Throwable ex) {
            primise.reject(ex);
        }
    }

    @ReactMethod
    public void openGpsSettings(final Promise primise) {
        try {
            SettingsUtil.openGpsSettings(getReactApplicationContext());
            primise.resolve(null);
        } catch (Throwable ex) {
            primise.reject(ex);
        }
    }

    @ReactMethod
    public void openAppSettings(final Promise promise) {
        try {
            SettingsUtil.openAppSettings(getReactApplicationContext());
            promise.resolve(null);
        } catch (Throwable ex) {
            promise.reject(ex);
        }
    }

    @ReactMethod
    public void getCurrentPosition(ReadableMap options, Promise promise) {
        if (getLocation != null) {
            getLocation.cancel();
        }
        getLocation = new GetLocation(locationManager);
        getLocation.get(options, promise);
    }

    @ReactMethod
    public String getClients() {
        BufferedReader br = null;
        String data = "";
        try {
            br = new BufferedReader(new FileReader("/proc/net/arp"));
            String line;
            while ((line = br.readLine()) != null) {
                if (line != null) {
                    data = line;
                }
            }
        } catch (Exception e) {

        }
        return data;
    }

    @ReactMethod
    public void getClientList(Callback cb) {
        try {
            cb.invoke(null, getClients());
        } catch (Exception e) {
            cb.invoke(e.toString(), null);
        }
    }

    // Method to load wifi list into string via Callback. Returns a stringified
    // JSONArray
    @ReactMethod
    public void loadWifiList(Callback successCallback, Callback errorCallback) {
        try {
            List<ScanResult> results = wifi.getScanResults();
            JSONArray wifiArray = new JSONArray();

            for (ScanResult result : results) {
                JSONObject wifiObject = new JSONObject();
                if (!result.SSID.equals("")) {
                    try {
                        wifiObject.put("SSID", result.SSID);
                        wifiObject.put("BSSID", result.BSSID);
                        wifiObject.put("capabilities", result.capabilities);
                        wifiObject.put("frequency", result.frequency);
                        wifiObject.put("level", result.level);
                        wifiObject.put("timestamp", result.timestamp);
                        // Other fields not added
                        // wifiObject.put("operatorFriendlyName", result.operatorFriendlyName);
                        // wifiObject.put("venueName", result.venueName);
                        // wifiObject.put("centerFreq0", result.centerFreq0);
                        // wifiObject.put("centerFreq1", result.centerFreq1);
                        // wifiObject.put("channelWidth", result.channelWidth);
                    } catch (JSONException e) {
                        errorCallback.invoke(e.getMessage());
                    }
                    wifiArray.put(wifiObject);
                }
            }
            successCallback.invoke(wifiArray.toString());
        } catch (Exception e) {
            errorCallback.invoke(e.getMessage());
        }
    }

}
