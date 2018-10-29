/**
 * Created by florinpopa on 02/08/2018.
 */
import {ACTION_TYPE_STORE_REFERENCE_DATA} from './../utils/enums';
// import {getReferenceDataRequest} from './../requests/referenceData';
import {getReferenceDataRequest} from './../queries/referenceData';
import { addError } from './errors';
import errorTypes from './../utils/errorTypes';


// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
export function storeReferenceData(referenceData) {
    return {
        type: ACTION_TYPE_STORE_REFERENCE_DATA,
        payload: referenceData
    }
}

export function getReferenceData(token, dispatch) {
    // return async function (dispatch, getState) {
    return new Promise((resolve, reject) => {
        getReferenceDataRequest (null, (error, response) => {
            if (error) {
                console.log("*** getReferenceDataRequest error: ", error);
                dispatch(addError(errorTypes.ERROR_REFERENCE_DATA));
                reject(error);
            }
            if (response) {
                dispatch(storeReferenceData(response));
                resolve('Done referenceData');
            }
        })
    })
    // }
}