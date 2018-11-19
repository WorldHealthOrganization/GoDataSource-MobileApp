/**
 * Created by florinpopa on 14/06/2018.
 */
import {
    ACTION_TYPE_ROOT_CHANGE,
    ACTION_TYPE_SAVE_SCREEN_SIZE,
    ACTION_TYPE_ADD_FILTER_FOR_SCREEN,
    ACTION_TYPE_REMOVE_FILTER_FOR_SCREEN,
    ACTION_TYPE_SAVE_TRANSLATION,
    ACTION_TYPE_SAVE_AVAILABLE_LANGUAGES,
    ACTION_TYPE_SAVE_HUB_CONFIGURATION,
    ACTION_TYPE_SET_SYNC_STATE,
    ACTION_TYPE_SET_LOGIN_STATE
} from './../utils/enums';
import url from '../utils/url';
import config from './../utils/config';
import { loginUser } from './user';
import {Dimensions} from 'react-native';
import {Platform, NativeModules} from 'react-native';
// import {getTranslationRequest} from './../requests/translation';
import {getAvailableLanguagesRequest, getTranslationRequest} from './../queries/translation';
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
// import RNDB from 'react-native-nosql-to-sqlite';

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
                dispatch(saveAvailableLanguages(response.map((e) => {return {value: e._id.substr(20), label: e.name}})));
                resolve('Done languages');
            }
        })
    })
    // }
}

export function storeHubConfiguration(hubConfiguration) {
    return async function (dispatch) {
        url.setBaseUrl(hubConfiguration.url);
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
                getDatabaseSnapshotRequest(hubConfiguration, lastSyncDate, (error, response) => {
                    dispatch(processFilesForSync(error, response, hubConfiguration, true, true));
                })
            } else {
                console.log('No last sync date found. proceed to download all database: ');
                getDatabaseSnapshotRequest(hubConfiguration, null, (error, response) => {
                    dispatch(processFilesForSync(error, response, hubConfiguration, true, true));
                })
            }
        } catch (errorGetLastSyncDate) {
            console.log("Error at getting lastSyncDate. Proceed to download all database: ", errorGetLastSyncDate);
            getDatabaseSnapshotRequest(hubConfiguration, null, (error, response) => {
                dispatch(processFilesForSync(error, response, hubConfiguration, true, true));
            })
        }
    }
}

