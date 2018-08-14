/**
 * Created by florinpopa on 19/07/2018.
 */
import url from './../utils/url';
import {handleResponse} from './../utils/functions';

export function getFollowUpsForOutbreakIdRequest(outbreakId, filter, token, callback) {
    let requestUrl = url.getOutbreaksUrl() + outbreakId + '/follow-ups';

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
    let requestUrl = url.getOutbreaksUrl() + outbreakId + '/follow-ups/latest-by-contacts-if-not-performed';

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

export function updateFollowUpRequest(outbreakId, contactId, followUpId, followUp, token, callback) {
    let requestUrl = url.getOutbreaksUrl() + outbreakId + '/contacts/' + contactId + '/follow-ups/' + followUpId;

    fetch(requestUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token,
        },
        body: JSON.stringify(followUp)
    })
        .then((response) => {
            return handleResponse(response);
        })
        .then((response) => {
            console.log('### updateFollowUp resposne: ', response);
            callback(null, response);
        })
        .catch((error) => {
            console.log("*** updateFollowUp error: ", error);
            callback(error);
        })
}

export function addFollowUpRequest(outbreakId, contactId, followUp, token, callback) {
    let requestUrl = url.getOutbreaksUrl() + outbreakId + '/contacts/' + contactId + '/follow-ups';

    fetch(requestUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token,
        },
        body: JSON.stringify(followUp)
    })
        .then((response) => {
            return handleResponse(response);
        })
        .then((response) => {
            console.log('### addFollowUpRequest response: ', response);
            callback(null, response);
        })
        .catch((error) => {
            console.log("*** addFollowUpRequest error: ", error);
            callback(error);
        })
}

export function generateFollowUpRequest(outbreakId, followUpPeriod, token, callback) {
    let requestUrl = url.getOutbreaksUrl() + outbreakId + '/generate-followups';

    if (!followUpPeriod || typeof followUpPeriod !== 'number' || followUpPeriod <= 0) {
        followUpPeriod = 1;
    }

    let followUpPeriodObject = {
        followUpPeriod: followUpPeriod || 1
    };

    fetch(requestUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token,
        },
        body: JSON.stringify(followUpPeriodObject)
    })
        .then((response) => {
            return handleResponse(response);
        })
        .then((response) => {
            console.log('### generateFollowUpRequest response: ', response);
            callback(null, response);
        })
        .catch((error) => {
            console.log("*** generateFollowUpRequest error: ", error);
            callback(error);
        })
}

export function deleteFollowUpRequest(outbreakId, contactId, followUpId, token, callback) {
    let requestUrl = url.getOutbreaksUrl() + outbreakId + '/contacts/' + contactId + '/follow-ups/' + followUpId;

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
            console.log('### deleteFollowUpRequest response: ', response);
            callback(null, response);
        })
        .catch((error) => {
            console.log("*** deleteFollowUpRequest error: ", error);
            callback(error);
        })
}