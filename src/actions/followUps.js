/**
 * Created by florinpopa on 19/07/2018.
 */
import {ACTION_TYPE_GET_FOLLOWUPS, ACTION_TYPE_STORE_FOLLOWUPS, ACTION_TYPE_UPDATE_FOLLOWUP, ACTION_TYPE_DELETE_FOLLOWUP} from './../utils/enums';
import {updateContact, updateContactAction, getContactsForOutbreakIdWithPromises, getContactsForOutbreakPromise} from './contacts';
import { addError } from './errors';
import errorTypes from './../utils/errorTypes';
import config from './../utils/config';
import moment from 'moment';
import {
    getFollowUpsForOutbreakIdRequest,
    getFollowUpsForContactIds,
    updateFollowUpRequest,
    addFollowUpRequest,
    addFollowUpsBulkRequest
} from './../queries/followUps';
import _ from 'lodash';
import {storeContacts, getContactsForOutbreakId} from './contacts';
import {getRelationshipsForTypeRequest} from './../queries/relationships';
import {extractIdFromPouchId, mapContactsAndRelationships, mapContactsAndFollowUps, generateId, updateRequiredFields, createDate} from './../utils/functions';
import {getContactsForFollowUpPeriodRequest} from './../queries/contacts';
import {difference} from 'lodash';
import {setSyncState, saveGeneratedFollowUps, setLoaderState} from './app';
import {batchActions} from 'redux-batched-actions';
import {batch} from 'react-redux';

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

// Replace method for getting the list of follow-ups. it has to support searching by case/contacts name and visualId, and location
export function getFollowUpsForOutbreak(outbreakId, filter, userTeams) {
    return async function (dispatch) {
        // Filter props for follow-ups: date
        // Filter props for contacts: firstName, lastName, locationId, visualId, age, gender
        // Filter props for cases/events: firstName/lastName, visualId
        let {followUpsFilter, contactsFilter, casesFilter} = computeFilters(filter);
        // Get follow-ups filtered by date and user Teams
        try {
            let followUpsList = await getFollowUpsForOutbreakIdRequest(outbreakId, filter, userTeams);
            if (followUpsList && Array.isArray(followUpsList) && followUpsList.length > 0) {
                let mappedFollowUpsByContactIds = _.groupBy(followUpsList, 'personId');
                try {
                    let contactsWithRelationships = await getContactsForOutbreakPromise(outbreakId, filter);
                    if (contactsWithRelationships) {

                    }
                } catch (errorGetContactsWithRelationships) {
                    console.log('Error while getting contacts for followUps: ', errorGetContactsWithRelationships);
                    dispatch(addError(errorTypes.ERROR_FOLLOWUPS));
                }
            } else {
                dispatch(storeFollowUps([]));
            }
        } catch(errorGetFollowUpsList) {
            console.log('Error while getting followUpsList: ', errorGetFollowUpsList);
            dispatch(addError(errorTypes.ERROR_FOLLOWUPS));
        }
    }
}

// General method for constructing filters
// Receives the filter and the screen(followUps, contacts, cases)
// If screen is followUps, the method will create a filter for each of the data (fups, contacts, cases, events)
// if screen is contacts, the method will create filters for contacts, cases and events
// If screen is cases, the method will create filters for cases
function computeFilters(filter, screen) {
    let returnedFilter = {
        followUpsFilter: {},
        contactsFilter: {},
        casesFilter: {}
    };

    // FollowUps filter
    if (!filter) {
        returnedFilter.followUpsFilter.date = new Date();
    }
    if (filter && filter.statusId) {
        returnedFilter.followUpsFilter.statusId = filter.statusId;
    }

    // Common cases/contacts

    if (filter && filter.date) {
        returnedFilter.followUpsFilter.date = filter.date;
    }

    if (filter && filter.searchText) {
        returnedFilter.contactsFilter.searchText = filter.searchText;
        returnedFilter.casesFilter.searchText = filter.searchText;
    }



    if (filter && filter.age) {
        returnedFilter.contactsFilter.age = filter.age;
    }

    if (filter && filter.locationId) {
        returnedFilter.contactsFilter.locationId = filter.locationId;
    }

    if (filter && filter.gender) {
        returnedFilter.contactsFilter.gender = filter.gender;
    }

}

