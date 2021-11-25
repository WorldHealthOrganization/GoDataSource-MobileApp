/**
 * Created by florinpopa on 19/07/2018.
 */
import {
  ACTION_TYPE_STORE_OUTBREAK,
  ACTION_TYPE_OUTBREAK_CHANGE,
} from "./../utils/enums";

// Do not add unnecessary business logic in the reducer. Here should only be updated the store
export default function (state=null, action) {
    switch (action.type) {
        case ACTION_TYPE_STORE_OUTBREAK:
            if (!action.payload) {
                return null;
            }
            console.log("Stored outbreak", action.payload.name);
            return Object.assign([], action.payload);
        case ACTION_TYPE_OUTBREAK_CHANGE:
            return Object.assign([], state, {disableOutbreakChange: !!action.payload});
        default:
            break;
    }
    return state;
}