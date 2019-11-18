import constants from './constants';
import lodashIsObject from 'lodash/isObject';

export function isPromise(obj) {
    return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
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

export function retriablePromise (promise, numberOfRetries, timeout) {
    // console.log('retriablePromise: ', numberOfRetries);
    if (!isPromise(promise)) {
        throw new Error('Wrong input function Promise');
    }
    if (!checkInteger(numberOfRetries)) {
        throw new Error('Wrong input function numberOfRetries');
    }
    if (!checkInteger(timeout)) {
        timeout = constants.TIMEOUT_FOR_FETCH_BLOB;
    }
        return promise.catch((error) => {
            if (numberOfRetries === 1 || numberOfRetries < 0) {
                throw error;
            }
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve(retriablePromise(promise, numberOfRetries - 1));
                }, timeout)
            })
        })
}

export function checkInteger(integer) {
    return integer && Number.isInteger(integer);
}