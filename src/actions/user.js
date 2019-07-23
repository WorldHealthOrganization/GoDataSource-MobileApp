/**
 * Created by florinpopa on 03/07/2018.
 */
import {ACTION_TYPE_STORE_USER} from './../utils/enums';
import { batchActions } from 'redux-batched-actions';
import {changeAppRoot, getTranslations, saveTranslation, saveAvailableLanguages} from './app';
import {loginUserRequest, getUserByIdRequest, updateUserRequest} from './../queries/user';
import {getUserRoles} from './../actions/role';
import {getUserTeams} from './../actions/teams'
import { getFollowUpsForOutbreakIdWithPromises } from './followUps';
import { getCasesForOutbreakIdWithPromise } from './cases';
import { getClusters } from './clusters';
import { getEventsForOutbreakId } from './events';
import { getOutbreakById } from './outbreak';
import { addError } from './errors';
import {getReferenceData, storeReferenceData} from './referenceData';
import {getHelpCategory} from './helpCategory';
import {getHelpItem} from './helpItem';
import errorTypes from './../utils/errorTypes';
import {storeContacts} from './contacts';
import {storeCases} from './cases';
import {storeEvents} from './events';
import {storeHelpCategory} from './helpCategory';
import {storeHelpItem} from './helpItem';
import {storeFollowUps} from './followUps';
import {storeOutbreak, storeLocationsList, storeLocations} from './outbreak';
import {storeUserTeams} from './teams';
import {storeClusters} from './clusters';
import {setLoginState, storeData, getAvailableLanguages, setSyncState} from './app';
import {storePermissions} from './role';
import {storeExposures} from './exposure';
import {getLocations} from './locations';
import moment from 'moment';
import get from 'lodash/get';
import {middlewareFunction} from './app';
import {createDate} from './../utils/functions';

// Add here only the actions, not also the requests that are executed.
// For that purpose is the requests directory
export function storeUser(user) {
    return {
        type: ACTION_TYPE_STORE_USER,
        payload: user
    }
}

export function loginUser(credentials) {
    // All dispatches will be done from here
    return async function (dispatch) {
        dispatch(setLoginState('Loading....'));
        loginUserRequest(credentials, async (errorLogin, user) => {
            if (errorLogin) {
                let error = null;
                if (error === 'There is no active Outbreak configured for your user. You have to configure an active Outbreak for your user from the web portal and resync the data with the hub') {
                    error = {type: 'Login error', message: error};
                } else {
                    error = errorTypes.ERROR_LOGIN;
                }
                dispatch(batchActions([
                    setLoginState('Error'),
                    addError(error)
                ]))
            }
            if (user) {
                // If we have the user, proceed to load all the necessary data
                dispatch(computeCommonData(true, user));
            }
        })
    }
}

