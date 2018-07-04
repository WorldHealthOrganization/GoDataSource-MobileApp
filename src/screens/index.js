/**
 * Created by florinpopa on 14/06/2018.
 */
import { Navigation } from 'react-native-navigation';
import { COLOR, ThemeContext, getTheme } from 'react-native-material-ui';
import hoistNonReactStatics from 'hoist-non-react-statics';

import LoginScreen from './LoginScreen';
import NavigationDrawer from './NavigationDrawer';
import FollowUpsScreen from './FollowUpsScreen';

const screens = [
    {screen: 'LoginScreen', component: LoginScreen},
    {screen: 'NavigationDrawer', component: NavigationDrawer},
    {screen: 'FollowUpsScreen', component: FollowUpsScreen}
];

export function registerScreens(store, Provider) {
    screens.forEach((screen) => {
        Navigation.registerComponent(screen.screen, () => screen.component, store, Provider);
    })
}