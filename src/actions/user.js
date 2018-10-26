/**
 * Created by florinpopa on 03/07/2018.
 */
import {ACTION_TYPE_STORE_USER} from './../utils/enums';
import { changeAppRoot, getTranslations } from './app';
// import { getUserByIdRequest} from './../requests/user';
import {loginUserRequest, getUserByIdRequest, updateUserRequest} from './../queries/user';
import { getFollowUpsForOutbreakIdWithPromises } from './followUps';
import { getContactsForOutbreakId, getContactsForOutbreakIdWithPromises } from './contacts';
import { getCasesForOutbreakIdWithPromise, getCasesForOutbreakId } from './cases';
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
import {setLoginState, storeData, getAvailableLanguages} from './app';

// Add here only the actions, not also the requests that are executed.
// For that purpose is the requests directory
export function storeUser(user) {
    return {
        type: ACTION_TYPE_STORE_USER,
        payload: user
    }
}

export function loginUser(credentials) {
    // console.log("LoginUser credentials: ", credentials);
    return async function (dispatch, getState) {
        dispatch(setLoginState('Loading...'));
        loginUserRequest(credentials, (error, response) => {
            if (error) {
                console.log("*** An error occurred while logging the user");
                dispatch(setLoginState('Error'));
                dispatch(addError(errorTypes.ERROR_LOGIN));
            }
            if (response) {
                // if (response.id) {
                    // Don't need to get user by id since the user is returned from the local database, so, instead, we store it to the redux store
                    // dispatch(getUserById(response.userId, response.id));

                // Here is the local storage handling
                let promises = [];
                promises.push(getOutbreakById(response.activeOutbreakId, null, dispatch));
                // promises.push(getContactsForOutbreakIdWithPromises(response.activeOutbreakId, null, null, dispatch));
                promises.push(getFollowUpsForOutbreakIdWithPromises(response.activeOutbreakId, null, null, dispatch));
                promises.push(getTranslations(response.languageId, dispatch));
                promises.push(getAvailableLanguages(dispatch));
                promises.push(getReferenceData(null, dispatch));
                promises.push(getEventsForOutbreakId(response.activeOutbreakId, null, dispatch));
                promises.push(getCasesForOutbreakIdWithPromise(response.activeOutbreakId, null, null, dispatch));

                // Store the user to the redux store, and also store the userId to the AsyncStorage
                dispatch(storeUser(response));
                // dispatch(storeData("loggedUser", response._id, () => {}));

                storeData('loggedUser', response._id, (error, success) => {
                    if (error) {
                        console.log("An error occurred while trying to save logged user. Proceed to log: ", error);
                        Promise.all(promises)
                            .then((result) => {
                                console.log("Finished getting data from local db: ", result);
                                dispatch(setLoginState('Finished logging'));
                                dispatch(changeAppRoot('after-login'));
                            })
                            .catch((error) => {
                                console.log('Getting data from local db resulted in error: ', error);
                                dispatch(setLoginState('Error'))
                            })
                    }
                    if (success) {
                        Promise.all(promises)
                            .then((result) => {
                                console.log("Finished getting data from local db: ", result);
                                dispatch(setLoginState('Finished logging'));
                                dispatch(changeAppRoot('after-login'));
                            })
                            .catch((error) => {
                                console.log('Getting data from local db resulted in error: ', error);
                                dispatch(setLoginState('Error'))
                            })
                    }
                })

                // dispatch(getOutbreakById(response.activeOutbreakId, null, dispatch));
                // dispatch(getContactsForOutbreakId(response.activeOutbreakId, config.defaultFilterForContacts, null, dispatch));
                // dispatch(getTranslations(response.languageId, dispatch));
                // dispatch(getReferenceData(null, dispatch));
                // dispatch(getEventsForOutbreakId(response.activeOutbreakId, null, dispatch));
                // dispatch(getCasesForOutbreakId(response.activeOutbreakId, null, null, dispatch));
                // dispatch(getFollowUpsForOutbreakId(user.activeOutbreakId, null, user.token));
                // }
            }
        })
    }
}

export function logoutUser() {
    return async function (dispatch) {
        dispatch(changeAppRoot('login'));
    }
}

export function cleanDataAfterLogout() {
    return async function (dispatch) {
        storeData('loggedUser', '', (error, response) => {
            dispatch(storeUser(null));
            dispatch(storeContacts(null));
            dispatch(storeFollowUps(null));
            dispatch(storeCases(null));
            dispatch(storeEvents(null));
            dispatch(storeOutbreak(null));
        });
    }
}

export function getUserById(userId, token) {
    return async function(dispatch) {
        console.log("getUserById userId: ", userId);
        getUserByIdRequest(userId, token, (error, response) => {
            if (error) {
                console.log("*** getUserById error: ", error);
                dispatch(addError(errorTypes.ERROR_GET_USER));
                // dispatch(changeAppRoot('login'));
            }
            if (response) {
                // console.log('getUserById: ', response);

                // Here is the local storage handling
                let promises = [];
                promises.push(getOutbreakById(response.activeOutbreakId, null, dispatch));
                promises.push(getAvailableLanguages(dispatch));
                // promises.push(getContactsForOutbreakIdWithPromises(response.activeOutbreakId, null, null, dispatch));
                // promises.push(getFollowUpsForOutbreakIdWithPromises(response.activeOutbreakId, {date: new Date().toISOString()}, null, dispatch));
                promises.push(getTranslations(response && response.languageId ? response.languageId : 'english_us', dispatch));
                promises.push(getReferenceData(null, dispatch));
                promises.push(getEventsForOutbreakId(response.activeOutbreakId, null, dispatch));
                promises.push(getCasesForOutbreakIdWithPromise(response.activeOutbreakId, null, null, dispatch));

                // Store the user to the redux store, and also store the userId to the AsyncStorage
                dispatch(storeUser(response));
                // dispatch(storeData("loggedUser", response._id, () => {}));


                Promise.all(promises)
                    .then((result) => {
                        console.log("Finished getting data from local db: ", result);
                        dispatch(setLoginState('Finished logging'));
                        dispatch(changeAppRoot('after-login'));
                    })
                    .catch((error) => {
                        console.log('Getting data from local db resulted in error: ', error);
                        dispatch(setLoginState('Finished logging'))
                    })
            }

        })
    }
}

export function updateUser(user) {
    return async function (dispatch) {
        updateUserRequest(user, (error, newUser) => {
            if (error) {
                console.log('Error while updating user: ', error);
                dispatch(addError(errorTypes.ERROR_UPDATE_USER));
            }
            if (newUser) {
                dispatch(storeUser(newUser));
            }
        })
    }
}