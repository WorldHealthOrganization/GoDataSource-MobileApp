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


export async function retriablePromise (promise, numberOfRetries, timeout) {
    // if (!isPromise(promise)) {
    //     throw new Error('Wrong input function Promise');
    // }
    if (!checkInteger(numberOfRetries)) {
        throw new Error('Wrong input function numberOfRetries');
    }
    if (numberOfRetries === 0) {
        return Promise.reject('retries failed');
    }
    if (!checkInteger(timeout)) {
        timeout = constants.TIMEOUT_FOR_FETCH_BLOB;
    }

    try {
        let response = isPromise(promise) ? await promise : await promise();
        return Promise.resolve(response)
    } catch (error) {

        let {Platform} = require('react-native');

        if (Platform.OS === 'ios') {
            await wait(timeout);
        }

        return retriablePromise(promise, numberOfRetries - 1, timeout);
    }
}

export function fetchWitTimeout (url, config) {
    let timeout = 2000;
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