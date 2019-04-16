import base64 from 'base-64';
import {handleResponse} from './../utils/functions';

export function checkDeviceStatus(url, installationId, clientId, clientSecret, callback) {
    if (url && installationId) {
        let requestUrl = `${url}/devices/find-by-physical-device-id/${installationId}`;

        fetch( encodeURI(requestUrl), {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + base64.encode(`${clientId}:${clientSecret}`),
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
                return handleResponse(response);
            })
            .then((response) => {
                console.log("*** checkDeviceStatus response: ", response);
                callback(null, response.status);
            })
            .catch((error) => {
                console.log("*** checkDeviceStatus error: ", error);
                callback(error);
            })
    }
};