/**
 * Created by florinpopa on 20/07/2018.
 */
import url from './../utils/url';
import {handleResponse} from './../utils/functions';

export function getContactsForOutbreakIdRequest(outbreakId, token, callback) {
    let requestUrl = url.outbreaks + outbreakId + '/contacts';

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