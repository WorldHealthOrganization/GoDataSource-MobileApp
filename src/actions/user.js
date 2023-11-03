/**
 * Created by florinpopa on 03/07/2018.
 */
import {ACTION_TYPE_STORE_USER} from './../utils/enums';
import {batchActions} from 'redux-batched-actions';
import {
    changeAppRoot,
    getAvailableLanguages,
    getTranslations,
    saveAvailableLanguages,
    saveSelectedScreen,
    saveTranslation,
    setLoaderState,
    setLoginState, setTimezone,
    storeData
} from './app';
import {getUserByIdRequest, getUserTeamMembers, loginUserRequest, updateUserRequest} from './../queries/user';
import {getUserRoles} from './../actions/role';
import {getUserTeams} from './../actions/teams';
import {getClusters, storeClusters} from './clusters';
import {
    getOutbreakById,
    storeLocations,
    storeLocationsList,
    storeOutbreak,
    storeUserLocations,
    storeUserLocationsList
} from './outbreak';
import {addError} from './errors';
import {getReferenceData, storeReferenceData} from './referenceData';
import {getHelpCategory, storeHelpCategory} from './helpCategory';
import {getHelpItem, storeHelpItem} from './helpItem';
import errorTypes from './../utils/errorTypes';
import {storeUserTeams} from './teams';
import {storePermissions} from './role';
import {getLocations} from './locations';
import get from 'lodash/get';
import lodashIntersection from 'lodash/intersection';
import {filterByUser} from './../utils/functions';
import constants, {PERMISSIONS_CONTACT_OF_CONTACT} from './../utils/constants';
import {checkArrayAndLength} from "../utils/typeCheckingFunctions";
import {updateRequiredFields} from "../utils/functions";
import {sideMenuKeys} from './../utils/config';
import AsyncStorage from '@react-native-community/async-storage';

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
    return async function (dispatch, getState) {
        const loginState = getState().app.loginState;
        if(loginState === 'Loading....'){
            return;
        }
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
                dispatch(setLoginState('Success'));
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

export function getUserById(userId, skipLoad) {
    return async function (dispatch) {
        console.log("getUserById userId: ", userId);
        getUserByIdRequest(userId, (error, response) => {
            if (error) {
                console.log("*** getUserById error: ", error);
                dispatch(addError(errorTypes.ERROR_GET_USER));
                // dispatch(changeAppRoot('login'));
            }
            if (response) {
                dispatch(computeCommonData(false, response, skipLoad));
            }

        })
    }
}

export function computeOutbreakSwitch(user, outbreakId){
    return async function (dispatch, getState) {
        try{
            dispatch(setLoaderState(true));
            let outbreakAndLocationInfo = await getOutbreakById(outbreakId);
            const locations = await getLocations(outbreakAndLocationInfo.locationIds || null);
            // If there is a difference between user language and the device available languages, update user
            let availableLanguages = await getAvailableLanguages();
            let userTeams = await getUserTeams(user._id);
            if (!availableLanguages.deviceLanguages.find((e) => e.value === user.languageId)) {
                user = updateRequiredFields(outbreakId, user._id, user, 'update');
                await updateUserRequest(user);
            }
            const clusters = await getClusters(outbreakId);
            await getTranslations(user.languageId, outbreakId);

            let arrayOfActions = [
                storeUser(user),
                storeOutbreak(outbreakAndLocationInfo || null),
                storeLocationsList(get(locations, 'locations.locationsList', null)),
                storeLocations(get(locations, 'locations.treeLocationsList', null)),
                storeUserLocationsList(get(locations, 'locations.locationsList', null)),
                storeUserLocations(filterByUser(get(locations, 'locations.treeLocationsList', null), userTeams)),
                saveAvailableLanguages(availableLanguages),
                storeClusters(get(clusters,  'clusters', null))
            ];

            dispatch(batchActions(arrayOfActions));
            dispatch(setLoaderState(false));
        } catch (e) {
            console.log("Error switching outbreaks", e);
        }

    }
}


export function computeCommonData(storeUserBool, user, skipLoad, outbreakId) {
    return async function (dispatch, getState) {
        try {
            if(!outbreakId) {
                const storageOutbreakId = await AsyncStorage.getItem("outbreakId");
                console.log("Storage outbreak Id", storageOutbreakId);
                console.log("User outbreak Id", user.activeOutbreakId);
                if(storageOutbreakId  && !storeUserBool) {outbreakId = storageOutbreakId}
                else if(user.activeOutbreakId){outbreakId = user.activeOutbreakId}
                else {
                    //TODO: in case there is no outbreak, select first from list
                }
            }
            console.log("All user data", user);
            let outbreakAndLocationInfo;
            try {
                outbreakAndLocationInfo = await getOutbreakById(outbreakId);
            } catch (e) {
                if(outbreakId !== user.activeOutbreakId){
                    outbreakId = user.activeOutbreakId;
                    outbreakAndLocationInfo = await getOutbreakById(outbreakId);
                }
            }
            if (outbreakAndLocationInfo) {
                let promises = [];

                let userTeams = await getUserTeams(user._id);
                let userRoles = await getUserRoles(user.roleIds);
                let availableLanguages = await getAvailableLanguages(dispatch);

                // If there is a difference between user language and the device available languages, update user
                if (!availableLanguages.deviceLanguages.find((e) => e.value === user.languageId)) {
                    //? modify a property of the object and then just modify the object entirely?
                    user.languageId = get(availableLanguages, 'deviceLanguages[0].value', user.languageId);
                    user = updateRequiredFields(outbreakId, user._id, user, 'update');

                    promises.push(updateUserRequest(user));
                }

                promises.push(getClusters(outbreakId));
                // promises.push(getAvailableLanguages(dispatch));
                promises.push(getReferenceData());
                promises.push(getTranslations(user.languageId, outbreakId));
                promises.push(getLocations(outbreakAndLocationInfo.locationIds || null));
                promises.push(getHelpCategory());
                promises.push(getHelpItem());

                // Compute startup screen
                let selectedScreen = sideMenuKeys[0];
                try {
                    selectedScreen = getState().app.selectedScreen;
                } catch(errorAssign) {
                    console.log('Error while assigning');
                }
                console.log('SelectedScreen: ', selectedScreen);
                // if (typeof selectedScreen !== 'number') {
                //     selectedScreen = 0;
                // }
                if (!checkArrayAndLength(
                    lodashIntersection(userRoles, [
                        constants.PERMISSIONS_FOLLOW_UP.followUpAll,
                        constants.PERMISSIONS_FOLLOW_UP.followUpList
                    ])
                )) {
                    if (checkArrayAndLength(
                        lodashIntersection(userRoles, [
                            constants.PERMISSIONS_CONTACT.contactAll,
                            constants.PERMISSIONS_CONTACT.contactList
                        ])
                    )) {
                        selectedScreen = sideMenuKeys[1];
                    } else {
                        if (checkArrayAndLength(
                            lodashIntersection(userRoles, [
                                PERMISSIONS_CONTACT_OF_CONTACT.contactsOfContactsAll,
                                PERMISSIONS_CONTACT_OF_CONTACT.contactsOfContactsList
                            ])
                        )) {
                            selectedScreen = sideMenuKeys[2];
                        } else if (checkArrayAndLength(
                            lodashIntersection(userRoles, [
                                constants.PERMISSIONS_CASE.caseAll,
                                constants.PERMISSIONS_CASE.caseList
                            ])
                        )) {
                            selectedScreen = sideMenuKeys[3];
                        } else {
                            selectedScreen = sideMenuKeys[4]
                        }
                    }
                }

                let batchedActionsArray = [
                    saveSelectedScreen(selectedScreen),
                    changeAppRoot('after-login'),
                    // setLoaderState(!skipLoad),
                    setLoginState('Finished logging'),
                ];

                if (!skipLoad) {
                    batchedActionsArray.push(setLoaderState(!skipLoad));
                }

                dispatch(batchActions(batchedActionsArray));

                Promise.all(promises)
                    .then((dataArray) => {
                        let actionsObject = dataArray.reduce((obj, item) => {
                            let key = Object.keys(item)[0];
                            return Object.assign({}, obj, {[key]: item[key]});
                        }, {});

                        // First check if the user has at least one of the required permissions to see data
                        if (checkArrayAndLength(lodashIntersection(userRoles, [
                            constants.PERMISSIONS_FOLLOW_UP.followUpAll,
                            constants.PERMISSIONS_FOLLOW_UP.followUpList,
                            constants.PERMISSIONS_CONTACT.contactAll,
                            constants.PERMISSIONS_CONTACT.contactList,
                            PERMISSIONS_CONTACT_OF_CONTACT.contactsOfContactsAll,
                            PERMISSIONS_CONTACT_OF_CONTACT.contactsOfContactsList,
                            constants.PERMISSIONS_CASE.caseAll,
                            constants.PERMISSIONS_CASE.caseList,
                            constants.PERMISSIONS_LAB_RESULT.labResultAll,
                            constants.PERMISSIONS_LAB_RESULT.labResultList
                        ]))) {

                            let arrayOfActions = [
                                storeUser(user),
                                storeOutbreak(outbreakAndLocationInfo || null),
                                storeLocationsList(get(actionsObject, 'locations.locationsList', null)),
                                storeLocations(get(actionsObject, 'locations.treeLocationsList', null)),
                                storeUserLocationsList(get(actionsObject, 'locations.locationsList', null)),
                                storeUserLocations(filterByUser(get(actionsObject, 'locations.treeLocationsList', null), userTeams)),
                                saveAvailableLanguages(availableLanguages),
                                storeReferenceData(get(actionsObject,  'referenceData', null)),
                                saveTranslation(get(actionsObject,  'translations', null)),
                                storeClusters(get(actionsObject,  'clusters', null)),
                                storePermissions(userRoles),
                                storeUserTeams(userTeams),
                                storeHelpCategory(get(actionsObject,  'helpCategory', null)),
                                storeHelpItem(get(actionsObject,  'helpItem', null))
                            ];

                            if (!skipLoad) {
                                arrayOfActions.push(setLoaderState(skipLoad));
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
                        console.log("Error initial data", errorProcessInitialData);
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
        updateUserRequest(user)
            .then((newUser) => {
                dispatch(storeUser(newUser.user));
            })
            .catch((error) => {
                console.log('Error while updating user: ', error);
                dispatch(addError(errorTypes.ERROR_UPDATE_USER));
            })
    }
}

export function getUsersForOutbreakId({outbreakId, usersFilter, searchText, lastElement, offset}, computeCount, props) {
    let teams = get(props, 'teams', []);
    let userList = [];
    for (let i=0; i< teams.length; i++){
        userList = userList.concat(get(teams, `[${i}].userIds`, []));
    }

    return getUserTeamMembers(userList, {outbreakId, usersFilter, searchText: searchText.text})
        .then((response) => {
            return {
                data: response.map((user) => {
                    return {_id: user._id, mainData: user, exposureData: null}
                }),
                dataCount: checkArrayAndLength(response) ? response.length : 0
            }
        })
}