/**
 * Created by florinpopa on 14/06/2018.
 */
import { Navigation } from 'react-native-navigation';
import { COLOR, ThemeContext, getTheme } from 'react-native-material-ui';

import LoginScreen from './LoginScreen';
import FirstConfigScreen from './FirstConfigScreen';
import ManualConfigScreen from './ManualConfigScreen';
import NavigationDrawer from './NavigationDrawer';
import FollowUpsScreen from './FollowUpsScreen';
import AddFollowUpScreen from './AddFollowUpScreen';
import FollowUpsFilterScreen from './FollowUpsFilterScreen';
import FollowUpsSingleScreen from './FollowUpsSingleScreen';
import CasesScreen from './CasesScreen';
import CasesFilterScreen from './CasesFilterScreen';
import CaseSingleScreen from './CaseSingleScreen';
import ContactsScreen from './ContactsScreen';
import ContactsSingleScreen from './ContactsSingleScreen';
import InAppNotificationScreen from './InAppNotificationScreen';
import ExposureScreen from './ExposureScreen';
import MapScreen from './MapScreen';
import QRScanScreen from './QRScanScreen';

const screens = [
    {screen: 'LoginScreen', component: LoginScreen},
    {screen: 'FirstConfigScreen', component: FirstConfigScreen},
    {screen: 'ManualConfigScreen', component: ManualConfigScreen},
    {screen: 'NavigationDrawer', component: NavigationDrawer},
    {screen: 'FollowUpsScreen', component: FollowUpsScreen},
    {screen: 'AddFollowUpScreen', component: AddFollowUpScreen},
    {screen: 'FollowUpsFilterScreen', component: FollowUpsFilterScreen},
    {screen: 'FollowUpsSingleScreen', component: FollowUpsSingleScreen},
    {screen: 'CasesScreen', component: CasesScreen},
    {screen: 'CasesFilterScreen', component: CasesFilterScreen},
    {screen: 'CaseSingleScreen', component: CaseSingleScreen},
    {screen: 'ContactsScreen', component: ContactsScreen},
    {screen: 'ContactsSingleScreen', component: ContactsSingleScreen},
    {screen: 'InAppNotificationScreen', component: InAppNotificationScreen},
    {screen: 'ExposureScreen', component: ExposureScreen},
    {screen: 'MapScreen', component: MapScreen},
    {screen: 'QRScanScreen', component: QRScanScreen}
];

export function registerScreens(store, Provider) {
    screens.forEach((screen) => {
        Navigation.registerComponent(screen.screen, () => screen.component, store, Provider);
    })
}