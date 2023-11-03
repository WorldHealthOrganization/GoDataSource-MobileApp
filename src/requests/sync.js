/**
 * Created by florinpopa on 29/08/2018.
 */
import RNFetchBlob from 'rn-fetch-blob';
import base64 from 'base-64';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {setSyncState, setTimezone} from './../actions/app';
import DeviceInfo from 'react-native-device-info';
import translations from './../utils/translations';
import {testApi, testApiPromise} from './testApi';
import uniq from 'lodash/uniq';
import get from 'lodash/get';
import lodashIntersection from 'lodash/intersection';
import {getHelpItemsRequest} from './helpItem';
import {createDate, handleResponseFromRNFetchBlob} from './../utils/functions';
import {checkArrayAndLength, retriablePromise} from "../utils/typeCheckingFunctions";
import constants from './constants';
import moment from "moment-timezone";

export function getDatabaseSnapshotRequestNew(hubConfig, lastSyncDate, dispatch, languagePacks, noDateFilter) {
    // hubConfiguration = {url: databaseName, clientId: JSON.stringify({name, url, clientId, clientSecret, encryptedData}), clientSecret: databasePass}
    let hubConfiguration = JSON.parse(hubConfig.clientId);

    let arrayOfTokens = getAllLanguageTokens();
    console.log("TEMPO Array of Tokens: ", JSON.stringify(arrayOfTokens));

    let filter = {};

    if (lastSyncDate && !noDateFilter) {
        filter.where = {
            fromDate: moment(lastSyncDate).toISOString()
        }
    }
    if (languagePacks) {
        if (!filter.where) {
            filter.where = {};
        }
        filter.where.collections = 'languageToken';
    }
    let requestUrl = `${hubConfiguration.url}${constants.getDatabase}?autoEncrypt=${hubConfiguration.encryptedData}${lastSyncDate || languagePacks ? `&filter=${JSON.stringify(filter)}` : ''}&chunkSize=${hubConfiguration.chunkSize || 5000}${hubConfiguration.userEmail ? `&userEmail=${hubConfiguration.userEmail}` : ''}`;

    let dirs = RNFetchBlob.fs.dirs.DocumentDir;

    let databaseLocation = `${dirs}/database.zip`;
    let deviceInfo = null;

    // Get installationId first from the local storage
    return AsyncStorage.getItem('installationId')
        .then((installationId) => {
            deviceInfo = JSON.stringify({
                id: installationId,
                os: Platform.OS,
                manufacturer: DeviceInfo.getManufacturerSync().replace(/\u0022|\u0027|\u0060|\u00b4|\u2018|\u2019|\u201c|\u201d/g, `\'`),
                model: DeviceInfo.getModel().replace(/\u0022|\u0027|\u0060|\u00b4|\u2018|\u2019|\u201c|\u201d/g, `\'`),
                name: DeviceInfo.getDeviceNameSync().replace(/\u0022|\u0027|\u0060|\u00b4|\u2018|\u2019|\u201c|\u201d/g, `\'`)
            });

            // Before starting a download, first test if the API responds
            dispatch(setSyncState({id: 'testApi', status: 'In progress', addLanguagePacks: checkArrayAndLength(languagePacks)}));
            return testApiPromise(`${hubConfiguration.url}${constants.testApi}`, deviceInfo)
                .catch((errorTestAPI) => {
                    dispatch(setSyncState({
                        id: 'testApi',
                        name: `Test API`,
                        status: 'Error',
                        error: JSON.stringify(get(errorTestAPI, 'message', errorTestAPI))
                    }));
                    return Promise.reject({errorTestAPI, isAPIError: true});
                })
        })
        .then((responseTestApi) => {
            AsyncStorage.setItem(`timezone-${hubConfiguration.url}`, responseTestApi.timezone);
            dispatch(setTimezone(responseTestApi.timezone));
            dispatch(setSyncState({id: 'testApi', status: 'Success', addLanguagePacks: checkArrayAndLength(languagePacks)}));
            dispatch(setSyncState({id: 'downloadDatabase', status: 'In progress', addLanguagePacks: checkArrayAndLength(languagePacks)}));
            // Here call the method computeHelpItemsAndCategories
            return computeHelpItemsAndCategories(hubConfiguration, lastSyncDate)
        })
        .then((helpTranslations) => {
            let syncParams = {
                languageTokens: lastSyncDate ? helpTranslations : arrayOfTokens.concat(helpTranslations),
                //languages: []//hubConfiguration.language ? hubConfiguration.language : []
            };

            if (languagePacks) {
                syncParams.languages = languagePacks;
            } else if (checkArrayAndLength(hubConfiguration.language)) {
                if (!checkArrayAndLength(lodashIntersection(hubConfiguration.language, ['None']))) {
                    syncParams.languages = hubConfiguration.language;
                }
            }
            syncParams = JSON.stringify(syncParams);
            console.log("Just the sync params", syncParams);

            console.log(`####ZIP location ${dirs}/database.zip`);

            console.log("SYNC 1 request data",  encodeURI(requestUrl), deviceInfo, 'Basic ' + base64.encode(`${hubConfiguration.clientId}:${hubConfiguration.clientSecret}`), syncParams);

            return retriablePromise(RNFetchBlob.config({
                    timeout: (30 * 60 * 10 * 1000),
                    followRedirect: false,
                    fileCache: true,
                    path: `${dirs}/database.zip`
                }, 3, 100)
                    .fetch('POST', encodeURI(requestUrl), {
                            'device-info': deviceInfo,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Authorization': 'Basic ' + base64.encode(`${hubConfiguration.clientId}:${hubConfiguration.clientSecret}`)
                        },
                        syncParams
                    )
                    .progress({count:500},(received, total) => {
                        dispatch(setSyncState({
                            id: 'downloadDatabase',
                            name: `Downloading database`,
                            addLanguagePacks: checkArrayAndLength(languagePacks)
                        }));
                        console.log("Received", received, total)
                    })
                    .then((res) => {
                        return handleResponseFromRNFetchBlob(res)
                    }), 3)
                    .then((response) => Promise.resolve(databaseLocation))
            }
        )
}

