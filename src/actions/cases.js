/**
 * Created by florinpopa on 19/07/2018.
 */


// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
import {ACTION_TYPE_GET_CASES, ACTION_TYPE_STORE_CASES} from './../utils/enums';
import {getCasesForOutbreakIdRequest} from './../requests/cases';


// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
export function storeCases(cases) {
    return {
        type: ACTION_TYPE_STORE_CASES,
        payload: cases
    }
}

export function getCasesForOutbreakId(outbreakId, token) {
    return async function (dispatch, getState) {
        getCasesForOutbreakIdRequest(outbreakId, token, (error, response) => {
            if (error) {
                console.log("*** getCasesForOutbreakId error: ", error);
            }
            if (response) {
                dispatch(storeCases(response));
            }
        })
    }
}