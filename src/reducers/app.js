/**
 * Created by florinpopa on 18/06/2018.
 */
import {ACTION_TYPE_ROOT_CHANGE, ACTION_TYPE_SAVE_SCREEN_SIZE} from './../utils/enums';

// Do not add unnecessary business logic in the reducer. Here should only be updated the store
export default function app(state = { root: undefined, screenSize: {width: 375, height: 667} }, action = {}) {
    switch (action.type) {
        case ACTION_TYPE_ROOT_CHANGE:
            return Object.assign({}, state, {
                root: action.root
            });
        case ACTION_TYPE_SAVE_SCREEN_SIZE:
            return Object.assign({}, state, {
                screenSize: action.screenSize
            });
        default:
            return state;
    }
};