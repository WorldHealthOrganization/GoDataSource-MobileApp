/**
 * Created by florinpopa on 19/07/2018.
 */
import {ACTION_TYPE_STORE_OUTBREAK, ACTION_TYPE_STORE_LOCATIONS} from './../utils/enums';
// import {getOutbreakByIdRequest} from './../requests/outbreak';
import {getOutbreakByIdRequest} from './../queries/outbreak';
import { addError } from './errors';
import errorTypes from './../utils/errorTypes';
import {getLocationsByOutbreakIdRequest} from './../queries/locations'
import {mapLocations} from './../utils/functions'

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

export function getOutbreakById(outbreakId, token, dispatch) {
    // return async function(dispatch, getState) {
    return new Promise((resolve, reject) => {
        getOutbreakByIdRequest(outbreakId, null, (error, response) => {
            if (error) {
                console.log('*** getOutbreakById error: ', error);
                dispatch(addError(errorTypes.ERROR_OUTBREAK));
                reject(error);
            }
            if (response) {
                console.log ('*** getOutbreakById response: ', response)
                getLocationsByOutbreakIdRequest(response, (error, response) => {
                    if (error) {
                        console.log('*** getLocationsByOutbreakId error: ', error);
                        dispatch(addError(errorTypes.ERROR_LOCATIONS));
                    }
                    if (response) {
                        console.log('*** getLocationsByOutbreakId response: ');
                        let treeLocationList = mapLocations(response.filter((e) => {return e.active === true}), null)
                        dispatch(storeLocations(treeLocationList));
                    }
                })
                dispatch(storeOutbreak(response));
                resolve('Done outbreak');
            }
        })
    })
    // }
}