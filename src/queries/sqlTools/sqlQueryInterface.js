import get from 'lodash/get';
import set from 'lodash/set';
import lodash from 'lodash';

// Receives an object, , returns an object with the raw string and the array of parameters
export function queryBuilder(queryObject) {
    let returnedObject = {
        queryString: 'SELECT',
        arrayParameters: []
    };



    return returnedObject;
}