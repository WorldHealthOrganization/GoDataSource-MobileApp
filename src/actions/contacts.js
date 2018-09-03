/**
 * Created by florinpopa on 20/07/2018.
 */
import {
    ACTION_TYPE_STORE_CONTACTS,
    ACTION_TYPE_UPDATE_CONTACT,
    ACTION_TYPE_ADD_CONTACT
} from './../utils/enums';
import {
    getContactsForOutbreakIdRequest,
    getContactByIdRequest,
    updateContactRequest,
    addContactRequest,
    addExposureForContactRequest,
    updateExposureForContactRequest,
    deleteExposureForContactRequest
} from './../requests/contacts';
import { addError } from './errors';
import errorTypes from './../utils/errorTypes';

// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
export function storeContacts(followUps) {
    return {
        type: ACTION_TYPE_STORE_CONTACTS,
        payload: followUps
    }
}

export function addContactAction(contact) {
    return {
        type: ACTION_TYPE_ADD_CONTACT,
        payload: contact
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

export function getContactById(outbreakId, contactId, token) {
    return async function (dispatch, getState) {
        getContactByIdRequest(outbreakId, contactId, token, (error, response) => {
            if (error) {
                console.log("*** getContactById error: ", error);
                dispatch(addError(errorTypes.ERROR_CONTACT));
            }
            if (response) {
                dispatch(updateContactAction(response));
            }
        })
    }
}

export function addContact(outbreakId, contact, token) {
    let relationship = contact.relationships[0];
    delete contact.relationships;
    return async function(dispatch, getState) {
        addContactRequest(outbreakId, contact, token, (error, response) => {
            if (error) {
                console.log("*** addContact error: ", error);
                dispatch(addError(errorTypes.ERROR_ADD_CONTACT));
            }
            if (response) {
                dispatch(addContactAction(response));
                dispatch(addExposureForContact(outbreakId, response.id, relationship, token));
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

export function addExposureForContact(outbreakId, contactId, exposure, token) {
    return async function(dispatch, getState) {
        addExposureForContactRequest(outbreakId, contactId, exposure, token, (error, response) => {
            if (error) {
                console.log("*** addExposureForContact error: ", error);
                dispatch(addError(errorTypes.ERROR_ADD_EXPOSURE));
            }
            if (response) {
                // console.log("Response from add exposure");
                dispatch(getContactById(outbreakId, contactId, token));
            }
        })
    }
}

export function updateExposureForContact(outbreakId, contactId, exposure, token) {
    return async function(dispatch, getState) {
        updateExposureForContactRequest(outbreakId, contactId, exposure, token, (error, response) => {
            if (error) {
                console.log("*** updateExposureForContact error: ", error);
                dispatch(addError(errorTypes.ERROR_UPDATE_EXPOSURE));
            }
            if (response) {
                // console.log("Response from updateExposureForContact");
                dispatch(getContactById(outbreakId, contactId, token));
            }
        })
    }
}

export function deleteExposureForContact(outbreakId, contactId, exposure, token) {
    return async function(dispatch, getState) {
        deleteExposureForContactRequest(outbreakId, contactId, exposure, token, (error, response) => {
            if (error) {
                console.log("*** updateExposureForContact error: ", error);
                dispatch(addError(errorTypes.ERROR_DELETE_EXPOSURE));
            }
            if (response) {
                // console.log("Response from updateExposureForContact");
                dispatch(getContactById(outbreakId, contactId, token));
            }
        })
    }
}