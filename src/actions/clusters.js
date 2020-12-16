/**
 * Created by florinpopa on 19/07/2018.
 */


// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
import {ACTION_TYPE_STORE_CLUSTERS} from './../utils/enums';
import {getClustersdRequest} from './../queries/clusters';
import errorTypes from './../utils/errorTypes';

// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
export function storeClusters(clusters) {
    return {
        type: ACTION_TYPE_STORE_CLUSTERS,
        payload: clusters
    }
};

export function getClusters(outbreakId) {
    return new Promise((resolve, reject) => {
        getClustersdRequest(outbreakId, (error, response) => {
            if (error) {
                console.log("*** getClustersdRequest error: ", error);
                // dispatch(addError(errorTypes.ERROR_CLUSTERS));
                reject(errorTypes.ERROR_CLUSTERS);
            }
            if (response) {
                resolve({clusters: response});
            }
        })
    })
};
