/**
 * Created by florinpopa on 03/07/2018.
 */
import {ACTION_TYPE_STORE_USER} from './../utils/enums';
import { changeAppRoot, getTranslations } from './app';
import {loginUserRequest, getUserByIdRequest, updateUserRequest} from './../queries/user';
import {getUserRoles} from './../actions/role';
import {getUserTeams} from './../actions/teams'
import { getFollowUpsForOutbreakIdWithPromises } from './followUps';
import { getCasesForOutbreakIdWithPromise } from './cases';
import { getClusters } from './clusters';
import { getEventsForOutbreakId } from './events';
import { getOutbreakById } from './outbreak';
import { addError } from './errors';
import {getReferenceData} from './referenceData';
import {getHelpCategory} from './helpCategory';
import {getHelpItem} from './helpItem';
import errorTypes from './../utils/errorTypes';
import {storeContacts} from './contacts';
import {storeCases} from './cases';
import {storeEvents} from './events';
import {storeHelpCategory} from './helpCategory';
import {storeHelpItem} from './helpItem';
import {storeFollowUps} from './followUps';
import {storeOutbreak} from './outbreak';
import {storeUserTeams} from './teams';
import {storeClusters} from './clusters';
import {setLoginState, storeData, getAvailableLanguages, setSyncState} from './app';
import {storePermissions} from './role';
import moment from 'moment';
import _ from 'lodash';
import {middlewareFunction} from './app';

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
                if (error === 'There is no active Outbreak configured for your user. You have to configure an active Outbreak for your user from the web portal and resync the data with the hub') {
                    dispatch(addError({type: 'Login error', message: error}));
                } else {
                    dispatch(addError(errorTypes.ERROR_LOGIN));
                }
            }
            if (response) {
                // if (response.id) {
                    // Don't need to get user by id since the user is returned from the local database, so, instead, we store it to the redux store
                    // dispatch(getUserById(response.userId, response.id));

                // Here is the local storage handling
                let promises = [];
                getOutbreakById(response.activeOutbreakId, null, dispatch)
                    .then((responseOutbreak) => {
                        // promises.push(getContactsForOutbreakIdWithPromises(response.activeOutbreakId, null, null, dispatch));
                        // promises.push(getFollowUpsForOutbreakIdWithPromises(response.activeOutbreakId, null, null, null, dispatch));
                        promises.push(getTranslations(response.languageId, dispatch));
                        promises.push(getAvailableLanguages(dispatch));
                        promises.push(getReferenceData(null, dispatch));
                        // promises.push(getHelpCategory(null, dispatch));
                        // promises.push(getHelpItem(null, dispatch));
                        promises.push(getEventsForOutbreakId(response.activeOutbreakId, null, dispatch));
                        promises.push(getClusters(null, dispatch));
                        promises.push(getCasesForOutbreakIdWithPromise(response.activeOutbreakId, null, null, dispatch));
                        promises.push(getUserRoles(response.roleIds, dispatch));
                        promises.push(getUserTeams(response._id, dispatch));

                        let start = new Date().getTime();
                        executeTasksSync(promises)
                            .then((result) => {
                                console.log("Finished getting data from local db: ", result);
                                storeData('loggedUser', response._id, (error, success) => {
                                    if (error) {
                                        console.log("An error occurred while trying to save logged user. Proceed to log: ", error);
                                        dispatch(setLoginState('Error'));
                                    }
                                    if (success) {
                                        console.log('Result for find all the data: ', new Date().getTime() - start);
                                        dispatch(storeUser(response));
                                        dispatch(setLoginState('Finished logging'));
                                        dispatch(changeAppRoot('after-login'));
                                    }
                                })
                            })
                            .catch((error) => {
                                console.log('Getting data from local db resulted in error: ', error);
                                dispatch(setLoginState('Error'))
                            });
                    })
                    .catch((errorOutbreak) => {
                        console.log('Getting data from local db resulted in error: ', error);
                        dispatch(setLoginState('Error'))
                    })


                // Store the user to the redux store, and also store the userId to the AsyncStorage
                // dispatch(storeUser(response));
                // dispatch(storeData("loggedUser", response._id, () => {}));

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

async function executeTasksSync (tasks) {
    console.log('Here check you are in executeTaskSync: ', tasks);
    let tasksResponses = [];
    if (tasks && Array.isArray(tasks) && tasks.length > 0) {
        console.log('Here check first validation');
        for (let i=0; i<tasks.length; i++) {
            console.log('Here check tasks: ', tasks[i]);
            try {
                let aux = await tasks[i];
                console.log('Here check aux: ', aux);
                if (aux) {
                    tasksResponses.push(aux);
                }
            } catch (errorExecuteTask) {
                console.log('Error while trying to execute task: ', errorExecuteTask);
            }
        }

        console.log('Here check you have finished stuff: ', tasksResponses);

        if (tasksResponses.length === tasks.length) {
            return Promise.resolve('success');
        } else {
            return Promise.reject('failure');
        }
    } else {
        return Promise.reject('failure')
    };
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
            dispatch(storeHelpCategory(null));
            dispatch(storeHelpItem(null));
            dispatch(storeClusters(null));
            dispatch(storePermissions(null));
            dispatch(storeUserTeams(null));
        });
    }
}

