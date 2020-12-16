/**
 * Created by florinpopa on 01/08/2018.
 */
import {ACTION_TYPE_ADD_ERROR, ACTION_TYPE_REMOVE_ERRORS} from './../utils/enums';

// Do not add unnecessary business logic in the reducer. Here should only be updated the store
export default function (state=null, action) {
    switch (action.type) {
        case ACTION_TYPE_ADD_ERROR:
            if (!action.payload) {
                return null;
            }
            return Object.assign({}, state, action.payload);
        case ACTION_TYPE_REMOVE_ERRORS:
            return Object.assign({}, null);
        default:
            break;
    }
    return state;
}