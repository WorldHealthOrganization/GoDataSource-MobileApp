import {
    ACTION_TYPE_STORE_EXPOSURES,
    ACTION_TYPE_ADD_EXPOSURE,
    ACTION_TYPE_REMOVE_EXPOSURE,
    ACTION_TYPE_UPDATE_EXPOSURE
} from './../utils/enums';
import { getCasesForOutbreakIdRequest } from './../queries/cases';
import { storeCases } from './cases';
import { addError } from './errors';
import errorTypes from './../utils/errorTypes';
import {insertOrUpdate} from './../queries/sqlTools/helperMethods';

export function storeExposures(exposures) {
    return {
        type: ACTION_TYPE_STORE_EXPOSURES,
        payload: exposures
    }
}

export function addExposure(exposure) {
    return {
        type: ACTION_TYPE_ADD_EXPOSURE,
        payload: exposure
    }
}

export function updateExposure(exposure) {
    return {
        type: ACTION_TYPE_UPDATE_EXPOSURE,
        payload: exposure
    }
}

export function removeExposure(exposure) {
    return {
        type: ACTION_TYPE_REMOVE_EXPOSURE,
        payload: exposure
    }
}

export function getExposuresForOutbreakIdWithPromise(outbreakId, filter, alsoStoreCases, token, dispatch) {
    return new Promise((resolve, reject) => {
        getCasesForOutbreakIdRequest(outbreakId, filter, token, (error, response) => {
            if (error) {
                console.log("*** getExposuresForOutbreakIdWithPromise getCasesForOutbreakIdRequest error: ", error);
                dispatch(addError(errorTypes.ERROR_EXPOSURES));
                reject(error);
            }
            if (response) {
                dispatch(storeExposures(response));
                if (alsoStoreCases === true) {
                    // dispatch(storeCases(response));
                }
                resolve('Done exposures');
            }
        })
    })
}

export function insertOrUpdateExposure(exposure) {
    return insertOrUpdate('common', 'relationship', [exposure], true);
}