/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  PermissionsAndroid,
  NativeModules,
} from 'react-native';

import TestModule from './TestModule';


const App = () => {
  const [devicename, setDevieName] = useState("");
  const [devicenMacAddress, setDevieMacAddress] = useState("");
  const [latlong, setLatLong] = useState("");
  const [connectedTo, setConnectedTo] = useState("");
  const [connectedDeviceInfo, setConnectedDeviceInfo] = useState('');
  const [availableConnection, setAvailableConnection] = useState([]);

  TestModule.getWifi().then(conn => {
    setConnectedTo(conn)
  });
  TestModule.getAddress().then(macAddress => {
    setDevieMacAddress(macAddress);

  });

  const persmission = async () => {
    try {
      // permission to access location to set wifi connection
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
        .then(res => {
          if (res === "granted") {
            console.log(" permission!");
          } else {
            console.log("You will not able to retrieve wifi available networks list");
          }
        });
    } catch (err) {
      console.warn(err)
    }
  }

  useEffect(() => {
    persmission();
    TestModule.getLocation().then(location => {
      setLatLong(location);
    });

    TestModule.wifilist.loadWifiList(async (wifiStringList) => {
      var wifiArray = await JSON.parse(wifiStringList);
      if (wifiArray !== undefined) {
        setAvailableConnection(wifiArray);
      }
      console.log("TCL: App -> wifiArray", wifiArray)
    },
      (error) => {
        console.log(error);
      }
    );
  }, []);

  return (

    <View style={{ margin: 10 }}>
      <Text>
        {"Device mac address: " + devicenMacAddress + "\n"}
      </Text>
      {latlong !== undefined
        ? <Text>
          {"latitude: " + latlong.latitude + " \nlongitude: " + latlong.longitude + " \ntime: " + latlong.time + "\n"}
        </Text>
        : <Text>Wait</Text>}

      {connectedTo !== "" && connectedTo.type === 'wifi'
        ? <View>
          <Text>{"connected type:   " + connectedTo.type}</Text>
          <Text>{"isConnected:   " + connectedTo.isConnected}</Text>
          <Text>{"isInternetReachable:   " + connectedTo.isInternetReachable}</Text>
          <Text>{"isWifiEnabled:   " + connectedTo.isWifiEnabled}</Text>

          <Text>{"bssid:   " + connectedTo.details.bssid}</Text>
          <Text>{"frequency:   " + connectedTo.details.frequency}</Text>
          <Text>{"ipAddress:   " + connectedTo.details.ipAddress}</Text>
          <Text>{"isConnectionExpensive:   " + connectedTo.details.isConnectionExpensive}</Text>
          <Text>{"ssid:   " + connectedTo.details.ssid}</Text>
          <Text>{"strength:   " + connectedTo.details.strength}</Text>
          <Text>{"subnet:   " + connectedTo.details.bssid + "\n"}</Text>
        </View>

        : connectedTo !== "" && connectedTo.type === 'cellular'
          ? <View>
            <Text>{"connected to:   " + connectedTo.type}</Text>

            <Text>{"carrier:   " + connectedTo.details.carrier}</Text>
            <Text>{"cellularGeneration:   " + connectedTo.details.cellularGeneration}</Text>
            <Text>{"isConnectionExpensive:   " + connectedTo.details.isConnectionExpensive + "\n"}</Text>


            <Text>{"List of device connected to mobile hotspot:\n"}</Text>
            <Text style={{ fontSize: 12 }}>{connectedDeviceInfo}</Text>
          </View>
          : <Text>no connection found</Text>}

      <Text>{"Available wifi Connection:\n"}</Text>
      {availableConnection.length > 0
        ? availableConnection.map((list, i) => {
          return (
            <View key={i}>
              <Text>{"BSSID:  " + list.BSSID}</Text>
              <Text>{"SSID:   " + list.SSID}</Text>
              <Text>{"capabilities:   " + list.capabilities}</Text>
              <Text>{"frequency:  " + list.frequency}</Text>
              <Text>{"level:  " + list.level}</Text>
              <Text>{"timestamp:  " + list.timestamp + "\n"}</Text>
            </View>
          )
        })

        : <Text>No connection available</Text>}

    </View>
  );
};


export default App;
