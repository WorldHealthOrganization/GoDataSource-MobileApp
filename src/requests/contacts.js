/**
 * Created by florinpopa on 20/07/2018.
 */
import url from './../utils/url';
import {handleResponse} from './../utils/functions';
import config from './../utils/config';

export function getContactsForOutbreakIdRequest(outbreakId, filter, token, callback) {
    let requestUrl = url.getOutbreaksUrl() + outbreakId + '/contacts?filter=' + JSON.stringify(filter);

    fetch(requestUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token,
        }
    })
        .then((response) => {
            return handleResponse(response);
        })
        .then((response) => {
            console.log('### getContactsForOutbreakId response: ', response);
            callback(null, response);
        })
        .catch((error) => {
            console.log("*** getContactsForOutbreakId error: ", error);
            callback(error);
        })
}

export function getContactByIdRequest(outbreakId, contactId, token, callback) {

    let filter = config.defaultFilterForContacts;

    filter.where = {
        id: contactId
    };

    let requestUrl = url.getOutbreaksUrl() + outbreakId + '/contacts?filter=' + JSON.stringify(filter);

    fetch(requestUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token,
        }
    })
        .then((response) => {
            return handleResponse(response);
        })
        .then((response) => {
            console.log('### getContactByIdRequest response: ', response);
            callback(null, response[0]);
        })
        .catch((error) => {
            console.log("*** getContactByIdRequest error: ", error);
            callback(error);
        })
}

export function addContactRequest(outbreakId, contact, token, callback) {
    let requestUrl = url.getOutbreaksUrl() + outbreakId + '/contacts';

    fetch(requestUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token,
        },
        body: JSON.stringify(contact)
    })
        .then((response) => {
            return handleResponse(response);
        })
        .then((response) => {
            console.log('### addContactRequest response: ', response);
            callback(null, response);
        })
        .catch((error) => {
            console.log("*** addContactRequest error: ", error);
            callback(error);
        })
}

export function updateContactRequest(outbreakId, contactId, contact, token, callback) {
    let requestUrl = url.getOutbreaksUrl() + outbreakId + '/contacts/' + contactId;

    fetch(requestUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token,
        },
        body: JSON.stringify(contact)
    })
        .then((response) => {
            return handleResponse(response);
        })
        .then((response) => {
            console.log('### updateContact response: ', response);
            callback(null, response);
        })
        .catch((error) => {
            console.log("*** updateContact error: ", error);
            callback(error);
        })
}

export function addExposureForContactRequest(outbreakId, contactId, exposure, token, callback) {
    let requestUrl = url.getOutbreaksUrl() + outbreakId + '/contacts/' + contactId + '/relationships';

    fetch(requestUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token,
        },
        body: JSON.stringify(exposure)
    })
        .then((response) => {
            return handleResponse(response);
        })
        .then((response) => {
            console.log('### addExposureForContactRequest response: ', response);
            callback(null, response);
        })
        .catch((error) => {
            console.log("*** addExposureForContactRequest error: ", error);
            callback(error);
        })
}

export function updateExposureForContactRequest(outbreakId, contactId, exposure, token, callback) {
    let requestUrl = url.getOutbreaksUrl() + outbreakId + '/contacts/' + contactId + '/relationships/' + (exposure && exposure.id);

    fetch(requestUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token,
        },
        body: JSON.stringify(exposure)
    })
        .then((response) => {
            return handleResponse(response);
        })
        .then((response) => {
            console.log('### updateExposureForContactRequest response: ', response);
            callback(null, response);
        })
        .catch((error) => {
            console.log("*** updateExposureForContactRequest error: ", error);
            callback(error);
        })
}

export function deleteExposureForContactRequest(outbreakId, contactId, exposure, token, callback) {
    let requestUrl = url.getOutbreaksUrl() + outbreakId + '/contacts/' + contactId + '/relationships/' + (exposure && exposure.id);

    fetch(requestUrl, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token,
        }
    })
        .then((response) => {
            return handleResponse(response);
        })
        .then((response) => {
            console.log('### deleteExposureForContactRequest response: ', response);
            callback(null, response);
        })
        .catch((error) => {
            console.log("*** deleteExposureForContactRequest error: ", error);
            callback(error);
        })
}