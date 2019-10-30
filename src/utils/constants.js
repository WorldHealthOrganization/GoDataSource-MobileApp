import RNFetchBlobFS from 'rn-fetch-blob/fs';

const appScreens = {
    loginScreen: 'LoginScreen',
    firstConfigScreen: 'FirstConfigScreen',
    manualConfigScreen: 'ManualConfigScreen',
    navigationDrawer: 'NavigationDrawer',
    followUpScreen: 'FollowUpsScreen',
    addFollowUpScreen: 'AddFollowUpScreen',
    addSingleAnswerModalScreen: 'AddSingleAnswerModalScreen',
    filterScreen: 'FilterScreen',
    followUpSingleScreen: 'FollowUpsSingleScreen',
    casesScreen: 'CasesScreen',
    caseSingleScreen: 'CaseSingleScreen',
    contactsScreen: 'ContactsScreen',
    contactSingleScreen: 'ContactsSingleScreen',
    exposureScreen: 'ExposureScreen',
    helpScreen: 'HelpScreen',
    helpSingleScreen: 'HelpSingleScreen',
    qrScanScreen: 'QRScanScreen',
    hubConfigScreen: 'HubConfigScreen',
    previousAnswersScreen: 'PreviousAnswersScreen',
    viewEditScreen: 'ViewEditScreen',

    generateFollowUpsScreen: 'GenerateFollowUpScreen',
    inAppNotificationScreen: 'InAppNotificationScreen'
};

const NUMBER_OF_RETRIES = 3;
const TIMEOUT_FOR_FETCH_BLOB = 500;

const DATABASE_LOCATIONS = `${RNFetchBlobFS.dirs.DocumentDir}/who_databases`;
const FILES_LOCATIONS = `${RNFetchBlobFS.dirs.DocumentDir}/who_files`;


export default {
    appScreens,
    NUMBER_OF_RETRIES,
    TIMEOUT_FOR_FETCH_BLOB,
    DATABASE_LOCATIONS,
    FILES_LOCATIONS
}