import base64 from 'base-64';
import {handleResponse} from './../utils/functions';
import {fetchWitTimeout, retriablePromise} from './../utils/typeCheckingFunctions';

export function checkDeviceStatus(url, installationId, clientId, clientSecret, callback) {
    if (url && installationId) {
        let requestUrl = `${url}/devices/find-by-physical-device-id/${installationId}`;

        retriablePromise(fetchWitTimeout.bind(null, encodeURI(requestUrl), {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + base64.encode(`${clientId}:${clientSecret}`),
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            timeout: 8000
        }),3, 100)
            .then((response) => {
                return handleResponse(response);
            })
            .then((response) => {
                // console.log("*** checkDeviceStatus response: ", response);
                callback(null, response && response.status ? response.status : null);
            })
            .catch((error) => {
                console.log("*** checkDeviceStatus error: ", error);
                callback(error);
            })
    }
};