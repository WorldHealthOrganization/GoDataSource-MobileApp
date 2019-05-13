/**
 * Created by florinpopa on 06/08/2018.
 */
import {ACTION_TYPE_STORE_LOCATIONS, ACTION_TYPE_STORE_LOCATIONS_LIST} from './../utils/enums';

// Do not add unnecessary business logic in the reducer. Here should only be updated the store
export default function (state={locations: null, locationsList: []}, action) {
    switch (action.type) {
        case ACTION_TYPE_STORE_LOCATIONS:
            if (!action.payload) {
                return null;
            }
            return Object.assign([], state, {locations: action.payload});
        case ACTION_TYPE_STORE_LOCATIONS_LIST:
            if (!action.locationsList) {
                return null;
            }
            return Object.assign([], state, {locationsList: action.locationsList});
        default:
            break;
    }
    return state;
}