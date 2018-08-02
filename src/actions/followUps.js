/**
 * Created by florinpopa on 19/07/2018.
 */
import {ACTION_TYPE_GET_FOLLOWUPS, ACTION_TYPE_STORE_FOLLOWUPS, ACTION_TYPE_UPDATE_FOLLOWUP, ACTION_TYPE_DELETE_FOLLOWUP} from './../utils/enums';
import {getFollowUpsForOutbreakIdRequest, getMissedFollowUpsForOutbreakIdRequest, updateFollowUpRequest, deleteFollowUpRequest} from './../requests/followUps';
import {updateContact} from './contacts';
import { addError } from './errors';
import errorTypes from './../utils/errorTypes';

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
        if (!filter || !filter.where || filter.where.and.length === 0 || !Array.isArray(filter.where.and)) {
            filter = null;
        }
        getFollowUpsForOutbreakIdRequest(outbreakId, filter, token, (error, response) => {
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

export function deleteFollowUp(outbreakId, contactId, followUpId, filter, token) {
    return async function(dispatch, getState) {
        deleteFollowUpRequest(outbreakId, contactId, followUpId, token, (error, response) => {
            if (error) {
                console.log("*** updateFollowUp error: ", error);
                dispatch(addError(errorTypes.ERROR_DELETE_FOLLOWUP));
            }
            if (response) {
                let filterNew = {};

                filterNew.where = {};
                filterNew.where.and = [];

                let oneDay = 24 * 60 * 60 * 1000;

                if (filter.date) {
                    filterNew.where.and.push({date: {gt: new Date(filter.date.getTime() - oneDay)}});
                    filterNew.where.and.push({date: {lt: new Date(filter.date.getTime() + oneDay)}});
                }

                if (filter.performed) {
                    filterNew.where.and.push({performed: this.state.filter.performed !== 'To do'})
                }

                if (filter.performed === 'Missed') {
                    dispatch(getMissedFollowUpsForOutbreakId(outbreakId, filterNew, token));
                } else {
                    dispatch(getFollowUpsForOutbreakId(outbreakId, filterNew, token));
                }
            }
        })
    }
}