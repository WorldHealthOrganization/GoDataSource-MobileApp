/**
 * Created by florinpopa on 14/06/2018.
 */
import {
    ACTION_TYPE_ROOT_CHANGE,
    ACTION_TYPE_SAVE_SCREEN_SIZE,
    ACTION_TYPE_SAVE_SELECTED_SCREEN,
    ACTION_TYPE_ADD_FILTER_FOR_SCREEN,
    ACTION_TYPE_REMOVE_FILTER_FOR_SCREEN,
    ACTION_TYPE_SAVE_TRANSLATION,
    ACTION_TYPE_SAVE_HELP_CATEGORY,
    ACTION_TYPE_SAVE_AVAILABLE_LANGUAGES,
    ACTION_TYPE_SAVE_HUB_CONFIGURATION,
    ACTION_TYPE_SET_SYNC_STATE,
    ACTION_TYPE_SAVE_GENERATED_FOLLOWUPS,
    ACTION_TYPE_SET_LOGIN_STATE,
    ACTION_TYPE_SAVE_ACTIVE_DATABASE,
    ACTION_TYPE_SET_LOADER_STATE,
    ACTION_TYPE_SAVE_HELP_ITEM
} from './../utils/enums';
import config from './../utils/config';
import {Dimensions} from 'react-native';
import {Platform} from 'react-native';
import {getAvailableLanguagesRequest, getTranslationRequest} from './../queries/translation';
import {postDatabaseSnapshotRequest, getDatabaseSnapshotRequestNew} from './../requests/sync';
import {setInternetCredentials, getInternetCredentials} from 'react-native-keychain';
import {unzipFile, readDir} from './../utils/functions';
import RNFetchBlobFs from 'rn-fetch-blob/fs';
import {deleteFile, getDataFromDatabaseFromFile, processFilePouch, processFilesSql} from './../utils/functions';
import {createDatabase, getDatabase} from './../queries/database';
import {setNumberOfFilesProcessed, createZipFileAtPath, createDate, getDataFromDatabaseFromFileSql} from './../utils/functions';
import AsyncStorage from '@react-native-community/async-storage';
import {getUserById} from './user';
import get from 'lodash/get';
import {getSyncEncryptPassword} from './../utils/encryption';
import errorTypes from "../utils/errorTypes";
import constants from './../utils/constants';
import {checkArrayAndLength} from "../utils/typeCheckingFunctions";
import sqlConstants from './../queries/sqlTools/constants';
import {initTables} from './../queries/sqlTools/helperMethods';

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

export function saveSelectedScreen(selectedScreen) {
    return {
        type: ACTION_TYPE_SAVE_SELECTED_SCREEN,
        selectedScreen: selectedScreen
    };
}

export function saveTranslation(translation) {
    return {
        type: ACTION_TYPE_SAVE_TRANSLATION,
        translation: translation
    }
}

export function saveActiveDatabase(activeDatabase) {
    return {
        type: ACTION_TYPE_SAVE_ACTIVE_DATABASE,
        activeDatabase: activeDatabase
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

export function setLoginState(loginState) {
    return {
        type: ACTION_TYPE_SET_LOGIN_STATE,
        loginState: loginState
    }
}

export function setLoaderState(loaderState) {
    return {
        type: ACTION_TYPE_SET_LOADER_STATE,
        loaderState: loaderState
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

export function getTranslations(language) {
    return new Promise((resolve, reject) => {
        getTranslationRequest(language, (error, response) => {
            if (error) {
                console.log("*** getTranslations error: ", error);
                reject(errorTypes.ERROR_OUTBREAK);
            }
            if (response) {
                console.log("### here should have the translations: ");
                resolve({translations: response});
            }
        })
    })
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
                reject(errorTypes.ERROR_OUTBREAK);
            }
            if (response) {
                // console.log("### here should have available languages: ", response.map((e) => {return {id: extractIdFromPouchId(e._id, 'language'), name: e.name}}));
                // dispatch(saveAvailableLanguages(response.map((e) => {return {value: e._id.substr('language.json_'.length), label: e.name}})));
                // resolve('Done available languages');
                resolve({availableLanguages: response.map((e) => {return {value: e._id.substr('language.json_'.length), label: e.name}})});
            }
        })
    })
    // }
}

