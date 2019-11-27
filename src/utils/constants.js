import RNFetchBlobFS from 'rn-fetch-blob/fs';

const appScreens = {
    loginScreen: 'LoginScreen',
    firstConfigScreen: 'FirstConfigScreen',
    manualConfigScreen: 'ManualConfigScreen',
    navigationDrawer: 'NavigationDrawer',
    followUpScreen: 'FollowUpsScreen',
    addFollowUpScreen: 'AddFollowUpScreen',
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
    viewEditScreen: 'ViewEditScreen',

    generateFollowUpsScreen: 'GenerateFollowUpScreen',
    inAppNotificationScreen: 'InAppNotificationScreen'
};

const NUMBER_OF_RETRIES = 3;
const TIMEOUT_FOR_FETCH_BLOB = 500;

const DATABASE_LOCATIONS = `${RNFetchBlobFS.dirs.DocumentDir}/who_databases`;
const FILES_LOCATIONS = `${RNFetchBlobFS.dirs.DocumentDir}/who_files`;
const CHUNK_SIZE_TOOLTIP = 'Number of records per file in the sync process. A lower number will mean lower RAM consumption but a longer sync process. For slow devices use a lower number of records';


export default {
    appScreens,
    NUMBER_OF_RETRIES,
    TIMEOUT_FOR_FETCH_BLOB,
    DATABASE_LOCATIONS,
    FILES_LOCATIONS,
    CHUNK_SIZE_TOOLTIP
}