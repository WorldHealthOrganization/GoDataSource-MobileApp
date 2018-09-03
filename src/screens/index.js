/**
 * Created by florinpopa on 14/06/2018.
 */
import { Navigation } from 'react-native-navigation';
import { COLOR, ThemeContext, getTheme } from 'react-native-material-ui';
import hoistNonReactStatics from 'hoist-non-react-statics';

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
import SingleCaseScreen from './SingleCaseScreen';
import AddSingleCaseScreen from './AddSingleCaseScreen';
import ContactsScreen from './ContactsScreen';
import ContactsSingleScreen from './ContactsSingleScreen';
import ExposureScreen from './ExposureScreen';

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
    {screen: 'SingleCaseScreen', component: SingleCaseScreen},
    {screen: 'AddSingleCaseScreen', component: AddSingleCaseScreen},
    {screen: 'ContactsScreen', component: ContactsScreen},
    {screen: 'ContactsSingleScreen', component: ContactsSingleScreen},
    {screen: 'ExposureScreen', component: ExposureScreen}
];

export function registerScreens(store, Provider) {
    screens.forEach((screen) => {
        Navigation.registerComponent(screen.screen, () => screen.component, store, Provider);
    })
}