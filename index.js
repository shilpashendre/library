/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

import wifidetails from './wificonnection/index';
import NativeCalls from './NativeCalls';


export default { wifidetails, NativeCalls }
AppRegistry.registerComponent(appName, () => App);
