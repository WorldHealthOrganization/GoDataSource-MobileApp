/**
 * Created by florinpopa on 19/07/2018.
 */


// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
import { ACTION_TYPE_STORE_CLUSTERS } from './../utils/enums';
import {getClustersdRequest} from './../queries/clusters';
import { addError } from './errors';
import errorTypes from './../utils/errorTypes';

// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
export function storeClusters(clusters) {
    return {
        type: ACTION_TYPE_STORE_CLUSTERS,
        payload: clusters
    }
};

export function getClusters(token, dispatch) {
    return new Promise((resolve, reject) => {
        getClustersdRequest(token, (error, response) => {
            if (error) {
                console.log("*** getClustersdRequest error: ", error);
                dispatch(addError(errorTypes.ERROR_CLUSTERS));
                reject(error);
            }
            if (response) {
                dispatch(storeClusters(response));
                resolve('Done clusters');
            }
        })
    })
};
