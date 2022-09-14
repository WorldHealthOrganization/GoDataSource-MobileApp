/**
 * Created by florinpopa on 14/06/2018.
 */
import {Navigation} from 'react-native-navigation';
import constants from './../utils/constants';
import LoginScreen from './LoginScreen';
import FirstConfigScreen from './FirstConfigScreen';
import ManualConfigScreen from './ManualConfigScreen';
import NavigationDrawer from './NavigationDrawer';
import FollowUpsScreen from './FollowUpsScreen';
import AddFollowUpScreen from './AddFollowUpScreen';
import FilterScreen from './FilterScreen';
import FollowUpsSingleScreen from './FollowUpsSingleScreen';
import CasesScreen from './CasesScreen';
import CaseSingleScreen from './CaseSingleScreen';
import EventsScreen from "./EventsScreen";
import EventSingleScreen from "./EventSingleScreen";
import ContactsScreen from './ContactsScreen';
import ContactsSingleScreen from './ContactsSingleScreen';
import ContactsOfContactsScreen from './ContactsOfContactsScreen';
import ContactsOfContactsSingleScreen from './ContactsOfContactsSingleScreen';
import InAppNotificationScreen from './InAppNotificationScreen';
import RelationshipScreen from './RelationshipScreen';
import HelpScreen from './HelpScreen';
import HelpSingleScreen from './HelpSingleScreen';
import QRScanScreen from './QRScanScreen';
import HubConfigScreen from './HubConfigScreen';
import UsersScreen  from "./UsersScreen";
import React from "react";
import LabResultsScreen from "./LabResultsScreen";
import LabResultsSingleScreen from "./LabResultsSingleScreen";

const screens = [
    {screen: constants.appScreens.loginScreen, component: LoginScreen},
    {screen: constants.appScreens.firstConfigScreen, component: FirstConfigScreen},
    {screen: constants.appScreens.manualConfigScreen, component: ManualConfigScreen},
    {screen: constants.appScreens.navigationDrawer, component: NavigationDrawer},
    {screen: constants.appScreens.followUpScreen, component: FollowUpsScreen},
    {screen: constants.appScreens.addFollowUpScreen, component: AddFollowUpScreen},
    {screen: constants.appScreens.filterScreen, component: FilterScreen},
    {screen: constants.appScreens.followUpSingleScreen, component: FollowUpsSingleScreen},
    {screen: constants.appScreens.casesScreen, component: CasesScreen},
    {screen: constants.appScreens.caseSingleScreen, component: CaseSingleScreen},
    {screen: constants.appScreens.eventsScreen, component: EventsScreen},
    {screen: constants.appScreens.eventSingleScreen, component: EventSingleScreen},
    {screen: constants.appScreens.contactsScreen, component: ContactsScreen},
    {screen: constants.appScreens.contactSingleScreen, component: ContactsSingleScreen},
    {screen: constants.appScreens.contactsOfContactsScreen, component: ContactsOfContactsScreen},
    {screen: constants.appScreens.contactsOfContactsSingleScreen, component: ContactsOfContactsSingleScreen},
    {screen: constants.appScreens.labResultsScreen, component: LabResultsScreen},
    {screen: constants.appScreens.labResultsSingleScreen, component: LabResultsSingleScreen},
    {screen: constants.appScreens.inAppNotificationScreen, component: InAppNotificationScreen},
    {screen: constants.appScreens.exposureScreen, component: RelationshipScreen},
    {screen: constants.appScreens.helpScreen, component: HelpScreen},
    {screen: constants.appScreens.helpSingleScreen, component: HelpSingleScreen},
    {screen: constants.appScreens.qrScanScreen, component: QRScanScreen},
    {screen: constants.appScreens.hubConfigScreen, component: HubConfigScreen},
    {screen: constants.appScreens.usersScreen, component: UsersScreen},
];

export function registerScreens(store, Provider) {
    screens.forEach((screen) => {
        Navigation.registerComponent(screen.screen,
            () => {
                if(store && Provider){
                    const Screen = screen.component;
                    console.log("Judge", screen.screen, Screen);
                    return (props)=>
                        <Provider store={store}>
                            <Screen {...props}/>
                        </Provider>
                } else {
                    return screen.component;
                }
            },
            ()=>screen.component);
    });
}