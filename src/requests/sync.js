/**
 * Created by florinpopa on 29/08/2018.
 */
import RNFetchBlob from 'rn-fetch-blob';
import base64 from 'base-64';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {getSyncEncryptPassword} from './../utils/encryption';
import {setSyncState} from './../actions/app';
import DeviceInfo from 'react-native-device-info';
import translations from './../utils/translations';
import {testApi} from './testApi';
import uniq from 'lodash/uniq';
import get from 'lodash/get';
import {getHelpItemsRequest} from './helpItem';
import {handleResponseFromRNFetchBlob, createDate} from './../utils/functions';
import moment from 'moment';
import {retriablePromise} from "../utils/typeCheckingFunctions";

export function getDatabaseSnapshotRequest(hubConfig, lastSyncDate, dispatch, callback) {

    // hubConfiguration = {url: databaseName, clientId: JSON.stringify({name, url, clientId, clientSecret, encryptedData}), clientSecret: databasePass}
    let hubConfiguration = JSON.parse(hubConfig.clientId);

    let arrayOfTokens = getAllLanguageTokens();
    // console.log("Array of Tokens: ", JSON.stringify(arrayOfTokens));

    let filter = {};

    if (lastSyncDate) {
        filter.where = {
            fromDate: createDate(lastSyncDate)
        }
    }

    // Get installationId first from the local storage
    AsyncStorage.getItem('installationId')
        .then((installationId) => {
            let deviceInfo = JSON.stringify({
                id: installationId,
                os: Platform.OS,
                manufacturer: DeviceInfo.getManufacturer().replace(/\u0022|\u0027|\u0060|\u00b4|\u2018|\u2019|\u201c|\u201d/g, `\'`),
                model: DeviceInfo.getModel().replace(/\u0022|\u0027|\u0060|\u00b4|\u2018|\u2019|\u201c|\u201d/g, `\'`),
                name: DeviceInfo.getDeviceName().replace(/\u0022|\u0027|\u0060|\u00b4|\u2018|\u2019|\u201c|\u201d/g, `\'`)
            });
            let requestUrl = `${hubConfiguration.url}/sync/get-mobile-database-snapshot?autoEncrypt=${hubConfiguration.encryptedData}${lastSyncDate ? `&filter=${JSON.stringify(filter)}` : ''}&chunkSize=5000${hubConfiguration.userEmail ? `&userEmail=${hubConfiguration.userEmail}` : ''}`;

            // console.log('Request URL: ', requestUrl);


            let dirs = RNFetchBlob.fs.dirs.DocumentDir;
            let databaseLocation = `${dirs}/database.zip`;

            console.log('Get database');

            console.log('Get database');
            let startDownload = new Date().getTime();

            // Before starting a download, first test if the API responds
            dispatch(setSyncState({id: 'testApi', status: 'In progress'}));
            testApi(`${hubConfiguration.url}/system-settings/version`, deviceInfo, (errorTestApi, responseTestApi) => {
                if (errorTestApi) {
                    console.log("*** testApi error: ", JSON.stringify(errorTestApi));
                    dispatch(setSyncState({id: 'testApi', status: `Error`, error: JSON.stringify(errorTestApi)}));
                    callback('The hub is not available');
                }
                if (responseTestApi) {
                    // console.log('Response TestApi: ', responseTestApi);
                    dispatch(setSyncState({id: 'testApi', status: 'Success'}));
                    dispatch(setSyncState({id: 'downloadDatabase', status: 'In progress'}));

                    // Here call the method computeHelpItemsAndCategories

                    computeHelpItemsAndCategories(hubConfiguration, lastSyncDate)
                        .then((helpTranslations) => {

                            retriablePromise(RNFetchBlob.config({
                                timeout: (30 * 60 * 10 * 1000),
                                followRedirect: false,
                                fileCache: true,
                                path: `${dirs}/database.zip`
                            })
                                .fetch('POST', encodeURI(requestUrl), {
                                        'device-info': deviceInfo,
                                        'Content-Type': 'application/json',
                                        'Accept': 'application/json',
                                        'Authorization': 'Basic ' + base64.encode(`${hubConfiguration.clientId}:${hubConfiguration.clientSecret}`)
                                    },
                                    JSON.stringify({
                                        languageTokens: lastSyncDate ? helpTranslations : arrayOfTokens.concat(helpTranslations)
                                    })
                                )
                                .progress({count: 500}, (received, total) => {
                                    dispatch(setSyncState({
                                        id: 'downloadDatabase',
                                        name: `Downloading database\nReceived ${received} bytes`
                                    }));
                                    console.log(received, total)
                                })
                                .then((res) => {return handleResponseFromRNFetchBlob(res)}), 3)
                                    .then((res) => {
                                        // console.log('Download time: ', new Date().getTime() - startDownload);
                                        // let status = res.info().status;

                                        // if (status === 200) {
                                        //     // After returning the database, return the path to it
                                        //     console.log("Got database");
                                        callback(null, databaseLocation)
                                        // } else {
                                        //     if (status === 422) {
                                        //         callback(`No data to export`);
                                        //     } else {
                                        //         res.json()
                                        //             .then((parsedError) => {
                                        //                 console.log('Jsons: ', parsedError);
                                        //                 // After getting zip file from the server, unzip it and then proceed to the importing of the data to the SQLite database
                                        //                 callback(get(parsedError, 'error.message', 'Unknown error'));
                                        //             })
                                        //             .catch((errorParseError) => {
                                        //                 callback(`Cannot connect to HUB, please check URL, Client ID and Client secret.\nStatus code: ${status}`);
                                        //             })
                                        //     }
                                        // }
                                    })
                                    .catch((errorMessage, statusCode) => {
                                        // error handling
                                        console.log("*** getDatabaseSnapshotRequest error: ", JSON.stringify(errorMessage));
                                        callback(errorMessage.message);
                                    });
                        })
                }
            })
        })
        .catch((errorGetInstallationId) => {
            console.log('error while trying to get installationId: ', errorGetInstallationId);
        });
}