export function getFollowUpsForOutbreakId(outbreakId, filter, userTeams, token) {
    return async function (dispatch, getState) {
        dispatch(setLoaderState(true));
        if (!filter) {
            filter = {};
            filter.date = createDate(null);
        }
        if (!filter.date) {
            filter.date = createDate(null);
        }
        getFollowUpsForOutbreakIdRequest(outbreakId, filter, userTeams, token, (error, response) => {
            if (error) {
                console.log("*** getFollowUpsForOutbreakId error: ", error);
                batch(() => {
                    dispatch(setLoaderState(false));
                    dispatch(addError(errorTypes.ERROR_FOLLOWUPS));
                });
            }
            if (response) {
                console.log("*** getFollowUpsForOutbreakId response: ");
                let keys = response.map((e) => {return e.personId});
                keys = _.uniq(keys);
                keys = keys.sort();

                getContactsForOutbreakIdWithPromises(outbreakId, {keys: keys}, null, dispatch)
                    .then((responseGetContacts) => {
                        console.log ('getFollowUpsForOutbreakIdRequest getContactsForOutbreakIdWithPromises response')
                        // dispatch(storeFollowUps(response));
                        let mappedContact = [];
                        if (response.length > 0) {
                            mappedContact = mapContactsAndFollowUps(responseGetContacts, response);
                        }
                        // dispatch(storeContacts(mappedContact));
                        // dispatch(batchActions([
                        //     setLoaderState(false),
                        //     storeFollowUps(response),
                        //     storeContacts(mappedContact)
                        // ]))
                        batch(() => {
                            dispatch(setLoaderState(false));
                            dispatch(storeFollowUps(response));
                            dispatch(storeContacts(mappedContact));
                        })
                    })
                    .catch((errorGetContactsForFollowUps) => {
                        console.log ('getFollowUpsForOutbreakIdRequest getContactsForOutbreakIdWithPromises error', JSON.stringify(errorGetContactsForFollowUps));
                        batch(() => {
                            dispatch(setLoaderState(false));
                            dispatch(addError(errorTypes.ERROR_CONTACT));
                        });
                    })
            }
        })
    }
}

