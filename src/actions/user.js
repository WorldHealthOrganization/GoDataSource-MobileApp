/**
 * Created by florinpopa on 03/07/2018.
 */
import {ACTION_TYPE_STORE_USER} from './../utils/enums';
import { changeAppRoot } from './app';
import {loginUserRequest, getUserByIdRequest} from './../requests/user';
import { getFollowUpsForOutbreakId } from './followUps';
import { getContactsForOutbreakId } from './contacts';
import { getCasesForOutbreakId } from './cases';
import { getEventsForOutbreakId } from './events';
import { getOutbreakById } from './outbreak';
import { addError } from './errors';
import {getReferenceData} from './referenceData'
import {getLocations} from './locations'
import errorTypes from './../utils/errorTypes';
import config from './../utils/config';
import {storeContacts} from './contacts';
import {storeCases} from './cases';
import {storeEvents} from './events';
import {storeFollowUps} from './followUps';
import {storeOutbreak} from './outbreak';

// Add here only the actions, not also the requests that are executed.
// For that purpose is the requests directory
export function storeUser(user) {
    return {
        type: ACTION_TYPE_STORE_USER,
        payload: user
    }
}

export function loginUser(credentials) {
    console.log("LoginUser credentials: ", credentials);
    return async function (dispatch, getState) {
        loginUserRequest(credentials, (error, response) => {
            if (error) {
                console.log("*** An error occurred while logging the user");
                dispatch(addError(errorTypes.ERROR_LOGIN));
            }
            if (response) {
                if (response.userId && response.id) {
                    dispatch(getUserById(response.userId, response.id));
                }
            }
        })
    }
}

export function logoutUser() {
    return async function (dispatch) {
        dispatch(storeUser(null));
        dispatch(storeContacts(null));
        dispatch(storeFollowUps(null));
        dispatch(storeCases(null));
        dispatch(storeEvents(null));
        dispatch(storeOutbreak(null));
        dispatch(changeAppRoot('login'));
    }
}

export function getUserById(userId, token) {
    return async function(dispatch) {
        getUserByIdRequest(userId, token, (error, response) => {
            if (error) {
                console.log("*** getUserById error: ", error);
                dispatch(addError(errorTypes.ERROR_GET_USER));
                dispatch(changeAppRoot('after-login'));
            }
            if (response) {
                // store also the token
                let user = Object.assign({}, response, {token: token});
                dispatch(storeUser(user));
                dispatch(getFollowUpsForOutbreakId(user.activeOutbreakId, null, user.token));
                dispatch(getContactsForOutbreakId(user.activeOutbreakId, config.defaultFilterForContacts, user.token));
                dispatch(getCasesForOutbreakId(user.activeOutbreakId, null, user.token));
                dispatch(getEventsForOutbreakId(user.activeOutbreakId, user.token));
                dispatch(getOutbreakById(user.activeOutbreakId, user.token));
                dispatch(getReferenceData(user.token));
                dispatch(changeAppRoot('after-login'));
            }
        })
    }
}