export function storeHubConfigurationNew(hubConfiguration) {
    return async function (dispatch) {
        // let hubConfig = JSON.parse(hubConfiguration.clientId);
        console.log('Hub credentials: ', hubConfiguration);

        Promise.resolve()
            .then(() => RNFetchBlobFs.unlink(`${constants.DATABASE_LOCATIONS}`))
            .catch((errorDelete) => {
                console.log('error delete who_databases: ', errorDelete);
                return Promise.resolve();
            })
            .then(() => setInternetCredentials(hubConfiguration.url, hubConfiguration.clientId, hubConfiguration.clientSecret))
            .then(() => AsyncStorage.getItem(hubConfiguration.url))
            .then((lastSyncDate) => getDatabaseSnapshotRequestNew(hubConfiguration, lastSyncDate, dispatch))
            .then((databasePath) => {
                dispatch(processFilesForSyncNew(null, databasePath, hubConfiguration, true, true, true));
            })
            .catch((error) => {
                console.log('Error while doing stuff: ', error);
                dispatch(processFilesForSyncNew(error, null, hubConfiguration, true, true, true));
            })
    }
}

function processFilesForSyncNew(error, response, hubConfiguration, isFirstTime, syncSuccessful, forceBulk) {
    return async function (dispatch) {
        let hubConfig = JSON.parse(hubConfiguration.clientId);
        if (error) {
            if (error === 'No data to export') {
                dispatch(setSyncState({id: 'downloadDatabase', name: 'Download Database', status: error}));
            } else {
                dispatch(setSyncState({id: 'downloadDatabase', name: 'Download Database', status: 'Error', error: JSON.stringify(get(error, 'message', error))}));
                // dispatch(addError({type: 'Error downloading database', message: error}));
            }
        }
        if (response) {
            dispatch(setSyncState({id: 'downloadDatabase', name: 'Download Database', status: 'Success'}));
            dispatch(setSyncState({id: 'unzipFile', name: "Unzipping database", status: 'In progress'}));

            let responseUnzipPath = null;

            Promise.resolve()
                .then(() => unzipFile(response, constants.DATABASE_LOCATIONS, null, hubConfiguration))
                .then((unzipPath) => {
                    responseUnzipPath = unzipPath;
                    dispatch(setSyncState({id: 'unzipFile', name: "Unzipping database", status: 'Success'}));
                    dispatch(setSyncState({id: 'sync', name: 'Syncing', status: 'In progress'}));
                    setNumberOfFilesProcessed(0);

                    let databaseCreatePromise = createDatabase(hubConfiguration.url, hubConfiguration.clientSecret, true);
                    let readDirPromise = readDir(responseUnzipPath);

                    return Promise.all([databaseCreatePromise, readDirPromise])
                })
                .then(async (resultDatabaseCreationAndReadDir) => {
                    let promises = [];
                    let promiseResponses = [];
                    let database = resultDatabaseCreationAndReadDir[0];
                    let files = resultDatabaseCreationAndReadDir[1];

                    if (database && checkArrayAndLength(files)) {
                        // files = sortFiles(files);
                        let pouchFiles = files.filter((e) => {return !sqlConstants.databaseTables.includes(e.split('.')[0])});
                        pouchFiles = sortFiles(pouchFiles);
                        let sqlFiles = files.filter((e) => {return sqlConstants.databaseTables.includes(e.split('.')[0])});
                        sqlFiles = sortFilesForSql(sqlFiles);

                        // Do the pouch processing first
                        if (checkArrayAndLength(pouchFiles)) {
                            for(let i=0; i<pouchFiles.length; i++) {
                                try {
                                    // console.log('Memory size of database: ', memorySizeOf(database));
                                    let startTimeForProcessingOneFile = new Date().getTime();
                                    let auxData = await processFilePouch(`${constants.DATABASE_LOCATIONS}/${pouchFiles[i]}`, pouchFiles[i], files.length, dispatch, isFirstTime, forceBulk, hubConfig.encryptedData, hubConfig);
                                    if (auxData) {
                                        // console.log('auxData: ', auxData);
                                        console.log(`Time for processing file: ${pouchFiles[i]}: ${new Date().getTime() - startTimeForProcessingOneFile}`);
                                        promiseResponses.push(auxData);
                                    } else {
                                        console.log('There was an error at processing file: ', pouchFiles[i]);
                                        dispatch(setSyncState({id: 'sync', status: 'Error', error: `There was an error at processing file: ${pouchFiles[i]}`}));
                                        break;
                                    }
                                } catch (errorProcessFile) {
                                    console.log('There was an error at processing file: ', pouchFiles[i], errorProcessFile);
                                    dispatch(setSyncState({id: 'sync', status: 'Error', error: `There was an error at processing file: ${pouchFiles[i]}: ${JSON.stringify(errorProcessFile)}`}));
                                    break;
                                }
                            }
                        }

                        // Create tables first
                        try {
                            let initTablesResults = await initTables();
                        } catch(errorInitTables) {
                            console.log('An error occurred while creating tables: ', errorInitTables);
                        }

                        // Do the sql processing
                        if (checkArrayAndLength(sqlFiles)) {
                            for(let i=0; i<sqlFiles.length; i++) {
                                try {
                                    let startTimeForProcessingOneFile = new Date().getTime();
                                    let auxData = await processFilesSql(`${constants.DATABASE_LOCATIONS}/${sqlFiles[i]}`, sqlFiles[i].split('.')[0], files.length, dispatch, hubConfig.encryptedData, hubConfig);
                                    if (auxData) {
                                        console.log('auxData: ', auxData);
                                        console.log(`Time for processing file: ${sqlFiles[i]}: ${new Date().getTime() - startTimeForProcessingOneFile}`);
                                        promiseResponses.push(auxData);
                                    } else {
                                        console.log('There was an error at processing file: ', sqlFiles[i]);
                                        dispatch(setSyncState({id: 'sync', status: 'Error', error: `There was an error at processing file: ${sqlFiles[i]}`}));
                                        break;
                                    }
                                } catch(errorProcessingFilesForSql) {
                                    console.log('There was an error at processing file: ', sqlFiles[i], errorProcessingFilesForSql);
                                    dispatch(setSyncState({id: 'sync', status: 'Error', error: `There was an error at processing file: ${sqlFiles[i]}: ${JSON.stringify(errorProcessingFilesForSql)}`}));
                                    break;
                                }
                            }
                        }

                        if (promiseResponses.length === files.length) {
                            saveActiveDatabaseAndCleanup(syncSuccessful, hubConfiguration, hubConfig, files.length === promiseResponses.length)
                                .then((success) => {
                                    console.log('Responses promises: ', promiseResponses);
                                    files = null;
                                    database = null;
                                    dispatch(setSyncState({id: 'sync', status: 'Success'}));
                                    if (!isFirstTime) {
                                        dispatch(setSyncState({id: 'getDataFromServer', status: 'Success'}));
                                    }
                                })
                                .catch((errorSaveActiveDatabaseAndCleanup) => {
                                    console.log('error saveActiveDatabaseAndCleanup: ', errorSaveActiveDatabaseAndCleanup);
                                    files = null;
                                    database = null;
                                    dispatch(setSyncState({
                                        id: 'sync',
                                        status: 'Error',
                                        error: `Error at storing database name: \n${JSON.stringify(errorSaveActiveDatabaseAndCleanup)}`
                                    }));
                                    if (!isFirstTime) {
                                        dispatch(setSyncState({id: 'getDataFromServer', status: 'Error'}));
                                    }
                                })
                        } else {
                            dispatch(setSyncState({id: 'sync', status: 'Error', error: 'Error while processing files'}));
                        }
                    }
                })
        }
    }
}