export function getUserById(userId, token, refreshFollowUps, nativeEventEmitter) {
    return async function(dispatch, getState) {
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
                if (refreshFollowUps) {
                    dispatch(setSyncState({id: 'sync', status: 'test'}));
                }

                // promises.push(getOutbreakById(response.activeOutbreakId, null, dispatch));
                console.log('Result for find start getOutbreakById: ', new Date());
                getOutbreakById(response.activeOutbreakId, null, dispatch)
                    .then((responseOutbreak) => {
                        console.log('Result for find start getUserTeams: ', new Date());
                        getUserTeams(response._id, dispatch)
                            .then((responseUserTeams) => {
                                SyncRequestsWithPromises(refreshFollowUps, response, responseUserTeams, dispatch, getState(), nativeEventEmitter)
                            })
                            .catch((errorTeams) => {
                                console.log('Getting data from local db resulted in error: ', error);
                                SyncRequestsWithPromises(refreshFollowUps, response, null, dispatch, getState(), nativeEventEmitter)
                            })
                    })
                    .catch((errorOutbreak) => {
                        console.log('Getting data from local db resulted in error: ', error);
                        dispatch(setLoginState('Error'))
                    })
            }

        })
    }
}

function SyncRequestsWithPromises(refreshFollowUps, response, responseUserTeams, dispatch, state, nativeEventEmitter) {
    let promises = [];

    promises.push(getAvailableLanguages(dispatch));
    if (refreshFollowUps) {
        let now = new Date();
        promises.push(getFollowUpsForOutbreakIdWithPromises(response.activeOutbreakId, state.app.filters['FollowUpsScreen'] || {
            date: new Date(new Date((now.getUTCMonth() + 1) + '/' + now.getUTCDate() + '/' + now.getUTCFullYear()).getTime() - ((moment().isDST() ? now.getTimezoneOffset() : now.getTimezoneOffset() - 60) * 60 * 1000)),
            searchText: ''
        }, responseUserTeams, null, dispatch));
    }

    // getReferenceData(null, dispatch).then(() => {
    //     getEventsForOutbreakId(response.activeOutbreakId, null, dispatch).then(() => {
    //         getCasesForOutbreakIdWithPromise(response.activeOutbreakId, null, null, dispatch).then(() => {
    //             getUserRoles(response.roleIds, dispatch).then(() => {
    //                 getTranslations(response && response.languageId ? response.languageId : 'english_us', dispatch).then(() => {
    //                     getClusters(null, dispatch).then(() => {
    //                         dispatch(changeAppRoot('after-login'));
    //                         dispatch(storeUser(response));
    //                         let start = new Date().getTime();
    //                         console.log('Result for find all begin: ', new Date(start));
    //                         console.log('Result for find all end: ', new Date().getTime() - start, new Date());
    //                         console.log("Finished getting data from local db: ", result);
    //                         dispatch(setLoginState('Finished logging'));
    //                         if (refreshFollowUps) {
    //                             dispatch(setSyncState('Finished processing'));
    //                         }
    //                         // dispatch(changeAppRoot('after-login'));
    //                         // if (response && response.languageId !== 'english_us') {
    //                         //     dispatch(getTranslations(response && response.languageId ? response.languageId : 'english_us', dispatch))
    //                         // }
    //                         console.log('NativeEventEmitter: ', typeof nativeEventEmitter, nativeEventEmitter);
    //                         console.log("Typeof nativeEventEmitter: ", typeof nativeEventEmitter.appLoaded);
    //                         if (nativeEventEmitter) {
    //                             dispatch(middlewareFunction(nativeEventEmitter));
    //                         }
    //                     })
    //                 })
    //             })
    //         })
    //     });
    // });

    // promises.push(getContactsForOutbreakIdWithPromises(response.activeOutbreakId, null, null, dispatch));
    promises.push(getTranslations(response && response.languageId ? response.languageId : 'english_us', dispatch));
    promises.push(getReferenceData(null, dispatch));
    // promises.push(getHelpCategory(null, dispatch));
    // promises.push(getHelpItem(null, dispatch));
    promises.push(getEventsForOutbreakId(response.activeOutbreakId, null, dispatch));
    promises.push(getCasesForOutbreakIdWithPromise(response.activeOutbreakId, null, null, dispatch));
    promises.push(getUserRoles(response.roleIds, dispatch));
    promises.push(getClusters(null, dispatch));

    // Store the user to the redux store, and also store the userId to the AsyncStorage
    dispatch(storeUser(response));
    // dispatch(storeData("loggedUser", response._id, () => {}));


    console.log('Here Check if you have promises: ', p1romises);
    let start = new Date().getTime();
    console.log('Result for find all begin: ', new Date(start));
    executeTasksSync(promises)
        .then((result) => {
            console.log('Result for find all end: ', new Date().getTime() - start, new Date());
            console.log("Finished getting data from local db: ", result);
            dispatch(setLoginState('Finished logging'));
            if (refreshFollowUps) {
                dispatch(setSyncState('Finished processing'));
            }
            dispatch(changeAppRoot('after-login'));
            // if (response && response.languageId !== 'english_us') {
            //     dispatch(getTranslations(response && response.languageId ? response.languageId : 'english_us', dispatch))
            // }
            console.log('NativeEventEmitter: ', typeof nativeEventEmitter, nativeEventEmitter);
            console.log("Typeof nativeEventEmitter: ", typeof nativeEventEmitter.appLoaded);
            if (nativeEventEmitter) {
                dispatch(middlewareFunction(nativeEventEmitter));
            }
        })
        .catch((error) => {
            console.log('Getting data from local db resulted in error: ', error);
            if (refreshFollowUps) {
                dispatch(setSyncState('Finished processing'));
            }
            dispatch(setLoginState('Finished logging'));
        })
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