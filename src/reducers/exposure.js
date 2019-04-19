import { ACTION_TYPE_STORE_EXPOSURES } from './../utils/enums';

// Do not add unnecessary business logic in the reducer. Here should only be updated the store
export default function (state = null, action) {
    switch (action.type) {
        case ACTION_TYPE_STORE_EXPOSURES:
            if (!action.payload) {
                return null;
            }
            if (state) {
                state = null
            }
            return Object.assign([], state, action.payload);
        default:
            break;
    }
    return state;
}