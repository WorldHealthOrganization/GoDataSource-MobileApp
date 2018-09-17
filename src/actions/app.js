/**
 * Created by florinpopa on 14/06/2018.
 */
import {
    ACTION_TYPE_ROOT_CHANGE,
    ACTION_TYPE_SAVE_SCREEN_SIZE,
    ACTION_TYPE_ADD_FILTER_FOR_SCREEN,
    ACTION_TYPE_REMOVE_FILTER_FOR_SCREEN,
    ACTION_TYPE_SAVE_TRANSLATION,
    ACTION_TYPE_SAVE_HUB_CONFIGURATION,
    ACTION_TYPE_SET_SYNC_STATE
} from './../utils/enums';
import url from '../utils/url';
import config from './../utils/config';
import { loginUser } from './user';
import {Dimensions} from 'react-native';
import {Platform, NativeModules} from 'react-native';
import {getTranslationRequest} from './../requests/translation';
import {getDatabaseSnapshotRequest} from './../requests/sync';
import {setInternetCredentials} from 'react-native-keychain';
import {unzipFile, readDir} from './../utils/functions';
import RNFetchBlobFs from 'rn-fetch-blob/fs';
import {processFile} from './../utils/functions';
import {createDatabase} from './../queries/database';
import {setNumberOfFilesProcessed} from './../utils/functions';

// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
export function changeAppRoot(root) {
    return {
        type: ACTION_TYPE_ROOT_CHANGE,
        root: root
    };
}

export function saveScreenSize(screenSize) {
    return {
        type: ACTION_TYPE_SAVE_SCREEN_SIZE,
        screenSize: screenSize
    };
}

export function saveTranslation(translation) {
    return {
        type: ACTION_TYPE_SAVE_TRANSLATION,
        translation: translation
    }
}

export function saveHubConfiguration(hubConfig) {
    return {
        type: ACTION_TYPE_SAVE_HUB_CONFIGURATION,
        hubConfiguration: hubConfig
    }
}

export function setSyncState(syncState) {
    return {
        type: ACTION_TYPE_SET_SYNC_STATE,
        syncState: syncState
    }
}

export function addFilterForScreen(screenName, filter) {
    return {
        type: ACTION_TYPE_ADD_FILTER_FOR_SCREEN,
        payload: {screenName: screenName, filters: filter}
    }
}

export function removeFilterForScreen(screenName) {
    return {
        type: ACTION_TYPE_REMOVE_FILTER_FOR_SCREEN,
        payload: {screenName: screenName}
    }
}

// export function getTranslations(dispatch) {
//     return new Promise((resolve, reject) => {
//         let language = '';
//         if (Platform.OS === 'ios') {
//             language = NativeModules.SettingsManager.settings.AppleLocale;
//         } else {
//             language = NativeModules.I18nManager.localeIdentifier;
//         }
//
//         if (language === 'en_US') {
//             language = 'english_us';
//         }
//
//         getTranslationRequest(language, (error, response) => {
//             if (error) {
//                 console.log("*** addExposureForContact error: ", error);
//             }
//             if (response) {
//                 dispatch(saveTranslation(response));
//                 resolve();
//             }
//         })
//     })
// }

export function getTranslations(language) {
    return async function (dispatch) {
        // let language = '';
        // if (Platform.OS === 'ios') {
        //     language = NativeModules.SettingsManager.settings.AppleLocale;
        // } else {
        //     language = NativeModules.I18nManager.localeIdentifier;
        // }
        //
        // console.log("### get translations for language: ", language);
        // if (language === 'en_US') {
        //     language = 'english_us';
        // }

        getTranslationRequest(language, (error, response) => {
            if (error) {
                console.log("*** getTranslations error: ", error);
            }
            if (response) {
                console.log("### here should have the translations: ");
                dispatch(saveTranslation(response));
            }
        })
    }
}

export function storeHubConfiguration(hubConfiguration) {
    return async function (dispatch) {
        dispatch(setSyncState('Downloading database...'));
        // Store the HUB configuration(hubUrl, clientId, clientSecret) in the secure storage of each platform in order to be used later for syncing
        await setInternetCredentials(hubConfiguration.url, hubConfiguration.clientId, hubConfiguration.clientSecret);

        // After this, get the database from the hub, using the credentials
        getDatabaseSnapshotRequest(hubConfiguration, (error, response) => {
            if (error) {
                dispatch(setSyncState(null));
            }
            if (response) {
                dispatch(setSyncState("Unzipping database..."));
                unzipFile(response, RNFetchBlobFs.dirs.DocumentDir + "/who_databases", (unzipError, responseUnzipPath) => {
                    if (unzipError) {
                        console.log("Error while unzipping file");
                        dispatch(setSyncState(null));
                    }
                    if (responseUnzipPath) {
                        // At this point we have the path to where the json files from the downloaded database are
                        // We should call the method to sync those data
                        dispatch(setSyncState("Syncing...."));
                        setNumberOfFilesProcessed(0);

                        // Create local database
                        createDatabase('testDatabase', 'testPassword', (database) => {
                            // Create a promise array to run syncing for all the files from the db
                            let promises = [];
                            readDir(responseUnzipPath, (errorReadDir, files) => {
                                if (errorReadDir) {
                                    console.log('Error while reading directory');
                                    dispatch(setSyncState(null));
                                }
                                if (files) {
                                    // For every file of the database dump, do sync
                                    for(let i=0; i<files.length; i++) {
                                        if (files[i] !== 'auditLog.json') {
                                            promises.push(processFile(RNFetchBlobFs.dirs.DocumentDir + '/who_databases/' + files[i], files[i], files.length, dispatch));
                                        }
                                    }
                                    Promise.all(promises)
                                        .then((responses) => {
                                            console.log('Responses promises: ', responses);
                                            dispatch(setSyncState("Finished processing"));
                                        })
                                        .catch((error) => {
                                            console.log("Error promises: ", error);
                                            dispatch(setSyncState(null));
                                        })
                                }
                            })
                        });
                    }
                })
            }
        })
    }
}

export function appInitialized() {
    return async function (dispatch, getState) {
        // Get Screen Dimensions and store them to the redux store in order to use them throughout the app
        let width = Dimensions.get("window").width;
        let height = Dimensions.get('window').height;

        let screenSize = {width, height};

        dispatch(saveScreenSize(screenSize));

        // Get the translations from the api and save them to the redux store
        // dispatch(getTranslations());
        dispatch(changeAppRoot('login'));

        // dispatch(loginUser({
        //     email: 'florin.popa@clarisoft.com',
        //     password: 'Cl@r1soft'
        // }));


        // I don't think we need this in production since before the user logs in, the translations should be already saved
        // TODO comment what's below and uncomment the code above
        // getTranslations(dispatch)
        //     .then(() => {
        //         console.log('Saved?');
        //         // dispatch(changeAppRoot('login'));
        //         // Login to skip the first step. Only for develop mode
        //         dispatch(loginUser({
        //             email: 'florin.popa@clarisoft.com',
        //             password: 'Cl@r1soft'
        //         }))
        //     })
        //     .catch(() => {
        //         console.log("Error?");
        //     })
    }
}