function sortFiles (files) {
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

    return files;
}

function sortFilesForSql (files) {
    let sortedArrayOfFiles = [];
    if (checkArrayAndLength(files)) {
        for (let i = 0; i < sqlConstants.databaseTables.length; i++) {
            sortedArrayOfFiles = sortedArrayOfFiles.concat(sortFiles(files.filter((e) => e.includes(sqlConstants.databaseTables[i]))));
        }
    }
    return sortedArrayOfFiles;
}

function saveActiveDatabaseAndCleanup(syncSuccessful, hubConfiguration, hubConfig, processedAllFiles) {
    return Promise.resolve()
        .then(deleteFile(constants.DATABASE_LOCATIONS, true))
        .then(() => {
            if (!syncSuccessful && !processedAllFiles) {
                return Promise.reject('Sync unsuccessful');
            } else {
                let storeActiveDatabasePair = ['activeDatabase', hubConfiguration.url];
                let storeLastScynDataForHub = [hubConfiguration.url, createDate(null, null, true).toISOString()];
                let storeMultipleDataPromise = AsyncStorage.multiSet([storeActiveDatabasePair, storeLastScynDataForHub]);
                // let storeActiveDatabasePromise = AsyncStorage.setItem('activeDatabase', hubConfiguration.url);
                // let storeLastSyncDateForHubPromise = AsyncStorage.setItem(hubConfiguration.url, createDate(null, null, true));
                let getAllOtherDatabases = AsyncStorage.getItem('databases');

                return Promise.all([storeMultipleDataPromise, getAllOtherDatabases]);
            }
        })
        .then(([storeMultipleDataArray, databases]) => {
            if (databases) {
                databases = JSON.parse(databases);
            }
            if (checkArrayAndLength(databases)) {
                if (databases.find((e) => e.id === hubConfiguration.url)) {
                    return Promise.resolve();
                }
                databases.push({id: hubConfiguration.url, name: hubConfig.name});
            } else {
                // Databases is either null or empty array
                databases = [{id: hubConfiguration.url, name: hubConfig.name}]
            }
            return AsyncStorage.setItem('databases', JSON.stringify(databases));
        })
        .catch((errorStoreData) => Promise.reject(errorStoreData));
}

