/**
 * Created by florinpopa on 03/07/2018.
 */
import url from './../utils/url';
import {handleResponse} from './../utils/functions';

export function loginUserRequest(credentials, callback) {
    fetch(url.login, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(credentials)
    })
        .then((response) => {
            return handleResponse(response);
        })
        .then((response) => {
            callback(null, response);
        })
        .catch((error) => {
            console.log("*** loginUserRequest: ", error);
            callback(error);
        })
}

export function getUserByIdRequest(userId, token, callback) {

    // Here filter is used to include the roles. If there will be a need to get also the permissions, then should be added the following
    // "scope":{"include": "permissions"}
    let filter = {
        include: {relation: 'roles'}
    };

    let requestUrl = url.users + userId + '?filter=' + JSON.stringify(filter);

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
            console.log('### getUserByIdRequest resposne: ', response);
            callback(null, response);
        })
        .catch((error) => {
            console.log("*** getUserByIdRequest error: ", error);
            callback(error);
        })
}