/**
 * Created by florinpopa on 29/08/2018.
 */
import url from './../utils/url';
import RNFetchBlob from 'rn-fetch-blob';
import base64 from 'base-64';
import {Platform} from 'react-native';
import {getSyncEncryptPassword} from './../utils/encryption';
import {setSyncState} from './../actions/app';
import translations from './../utils/translations';
import {testApi} from './testApi';

export function getDatabaseSnapshotRequest(hubConfig, lastSyncDate, dispatch, callback) {

    // hubConfiguration = {url: databaseName, clientId: JSON.stringify({name, url, clientId, clientSecret, encryptedData}), clientSecret: databasePass}
    let hubConfiguration = JSON.parse(hubConfig.clientId);

    let arrayOfTokens = getAllLanguageTokens();
    console.log("Array of Tokens: ", JSON.stringify(arrayOfTokens));

    let filter = {};

    if (lastSyncDate) {
        filter.where = {
            fromDate: new Date(lastSyncDate)
        }
    }

    // let requestUrl = hubConfiguration.url + '/sync/database-snapshot' + (lastSyncDate ? ('?filter=' + JSON.stringify(filter)) : '');

    let requestUrl = `${hubConfiguration.url}/sync/get-mobile-database-snapshot?autoEncrypt=${hubConfiguration.encryptedData}${lastSyncDate ? `&filter=${JSON.stringify(filter)}` : ''}&chunkSize=5000`;

    console.log('Request URL: ', requestUrl);

    let dirs = RNFetchBlob.fs.dirs.DocumentDir;
    let databaseLocation = `${dirs}/database.zip`;

    console.log('Get database');
    let startDownload = new Date().getTime();

    // Before starting a download, first test if the API responds
    testApi(`${hubConfiguration.url}/system-settings/version`, (errorTestApi, responseTestApi) => {
        if (errorTestApi) {
            console.log("*** testApi error: ", JSON.stringify(errorTestApi));
            callback(errorTestApi);
        }
        if (responseTestApi) {
            console.log('Response TestApi: ', responseTestApi);
            RNFetchBlob.config({
                timeout: (30 * 60 * 10 * 1000),
                followRedirect: false,
                fileCache: true,
                path: `${dirs}/database.zip`
            })
                .fetch('POST', encodeURI(requestUrl), {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': 'Basic ' + base64.encode(`${hubConfiguration.clientId}:${hubConfiguration.clientSecret}`)
                    },
                    JSON.stringify({
                        languageTokens: arrayOfTokens
                    })
                )
                .progress({count: 500}, (received, total) => {
                    dispatch(setSyncState(`Downloading database\nReceived ${received} bytes`));
                    console.log(received, total)
                })
                .then((res) => {
                    console.log('Download time: ', new Date().getTime() - startDownload);
                    let status = res.info().status;
                    // After getting zip file from the server, unzip it and then proceed to the importing of the data to the SQLite database
                    if(status === 200) {
                        // After returning the database, return the path to it
                        console.log("Got database");
                        callback(null, databaseLocation)
                    } else {
                        callback(`Cannot connect to HUB, please check URL, Client ID and Client secret.\nStatus code: ${status}`);
                    }
                })
                .catch((errorMessage, statusCode) => {
                    // error handling
                    console.log("*** getDatabaseSnapshotRequest error: ", JSON.stringify(errorMessage));
                    callback(errorMessage.message);
                });
        }
    })
}

export function postDatabaseSnapshotRequest(internetCredentials, path, callback) {
    // internetCredentials = {server: databaseName, username: JSON.stringify({name, url, clientId, clientSecret, encryptedData}), password: databasePass}
    let hubConfig = JSON.parse(internetCredentials.username);
    let requestUrl = `${hubConfig.url}/sync/import-database-snapshot`;

    // console.log('Request URL:' + requestUrl);

    console.log('Send database to server');

    // Before starting a download, first test if the API responds
    testApi(`${hubConfiguration.url}/system-settings/version`, (errorTestApi, responseTestApi) => {
        if (errorTestApi) {
            console.log("*** testApi error: ", JSON.stringify(errorTestApi));
            callback(errorTestApi);
        }
        if (responseTestApi) {
            console.log('Response testApi: ', responseTestApi);
            RNFetchBlob.config({timeout: (30 * 60 * 10 * 1000)})
                .fetch('POST', requestUrl, {
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json',
                    'Authorization': 'Basic ' + base64.encode(`${hubConfig.clientId}:${hubConfig.clientSecret}`)
                }, [
                    {name: 'snapshot', filename: 'snapshot', data: RNFetchBlob.wrap(path)},
                    {name: 'autoEncrypt', data: `${hubConfig.encryptedData}`}
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

    return arrayOfTokens;
}