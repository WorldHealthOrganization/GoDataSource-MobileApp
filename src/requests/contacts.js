/**
 * Created by florinpopa on 20/07/2018.
 */
import url from './../utils/url';
import {handleResponse} from './../utils/functions';

export function getContactsForOutbreakIdRequest(outbreakId, token, callback) {

    let filter = {
        include: {
            relation: 'relationships'
        }
    };

    let requestUrl = url.outbreaks + outbreakId + '/contacts?filter=' + JSON.stringify(filter);

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

export function updateContactRequest(outbreakId, contactId, contact, token, callback) {
    let requestUrl = url.outbreaks + outbreakId + '/contacts/' + contactId;

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