export function getFollowUpsForOutbreakIdWithPromises(outbreakId, filter, userTeams, token, dispatch) {
    // return async function (dispatch, getState) {
    return new Promise((resolve, reject) => {
        if (!filter) {
            filter = {};
            filter.date = createDate(null);
        }
        console.log("getFollowUpsForOutbreakId Filter: ", filter);
        getFollowUpsForOutbreakIdRequest(outbreakId, filter, userTeams, token, (error, response) => {
            if (error) {
                console.log("*** getFollowUpsForOutbreakId error: ", error);
                // dispatch(addError(errorTypes.ERROR_FOLLOWUPS));
                reject(errorTypes.ERROR_FOLLOWUPS)
            }
            if (response) {
                // After getting the followUps by date, it's time to get their respective contacts
                let keys = response.map((e) => {return e.personId});
                keys = _.uniq(keys);
                console.log('### Keys for getting contacts: ', keys);
                getContactsForOutbreakIdWithPromises(outbreakId, {keys: keys}, null, dispatch)
                    .then((responseGetContacts) => {
                        // dispatch(storeFollowUps(response));
                        // getRelationshipsForTypeRequest(outbreakId, 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT', keys, (errorGetRelationships, resultGetRelationships) => {
                            let mappedContact = mapContactsAndFollowUps(responseGetContacts, response);
                            // mappedContact = mapContactsAndRelationships(mappedContact, resultGetRelationships);
                            // dispatch(storeContacts(mappedContact));
                            resolve({followUps: {followUps: response, contacts: mappedContact}});
                        // })
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

export function updateFollowUpAndContact(outbreakId, contactId, followUpId, followUp, contact, token, filter, userTeams) {
    let contactIdForFollowUp = null;
    if (contactId) {
        contactIdForFollowUp = extractIdFromPouchId(contactId, 'person')
    }
    return async function(dispatch, getState) {
        updateFollowUpRequest(outbreakId, contactIdForFollowUp, followUpId, followUp, token, (error, response) => {
            if (error) {
                console.log("*** updateFollowUp error: ", error);
                dispatch(addError(errorTypes.ERROR_UPDATE_FOLLOWUP));
            }
            if (response) {
                console.log("*** updateFollowUp response: ", JSON.stringify(response));
                dispatch(updateFollowUpAction(response));
                if (contact && contactId) {
                    dispatch(updateContact(outbreakId, contactId, contact, token, filter, true, userTeams));
                } else if (contact){
                    console.log ('updateContactAction');
                    dispatch(updateContactAction(contact));
                }
            }
        })
    }
}

export function addFollowUp(outbreakId, contactId, followUp, activeFilters, userTeams, token) {
    return async function(dispatch, getState) {
        addFollowUpRequest(outbreakId, contactId, followUp, token, (error, response) => {
            if (error) {
                console.log("*** addFollowUp error: ", error);
                dispatch(addError(errorTypes.ERROR_ADD_FOLLOWUP));
            }
            if (response) {
                dispatch(getFollowUpsForOutbreakId(outbreakId, activeFilters, userTeams, token));
            }
        })
    }
}

export function createFollowUp(outbreakId, contactId, followUp, contact, activeFilters, token, userTeams) {
    let contactIdForFollowUp = extractIdFromPouchId(contactId, 'person')
    return async function(dispatch, getState) {
        addFollowUpRequest(outbreakId, contactIdForFollowUp, followUp, token, (error, response) => {
            if (error) {
                console.log("*** addFollowUp error: ", error);
                dispatch(addError(errorTypes.ERROR_ADD_FOLLOWUP));
            }
            if (response) {
                dispatch(updateFollowUpAction(response));
                dispatch(updateContact(outbreakId, contactId, contact, token, activeFilters, true, userTeams));
            }
        })
    }
}

export function generateFollowUp(outbreakId, filterDate, date, token) {
    return async function(dispatch, getState) {
        // TODO add generate algorithm for follow-ups
        // The algorithm:
        // get all contacts that have the selected date inside their followUp period (between followUp.startDate and followUp.endDate and status under followUp)
        // for those contacts see which of them has already follow-ups on that day
        // create follow-ups for those that don't have already follow-ups

        dispatch(setSyncState('Generating Follow-ups...'));
        // Get contacts that are under followUp on that day
        getContactsForFollowUpPeriodRequest(outbreakId, date.toISOString(), (errorContactIds, contactIds) => {
            if (errorContactIds) {
                console.log('Error while getting contacts to generate follow-ups: ', errorContactIds);
                dispatch(setSyncState('Error'));
                addError(errorTypes.ERROR_GENERATE_FOLLOWUP);
            }
            if (contactIds) {
                // Check if they already have follow-ups on that day
                // Map the contactIds
                contactIds = contactIds.map((e) => {return extractIdFromPouchId(e._id, 'person')});
                getFollowUpsForContactIds(outbreakId, date, contactIds, (errorGetFollowUps, resultGetFollowUps) => {
                    if (errorGetFollowUps) {
                        console.log('Error while getting followUps to generate follow-ups: ', errorContactIds);
                        dispatch(setSyncState('Error'));
                        addError(errorTypes.ERROR_GENERATE_FOLLOWUP);
                    }
                    if (resultGetFollowUps) {
                        // Now make the difference between the two arrays by _id, respectively personId and the for the difference, generate followUps
                        let contactsThatNeedFollowUps = difference(contactIds, resultGetFollowUps.map((e) => {return e.personId}));

                        let generatedFollowUps = [];
                        // For each contactsThatNeedFollowUps create a number of followUps equal with the number of daily followUps
                        for (let i=0; i<contactsThatNeedFollowUps.length; i++) {
                            // Add as many follow-ups as needed
                            for (let j=0; j<getState().outbreak.frequencyOfFollowUpPerDay; j++) {
                                let newFollowUp = {
                                    date: date,
                                    personId: contactsThatNeedFollowUps[i],
                                    outbreakId: outbreakId,
                                    statusId: config.followUpStatuses.notPerformed,
                                    targeted: false
                                };
                                let aux = updateRequiredFields(outbreakId, getState().user.activeOutbreakId, newFollowUp, 'create', 'followUp.json');
                                generatedFollowUps.push(aux);
                            }
                        }

                        let nrGeneratedFollowUps = generatedFollowUps ? generatedFollowUps.length : 0;
                        // Here bulk add the followUps
                        addFollowUpsBulkRequest(generatedFollowUps, (errorBulkInsert, resultBulkInsert) => {
                            if (errorBulkInsert) {
                                console.log('Error while getting followUps to generate follow-ups: ', errorContactIds);
                                dispatch(setSyncState('Error'));
                                addError(errorTypes.ERROR_GENERATE_FOLLOWUP);
                            }
                            if (resultBulkInsert) {
                                dispatch(saveGeneratedFollowUps(nrGeneratedFollowUps));
                                if(moment(filterDate).format('YYYY-MM-DD') === moment(date).format('YYYY-MM-DD')) {
                                    dispatch(getFollowUpsForOutbreakId(outbreakId, {date: date}));
                                }
                                dispatch(setSyncState('Finished processing'));
                            }
                        })
                    }
                })
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