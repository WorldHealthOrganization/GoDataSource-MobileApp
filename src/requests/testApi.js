/**
 * Created by florinpopa on 07/01/2019.
 */
import {handleResponse} from './../utils/functions';

export function testApi(testUrl, deviceInfo, callback) {
    fetch(testUrl, {
        method: 'GET',
        headers: {
            'device-info': deviceInfo,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
        .then((response) => {
            callback(null, response);
        })
        .catch((error) => {
            console.log("*** testApi error: ", error);
            callback(error);
        })
}


export function testApiPromise(testUrl, deviceInfo) {
    fetch(testUrl, {
        method: 'GET',
        headers: {
            'device-info': deviceInfo,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
        .then(handleResponse)
}