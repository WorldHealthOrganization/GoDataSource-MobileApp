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
    eventsScreen: 'EventsScreen',
    eventSingleScreen: 'EventSingleScreen',
    contactsScreen: 'ContactsScreen',
    labResultsScreen: 'LabResultsScreen',
    contactSingleScreen: 'ContactsSingleScreen',
    contactsOfContactsScreen: 'ContactsOfContactsScreen',
    contactsOfContactsSingleScreen: 'ContactsOfContactsSingleScreen',
    labResultsSingleScreen: 'LabResultsSingleScreen',
    exposureScreen: 'RelationshipScreen',
    helpScreen: 'HelpScreen',
    helpSingleScreen: 'HelpSingleScreen',
    qrScanScreen: 'QRScanScreen',
    hubConfigScreen: 'HubConfigScreen',
    viewEditScreen: 'ViewEditScreen',
    usersScreen: 'UsersScreen',
    generateFollowUpsScreen: 'GenerateFollowUpScreen',
    inAppNotificationScreen: 'InAppNotificationScreen'
};

const NUMBER_OF_RETRIES = 3;
const TIMEOUT_FOR_FETCH_BLOB = 500;

const DATABASE_LOCATIONS = `${RNFetchBlobFS.dirs.DocumentDir}/who_databases`;
const FILES_LOCATIONS = `${RNFetchBlobFS.dirs.DocumentDir}/who_files`;
const CHUNK_SIZE_TOOLTIP = 'Number of records per file in the sync process. A lower number will mean lower RAM consumption but a longer sync process. For slow devices use a lower number of records';

const PERMISSIONS_OUTBREAK = {
    allowRegistrationOfCoC: 'isContactsOfContactsActive'
}

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
    contactCreateContactOfContact: 'contact_create_contact_of_contact',
    contactModifyContactOfContact: 'contact_modify_contact_of_contact',
    contactDeleteContactOfContact: 'contact_delete_contact_of_contact'
};

export const PERMISSIONS_CONTACT_OF_CONTACT = {
    contactsOfContactsAll: 'contact_of_contact_all',
    contactsOfContactsView: 'contact_of_contact_view',
    contactsOfContactsList: 'contact_of_contact_list',
    contactsOfContactsCreate: 'contact_of_contact_create',
    contactsOfContactsModify: 'contact_of_contact_modify',
    contactsOfContactsDelete: 'contact_of_contact_delete',
    contactsOfContactsListRelationshipContacts: 'contact_of_contact_list_relationship_contacts',
    contactsOfContactsViewRelationshipContacts: 'contact_of_contact_view_relationship_contacts',
    contactsOfContactsCreateRelationshipContacts: 'contact_of_contact_create_relationship_contacts',
    contactsOfContactsModifyRelationshipContacts: 'contact_of_contact_modify_relationship_contacts',
    contactsOfContactsDeleteRelationshipContact: 'contact_of_contact_delete_relationship_contacts',
    contactsOfContactsListRelationshipExposures: 'contact_of_contact_list_relationship_exposures',
    contactsOfContactsViewRelationshipExposures: 'contact_of_contact_view_relationship_exposures',
    contactsOfContactsCreateRelationshipExposures: 'contact_of_contact_create_relationship_exposures',
    contactsOfContactsModifyRelationshipExposures: 'contact_of_contact_modify_relationship_exposures',
    contactsOfContactsDeleteRelationshipExposures: 'contact_of_contact_delete_relationship_exposures',
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

const PERMISSIONS_LAB_RESULT_CONSTANT = {
    labResultAll: 'lab_result_all',
    labResultView: 'lab_result_view',
    labResultList: 'lab_result_list',
    labResultCreate: 'lab_result_create',
    labResultModify: 'lab_result_modify',
    labResultDelete: 'lab_result_delete',
    labResultCreateContact: 'lab_result_create_contact',
    labResultListRelationshipContacts: 'lab_result_list_relationship_contacts',
    labResultViewRelationshipContacts: 'lab_result_view_relationship_contacts',
    labResultCreateRelationshipContacts: 'lab_result_create_relationship_contacts',
    labResultModifyRelationshipContacts: 'lab_result_modify_relationship_contacts',
    labResultDeleteRelationshipContacts: 'lab_result_delete_relationship_contacts',
};

let PERMISSIONS_LAB_RESULT = PERMISSIONS_LAB_RESULT_CONSTANT;

const PERMISSIONS_EVENT = {
    eventAll: 'event_all',
    eventView: 'event_view',
    eventList: 'event_list',
    eventCreate: 'event_create',
    eventModify: 'event_modify',
    eventDelete: 'event_delete',
    eventListRelationshipContacts: 'event_list_relationship_contacts',
    eventListRelationshipExposures: 'event_list_relationship_exposures'
}

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
    userList: 'user_list',
    userModifyOwnAccount: 'user_modify_own_account',
    userListForFilters: 'user_list_for_filters'
};

