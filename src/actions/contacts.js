/**
 * Created by florinpopa on 20/07/2018.
 */
import {ACTION_TYPE_STORE_CONTACTS, ACTION_TYPE_UPDATE_CONTACT} from './../utils/enums';
import {getContactsForOutbreakIdRequest, updateContactRequest} from './../requests/contacts';
import { addError } from './errors';
import errorTypes from './../utils/errorTypes';


// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
export function storeContacts(followUps) {
    return {
        type: ACTION_TYPE_STORE_CONTACTS,
        payload: followUps
    }
}

export function updateContactAction(contact) {
    return {
        type: ACTION_TYPE_UPDATE_CONTACT,
        payload: contact
    }
}

export function getContactsForOutbreakId(outbreakId, filter, token) {
    return async function (dispatch, getState) {
        getContactsForOutbreakIdRequest(outbreakId, filter, token, (error, response) => {
            if (error) {
                console.log("*** getContactsForOutbreakId error: ", error);
                dispatch(addError(errorTypes.ERROR_CONTACT));
            }
            if (response) {
                dispatch(storeContacts(response));
            }
        })
    }
}

export function updateContact(outbreakId, contactId, contact, token) {
    return async function(dispatch, getState) {
        updateContactRequest(outbreakId, contactId, contact, token, (error, response) => {
            if (error) {
                console.log("*** updateFollowUp error: ", error);
                dispatch(addError(errorTypes.ERROR_UPDATE_CONTACT));
            }
            if (response) {
                dispatch(updateContactAction(response));
            }
        })
    }
}