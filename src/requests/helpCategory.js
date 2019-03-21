import url from './../utils/url';
import {handleResponse} from './../utils/functions';

export function getHelpCategory(outbreakId, token, callback) {

    let filter = {
        include: {
            relation: 'relationships'
        }
    };

    let requestUrl = url.getOutbreaksUrl() + outbreakId + '/events?filter=' + JSON.stringify(filter);

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
            console.log('### getEventsForOutbreakIdRequest response: ', response);
            callback(null, response);
        })
        .catch((error) => {
            console.log("*** getEventsForOutbreakIdRequest error: ", error);
            callback(error);
        })
}