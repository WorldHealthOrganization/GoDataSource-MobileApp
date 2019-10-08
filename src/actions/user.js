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
// import storeContacts} from './contacts';
// import {storeCases} from './cases';
// import {storeEvents} from './events';
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
                // storeContacts(null),
                storeFollowUps(null),
                // storeCases(null),
                // storeExposures(null),
                // storeEvents(null),
                storeOutbreak(null),
                storeHelpCategory(null),
                storeHelpItem(null),
                storeClusters(null),
                storePermissions(null),
                storeUserTeams(null)
            ]));
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
            }

        })
    }
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
                // if (refreshFollowUps) {
                //     let now = createDate(null);
                //     promises.push(getFollowUpsForOutbreakIdWithPromises(user.activeOutbreakId, filters['FollowUpsScreen'] || {
                //         date: new Date(new Date((now.getUTCMonth() + 1) + '/' + now.getUTCDate() + '/' + now.getUTCFullYear()).getTime() - ((moment().isDST() ? now.getTimezoneOffset() : now.getTimezoneOffset() - 60) * 60 * 1000)),
                //         searchText: ''
                //     }, userTeams, null, dispatch));
                // }
                // promises.push(getEventsForOutbreakId(user.activeOutbreakId, null, null));
                // promises.push(getCasesForOutbreakIdWithPromise(user.activeOutbreakId, null, null, null));
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
                            // storeExposures(get(actionsObject,  'cases', null)),
                            // storeEvents(get(actionsObject,  'events', null)),
                            storeHelpCategory(get(actionsObject,  'helpCategory', null)),
                            storeHelpItem(get(actionsObject,  'helpItem', null)),
                            setLoginState('Finished logging'),
                            changeAppRoot('after-login')
                        ];

                        if(refreshFollowUps) {
                            arrayOfActions.push(setSyncState({id: 'tests', status:'Success'}));
                            // arrayOfActions.push(storeFollowUps(get(actionsObject, 'followUps.followUps', null)));
                            // arrayOfActions.push(storeContacts(get(actionsObject, 'followUps.contacts', null)));
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