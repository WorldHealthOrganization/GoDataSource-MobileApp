import constants from './constants';

export function isPromise(obj) {
    return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

export function checkArrayAndLength(array) {
    return array && Array.isArray(array) && array.length > 0;
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