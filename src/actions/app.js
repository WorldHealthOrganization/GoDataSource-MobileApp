/**
 * Created by florinpopa on 14/06/2018.
 */
import {
    ACTION_TYPE_ROOT_CHANGE,
    ACTION_TYPE_SAVE_SCREEN_SIZE,
    ACTION_TYPE_ADD_FILTER_FOR_SCREEN,
    ACTION_TYPE_REMOVE_FILTER_FOR_SCREEN,
    ACTION_TYPE_SAVE_TRANSLATION,
    ACTION_TYPE_SAVE_HELP_CATEGORY,
    ACTION_TYPE_SAVE_AVAILABLE_LANGUAGES,
    ACTION_TYPE_SAVE_HUB_CONFIGURATION,
    ACTION_TYPE_SET_SYNC_STATE,
    ACTION_TYPE_SAVE_GENERATED_FOLLOWUPS,
    ACTION_TYPE_SET_LOGIN_STATE
} from './../utils/enums';
import url from '../utils/url';
import config from './../utils/config';
import {Dimensions} from 'react-native';
import {Platform, Alert} from 'react-native';
import {getAvailableLanguagesRequest, getTranslationRequest} from './../queries/translation';
import {getHelpCategoryRequest} from '../queries/helpCategory';
import {getHelpItemRequest} from '../queries/helpItem';
import {getDatabaseSnapshotRequest, postDatabaseSnapshotRequest} from './../requests/sync';
import {setInternetCredentials, getInternetCredentials} from 'react-native-keychain';
import {unzipFile, readDir} from './../utils/functions';
import RNFetchBlobFs from 'rn-fetch-blob/fs';
import {processFile, getDataFromDatabaseFromFile} from './../utils/functions';
import {createDatabase, getDatabase} from './../queries/database';
import {setNumberOfFilesProcessed, createZipFileAtPath, extractIdFromPouchId} from './../utils/functions';
import {AsyncStorage} from 'react-native';
import {getUserById} from './user';
import {uniq} from 'lodash';
import {addError} from './errors';
// import {addError} from './errors';
// import RNDB from 'react-native-nosql-to-sqlite';
import {getSyncEncryptPassword} from './../utils/encryption';

let arrayOfStatuses = [];

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

export function saveHelpCategory(helpCategory) {
    return {
        type: ACTION_TYPE_SAVE_HELP_CATEGORY,
        helpCategory: helpCategory
    }
}
export function saveHelpItem(helpItem) {
    return {
        type: ACTION_TYPE_SAVE_HELP_ITEM,
        helpItem: helpItem
    }
}

