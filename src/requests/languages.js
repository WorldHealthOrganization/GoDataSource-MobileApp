import {handleResponse} from './../utils/functions';

export function getAvailableLanguages(url, authorization) {
    return fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': authorization,
        }
    })
        .then(handleResponse)
        .then((response) => Promise.resolve(response.map((e) => Object.assign({}, {label: e.name, value: e.id}))))
        .catch((errorTestAPI) => {
            console.log('error test api', errorTestAPI);
            return Promise.reject(errorTestAPI);
        })
}