/**
 * Created by florinpopa on 19/07/2018.
 */
import url from './../utils/url';
import {handleResponse} from './../utils/functions';

export function getCasesForOutbreakIdRequest(outbreakId, filter, token, callback) {
    let requestUrl = url.getOutbreaksUrl() + outbreakId + '/cases';
    if (filter) {
        requestUrl += '?filter=' + JSON.stringify(filter);
    }
    
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
            console.log('### getCasesForOutbreakId response: ', response);
            callback(null, response);
        })
        .catch((error) => {
            console.log("*** getCasesForOutbreakId error: ", error);
            callback(error);
        })
};

export function deleteCaseRequest(outbreakId, caseId, token, callback) {
    let requestUrl = url.getOutbreaksUrl() + outbreakId + '/cases/' + caseId;

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
            console.log('### deleteCaseRequest response: ', response);
            callback(null, response);
        })
        .catch((error) => {
            console.log("*** deleteCaseRequest error: ", error);
            callback(error);
        })
};