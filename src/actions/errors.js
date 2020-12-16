/**
 * Created by florinpopa on 01/08/2018.
 */
import {ACTION_TYPE_ADD_ERROR, ACTION_TYPE_REMOVE_ERRORS} from './../utils/enums';

export function addError(error) {
    return {
        type: ACTION_TYPE_ADD_ERROR,
        payload: error
    }
}

export function removeErrors() {
    return {
        type: ACTION_TYPE_REMOVE_ERRORS,
        payload: null
    }
}