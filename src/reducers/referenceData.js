/**
 * Created by florinpopa on 02/08/2018.
 */
import {ACTION_TYPE_STORE_REFERENCE_DATA} from './../utils/enums';

// Do not add unnecessary business logic in the reducer. Here should only be updated the store
export default function (state=null, action) {
    switch (action.type) {
        case ACTION_TYPE_STORE_REFERENCE_DATA:
            if (!action.payload) {
                return null;
            }
            return Object.assign([], action.payload);
        default:
            break;
    }
    return state;
}