export function sendDatabaseToServer () {
    return async function (dispatch, getState) {
        dispatch(setSyncState({id: 'getData', status: 'In progress'}));
        let internetCredentialsGlobal = null;
        let lastSyncDateGlobal = null;
        let skipZip = true;
        // Get activeDatabase
        Promise.resolve()
            .then(() => AsyncStorage.getItem('activeDatabase'))
            .then((activeDatabase) => {
                let lastSyncDatePromise = AsyncStorage.getItem(activeDatabase);
                let internetCredentialsPromise = getInternetCredentials(activeDatabase);
                let cleanupPromise = deleteFile(constants.FILES_LOCATIONS, true);

                return Promise.all([lastSyncDatePromise, internetCredentialsPromise, Promise.resolve(activeDatabase), cleanupPromise])
            })
            .then(async ([lastSyncDate, internetCredentials, activeDatabase, cleanUpResult]) => {
                internetCredentialsGlobal = internetCredentials;
                lastSyncDateGlobal = lastSyncDate;
                let statusArray = [];
                let credentials = JSON.parse(internetCredentials.username);
                let password = credentials.encryptedData ? getSyncEncryptPassword(null, credentials) : null;
                for (let i=0; i<config.changingMongoCollections.length; i++) {
                    try {
                        let database = await getDatabase(config.changingMongoCollections[i]);
                        let status = await getDataFromDatabaseFromFile(database, config.changingMongoCollections[i], lastSyncDate, password);

                        statusArray.push(status);
                    } catch (errorGetDatabaseFromFile) {
                        console.log('ErrorGetDatabaseFromFile: ', errorGetDatabaseFromFile);
                        dispatch(setSyncState({
                            id: 'createFile',
                            status: 'Error',
                            error: JSON.stringify(errorGetDatabaseFromFile)
                        }));
                        break;
                    }
                }
                for (let i=0; i<config.changingSQLiteCollections.length; i++) {
                    try {
                        let status = await getDataFromDatabaseFromFileSql(config.changingSQLiteCollections[i], lastSyncDate, password);

                        statusArray.push(status);
                    } catch(errorGetSQLite) {
                        console.log('ErrorGetDatabaseFromFile: ', errorGetSQLite);
                        dispatch(setSyncState({
                            id: 'createFile',
                            status: 'Error',
                            error: JSON.stringify(errorGetSQLite)
                        }));
                        break;
                    }
                }

                if (statusArray.length === (config.changingMongoCollections.length + config.changingSQLiteCollections.length)) {
                    // Check if the status array is full of "No data to send" statuses
                    // let skipZip = true;

                    for (let i = 0; i < statusArray.length; i++) {
                        if (statusArray[i] !== 'No data to send') {
                            skipZip = false;
                        }
                    }

                    let promise = skipZip ? Promise.resolve() : createZipFileAtPath(`${RNFetchBlobFs.dirs.DocumentDir}/who_files`, `${RNFetchBlobFs.dirs.DocumentDir}/${activeDatabase.replace(/\/|\.|\:/g, '')}.zip`)

                    if (skipZip) {
                        dispatch(setSyncState({id: 'getData', status: 'No data to send'}));
                        dispatch(setSyncState({id: 'createFile', status: 'Skip'}));
                        dispatch(setSyncState({id: 'sendData', status: 'Skip'}));
                    } else {
                        dispatch(setSyncState({id: 'getData', status: 'Success'}));
                        dispatch(setSyncState({id: 'createFile', status: 'In progress'}));
                    }

                    return promise;
                }
            })
            .then((zipPath) => {
                let promise = zipPath ? postDatabaseSnapshotRequest(internetCredentialsGlobal, zipPath) : Promise.resolve();
                if(zipPath) {
                    dispatch(setSyncState({id: 'createFile', status: 'Success'}));
                    dispatch(setSyncState({id: 'sendData', status: 'In progress'}));
                }

                return promise;
            })
            .then((resultPostDatabase) => {
                if (resultPostDatabase && !resultPostDatabase.includes('Finished')) {
                    dispatch(setSyncState({id: 'sendData', status: 'Error', error: JSON.stringify(resultPostDatabase)}));
                } else {
                    if (!skipZip) {
                        dispatch(setSyncState({id: 'sendData', status: 'Success'}));
                    }
                    getDatabaseSnapshotRequestNew(
                        {
                            url: internetCredentialsGlobal.server ? internetCredentialsGlobal.server : internetCredentialsGlobal.service,
                            clientId: internetCredentialsGlobal.username,
                            clientSecret: internetCredentialsGlobal.password
                        },
                        lastSyncDateGlobal,
                        dispatch)
                        .then((databasePath) => {
                            dispatch(processFilesForSyncNew(null, databasePath, {
                                url: Platform.OS === 'ios' ? internetCredentialsGlobal.server : internetCredentialsGlobal.service,
                                clientId: internetCredentialsGlobal.username,
                                clientSecret: internetCredentialsGlobal.password
                            }, null, true, false));
                        })
                        .catch((errorGetDatabase) => {
                            if (errorGetDatabase === 'No data to export') {
                                dispatch(setSyncState({id: 'getDataFromServer', status: 'No data to export'}));
                            } else {
                                dispatch(setSyncState({id: 'getDataFromServer', status: 'Error', error: JSON.stringify(error)}));
                            }
                        })
                }
            })
            .catch((errorSendDatabase) => {
                dispatch(setSyncState({id: 'sendData', status: 'Error', error: JSON.stringify(errorSendDatabase)}));
            })
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

// export function appInitializedNew(nativeEventEmitter) {
//     return async function (dispatch) {
//         // Handle save screen size for measurements
//         let width = Dimensions.get("window").width;
//         let height = Dimensions.get('window').height;
//         let screenSize = {width, height};
//         dispatch(saveScreenSize(screenSize));
//
//         let loggedUserGlobal = null;
//         let activeDatabaseGlobal = null;
//
//         AsyncStorage.getItem('loggedUser')
//             .then((loggedUser) => {
//                 loggedUserGlobal = loggedUser;
//                 return Promise.resolve();
//             })
//             .catch((errorGetLoggedUser) => Promise.resolve())
//             .then(() => AsyncStorage.getItem('activeDatabase'))
//             .then((activeDatabase) => {
//                 activeDatabaseGlobal = activeDatabase;
//                 return Promise.resolve();
//             })
//             .catch((errorGetActiveDatabase) => Promise.resolve())
//     }
// }

export function appInitialized(nativeEventEmitter) {
    return async function (dispatch, getState) {
        // Get Screen Dimensions and store them to the redux store in order to use them throughout the app
        let width = Dimensions.get("window").width;
        let height = Dimensions.get('window').height;

        let screenSize = {width, height};

        dispatch(saveScreenSize(screenSize));
        // dispatch(saveSelectedScreen(0));

        try {
            let loggedUser = await AsyncStorage.getItem('loggedUser');
            // console.log('Logged user: ', loggedUser);
            if (loggedUser !== null) {
                try {
                    let activeDatabase = await AsyncStorage.getItem('activeDatabase');
                    // console.log('Active database: ', activeDatabase);
                    if (activeDatabase !== null) {
                        dispatch(saveActiveDatabase(activeDatabase));
                        try {
                            let databaseCredentials = await getInternetCredentials(activeDatabase);

                            if (databaseCredentials) {
                                // console.log('Database credentials: ', databaseCredentials);
                                let server = Platform.OS === 'ios' ? databaseCredentials.server : databaseCredentials.service;
                                try {
                                    let database = await createDatabase(server.replace(/\/|\.|\:/g, ''), databaseCredentials.password, false);
                                    if (database) {
                                        dispatch(getUserById(loggedUser, null, false, nativeEventEmitter));
                                    } else {
                                        console.log('Database does not exist');
                                        dispatch(changeAppRoot('config'));
                                        console.log('NativeEventEmitter: ', typeof nativeEventEmitter, nativeEventEmitter);
                                        console.log("Typeof nativeEventEmitter: ", typeof nativeEventEmitter.appLoaded);
                                        if (nativeEventEmitter && typeof nativeEventEmitter.appLoaded === 'function') {
                                            dispatch(middlewareFunction(nativeEventEmitter));
                                        }
                                    }
                                } catch (errorCreateDatabase) {
                                    console.log('errorCreateDatabase: ', errorCreateDatabase);
                                    dispatch(changeAppRoot('config'));
                                    console.log('NativeEventEmitter: ', typeof nativeEventEmitter, nativeEventEmitter);
                                    console.log("Typeof nativeEventEmitter: ", typeof nativeEventEmitter.appLoaded);
                                    if (nativeEventEmitter) {
                                        dispatch(middlewareFunction(nativeEventEmitter));
                                    }
                                }

                            } else {
                                console.log("Don't have database credentials, but have active database and logged user. Proceed to config screen");
                                dispatch(changeAppRoot('config'));
                                console.log('NativeEventEmitter: ', typeof nativeEventEmitter, nativeEventEmitter);
                                console.log("Typeof nativeEventEmitter: ", typeof nativeEventEmitter.appLoaded);
                                if (nativeEventEmitter) {
                                    dispatch(middlewareFunction(nativeEventEmitter));
                                }
                            }
                        } catch (errorGetDatabaseCredentials) {
                            console.log("Don't have database credentials, but have active database and logged user and error. Proceed to config screen: ", errorGetDatabaseCredentials);
                            dispatch(changeAppRoot('config'));
                            console.log('NativeEventEmitter: ', typeof nativeEventEmitter, nativeEventEmitter);
                            console.log("Typeof nativeEventEmitter: ", typeof nativeEventEmitter.appLoaded);
                            if (nativeEventEmitter) {
                                dispatch(middlewareFunction(nativeEventEmitter));
                            }
                        }
                    } else {
                        console.log("Don't have an active database but we have a logged user. Proceed to config screen");
                        dispatch(changeAppRoot('config'));
                        console.log('NativeEventEmitter: ', typeof nativeEventEmitter, nativeEventEmitter);
                        console.log("Typeof nativeEventEmitter: ", typeof nativeEventEmitter.appLoaded);
                        if (nativeEventEmitter) {
                            dispatch(middlewareFunction(nativeEventEmitter));
                        }
                    }
                } catch (errorGetActiveDatabase) {
                    console.log("We have an error at getting the active database, but we have logged user. Proceed to config screen: ", errorGetActiveDatabase)
                    dispatch(changeAppRoot('config'));
                    console.log('NativeEventEmitter: ', typeof nativeEventEmitter, nativeEventEmitter);
                    console.log("Typeof nativeEventEmitter: ", typeof nativeEventEmitter.appLoaded);
                    if (nativeEventEmitter) {
                        dispatch(middlewareFunction(nativeEventEmitter));
                    }
                }
            } else {
                console.log("Don't have a logged user. Time to check if there is an active database and if there is, move to the login screen");
                try {
                    let activeDatabase = await AsyncStorage.getItem('activeDatabase');
                    // console.log('Active database: ', activeDatabase);
                    if (activeDatabase !== null) {
                        dispatch(saveActiveDatabase(activeDatabase));
                        // If there is an active database get its credentials and proceeed to the login screen
                        try {
                            let databaseCredentials = await getInternetCredentials(activeDatabase);
                            // console.log('Database credentials: ', databaseCredentials);
                            if (databaseCredentials) {
                                let server = Platform.OS === 'ios' ? databaseCredentials.server : databaseCredentials.service;
                                try {
                                    let database = await createDatabase(server.replace(/\/|\.|\:/g, ''), databaseCredentials.password, false);
                                    if (database) {
                                        dispatch(changeAppRoot('login'));
                                        console.log('NativeEventEmitter: ', typeof nativeEventEmitter, nativeEventEmitter);
                                        console.log("Typeof nativeEventEmitter: ", typeof nativeEventEmitter.appLoaded);
                                        if (nativeEventEmitter) {
                                            dispatch(middlewareFunction(nativeEventEmitter));
                                        }
                                    } else {
                                        console.log('Database does not exist');
                                        dispatch(changeAppRoot('config'));
                                        console.log('NativeEventEmitter: ', typeof nativeEventEmitter, nativeEventEmitter);
                                        console.log("Typeof nativeEventEmitter: ", typeof nativeEventEmitter.appLoaded);
                                        if (nativeEventEmitter) {
                                            dispatch(middlewareFunction(nativeEventEmitter));
                                        }
                                    }
                                } catch (errorCreateDatabase) {
                                    console.log('errorCreateDatabase: ', errorCreateDatabase);
                                    dispatch(changeAppRoot('config'));
                                    console.log('NativeEventEmitter: ', typeof nativeEventEmitter, nativeEventEmitter);
                                    console.log("Typeof nativeEventEmitter: ", typeof nativeEventEmitter.appLoaded);
                                    if (nativeEventEmitter) {
                                        dispatch(middlewareFunction(nativeEventEmitter));
                                    }
                                }
                            } else {
                                console.log("We don't have logged user, we have active database, but we don't have credentials. Proceed to config screen");
                                dispatch(changeAppRoot('config'));
                                console.log('NativeEventEmitter: ', typeof nativeEventEmitter, nativeEventEmitter);
                                console.log("Typeof nativeEventEmitter: ", typeof nativeEventEmitter.appLoaded);
                                if (nativeEventEmitter) {
                                    dispatch(middlewareFunction(nativeEventEmitter));
                                }
                            }
                        } catch (errorDatabaseCredentials) {
                            console.log("We don't have logged user, we have active database, but we have error when getting its credentials. Proceed to config screen", errorDatabaseCredentials);
                            dispatch(changeAppRoot('config'));
                            console.log('NativeEventEmitter: ', typeof nativeEventEmitter, nativeEventEmitter);
                            console.log("Typeof nativeEventEmitter: ", typeof nativeEventEmitter.appLoaded);
                            if (nativeEventEmitter) {
                                dispatch(middlewareFunction(nativeEventEmitter));
                            }
                        }
                    } else {
                        console.log("We don't have an active database, and we don't have logged user. Proceed to config screen");
                        dispatch(changeAppRoot('config'));
                        console.log('NativeEventEmitter: ', typeof nativeEventEmitter, nativeEventEmitter);
                        console.log("Typeof nativeEventEmitter: ", typeof nativeEventEmitter.appLoaded);
                        if (nativeEventEmitter) {
                            dispatch(middlewareFunction(nativeEventEmitter));
                        }
                    }
                } catch (errorActiveDatabase) {
                    console.log("We don't have a logged user and we have an error at getting active database. Proceed to config screen ", errorActiveDatabase);
                    dispatch(changeAppRoot('config'));
                    console.log('NativeEventEmitter: ', typeof nativeEventEmitter, nativeEventEmitter);
                    console.log("Typeof nativeEventEmitter: ", typeof nativeEventEmitter.appLoaded);
                    if (nativeEventEmitter) {
                        dispatch(middlewareFunction(nativeEventEmitter));
                    }
                }
            }
        } catch (errorGetLoggedUser) {
            console.log("We have an error at getting logged user. We try to see if there is an active database: ");
            try {
                let activeDatabase = await AsyncStorage.getItem('activeDatabase');
                // console.log('Active database: ', activeDatabase);
                if (activeDatabase !== null) {
                    dispatch(saveActiveDatabase(activeDatabase));
                    // If there is an active database get its credentials and proceeed to the login screen
                    try {
                        let databaseCredentials = await getInternetCredentials(activeDatabase);
                        // console.log('Database credentials: ', databaseCredentials);
                        if (databaseCredentials) {
                            let server = Platform.OS === 'ios' ? databaseCredentials.server : databaseCredentials.service;
                            try {
                                let database = await createDatabase(server.replace(/\/|\.|\:/g, ''), databaseCredentials.password, false);
                                if (database) {
                                    dispatch(changeAppRoot('login'));
                                    console.log('NativeEventEmitter: ', typeof nativeEventEmitter, nativeEventEmitter);
                                    console.log("Typeof nativeEventEmitter: ", typeof nativeEventEmitter.appLoaded);
                                    if (nativeEventEmitter) {
                                        dispatch(middlewareFunction(nativeEventEmitter));
                                    }
                                } else {
                                    console.log('Database does not exist');
                                    dispatch(changeAppRoot('config'));
                                    console.log('NativeEventEmitter: ', typeof nativeEventEmitter, nativeEventEmitter);
                                    console.log("Typeof nativeEventEmitter: ", typeof nativeEventEmitter.appLoaded);
                                    if (nativeEventEmitter) {
                                        dispatch(middlewareFunction(nativeEventEmitter));
                                    }
                                }
                            } catch (errorCreateDatabase) {
                                console.log('errorCreateDatabase: ', errorCreateDatabase);
                                dispatch(changeAppRoot('config'));
                                console.log('NativeEventEmitter: ', typeof nativeEventEmitter, nativeEventEmitter);
                                console.log("Typeof nativeEventEmitter: ", typeof nativeEventEmitter.appLoaded);
                                if (nativeEventEmitter) {
                                    dispatch(middlewareFunction(nativeEventEmitter));
                                }
                            }
                        } else {
                            console.log("We don't have logged user, we have active database, but we don't have credentials. Proceed to config screen");
                            dispatch(changeAppRoot('config'));
                            console.log('NativeEventEmitter: ', typeof nativeEventEmitter, nativeEventEmitter);
                            console.log("Typeof nativeEventEmitter: ", typeof nativeEventEmitter.appLoaded);
                            if (nativeEventEmitter) {
                                dispatch(middlewareFunction(nativeEventEmitter));
                            }
                        }
                    } catch (errorDatabaseCredentials) {
                        console.log("We don't have logged user, we have active database, but we have error when getting its credentials. Proceed to config screen", errorDatabaseCredentials);
                        dispatch(changeAppRoot('config'));
                        console.log('NativeEventEmitter: ', typeof nativeEventEmitter, nativeEventEmitter);
                        console.log("Typeof nativeEventEmitter: ", typeof nativeEventEmitter.appLoaded);
                        if (nativeEventEmitter) {
                            dispatch(middlewareFunction(nativeEventEmitter));
                        }
                    }
                } else {
                    console.log("We don't have an active database, and we don't have logged user. Proceed to config screen");
                    dispatch(changeAppRoot('config'));
                    console.log('NativeEventEmitter: ', typeof nativeEventEmitter, nativeEventEmitter);
                    console.log("Typeof nativeEventEmitter: ", typeof nativeEventEmitter.appLoaded);
                    if (nativeEventEmitter) {
                        dispatch(middlewareFunction(nativeEventEmitter));
                    }
                }
            } catch (errorActiveDatabase) {
                console.log("We don't have a logged user and we have an error at getting active database. Proceed to config screen ", errorActiveDatabase);
                dispatch(changeAppRoot('config'));
                console.log('NativeEventEmitter: ', typeof nativeEventEmitter, nativeEventEmitter);
                console.log("Typeof nativeEventEmitter: ", typeof nativeEventEmitter.appLoaded);
                if (nativeEventEmitter) {
                    dispatch(middlewareFunction(nativeEventEmitter));
                }
            }
        }
    }
}

export function middlewareFunction(nativeEventEmitter) {
    return async function (dispatch) {
        if (nativeEventEmitter && typeof nativeEventEmitter.appLoaded === 'function') {
            dispatch(() => {nativeEventEmitter.appLoaded()});
        }
    }
}