function processFilesForSync(error, response, hubConfiguration, isFirstTime, syncSuccessful) {
    return async function (dispatch){
        if (error) {
            dispatch(setSyncState('Error'));
        }
        if (response) {
            dispatch(setSyncState("Unzipping database..."));

            try {
                let responseUnzipPath = await unzipFile(response, RNFetchBlobFs.dirs.DocumentDir + "/who_databases");
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
                                let files = await readDir(responseUnzipPath);

                                if (files) {
                                    // For every file of the database dump, do sync
                                    for (let i = 0; i < files.length; i++) {
                                        if (files[i] !== 'auditLog.json' && files[i] !== 'icon.json' && files[i] !== 'icons') {
                                            // promises.push(processFile(RNFetchBlobFs.dirs.DocumentDir + '/who_databases/' + files[i], files[i], files.length, dispatch, isFirstTime));
                                            // Process every file synchronously
                                            try {
                                                // console.log('Memory size of database: ', memorySizeOf(database));
                                                let auxData = await processFile(RNFetchBlobFs.dirs.DocumentDir + '/who_databases/' + files[i], files[i], files.length, dispatch, isFirstTime);
                                                if (auxData) {
                                                    console.log('auxData: ', auxData);
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
                                    console.log("Now that the processing is over, proceed with storing last sync date:");
                                    if (syncSuccessful && promiseResponses.length === files.length) {
                                        storeData('activeDatabase', hubConfiguration.url, (errorActiveDatabase) => {
                                            if (!errorActiveDatabase) {
                                                storeData(hubConfiguration.url, new Date(), (errorStoreLastSync) => {
                                                    if (!errorStoreLastSync) {
                                                        console.log('Responses promises: ', promiseResponses);
                                                        files = null;
                                                        database = null;
                                                        arrayOfStatuses.push({
                                                            text: 'Getting updated data from the server',
                                                            status: 'OK'
                                                        });
                                                        dispatch(setSyncState("Finished processing"));
                                                        if (!isFirstTime) {
                                                            dispatch(parseStatusesAndShowMessage());
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
                                                            dispatch(parseStatusesAndShowMessage());
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
                                                    dispatch(parseStatusesAndShowMessage());
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
                                                dispatch(parseStatusesAndShowMessage());
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
                                                dispatch(parseStatusesAndShowMessage());
                                            }
                                        }
                                    }

                                    // Promise.all(promises)
                                    //     .then((responses) => {
                                    //         // After processing all the data store the last sync date
                                    //         console.log("Now that the processing is over, proceed with storing last sync date:");
                                    //         storeData('activeDatabase', hubConfiguration.url, (errorActiveDatabase) => {
                                    //             if (!errorActiveDatabase) {
                                    //                 storeData(hubConfiguration.url, new Date(), (errorStoreLastSync) => {
                                    //                     if (!errorStoreLastSync) {
                                    //                         console.log('Responses promises: ', responses);
                                    //                         dispatch(setSyncState("Finished processing"));
                                    //                     } else {
                                    //                         console.log('There was an error at storing last sync date: ', errorStoreLastSync);
                                    //                         dispatch(setSyncState('Error'));
                                    //                     }
                                    //                 });
                                    //             } else {
                                    //                 console.log('There was an error at storing active database: ', errorActiveDatabase);
                                    //                 dispatch(setSyncState('Error'));
                                    //             }
                                    //         });
                                    //     })
                                    //     .catch((error) => {
                                    //         console.log("Error promises: ", error);
                                    //         dispatch(setSyncState('Error'));
                                    //     })
                                } else {
                                    console.log('No files found');
                                    arrayOfStatuses.push({text: 'Getting updated data from the server', status: 'No files found'});
                                    dispatch(setSyncState('Error'));
                                    if (!isFirstTime) {
                                        dispatch(parseStatusesAndShowMessage());
                                    }
                                }
                            } catch(errorReadDir) {
                                console.log('Error while reading directory: ', errorReadDir);
                                arrayOfStatuses.push({text: 'Getting updated data from the server', status: JSON.stringify(errorReadDir)});
                                dispatch(setSyncState('Error'));
                                if (!isFirstTime) {
                                    dispatch(parseStatusesAndShowMessage());
                                }
                            }
                        } else {
                            arrayOfStatuses.push({text: 'Getting updated data from the server', status: 'No database found'});
                            dispatch(setSyncState('Error'));
                            if (!isFirstTime) {
                                dispatch(parseStatusesAndShowMessage());
                            }
                        }
                    } catch (errorCreateDatabase) {
                        console.log("Error create database: ", errorCreateDatabase);
                        arrayOfStatuses.push({text: 'Getting updated data from the server', status: JSON.stringify(errorCreateDatabase)});
                        dispatch(setSyncState('Error'));
                        if (!isFirstTime) {
                            dispatch(parseStatusesAndShowMessage());
                        }
                    }
                } else {
                    dispatch(setSyncState('Error'));
                    arrayOfStatuses.push({text: 'Getting updated data from the server', status: 'No zip file'});
                    if (!isFirstTime) {
                        dispatch(parseStatusesAndShowMessage());
                    }
                }
            } catch (unzipError) {
                console.log("Error promises: ", error);
                arrayOfStatuses.push({text: 'Getting updated data from the server', status: JSON.stringify(unzipError)});
                dispatch(setSyncState('Error'));
                if (!isFirstTime) {
                    dispatch(parseStatusesAndShowMessage());
                }
            }

            // unzipFile(response, RNFetchBlobFs.dirs.DocumentDir + "/who_databases", (unzipError, responseUnzipPath) => {
            //     if (unzipError) {
            //         console.log("Error while unzipping file");
            //         dispatch(setSyncState('Error'));
            //     }
            //     if (responseUnzipPath) {
            //         // At this point we have the path to where the json files from the downloaded database are
            //         // We should call the method to sync those data
            //         dispatch(setSyncState("Syncing...."));
            //         setNumberOfFilesProcessed(0);
            //
            //         // RNDB.configureDatabaseWithConfig(config.RNDBConfig);
            //         // RNDB.importDataWithCallback(() => {
            //         //     dispatch(setSyncState("Finished processing"));
            //         // });
            //
            //
            //         // Create local database
            //         createDatabase(hubConfiguration.url.replace(/\/|\.|\:/g, ''), hubConfiguration.clientSecret, true, (database) => {
            //             // Create a promise array to run syncing for all the files from the db
            //             let promises = [];
            //             let promiseResponses = [];
            //             readDir(responseUnzipPath, (errorReadDir, files) => {
            //                 if (errorReadDir) {
            //                     console.log('Error while reading directory');
            //                     dispatch(setSyncState('Error'));
            //                 }
            //                 if (files) {
            //                     // For every file of the database dump, do sync
            //                     for(let i=0; i<files.length; i++) {
            //                         if (files[i] !== 'auditLog.json' && files[i] !== 'icon.json' && files[i] !== 'icons') {
            //                             promises.push(processFile(RNFetchBlobFs.dirs.DocumentDir + '/who_databases/' + files[i], files[i], files.length, dispatch, isFirstTime));
            //                         }
            //                     }
            //                     Promise.all(promises)
            //                         .then((responses) => {
            //                             // After processing all the data store the last sync date
            //                             console.log("Now that the processing is over, proceed with storing last sync date:");
            //                             storeData('activeDatabase', hubConfiguration.url, (errorActiveDatabase) => {
            //                                 if (!errorActiveDatabase) {
            //                                     storeData(hubConfiguration.url, new Date(), (errorStoreLastSync) => {
            //                                         if (!errorStoreLastSync) {
            //                                             console.log('Responses promises: ', responses);
            //                                             dispatch(setSyncState("Finished processing"));
            //                                         } else {
            //                                             console.log('There was an error at storing last sync date: ', errorStoreLastSync);
            //                                             dispatch(setSyncState('Error'));
            //                                         }
            //                                     });
            //                                 } else {
            //                                     console.log('There was an error at storing active database: ', errorActiveDatabase);
            //                                     dispatch(setSyncState('Error'));
            //                                 }
            //                             });
            //                         })
            //                         .catch((error) => {
            //                             console.log("Error promises: ", error);
            //                             dispatch(setSyncState('Error'));
            //                         })
            //                 }
            //             })
            //         });
            //     }
            // })
        }
    }
}

function parseStatusesAndShowMessage () {
    return async function (dispatch) {
        let text = '';
        for (let i=0; i<arrayOfStatuses.length; i++) {
            text += arrayOfStatuses[i].text + '\n' + 'Status: ' + arrayOfStatuses[i].status + '\n';
        }
        dispatch(addError({type: 'Sync status info', message: text}));
    }
}

export function sendDatabaseToServer () {
    return async function (dispatch) {
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
                            database.find({selector: {
                                updatedAt: {$gte: lastSyncDate}
                            },
                                fields: ['fileType']
                            })
                                .then((resultGetRecordsByDate) => {
                                    resultGetRecordsByDate = uniq(resultGetRecordsByDate.docs);
                                    console.log('resultGetRecordsByDate: took: ', new Date().getTime() - startTimeForFilesChanged);
                                    // Now, for each fileType, we must create a .json file, archive it and then send that archive to the server
                                    let promiseArray = [];

                                    if (resultGetRecordsByDate && Array.isArray(resultGetRecordsByDate) && resultGetRecordsByDate.length > 0) {
                                        for (let i=0; i<resultGetRecordsByDate.length; i++) {
                                            promiseArray.push(getDataFromDatabaseFromFile(database, resultGetRecordsByDate[i].fileType, lastSyncDate))
                                        }

                                        // statuses.gettingLocalFiles.status = 'OK';
                                        arrayOfStatuses.push({text: 'Getting local data', status: 'OK'});
                                        dispatch(setSyncState('Creating local files'));
                                        let startTimeForCreatingFiles = new Date().getTime();
                                        console.log('Add stuff: ', promiseArray.length);
                                        Promise.all(promiseArray)
                                            .then((resultsCreateAlFiles) => {
                                                // After creating all the needed files, we need to make a zip file
                                                console.log('Result from processing all the files: timeForCreatingFiles: ', new Date().getTime() - startTimeForCreatingFiles);
                                                let startTimeForCreateZip = new Date().getTime();
                                                createZipFileAtPath(`${RNFetchBlobFs.dirs.DocumentDir}/who_files`, `${RNFetchBlobFs.dirs.DocumentDir}/${activeDatabase.replace(/\/|\.|\:/g, '')}.zip`, (errorCreateZipFile, resultCreateZipFile) => {
                                                    if (errorCreateZipFile) {
                                                        console.log("An error occurred while zipping the files: ", errorCreateZipFile);
                                                        arrayOfStatuses.push({text: 'Creating local files', status: JSON.stringify(errorCreateZipFile)});
                                                        dispatch(parseStatusesAndShowMessage());
                                                    }
                                                    if (resultCreateZipFile) {
                                                        // After creating the zip file, it's time to send it to the server
                                                        console.log("Response from create zip file: time For zip", new Date().getTime() - startTimeForCreateZip);
                                                        // statuses.createLocalFiles.status = 'OK';
                                                        arrayOfStatuses.push({text: 'Creating local files', status: 'OK'});
                                                        dispatch(setSyncState('Sending data to the HUB'));
                                                        postDatabaseSnapshotRequest(internetCredentials, resultCreateZipFile, (errorSendData, resultSendData) => {
                                                            if (errorSendData && !resultSendData) {
                                                                console.log('An error occurred while sending data to server: ', errorSendData);
                                                                dispatch(setSyncState('Error'));
                                                                // statuses.sendData.status = JSON.stringify(errorSendData);
                                                                arrayOfStatuses.push({text: 'Sending data to the HUB', status: JSON.stringify(errorSendData)});
                                                                dispatch(parseStatusesAndShowMessage());
                                                                // dispatch(addError({type: 'Sync Error', message: JSON.stringify(errorSendData)}));
                                                            }
                                                            if (resultSendData) {
                                                                console.log("Data was successfully sent to server: ", resultSendData, new Date().getTime() - operationStart);
                                                                // statuses.sendData.status = 'OK';
                                                                arrayOfStatuses.push({text: 'Sending data to the HUB', status: errorSendData ? JSON.stringify(errorSendData) : 'OK'});
                                                                dispatch(setSyncState('Getting updated data from the server'));
                                                                getDatabaseSnapshotRequest({url: internetCredentials.server ? internetCredentials.server : internetCredentials.service, clientId: internetCredentials.username, clientSecret: internetCredentials.password}, lastSyncDate, (error, response) => {
                                                                    if (error) {
                                                                        arrayOfStatuses.push({text: 'Getting updated data from the server', status: JSON.stringify(error)});
                                                                        dispatch(setSyncState('Error'));
                                                                        dispatch(parseStatusesAndShowMessage());
                                                                    }
                                                                    if (response) {
                                                                        // statuses.gettingData.status = 'OK';
                                                                        // arrayOfStatuses.push({text: 'Getting updated data from the server', status: 'OK'});
                                                                        dispatch(processFilesForSync(error, response, {
                                                                            url: Platform.OS === 'ios' ? internetCredentials.server : internetCredentials.service,
                                                                            clientId: internetCredentials.username,
                                                                            clientSecret: internetCredentials.password
                                                                        }, null, false));
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    }
                                                })
                                            })
                                            .catch((errorCreateAllFiles) => {
                                                console.log('Error while creating all the files: ', errorCreateAllFiles);
                                                // statuses.createLocalFiles.status = JSON.stringify(errorCreateAllFiles);
                                                arrayOfStatuses.push({text: 'Creating local files', status: JSON.stringify(errorCreateAllFiles)});
                                                dispatch(setSyncState('Error'));
                                                dispatch(parseStatusesAndShowMessage());
                                            })
                                    } else {
                                        arrayOfStatuses.push({text: 'Getting local data', status: 'Local data has not been updated'});
                                        dispatch(setSyncState('Getting updated data from the server'));
                                        getDatabaseSnapshotRequest({url: internetCredentials.server ? internetCredentials.server : internetCredentials.service, clientId: internetCredentials.username, clientSecret: internetCredentials.password}, lastSyncDate, (error, response) => {
                                            if (error) {
                                                arrayOfStatuses.push({text: 'Getting updated data from the server', status: JSON.stringify(error)});
                                                dispatch(setSyncState('Error'));
                                                dispatch(parseStatusesAndShowMessage());
                                            }
                                            if (response) {
                                                // statuses.gettingData.status = 'OK';
                                                arrayOfStatuses.push({text: 'Getting updated data from the server', status: 'OK'});
                                                dispatch(processFilesForSync(error, response, {
                                                    url: Platform.OS === 'ios' ? internetCredentials.server : internetCredentials.service,
                                                    clientId: internetCredentials.username,
                                                    clientSecret: internetCredentials.password
                                                }, null, true));
                                            }
                                        })
                                    }
                                })
                                .catch((errorGetRecordsByDate) => {
                                    console.log('errorGetRecordsByDate: ', errorGetRecordsByDate);
                                    // statuses.gettingLocalFiles.status = JSON.stringify(errorGetRecordsByDate);
                                    arrayOfStatuses.push({text: 'Getting local data', status: JSON.stringify(errorGetRecordsByDate)});
                                    dispatch(setSyncState('Error'));
                                    dispatch(parseStatusesAndShowMessage());
                                })
                        } else {
                            console.log('No internet credentials found');
                            arrayOfStatuses.push({text: 'Getting local data', status: 'No credentials found'});
                            dispatch(setSyncState('Error'));
                            dispatch(parseStatusesAndShowMessage());
                        }
                    } else {
                        console.log('Last sync date is null');
                        arrayOfStatuses.push({text: 'Getting local data', status: 'Last sync date was not found'});
                        dispatch(setSyncState('Error'));
                        dispatch(parseStatusesAndShowMessage());
                    }
                } catch (errorGetLastSyncDate) {
                    console.log('Error while getting lastSyncDate: ', errorGetLastSyncDate);
                    arrayOfStatuses.push({text: 'Getting local data', status: JSON.stringify(errorGetLastSyncDate)});
                    dispatch(setSyncState('Error'));
                    dispatch(parseStatusesAndShowMessage());
                }
            } else {
                console.log('activeDatabase is null');
                arrayOfStatuses.push({text: 'Getting local data', status: 'There was no active database found'});
                dispatch(setSyncState('Error'));
                dispatch(parseStatusesAndShowMessage());
            }
        } catch (errorGetActiveDatabase) {
            console.log('Error while getting active database: ', errorGetActiveDatabase);
            arrayOfStatuses.push({text: 'Getting local data', status: JSON.stringify(errorGetActiveDatabase)});
            dispatch(setSyncState('Error'));
            dispatch(parseStatusesAndShowMessage());
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

// export function getServerCredentials (serverName, callback) {
//     return async function () {
//         try {
//             let credentials = await getInternetCredentials(serverName);
//             if (credentials) {
//                 console.log("Credentials ", credentials);
//                 callback(null, credentials)
//             } else {
//                 callback('Error get credentials');
//             }
//         } catch (error) {
//             callback(error);
//         }
//     }
// }

export function appInitialized() {
    return async function (dispatch, getState) {
        // Get Screen Dimensions and store them to the redux store in order to use them throughout the app
        let width = Dimensions.get("window").width;
        let height = Dimensions.get('window').height;

        let screenSize = {width, height};

        dispatch(saveScreenSize(screenSize));


        // Here check if the user is already logged in and which database is he using
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
                                } catch(errorCreateDatabase) {
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
                                } catch(errorCreateDatabase) {
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
                            } catch(errorCreateDatabase) {
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