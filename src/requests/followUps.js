/**
 * Created by florinpopa on 19/07/2018.
 */
import url from './../utils/url';
import {handleResponse} from './../utils/functions';

export function getFollowUpsForOutbreakIdRequest(outbreakId, filter, token, callback) {
    let requestUrl = url.outbreaks + outbreakId + '/follow-ups';

    if (filter) {
        requestUrl += '?filter=' + JSON.stringify(filter);
    } else {
        let auxFilter = {};
        auxFilter.where = {};
        auxFilter.where.and = [];

        let oneDay = 24 * 60 * 60 * 1000;
        let today = new Date().getTime();

        auxFilter.where.and.push({date: {gt: new Date(today - oneDay)}});
        auxFilter.where.and.push({date: {lt: new Date(today + oneDay)}});

        requestUrl += '?filter=' + JSON.stringify(auxFilter);
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
            console.log('### getFollowUpsForOutbreakId resposne: ', response);
            callback(null, response);
        })
        .catch((error) => {
            console.log("*** getFollowUpsForOutbreakId error: ", error);
            callback(error);
        })
}

export function getMissedFollowUpsForOutbreakIdRequest(outbreakId, filter, token, callback) {
    let requestUrl = url.outbreaks + outbreakId + '/follow-ups/latest-by-contacts-if-not-performed';

    if (filter) {
        requestUrl += '?filter=' + JSON.stringify(filter);
    } else {
        let auxFilter = {};
        auxFilter.where = {};
        auxFilter.where.and = [];

        let oneDay = 24 * 60 * 60 * 1000;
        let today = new Date().getTime();

        auxFilter.where.and.push({date: {gt: new Date(today - oneDay)}});
        auxFilter.where.and.push({date: {lt: new Date(today + oneDay)}});

        requestUrl += '?filter=' + JSON.stringify(auxFilter);
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
            console.log('### getFollowUpsForOutbreakId resposne: ', response);
            callback(null, response);
        })
        .catch((error) => {
            console.log("*** getFollowUpsForOutbreakId error: ", error);
            callback(error);
        })
}