export function newLoginUser(credentials) {
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
                    .then(async (responseOutbreak) => {
                        // Prepare batch data
                        console.log('Result for find time for: start getting addtional data: ', new Date());
                        let start = new Date().getTime();
                        try {
                            let availableLanguages = await getAvailableLanguages(null);
                            let referenceData = await getReferenceData(null, null);
                            let translations = await getTranslations(response.languageId, null);
                            let clusters = await getClusters(null, null);
                            let userRoles = await getUserRoles(response.roleIds, null);
                            let userTeams = await getUserTeams(response._id, null);
                            let cases = await getCasesForOutbreakIdWithPromise(response.activeOutbreakId, null, null, null);
                            let events = await getEventsForOutbreakId(response.activeOutbreakId, null, null);
                            // Do batch actions
                            console.log('Result for find time for: Got all the data, time to dispatch batch actions: ', new Date().getTime() - start);
                            dispatch(batchActions([
                                storeUser(response),
                                storeLocationsList(responseOutbreak.locationsList),
                                storeLocations(responseOutbreak.treeLocationsList),
                                saveAvailableLanguages(availableLanguages),
                                storeReferenceData(referenceData),
                                saveTranslation(translations),
                                storeClusters(clusters),
                                storePermissions(userRoles),
                                storeUserTeams(userTeams),
                                storeCases(cases),
                                storeEvents(events),
                                setLoginState('Finished logging'),
                                changeAppRoot('after-login')
                            ]))
                        } catch (errorPromises) {
                            console.log('Error promises: ', errorPromises);
                        }

                        // promises.push(getContactsForOutbreakIdWithPromises(response.activeOutbreakId, null, null, dispatch));
                        // promises.push(getFollowUpsForOutbreakIdWithPromises(response.activeOutbreakId, null, null, null, dispatch));
                        // promises.push(getTranslations(response.languageId, dispatch));
                        // promises.push(getAvailableLanguages(dispatch));
                        // promises.push(getReferenceData(null, dispatch));
                        // promises.push(getHelpCategory(null, dispatch));
                        // promises.push(getHelpItem(null, dispatch));
                        // promises.push(getEventsForOutbreakId(response.activeOutbreakId, null, dispatch));
                        // promises.push(getClusters(null, dispatch));
                        // promises.push(getCasesForOutbreakIdWithPromise(response.activeOutbreakId, null, null, dispatch));
                        // promises.push(getUserRoles(response.roleIds, dispatch));
                        // promises.push(getUserTeams(response._id, dispatch));


                        // Promise.all(promises)
                        //     .then((result) => {
                        //         console.log("Finished getting data from local db: ", result);
                        //         storeData('loggedUser', response._id, (error, success) => {
                        //             if (error) {
                        //                 console.log("An error occurred while trying to save logged user. Proceed to log: ", error);
                        //                 dispatch(setLoginState('Error'));
                        //             }
                        //             if (success) {
                        //                 dispatch(storeUser(response));
                        //                 dispatch(setLoginState('Finished logging'));
                        //                 dispatch(changeAppRoot('after-login'));
                        //             }
                        //         })
                        //     })
                        //     .catch((error) => {
                        //         console.log('Getting data from local db resulted in error: ', error);
                        //         dispatch(setLoginState('Error'))
                        //     });
                    })
                    .catch((errorOutbreak) => {
                        console.log('Getting data from local db resulted in error: ', errorOutbreak);
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

export function logoutUser() {
    return async function (dispatch) {
        dispatch(changeAppRoot('login'));
    }
}

export function cleanDataAfterLogout() {
    return async function (dispatch) {
        storeData('loggedUser', '', (error, response) => {
            // Do logout cleanup as a batch
            dispatch(batchActions([
                storeUser(null),
                storeContacts(null),
                storeFollowUps(null),
                storeCases(null),
                storeExposures(null),
                storeEvents(null),
                storeOutbreak(null),
                storeHelpCategory(null),
                storeHelpItem(null),
                storeClusters(null),
                storePermissions(null),
                storeUserTeams(null)
            ]));
            // dispatch(storeUser(null));
            // dispatch(storeContacts(null));
            // dispatch(storeFollowUps(null));
            // dispatch(storeCases(null));
            // dispatch(storeEvents(null));
            // dispatch(storeOutbreak(null));
            // dispatch(storeHelpCategory(null));
            // dispatch(storeHelpItem(null));
            // dispatch(storeClusters(null));
            // dispatch(storePermissions(null));
            // dispatch(storeUserTeams(null));
        });
    }
}

export function getUserById(userId, token, refreshFollowUps, nativeEventEmitter) {
    return async function (dispatch, getState) {
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
                    dispatch(setSyncState({ id: 'sync', status: 'test' }));
                }

                dispatch(computeCommonData(false, response, refreshFollowUps, getState().app.filters));

                // promises.push(getOutbreakById(response.activeOutbreakId, null, dispatch));

                // getOutbreakById(response.activeOutbreakId, null, dispatch)
                //     .then((responseOutbreak) => {
                //         getUserTeams(response._id, dispatch)
                //             .then((responseUserTeams) => {
                //                 SyncRequestsWithPromises(refreshFollowUps, response, responseUserTeams, dispatch, getState(), nativeEventEmitter)
                //             })
                //             .catch((errorTeams) => {
                //                 console.log('Getting data from local db resulted in error: ', error);
                //                 SyncRequestsWithPromises(refreshFollowUps, response, null, dispatch, getState(), nativeEventEmitter)
                //             })
                //     })
                //     .catch((errorOutbreak) => {
                //         console.log('Getting data from local db resulted in error: ', error);
                //         dispatch(setLoginState('Error'))
                //     })
            }

        })
    }
}

