/**
 * Created by florinpopa on 19/07/2018.
 */
import {
    ACTION_TYPE_STORE_LOCATIONS,
    ACTION_TYPE_STORE_LOCATIONS_LIST,
    ACTION_TYPE_STORE_OUTBREAK,
    ACTION_TYPE_OUTBREAK_CHANGE,
    ACTION_TYPE_STORE_USER_LOCATIONS,
    ACTION_TYPE_STORE_USER_LOCATIONS_LIST
} from './../utils/enums';
import constants from './../utils/constants';
import {getOutbreakByIdRequest} from './../queries/outbreak';
import errorTypes from './../utils/errorTypes';
import AsyncStorage from '@react-native-community/async-storage';

// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
export function storeOutbreak(outbreak) {
    if(outbreak?._id.includes("outbreak.json_")){
        outbreak._id = outbreak._id.substring(14, outbreak._id.length);
    }
    AsyncStorage.setItem('outbreakId', outbreak?._id);
    constants.PERMISSIONS_LAB_RESULT = constants.PERMISSIONS_LAB_RESULT_CONSTANT;
    return {
        type: ACTION_TYPE_STORE_OUTBREAK,
        payload: outbreak
    }
}

export function setDisableOutbreakChange(disableOutbreakChange) {
    return {
        type: ACTION_TYPE_OUTBREAK_CHANGE,
        payload: disableOutbreakChange
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
                console.log('*** getOutbreakById error: ', error, outbreakId);
                reject(errorTypes.ERROR_OUTBREAK);
            }
            if (response) {
                resolve(response);
            }
        })
    })
}