export function postDatabaseSnapshotRequest(internetCredentials, path, callback) {
    // internetCredentials = {server: databaseName, username: JSON.stringify({name, url, clientId, clientSecret, encryptedData}), password: databasePass}
    let hubConfig = JSON.parse(internetCredentials.username);
    let requestUrl = `${hubConfig.url}/sync/import-database-snapshot`;

    console.log('Request URL:' + requestUrl);
    // Get installationId from the local storage first
    AsyncStorage.getItem('installationId')
        .then((installationId) => {

            let deviceInfo = JSON.stringify({
                id: installationId,
                os: Platform.OS,
                manufacturer: DeviceInfo.getManufacturer().replace(/\u0022|\u0027|\u0060|\u00b4|\u2018|\u2019|\u201c|\u201d/g, `\'`),
                model: DeviceInfo.getModel().replace(/\u0022|\u0027|\u0060|\u00b4|\u2018|\u2019|\u201c|\u201d/g, `\'`),
                name: DeviceInfo.getDeviceName().replace(/\u0022|\u0027|\u0060|\u00b4|\u2018|\u2019|\u201c|\u201d/g, `\'`)
            });
            console.log('Send database to server');
            // Before starting a download, first test if the API responds
            testApi(`${hubConfig.url}/system-settings/version`, deviceInfo, (errorTestApi, responseTestApi) => {
                if (errorTestApi) {
                    console.log("*** testApi error: ", JSON.stringify(errorTestApi));
                    callback('The hub is not available');
                }
                if (responseTestApi) {
                    console.log('Response testApi: ', responseTestApi);
                    RNFetchBlob.config({timeout: (30 * 60 * 10 * 1000)})
                        .fetch('POST', requestUrl, {
                            'device-info': deviceInfo,
                            'Content-Type': 'multipart/form-data',
                            'Accept': 'application/json',
                            'Authorization': 'Basic ' + base64.encode(`${hubConfig.clientId}:${hubConfig.clientSecret}`)
                        }, [
                            {name: 'snapshot', filename: 'snapshot', data: RNFetchBlob.wrap(path)},
                            {name: 'autoEncrypt', data: `${hubConfig.encryptedData}`},
                            {name: 'generatePersonVisualId', data: `${true}`}
                        ], '0', '6000000')
                        .then((res) => {
                            console.log('Finished sending the data to the server: ', res);
                            let status = res.info().status;
                            if(status === 200) {
                                //     console.log("Got database");
                                callback(null, 'Finished sending data to the server')
                            } else {
                                callback(res, 'Finished sending data to the server');
                            }
                        })
                        .catch((errorMessage, statusCode) => {
                            // error handling
                            console.log("*** postDatabaseSnapshotRequest error: ", JSON.stringify(errorMessage));
                            callback(errorMessage);
                        });
                }
            })

        })
        .catch((errorGetInstallationId) => {
            console.log('Error while trying to get installationId from AsyncStorage: ', errorGetInstallationId);
        })
}

function getAllLanguageTokens () {
    let arrayOfTokens = [];
    let translationKeys = Object.keys(translations);
    for (let i=0; i<translationKeys.length; i++) {
        let objectKeys = Object.keys(translations[translationKeys[i]]);
        for (let j=0; j<objectKeys.length; j++) {
            if (translations[translationKeys[i]][objectKeys[j]].includes('LNG_')) {
                arrayOfTokens.push(translations[translationKeys[i]][objectKeys[j]]);
            }
        }
    }

    return uniq(arrayOfTokens);
}

// This code will be changed to better suit our needs, but it will be a good start
// The method is supposed to return all the needed translations to be requested in the sync
async function computeHelpItemsAndCategories(hubConfiguration, lastSyncDate) {
    return new Promise((resolve, reject) => {
        let translations = [];
        let generalRequestUrl = hubConfiguration.url;
        let authorization = `Basic ${base64.encode(`${hubConfiguration.clientId}:${hubConfiguration.clientSecret}`)}`;
        let filterItems = {
            updatedAt: {
                gt: lastSyncDate
            }
        };
        getHelpItemsRequest(`${generalRequestUrl}/help-items`, authorization, filterItems, (errorGetItems, resultItems) => {
            if (errorGetItems) {
                console.log('Error while getting items: ', errorGetItems);
                resolve(translations);
            }
            if (resultItems) {
                // For all the result items we need only the fields that have translations on API, mainly title and content
                for (let i = 0; i < resultItems.length; i++) {
                    translations.push(get(resultItems, `[${i}].title`, 'fail'));
                    translations.push(get(resultItems, `[${i}].content`, 'fail'));
                    translations.push(get(resultItems, `[${i}].comment`, 'fail'));
                    translations.push(get(resultItems, `[${i}].category.name`, 'fail'));
                    translations.push(get(resultItems, `[${i}].category.description`, 'fail'));
                }
                translations = translations.filter((e) => {
                    return e !== 'fail' && e.includes('LNG_')
                });
                translations = uniq(translations);
                resolve(translations);
            }
        })
    })
}