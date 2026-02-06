import 'react-native-get-random-values';
import { AppRegistry } from 'react-native';
import Root from './src/Root';
import { name as appName } from './app.json';

console.log('Index file loaded (Old Architecture, no RNN)');

AppRegistry.registerComponent(appName, () => Root);
