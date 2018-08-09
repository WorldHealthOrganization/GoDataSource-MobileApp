/**
 * Created by florinpopa on 06/08/2018.
 */
import {ACTION_TYPE_STORE_LOCATIONS} from './../utils/enums';

// Do not add unnecessary business logic in the reducer. Here should only be updated the store
export default function (state=null, action) {
    switch (action.type) {
        case ACTION_TYPE_STORE_LOCATIONS:
            if (!action.payload) {
                return null;
            }
            return Object.assign([], state, action.payload);
        default:
            break;
    }
    return state;
}