/**
 * Created by florinpopa on 19/07/2018.
 */


// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
import { ACTION_TYPE_STORE_CASES,
    ACTION_TYPE_ADD_CASE,
    ACTION_TYPE_UPDATE_CASE} from './../utils/enums';
import {deleteCaseRequest} from './../requests/cases';
import {getCasesForOutbreakIdRequest, addCaseRequest, updateCaseRequest} from './../queries/cases';
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

export function addCaseAction(myCase) {
    return {
        type: ACTION_TYPE_ADD_CASE,
        payload: myCase
    }
}

export function updateCaseAction(myCase) {
    return {
        type: ACTION_TYPE_UPDATE_CASE,
        payload: myCase
    }
}

export function getCasesForOutbreakIdWithPromise(outbreakId, filter, token, dispatch) {
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

export function getCasesForOutbreakId(outbreakId, filter, token) {
    return async function (dispatch, getState) {
    // return new Promise((resolve, reject) => {
        getCasesForOutbreakIdRequest(outbreakId, filter, token, (error, response) => {
            if (error) {
                console.log("*** getCasesForOutbreakId error: ", error);
                dispatch(addError(errorTypes.ERROR_CASES));
                // reject(error);
            }
            if (response) {
                dispatch(storeCases(response));
                // resolve('Done cases');
            }
        })
    // })
    }
};

export function addCase(outbreakId, myCase, token) {
    console.log('addCase', JSON.stringify(myCase))
    return async function(dispatch, getState) {
        addCaseRequest(outbreakId, myCase, token, (error, response) => {
            if (error) {
                console.log("*** addCase error: ", error);
                dispatch(addError(errorTypes.ERROR_UPDATE_CASE));
            }
            if (response) {
                console.log("*** addCase response: ", JSON.stringify(response));
                dispatch(addCaseAction(response));
            }
        })
    }
};

export function updateCase (outbreakId, caseId, myCase, token) {
    console.log('updateCase', JSON.stringify(myCase))
    return async function(dispatch, getState) {
        updateCaseRequest(outbreakId, caseId, myCase, token, (error, response) => {
            if (error) {
                console.log("*** updateCaseRequest error: ", error);
                dispatch(addError(errorTypes.ERROR_UPDATE_CASE));
            }
            if (response) {
                console.log("*** updateCaseRequest response: ", JSON.stringify(response));
                dispatch(updateCaseAction(response));
            }
        })
    }
}