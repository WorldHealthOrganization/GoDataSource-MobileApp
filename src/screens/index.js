/**
 * Created by florinpopa on 14/06/2018.
 */
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
    // Legacy RNN registration
    console.log("Screens registration skipped (React Navigation migration)");
}