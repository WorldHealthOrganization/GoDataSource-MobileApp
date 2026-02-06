import constants from '../utils/constants';

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
import UsersScreen from "./UsersScreen";
import LabResultsScreen from "./LabResultsScreen";
import LabResultsSingleScreen from "./LabResultsSingleScreen";

export const screenMap = {
  [constants.appScreens.loginScreen]: LoginScreen,
  [constants.appScreens.firstConfigScreen]: FirstConfigScreen,
  [constants.appScreens.manualConfigScreen]: ManualConfigScreen,
  [constants.appScreens.navigationDrawer]: NavigationDrawer,
  [constants.appScreens.followUpScreen]: FollowUpsScreen,
  [constants.appScreens.addFollowUpScreen]: AddFollowUpScreen,
  [constants.appScreens.filterScreen]: FilterScreen,
  [constants.appScreens.followUpSingleScreen]: FollowUpsSingleScreen,
  [constants.appScreens.casesScreen]: CasesScreen,
  [constants.appScreens.caseSingleScreen]: CaseSingleScreen,
  [constants.appScreens.eventsScreen]: EventsScreen,
  [constants.appScreens.eventSingleScreen]: EventSingleScreen,
  [constants.appScreens.contactsScreen]: ContactsScreen,
  [constants.appScreens.contactSingleScreen]: ContactsSingleScreen,
  [constants.appScreens.contactsOfContactsScreen]: ContactsOfContactsScreen,
  [constants.appScreens.contactsOfContactsSingleScreen]: ContactsOfContactsSingleScreen,
  [constants.appScreens.labResultsScreen]: LabResultsScreen,
  [constants.appScreens.labResultsSingleScreen]: LabResultsSingleScreen,
  [constants.appScreens.inAppNotificationScreen]: InAppNotificationScreen,
  [constants.appScreens.exposureScreen]: RelationshipScreen,
  [constants.appScreens.helpScreen]: HelpScreen,
  [constants.appScreens.helpSingleScreen]: HelpSingleScreen,
  [constants.appScreens.qrScanScreen]: QRScanScreen,
  [constants.appScreens.hubConfigScreen]: HubConfigScreen,
  [constants.appScreens.usersScreen]: UsersScreen,
};
