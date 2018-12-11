/**
 * Created by mobileclarisoft on 05/12/2018.
 */
import url from './../utils/url';
import {handleResponse} from './../utils/functions';

export function getHelpRequest(token,callback) {
    let requestUrl = url.getHelpItemsUrl();

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
            console.log('### getHelpRequest response: ', response);
            callback(null, response);
        })
        .catch((error) => {
            console.log("*** getHelpRequest error: ", JSON.stringify(error));
            callback(error);
        })
}