export function saveAvailableLanguages(availableLanguages) {
    return {
        type: ACTION_TYPE_SAVE_AVAILABLE_LANGUAGES,
        availableLanguages: availableLanguages
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

export function saveGeneratedFollowUps(generatedFollowUps) {
    return {
        type: ACTION_TYPE_SAVE_GENERATED_FOLLOWUPS,
        generatedFollowUps: generatedFollowUps
    }
}

export function setLoginState(loginState) {
    return {
        type: ACTION_TYPE_SET_LOGIN_STATE,
        loginState: loginState
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

export function getTranslations(language, dispatch) {
    // return async function (dispatch) {
    return new Promise((resolve, reject) => {
        getTranslationRequest(language, (error, response) => {
            if (error) {
                console.log("*** getTranslations error: ", error);
                reject(error);
            }
            if (response) {
                console.log("### here should have the translations: ");
                dispatch(saveTranslation(response));
                resolve('Done translation');
            }
        })
    })
    // }
}

export function getHelpCategory(help, dispatch) {
    // return async function (dispatch) {
    return new Promise((resolve, reject) => {
        getHelpCategoryRequest(language, (error, response) => {
            if (error) {
                console.log("*** getHelpCategory error: ", error);
                reject(error);
            }
            if (response) {
                console.log("### here should have the translations: ");
                dispatch(saveHelpCategory(response));
                resolve('Done help category');
            }
        })
    })
    // }
}
export function getHelpItem(help, dispatch) {
    // return async function (dispatch) {
    return new Promise((resolve, reject) => {
        getHelpItemRequest(language, (error, response) => {
            if (error) {
                console.log("*** getHelpItem error: ", error);
                reject(error);
            }
            if (response) {
                console.log("### here should have the translations: ");
                dispatch(saveHelpItem(response));
                resolve('Done help item');
            }
        })
    })
    // }
}

export function getTranslationsAsync(language) {
    return async function (dispatch) {
    // return new Promise((resolve, reject) => {
        getTranslationRequest(language, (error, response) => {
            if (error) {
                console.log("*** getTranslations error: ", error);
            }
            if (response) {
                console.log("### here should have the translations: ");
                dispatch(saveTranslation(response));
            }
        })
    // })
    }
};

export function getAvailableLanguages(dispatch) {
    // return async function (dispatch) {
    return new Promise((resolve, reject) => {
        getAvailableLanguagesRequest((error, response) => {
            if (error) {
                console.log("*** getAvailableLanguages error: ", error);
                reject(error);
            }
            if (response) {
                console.log("### here should have available languages: ", response.map((e) => {return {id: extractIdFromPouchId(e._id, 'language'), name: e.name}}));
                dispatch(saveAvailableLanguages(response.map((e) => {return {value: e._id.substr('language.json_'.length), label: e.name}})));
                resolve('Done languages');
            }
        })
    })
    // }
}

export function storeHubConfiguration(hubConfiguration) {
    return async function (dispatch) {
        // hubConfiguration = {url: databaseName, clientId: JSON.stringify({name, url, clientId, clientSecret, encryptedData}), clientSecret: databasePass}
        let hubConfig = JSON.parse(hubConfiguration.clientId);
        url.setBaseUrl(hubConfig.url);
        dispatch(setSyncState('Downloading database...'));
        // Store the HUB configuration(hubUrl, clientId, clientSecret) in the secure storage of each platform in order to be used later for syncing
        await setInternetCredentials(hubConfiguration.url, hubConfiguration.clientId, hubConfiguration.clientSecret);
        try {
            const credentials = await getInternetCredentials(hubConfiguration.url);

            if (credentials) {
                console.log('Server credentials: ', credentials);
            } else {
                console.log('Credentials not found');
            }
        } catch(errorGetInternetCredentials) {
            console.log("Error while getting internet credentials: ", errorGetInternetCredentials);
        }

        // Check first if there is already a database snapshot for that url
        try {
            let lastSyncDate = await AsyncStorage.getItem(hubConfiguration.url);
            console.log("Last sync date: ", lastSyncDate);
            if (lastSyncDate !== null) {
                getDatabaseSnapshotRequest(hubConfiguration, lastSyncDate, dispatch, (error, response) => {
                     dispatch(processFilesForSync(error, response, hubConfiguration, true, true, false));
                })
            } else {
                console.log('No last sync date found. proceed to download all database: ');
                getDatabaseSnapshotRequest(hubConfiguration, null, dispatch, (error, response) => {
                     dispatch(processFilesForSync(error, response, hubConfiguration, true, true, true));
                })
            }
        } catch (errorGetLastSyncDate) {
            console.log("Error at getting lastSyncDate. Proceed to download all database: ", errorGetLastSyncDate);
            getDatabaseSnapshotRequest(hubConfiguration, null, dispatch, (error, response) => {
                 dispatch(processFilesForSync(error, response, hubConfiguration, true, true, true));
            })
        }
    }
}

function processFilesForSync(error, response, hubConfiguration, isFirstTime, syncSuccessful, forceBulk) {
    return async function (dispatch, getState){
        // hubConfiguration = {url: databaseName, clientId: JSON.stringify({name, url, clientId, clientSecret, encryptedData}), clientSecret: databasePass}
        let hubConfig = JSON.parse(hubConfiguration.clientId);
        if (error) {
            dispatch(setSyncState('Error'));
            dispatch(addError({type: 'Error downloading database', message: error}));
        }
        if (response) {
            dispatch(setSyncState("Unzipping database..."));

            try {
                let responseUnzipPath = await unzipFile(response, RNFetchBlobFs.dirs.DocumentDir + "/who_databases", null, hubConfiguration);
                if (responseUnzipPath) {
                    console.log('ResponseUnzipPath: ', responseUnzipPath);
                    dispatch(setSyncState("Syncing...."));
                    setNumberOfFilesProcessed(0);

                    try {
                        let database = await createDatabase(hubConfiguration.url.replace(/\/|\.|\:/g, ''), hubConfiguration.clientSecret, true);
                        if (database) {
                            let promises = [];
                            let promiseResponses = [];

                            try {
                                let startTimeForProcessingFiles = new Date().getTime();
                                let files = await readDir(responseUnzipPath);

                                if (files) {
                                    // First sort the files
                                    files = files.sort((a, b) => {
                                        if (a.split('.')[0] < b.split('.')[0]) {
                                            return -1;
                                        }
                                        if (a.split('.')[0] > b.split('.')[0]) {
                                            return 1;
                                        }
                                        return 0;
                                    });
                                    files = files.sort((a, b) => {
                                        if (a.split('.')[0] === b.split('.')[0] && parseInt(a.split('.')[1]) < parseInt(b.split('.')[1])) {
                                            return -1;
                                        }
                                        if (a.split('.')[0] === b.split('.')[0] && parseInt(a.split('.')[1]) > parseInt(b.split('.')[1])) {
                                            return 1;
                                        }
                                        return 0;
                                    });
                                    // For every file of the database dump, do sync
                                    for (let i = 0; i < files.length; i++) {
                                        if (files[i] !== 'auditLog.json' && files[i] !== 'icon.json' && files[i] !== 'icons') {
                                            // promises.push(processFile(RNFetchBlobFs.dirs.DocumentDir + '/who_databases/' + files[i], files[i], files.length, dispatch, isFirstTime));
                                            // Process every file synchronously
                                            try {
                                                // console.log('Memory size of database: ', memorySizeOf(database));
                                                let startTimeForProcessingOneFile = new Date().getTime();
                                                let auxData = await processFile(RNFetchBlobFs.dirs.DocumentDir + '/who_databases/' + files[i], files[i], files.length, dispatch, isFirstTime, forceBulk, hubConfig.encryptedData, hubConfig);
                                                if (auxData) {
                                                    console.log('auxData: ', auxData);
                                                    console.log(`Time for processing file: ${files[i]}: ${new Date().getTime() - startTimeForProcessingOneFile}`);
                                                    promiseResponses.push(auxData);
                                                } else {
                                                    console.log('There was an error at processing file: ', files[i]);
                                                    dispatch(setSyncState('Error'));
                                                    break;
                                                }
                                            } catch (errorProcessFile) {
                                                console.log('There was an error at processing file: ', files[i], errorProcessFile);
                                                dispatch(setSyncState('Error'));
                                                break;
                                            }
                                        }
                                    }
                                    // After processing all files, store hub config
                                    // After processing all the data store the last sync date
                                    console.log('Processing time for all files: ', new Date().getTime() - startTimeForProcessingFiles)
                                    console.log("Now that the processing is over, proceed with storing last sync date:");
                                    // First clean up the files
                                    RNFetchBlobFs.unlink(`${RNFetchBlobFs.dirs.DocumentDir}/who_databases`)
                                        .then(() => {
                                            if (syncSuccessful && promiseResponses.length === files.length) {
                                                storeData('activeDatabase', hubConfiguration.url, (errorActiveDatabase) => {
                                                    if (!errorActiveDatabase) {
                                                        storeData(hubConfiguration.url, new Date(), (errorStoreLastSync) => {
                                                            if (!errorStoreLastSync) {
                                                                // if all was successful, then store the database in async storage
                                                                AsyncStorage.getItem('databases')
                                                                    .then((databasesString) => {
                                                                        if (databasesString && databasesString.length > 0) {
                                                                            let databases = JSON.parse(databasesString);
                                                                            // Check if the database already exists
                                                                            if (databases && Array.isArray(databases) && databases.length > 0){
                                                                                if (databases.find((e) => {return e.id === hubConfiguration.url})) {
                                                                                    // If the database already exists, then do nothing
                                                                                    console.log('Responses promises: ', promiseResponses);
                                                                                    files = null;
                                                                                    database = null;
                                                                                    arrayOfStatuses.push({
                                                                                        text: 'Getting updated data from the server',
                                                                                        status: 'OK'
                                                                                    });
                                                                                    dispatch(setSyncState("Finished processing"));
                                                                                    if (!isFirstTime) {
                                                                                        dispatch(parseStatusesAndShowMessage(getState().user._id));
                                                                                    } else {
                                                                                        dispatch(changeAppRoot('login'));
                                                                                    }
                                                                                } else {
                                                                                    databases.push({id: hubConfiguration.url, name: hubConfig.name});
                                                                                    storeData('databases', JSON.stringify(databases), (errorSaveDatabases) => {
                                                                                        if (!errorSaveDatabases) {
                                                                                            console.log('Responses promises: ', promiseResponses);
                                                                                            files = null;
                                                                                            database = null;
                                                                                            arrayOfStatuses.push({
                                                                                                text: 'Getting updated data from the server',
                                                                                                status: 'OK'
                                                                                            });
                                                                                            dispatch(setSyncState("Finished processing"));
                                                                                            if (!isFirstTime) {
                                                                                                dispatch(parseStatusesAndShowMessage(getState().user._id));
                                                                                            } else {
                                                                                                dispatch(changeAppRoot('login'));
                                                                                            }
                                                                                        } else {
                                                                                            console.log('There was an error at storing last sync date: ', errorStoreLastSync);
                                                                                            files = null;
                                                                                            database = null;
                                                                                            arrayOfStatuses.push({
                                                                                                text: 'Getting updated data from the server',
                                                                                                status: JSON.stringify(errorStoreLastSync)
                                                                                            });
                                                                                            dispatch(setSyncState('Error'));
                                                                                            if (!isFirstTime) {
                                                                                                dispatch(parseStatusesAndShowMessage(getState().user._id));
                                                                                            } else {
                                                                                                dispatch(addError({type: 'Sync error', message: `Error at storing database name: \n${JSON.stringify(errorSaveDatabases)}`}));
                                                                                            }
                                                                                        }
                                                                                    })
                                                                                }
                                                                            } else {
                                                                                console.log('There was an error at storing last sync date: ', errorStoreLastSync);
                                                                                files = null;
                                                                                database = null;
                                                                                arrayOfStatuses.push({
                                                                                    text: 'Getting updated data from the server',
                                                                                    status: JSON.stringify(errorStoreLastSync)
                                                                                });
                                                                                dispatch(setSyncState('Error'));
                                                                                if (!isFirstTime) {
                                                                                    dispatch(parseStatusesAndShowMessage(getState().user._id));
                                                                                } else {
                                                                                    dispatch(addError({type: 'Sync error', message: `Error at storing last sync date: \n${JSON.stringify(errorStoreLastSync)}`}));
                                                                                }
                                                                            }
                                                                        } else {
                                                                            let databases = [{id: hubConfiguration.url, name: hubConfig.name}];
                                                                            storeData('databases', JSON.stringify(databases), (errorSaveDatabases) => {
                                                                                if (!errorSaveDatabases) {
                                                                                    console.log('Responses promises: ', promiseResponses);
                                                                                    files = null;
                                                                                    database = null;
                                                                                    arrayOfStatuses.push({
                                                                                        text: 'Getting updated data from the server',
                                                                                        status: 'OK'
                                                                                    });
                                                                                    dispatch(setSyncState("Finished processing"));
                                                                                    if (!isFirstTime) {
                                                                                        dispatch(parseStatusesAndShowMessage(getState().user._id));
                                                                                    } else {
                                                                                        dispatch(changeAppRoot('login'));
                                                                                    }
                                                                                } else {
                                                                                    console.log('There was an error at storing last sync date: ', errorStoreLastSync);
                                                                                    files = null;
                                                                                    database = null;
                                                                                    arrayOfStatuses.push({
                                                                                        text: 'Getting updated data from the server',
                                                                                        status: JSON.stringify(errorStoreLastSync)
                                                                                    });
                                                                                    dispatch(setSyncState('Error'));
                                                                                    if (!isFirstTime) {
                                                                                        dispatch(parseStatusesAndShowMessage(getState().user._id));
                                                                                    } else {
                                                                                        dispatch(addError({type: 'Sync error', message: `Error at storing database name: \n${JSON.stringify(errorSaveDatabases)}`}));
                                                                                    }
                                                                                }
                                                                            })
                                                                        }
                                                                    })
                                                                    .catch((errorDatabasesString) => {
                                                                        console.log('There was an error at storing last sync date: ', errorStoreLastSync);
                                                                        files = null;
                                                                        database = null;
                                                                        arrayOfStatuses.push({
                                                                            text: 'Getting updated data from the server',
                                                                            status: JSON.stringify(errorStoreLastSync)
                                                                        });
                                                                        dispatch(setSyncState('Error'));
                                                                        if (!isFirstTime) {
                                                                            dispatch(parseStatusesAndShowMessage(getState().user._id));
                                                                        } else {
                                                                            dispatch(addError({type: 'Sync error', message: `Error at getting local hubs: \n${JSON.stringify(errorDatabasesString)}`}));
                                                                        }
                                                                    })
                                                            } else {
                                                                console.log('There was an error at storing last sync date: ', errorStoreLastSync);
                                                                files = null;
                                                                database = null;
                                                                arrayOfStatuses.push({
                                                                    text: 'Getting updated data from the server',
                                                                    status: JSON.stringify(errorStoreLastSync)
                                                                });
                                                                dispatch(setSyncState('Error'));
                                                                if (!isFirstTime) {
                                                                    dispatch(parseStatusesAndShowMessage(getState().user._id));
                                                                } else {
                                                                    dispatch(addError({type: 'Sync error', message: `Error at storing last sync date: \n${JSON.stringify(errorStoreLastSync)}`}));
                                                                }
                                                            }
                                                        });
                                                    } else {
                                                        console.log('There was an error at storing active database: ', errorActiveDatabase);
                                                        files = null;
                                                        database = null;
                                                        arrayOfStatuses.push({
                                                            text: 'Getting updated data from the server',
                                                            status: JSON.stringify(errorActiveDatabase)
                                                        });
                                                        dispatch(setSyncState('Error'));
                                                        if (!isFirstTime) {
                                                            dispatch(parseStatusesAndShowMessage(getState().user._id));
                                                        } else {
                                                            dispatch(addError({type: 'Sync error', message: `Error at storing active database info: \n${JSON.stringify(errorActiveDatabase)}`}));
                                                        }
                                                    }
                                                });
                                            } else {
                                                if (promiseResponses.length === files.length) {
                                                    files = null;
                                                    database = null;
                                                    arrayOfStatuses.push({
                                                        text: 'Getting updated data from the server',
                                                        status: 'OK'
                                                    });
                                                    dispatch(setSyncState('Error'));
                                                    if (!isFirstTime) {
                                                        dispatch(parseStatusesAndShowMessage(getState().user._id));
                                                    } else {
                                                        dispatch(addError({type: 'Sync error', message: `Error at syncing data`}));
                                                    }
                                                } else {
                                                    files = null;
                                                    database = null;
                                                    arrayOfStatuses.push({
                                                        text: 'Getting updated data from the server',
                                                        status: 'Error at syncing files'
                                                    });
                                                    dispatch(setSyncState('Error'));
                                                    if (!isFirstTime) {
                                                        dispatch(parseStatusesAndShowMessage(getState().user._id));
                                                    } else {
                                                        dispatch(addError({type: 'Sync error', message: `Error at syncing data`}));
                                                    }
                                                }
                                            }
                                        })
                                        .catch((errorDelete) => {
                                            console.log('Error while doing cleanup: ', errorDelete);
                                            if (syncSuccessful && promiseResponses.length === files.length) {
                                                storeData('activeDatabase', hubConfiguration.url, (errorActiveDatabase) => {
                                                    if (!errorActiveDatabase) {
                                                        storeData(hubConfiguration.url, new Date(), (errorStoreLastSync) => {
                                                            if (!errorStoreLastSync) {
                                                                // if all was successful, then store the database in async storage
                                                                AsyncStorage.getItem('databases')
                                                                    .then((databasesString) => {
                                                                        if (databasesString && databasesString.length > 0) {
                                                                            let databases = JSON.parse(databasesString);
                                                                            // Check if the database already exists
                                                                            if (databases && Array.isArray(databases) && databases.length > 0){
                                                                                if (databases.find((e) => {return e.id === hubConfiguration.url})) {
                                                                                    // If the database already exists, then do nothing
                                                                                    console.log('Responses promises: ', promiseResponses);
                                                                                    files = null;
                                                                                    database = null;
                                                                                    arrayOfStatuses.push({
                                                                                        text: 'Getting updated data from the server',
                                                                                        status: 'OK'
                                                                                    });
                                                                                    dispatch(setSyncState("Finished processing"));
                                                                                    if (!isFirstTime) {
                                                                                        dispatch(parseStatusesAndShowMessage(getState().user._id));
                                                                                    } else {
                                                                                        dispatch(changeAppRoot('login'));
                                                                                    }
                                                                                } else {
                                                                                    databases.push({id: hubConfiguration.url, name: hubConfig.name});
                                                                                    storeData('databases', JSON.stringify(databases), (errorSaveDatabases) => {
                                                                                        if (!errorSaveDatabases) {
                                                                                            console.log('Responses promises: ', promiseResponses);
                                                                                            files = null;
                                                                                            database = null;
                                                                                            arrayOfStatuses.push({
                                                                                                text: 'Getting updated data from the server',
                                                                                                status: 'OK'
                                                                                            });
                                                                                            dispatch(setSyncState("Finished processing"));
                                                                                            if (!isFirstTime) {
                                                                                                dispatch(parseStatusesAndShowMessage(getState().user._id));
                                                                                            } else {
                                                                                                dispatch(changeAppRoot('login'));
                                                                                            }
                                                                                        } else {
                                                                                            console.log('There was an error at storing last sync date: ', errorStoreLastSync);
                                                                                            files = null;
                                                                                            database = null;
                                                                                            arrayOfStatuses.push({
                                                                                                text: 'Getting updated data from the server',
                                                                                                status: JSON.stringify(errorStoreLastSync)
                                                                                            });
                                                                                            dispatch(setSyncState('Error'));
                                                                                            if (!isFirstTime) {
                                                                                                dispatch(parseStatusesAndShowMessage(getState().user._id));
                                                                                            } else {
                                                                                                dispatch(addError({type: 'Sync error', message: `Error at storing database name: \n${JSON.stringify(errorSaveDatabases)}`}));
                                                                                            }
                                                                                        }
                                                                                    })
                                                                                }
                                                                            } else {
                                                                                console.log('There was an error at storing last sync date: ', errorStoreLastSync);
                                                                                files = null;
                                                                                database = null;
                                                                                arrayOfStatuses.push({
                                                                                    text: 'Getting updated data from the server',
                                                                                    status: JSON.stringify(errorStoreLastSync)
                                                                                });
                                                                                dispatch(setSyncState('Error'));
                                                                                if (!isFirstTime) {
                                                                                    dispatch(parseStatusesAndShowMessage(getState().user._id));
                                                                                } else {
                                                                                    dispatch(addError({type: 'Sync error', message: `Error at storing last sync date: \n${JSON.stringify(errorStoreLastSync)}`}));
                                                                                }
                                                                            }
                                                                        } else {
                                                                            let databases = [{id: hubConfiguration.url, name: hubConfig.name}];
                                                                            storeData('databases', JSON.stringify(databases), (errorSaveDatabases) => {
                                                                                if (!errorSaveDatabases) {
                                                                                    console.log('Responses promises: ', promiseResponses);
                                                                                    files = null;
                                                                                    database = null;
                                                                                    arrayOfStatuses.push({
                                                                                        text: 'Getting updated data from the server',
                                                                                        status: 'OK'
                                                                                    });
                                                                                    dispatch(setSyncState("Finished processing"));
                                                                                    if (!isFirstTime) {
                                                                                        dispatch(parseStatusesAndShowMessage(getState().user._id));
                                                                                    } else {
                                                                                        dispatch(changeAppRoot('login'));
                                                                                    }
                                                                                } else {
                                                                                    console.log('There was an error at storing last sync date: ', errorStoreLastSync);
                                                                                    files = null;
                                                                                    database = null;
                                                                                    arrayOfStatuses.push({
                                                                                        text: 'Getting updated data from the server',
                                                                                        status: JSON.stringify(errorStoreLastSync)
                                                                                    });
                                                                                    dispatch(setSyncState('Error'));
                                                                                    if (!isFirstTime) {
                                                                                        dispatch(parseStatusesAndShowMessage(getState().user._id));
                                                                                    } else {
                                                                                        dispatch(addError({type: 'Sync error', message: `Error at storing database name: \n${JSON.stringify(errorSaveDatabases)}`}));
                                                                                    }
                                                                                }
                                                                            })
                                                                        }
                                                                    })
                                                                    .catch((errorDatabasesString) => {
                                                                        console.log('There was an error at storing last sync date: ', errorStoreLastSync);
                                                                        files = null;
                                                                        database = null;
                                                                        arrayOfStatuses.push({
                                                                            text: 'Getting updated data from the server',
                                                                            status: JSON.stringify(errorStoreLastSync)
                                                                        });
                                                                        dispatch(setSyncState('Error'));
                                                                        if (!isFirstTime) {
                                                                            dispatch(parseStatusesAndShowMessage(getState().user._id));
                                                                        } else {
                                                                            dispatch(addError({type: 'Sync error', message: `Error at getting local hubs: \n${JSON.stringify(errorDatabasesString)}`}));
                                                                        }
                                                                    })
                                                            } else {
                                                                console.log('There was an error at storing last sync date: ', errorStoreLastSync);
                                                                files = null;
                                                                database = null;
                                                                arrayOfStatuses.push({
                                                                    text: 'Getting updated data from the server',
                                                                    status: JSON.stringify(errorStoreLastSync)
                                                                });
                                                                dispatch(setSyncState('Error'));
                                                                if (!isFirstTime) {
                                                                    dispatch(parseStatusesAndShowMessage(getState().user._id));
                                                                } else {
                                                                    dispatch(addError({type: 'Sync error', message: `Error at storing last sync date: \n${JSON.stringify(errorStoreLastSync)}`}));
                                                                }
                                                            }
                                                        });
                                                    } else {
                                                        console.log('There was an error at storing active database: ', errorActiveDatabase);
                                                        files = null;
                                                        database = null;
                                                        arrayOfStatuses.push({
                                                            text: 'Getting updated data from the server',
                                                            status: JSON.stringify(errorActiveDatabase)
                                                        });
                                                        dispatch(setSyncState('Error'));
                                                        if (!isFirstTime) {
                                                            dispatch(parseStatusesAndShowMessage(getState().user._id));
                                                        } else {
                                                            dispatch(addError({type: 'Sync error', message: `Error at storing active database info: \n${JSON.stringify(errorActiveDatabase)}`}));
                                                        }
                                                    }
                                                });
                                            } else {
                                                if (promiseResponses.length === files.length) {
                                                    files = null;
                                                    database = null;
                                                    arrayOfStatuses.push({
                                                        text: 'Getting updated data from the server',
                                                        status: 'OK'
                                                    });
                                                    dispatch(setSyncState('Error'));
                                                    if (!isFirstTime) {
                                                        dispatch(parseStatusesAndShowMessage(getState().user._id));
                                                    } else {
                                                        dispatch(addError({type: 'Sync error', message: `Error at syncing data`}));
                                                    }
                                                } else {
                                                    files = null;
                                                    database = null;
                                                    arrayOfStatuses.push({
                                                        text: 'Getting updated data from the server',
                                                        status: 'Error at syncing files'
                                                    });
                                                    dispatch(setSyncState('Error'));
                                                    if (!isFirstTime) {
                                                        dispatch(parseStatusesAndShowMessage(getState().user._id));
                                                    } else {
                                                        dispatch(addError({type: 'Sync error', message: `Error at syncing data`}));
                                                    }
                                                }
                                            }
                                        })
                                } else {
                                    console.log('No files found');
                                    arrayOfStatuses.push({text: 'Getting updated data from the server', status: 'No files found'});
                                    dispatch(setSyncState('Error'));
                                    if (!isFirstTime) {
                                        dispatch(parseStatusesAndShowMessage(getState().user._id));
                                    }else {
                                        dispatch(addError({type: 'Error import', message: `Error while importing downloaded data: \nNo downloaded files found`}));
                                    }
                                }
                            } catch(errorReadDir) {
                                console.log('Error while reading directory: ', errorReadDir);
                                arrayOfStatuses.push({text: 'Getting updated data from the server', status: JSON.stringify(errorReadDir)});
                                dispatch(setSyncState('Error'));
                                if (!isFirstTime) {
                                    dispatch(parseStatusesAndShowMessage(getState().user._id));
                                } else {
                                    dispatch(addError({type: 'Error import', message: `Error while importing downloaded data: \n${JSON.stringify(errorReadDir)}`}));
                                }
                            }
                        } else {
                            arrayOfStatuses.push({text: 'Getting updated data from the server', status: 'No database found'});
                            dispatch(setSyncState('Error'));
                            if (!isFirstTime) {
                                dispatch(parseStatusesAndShowMessage(getState().user._id));
                            } else {
                                dispatch(addError({type: 'Error creating database', message: `Local database could not be created`}));
                            }
                        }
                    } catch (errorCreateDatabase) {
                        console.log("Error create database: ", errorCreateDatabase);
                        arrayOfStatuses.push({text: 'Getting updated data from the server', status: JSON.stringify(errorCreateDatabase)});
                        dispatch(setSyncState('Error'));
                        if (!isFirstTime) {
                            dispatch(parseStatusesAndShowMessage(getState().user._id));
                        } else {
                            dispatch(addError({type: 'Error creating local database', message: JSON.stringify(errorCreateDatabase)}));
                        }
                    }
                } else {
                    dispatch(setSyncState('Error'));
                    arrayOfStatuses.push({text: 'Getting updated data from the server', status: 'No zip file'});
                    if (!isFirstTime) {
                        dispatch(parseStatusesAndShowMessage(getState().user._id));
                    } else {
                        dispatch(addError({type: 'Error downloading database', message: `Error while unzipping the file from the server`}));
                    }
                }
            } catch (unzipError) {
                console.log("Error promises: ", error);
                arrayOfStatuses.push({text: 'Getting updated data from the server', status: `Error while unzipping the file from the server: \n${JSON.stringify(unzipError)}`});
                dispatch(setSyncState('Error'));
                if (!isFirstTime) {
                    dispatch(parseStatusesAndShowMessage(getState().user._id));
                } else {
                    dispatch(addError({type: 'Error downloading database', message: JSON.stringify(unzipError)}));
                }
            }
        }
    }
}

function parseStatusesAndShowMessage (userId) {
    return async function (dispatch, getState) {
        let text = '';
        for (let i=0; i<arrayOfStatuses.length; i++) {
            text += arrayOfStatuses[i].text + '\n' + 'Status: ' + arrayOfStatuses[i].status + '\n';
        }
        Alert.alert('Sync status info', text, [
            {
                text: 'Ok', onPress: () => {
                if (userId) {
                    dispatch(getUserById(userId, null, true))
                }
            }
            }
        ])
        // dispatch(addError({type: 'Sync status info', message: text}));
    }
}

export function sendDatabaseToServer () {
    return async function (dispatch, getState) {
        let operationStart = new Date().getTime();
        // empty the array of global statuses
        arrayOfStatuses = [];
        // First get the active database
        dispatch(setSyncState('Getting local data'));
        try {
            const activeDatabase = await AsyncStorage.getItem('activeDatabase');

            if (activeDatabase !== null) {
                // After getting the active database, get lastSyncDate
                try {
                    const lastSyncDate = await AsyncStorage.getItem(activeDatabase);

                    if (lastSyncDate !== null) {
                        console.log('lastSyncDate: ', lastSyncDate);
                        // If we also have the lastSyncDate, we should move on to create the files to be synced
                        let database = getDatabase();

                        let internetCredentials = await getInternetCredentials(activeDatabase);
                        if (internetCredentials) {
                            let startTimeForFilesChanged = new Date().getTime();

                            // To avoid performance issues, go through all the collections that can change and see if anything actually changed

                            arrayOfStatuses.push({text: 'Getting local data', status: 'OK'});
                            dispatch(setSyncState('Creating local files'));
                            let statusArray = [];
                            for (let i=0; i<config.changingMongoCollections.length; i++) {
                                try {
                                    let credentials = JSON.parse(internetCredentials.username);
                                    let password = credentials.encryptedData ? getSyncEncryptPassword(null, credentials) : null;
                                    let status = await getDataFromDatabaseFromFile(database, config.changingMongoCollections[i], lastSyncDate, password);
                                    // if (status) {
                                        statusArray.push(status);
                                    // } else {
                                    //     console.log('An error occurred while getting data from the local store');
                                    //     arrayOfStatuses.push({text: 'Getting local data', status: 'An error occurred while getting data from the local store'});
                                    //     dispatch(setSyncState('Error'));
                                    //     dispatch(parseStatusesAndShowMessage());
                                    //     break;
                                    // }
                                } catch (errorGetDatabaseFromFile) {
                                    console.log('ErrorGetDatabaseFromFile: ', errorGetDatabaseFromFile);
                                    arrayOfStatuses.push({text: 'Getting local data', status: JSON.stringify(errorGetDatabaseFromFile)});
                                    dispatch(setSyncState('Error'));
                                    dispatch(parseStatusesAndShowMessage(getState().user._id));
                                    break;
                                }
                            }

                            if (statusArray.length === config.changingMongoCollections.length) {
                                // console.log('Result from processing all the files: timeForCreatingFiles: ', new Date().getTime() - startTimeForCreatingFiles);
                                // let startTimeForCreateZip = new Date().getTime();
                                createZipFileAtPath(`${RNFetchBlobFs.dirs.DocumentDir}/who_files`, `${RNFetchBlobFs.dirs.DocumentDir}/${activeDatabase.replace(/\/|\.|\:/g, '')}.zip`, (errorCreateZipFile, resultCreateZipFile) => {
                                    if (errorCreateZipFile) {
                                        console.log("An error occurred while zipping the files: ", errorCreateZipFile);
                                        arrayOfStatuses.push({text: 'Creating local files', status: JSON.stringify(errorCreateZipFile)});
                                        dispatch(parseStatusesAndShowMessage(getState().user._id));
                                    }
                                    if (resultCreateZipFile) {
                                        // After creating the zip file, it's time to send it to the server
                                        // console.log("Response from create zip file: time For zip", new Date().getTime() - startTimeForCreateZip);
                                        // statuses.createLocalFiles.status = 'OK';
                                        arrayOfStatuses.push({text: 'Creating local files', status: 'OK'});
                                        dispatch(setSyncState('Sending data to the HUB'));
                                        postDatabaseSnapshotRequest(internetCredentials, resultCreateZipFile, (errorSendData, resultSendData) => {
                                            if (errorSendData && !resultSendData) {
                                                console.log('An error occurred while sending data to server: ', errorSendData);
                                                dispatch(setSyncState('Error'));
                                                // statuses.sendData.status = JSON.stringify(errorSendData);
                                                arrayOfStatuses.push({text: 'Sending data to the HUB', status: JSON.stringify(errorSendData)});
                                                dispatch(parseStatusesAndShowMessage(getState().user._id));
                                                // dispatch(addError({type: 'Sync Error', message: JSON.stringify(errorSendData)}));
                                            }
                                            if (resultSendData) {
                                                console.log("Data was successfully sent to server: ", resultSendData, new Date().getTime() - operationStart);
                                                // statuses.sendData.status = 'OK';
                                                arrayOfStatuses.push({text: 'Sending data to the HUB', status: errorSendData ? JSON.stringify(errorSendData) : 'OK'});
                                                dispatch(setSyncState('Getting updated data from the server'));
                                                getDatabaseSnapshotRequest({url: internetCredentials.server ? internetCredentials.server : internetCredentials.service, clientId: internetCredentials.username, clientSecret: internetCredentials.password}, lastSyncDate, dispatch, (error, response) => {
                                                    if (error) {
                                                        arrayOfStatuses.push({text: 'Getting updated data from the server', status: JSON.stringify(error)});
                                                        dispatch(setSyncState('Error'));
                                                        dispatch(parseStatusesAndShowMessage(getState().user._id));
                                                    }
                                                    if (response) {
                                                        // statuses.gettingData.status = 'OK';
                                                        // arrayOfStatuses.push({text: 'Getting updated data from the server', status: 'OK'});
                                                        dispatch(processFilesForSync(error, response, {
                                                            url: Platform.OS === 'ios' ? internetCredentials.server : internetCredentials.service,
                                                            clientId: internetCredentials.username,
                                                            clientSecret: internetCredentials.password
                                                        }, null, !errorSendData, false));
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }


                            // database.find({selector: {
                            //     updatedAt: {$gte: lastSyncDate}
                            // },
                            //     fields: ['fileType']
                            // })
                            //     .then((resultGetRecordsByDate) => {
                            //         resultGetRecordsByDate = uniq(resultGetRecordsByDate.docs);
                            //         console.log('resultGetRecordsByDate: took: ', new Date().getTime() - startTimeForFilesChanged);
                            //         // Now, for each fileType, we must create a .json file, archive it and then send that archive to the server
                            //         let promiseArray = [];
                            //
                            //         if (resultGetRecordsByDate && Array.isArray(resultGetRecordsByDate) && resultGetRecordsByDate.length > 0) {
                            //             for (let i=0; i<resultGetRecordsByDate.length; i++) {
                            //                 promiseArray.push(getDataFromDatabaseFromFile(database, resultGetRecordsByDate[i].fileType, lastSyncDate))
                            //             }
                            //
                            //             // statuses.gettingLocalFiles.status = 'OK';
                            //             arrayOfStatuses.push({text: 'Getting local data', status: 'OK'});
                            //             dispatch(setSyncState('Creating local files'));
                            //             let startTimeForCreatingFiles = new Date().getTime();
                            //             console.log('Add stuff: ', promiseArray.length);
                            //             Promise.all(promiseArray)
                            //                 .then((resultsCreateAlFiles) => {
                            //                     // After creating all the needed files, we need to make a zip file
                            //                     console.log('Result from processing all the files: timeForCreatingFiles: ', new Date().getTime() - startTimeForCreatingFiles);
                            //                     let startTimeForCreateZip = new Date().getTime();
                            //                     createZipFileAtPath(`${RNFetchBlobFs.dirs.DocumentDir}/who_files`, `${RNFetchBlobFs.dirs.DocumentDir}/${activeDatabase.replace(/\/|\.|\:/g, '')}.zip`, (errorCreateZipFile, resultCreateZipFile) => {
                            //                         if (errorCreateZipFile) {
                            //                             console.log("An error occurred while zipping the files: ", errorCreateZipFile);
                            //                             arrayOfStatuses.push({text: 'Creating local files', status: JSON.stringify(errorCreateZipFile)});
                            //                             dispatch(parseStatusesAndShowMessage());
                            //                         }
                            //                         if (resultCreateZipFile) {
                            //                             // After creating the zip file, it's time to send it to the server
                            //                             console.log("Response from create zip file: time For zip", new Date().getTime() - startTimeForCreateZip);
                            //                             // statuses.createLocalFiles.status = 'OK';
                            //                             arrayOfStatuses.push({text: 'Creating local files', status: 'OK'});
                            //                             dispatch(setSyncState('Sending data to the HUB'));
                            //                             postDatabaseSnapshotRequest(internetCredentials, resultCreateZipFile, (errorSendData, resultSendData) => {
                            //                                 if (errorSendData && !resultSendData) {
                            //                                     console.log('An error occurred while sending data to server: ', errorSendData);
                            //                                     dispatch(setSyncState('Error'));
                            //                                     // statuses.sendData.status = JSON.stringify(errorSendData);
                            //                                     arrayOfStatuses.push({text: 'Sending data to the HUB', status: JSON.stringify(errorSendData)});
                            //                                     dispatch(parseStatusesAndShowMessage());
                            //                                     // dispatch(addError({type: 'Sync Error', message: JSON.stringify(errorSendData)}));
                            //                                 }
                            //                                 if (resultSendData) {
                            //                                     console.log("Data was successfully sent to server: ", resultSendData, new Date().getTime() - operationStart);
                            //                                     // statuses.sendData.status = 'OK';
                            //                                     arrayOfStatuses.push({text: 'Sending data to the HUB', status: errorSendData ? JSON.stringify(errorSendData) : 'OK'});
                            //                                     dispatch(setSyncState('Getting updated data from the server'));
                            //                                     getDatabaseSnapshotRequest({url: internetCredentials.server ? internetCredentials.server : internetCredentials.service, clientId: internetCredentials.username, clientSecret: internetCredentials.password}, lastSyncDate, (error, response) => {
                            //                                         if (error) {
                            //                                             arrayOfStatuses.push({text: 'Getting updated data from the server', status: JSON.stringify(error)});
                            //                                             dispatch(setSyncState('Error'));
                            //                                             dispatch(parseStatusesAndShowMessage());
                            //                                         }
                            //                                         if (response) {
                            //                                             // statuses.gettingData.status = 'OK';
                            //                                             // arrayOfStatuses.push({text: 'Getting updated data from the server', status: 'OK'});
                            //                                             dispatch(processFilesForSync(error, response, {
                            //                                                 url: Platform.OS === 'ios' ? internetCredentials.server : internetCredentials.service,
                            //                                                 clientId: internetCredentials.username,
                            //                                                 clientSecret: internetCredentials.password
                            //                                             }, null, !errorSendData, false));
                            //                                         }
                            //                                     })
                            //                                 }
                            //                             })
                            //                         }
                            //                     })
                            //                 })
                            //                 .catch((errorCreateAllFiles) => {
                            //                     console.log('Error while creating all the files: ', errorCreateAllFiles);
                            //                     // statuses.createLocalFiles.status = JSON.stringify(errorCreateAllFiles);
                            //                     arrayOfStatuses.push({text: 'Creating local files', status: JSON.stringify(errorCreateAllFiles)});
                            //                     dispatch(setSyncState('Error'));
                            //                     dispatch(parseStatusesAndShowMessage());
                            //                 })
                            //         } else {
                            //             arrayOfStatuses.push({text: 'Getting local data', status: 'Local data has not been updated'});
                            //             dispatch(setSyncState('Getting updated data from the server'));
                            //             getDatabaseSnapshotRequest({url: internetCredentials.server ? internetCredentials.server : internetCredentials.service, clientId: internetCredentials.username, clientSecret: internetCredentials.password}, lastSyncDate, (error, response) => {
                            //                 if (error) {
                            //                     arrayOfStatuses.push({text: 'Getting updated data from the server', status: JSON.stringify(error)});
                            //                     dispatch(setSyncState('Error'));
                            //                     dispatch(parseStatusesAndShowMessage());
                            //                 }
                            //                 if (response) {
                            //                     // statuses.gettingData.status = 'OK';
                            //                     arrayOfStatuses.push({text: 'Getting updated data from the server', status: 'OK'});
                            //                     dispatch(processFilesForSync(error, response, {
                            //                         url: Platform.OS === 'ios' ? internetCredentials.server : internetCredentials.service,
                            //                         clientId: internetCredentials.username,
                            //                         clientSecret: internetCredentials.password
                            //                     }, null, true, false));
                            //                 }
                            //             })
                            //         }
                            //     })
                            //     .catch((errorGetRecordsByDate) => {
                            //         console.log('errorGetRecordsByDate: ', errorGetRecordsByDate);
                            //         // statuses.gettingLocalFiles.status = JSON.stringify(errorGetRecordsByDate);
                            //         arrayOfStatuses.push({text: 'Getting local data', status: JSON.stringify(errorGetRecordsByDate)});
                            //         dispatch(setSyncState('Error'));
                            //         dispatch(parseStatusesAndShowMessage());
                            //     })
                        } else {
                            console.log('No internet credentials found');
                            arrayOfStatuses.push({text: 'Getting local data', status: 'No credentials found'});
                            dispatch(setSyncState('Error'));
                            dispatch(parseStatusesAndShowMessage(getState().user._id));
                        }
                    } else {
                        console.log('Last sync date is null');
                        arrayOfStatuses.push({text: 'Getting local data', status: 'Last sync date was not found'});
                        dispatch(setSyncState('Error'));
                        dispatch(parseStatusesAndShowMessage(getState().user._id));
                    }
                } catch (errorGetLastSyncDate) {
                    console.log('Error while getting lastSyncDate: ', errorGetLastSyncDate);
                    arrayOfStatuses.push({text: 'Getting local data', status: JSON.stringify(errorGetLastSyncDate)});
                    dispatch(setSyncState('Error'));
                    dispatch(parseStatusesAndShowMessage(getState().user._id));
                }
            } else {
                console.log('activeDatabase is null');
                arrayOfStatuses.push({text: 'Getting local data', status: 'There was no active database found'});
                dispatch(setSyncState('Error'));
                dispatch(parseStatusesAndShowMessage(getState().user._id));
            }
        } catch (errorGetActiveDatabase) {
            console.log('Error while getting active database: ', errorGetActiveDatabase);
            arrayOfStatuses.push({text: 'Getting local data', status: JSON.stringify(errorGetActiveDatabase)});
            dispatch(setSyncState('Error'));
            dispatch(parseStatusesAndShowMessage(getState().user._id));
        }
    }
}

// We will store the last sync date inside the key/value store of react native
// This way, we will only get the data that was changed from the last sync
// We will also use this method to store the logged user's id, in order to keep him logged in
export function storeData (key, value, callback) {
    AsyncStorage.setItem(key, value, (error) => {
        if (error) {
            console.log('~~~~Error while storing data: ', error);
            callback(error)
        } else {
            console.log("~~~~Success at storing data");
            callback(null, 'Success')
        }
    });
}

export function getData (key) {
    return async function () {
        try {
            const value = await AsyncStorage.getItem(key);
            console.log('Value from async storage: ', value);
            if (value !== null) {
                return value
            } else {
                return null;
            }
        } catch(error) {
            return null;
        }
    }
}

export function appInitialized() {
    return async function (dispatch, getState) {
        // Get Screen Dimensions and store them to the redux store in order to use them throughout the app
        let width = Dimensions.get("window").width;
        let height = Dimensions.get('window').height;

        let screenSize = {width, height};

        dispatch(saveScreenSize(screenSize));

        try {
            let loggedUser = await AsyncStorage.getItem('loggedUser');
            console.log('Logged user: ', loggedUser);
            if (loggedUser !== null) {
                try {
                    let activeDatabase = await AsyncStorage.getItem('activeDatabase');
                    console.log('Active database: ', activeDatabase);
                    if (activeDatabase !== null) {
                        try {
                            let databaseCredentials = await getInternetCredentials(activeDatabase);

                            if (databaseCredentials) {
                                console.log('Database credentials: ', databaseCredentials);
                                let server = Platform.OS === 'ios' ? databaseCredentials.server : databaseCredentials.service;
                                try {
                                    let database = await createDatabase(server.replace(/\/|\.|\:/g, ''), databaseCredentials.password, false);
                                    if (database) {
                                        dispatch(getUserById(loggedUser, null));
                                    } else {
                                        console.log('Database does not exist');
                                        dispatch(changeAppRoot('config'));
                                    }
                                } catch (errorCreateDatabase) {
                                    console.log('errorCreateDatabase: ', errorCreateDatabase);
                                    dispatch(changeAppRoot('config'));
                                }

                            } else {
                                console.log("Don't have database credentials, but have active database and logged user. Proceed to config screen");
                                dispatch(changeAppRoot('config'))
                            }
                        } catch (errorGetDatabaseCredentials) {
                            console.log("Don't have database credentials, but have active database and logged user and error. Proceed to config screen: ", errorGetDatabaseCredentials);
                            dispatch(changeAppRoot('config'))
                        }
                    } else {
                        console.log("Don't have an active database but we have a logged user. Proceed to config screen");
                        dispatch(changeAppRoot('config'));
                    }
                } catch (errorGetActiveDatabase) {
                    console.log("We have an error at getting the active database, but we have logged user. Proceed to config screen: ", errorGetActiveDatabase)
                    dispatch(changeAppRoot('config'));
                }
            } else {
                console.log("Don't have a logged user. Time to check if there is an active database and if there is, move to the login screen");
                try {
                    let activeDatabase = await AsyncStorage.getItem('activeDatabase');
                    console.log('Active database: ', activeDatabase);
                    if (activeDatabase !== null) {
                        // If there is an active database get its credentials and proceeed to the login screen
                        try {
                            let databaseCredentials = await getInternetCredentials(activeDatabase);
                            console.log('Database credentials: ', databaseCredentials);
                            if (databaseCredentials) {
                                let server = Platform.OS === 'ios' ? databaseCredentials.server : databaseCredentials.service;
                                try {
                                    let database = await createDatabase(server.replace(/\/|\.|\:/g, ''), databaseCredentials.password, false);
                                    if (database) {
                                        dispatch(changeAppRoot('login'));
                                    } else {
                                        console.log('Database does not exist');
                                        dispatch(changeAppRoot('config'));
                                    }
                                } catch (errorCreateDatabase) {
                                    console.log('errorCreateDatabase: ', errorCreateDatabase)
                                    dispatch(changeAppRoot('config'));
                                }
                            } else {
                                console.log("We don't have logged user, we have active database, but we don't have credentials. Proceed to config screen");
                                dispatch(changeAppRoot('config'));
                            }
                        } catch (errorDatabaseCredentials) {
                            console.log("We don't have logged user, we have active database, but we have error when getting its credentials. Proceed to config screen", errorDatabaseCredentials);
                            dispatch(changeAppRoot('config'));
                        }
                    } else {
                        console.log("We don't have an active database, and we don't have logged user. Proceed to config screen");
                        dispatch(changeAppRoot('config'));
                    }
                } catch (errorActiveDatabase) {
                    console.log("We don't have a logged user and we have an error at getting active database. Proceed to config screen ", errorActiveDatabase);
                    dispatch(changeAppRoot('config'));
                }
            }
        } catch (errorGetLoggedUser) {
            console.log("We have an error at getting logged user. We try to see if there is an active database: ");
            try {
                let activeDatabase = await AsyncStorage.getItem('activeDatabase');
                console.log('Active database: ', activeDatabase);
                if (activeDatabase !== null) {
                    // If there is an active database get its credentials and proceeed to the login screen
                    try {
                        let databaseCredentials = await getInternetCredentials(activeDatabase);
                        console.log('Database credentials: ', databaseCredentials);
                        if (databaseCredentials) {
                            let server = Platform.OS === 'ios' ? databaseCredentials.server : databaseCredentials.service;
                            try {
                                let database = await createDatabase(server.replace(/\/|\.|\:/g, ''), databaseCredentials.password, false);
                                if (database) {
                                    dispatch(changeAppRoot('login'));
                                } else {
                                    console.log('Database does not exist');
                                    dispatch(changeAppRoot('config'));
                                }
                            } catch (errorCreateDatabase) {
                                console.log('errorCreateDatabase: ', errorCreateDatabase)
                                dispatch(changeAppRoot('config'));
                            }
                        } else {
                            console.log("We don't have logged user, we have active database, but we don't have credentials. Proceed to config screen");
                            dispatch(changeAppRoot('config'));
                        }
                    } catch (errorDatabaseCredentials) {
                        console.log("We don't have logged user, we have active database, but we have error when getting its credentials. Proceed to config screen", errorDatabaseCredentials);
                        dispatch(changeAppRoot('config'));
                    }
                } else {
                    console.log("We don't have an active database, and we don't have logged user. Proceed to config screen");
                    dispatch(changeAppRoot('config'));
                }
            } catch (errorActiveDatabase) {
                console.log("We don't have a logged user and we have an error at getting active database. Proceed to config screen ", errorActiveDatabase);
                dispatch(changeAppRoot('config'));
            }
        }


        // Here check if the user is already logged in and which database is he using


        // getData('loggedUser', (error, loggedUser) => {
        //     console.log('Logged user: ', loggedUser);
        //     if (loggedUser) {
        //         // If there is a logged user, then, get the database, and log the user
        //         getData('activeDatabase', (error, activeDatabase) => {
        //             console.log("Active database: ", activeDatabase);
        //             let databaseCredentials = await getInternetCredentials(activeDatabase);
        //             return null;
        //             //, (errorCredentials, databaseCredentials) => {
        //         //         console.log('Database credentials: ', databaseCredentials);
        //         //         if (databaseCredentials) {
        //         //             createDatabase(databaseCredentials.username, databaseCredentials.password, (database) => {
        //         //                 // After creating the Pouch db, redirect the user to the login screen
        //         //                 dispatch(getUserById(loggedUser, null));
        //         //             })
        //         //         } else {
        //         //             dispatch(changeAppRoot('config'));
        //         //         }
        //         //     });
        //         // })
        //     } else {
        //         // If there is not a logged user, check if there is an active database
        //         getData('activeDatabase', (error, activeDatabase) => {
        //             console.log("Active database: ", activeDatabase);
        //             if (activeDatabase) {
        //                 // If there is and active database, initialize it in PouchDb and redirect to the login screen
        //                 getServerCredentials(activeDatabase, (error, databaseCredentials) => {
        //                     console.log('Database credentials: ', databaseCredentials);
        //                     createDatabase(databaseCredentials.username, databaseCredentials.password, (database) => {
        //                         // After creating the Pouch db, redirect the user to the login screen
        //                         dispatch(changeAppRoot('login'));
        //                     })
        //                 });
        //             } else {
        //                 // If there is no active database, go to the config screen
        //                 dispatch(changeAppRoot('config'));
        //             }
        //         });
        //     }
        // });

        // Get the translations from the api and save them to the redux store
        // dispatch(getTranslations());
        // dispatch(changeAppRoot('login'));

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