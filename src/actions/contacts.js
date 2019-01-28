/**
 * Created by florinpopa on 20/07/2018.
 */
import {
    ACTION_TYPE_STORE_CONTACTS,
    ACTION_TYPE_UPDATE_CONTACT,
    ACTION_TYPE_ADD_CONTACT,
    ACTION_TYPE_REMOVE_CONTACT
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
import {getFollowUpsForContactRequest} from './../queries/followUps';
import {extractIdFromPouchId, mapContactsAndRelationships, updateRequiredFields, mapContactsAndFollowUps} from './../utils/functions';
import moment from 'moment';
import config from './../utils/config';
import {max} from 'lodash';

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

export function removeContactAction(contact) {
    return {
        type: ACTION_TYPE_REMOVE_CONTACT,
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
                        console.log ('getContactsForOutbreakId getRelationshipsForTypeRequest response: ')
                        let mappedContacts = mapContactsAndRelationships(response, responseRelationships);
                        dispatch(storeContacts(mappedContacts));
                    }
                })
            }
        })
        // })
    }
}

export function getContactById(outbreakId, contactId, token, contact = null) {
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
                        if (contact) {
                            mappedContact[0].followUps = Object.assign([], contact.followUps)
                        }
                        dispatch(updateContactAction(mappedContact[0]));
                    }
                });
            }
        })
    }
}

export function addContact(outbreakId, contact, outbreak, token, contactMatchFilter) {
    // Since will have only one relationship, we can set here all the data needed dateOfLastContact, followUp: {originalStartDate, startDate, endDate, status}
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
                if (contactMatchFilter === true) {
                    dispatch(addContactAction(response));
                    console.log('test ajunge aici')
                }
                dispatch(addExposureForContact(outbreakId, response._id, relationship, token, null));
            }
        })
    }
}

export function updateContact(outbreakId, contactId, contact, token, filter, contactMatchFilter) {
    return async function(dispatch, getState) {
        if (contact.relationships) {
            if (Array.isArray(contact.relationships) && contact.relationships.length > 0) {
                contact = updateContactFollowUpFields(contact, getState().outbreak);
            }
            delete contact.relationships;
        }
        if (contact.followUps) {
            delete contact.followUps;
        }

        updateContactRequest(outbreakId, contactId, contact, token, (error, response) => {
            if (error) {
                console.log("*** updateContactRequest error: ", error);
                dispatch(addError(errorTypes.ERROR_UPDATE_CONTACT));
            }
            if (response) {
                // console.log("*** updateContactRequest response: ", JSON.stringify(response));
                if (response.deleted === false) {
                    getRelationshipsAndFollowUpsForContactRequest(outbreakId, extractIdFromPouchId(response._id, 'person'), filter, (errorRelationshipsAndFollowUps, responseRelationshipsAndFollowUps) => {
                        if (errorRelationshipsAndFollowUps) {
                            console.log("*** getRelationshipsAndFollowUpsForContact error: ", JSON.stringify(errorRelationshipsAndFollowUps));
                            dispatch(addError(errorTypes.ERROR_CONTACT));
                        }
                        if (responseRelationshipsAndFollowUps) {
                            // console.log("*** getRelationshipsAndFollowUpsForContact response: ", JSON.stringify(responseRelationshipsAndFollowUps));
                            let relationships = responseRelationshipsAndFollowUps.filter((e) => {if (e.persons) {return e}});
                            let followUps = responseRelationshipsAndFollowUps.filter((e) => {if (e.personId) {return e}});

                            let mappedContact = mapContactsAndRelationships([response], relationships);
                            if (followUps.length > 0) {
                                mappedContact = mapContactsAndFollowUps(mappedContact, followUps);
                            }
                            if (contactMatchFilter) {
                                dispatch(updateContactAction(mappedContact[0]));
                            } else {
                                dispatch(removeContactAction(mappedContact[0]));
                            }
                        }
                    });
                } else {
                    if (contactMatchFilter) {
                        dispatch(updateContactAction(response));
                    } else {
                        dispatch(removeContactAction(response));
                    }
                }
            }
        })
    }
}