export function postDatabaseSnapshotRequest(internetCredentials, path) {
    let hubConfig = JSON.parse(internetCredentials.username);
    let requestUrl = `${hubConfig.url}/sync/import-database-snapshot`;
    let deviceInfo = null;

    return Promise.resolve()
        .then(() => AsyncStorage.getItem('installationId'))
        .then((installationId) => {
            deviceInfo = JSON.stringify({
                id: installationId,
                os: Platform.OS,
                manufacturer: DeviceInfo.getManufacturerSync().replace(/\u0022|\u0027|\u0060|\u00b4|\u2018|\u2019|\u201c|\u201d/g, `\'`),
                model: DeviceInfo.getModel().replace(/\u0022|\u0027|\u0060|\u00b4|\u2018|\u2019|\u201c|\u201d/g, `\'`),
                name: DeviceInfo.getDeviceNameSync().replace(/\u0022|\u0027|\u0060|\u00b4|\u2018|\u2019|\u201c|\u201d/g, `\'`)
            });
            return testApiPromise(`${hubConfig.url}${constants.testApi}`, deviceInfo)
        })
        .then((responseTestApi) => RNFetchBlob.config({timeout: (30 * 60 * 10 * 1000)})
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
                let status = res.info().status;
                if(status === 200) {
                    //     console.log("Got database");
                    return Promise.resolve('Finished sending data to the server');
                } else {
                    let data = res.data;
                    if(typeof data === 'string'){
                        data = JSON.parse(data);
                    }
                    return Promise.resolve(data?.error?.message || res);
                }
            })
        )
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
        let filterItems;
        if (lastSyncDate){
            filterItems = {
                updatedAt: {
                    gt: lastSyncDate
                }
            };
        }
        getHelpItemsRequest(`${generalRequestUrl}${constants.helpItems}`, authorization, filterItems, (errorGetItems, resultItems) => {
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
