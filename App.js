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
import wifidetails from './wificonnection/index';


const App = () => {
  const [devicename, setDevieName] = useState("");
  const [devicenMacAddress, setDevieMacAddress] = useState("");
  const [latlong, setLatLong] = useState("");

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
    NativeModules.HelloManager.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    })
      .then(async location => {
        setLatLong({ location })
      }).catch(error => {
        const { code, message } = error;
        console.warn(code, message);
      });

  }, []);

  NativeModules.HelloManager.getDeviceName((err, name) => {
    setDevieName(name);
  });

  NativeModules.HelloManager.getMacAddress((err, deviceMacAddress) => {
    setDevieMacAddress(deviceMacAddress);
  });

  wifidetails.fetch().then(res => {
    console.log("TCL: App -> res", res)
  });


  return (

    <View>
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

    </View>
  );
};


export default App;
