/**
 * Created by florinpopa on 14/06/2018.
 */
// ACTION TYPES
export const ACTION_TYPE_ROOT_CHANGE = 'ROOT_CHANGE';
export const ACTION_TYPE_STORE_USER_PERMISSIONS = 'ACTION_TYPE_STORE_USER_PERMISSIONS'
export const ACTION_TYPE_SAVE_SCREEN_SIZE = 'SAVE_SCREEN_SIZE';
export const ACTION_TYPE_SAVE_TRANSLATION = 'SAVE_TRANSLATION';
export const ACTION_TYPE_SAVE_HELP_CATEGORY = 'SAVE_HELP_CATEGORY';
export const ACTION_TYPE_SAVE_HELP_ITEM = 'SAVE_HELP_ITEM';
export const ACTION_TYPE_SAVE_AVAILABLE_LANGUAGES = 'SAVE_AVAILABLE_LANGUAGES';
export const ACTION_TYPE_SAVE_HUB_CONFIGURATION = 'SAVE_HUB_CONFIGURATION';
export const ACTION_TYPE_SAVE_ACTIVE_DATABASE = 'SAVE_ACTIVE_DATABASE';
export const ACTION_TYPE_SET_SYNC_STATE = 'SET_SYNC_STATE';
export const ACTION_TYPE_SET_LOGIN_STATE = 'SET_LOGIN_STATE';
export const ACTION_TYPE_REMOVE_FILTER_FOR_SCREEN = 'REMOVE_FILTER_FOR_SCREEN';
export const ACTION_TYPE_ADD_FILTER_FOR_SCREEN = 'ADD_FILTER_FOR_SCREEN';
export const ACTION_TYPE_LOGIN = 'LOGIN';
export const ACTION_TYPE_AFTER_LOGIN = 'AFTER_LOGIN';
export const ACTION_TYPE_STORE_USER = 'STORE_USER';
export const ACTION_TYPE_GET_FOLLOWUPS = 'GET_FOLLOWUPS';
export const ACTION_TYPE_STORE_FOLLOWUPS = 'STORE_FOLLOWUPS';
export const ACTION_TYPE_UPDATE_FOLLOWUP = 'UPDATE_FOLLOWUP';
export const ACTION_TYPE_DELETE_FOLLOWUP = 'DELETE_FOLLOWUP';
export const ACTION_TYPE_GET_CASES = 'GET_CASES';
export const ACTION_TYPE_STORE_CASES = 'STORE_CASES';
export const ACTION_TYPE_STORE_CONTACTS = 'STORE_CONTACTS';
export const ACTION_TYPE_STORE_HELP_CATEGORY = 'STORE_HELP_CATEGORY';
export const ACTION_TYPE_STORE_HELP_ITEM = 'STORE_HELP_ITEM';
export const ACTION_TYPE_UPDATE_CONTACT = 'UPDATE_CONTACT';
export const ACTION_TYPE_ADD_CONTACT = 'ADD_CONTACT';
export const ACTION_TYPE_ADD_CASE = 'ADD_CASE';
export const ACTION_TYPE_UPDATE_CASE = 'UPDATE_CASE';
export const ACTION_TYPE_STORE_EVENTS = 'STORE_EVENTS';
export const ACTION_TYPE_STORE_OUTBREAK = 'STORE_OUTBREAK';
export const ACTION_TYPE_STORE_REFERENCE_DATA = 'STORE_REFERENCE_DATA';
export const ACTION_TYPE_STORE_LOCATIONS = 'STORE_LOCATIONS';
export const ACTION_TYPE_ADD_ERROR = 'ADD_ERROR';
export const ACTION_TYPE_REMOVE_ERRORS = 'REMOVE_ERRORS';
export const ACTION_TYPE_REMOVE_CASE = 'REMOVE_CASE';
export const ACTION_TYPE_REMOVE_CONTACT = 'REMOVE_CONTACT';
export const ACTION_TYPE_SAVE_GENERATED_FOLLOWUPS = 'SAVE_GENERATED_FOLLOWUPS';
export const ACTION_TYPE_STORE_CLUSTERS = 'STORE_CLUSTERS';
export const ACTION_TYPE_STORE_USER_TEAMS = 'STORE_USER_TEAMS';
export const ACTION_TYPE_STORE_EXPOSURES = 'STORE_EXPOSURES';

// SQL query strings
export const DROP_TABLE_USER = 'DROP TABLE IF EXISTS User';
export const CREATE_TABLE_USER = 'CREATE TABLE IF NOT EXISTS User(' +
    'id TEXT PRIMARY KEY NOT NULL, ' +
    'firstName TEXT NOT NULL, ' +
    'lastName TEXT NOT NULL, ' +
    'roleIds TEXT NOT NULL, ' +
    'languageId TEXT NOT NULL, ' +
    'email TEXT NOT NULL,' +
    'deleted BOOLEAN NOT NULL DEFAULT 0, ' +
    'outbreakIds TEXT, ' +
    'activeOutbreakId TEXT, ' +
    'passwordChange BOOLEAN DEFAULT 1, ' +
    'securityQuestions TEXT, ' +
    'realm TEXT, ' +
    'username TEXT, ' +
    'emailVerified BOOLEAN DEFAULT 0, ' +
    'createdAt DATETIME, ' +
    'updatedAt DATETIME, ' +
    'updatedBy TEXT, ' +
    'deletedAt DATETIME)';