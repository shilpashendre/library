/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
<<<<<<< HEAD
=======
import wifidetails from './wificonnection/index';
import Location from './Location/index';
import DeviceDetail from './device/index';
import wifilist from './wifilist/index';

async function getWifi() {
    let connection = "";
    await wifidetails.fetch().then(conn => {
        if (conn !== undefined) {
            connection = conn;
        }
    });
    return connection;
}


async function getLocation() {
    let location = "";
    await Location.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 })
        .then(loc => {
            location = loc;
        }).catch(err => {
            console.log("TCL: getLocation -> err", err)

        })
    return location;
}

async function getAddress() {
    let device = "";
    await DeviceDetail.getMacAddress().then(res => {
        device = res;
    });
    return device;
}


export default { getWifi, getLocation, getAddress, wifilist }
>>>>>>> f433a3ea57e522866c118881266afa50fa4cc2e8

import wifidetails from './wificonnection/index';
import NativeCalls from './NativeCalls';


export default { wifidetails, NativeCalls }
AppRegistry.registerComponent(appName, () => App);