const PERMISSIONS_RELATIONSHIP = {
    relationshipAll: 'relationship_all',
    relationshipView: 'relationship_view',
    relationshipList: 'relationship_list',
    relationshipCreate: 'relationship_create',
    relationshipModify: 'relationship_modify',
    relationshipDelete: 'relationship_delete'
};

const RELATIONSHIP_TYPE = {
    exposure: 'relationship_exposure',
    contact: 'relationship_contact'
}

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

const PERMISSIONS_TEAMS = {
    teamAll: 'team_all',
    teamList: 'team_list'
};

export const PERMISSION_CREATE_CONTACT = [
    [PERMISSIONS_CONTACT.contactAll, PERMISSIONS_CASE.caseAll],
    [PERMISSIONS_CONTACT.contactAll, PERMISSIONS_CASE.caseCreateContact],
    [PERMISSIONS_CONTACT.contactCreate, PERMISSIONS_CASE.caseAll],
    [PERMISSIONS_CONTACT.contactCreate, PERMISSIONS_CASE.caseCreateContact]
];

export const PERMISSION_EDIT_CONTACT = [
    PERMISSIONS_CONTACT.contactAll,
    PERMISSIONS_CONTACT.contactModify
];

export const PERMISSION_CREATE_CONTACT_OF_CONTACT = [
    [PERMISSIONS_CONTACT_OF_CONTACT.contactsOfContactsAll, PERMISSIONS_CONTACT.contactAll],
    [PERMISSIONS_CONTACT_OF_CONTACT.contactsOfContactsAll, PERMISSIONS_CONTACT.contactCreateContactOfContact],
    [PERMISSIONS_CONTACT_OF_CONTACT.contactsOfContactsCreate, PERMISSIONS_CONTACT.contactAll],
    [PERMISSIONS_CONTACT_OF_CONTACT.contactsOfContactsCreate, PERMISSIONS_CONTACT.contactCreateContactOfContact],
];

export const PERMISSION_EDIT_CONTACT_OF_CONTACT = [
    PERMISSIONS_CONTACT_OF_CONTACT.contactsOfContactsAll,
    PERMISSIONS_CONTACT_OF_CONTACT.contactsOfContactsModify
];

export default {
    appScreens,
    NUMBER_OF_RETRIES,
    TIMEOUT_FOR_FETCH_BLOB,
    DATABASE_LOCATIONS,
    FILES_LOCATIONS,
    CHUNK_SIZE_TOOLTIP,
    PERMISSIONS_CONTACT,
    PERMISSIONS_OUTBREAK,
    PERMISSIONS_CASE,
    PERMISSIONS_FOLLOW_UP,
    PERMISSIONS_RELATIONSHIP,
    PERMISSIONS_USER,
    PERMISSIONS_HELP,
    PERMISSIONS_COMMON,
    PERMISSIONS_TEAMS,
    PERMISSIONS_LAB_RESULT,
    PERMISSIONS_LAB_RESULT_CONSTANT,
    RELATIONSHIP_TYPE,
    PERMISSIONS_EVENT
}