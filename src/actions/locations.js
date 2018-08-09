/**
 * Created by florinpopa on 06/08/2018.
 */
import {ACTION_TYPE_STORE_LOCATIONS} from './../utils/enums';
import {getLocationsRequest} from './../requests/locations';
import { addError } from './errors';
import errorTypes from './../utils/errorTypes';
import _ from 'lodash';

// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
export function storeLocations(locations) {
    return {
        type: ACTION_TYPE_STORE_LOCATIONS,
        payload: locations
    }
}

export function getLocations(countries, token) {
    return async function (dispatch, getState) {
        getLocationsRequest(countries, token, (error, response) => {
            if (error) {
                // console.log("*** getLocations error: ", error);
                dispatch(addError(errorTypes.ERROR_LOCATIONS));
            }
            if (response) {
                // Save all the regions that the outbreak occurs along with the country
                let locations = response.map((e) => {return {id: e.location.id, name: e.location.name, children: e.children.map((f) => {return f.location})}});
                dispatch(storeLocations(locations));
            }
        })
    }
}