async function SyncRequestsWithPromises(refreshFollowUps, response, responseUserTeams, dispatch, state, nativeEventEmitter) {
    let promises = [];

    // Get all the promises results
    console.log('Result for find time for: start getting addtional data: ', new Date());
    let start = new Date().getTime();
    try {
        let referenceData = await getReferenceData(null, null);
        let userRoles = await getUserRoles(response.roleIds, null);
        let clusters = await getClusters(null, null);
        let translations = await getTranslations(response && response.languageId ? response.languageId : 'english_us', null);
        console.log('Result for find time for: Got all the data, time to dispatch batch actions: ', new Date().getTime() - start);
        dispatch(batchActions([
            storeUser(response),
            storeReferenceData(referenceData),
            storePermissions(userRoles),
            storeClusters(clusters),
            saveTranslation(translations),
            setLoginState('Finished logging'),
            setSyncState('Finished processing'),
            changeAppRoot('after-login')
        ]))
    } catch (promisesError) {
        console.log('Promise find error: ', promisesError);
    }

    // promises.push(getAvailableLanguages(dispatch));
    // if (refreshFollowUps) {
    //     let now = new Date();
    //     promises.push(getFollowUpsForOutbreakIdWithPromises(response.activeOutbreakId, state.app.filters['FollowUpsScreen'] || {
    //         date: new Date(new Date((now.getUTCMonth() + 1) + '/' + now.getUTCDate() + '/' + now.getUTCFullYear()).getTime() - ((moment().isDST() ? now.getTimezoneOffset() : now.getTimezoneOffset() - 60) * 60 * 1000)),
    //         searchText: ''
    //     }, responseUserTeams, null, dispatch));
    // }
    // promises.push(getContactsForOutbreakIdWithPromises(response.activeOutbreakId, null, null, dispatch));
    // promises.push(getTranslations(response && response.languageId ? response.languageId : 'english_us', dispatch));
    // promises.push(getReferenceData(null, dispatch));
    // promises.push(getHelpCategory(null, dispatch));
    // promises.push(getHelpItem(null, dispatch));
    // promises.push(getEventsForOutbreakId(response.activeOutbreakId, null, dispatch));
    // promises.push(getCasesForOutbreakIdWithPromise(response.activeOutbreakId, null, null, dispatch));
    // promises.push(getUserRoles(response.roleIds, dispatch));
    // promises.push(getClusters(null, dispatch));

    // Store the user to the redux store, and also store the userId to the AsyncStorage
    // dispatch(storeUser(response));
    // dispatch(storeData("loggedUser", response._id, () => {}));


    // Promise.all(promises)
    //     .then((result) => {
    //         console.log("Finished getting data from local db: ", result);
    //         dispatch(setLoginState('Finished logging'));
    //         if (refreshFollowUps) {
    //             dispatch(setSyncState('Finished processing'));
    //         }
    //         dispatch(changeAppRoot('after-login'));
    //         console.log('NativeEventEmitter: ', typeof nativeEventEmitter, nativeEventEmitter);
    //         console.log("Typeof nativeEventEmitter: ", typeof nativeEventEmitter.appLoaded);
    //         if (nativeEventEmitter) {
    //             dispatch(middlewareFunction(nativeEventEmitter));
    //         }
    //     })
    //     .catch((error) => {
    //         console.log('Getting data from local db resulted in error: ', error);
    //         if (refreshFollowUps) {
    //             dispatch(setSyncState('Finished processing'));
    //         }
    //         dispatch(setLoginState('Finished logging'));
    //     })
}