export function addExposureForContact(outbreakId, contactId, exposure, token, contact = null) {
    let contactIdForExposure;
    if (contactId) {
        contactIdForExposure = extractIdFromPouchId(contactId, 'person')
    }
    return async function(dispatch, getState) {
        // Get contact and its relationships
        getContactByIdRequest(outbreakId, contactId, null, (errorContact, responseContact) => {
            if (errorContact) {
                console.log("*** addExposureForContact getContactByIdRequest error: ", error);
                dispatch(addError(errorTypes.ERROR_ADD_EXPOSURE));
            }
            if (responseContact) {
                getRelationshipsForTypeRequest(outbreakId, null, [contactIdForExposure], (errorRelationships, resultRelationships) => {
                    if (errorRelationships) {
                        console.log("*** addExposureForContact getRelationshipsForTypeRequest error: ", error);
                        dispatch(addError(errorTypes.ERROR_ADD_EXPOSURE));
                    }
                    if (resultRelationships) {
                        // Map the relationships inside the new contact
                        responseContact.relationships = resultRelationships;
                        responseContact.relationships.push(exposure);

                        responseContact = updateContactFollowUpFields(responseContact, getState().outbreak);
                        delete responseContact.relationships;
                        updateContactRequest(outbreakId, responseContact._id, responseContact, null, (errorUpdateContact, responseUpdateContact) => {
                            if (errorUpdateContact) {
                                console.log("*** addExposureForContact updateContactRequest error: ", error);
                                dispatch(addError(errorTypes.ERROR_ADD_EXPOSURE));
                            }
                            if (responseUpdateContact) {
                                addExposureForContactRequest(outbreakId, contactIdForExposure, exposure, token, (error, response) => {
                                    if (error) {
                                        console.log("*** addExposureForContact error: ", error);
                                        dispatch(addError(errorTypes.ERROR_ADD_EXPOSURE));
                                    }
                                    if (response) {
                                        console.log("*** addExposureForContact response: ", JSON.stringify(response));
                                        dispatch(getContactById(outbreakId, contactId, token, contact));
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    }
}

// Expects relationships to be an array of relationships
function updateContactFollowUpFields(contact, outbreak) {
    if (contact && contact.relationships && Array.isArray(contact.relationships) && contact.relationships.length > 0) {
        let maxDate = max(contact.relationships.map((e) => {return new Date(e.contactDate)}));
        let oldStartDate = contact && contact.followUp && contact.followUp.startDate ? contact.followUp.startDate : null;
        // let oldEndDate = contact && contact.followUp && contact.followUp.endDate ? contact.followUp.endDate : null;

        contact.dateOfLastContact = maxDate.toISOString();
        if (!contact.followUp) {
            contact.followUp = {};
        }
        contact.followUp.startDate = moment(maxDate).add(1, 'days')._d.toISOString();
        if (!contact.followUp.originalStartDate) {
            contact.followUp.originalStartDate = contact.followUp.startDate;
        }
        contact.followUp.endDate = moment(contact.followUp.startDate).add(outbreak.periodOfFollowup, 'days')._d.toISOString();
        if (oldStartDate !== contact.followUp.startDate) {
            contact.followUp.status = config.contactFollowUpStatuses.underFollowUp;
        }
    }
    return contact;
}

export function updateExposureForContact(outbreakId, contactId, exposure, token) {
    //OLD IMPLEMENTATION
    // let contactIdForExposure = extractIdFromPouchId(contactId, 'person');
    // return async function(dispatch, getState) {

    //     getContactByIdRequest(outbreakId, contactId, null, (errorContact, responseContact) => {
    //         if (errorContact) {
    //             console.log("*** updateExposureForContact getContactByIdRequest error: ", error);
    //             dispatch(addError(errorTypes.ERROR_ADD_EXPOSURE));
    //         }
    //         if (responseContact) {
    //             getRelationshipsForTypeRequest(outbreakId, null, [contactIdForExposure], (errorRelationships, resultRelationships) => {
    //                 if (errorRelationships) {
    //                     console.log("*** updateExposureForContact getRelationshipsForTypeRequest error: ", error);
    //                     dispatch(addError(errorTypes.ERROR_ADD_EXPOSURE));
    //                 }
    //                 if (resultRelationships) {
    //                     // Map the relationships inside the new contact
    //                     responseContact.relationships = resultRelationships;
    //                     responseContact.relationships.push(exposure);

    //                     responseContact = updateContactFollowUpFields(responseContact, getState().outbreak);
    //                     dispatch(updateContact(outbreakId, contactId, responseContact, null, null, true));
    //                     // updateContactRequest(outbreakId, responseContact._id, responseContact, null, (errorUpdateContact, responseUpdateContact) => {
    //                     //     if (errorUpdateContact) {
    //                     //         console.log("*** updateExposureForContact updateContactRequest error: ", error);
    //                     //         dispatch(addError(errorTypes.ERROR_ADD_EXPOSURE));
    //                     //     }
    //                     //     if (responseUpdateContact) {
    //                     //         updateExposureForContactRequest(outbreakId, contactIdForExposure, exposure, token, (error, response) => {
    //                     //             if (error) {
    //                     //                 console.log("*** updateExposureForContact error: ", error);
    //                     //                 dispatch(addError(errorTypes.ERROR_UPDATE_EXPOSURE));
    //                     //             }
    //                     //             if (response) {
    //                     //                 console.log("*** updateExposureForContact response: ", JSON.stringify(response));
    //                     //                 dispatch(getContactById(outbreakId, contactId, token));
    //                     //             }
    //                     //         })
    //                     //     }
    //                     // })
    //                 }
    //             })
    //         }
    //     })
    // }

    let contactIdForExposure = extractIdFromPouchId(contactId, 'person');
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

                // Get contact and its relationships and update the follow-up periods
                getContactByIdRequest(outbreakId, contactId, null, (errorGetContact, responseGetContact) => {
                    if (errorGetContact) {

                    }
                    if (responseGetContact) {
                        getRelationshipsForTypeRequest(outbreakId, null, [extractIdFromPouchId(contactId, 'person')], (errorGetRelationships, responseGetRelationships) => {
                            if (errorGetRelationships) {

                            }
                            if (responseGetRelationships) {
                                console.log('ResponseGetRelationships: ', responseGetRelationships);
                                responseGetContact.relationships = responseGetRelationships;
                                responseGetContact = updateContactFollowUpFields(responseGetContact, getState().outbreak);
                                dispatch(updateContact(outbreakId, contactId, responseGetContact, null, null, true));
                            }
                        })
                    }
                })


                
                // dispatch(getContactById(outbreakId, contactId, token));
            }
        })
    }
}