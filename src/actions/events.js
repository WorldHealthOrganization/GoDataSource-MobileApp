/**
 * Created by florinpopa on 25/07/2018.
 */
import {ACTION_TYPE_STORE_EVENTS} from './../utils/enums';
import {getEventsForOutbreakIdRequest} from './../requests/events';
import { addError } from './errors';
import errorTypes from './../utils/errorTypes';


// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
export function storeEvents(events) {
    return {
        type: ACTION_TYPE_STORE_EVENTS,
        payload: events
    }
}

export function getEventsForOutbreakId(outbreakId, token) {
    return async function (dispatch, getState) {
        getEventsForOutbreakIdRequest(outbreakId, token, (error, response) => {
            if (error) {
                console.log("*** getContactsForOutbreakId error: ", error);
                dispatch(addError(errorTypes.ERROR_EVENTS));
            }
            if (response) {
                dispatch(storeEvents(response));
            }
        })
    }
}