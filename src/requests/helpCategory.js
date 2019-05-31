import url from './../utils/url';
import {handleResponse} from './../utils/functions';

export function getHelpCategoriesRequest(requestUrl, authorization, filter, callback) {
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
            console.log('### getHelpCategoriesRequest response: ');
            callback(null, response);
        })
        .catch((error) => {
            console.log("*** getHelpCategoriesRequest error: ", JSON.stringify(error));
            callback(error);
        })
}