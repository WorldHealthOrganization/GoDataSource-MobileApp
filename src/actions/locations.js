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
        // The countries are saved as the reference data values, so we have to map them to the translations

        // console.log('Countries: ', countries);
        //
        // let currentState = getState();
        // let translations = currentState && currentState.app && currentState.app.translation && Array.isArray(currentState.app.translation) && currentState.app.translation.length > 0 ? currentState.app.translation : [];
        // let referenceData = currentState && currentState.referenceData && Array.isArray(currentState.referenceData) && currentState.referenceData.length > 0 ? currentState.referenceData : [];
        //
        // for(let i=0; i<countries.length; i++) {
        //     if (countries[i].includes("LNG")) {
        //         console.log("### translation: ", translations[translations.map((e) => {return e.token;}).indexOf(countries[i])], referenceData[referenceData.map((e) => {return e.value}).indexOf(countries[i])]);
        //         countries[i] = translations[translations.map((e) => {return e.token;}).indexOf(countries[i])].translation;
        //     }
        // }

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