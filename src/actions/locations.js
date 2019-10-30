/**
 * Created by florinpopa on 19/07/2018.
 */
import {ACTION_TYPE_STORE_OUTBREAK, ACTION_TYPE_STORE_LOCATIONS} from './../utils/enums';
import errorTypes from './../utils/errorTypes';
import {getLocationsByOutbreakIdRequest} from './../queries/locations'
import {mapLocations} from './../utils/functions'
import {extractIdFromPouchId} from "../utils/functions";

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

export function getLocations(locationIds) {
    // let start = new Date().getTime();
    return new Promise((resolve, reject) => {
        getLocationsByOutbreakIdRequest(null, (error, responseLocations) => {
            if (error) {
                console.log('*** getLocationsByOutbreakId error: ', error);
                reject(errorTypes.ERROR_LOCATIONS);
            }
            if (responseLocations) {
                // console.log('*** getLocationsByOutbreakId response: ');
                let treeLocationList = [];
                if (responseLocations.length > 0) {
                    treeLocationList = mapLocations(responseLocations.filter((e) => {return e.active === true}));
                    // console.log('Map locations: ', new Date().getTime() - start);
                    if (locationIds && Array.isArray(locationIds) && locationIds.length > 0) {
                        treeLocationList = extractLocations(treeLocationList, locationIds);
                    }
                    // console.log('Map locations: ', new Date().getTime() - start);
                }
                resolve({locations: {locationsList: responseLocations, treeLocationsList: treeLocationList}});
            }
        });
    })
}

function extractLocations (locationTree, locationIds) {
    let newLocationTree = [];

    for (let i=0; i<locationTree.length; i++) {
        let index = locationIds.indexOf(extractIdFromPouchId(locationTree[i]._id, 'location'));
        if(index > -1) {
            newLocationTree.push(locationTree[i]);
        } else {
            if (locationTree[i].children && Array.isArray(locationTree[i].children) && locationTree[i].children.length > 0) {
                let auxLocations = extractLocations(locationTree[i].children, locationIds);
                if (auxLocations && Array.isArray(auxLocations) && auxLocations.length > 0) {
                    newLocationTree = newLocationTree.concat(auxLocations);
                }
            }
        }
    }

    return newLocationTree;
}