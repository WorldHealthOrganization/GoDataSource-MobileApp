/**
 * Created by florinpopa on 19/07/2018.
 */
import {ACTION_TYPE_STORE_OUTBREAK} from './../utils/enums';
import {getOutbreakByIdRequest} from './../requests/outbreak';
import { addError } from './errors';
import errorTypes from './../utils/errorTypes';

// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
export function storeOutbreak(outbreak) {
    return {
        type: ACTION_TYPE_STORE_OUTBREAK,
        payload: outbreak
    }
}

export function getOutbreakById(outbreakId, token) {
    return async function (dispatch, getState) {
        getOutbreakByIdRequest(outbreakId, token, (error, response) => {
            if (error) {
                console.log("*** getOutbreakById error: ", error);
                dispatch(addError(errorTypes.ERROR_OUTBREAK));
            }
            if (response) {
                dispatch(storeOutbreak(response));
            }
        })
    }
}