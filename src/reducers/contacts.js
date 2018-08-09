/**
 * Created by florinpopa on 20/07/2018.
 */
import _ from 'lodash';
import {ACTION_TYPE_STORE_CONTACTS, ACTION_TYPE_UPDATE_CONTACT} from './../utils/enums';

// Do not add unnecessary business logic in the reducer. Here should only be updated the store
export default function (state=null, action) {
    switch (action.type) {
        case ACTION_TYPE_STORE_CONTACTS:
            if (!action.payload) {
                return null;
            }
            if (state) {
                state = null
            }
            return Object.assign([], state, action.payload);
        case ACTION_TYPE_UPDATE_CONTACT:
            if (!action.payload) {
                return null;
            }
            let stateClone = _.cloneDeep(state);
            if (state.map((e) => {return e.id}).indexOf(action.payload.id) > -1){
                for (let i=0; i<Object.keys(action.payload).length; i++) {
                    stateClone[stateClone.map((e) => {return e.id}).indexOf(action.payload.id)][Object.keys(action.payload)[i]] = action.payload[Object.keys(action.payload)[i]];
                }
            }
            return Object.assign([], stateClone);
        default:
            break;
    }
    return state;
}