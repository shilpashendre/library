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
  ScrollView
} from 'react-native';
import wifidetails from './wificonnection/index';
import NativeCalls from './NativeCalls'; 

const App = () => {
  const [devicename, setDevieName] = useState("");
  const [devicenMacAddress, setDevieMacAddress] = useState("");
  const [latlong, setLatLong] = useState("");
  const [connectedTo, setConnectedTo] = useState("");
  const [connectedDeviceInfo, setConnectedDeviceInfo] = useState('');
  const [availableConnection, setAvailableConnection] = useState([]);

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
    NativeCalls.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    })
      .then(async location => {
        setLatLong({ location })
      }).catch(error => {
        const { code, message } = error;
        console.warn(code, message);
      });
    NativeCalls.getDeviceName((err, name) => {
      setDevieName(name);
    });

    NativeCalls.getMacAddress((err, deviceMacAddress) => {
      setDevieMacAddress(deviceMacAddress);
    });

    NativeCalls.getClientList((err, clientList) => {
      setConnectedDeviceInfo(clientList);

    });
    NativeCalls.loadWifiList(async (wifiStringList) => {
      var wifiArray = await JSON.parse(wifiStringList);
      setAvailableConnection(wifiArray);

    },
      (error) => {
        console.log(error);
      })

    wifidetails.fetch().then(connection => {
      if (connection !== undefined) {
        setConnectedTo(connection)
      }
    });
  }, []);

  return (
    <ScrollView>
      <View style={{ margin: 10 }}>
        <Text>
          {"Device name: " + devicename + "\n"}
        </Text>

        <Text>
          {"Device mac address: " + devicenMacAddress + "\n"}
        </Text>
        {latlong.location !== undefined
          ? <Text>
            {"latitude: " + latlong.location.latitude + " \nlongitude: " + latlong.location.longitude + " \ntime: " + latlong.location.time + "\n"}
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

        <Text >{"Available wifi Connection:\n"}</Text>
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
    </ScrollView>
  );
};


export default App;
