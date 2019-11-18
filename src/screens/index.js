/**
 * Created by florinpopa on 14/06/2018.
 */
import { Navigation } from 'react-native-navigation';
import constants from './../utils/constants';

import LoginScreen from './LoginScreen';
import FirstConfigScreen from './FirstConfigScreen';
import ManualConfigScreen from './ManualConfigScreen';
import NavigationDrawer from './NavigationDrawer';
import FollowUpsScreen from './FollowUpsScreen';
import AddFollowUpScreen from './AddFollowUpScreen';
import GenerateFollowUpScreen from './GenerateFollowUpScreen';
import FilterScreen from './FilterScreen';
import FollowUpsSingleScreen from './FollowUpsSingleScreen';
import CasesScreen from './CasesScreen';
import CaseSingleScreen from './CaseSingleScreen';
import ContactsScreen from './ContactsScreen';
import ContactsSingleScreen from './ContactsSingleScreen';
import InAppNotificationScreen from './InAppNotificationScreen';
import ExposureScreen from './ExposureScreen';
import HelpScreen from './HelpScreen';
import HelpSingleScreen from './HelpSingleScreen';
import QRScanScreen from './QRScanScreen';
import HubConfigScreen from './HubConfigScreen';
import ViewEditScreen from './viewEditScreen/ViewEditScreen';

const screens = [
    {screen: constants.appScreens.loginScreen, component: LoginScreen},
    {screen: constants.appScreens.firstConfigScreen, component: FirstConfigScreen},
    {screen: constants.appScreens.manualConfigScreen, component: ManualConfigScreen},
    {screen: constants.appScreens.navigationDrawer, component: NavigationDrawer},
    {screen: constants.appScreens.followUpScreen, component: FollowUpsScreen},
    {screen: constants.appScreens.addFollowUpScreen, component: AddFollowUpScreen},
    {screen: constants.appScreens.generateFollowUpsScreen, component: GenerateFollowUpScreen},
    {screen: constants.appScreens.filterScreen, component: FilterScreen},
    {screen: constants.appScreens.followUpSingleScreen, component: FollowUpsSingleScreen},
    {screen: constants.appScreens.casesScreen, component: CasesScreen},
    {screen: constants.appScreens.caseSingleScreen, component: CaseSingleScreen},
    {screen: constants.appScreens.contactsScreen, component: ContactsScreen},
    {screen: constants.appScreens.contactSingleScreen, component: ContactsSingleScreen},
    {screen: constants.appScreens.inAppNotificationScreen, component: InAppNotificationScreen},
    {screen: constants.appScreens.exposureScreen, component: ExposureScreen},
    {screen: constants.appScreens.helpScreen, component: HelpScreen},
    {screen: constants.appScreens.helpSingleScreen, component: HelpSingleScreen},
    {screen: constants.appScreens.qrScanScreen, component: QRScanScreen},
    {screen: constants.appScreens.hubConfigScreen, component: HubConfigScreen},
    {screen: constants.appScreens.viewEditScreen, component: ViewEditScreen},
];

export function registerScreens(store, Provider) {
    screens.forEach((screen) => {
        Navigation.registerComponent(screen.screen, () => screen.component, store, Provider);
    })
}