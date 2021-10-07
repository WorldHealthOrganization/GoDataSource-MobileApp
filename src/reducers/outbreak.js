/**
 * Created by florinpopa on 19/07/2018.
 */
import {ACTION_TYPE_STORE_OUTBREAK} from './../utils/enums';

// Do not add unnecessary business logic in the reducer. Here should only be updated the store
export default function (state=null, action) {
    switch (action.type) {
        case ACTION_TYPE_STORE_OUTBREAK:
            if (!action.payload) {
                return null;
            }
            console.log("Stored outbreak", action.payload.name);
            return Object.assign([], action.payload);
        default:
            break;
    }
    return state;
}