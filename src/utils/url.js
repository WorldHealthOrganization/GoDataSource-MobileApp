/**
 * Created by florinpopa on 14/06/2018.
 */
const DEFAULT_BASE_URL = 'http://whoapicd.clarisoft.com/api';

var baseUrl = DEFAULT_BASE_URL;

var users = getBaseUrl() + '/users/';
var login = users + 'login';
var outbreaks = getBaseUrl() + '/outbreaks/';
var referenceData = getBaseUrl() + '/reference-data';
var locations = getBaseUrl() + '/locations';

function getBaseUrl () {
    return baseUrl;
}

function setBaseUrl (newBaseUrl) {
    baseUrl = newBaseUrl || DEFAULT_BASE_URL;
}

function getUsersUrl () {
    return getBaseUrl() + '/users/';
}

function getLoginUrl () {
    return getUsersUrl() + 'login';
}

function getOutbreaksUrl () {
    return getBaseUrl() + '/outbreaks/';
}

function getReferenceDataUrl () {
    return getBaseUrl() + '/reference-data';
}

function getLocationsUrl () {
    return getBaseUrl() + '/locations';
}

function getHelpItemsUrl () {
    return getBaseUrl() + '/help-items';
}

function getHelpCategoryUrl () {
    return getBaseUrl() + '/help-categories';
};

function getLanguagesUrl () {
    return getBaseUrl() + '/languages';
}

function getSyncUrl () {
    return getBaseUrl() + '/sync';
}

function getDatabaseSnapshotUrl () {
    return getSyncUrl() + '/database-snapshot';
}

function postDatabaseSnapshot () {
    return getSyncUrl() + '/import-database-snapshot';
}

export default {
    getUsersUrl,
    getLoginUrl,
    getOutbreaksUrl,
    getReferenceDataUrl,
    getLocationsUrl,
    getLanguagesUrl,
    getBaseUrl,
    setBaseUrl,
    getHelpItemsUrl,
    getHelpCategoryUrl,
    getDatabaseSnapshotUrl,
    postDatabaseSnapshot
}