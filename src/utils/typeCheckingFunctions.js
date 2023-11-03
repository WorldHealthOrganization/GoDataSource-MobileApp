import constants from './constants';
import lodashIsObject from 'lodash/isObject';
import isFct from 'lodash/isFunction';

export function isPromise(obj) {
    return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

export function isFunction(fct) {
    return fct && isFct(fct)
}

export function checkArrayAndLength(array) {
    return checkArray(array) && array.length > 0;
}

export function checkArray(array) {
    return array && Array.isArray(array);
}

export function checkObject(object) {
    return lodashIsObject(object);
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));


export async function retriablePromise (promise, numberOfRetries, timeout, error) {
    // if (!isPromise(promise)) {
    //     throw new Error('Wrong input function Promise');
    // }
    if (!checkInteger(numberOfRetries)) {
        throw new Error('Wrong input function numberOfRetries');
    }
    if (numberOfRetries === 0) {
        if (error) {
            return Promise.reject(error);
        }
        return Promise.reject(`The request failed multiple times${error ? `.\n${JSON.stringify(error)}` : ` without error message`}`);
    }
    if (!checkInteger(timeout)) {
        timeout = constants.TIMEOUT_FOR_FETCH_BLOB;
    }

    try {
        let response = isPromise(promise) ? await promise : await promise();
        return Promise.resolve(response)
    } catch (e) {
        let {Platform} = require('react-native');

        if (Platform.OS === 'ios') {
            await wait(timeout);
        }

        return retriablePromise(promise, numberOfRetries - 1, timeout, e);
    }
}

export function fetchWitTimeout (url, config) {
    let timeout = 8000;
    if (!url || typeof url !== 'string') {
        return Promise.reject('Invalid url');
    }

    // assign a default value of 20 seconds
    if (!config || !lodashIsObject(config)) {
        return Promise.reject('Invalid config')
    }

    if (config.timeout) {
        timeout = config.timeout;
        delete config.timeout;
    }

    const delay = (timeout, error) => {
        return new Promise((resolve, reject) => setTimeout(() => reject(error), timeout)
        )};

    return Promise.race([
        fetch(url, config),
        delay(timeout, 'Timeout error')
    ])
        .catch((errorTimeout) => {
            return Promise.reject(errorTimeout);
        })
}

export function checkInteger(integer) {
    return Number.isInteger(integer);
}

export function checkValidEmails (arrayToCheck, pathToObject) {
    let invalidEmails = [];
    if (checkArrayAndLength(arrayToCheck)) {
        for (let i = 0; i < arrayToCheck.length; i++) {
            let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (!re.test(arrayToCheck?.[i]?.[pathToObject])) {
                invalidEmails.push(arrayToCheck?.[i]?.[pathToObject]);
            }
        }
    }
    return invalidEmails;
}