export function computeCommonData(storeUserBool, user, refreshFollowUps, filters) {
    return async function (dispatch) {
        try {
            let outbreakAndLocationInfo = await getOutbreakById(user.activeOutbreakId, null, null);
            if (outbreakAndLocationInfo) {
                let promises = [];

                // promises.push(getContactsForOutbreakIdWithPromises(response.activeOutbreakId, null, null, dispatch));
                // promises.push(getFollowUpsForOutbreakIdWithPromises(response.activeOutbreakId, null, null, null, dispatch));
                let userTeams = await getUserTeams(user._id, null);
                promises.push(getUserRoles(user.roleIds, null));
                promises.push(getClusters(null, null));
                promises.push(getAvailableLanguages(dispatch));
                promises.push(getReferenceData(null, dispatch));
                promises.push(getTranslations(user.languageId, null));
                promises.push(getLocations(outbreakAndLocationInfo.locationIds || null, null));
                promises.push(getHelpCategory(null, dispatch));
                promises.push(getHelpItem(null, dispatch));
                if (refreshFollowUps) {
                    let now = createDate(null);
                    promises.push(getFollowUpsForOutbreakIdWithPromises(user.activeOutbreakId, filters['FollowUpsScreen'] || {
                        date: new Date(new Date((now.getUTCMonth() + 1) + '/' + now.getUTCDate() + '/' + now.getUTCFullYear()).getTime() - ((moment().isDST() ? now.getTimezoneOffset() : now.getTimezoneOffset() - 60) * 60 * 1000)),
                        searchText: ''
                    }, userTeams, null, dispatch));
                }
                promises.push(getEventsForOutbreakId(user.activeOutbreakId, null, null));
                promises.push(getCasesForOutbreakIdWithPromise(user.activeOutbreakId, null, null, null));
                // promises.push(getUserTeams(user._id, null));

                Promise.all(promises)
                    .then((dataArray) => {
                        let actionsObject = dataArray.reduce((obj, item) => {
                            let key = Object.keys(item)[0];
                            return Object.assign({}, obj, {[key]: item[key]});
                        }, {});

                        let arrayOfActions = [
                            storeUser(user),
                            storeOutbreak(outbreakAndLocationInfo || null),
                            storeLocationsList(get(actionsObject, 'locations.locationsList', null)),
                            storeLocations(get(actionsObject, 'locations.treeLocationsList', null)),
                            saveAvailableLanguages(get(actionsObject,  'availableLanguages', null)),
                            storeReferenceData(get(actionsObject,  'referenceData', null)),
                            saveTranslation(get(actionsObject,  'translations', null)),
                            storeClusters(get(actionsObject,  'clusters', null)),
                            storePermissions(get(actionsObject,  'userRoles', null)),
                            storeUserTeams(userTeams),
                            storeExposures(get(actionsObject,  'cases', null)),
                            storeEvents(get(actionsObject,  'events', null)),
                            storeHelpCategory(get(actionsObject,  'helpCategory', null)),
                            storeHelpItem(get(actionsObject,  'helpItem', null)),
                            setLoginState('Finished logging'),
                            changeAppRoot('after-login')
                        ];

                        if(refreshFollowUps) {
                            arrayOfActions.push(setSyncState({id: 'tests', status:'Success'}));
                            arrayOfActions.push(storeFollowUps(get(actionsObject, 'followUps.followUps', null)));
                            arrayOfActions.push(storeContacts(get(actionsObject, 'followUps.contacts', null)));
                        }

                        if (storeUserBool) {
                            storeData('loggedUser', user._id, (error, success) => {
                                if (error) {
                                    dispatch(batchActions([
                                        setLoginState('Error'),
                                        addError({type: 'Login error', message: "Error while saving logged user"})
                                    ]))
                                }
                                if (success) {
                                    dispatch(batchActions(arrayOfActions));
                                }
                            })
                        } else {
                            dispatch(batchActions(arrayOfActions));
                        }
                    })
                    .catch((errorProcessInitialData) => {
                        dispatch(batchActions([
                            setLoginState('Error'),
                            addError(errorProcessInitialData)
                        ]))
                    })

            } else {
                dispatch(batchActions([
                    setLoginState('Error'),
                    addError({type: 'Login error', message: "No outbreak was found"})
                ]))
            }
        } catch (errorGetData) {
            console.log('Error get data: ', errorGetData);
            dispatch(batchActions([
                setLoginState('Error'),
                addError(errorGetData)
            ]))
        }
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