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
    // getContactByIdRequest,
    // updateContactRequest,
    // addContactRequest,
    // addExposureForContactRequest,
    // updateExposureForContactRequest,
    // deleteExposureForContactRequest
} from './../requests/contacts';
import {
    getContactsForOutbreakIdRequest,
    getContactByIdRequest,
    updateContactRequest,
    addContactRequest,
    addExposureForContactRequest,
    updateExposureForContactRequest,
    deleteExposureForContactRequest
} from './../queries/contacts'
import { addError } from './errors';
import errorTypes from './../utils/errorTypes';
import {storeFollowUps} from  './../actions/followUps';
import {getRelationshipsForTypeRequest, getRelationshipsAndFollowUpsForContactRequest} from './../queries/relationships';
import {extractIdFromPouchId, mapContactsAndRelationships, updateRequiredFields, mapContactsAndFollowUps} from './../utils/functions';

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
                        console.log ('getContactsForOutbreakId getRelationshipsForTypeRequest error: ', errorRelationships)
                        dispatch(addError(errorTypes.ERROR_CONTACT));
                    }
                    if (responseRelationships) {
                        console.log ('getContactsForOutbreakId getRelationshipsForTypeRequest response: ', JSON.stringify(responseRelationships))
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
                console.log("*** getContactById response: ", JSON.stringify(response));
                getRelationshipsForTypeRequest(outbreakId, 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT', [extractIdFromPouchId(response._id, 'person')], (errorRelationships, responseRelationships) => {
                    if (errorRelationships) {
                        console.log("*** getRelationshipsForTypeRequest error: ", JSON.stringify(errorRelationships));
                        dispatch(addError(errorTypes.ERROR_CONTACT));
                    }
                    if (responseRelationships) {
                        console.log("*** getRelationshipsForTypeRequest response: ", JSON.stringify(responseRelationships));
                        let mappedContact = mapContactsAndRelationships([response], responseRelationships);
                        dispatch(updateContactAction(mappedContact[0]));
                    }
                });
            }
        })
    }
}

export function addContact(outbreakId, contact, token) {
    let relationship = contact.relationships[0];
    relationship = updateRequiredFields(outbreakId = outbreakId, userId = contact.updatedBy, record = relationship, action = 'create', fileType = 'relationship.json')
    delete contact.relationships;

    return async function(dispatch, getState) {
        addContactRequest(outbreakId, contact, token, (error, response) => {
            if (error) {
                console.log("*** addContact error: ", error);
                dispatch(addError(errorTypes.ERROR_ADD_CONTACT));
            }
            if (response) {
                console.log("*** addContact response: ", JSON.stringify(response));
                dispatch(addContactAction(response));
                dispatch(addExposureForContact(outbreakId, response._id, relationship, token));
            }
        })
    }
}

export function updateContact(outbreakId, contactId, contact, token) {
    if (contact.relationships) {
        delete contact.relationships;
    }
    if (contact.followUps) {
        delete contact.followUps;
    }

    return async function(dispatch, getState) {
        updateContactRequest(outbreakId, contactId, contact, token, (error, response) => {
            if (error) {
                console.log("*** updateContactRequest error: ", error);
                dispatch(addError(errorTypes.ERROR_UPDATE_CONTACT));
            }
            if (response) {
                console.log("*** updateContactRequest response: ", JSON.stringify(response));
                if (response.deleted === false) {
                    getRelationshipsAndFollowUpsForContactRequest(outbreakId, [extractIdFromPouchId(response._id, 'person')], (errorRelationshipsAndFollowUps, responseRelationshipsAndFollowUps) => {
                        if (errorRelationshipsAndFollowUps) {
                            console.log("*** getRelationshipsAndFollowUpsForContact error: ", JSON.stringify(errorRelationshipsAndFollowUps));
                            dispatch(addError(errorTypes.ERROR_CONTACT));
                        }
                        if (responseRelationshipsAndFollowUps) {
                            console.log("*** getRelationshipsAndFollowUpsForContact response: ", JSON.stringify(responseRelationshipsAndFollowUps));
                            let relationships = responseRelationshipsAndFollowUps.filter((e) => {if (e.persons) {return e}})
                            let followUps = responseRelationshipsAndFollowUps.filter((e) => {if (e.personId) {return e}})
    
                            let mappedContact = mapContactsAndRelationships([response], relationships);
                            if (followUps.length > 0) {
                                mappedContact = mapContactsAndFollowUps(mappedContact, followUps);
                            }
                            dispatch(updateContactAction(mappedContact[0]));
                        }
                    });
                } else {
                    dispatch(updateContactAction(response));
                }
            }
        })
    }
}

export function addExposureForContact(outbreakId, contactId, exposure, token) {
    let contactIdForExposure = extractIdFromPouchId(contactId, 'person')
    return async function(dispatch, getState) {
        addExposureForContactRequest(outbreakId, contactIdForExposure, exposure, token, (error, response) => {
            if (error) {
                console.log("*** addExposureForContact error: ", error);
                dispatch(addError(errorTypes.ERROR_ADD_EXPOSURE));
            }
            if (response) {
                console.log("*** addExposureForContact response: ", JSON.stringify(response));
                dispatch(getContactById(outbreakId, contactId, token));
            }
        })
    }
}

export function updateExposureForContact(outbreakId, contactId, exposure, token) {
    let contactIdForExposure = extractIdFromPouchId(contactId, 'person')
    return async function(dispatch, getState) {
        updateExposureForContactRequest(outbreakId, contactIdForExposure, exposure, token, (error, response) => {
            if (error) {
                console.log("*** updateExposureForContact error: ", error);
                dispatch(addError(errorTypes.ERROR_UPDATE_EXPOSURE));
            }
            if (response) {
                console.log("*** updateExposureForContact response: ", JSON.stringify(response));
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