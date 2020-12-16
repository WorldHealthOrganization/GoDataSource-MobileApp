/**
 * Created by mobileclarisoft on 05/12/2018.
 */
import {ACTION_TYPE_STORE_HELP_ITEM} from './../utils/enums';

// Do not add unnecessary business logic in the reducer. Here should only be updated the store
export default function (state=null, action) {
    switch (action.type) {
        case ACTION_TYPE_STORE_HELP_ITEM:
            if (!action.payload) {
                return null;
            }
            return Object.assign([], action.payload);
        default:
            break;
    }
    return state;
}