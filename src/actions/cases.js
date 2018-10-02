/**
 * Created by florinpopa on 19/07/2018.
 */


// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
import {ACTION_TYPE_GET_CASES, ACTION_TYPE_STORE_CASES} from './../utils/enums';
import {deleteCaseRequest} from './../requests/cases';
import {getCasesForOutbreakIdRequest} from './../queries/cases';
import { addError } from './errors';
import errorTypes from './../utils/errorTypes';
import config from './../utils/config';


// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
export function storeCases(cases) {
    return {
        type: ACTION_TYPE_STORE_CASES,
        payload: cases
    }
};

export function getCasesForOutbreakId(outbreakId, filter, token, dispatch) {
    // return async function (dispatch, getState) {
    return new Promise((resolve, reject) => {
        getCasesForOutbreakIdRequest(outbreakId, filter, token, (error, response) => {
            if (error) {
                console.log("*** getCasesForOutbreakId error: ", error);
                dispatch(addError(errorTypes.ERROR_CASES));
                reject(error);
            }
            if (response) {
                dispatch(storeCases(response));
                resolve('Done cases');
            }
        })
    })
    // }
};

export function deleteCase(outbreakId, caseId, filter, token) {
    return async function(dispatch, getState) {
        deleteCaseRequest(outbreakId, caseId, token, (error, response) => {
            if (error) {
                console.log("*** deleteCase error: ", error);
                dispatch(addError(errorTypes.ERROR_DELETE_CASE));
            }
            if (response) {
                dispatch(getCasesForOutbreakId(outbreakId, config.defaultFilterForCases, token));
            }
        })
    }
};