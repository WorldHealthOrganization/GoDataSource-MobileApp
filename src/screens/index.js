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
import GenerateFollowUpScreen from './GenerateFollowUpScreen';
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
import HelpScreen from './HelpScreen';
import HelpFilterScreen from './HelpFilterScreen';
import QRScanScreen from './QRScanScreen';
import HubConfigScreen from './HubConfigScreen';

const screens = [
    {screen: 'LoginScreen', component: LoginScreen},
    {screen: 'FirstConfigScreen', component: FirstConfigScreen},
    {screen: 'ManualConfigScreen', component: ManualConfigScreen},
    {screen: 'NavigationDrawer', component: NavigationDrawer},
    {screen: 'FollowUpsScreen', component: FollowUpsScreen},
    {screen: 'AddFollowUpScreen', component: AddFollowUpScreen},
    {screen: 'GenerateFollowUpScreen', component: GenerateFollowUpScreen},
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
    {screen: 'HelpScreen', component: HelpScreen},
    {screen: 'HelpFilterScreen', component: HelpFilterScreen},
    {screen: 'QRScanScreen', component: QRScanScreen},
    {screen: 'HubConfigScreen', component: HubConfigScreen}
];

export function registerScreens(store, Provider) {
    screens.forEach((screen) => {
        Navigation.registerComponent(screen.screen, () => screen.component, store, Provider);
    })
}