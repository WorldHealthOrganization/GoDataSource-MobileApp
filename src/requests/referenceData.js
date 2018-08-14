/**
 * Created by florinpopa on 02/08/2018.
 */
import url from './../utils/url';
import {handleResponse} from './../utils/functions';

export function getReferenceDataRequest(token, callback) {
    let requestUrl = url.getReferenceDataUrl();

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
            console.log('### getReferenceDataRequest response: ', response);
            callback(null, response);
        })
        .catch((error) => {
            console.log("*** getReferenceDataRequest error: ", JSON.stringify(error));
            callback(error);
        })
}