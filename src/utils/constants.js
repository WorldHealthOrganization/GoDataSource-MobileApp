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

const PERMISSIONS_CONTACT = {
    contactAll: 'contact_all',
    contactView: 'contact_view',
    contactList: 'contact_list',
    contactCreate: 'contact_create',
    contactModify: 'contact_modify',
    contactDelete: 'contact_delete',
    contactListRelationshipContacts: 'contact_list_relationship_contacts',
    contactViewRelationshipContacts: 'contact_view_relationship_contacts',
    contactCreateRelationshipContacts: 'contact_create_relationship_contacts',
    contactModifyRelationshipContacts: 'contact_modify_relationship_contacts',
    contactDeleteRelationshipContact: 'contact_delete_relationship_contacts',
    contactListRelationshipExposures: 'contact_list_relationship_exposures',
    contactViewRelationshipExposures: 'contact_view_relationship_exposures',
    contactCreateRelationshipExposures: 'contact_create_relationship_exposures',
    contactModifyRelationshipExposures: 'contact_modify_relationship_exposures',
    contactDeleteRelationshipExposures: 'contact_delete_relationship_exposures',
};

const PERMISSIONS_CASE = {
    caseAll: 'case_all',
    caseView: 'case_view',
    caseList: 'case_list',
    caseCreate: 'case_create',
    caseModify: 'case_modify',
    caseDelete: 'case_delete',
    caseCreateContact: 'case_create_contact',
    caseListRelationshipContacts: 'case_list_relationship_contacts',
    caseViewRelationshipContacts: 'case_view_relationship_contacts',
    caseCreateRelationshipContacts: 'case_create_relationship_contacts',
    caseModifyRelationshipContacts: 'case_modify_relationship_contacts',
    caseDeleteRelationshipContacts: 'case_delete_relationship_contacts',
    caseListRelationshipExposures: 'case_list_relationship_exposures',
    caseViewRelationshipExposures: 'case_view_relationship_exposures',
    caseCreateRelationshipExposures: 'case_create_relationship_exposures',
    caseModifyRelationshipExposures: 'case_modify_relationship_exposures',
    caseDeleteRelationshipExposures: 'case_delete_relationship_exposures',
};

const PERMISSIONS_FOLLOW_UP = {
    followUpAll: 'follow_up_all',
    followUpView: 'follow_up_view',
    followUpList: 'follow_up_list',
    followUpCreate: 'follow_up_create',
    followUpsModify: 'follow_up_modify',
    followUpDelete: 'follow_up_delete'
};

const PERMISSIONS_USER = {
    userAll: 'user_all',
    userView: 'user_view',
    userList: 'user_list'
};

const PERMISSIONS_RELATIONSHIP = {
    relationshipAll: 'relationship_all',
    relationshipView: 'relationship_view',
    relationshipList: 'relationship_list',
    relationshipCreate: 'relationship_create',
    relationshipModify: 'relationship_modify',
    relationshipDelete: 'relationship_delete'
};

const PERMISSIONS_HELP = {
    helpAll: 'help_all',
    helpViewCategory: 'help_view_category',
    helpListCategory: 'help_list_category',
    helpViewCategoryItem: 'help_view_category_item',
    helpListCategoryItem: 'help_list_category_item'
};

const PERMISSIONS_COMMON = {
    outbreakView: 'outbreak_view',
    locationList: 'location_list'
};

export default {
    appScreens,
    NUMBER_OF_RETRIES,
    TIMEOUT_FOR_FETCH_BLOB,
    DATABASE_LOCATIONS,
    FILES_LOCATIONS,
    CHUNK_SIZE_TOOLTIP,
    PERMISSIONS_CONTACT,
    PERMISSIONS_CASE,
    PERMISSIONS_FOLLOW_UP,
    PERMISSIONS_RELATIONSHIP,
    PERMISSIONS_USER,
    PERMISSIONS_HELP,
    PERMISSIONS_COMMON
}