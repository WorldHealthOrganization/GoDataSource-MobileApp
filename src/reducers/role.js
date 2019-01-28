/**
 * Created by florinpopa on 03/07/2018.
 */
import {ACTION_TYPE_STORE_USER_PERMISSIONS} from './../utils/enums';

// Do not add unnecessary business logic in the reducer. Here should only be updated the store
export default function (state=null, action) {
    switch (action.type) {
        case ACTION_TYPE_STORE_USER_PERMISSIONS:
            if (!action.payload) {
                return null;
            }
            let state = null;
            return Object.assign([], state, action.payload);
        default:
            break;
    }
    return state;
}