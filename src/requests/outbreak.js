/**
 * Created by florinpopa on 19/07/2018.
 */
import url from './../utils/url';
import {handleResponse} from './../utils/functions';

export function getOutbreakByIdRequest(outbreakId, token, callback) {
    let requestUrl = url.getOutbreaksUrl() + outbreakId;

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
            console.log('### getOutbreakByIdRequest resposne: ', response);
            callback(null, response);
        })
        .catch((error) => {
            console.log("*** getOutbreakByIdRequest error: ", error);
            callback(error);
        })
}