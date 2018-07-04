/**
 * Created by florinpopa on 18/06/2018.
 */
import {ACTION_TYPE_ROOT_CHANGE} from './../utils/enums';

// Do not add unnecessary business logic in the reducer. Here should only be updated the store
export default function app(state = { root: undefined }, action = {}) {
    switch (action.type) {
        case ACTION_TYPE_ROOT_CHANGE:
            return Object.assign({}, state, {
                root: action.root
            });
        default:
            return state;
    }
};