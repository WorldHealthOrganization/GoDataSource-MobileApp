/**
 * Created by florinpopa on 19/07/2018.
 */
import url from './../utils/url';
import {handleResponse} from './../utils/functions';

export function getFollowUpsForOutbreakIdRequest(outbreakId, filter, token, callback) {
    let requestUrl = url.outbreaks + outbreakId + '/follow-ups';

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
            console.log('### getFollowUpsForOutbreakId resposne: ', response);
            callback(null, response);
        })
        .catch((error) => {
            console.log("*** getFollowUpsForOutbreakId error: ", error);
            callback(error);
        })
}