/**
 * Created by florinpopa on 20/07/2018.
 */
import {
    ACTION_TYPE_STORE_CONTACTS,
    ACTION_TYPE_UPDATE_CONTACT,
    ACTION_TYPE_ADD_CONTACT
} from './../utils/enums';
import {
    // getContactsForOutbreakIdRequest,
    getContactByIdRequest,
    // updateContactRequest,
    // addContactRequest,
    // addExposureForContactRequest,
    // updateExposureForContactRequest,
    // deleteExposureForContactRequest
} from './../requests/contacts';
import {
    getContactsForOutbreakIdRequest,
    updateContactRequest,
    addContactRequest,
    addExposureForContactRequest,
    updateExposureForContactRequest,
    deleteExposureForContactRequest
} from './../queries/contacts'
import { addError } from './errors';
import errorTypes from './../utils/errorTypes';
import {getFollowUpsForOutbreakIdRequest} from './../queries/followUps';
import {storeFollowUps} from  './../actions/followUps';
import {getRelationshipsForTypeRequest} from './../queries/relationships';
import {extractIdFromPouchId, mapContactsAndRelationships} from './../utils/functions';

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

export function getContactsForOutbreakIdWithPromises(outbreakId, filter, token, dispatch) {
    // return async function (dispatch, getState) {
    return new Promise((resolve, reject) => {
        getContactsForOutbreakIdRequest(outbreakId, filter, null, (error, response) => {
            if (error) {
                console.log("*** getContactsForOutbreakId error: ", error);
                dispatch(addError(errorTypes.ERROR_CONTACT));
                reject(error);
            }
            if (response) {
                // dispatch(storeContacts(response));
                getRelationshipsForTypeRequest(outbreakId, 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT', response.map((e) => {return extractIdFromPouchId(e._id, 'person')}), (errorRelationships, responseRelationships) => {
                    if (errorRelationships) {
                        dispatch(addError(errorTypes.ERROR_CONTACT));
                        reject(errorRelationships);
                    }

                    if (responseRelationships) {
                        let mappedContacts = mapContactsAndRelationships(response, responseRelationships);
                        resolve(mappedContacts);
                    }
                });
                // getFollowUpsForOutbreakIdRequest(outbreakId, null, (errorFollowUps, responseFollowUps) => {
                //     if (errorFollowUps) {
                //         console.log("Error when getting followUps: ", errorFollowUps);
                //     }
                //     if (responseFollowUps) {
                //         console.log('FollowUps result: ', outbreakId, responseFollowUps);
                //         dispatch(storeFollowUps(responseFollowUps));
                //         // Here should add the followUps to the contacts
                //         let contacts = mapFollowUpsToContacts(response, responseFollowUps);
                //         dispatch(storeContacts(contacts));
                //         resolve("Done contacts");
                //     }
                // })
                // dispatch(storeContacts(response))
            }
        })
    })
    // }
}

export function getContactsForOutbreakId(outbreakId, filter, token) {
    return async function (dispatch, getState) {
    // return new Promise((resolve, reject) => {
        getContactsForOutbreakIdRequest(outbreakId, filter, null, (error, response) => {
            if (error) {
                console.log("*** getContactsForOutbreakId error: ", error);
                dispatch(addError(errorTypes.ERROR_CONTACT));
                // reject(error);
            }
            if (response) {
                getRelationshipsForTypeRequest(outbreakId, 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT', response.map((e) => {return extractIdFromPouchId(e._id, 'person')}), (errorRelationships, responseRelationships) => {
                    if (errorRelationships) {
                        dispatch(addError(errorTypes.ERROR_CONTACT));
                    }

                    if (responseRelationships) {
                        let mappedContacts = mapContactsAndRelationships(response, responseRelationships);
                        dispatch(storeContacts(mappedContacts));
                    }
                })
            }
        })
    // })
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
                dispatch(addExposureForContact(outbreakId, response._id, relationship, token));
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