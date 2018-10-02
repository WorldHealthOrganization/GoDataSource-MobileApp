/**
 * Created by florinpopa on 19/07/2018.
 */
import {ACTION_TYPE_GET_FOLLOWUPS, ACTION_TYPE_STORE_FOLLOWUPS, ACTION_TYPE_UPDATE_FOLLOWUP, ACTION_TYPE_DELETE_FOLLOWUP} from './../utils/enums';
import {
    // getFollowUpsForOutbreakIdRequest,
    getMissedFollowUpsForOutbreakIdRequest,
    // updateFollowUpRequest,
    // addFollowUpRequest,
    deleteFollowUpRequest,
    generateFollowUpRequest
} from './../requests/followUps';
import {updateContact, getContactsForOutbreakIdWithPromises} from './contacts';
import { addError } from './errors';
import errorTypes from './../utils/errorTypes';
import config from './../utils/config';
import {
    getFollowUpsForOutbreakIdRequest,
    updateFollowUpRequest,
    addFollowUpRequest
} from './../queries/followUps';
import _ from 'lodash';
import {storeContacts} from './contacts';

// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
export function storeFollowUps(followUps) {
    return {
        type: ACTION_TYPE_STORE_FOLLOWUPS,
        payload: followUps
    }
}

export function updateFollowUpAction(followUp) {
    return {
        type: ACTION_TYPE_UPDATE_FOLLOWUP,
        payload: followUp
    }
}

export function getFollowUpsForOutbreakId(outbreakId, filter, token) {
    return async function (dispatch, getState) {
        if (!filter) {
            filter = {};
            filter.date = new Date();
        }
        getFollowUpsForOutbreakIdRequest(outbreakId, filter, token, (error, response) => {
            if (error) {
                console.log("*** getFollowUpsForOutbreakId error: ", error);
                dispatch(addError(errorTypes.ERROR_FOLLOWUPS));
            }
            if (response) {
                // After getting the followUps by date, it's time to get their respective contacts
                let keys = response.map((e) => {return e.personId});
                keys = _.uniq(keys);
                console.log('### Keys for getting contacts: ', keys);
                getContactsForOutbreakIdWithPromises(outbreakId, {keys: keys}, null, dispatch)
                    .then((responseGetContacts) => {
                        dispatch(storeFollowUps(response));
                        let mappedContact = mapContactsAndFollowUps(responseGetContacts, response);
                        // console.log("Mapped Contact: ", mappedContact);
                        dispatch(storeContacts(mappedContact));
                    })
                    .catch((errorGetContactsForFollowUps) => {
                        dispatch(addError(errorTypes.ERROR_CONTACT));
                    })
            }
        })
    }
}

export function getFollowUpsForOutbreakIdWithPromises(outbreakId, filter, token, dispatch) {
    // return async function (dispatch, getState) {
    return new Promise((resolve, reject) => {
        if (!filter) {
            filter = {};
            filter.date = new Date();
        }
        console.log("getFollowUpsForOutbreakIdWithPromises Filter: ", filter);
        getFollowUpsForOutbreakIdRequest(outbreakId, filter, token, (error, response) => {
            if (error) {
                console.log("*** getFollowUpsForOutbreakId error: ", error);
                dispatch(addError(errorTypes.ERROR_FOLLOWUPS));
                reject(error)
            }
            if (response) {
                // After getting the followUps by date, it's time to get their respective contacts
                let keys = response.map((e) => {return e.personId});
                keys = _.uniq(keys);
                console.log('### Keys for getting contacts: ', keys);
                getContactsForOutbreakIdWithPromises(outbreakId, {keys: keys}, null, dispatch)
                    .then((responseGetContacts) => {
                        dispatch(storeFollowUps(response));
                        let mappedContact = mapContactsAndFollowUps(responseGetContacts, response);
                        // console.log("Mapped Contact: ", mappedContact);
                        dispatch(storeContacts(mappedContact));
                        resolve('Done followUps');
                    })
                    .catch((errorGetContactsForFollowUps) => {
                        dispatch(addError(errorTypes.ERROR_CONTACT));
                        reject(errorGetContactsForFollowUps);
                    })
            }
        })
    })
    // }
}

