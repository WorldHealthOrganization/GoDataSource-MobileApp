/**
 * Created by florinpopa on 25/07/2018.
 */
import {ACTION_TYPE_STORE_EVENTS} from './../utils/enums';
// import {getEventsForOutbreakIdRequest} from './../requests/events';
import {getEventsForOutbreakIdRequest} from './../queries/events';
import { addError } from './errors';
import errorTypes from './../utils/errorTypes';


// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
export function storeEvents(events) {
    return {
        type: ACTION_TYPE_STORE_EVENTS,
        payload: events
    }
}

export function getEventsForOutbreakId(outbreakId, token, dispatch) {
    // return async function (dispatch, getState) {
    return new Promise((resolve, reject) => {
        getEventsForOutbreakIdRequest(outbreakId, token, (error, response) => {
            if (error) {
                console.log("*** getContactsForOutbreakId error: ", error);
                dispatch(addError(errorTypes.ERROR_EVENTS));
                reject(error);
            }
            if (response) {
                dispatch(storeEvents(response));
                resolve('Done events');
            }
        })
    })
    // }
}