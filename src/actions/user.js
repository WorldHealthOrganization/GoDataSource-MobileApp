/**
 * Created by florinpopa on 03/07/2018.
 */
import {ACTION_TYPE_STORE_USER} from './../utils/enums';
import { batchActions } from 'redux-batched-actions';
import {changeAppRoot, getTranslations, saveTranslation, saveAvailableLanguages} from './app';
import {loginUserRequest, getUserByIdRequest, updateUserRequest} from './../queries/user';
import {getUserRoles} from './../actions/role';
import {getUserTeams} from './../actions/teams';
import { getClusters } from './clusters';
import { getOutbreakById } from './outbreak';
import { addError } from './errors';
import {getReferenceData, storeReferenceData} from './referenceData';
import {getHelpCategory} from './helpCategory';
import {getHelpItem} from './helpItem';
import errorTypes from './../utils/errorTypes';
import {storeHelpCategory} from './helpCategory';
import {storeHelpItem} from './helpItem';
import {storeOutbreak, storeLocationsList, storeLocations, storeUserLocationsList, storeUserLocations} from './outbreak';
import {storeUserTeams} from './teams';
import {storeClusters} from './clusters';
import {setLoginState, storeData, getAvailableLanguages, setSyncState, saveSelectedScreen} from './app';
import {storePermissions} from './role';
import {getLocations, getUserLocations} from './locations';
import get from 'lodash/get';
import lodashIntersection from 'lodash/intersection';
import set from 'lodash/set';
import {filterByUser} from './../utils/functions';
import constants from './../utils/constants';
import {checkArrayAndLength} from "../utils/typeCheckingFunctions";

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
            let outbreakAndLocationInfo = await getOutbreakById(user.activeOutbreakId);
            if (outbreakAndLocationInfo) {
                let promises = [];

                let userTeams = await getUserTeams(user._id);
                promises.push(getUserRoles(user.roleIds));
                promises.push(getClusters());
                promises.push(getAvailableLanguages(dispatch));
                promises.push(getReferenceData());
                promises.push(getTranslations(user.languageId));
                promises.push(getLocations(outbreakAndLocationInfo.locationIds || null));
                promises.push(getUserLocations(outbreakAndLocationInfo.locationIds || null));
                promises.push(getHelpCategory());
                promises.push(getHelpItem());

                Promise.all(promises)
                    .then((dataArray) => {
                        let actionsObject = dataArray.reduce((obj, item) => {
                            let key = Object.keys(item)[0];
                            return Object.assign({}, obj, {[key]: item[key]});
                        }, {});

                        // TODO remove after testing
                        // actionsObject.userRoles.push(constants.PERMISSIONS_CONTACT.contactAll);
                        // actionsObject.userRoles.push(constants.PERMISSIONS_CASE.caseAll);
                        // actionsObject.userRoles.push(constants.PERMISSIONS_FOLLOW_UP.followUpDelete);
                        // actionsObject.userRoles.push(constants.PERMISSIONS_FOLLOW_UP.followUpView);
                        // actionsObject.userRoles.push(constants.PERMISSIONS_FOLLOW_UP.followUpCreate);
                        // actionsObject.userRoles.push(constants.PERMISSIONS_USER.userModifyOwnAccount);

                        // First check if the user has at least one of the required permissions to see data
                        if (checkArrayAndLength(lodashIntersection(get(actionsObject, 'userRoles', []), [
                            constants.PERMISSIONS_FOLLOW_UP.followUpAll,
                            constants.PERMISSIONS_FOLLOW_UP.followUpList,
                            constants.PERMISSIONS_CONTACT.contactAll,
                            constants.PERMISSIONS_CONTACT.contactList,
                            constants.PERMISSIONS_CASE.caseAll,
                            constants.PERMISSIONS_CASE.caseList
                        ]))) {
                            let selectedScreen = 0;

                            if (!checkArrayAndLength(
                                lodashIntersection(get(actionsObject, 'userRoles', []), [
                                    constants.PERMISSIONS_FOLLOW_UP.followUpAll,
                                    constants.PERMISSIONS_FOLLOW_UP.followUpList
                                ])
                            )) {
                                    if (checkArrayAndLength(
                                        lodashIntersection(get(actionsObject, 'userRoles', []), [
                                            constants.PERMISSIONS_FOLLOW_UP.followUpAll,
                                            constants.PERMISSIONS_FOLLOW_UP.followUpList
                                        ])
                                    )) {
                                        selectedScreen = 1;
                                    } else {
                                        selectedScreen = 2;
                                    }
                            }

                            let arrayOfActions = [
                                storeUser(user),
                                storeOutbreak(outbreakAndLocationInfo || null),
                                storeLocationsList(get(actionsObject, 'locations.locationsList', null)),
                                storeLocations(get(actionsObject, 'locations.treeLocationsList', null)),
                                storeUserLocationsList(get(actionsObject, 'userLocations.userLocationsList', null)),
                                storeUserLocations(filterByUser(get(actionsObject, 'userLocations.userTreeLocationsList', null), userTeams)),
                                saveAvailableLanguages(get(actionsObject,  'availableLanguages', null)),
                                storeReferenceData(get(actionsObject,  'referenceData', null)),
                                saveTranslation(get(actionsObject,  'translations', null)),
                                storeClusters(get(actionsObject,  'clusters', null)),
                                storePermissions(get(actionsObject,  'userRoles', null)),
                                // storePermissions([
                                //     // 'contact_modify',
                                //     'outbreak_view',
                                //     // 'follow_up_list',
                                //     'contact_list',
                                //     'contact_view',
                                //     'case_list',
                                //     'case_view',
                                //     'help_list_category_item'
                                // ]),
                                storeUserTeams(userTeams),
                                storeHelpCategory(get(actionsObject,  'helpCategory', null)),
                                storeHelpItem(get(actionsObject,  'helpItem', null)),
                                setLoginState('Finished logging'),
                                saveSelectedScreen(selectedScreen),
                                changeAppRoot('after-login')
                            ];

                            if(refreshFollowUps) {
                                arrayOfActions.push(setSyncState({id: 'tests', status:'Success'}));
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
                        } else {
                            // This means the user hasn't any of the permissions to view at least one type of data so
                            // the login should not occur
                            dispatch(batchActions([
                                cleanDataAfterLogout(),
                                setLoginState('Error'),
                                addError({type: 'Permissions error', message: `You don't have permissions to see the any of the data types. Please speak to the system administrator to see if there is an issue to your permissions`})
                            ]))
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