function mapContactsAndFollowUps(contacts, followUps) {
    let mappedContacts = [];
    for (let i=0; i<followUps.length; i++) {
        if (mappedContacts.map((e) => {return e._id}).indexOf(followUps[i].personId) === -1) {
            let contactObject = {}
            contactObject = Object.assign({}, contacts[contacts.map((e) => {return e._id.split('_')[e._id.split('_').length - 1]}).indexOf(followUps[i].personId)], {_id: followUps[i].personId});
            contactObject.followUps = [];
            contactObject.followUps.push(followUps[i]);
            mappedContacts.push(contactObject);
        } else {
            mappedContacts[mappedContacts.map((e) => {return e._id}).indexOf(followUps[i].personId)].followUps.push(followUps[i]);
        }
    }
    return mappedContacts;
}

export function getMissedFollowUpsForOutbreakId(outbreakId, filter, token) {
    return async function (dispatch, getState) {
        if (!filter || !filter.where || filter.where.and.length === 0 || !Array.isArray(filter.where.and)) {
            filter = null;
        }
        getMissedFollowUpsForOutbreakIdRequest(outbreakId, filter, token, (error, response) => {
            if (error) {
                console.log("*** getFollowUpsForOutbreakId error: ", error);
                dispatch(addError(errorTypes.ERROR_FOLLOWUPS));
            }
            if (response) {
                dispatch(storeFollowUps(response));
            }
        })
    }
}

export function updateFollowUpAndContact(outbreakId, contactId, followUpId, followUp, contact, token) {
    return async function(dispatch, getState) {
        updateFollowUpRequest(outbreakId, contactId, followUpId, followUp, token, (error, response) => {
            if (error) {
                console.log("*** updateFollowUp error: ", error);
                dispatch(addError(errorTypes.ERROR_UPDATE_FOLLOWUP));
            }
            if (response) {
                dispatch(updateFollowUpAction(response));
                dispatch(updateContact(outbreakId, contactId, contact, token));
            }
        })
    }
}

export function addFollowUp(outbreakId, contactId, followUp, activeFilters, token) {
    return async function(dispatch, getState) {
        addFollowUpRequest(outbreakId, contactId, followUp, token, (error, response) => {
            if (error) {
                console.log("*** addFollowUp error: ", error);
                dispatch(addError(errorTypes.ERROR_ADD_FOLLOWUP));
            }
            if (response) {
                dispatch(getFollowUpsForOutbreakId(outbreakId, activeFilters, token));
            }
        })
    }
}

export function createFollowUp(outbreakId, contactId, followUp, contact, activeFilters, token) {
    return async function(dispatch, getState) {
        addFollowUpRequest(outbreakId, contactId, followUp, token, (error, response) => {
            if (error) {
                console.log("*** addFollowUp error: ", error);
                dispatch(addError(errorTypes.ERROR_ADD_FOLLOWUP));
            }
            if (response) {
                // dispatch(updateFollowUpAction(response));
                dispatch(updateContact(outbreakId, contactId, contact, token));
            }
        })
    }
}

export function generateFollowUp(outbreakId, followUpPeriod, token) {
    return async function(dispatch, getState) {
        generateFollowUpRequest(outbreakId, followUpPeriod, token, (error, response) => {
            if (error) {
                console.log("*** generateFollowUp error: ", error);
                dispatch(addError(errorTypes.ERROR_GENERATE_FOLLOWUP));
            }
            if (response) {
                dispatch(getContactsForOutbreakId(outbreakId, config.defaultFilterForContacts, token))
            }
        })
    }
}

export function deleteFollowUp(outbreakId, contactId, followUpId, filter, token) {
    return async function(dispatch, getState) {
        deleteFollowUpRequest(outbreakId, contactId, followUpId, token, (error, response) => {
            if (error) {
                console.log("*** updateFollowUp error: ", error);
                dispatch(addError(errorTypes.ERROR_DELETE_FOLLOWUP));
            }
            if (response) {
                // let filterNew = {};
                //
                // filterNew.where = {};
                // filterNew.where.and = [];
                //
                // let oneDay = 24 * 60 * 60 * 1000;
                //
                // if (filter.date) {
                //     filterNew.where.and.push({date: {gt: new Date(filter.date.getTime() - oneDay)}});
                //     filterNew.where.and.push({date: {lt: new Date(filter.date.getTime() + oneDay)}});
                // }
                //
                // if (filter.performed) {
                //     filterNew.where.and.push({performed: this.state.filter.performed !== 'To do'})
                // }
                //
                // if (filter.performed === 'Missed') {
                //     dispatch(getMissedFollowUpsForOutbreakId(outbreakId, filterNew, token));
                // } else {
                //     dispatch(getFollowUpsForOutbreakId(outbreakId, filterNew, token));
                // }

                dispatch(getContactsForOutbreakId(outbreakId, config.defaultFilterForContacts, token));
            }
        })
    }
}