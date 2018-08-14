/**
 * Created by florinpopa on 06/08/2018.
 */
import url from './../utils/url';
import {handleResponse} from './../utils/functions';

export function getLocationsRequest(countries, token, callback) {

    let filter = {};

    if (countries && Array.isArray(countries) && countries.length > 0) {
        filter = {
            where: {
                name: {
                    inq: countries
                }
            }
        };
    }

    let requestUrl = url.getLocationsUrl() + '/hierarchical?filter=' + JSON.stringify(filter);

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
            console.log('### getLocationsRequest response: ', response);
            callback(null, response);
        })
        .catch((error) => {
            console.log("*** getLocationsRequest error: ", error);
            callback(error);
        })
}