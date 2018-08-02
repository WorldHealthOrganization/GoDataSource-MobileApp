/**
 * Created by florinpopa on 19/07/2018.
 */
import {ACTION_TYPE_STORE_FOLLOWUPS, ACTION_TYPE_UPDATE_FOLLOWUP} from './../utils/enums';

// Do not add unnecessary business logic in the reducer. Here should only be updated the store
export default function (state=null, action) {
    switch (action.type) {
        case ACTION_TYPE_STORE_FOLLOWUPS:
            if (!action.payload) {
                return null;
            }
            if (state) {
                state = null
            }
            return Object.assign([], state, action.payload);
        case ACTION_TYPE_UPDATE_FOLLOWUP:
            if (!action.payload) {
                return null;
            }
            let stateClone = state.slice();
            if (state.map((e) => {return e.id}).indexOf(action.payload.id) > -1){
                stateClone[stateClone.map((e) => {return e.id}).indexOf(action.payload.id)] = action.payload;
            }
            return Object.assign([], stateClone);
        default:
            break;
    }
    return state;
}