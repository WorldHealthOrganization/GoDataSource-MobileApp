/**
 * Created by florinpopa on 20/07/2018.
 */
import _ from 'lodash';
import {ACTION_TYPE_STORE_CONTACTS, ACTION_TYPE_UPDATE_CONTACT, ACTION_TYPE_ADD_CONTACT} from './../utils/enums';

// Do not add unnecessary business logic in the reducer. Here should only be updated the store
export default function (state=null, action) {
    var stateClone = _.cloneDeep(state);
    switch (action.type) {
        case ACTION_TYPE_STORE_CONTACTS:
            if (!action.payload) {
                return null;
            }
            if (state) {
                state = null
            }
            return Object.assign([], state, action.payload);
        case ACTION_TYPE_ADD_CONTACT:
            if (!action.payload) {
                return null;
            }
            stateClone.push(action.payload);
            return Object.assign([], stateClone);
        case ACTION_TYPE_UPDATE_CONTACT:
            if (!action.payload) {
                return null;
            }
            if (stateClone.map((e) => {return e.id}).indexOf(action.payload.id) > -1){
                if (action.payload.deleted === false) {
                    stateClone[stateClone.map((e) => {return e.id}).indexOf(action.payload.id)] = action.payload;
                } else {
                    stateClone.splice(stateClone.map((e) => {return e.id}).indexOf(action.payload.id), 1)
                }
            }
            return Object.assign([], stateClone);
        default:
            break;
    }
    return state;
}