/**
 * Created by florinpopa on 19/07/2018.
 */


// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
import {ACTION_TYPE_GET_CASES, ACTION_TYPE_STORE_CASES} from './../utils/enums';
import {getCasesForOutbreakIdRequest, deleteCaseRequest} from './../requests/cases';
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

export function getCasesForOutbreakId(outbreakId, filter, token) {
    return async function (dispatch, getState) {
        getCasesForOutbreakIdRequest(outbreakId, filter, token, (error, response) => {
            if (error) {
                console.log("*** getCasesForOutbreakId error: ", error);
                dispatch(addError(errorTypes.ERROR_CASES));
            }
            if (response) {
                dispatch(storeCases(response));
            }
        })
    }
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