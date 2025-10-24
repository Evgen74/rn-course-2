import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';

// надо вызывать как можно раньше, чтобы стили были загружены до того, как будут использоваться
import './src/style/stylesheet';
import App from './App';

AppRegistry.registerComponent(appName, () => App);
