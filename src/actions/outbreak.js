/**
 * Created by florinpopa on 19/07/2018.
 */
import {
    ACTION_TYPE_STORE_LOCATIONS,
    ACTION_TYPE_STORE_LOCATIONS_LIST,
    ACTION_TYPE_STORE_OUTBREAK,
    ACTION_TYPE_STORE_USER_LOCATIONS,
    ACTION_TYPE_STORE_USER_LOCATIONS_LIST
} from './../utils/enums';
import {getOutbreakByIdRequest} from './../queries/outbreak';
import errorTypes from './../utils/errorTypes';

// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
export function storeOutbreak(outbreak) {
    return {
        type: ACTION_TYPE_STORE_OUTBREAK,
        payload: outbreak
    }
}

export function storeLocations(locations) {
    return {
        type: ACTION_TYPE_STORE_LOCATIONS,
        payload: locations
    }
}

export function storeUserLocations(userLocations) {
    return {
        type: ACTION_TYPE_STORE_USER_LOCATIONS,
        payload: userLocations
    }
}

export function storeLocationsList(locationsList) {
    return {
        type: ACTION_TYPE_STORE_LOCATIONS_LIST,
        locationsList
    }
}

export function storeUserLocationsList(userLocationsList) {
    return {
        type: ACTION_TYPE_STORE_USER_LOCATIONS_LIST,
        userLocationsList
    }
}

export function getOutbreakById(outbreakId) {
    return new Promise((resolve, reject) => {
        getOutbreakByIdRequest(outbreakId, null, (error, response) => {
            if (error) {
                console.log('*** getOutbreakById error: ', error);
                reject(errorTypes.ERROR_OUTBREAK);
            }
            if (response) {
                resolve(response);
            }
        })
    })
}