import { ACTION_TYPE_STORE_EXPOSURES } from './../utils/enums';
import { getCasesForOutbreakIdRequest } from './../queries/cases';
import { storeCases } from './cases';
import { addError } from './errors';
import errorTypes from './../utils/errorTypes';

export function storeExposures(exposures) {
    return {
        type: ACTION_TYPE_STORE_EXPOSURES,
        payload: exposures
    }
};

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
                    dispatch(storeCases(response));
                }
                resolve('Done exposures');
            }
        })
    })
};