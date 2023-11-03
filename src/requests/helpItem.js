import {handleResponse} from './../utils/functions';

    export function getHelpItemsRequest(requestUrl, authorization, filter, callback) {
    requestUrl = `${requestUrl}${filter ? `?filter=${JSON.stringify(filter)}` : ``}`;
    fetch(requestUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': authorization,
        }
    })
        .then((response) => {
            return handleResponse(response);
        })
        .then((response) => {
            console.log('### getHelpItemsRequest response: ', response);
            callback(null, response);
        })
        .catch((error) => {
            console.log("*** getHelpItemsRequest error: ", JSON.stringify(error));
            callback(error);
        })
}