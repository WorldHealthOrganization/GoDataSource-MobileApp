/**
 * Created by florinpopa on 14/06/2018.
 */
import errorTypes from './errorTypes';
import config, {sideMenuKeys} from './config';
import appConfig from './../../app.config';
import geolocation from '@react-native-community/geolocation';
import RNFetchBlobFS from 'rn-fetch-blob/fs';
import {unzip, zip} from 'react-native-zip-archive';
import {processBulkDocs, updateFileInDatabase} from './../queries/database';
import {setSyncState} from './../actions/app';
import {Alert, Linking, NativeModules} from 'react-native';
import uuid from 'react-native-uuid';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';
import cloneDeep from 'lodash/cloneDeep';
import groupBy from 'lodash/groupBy';
import set from 'lodash/set';
import defaultTranslations from './defaultTranslations'
import {decrypt, encrypt, getSyncEncryptPassword} from './../utils/encryption';
import {extractLocations} from './../actions/locations';
import moment from 'moment-timezone';
import {checkArrayAndLength} from './typeCheckingFunctions';
import {executeQuery, insertOrUpdate} from './../queries/sqlTools/helperMethods';
import translations from "./translations";
import sqlConstants from './../queries/sqlTools/constants';
import constants from "./constants";
import lodashMemoize from "lodash/memoize";
import lodashIsEqual from "lodash/isEqual";
import lodashIntersection from "lodash/intersection";
import { store } from "./../App";
import {exists} from "react-native-fs";

export const checkPermissions = lodashMemoize((permissionsList, outbreakPermissions, outbreak, permissions) => {
    if (!checkArrayAndLength(permissionsList) && !checkArrayAndLength(outbreakPermissions)) {
        return true;
    }
    if (checkArrayAndLength(outbreakPermissions)) {
        for (const permissionKey of outbreakPermissions) {
            if (!outbreak[permissionKey]) {
                return false;
            }
        }
    }
    if (permissionsList.every((e) => checkArrayAndLength(e))) {
        for (let elem of permissionsList) {
            if (checkArrayAndLength(elem) && lodashIsEqual(lodashIntersection(elem, permissions), elem)) {
                return true;
            }
        }
        return false;
    } else {
        return checkArrayAndLength(lodashIntersection(permissionsList, permissions));
    }
});

// This method is used for handling server responses. Please add here any custom error handling
export function handleResponse(response) {
    if (!response || !response.status) {
        throw new Error('No response');
    }
    if (response.status === 200) {
        return response.json();
    }

    if (response.status === 204) {
        return {};
    }

    return response.json().then(response => {
        if (response.error) {

            // TODO ERROR HANDLING
            if (response.error.message && (typeof response.error.message === 'string')) {
                throw new Error(response.error.message);
            } else {
                throw new Error(JSON.stringify(response.error));
            }

        }
        throw new Error(errorTypes.UNKNOWN_ERROR.message);
    });
}

// RN-fetch-blob does not manage status codes, so, this
export function handleResponseFromRNFetchBlob(response) {
    return new Promise((resolve, reject) => {
        let status = response.info().status;

        if (status === 200) {
            resolve(response);
        } else {
            // Manage errors
            response.json()
                .then((parsedError) => {
                    reject({message: get(parsedError, 'error.message', JSON.stringify(parsedError))});
                })
                .catch((errorParseError) => {
                    if (status) {
                        reject({message: `The mobile received the status ${status} from the API but the error could not be parsed`});
                    }
                    reject({message: typeof errorParseError === 'string' ? errorParseError : JSON.stringify(errorParseError)});
                })
        }
    })
}

// This method is used for calculating dimensions for components.
// Because the design is made only for one screen, this means that for other screen resolutions, the views will not be scaled
// To use the method
// First argument is the size of the component from the design
// Second argument is the size of the screen {width, height} from the design. You can find it in the config file
// Third argument is the screen size {width, height}
export function calculateDimension(designResourceDimension, isHeight, screenSize) {
    // Check phones with different aspect ratio
    let designScreenDimension = config.designScreenSize;
    let scaledHeight = designScreenDimension.height;
    if (designScreenDimension.height / designScreenDimension.width !== screenSize.height / screenSize.width) {
        scaledHeight = designScreenDimension.width * designScreenDimension.height / screenSize.width;
    }

    if (isHeight) {
        if (designScreenDimension.height / designScreenDimension.width > screenSize.height / screenSize.width) {
            return (designResourceDimension * screenSize.height) / designScreenDimension.height;
        } else {
            return (designResourceDimension * scaledHeight) / designScreenDimension.height;
        }
    }

    return (designResourceDimension * screenSize.width) / designScreenDimension.width;
}

export function checkIfSameDay(date1, date2) {
    if (Object.prototype.toString.call(date1) !== '[object Date]' || Object.prototype.toString.call(date2) !== '[object Date]') {
        return false;
    }
    const timezone = store?.getState().app.timezone;
    return moment.tz(date1, timezone).isSame(moment.tz(date2, timezone), 'day')
}

export function getAddress(address, returnString, locationsList) {
    let addressArray = [];
    let locationName = null;
    if (locationsList && Array.isArray(locationsList) && locationsList.length > 0) {
        locationName = locationsList.find((e) => {
            return address.locationId === extractIdFromPouchId(e._id, 'location')
        });
        if (locationName && locationName.name) {
            locationName = locationName.name;
        }
    }

    if (address) {
        addressArray = [address.addressLine1, address.addressLine2, address.city, address.country, address.postalCode, locationName];
        addressArray = addressArray.filter((e) => {
            return e
        });
    }

    return returnString ? addressArray.join(', ') : addressArray;
}

export function mapSideMenuKeysToScreenName(sideMenuKey) {
    let screenToSwitchTo = null;
    let addScreen = false;
    switch (sideMenuKey) {
        case sideMenuKeys[0]:
            screenToSwitchTo = constants.appScreens.followUpScreen;
            break;
        case sideMenuKeys[1]:
            screenToSwitchTo = constants.appScreens.contactsScreen;
            break;
        case `${sideMenuKeys[1]}-add`:
            screenToSwitchTo = constants.appScreens.contactsScreen;
            addScreen = true;
            break;
        case sideMenuKeys[2]:
            screenToSwitchTo = constants.appScreens.contactsOfContactsScreen;
            break;
        case `${sideMenuKeys[2]}-add`:
            screenToSwitchTo = constants.appScreens.contactsOfContactsSingleScreen;
            addScreen = true;
            break;
        case sideMenuKeys[3]:
            screenToSwitchTo = constants.appScreens.casesScreen;
            break;
        case `${sideMenuKeys[3]}-add`:
            screenToSwitchTo = constants.appScreens.caseSingleScreen;
            addScreen = true;
            break;
        case sideMenuKeys[4]:
            screenToSwitchTo = constants.appScreens.labResultsScreen;
            break;
        case `${sideMenuKeys[4]}-add`:
            screenToSwitchTo = constants.appScreens.labResultsSingleScreen;
            addScreen = true;
            break;
        case sideMenuKeys[5]:
            screenToSwitchTo = constants.appScreens.eventsScreen;
            break;
        case `${sideMenuKeys[5]}-add`:
            screenToSwitchTo = constants.appScreens.eventSingleScreen;
            addScreen = true;
            break;
        case sideMenuKeys[6]:
            screenToSwitchTo = constants.appScreens.usersScreen;
            break;
        case sideMenuKeys[7]:
            screenToSwitchTo = constants.appScreens.helpScreen;
            break;
        default:
            screenToSwitchTo = constants.appScreens.followUpScreen;
            break;
    }
    return {
        screenToSwitchTo,
        addScreen
    }
}

export function createStackFromComponent(component) {
    return ({
        stack: {
            children: [
                {
                    component: component
                }
            ],
            options: {
                layout: {
                    orientation: ['portrait']
                },
                topBar: {
                    visible: false,
                },
                modalPresentationStyle: "fullScreen"
            }
        }

    })
}

export function navigation(event, navigator) {
    // console.log('Event: ', event);
    if (event.type === 'DeepLink') {
        // console.log("###");
        if (event.link.includes('Navigate')) {
            let linkComponents = event.link.split('/');
            if (linkComponents.length > 0) {
                let screenToSwitchTo = null;
                let addScreen = null;
                switch (linkComponents[1]) {
                    case sideMenuKeys[0]:
                        screenToSwitchTo = constants.appScreens.followUpScreen;
                        break;
                    case sideMenuKeys[1]:
                        screenToSwitchTo = constants.appScreens.contactsScreen;
                        break;
                    case `${sideMenuKeys[1]}-add`:
                        screenToSwitchTo = constants.appScreens.contactsScreen;
                        addScreen = constants.appScreens.contactSingleScreen;
                        break;
                    case sideMenuKeys[2]:
                        screenToSwitchTo = constants.appScreens.contactsOfContactsScreen;
                        break;
                    case `${sideMenuKeys[2]}-add`:
                        screenToSwitchTo = constants.appScreens.contactsOfContactsSingleScreen;
                        addScreen = constants.appScreens.contactsOfContactsSingleScreen;
                        break;
                    case sideMenuKeys[3]:
                        screenToSwitchTo = constants.appScreens.casesScreen;
                        break;
                    case `${sideMenuKeys[3]}-add`:
                        screenToSwitchTo = constants.appScreens.caseSingleScreen;
                        addScreen = constants.appScreens.caseSingleScreen;
                        break;
                    case sideMenuKeys[4]:
                        screenToSwitchTo = constants.appScreens.labResultsScreen;
                        break;
                    case `${sideMenuKeys[4]}-add`:
                        screenToSwitchTo = constants.appScreens.labResultsSingleScreen;
                        addScreen = constants.appScreens.labResultsSingleScreen;
                        break;
                    case sideMenuKeys[5]:
                        screenToSwitchTo = constants.appScreens.eventsScreen;
                        break;
                    case `${sideMenuKeys[5]}-add`:
                        screenToSwitchTo = constants.appScreens.eventSingleScreen;
                        addScreen = constants.appScreens.eventSingleScreen;
                        break;
                    case sideMenuKeys[6]:
                        screenToSwitchTo = constants.appScreens.usersScreen;
                        break;
                    case sideMenuKeys[7]:
                        screenToSwitchTo = constants.appScreens.helpScreen;
                        break;
                    default:
                        screenToSwitchTo = constants.appScreens.followUpScreen;
                        break;
                }

                if (addScreen) {
                    navigator.push({
                        screen: screenToSwitchTo,
                        passProps: {
                            isNew: true,
                            isAddFromNavigation: true,
                            refresh: () => {
                                console.log('Default refresh')
                            }
                        }
                    });
                } else {
                    navigator.resetTo({
                        screen: screenToSwitchTo,
                    });
                }
            }
        }
    }
}

export function handleExposedTo(exposures, returnString) {
    if (!checkArrayAndLength(exposures)) {
        return ' ';
    }
    let relationshipsArray = [];

    relationshipsArray = exposures.map((e) => {
        return {
            fullName: computeFullName(e),
            id: e._id,
            visualId: e.visualId,
            type: e.type
        }
    });

    return returnString ? relationshipsArray.join(', ') : relationshipsArray;
}

export function computeFullName(person) {
    if (!person || get(person, 'type', null) === null) {
        return '';
    }
    if (person.type === translations.personTypes.events) {
        return person.name || person.firstName;
    }
    return (person.firstName || '') + ' ' + (person.lastName || '');
}

export function unzipFile(source, dest, password, clientCredentials) {
    return function (dispatch) {
        return new Promise((resolve, reject) => {
            RNFetchBlobFS.exists(source)
                .then((exists) => {
                    if (exists) {
                        unzip(source, dest, 'UTF-8')
                            .then((path) => {
                                // Delete the zip file after unzipping
                                if (appConfig.env !== 'development') {
                                    deleteFile(source, true)
                                        .then(() => {
                                            resolve(path);
                                        })
                                        .catch((errorDelete) => {
                                            console.log('Error delete: ', errorDelete);
                                            resolve(path);
                                        })
                                } else {
                                    resolve(path);
                                }
                            })
                            .catch((error) => {
                                console.log(error);
                                // Delete the zip file after unzipping
                                deleteFile(source, true)
                                    .then(() => {
                                        reject(error);
                                    })
                                    .catch((errorDelete) => {
                                        console.log('Error delete: ', errorDelete);
                                        reject(error);
                                    });
                            })
                    } else {
                        reject('Zip file does not exist');
                    }
                })
                .catch((existsError) => {
                    reject(('There was an error with getting the zip file: ' + existsError));
                });
        })
    }
}

export function readDir(path) {
    return new Promise((resolve, reject) => {
        RNFetchBlobFS.ls(path)
            .then((files) => {
                resolve(files);
            })
            .catch((errorLs) => {
                reject(errorLs);
            })
    })
}

export function deleteFile(path, skipError) {
    return Promise.resolve()
        .then(() => RNFetchBlobFS.exists(path))
        .then((exists) => {
            if (exists) {
                return RNFetchBlobFS.unlink(path)
            }
            return Promise.resolve();
        })
        .catch((errorDeleteFile) => {
            if (skipError) {
                return Promise.resolve();
            }
            return Promise.reject(errorDeleteFile);
        })
}

let numberOfFilesProcessed = 0;

export function setNumberOfFilesProcessed(number) {
    numberOfFilesProcessed = number;
}

export function getNumberOfFilesProcessed() {
    return numberOfFilesProcessed;
}

export function processFilePouch(path, type, totalNumberOfFiles, dispatch, isFirstTime, forceBulk, encryptedData, hubConfig, languagePacks) {
    let fileName = path.split('/')[path.split('/').length - 1];
    let unzipLocation = path.substr(0, (path.length - fileName.length));
    return Promise.resolve()
        .then(() => processFileGeneral(path, fileName, unzipLocation, hubConfig, encryptedData))
        .then((data) => {
            if (data) {
                let promiseArray = [];
                if (isFirstTime && forceBulk) {
                    promiseArray.push(processBulkDocs(data, type));
                } else {
                    for (let i = 0; i < data.length; i++) {
                        promiseArray.push(updateFileInDatabase(data[i], type))
                    }
                }
                return Promise.all(promiseArray);
            }
        })
        .then((responses) => {
            // console.log('Finished syncing: ', responses);
            let numberOfFilesProcessedAux = getNumberOfFilesProcessed();
            numberOfFilesProcessedAux += 1;
            setNumberOfFilesProcessed(numberOfFilesProcessedAux);
            dispatch(setSyncState({
                id: 'sync',
                name: 'Syncing',
                status: numberOfFilesProcessedAux + "/" + totalNumberOfFiles,
                addLanguagePacks: checkArrayAndLength(languagePacks)
            }));
            return Promise.resolve('Finished syncing');
        })
        .catch((errorProccessingPouch) => Promise.reject(errorProccessingPouch));
}

function processEncryptedFile(path, hubConfig) {
    let password = getSyncEncryptPassword(null, hubConfig);
    return Promise.resolve()
        .then(() => RNFetchBlobFS.readFile(path, 'base64'))
        .then((encryptedData) => decrypt(password, encryptedData))
        .then((decryptedData) => RNFetchBlobFS.writeFile(`${path}`, decryptedData, 'base64'))
        .catch((errorDecrypt) => Promise.reject(errorDecrypt));
}

function processUnencryptedFile(path, fileName, unzipLocation) {
    return Promise.resolve()
        .then(() => unzip(`${path}`, `${unzipLocation}`))
        .then((unzipPath) => RNFetchBlobFS.readFile(getFilePath(unzipPath, fileName), 'utf8'))
        .then((data) => Promise.resolve(JSON.parse(data)))
        .catch((processingUnencryptedData) => {
            return Promise.reject('Error at syncing file' + fileName, processingUnencryptedData);
        })
}

function getFilePath(unzipPath, fileName) {
    return `${unzipPath}/${fileName.substring(0, fileName.length - 4)}`;
}

// The files are sorted
export function processFilesSql(path, table, totalNumberOfFiles, dispatch, encryptedData, hubConfig, languagePacks) {
    let fileName = path.split('/')[path.split('/').length - 1];
    let unzipLocation = path.substr(0, (path.length - fileName.length));
    return Promise.resolve()
        .then(() => processFileGeneral(path, fileName, unzipLocation, hubConfig, encryptedData))
        .then((data) => insertOrUpdate('common', table, data, true))
        .then((results) => {
            // console.log('Finished syncing: ', results);
            results = null;
            let numberOfFilesProcessedAux = getNumberOfFilesProcessed();
            numberOfFilesProcessedAux += 1;
            setNumberOfFilesProcessed(numberOfFilesProcessedAux);
            dispatch(setSyncState({
                id: 'sync',
                name: 'Syncing',
                status: numberOfFilesProcessedAux + "/" + totalNumberOfFiles,
                addLanguagePacks: checkArrayAndLength(languagePacks)
            }));
            return Promise.resolve('Finished syncing');
        })
        .catch((errorProcessingSql) => Promise.reject(errorProcessingSql));
}

function processFileGeneral(path, fileName, unzipLocation, hubConfig, encryptedData) {
    return Promise.resolve()
        .then(() => RNFetchBlobFS.exists(path))
        .then((exists) => {
            if (exists) {
                return encryptedData ? processEncryptedFile(path, hubConfig) : processUnencryptedFile(path, fileName, unzipLocation);
            } else {
                return Promise.reject('File does not exist');
            }
        })
        .then((promiseResponse) => {
            if (!encryptedData) {
                return Promise.resolve(promiseResponse);
            }
            return processUnencryptedFile(path, fileName, unzipLocation)
        })
        .catch((errorProcessFile) => Promise.reject(errorProcessFile));
}

export function  comparePasswords(password, encryptedPassword, callback) {
    let start = new Date().getTime();

    let RNBcrypt = NativeModules.RNBcrypt;
    RNBcrypt.verifyPassword(password, encryptedPassword)
        .then(() => {
            console.log('Result for find time for check pass success', new Date().getTime() - start);
            callback(null, true)
        })
        .catch((errorCompare) => {
            console.log('Result for find time for check pass error', new Date().getTime() - start, errorCompare);
            callback(new Error(errorCompare.userInfo));
        });
}

export function getDataFromDatabaseFromFileSql(table, lastSyncDate, password) {
    let query = {
        type: 'select',
        table: table,
        fields: [
            {
                table: table,
                name: 'json',
                alias: 'data'
            }
        ],
        condition: {
            'updatedAt': {'$gte': lastSyncDate}
        }
    };

    return executeQuery(query)
        .then((resultQuery) => resultQuery.map((e) => e.data))
        .then((response) => {
            return handleDataForZip(response, table, password, true);
        })
        .catch((errorGetDataFromDatabaseFromFileSql) => {
            return Promise.reject(errorGetDataFromDatabaseFromFileSql)
        })
}

export function getDataFromDatabaseFromFile(database, fileType, lastSyncDate, password) {
    fileType = `${fileType}.json`;
    let start = new Date().getTime();
    return database.find({
        selector: {
            // _id: {
            //     $gte: `${fileType}_`,
            //     $lte: `${fileType}_\uffff`
            // },
            // fileType: {$eq: fileType},
            updatedAt: {$gte: lastSyncDate}
        }
    })
        .then((response) => {
            // Now that we have some files, we should recreate the mongo collections
            // If there are more than 1000 collections split in chunks of 1000 records
            return handleDataForZip(response, fileType, password);
        })
        .catch((error) => {
            database = null;
            console.log(`An error occurred while getting data for collection: ${fileType}`);
            return Promise.reject(error);
        })
}

function handleDataForZip(response, fileType, password, isSqlite) {
    // Now that we have some files, we should recreate the mongo collections
    // If there are more than 1000 collections split in chunks of 1000 records
    // console.log('GetDataFromDatabaseFromFile query time: ', new Date().getTime() - start);
    let responseArray = [];
    if (!isSqlite) {
        responseArray = response.docs.map((e) => {
            if (fileType === 'user.json') {
                delete e.password;
            }
            delete e._rev;
            e._id = extractIdFromPouchId(e._id, fileType);
            // delete e._id;
            delete e.fileType;
            return e;
        });
    } else {
        responseArray = response;
    }
    if (responseArray && Array.isArray(responseArray) && responseArray.length > 0) {
        return createFilesWithName(fileType, responseArray, password)
    } else {
        return Promise.resolve(`No data to send`);
    }
}

function writeOperations(collectionName, index, data, password, jsonPath) {
    let zipPathGlobal = null;
    return Promise.resolve()
        .then(() => RNFetchBlobFS.createFile(jsonPath, JSON.stringify(data), 'utf8'))
        .then(() => deleteFile(`${jsonPath}.zip`))
        .then((writtenBytes) => zip(jsonPath, `${jsonPath}.zip`))
        .then((zipPath) => {
            zipPathGlobal = zipPath;
            return deleteFile(jsonPath)
        })
        .then(() => {
            if (password) {
                return RNFetchBlobFS.readFile(zipPathGlobal, 'base64')
                    .then((rawZipFile) => encrypt(password, rawZipFile))
                    .then((encryptedData) => RNFetchBlobFS.writeFile(zipPathGlobal, encryptedData, 'base64'))
                    .then((writtenEncryptedData) => Promise.resolve('Finished creating file'))
            }
            return Promise.resolve('Success')
        })
}

// This method creates the json file, archives it and encrypts it
export function createFileWithIndex(collectionName, index, data, password) {
    let jsonPath = `${RNFetchBlobFS.dirs.DocumentDir}/who_files/${collectionName.split('.')[0]}.${index}.json`;

    return RNFetchBlobFS.exists(jsonPath)
        .then((exists) => {
            if (exists) {
                return deleteFile(jsonPath, true);
            } else {
                return Promise.resolve();
            }
        })
        .then(() => writeOperations(collectionName, index, data, password, jsonPath))
        .catch((errorFileExists) => writeOperations(collectionName, index, data, password, jsonPath))
}

export async function createFilesWithName(fileName, data, password) {
    // First check if the directory exists
    try {
        let exists = await RNFetchBlobFS.exists(RNFetchBlobFS.dirs.DocumentDir + '/who_files');
        if (exists) {
            console.log(`Directory ${RNFetchBlobFS.dirs.DocumentDir + '/who_files'} exists`);
            let numberOfChunks = parseInt(data.length / 1000);
            let remainder = data.length % 1000;
            let arrayOfResponses = [];

            for (let i = 0; i <= numberOfChunks; i++) {
                try {
                    let response = await createFileWithIndex(fileName, i, data.slice(i * 1000, i * 1000 + 1000), password);
                    if (response) {
                        arrayOfResponses.push(response);
                    } else {
                        console.log(`No response received from createFileWithIndex. fileName: ${fileName}, index: ${i}`);
                        return Promise.reject('No response received from createFileWithIndex');
                    }
                } catch (errorCreateFileWithIndex) {
                    console.log('An error occurred while creating directory: ', errorCreateFileWithIndex);
                    return Promise.reject(errorCreateFileWithIndex);
                }
            }

            if (arrayOfResponses.length === numberOfChunks) {
                return Promise.resolve('Success');
            }
        } else {
            // If the directory does not exists, then create it
            console.log(`Directory ${RNFetchBlobFS.dirs.DocumentDir + '/who_files'} does not exist`);
            try {
                let directory = await RNFetchBlobFS.mkdir(RNFetchBlobFS.dirs.DocumentDir + '/who_files');
                // Do not check if directory exists, since the mkdir method does not return anything
                let numberOfChunks = parseInt(data.length / 1000);
                let remainder = data.length % 1000;
                let arrayOfResponses = [];

                for (let i = 0; i <= numberOfChunks; i++) {
                    try {
                        let response = await createFileWithIndex(fileName, i, data.slice(i * 1000, i * 1000 + 1000), password);
                        if (response) {
                            arrayOfResponses.push(response);
                        } else {
                            console.log(`No response received from createFileWithIndex. fileName: ${fileName}, index: ${i}`);
                            return Promise.reject('No response received from createFileWithIndex');
                        }
                    } catch (errorCreateFileWithIndex) {
                        console.log('An error occurred while creating directory: ', errorCreateFileWithIndex);
                        return Promise.reject(errorCreateFileWithIndex);
                    }
                }
                if (arrayOfResponses.length === numberOfChunks + 1) {
                    return Promise.resolve('Success');
                }
            } catch (errorCreateDir) {
                console.log('An error occurred while creating directory: ', errorCreateDir);
                return Promise.reject(errorCreateDir);
            }
        }
    } catch (errorExists) {
        console.log("An error occurred while getting if the root directory exists: ", errorExists);
        return Promise.reject(errorExists);
    }
}

export function createZipFileAtPath(source, target) {
    return Promise.resolve()
        .then(() => RNFetchBlobFS.exists(source))
        .then((exists) => {
            if (exists) {
                return deleteFile(target, true)
            } else {
                return Promise.reject(`File does not exist at path: ${source}`);
            }
        })
        .then(()=>{
            return zip(source, target)
        })
}

// Method for extracting the mongo id from the pouch id
// type is the name of the mongo collection: (follow)
export function extractIdFromPouchId(pouchId, type) {
    if (!pouchId) {
        return null;
    }
    if (!pouchId.includes(type)) {
        return pouchId
    }
    if (type.includes('referenceData')) {
        return pouchId.substr('referenceData.json_'.length)
    }
    if (type.includes('language.json')) {
        // console.log('language substr', pouchId);
        return pouchId.substr('language.json_'.length)
    }
    return pouchId.split('_')[pouchId.split('_').length - 1];
}

export function computeIdForFileType(fileType, outbreakId, file, type) {
    switch (fileType) {
        case 'person.json':
            return generateId();
        case 'followUp.json':
            return generateId();
        // return (type + '_' + file.outbreakId + '_' + file._id);
        case 'relationship.json':
            return generateId();
        case 'labResult':
            return generateId();
        default:
            return (fileType + '_' + generateId());
    }
}

export function generateId() {
    return uuid.v4();
}

export function updateRequiredFields(outbreakId, userId, record, action, fileType = '', type = '') {
    // Set the date
    let dateToBeSet = moment.utc().toDate();
    dateToBeSet = dateToBeSet.toISOString();

    switch (action) {
        case 'create':
            record._id = record._id ? record._id : computeIdForFileType(fileType, outbreakId, record, type);
            if (!sqlConstants.databaseTables.includes(fileType)) {
                record.fileType = fileType;
            }
            record.updatedAt = dateToBeSet;
            record.updatedBy = extractIdFromPouchId(userId, 'user');
            record.deleted = false;
            record.deletedAt = null;
            record.deletedBy = null;
            record.createdAt = dateToBeSet;
            record.createdBy = extractIdFromPouchId(userId, 'user');
            if (type !== '') {
                record.type = type
            }
            return record;

        case 'update':
            //required fields: userId, record
            record.updatedAt = dateToBeSet;
            record.updatedBy = extractIdFromPouchId(userId, 'user');
            record.deleted = false;
            record.deletedAt = null;
            record.deletedBy = null;
            return record;

        case 'delete':
            //required fields: userId, record
            record.updatedAt = dateToBeSet;
            record.updatedBy = extractIdFromPouchId(userId, 'user');
            record.deleted = true;
            record.deletedAt = dateToBeSet;
            record.deletedBy = extractIdFromPouchId(userId, 'user');
            // console.log ('updateRequiredFields delete record', JSON.stringify(record))

            // WGD-1806 when removing cases/contacts and they have visualId, set it to null, and add a new document
            if (fileType === 'person' && (type === config.personTypes.contacts || type === config.personTypes.cases) && record.visualId) {
                if (!record.documents || !Array.isArray(record.documents)) {
                    record.documents = [];
                }
                let documents = record.documents.slice();

                documents.push({
                    type: config.documentTypes.archivedId,
                    number: record.visualId
                });
                record.documents = documents.slice();
                record.visualId = null;
            }

            return record;

        default:
            console.log('updateRequiredFields default record', JSON.stringify(record));
            return record;
    }
}

export function createName(type, firstName, lastName) {
    if (type === 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_EVENT') {
        return firstName;
    } else {
        return ((firstName ? (firstName + ' ') : '') + (lastName ? lastName : ''));
    }
}

export function mapLocations(locationList) {
    // let startTime = new Date().getTime();

    // locationList = locationList.map((e) => Object.assign({}, e, {_id: extractIdFromPouchId(e._id, 'location')}));
    // the resulted tree
    const rootItems = [];

    // stores all already processed items with their ids as the keys so we can search quick
    const lookup = {};

    for (let i = 0; i < locationList.length; i++) {
        const locationId = extractIdFromPouchId(locationList[i]._id, 'location');
        const locationParentId = locationList[i].parentLocationId;

        // check if location already exists in the lookup table
        if (!lookup.hasOwnProperty(locationId)) {
            lookup[locationId] = {children: []};
        }

        // add current's item data to the lookup
        lookup[locationId] = Object.assign({}, locationList[i], {children: lookup[locationId].children});

        const TreeItem = lookup[locationId];

        if (locationParentId === null || locationParentId === undefined || locationParentId === '') {
            // is a root item
            rootItems.push(TreeItem);
        } else {
            // has a parent

            // look if the parent already exists in the lookup table
            if (!lookup.hasOwnProperty(locationParentId)) {
                // parent is not yet there so add preliminary data
                lookup[locationParentId] = {children: []};
            }

            lookup[locationParentId].children.push(TreeItem);
        }
    }


    // console.log('Time for processing locations new: ', new Date().getTime() - startTime);
    return rootItems;
}

// Map locations algorithm
// 1. sort locations by geographicalLevelId desc
// 2. filter locations that don't have geographicalLevelId
// 3. for each level starting from the second to last, add them to the children
// the new array will be the array that will be searched next
export function mapLocationsOld(locationList) {
    let startTime = new Date().getTime();
    // start with the roots
    let sortedArrays = groupBy(locationList, 'geographicalLevelId');
    // delete undefined geographicalLevelId
    delete sortedArrays['undefined'];
    // Get sorted keys
    let allKeys = Object.keys(sortedArrays).filter((e) => {
        return e.includes('LNG_REFERENCE_DATA_CATEGORY_LOCATION_GEOGRAPHICAL_LEVEL_ADMIN_LEVEL_')
    }).map((e) => {
        return e.split('_')[e.split('_').length - 1]
    }).sort((a, b) => {
        return b - a
    });

    let currentTree = sortedArrays[`LNG_REFERENCE_DATA_CATEGORY_LOCATION_GEOGRAPHICAL_LEVEL_ADMIN_LEVEL_${allKeys[0]}`] || [];
    for (let levelIndex = 1; levelIndex < allKeys.length; levelIndex++) {
        currentTree = groupBy(currentTree, 'parentLocationId');
        let currentLevelTree = [];
        for (let elementIndex = 0; elementIndex < sortedArrays[`LNG_REFERENCE_DATA_CATEGORY_LOCATION_GEOGRAPHICAL_LEVEL_ADMIN_LEVEL_${allKeys[levelIndex]}`].length; elementIndex++) {
            let currentElement = sortedArrays[`LNG_REFERENCE_DATA_CATEGORY_LOCATION_GEOGRAPHICAL_LEVEL_ADMIN_LEVEL_${allKeys[levelIndex]}`][elementIndex];
            let children = currentTree[extractIdFromPouchId(currentElement._id, 'location')] || null;
            if (children) {
                currentElement.children = children;
            }
            currentLevelTree.push(currentElement);
        }
        currentTree = currentLevelTree.slice();
    }

    console.log('Time for processing locations old: ', new Date().getTime() - startTime);
    return currentTree;
}


//recursively functions for mapping questionCard questions (followUps and Cases )
// item = {questionId1: [{date1, value1, subAnswers1}, {date2, value2}], questionId2: [{date: null, value1}]}
export function extractAllQuestions(questions, item, index) {
    let start = new Date().getTime();
    if (questions && Array.isArray(questions) && questions.length > 0) {
        // First filter for inactive questions
        questions = questions.filter((e) => !e.inactive || e.inactive === null || e.inactive === false || e.inactive === undefined);

        for (let i = 0; i < questions.length; i++) {
            if (questions[i].additionalQuestions) {
                delete questions[i].additionalQuestions;
            }
            if (questions[i] && questions[i].answerType && (questions[i].answerType === "LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_SINGLE_ANSWER" || questions[i].answerType === "LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_MULTIPLE_ANSWERS") && questions[i].answers && Array.isArray(questions[i].answers) && questions[i].answers.length > 0) {
                for (let j = 0; j < questions[i].answers.length; j++) {
                    // First check for single select since it has only a value
                    if (questions[i].answerType === "LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_SINGLE_ANSWER") {
                        if (item && typeof item === 'object'
                            && Object.keys(item).length > 0
                            && item[questions[i].variable]
                            && Array.isArray(item[questions[i].variable])
                            && item[questions[i].variable].length > 0
                            && typeof item[questions[i].variable][index] === "object"
                            && Object.keys(item[questions[i].variable][index]).length > 0
                            && item[questions[i].variable][index].value
                            && item[questions[i].variable][index].value === questions[i].answers[j].value
                            && questions[i].answers[j].additionalQuestions) {
                            questions[i].additionalQuestions = extractQuestionsRecursively(sortBy(questions[i].answers[j].additionalQuestions, ['order', 'variable']), item[questions[i].variable][index].subAnswers);
                        }
                    } else {
                        // For the multiple select the answers are in an array of values
                        if (questions[i].answerType === "LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_MULTIPLE_ANSWERS") {
                            if (item && typeof item === 'object'
                                && Object.keys(item).length > 0
                                && item[questions[i].variable]
                                && Array.isArray(item[questions[i].variable])
                                && item[questions[i].variable].length > 0
                                && typeof item[questions[i].variable][index] === "object"
                                && Object.keys(item[questions[i].variable][index]).length > 0
                                && item[questions[i].variable][index].value
                                && Array.isArray(item[questions[i].variable][index].value)
                                && item[questions[i].variable][index].value.length > 0
                                && item[questions[i].variable][index].value.indexOf(questions[i].answers[j].value) > -1
                                && questions[i].answers[j].additionalQuestions) {
                                questions[i].additionalQuestions = questions[i].additionalQuestions ?
                                    questions[i].additionalQuestions.concat(
                                        extractQuestionsRecursively(sortBy(questions[i].answers[j].additionalQuestions, ['order', 'variable']),
                                            item[questions[i].variable][index].subAnswers)
                                    )
                                    : extractQuestionsRecursively(sortBy(questions[i].answers[j].additionalQuestions, ['order', 'variable']), item[questions[i].variable][index].subAnswers);
                            }
                        }
                    }
                }
            }
        }
    }
    // console.log('Processing questions took: ', new Date().getTime() - start);
    return questions;
}

// previousAnswer = {key}
export function extractQuestionsRecursively(questions, item) {
    let returnedQuestions = [];

    if (questions && Array.isArray(questions) && questions.length > 0) {
        // First filter for inactive questions
        questions = questions.filter((e) => !e.inactive || e.inactive === null || e.inactive === false || e.inactive === undefined);

        for (let i = 0; i < questions.length; i++) {
            // Add every question
            returnedQuestions.push(questions[i]);
            if (questions[i] && questions[i].answerType && (questions[i].answerType === "LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_SINGLE_ANSWER" || questions[i].answerType === "LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_MULTIPLE_ANSWERS") && questions[i].answers && Array.isArray(questions[i].answers) && questions[i].answers.length > 0) {
                // For every answer check if the user answered that question and then proceed with the showing
                for (let j = 0; j < questions[i].answers.length; j++) {
                    // First check for single select since it has only a value
                    if (questions[i].answerType === "LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_SINGLE_ANSWER") {
                        if (item && typeof item === 'object' && Object.keys(item).length > 0 && item[questions[i].variable] && Array.isArray(item[questions[i].variable]) && item[questions[i].variable].length > 0 && typeof item[questions[i].variable][0] === "object" && Object.keys(item[questions[i].variable][0]).length > 0 && item[questions[i].variable][0].value && item[questions[i].variable][0].value === questions[i].answers[j].value && questions[i].answers[j].additionalQuestions) {
                            returnedQuestions = returnedQuestions.concat(extractQuestionsRecursively(sortBy(questions[i].answers[j].additionalQuestions, ['order', 'variable']), item))
                        }
                    } else {
                        // For the multiple select the answers are in an array of values
                        if (questions[i].answerType === "LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_MULTIPLE_ANSWERS") {
                            if (item && typeof item === 'object' && Object.keys(item).length > 0 && item[questions[i].variable] && Array.isArray(item[questions[i].variable]) && item[questions[i].variable].length > 0 && typeof item[questions[i].variable][0] === "object" && Object.keys(item[questions[i].variable][0]).length > 0 && item[questions[i].variable][0].value && Array.isArray(item[questions[i].variable][0].value) && item[questions[i].variable][0].value.length > 0 && item[questions[i].variable][0].value.indexOf(questions[i].answers[j].value) > -1 && questions[i].answers[j].additionalQuestions) {
                                returnedQuestions = returnedQuestions.concat(extractQuestionsRecursively(sortBy(questions[i].answers[j].additionalQuestions, ['order', 'variable']), item))
                            }
                        }
                    }
                }
            }
        }
    }
    return returnedQuestions;
}

export function mapAnswers(questions, answers) {
    let mappedAnswers = {};
    let sortedQuestions = sortBy(questions, ['order', 'variable']);
    let questionnaireAnswers = null;
    if (answers) {
        questionnaireAnswers = cloneDeep(answers);
    }

    if (questionnaireAnswers) {
        for (let questionId in questionnaireAnswers) {
            // First added the main questions
            if (sortedQuestions.findIndex((e) => {
                return e.variable === questionId
            }) > -1) {
                mappedAnswers[questionId] = cloneDeep(questionnaireAnswers[questionId]);
            }
        }
    }

    // Look for the sub-questions
    for (let i = 0; i < sortedQuestions.length; i++) {
        if (sortedQuestions[i].answerType === 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_SINGLE_ANSWER' ||
            sortedQuestions[i].answerType === 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_MULTIPLE_ANSWERS') {
            if (checkArrayAndLength(get(sortedQuestions, `[${i}].answers`), null)) {
                sortedQuestions[i].additionalQuestions = [];
                for (let j = 0; j < sortedQuestions[i].answers.length; j++) {
                    let result = extractQuestions(sortBy(sortedQuestions[i].answers[j].additionalQuestions, ['order', 'variable']));
                    if (checkArrayAndLength(result)) {
                        sortedQuestions[i].additionalQuestions = sortedQuestions[i].additionalQuestions.concat(result);
                    }
                }
            }
        }
    }

    if (questionnaireAnswers && mappedAnswers && Object.keys(mappedAnswers).length > 0) {
        for (let questionId in questionnaireAnswers) {
            for (let j = 0; j < sortedQuestions.length; j++) {
                if (!mappedAnswers[questionId] && checkArrayAndLength(get(sortedQuestions, `[${j}].additionalQuestions`), null) && sortedQuestions[j].additionalQuestions.findIndex((e) => {
                    return e.variable === questionId
                }) > -1) {
                    for (let i = 0; i < questionnaireAnswers[questionId].length; i++) {
                        if (checkArrayAndLength(get(mappedAnswers, `[${get(sortedQuestions, `[${j}].variable`, null)}]`, null))) {
                            let indexForStuff = mappedAnswers[sortedQuestions[j].variable].findIndex((e) => {
                                return e.date === questionnaireAnswers[questionId][i].date
                            });
                            if (indexForStuff > -1) {
                                if (mappedAnswers[sortedQuestions[j].variable][indexForStuff] && !mappedAnswers[sortedQuestions[j].variable][indexForStuff].subAnswers) {
                                    const a = Object.assign({}, mappedAnswers[sortedQuestions[j].variable][indexForStuff], {subAnswers: {}});
                                    mappedAnswers[sortedQuestions[j].variable][indexForStuff] = a;
                                }
                                // mappedAnswers[sortedQuestions[j].variable][indexForStuff].subAnswers[questionId] = [questionnaireAnswers[questionId][i]];
                            }
                        }
                    }
                }
            }
        }
    }

    console.log('Mapped answers here: ', mappedAnswers);

    // this.setState({
    //     mappedQuestions: sortedQuestions
    // }, () => {
    return {mappedQuestions: sortedQuestions, mappedAnswers: mappedAnswers};
    // });
}

// Extract all sub questions of the sub-questions
function extractQuestions(questions) {
    let returnedQuestions = questions.slice();
    if (questions && Array.isArray(questions) && questions.length > 0) {
        for (let i = 0; i < questions.length; i++) {
            if (questions[i].answerType === 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_SINGLE_ANSWER' || questions[i].answerType === 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_MULTIPLE_ANSWERS') {
                if (questions[i].answers && Array.isArray(questions[i].answers) && questions[i].answers.length > 0) {
                    for (let j = 0; j < questions[i].answers.length; j++) {
                        returnedQuestions = returnedQuestions.concat(extractQuestions(sortBy(questions[i].answers[j].additionalQuestions, ['order', 'variable'])));
                    }
                }
            }
        }
    }

    // console.log('extract le questions:  ', returnedQuestions);
    return returnedQuestions;
}

export function getMaskRegExpStringForSearch(mask) {
    mask = mask.replace('0', '[0-9]');
    mask = mask.replace('YYYY', '\\d{4}');
    mask = mask.replace('@', '[A-Za-z]');
    mask = mask.replace('&', '.');
    //Doing this for my sanity
    mask = mask.replace('*', '(.*?)');

    return new RegExp(`^${mask}$`);
}

export function reMapAnswers(answers) {
    let returnedAnswers = answers;
    // Map to flat structure
    for (let questionId in returnedAnswers) {
        for (let elem of returnedAnswers[questionId]) {
            if (elem.subAnswers) {
                for (let subAnswerKey in elem.subAnswers) {
                    if (returnedAnswers[subAnswerKey]) {
                        returnedAnswers[subAnswerKey] = returnedAnswers[subAnswerKey].concat(elem.subAnswers[subAnswerKey]);
                    } else {
                        returnedAnswers[subAnswerKey] = elem.subAnswers[subAnswerKey];
                    }
                }
            }
        }
    }

    // Sort each returnedAnswer by date descending
    for (let questionId in returnedAnswers) {
        returnedAnswers[questionId].sort((a, b) => {
            if (a.date > b.date) {
                return -1;
            }
            if (a.date < b.date) {
                return 1;
            }
            return 0;
        });
        returnedAnswers[questionId] = returnedAnswers[questionId].map((e) => {
            if (e.date) {
                e.date = createDate(e.date).toISOString();
            } else {
                e.date = null;
            }
            return e;
        });
    }

    return returnedAnswers;
}

export function checkRequiredQuestions(questions, previousAnswers) {
    let requiredQuestions = [];
    for (let i = 0; i < questions.length; i++) {
        if (questions[i].required && questions[i].inactive === false) {
            if (!previousAnswers || !previousAnswers[questions[i].variable] || !Array.isArray(previousAnswers[questions[i].variable]) || previousAnswers[questions[i].variable].findIndex((e) => {
                return !e.value && e.value !== 0
            }) > -1) {
                requiredQuestions.push(questions[i].text);
            }
        }
        if (questions[i].additionalQuestions && Array.isArray(questions[i].additionalQuestions) && questions[i].additionalQuestions.length > 0) {
            for (let j = 0; j < questions[i].additionalQuestions.length; j++) {
                if (questions[i].additionalQuestions[j].required && previousAnswers[questions[i].variable].filter((e) => {
                    return get(e, `subAnswers[${questions[i].additionalQuestions[j].variable}]`, 'failTest') !== 'failTest'
                }).findIndex((e) => {
                    // console.log('checkRequiredQuestions test: ', get(e, `subAnswers[${questions[i].additionalQuestions[j].variable}][0].value`, 'fail'), e);
                    return !e.subAnswers || e.subAnswers[questions[i].additionalQuestions[j].variable][0].value === null || e.subAnswers[questions[i].additionalQuestions[j].variable][0].value === ""
                }) > -1) {
                    requiredQuestions.push(questions[i].additionalQuestions[j].text);
                }
            }
        }
    }
    return requiredQuestions;
}

export function getTranslation(value, allTransactions) {
    if (!value) {
        return '';
    }
    if (!getTranslation.cache) {
        getTranslation.cache = {}
    }
    let key = `${value}`;
    if (allTransactions && Array.isArray(allTransactions) && allTransactions[0] && allTransactions[0].languageId) {
        key = `${key}-${allTransactions[0].languageId}-${new Date(allTransactions[0].updatedAt).getTime()}`;
    }
    if (getTranslation.cache[key] !== undefined) {
        // console.log('~~~ return cache value ~~~', key)
        return getTranslation.cache[key]
    }
    let valueToBeReturned = value;
    if (value && typeof value === 'string' && value.includes('LNG')) {
        let item = null;
        if (value && allTransactions && Array.isArray(allTransactions)) {
            item = allTransactions.find(e => {
                return e && e.token === value
            })
        }

        // valueToBeReturned = item ? item.translation : '';

        if (item !== null && item !== undefined && item.translation !== null && item.translation !== undefined) {
            valueToBeReturned = item.translation
        } else if (defaultTranslations[`${value}`] !== undefined && defaultTranslations[`${value}`] !== null) {
            valueToBeReturned = defaultTranslations[`${value}`]
        } else {
            valueToBeReturned = value;
        }
    }
    // getTranslation.cache[key] = valueToBeReturned;
    return valueToBeReturned;
}

export function localSortHelpItem(helpItemsCopy, propsFilter, stateFilter, filterFromFilterScreen, translations) {
    // Map helpItemsCopy to use translated title
    if (checkArrayAndLength(helpItemsCopy)) {
        helpItemsCopy = helpItemsCopy.map((e) => Object.assign({}, e, {title: getTranslation(e && e.title, translations)}));
    }
    // Take care of search filter
    if (stateFilter.searchText) {
        helpItemsCopy = helpItemsCopy.filter((e) => {
            return (e && e.title && stateFilter.searchText.toLowerCase().includes(e.title.toLowerCase())) ||
                e && e.title && e.title.toLowerCase().includes(stateFilter.searchText.toLowerCase())
        });
    }

    // Take care of category filter
    if (filterFromFilterScreen && filterFromFilterScreen.categories && filterFromFilterScreen.categories.length > 0) {
        helpItemsCopy = helpItemsCopy.filter((e) => {
            let findItem = filterFromFilterScreen.categories.find((k) => {
                return k.value === `helpCategory.json_${e.categoryId}`
            });
            return findItem !== undefined
        })
    }

    // Take care of sort
    if (filterFromFilterScreen && filterFromFilterScreen.sort && filterFromFilterScreen.sort !== undefined && filterFromFilterScreen.sort.length > 0) {
        let sortCriteria = [];
        let sortOrder = [];
        for (let i = 0; i < filterFromFilterScreen.sort.length; i++) {
            if (filterFromFilterScreen.sort[i].sortCriteria && filterFromFilterScreen.sort[i].sortCriteria.trim().length > 0 && filterFromFilterScreen.sort[i].sortOrder && filterFromFilterScreen.sort[i].sortOrder.trim().length > 0) {
                sortCriteria.push(filterFromFilterScreen.sort[i].sortCriteria === 'LNG_HELP_ITEMS_FIELD_LABEL_TITLE' ? 'title' : 'categoryId')
                sortOrder.push(filterFromFilterScreen.sort[i].sortOrder === 'LNG_SIDE_FILTERS_SORT_BY_ASC_PLACEHOLDER' ? false : true)
            }
        }

        let helpItemsCopyMapped = helpItemsCopy.map((e) => {
            if (e.title) {
                e.title = getTranslation(e.title, translations)
            }
            if (e.categoryId) {
                e.categoryId = getTranslation(e.categoryId, translations)
            }
            return e
        });

        helpItemsCopy = helpItemsCopyMapped;

        if (sortCriteria.length > 0 && sortOrder.length > 0) {
            if (sortOrder.length === 1) {
                helpItemsCopy = objSort(helpItemsCopy, [sortCriteria[0], sortOrder[0]])
            } else if (sortOrder.length === 2) {
                helpItemsCopy = objSort(helpItemsCopy, [sortCriteria[0], sortOrder[0]], [sortCriteria[1], sortOrder[1]])
            }
        }
    }

    return helpItemsCopy
}

export function filterItemsForEachPage(helpItemsCopy, pageAskingHelpFrom) {
    helpItemsCopy = helpItemsCopy.filter((e) => {
        let itemPage = null;
        if (e.page && e.page !== undefined) {
            itemPage = e.page
        }
        if (itemPage) {
            if (pageAskingHelpFrom === 'followUps') {
                return e.page.toLowerCase().includes('followups') && !e.page.toLowerCase().includes('modify') && !e.page.toLowerCase().includes('edit') &&
                    !e.page.toLowerCase().includes('view') && !e.page.toLowerCase().includes('add') && !e.page.toLowerCase().includes('create')
            } else if (pageAskingHelpFrom === 'labResults') {
                return e.page.toLowerCase().includes('lab-results') && !e.page.toLowerCase().includes('modify') && !e.page.toLowerCase().includes('edit') &&
                    !e.page.toLowerCase().includes('view') && !e.page.toLowerCase().includes('add') && !e.page.toLowerCase().includes('create')
            } else if (pageAskingHelpFrom === 'contacts') {
                return e.page.toLowerCase().includes('contacts') && !e.page.toLowerCase().includes('modify') && !e.page.toLowerCase().includes('edit') &&
                    !e.page.toLowerCase().includes('view') && !e.page.toLowerCase().includes('add') && !e.page.toLowerCase().includes('create')
            } else if (pageAskingHelpFrom === 'cases') {
                return e.page.toLowerCase().includes('cases') && !e.page.toLowerCase().includes('modify') && !e.page.toLowerCase().includes('edit') &&
                    !e.page.toLowerCase().includes('view') && !e.page.toLowerCase().includes('add') && !e.page.toLowerCase().includes('create')
            } else if (pageAskingHelpFrom === 'followUpSingleScreenAdd') {
                return e.page.toLowerCase().includes('followups') && !e.page.toLowerCase().includes('modify') && !e.page.toLowerCase().includes('edit') &&
                    !e.page.toLowerCase().includes('view') && (e.page.toLowerCase().includes('add') || e.page.toLowerCase().includes('create'))
            } else if (pageAskingHelpFrom === 'labResultsSingleScreenAdd') {
                return e.page.toLowerCase().includes('lab-results') && !e.page.toLowerCase().includes('modify') && !e.page.toLowerCase().includes('edit') &&
                    !e.page.toLowerCase().includes('view') && (e.page.toLowerCase().includes('add') || e.page.toLowerCase().includes('create'))
            } else if (pageAskingHelpFrom === 'contactsSingleScreenAdd') {
                return e.page.toLowerCase().includes('contacts') && !e.page.toLowerCase().includes('modify') && !e.page.toLowerCase().includes('edit') &&
                    !e.page.toLowerCase().includes('view') && (e.page.toLowerCase().includes('add') || e.page.toLowerCase().includes('create'))
            } else if (pageAskingHelpFrom === 'casesSingleScreenAdd') {
                return e.page.toLowerCase().includes('cases') && !e.page.toLowerCase().includes('modify') && !e.page.toLowerCase().includes('edit') &&
                    !e.page.toLowerCase().includes('view') && (e.page.toLowerCase().includes('add') || e.page.toLowerCase().includes('create'))
            } else if (pageAskingHelpFrom === 'followUpSingleScreenEdit') {
                return e.page.toLowerCase().includes('followups') && (e.page.toLowerCase().includes('modify') || e.page.toLowerCase().includes('edit')) &&
                    !e.page.toLowerCase().includes('view') && !e.page.toLowerCase().includes('add') && !e.page.toLowerCase().includes('create')
            } else if (pageAskingHelpFrom === 'labResultsSingleScreenEdit') {
                return e.page.toLowerCase().includes('lab-results') && (e.page.toLowerCase().includes('modify') || e.page.toLowerCase().includes('edit')) &&
                    !e.page.toLowerCase().includes('view') && !e.page.toLowerCase().includes('add') && !e.page.toLowerCase().includes('create')
            } else if (pageAskingHelpFrom === 'contactsSingleScreenEdit') {
                return e.page.toLowerCase().includes('contacts') && (e.page.toLowerCase().includes('modify') || e.page.toLowerCase().includes('edit')) &&
                    !e.page.toLowerCase().includes('view') && !e.page.toLowerCase().includes('add') && !e.page.toLowerCase().includes('create')
            } else if (pageAskingHelpFrom === 'casesSingleScreenEdit') {
                return e.page.toLowerCase().includes('cases') && (e.page.toLowerCase().includes('modify') || e.page.toLowerCase().includes('edit')) &&
                    !e.page.toLowerCase().includes('view') && !e.page.toLowerCase().includes('add') && !e.page.toLowerCase().includes('create')
            } else if (pageAskingHelpFrom === 'followUpSingleScreenView') {
                return e.page.toLowerCase().includes('followups') && !e.page.toLowerCase().includes('modify') && !e.page.toLowerCase().includes('edit') &&
                    e.page.toLowerCase().includes('view') && !e.page.toLowerCase().includes('add') && !e.page.toLowerCase().includes('create')
            } else if (pageAskingHelpFrom === 'labResultsSingleScreenView') {
                return e.page.toLowerCase().includes('lab-results') && !e.page.toLowerCase().includes('modify') && !e.page.toLowerCase().includes('edit') &&
                    e.page.toLowerCase().includes('view') && !e.page.toLowerCase().includes('add') && !e.page.toLowerCase().includes('create')
            } else if (pageAskingHelpFrom === 'contactsSingleScreenView') {
                return e.page.toLowerCase().includes('contacts') && !e.page.toLowerCase().includes('modify') && !e.page.toLowerCase().includes('edit') &&
                    e.page.toLowerCase().includes('view') && !e.page.toLowerCase().includes('add') && !e.page.toLowerCase().includes('create')
            } else if (pageAskingHelpFrom === 'casesSingleScreenView') {
                return e.page.toLowerCase().includes('cases') && !e.page.toLowerCase().includes('modify') && !e.page.toLowerCase().includes('edit') &&
                    e.page.toLowerCase().includes('view') && !e.page.toLowerCase().includes('add') && !e.page.toLowerCase().includes('create')
            } else if (pageAskingHelpFrom === 'exposureAdd') {
                return e.page.toLowerCase().includes('relationships') && !e.page.toLowerCase().includes('modify') && !e.page.toLowerCase().includes('edit') &&
                    !e.page.toLowerCase().includes('view') && (e.page.toLowerCase().includes('add') || e.page.toLowerCase().includes('create'))
            } else if (pageAskingHelpFrom === 'exposureEdit') {
                return e.page.toLowerCase().includes('relationships') && (e.page.toLowerCase().includes('modify') || e.page.toLowerCase().includes('edit') ||
                    e.page.toLowerCase().includes('view')) && !e.page.toLowerCase().includes('add') && !e.page.toLowerCase().includes('create')
            } else if (pageAskingHelpFrom === 'users') {
                return e.page.toLowerCase().includes('users') && !e.page.toLowerCase().includes('modify') && !e.page.toLowerCase().includes('edit') &&
                    !e.page.toLowerCase().includes('view') && !e.page.toLowerCase().includes('add') && !e.page.toLowerCase().includes('create')
            }
        }
    });

    return helpItemsCopy
}

export function objSort() {
    let args = arguments,
        array = args[0],
        case_sensitive, keys_length, key, desc, a, b, i;

    if (typeof arguments[arguments.length - 1] === 'boolean') {
        case_sensitive = arguments[arguments.length - 1];
        keys_length = arguments.length - 1;
    } else {
        case_sensitive = false;
        keys_length = arguments.length;
    }

    return array.sort(function (obj1, obj2) {
        for (i = 1; i < keys_length; i++) {
            key = args[i];
            if (typeof key !== 'string') {
                desc = key[1];
                key = key[0];
                a = obj1[args[i][0]];
                b = obj2[args[i][0]];
            } else {
                desc = false;
                a = obj1[args[i]];
                b = obj2[args[i]];
            }

            if (case_sensitive === false && typeof a === 'string' && typeof b === "string") {
                a = a !== undefined && a.trim().length > 0 ? a.toLowerCase() : '~'; // place caracters that does not have property or has it but is '' at the end of array
                b = b !== undefined && b.trim().length > 0 ? b.toLowerCase() : '~'; // place caracters that does not have property or has it but is '' at the end of array
                //null if wanted at the start of array
            }

            if (!desc) {
                if (a < b) return -1;
                if (a > b) return 1;
            } else {
                if (a > b) return -1;
                if (a < b) return 1;
            }
        }
        return 0;
    });
    // objSort(homes, 'city') --> sort by city (ascending, case in-sensitive)
    // objSort(homes, ['city', true]) --> sort by city (descending, case in-sensitive)
    // objSort(homes, 'city', true) --> sort by city (ascending, case sensitive)
    // objSort(homes, 'city', 'price') --> sort by city then price (both ascending, case in-sensitive)
    // objSort(homes, 'city', ['price', true]) --> sort by city (ascending) then price (descending), case in-sensitive)
}

export function getTooltip(label, translation, forceTooltip, tooltipsMessage) {

    if (forceTooltip) {
        return {
            hasTooltip: true,
            tooltipMessage: tooltipsMessage
        };
    }

    let hasTooltip = false;
    let tooltipMessage = '';

    let labelTooltip = label + '_DESCRIPTION';
    let tooltipTranslation = getTranslation(labelTooltip, translation);
    if (tooltipTranslation && typeof tooltipTranslation === 'string' && !tooltipTranslation.includes('LNG') && !tooltipTranslation.includes('_DESCRIPTION') && tooltipTranslation.trim().length > 0) {
        hasTooltip = true;
        tooltipMessage = tooltipTranslation
    }

    let tooltip = {
        hasTooltip: hasTooltip,
        tooltipMessage: tooltipMessage
    };

    return tooltip
}

export function getDropDownInputDisplayParameters(screenSize, dropDownDataLength) {
    let itemCount = 4;
    let dropdownPosition = 3;

    if (dropDownDataLength < 4) {
        itemCount = dropDownDataLength;
        dropdownPosition = dropDownDataLength - 1;
    } else {
        if (screenSize.height !== undefined && screenSize.height < 667) {
            //iPhone 6
            itemCount = 3;
            dropdownPosition = 2;
        }
    }

    return {
        itemCount: itemCount,
        dropdownPosition: dropdownPosition
    }
}

export function createDate(date, isEndOfDay, accurateDate) {
    const timezone = store?.getState().app.timezone;
    if (accurateDate) {
        if (date) {
            return moment.tz(date, timezone).toDate();
        }
        return moment.tz(timezone).toDate();
    }
    if (isEndOfDay) {
        if (date) {
            return moment.tz(date, timezone).endOf('day').toDate();
        }
        return moment.tz(timezone).endOf('day').toDate();
    }
    if (date) {
        return moment.tz(date, timezone).startOf('day').toDate();
    }
    return moment.tz(timezone).startOf('day').toDate();
}

export function daysSince(startDate, endDate) {
    if (!startDate || !endDate) {
        return 0
    }
    const timezone = store.getState().app.timezone;
    return moment.tz(endDate, timezone).startOf('day').diff(moment.tz(startDate, timezone).startOf('day'), 'days');
}

export function calcDateDiff(startdate, enddate) {
    //define moments for the startdate and enddate
    let startdateMoment = moment(startdate);
    let enddateMoment = moment(enddate);

    if (startdateMoment.isValid() === true && enddateMoment.isValid() === true) {
        //getting the difference in years
        let years = enddateMoment.diff(startdateMoment, 'years');

        //moment returns the total months between the two dates, subtracting the years
        let months = enddateMoment.diff(startdateMoment, 'months') - (years * 12);

        //to calculate the days, first get the previous month and then subtract it
        startdateMoment.add(years, 'years').add(months, 'months');
        let days = enddateMoment.diff(startdateMoment, 'days');


        console.log('calcDateDiff', {months: months, years: years});
        return nrOFYears = {
            months: months,
            years: years,
        };
    } else {
        return undefined;
    }
}

// Algorithm:
// - Get contact's main address
// - Go through all the locations and when meeting a location that is assigned to a team add it to teams,
// then go recursively adding the team to the sub locations
// - When finding the main address take the first team from the teams array or null if no team assigned
// - Note: to be checked the performance
export function generateTeamId(contactAddress, teams, locationsTree) {
    let start = new Date().getTime();
    let currentAddress = contactAddress;
    if (!checkArrayAndLength(teams)) {
        return null;
    }

    // Contact doesn't have an address or there aren't any locations
    // Pick a random team from the user's teams
    if (!checkArrayAndLength(contactAddress) || !checkArrayAndLength(locationsTree)) {
        let index = Math.floor(Math.random() * Math.floor(teams.length));
        return get(teams, `[${index}].teamId`, null);
    }

    if (checkArrayAndLength(contactAddress)) {
        currentAddress = extractMainAddress(contactAddress);
    }

    let teamId = computeAllTeamsForLocations(teams, locationsTree, [], currentAddress.locationId, null);

    console.log('Computed teamId in: ', new Date().getTime() - start);
    return teamId;
}

// Warning: this code makes an assumption that the user will be a member of a very few teams and that each team will have few locations assigned
// This will have poor performance for large number of teams with large number of locations for each
export function computeAllTeamsForLocations(teams, locationsTree, teamsToBeAttachedToAllLocations, followUpLocationId, teamId) {
    if (teamId) {
        return teamId
    }

    if (!checkArrayAndLength(teams) || !checkArrayAndLength(locationsTree) || !followUpLocationId) {
        return teamId;
    }

    for (let i = 0; i < locationsTree.length; i++) {
        let teamsToBeAdded = teams.filter((e) => {
            return e.locationIds.includes(extractIdFromPouchId(locationsTree[i]._id, 'location'));
        }).map((e) => {
            return extractIdFromPouchId(e._id, 'team')
        });
        if (checkArrayAndLength(teamsToBeAdded)) {
            // Add the new teams at the beginning so that the first ones are the ones closer to the contact's address
            teamsToBeAttachedToAllLocations = teamsToBeAdded.concat(teamsToBeAttachedToAllLocations);
        }
        if (extractIdFromPouchId(locationsTree[i]._id, 'location') === followUpLocationId) {
            if (checkArrayAndLength(teamsToBeAttachedToAllLocations)) {
                // Check first if one of the user's teams is here
                teamId = get(teamsToBeAttachedToAllLocations, `[0]`, null);
            }
            return teamId;
        }
        if (checkArrayAndLength(teamsToBeAttachedToAllLocations)) {
            set(locationsTree, `[${i}].teamsResponsible`, teamsToBeAttachedToAllLocations);
        }
        if (checkArrayAndLength(get(locationsTree, `[${i}].children`, []))) {
            teamId = computeAllTeamsForLocations(teams, get(locationsTree, `[${i}].children`, []), teamsToBeAttachedToAllLocations, followUpLocationId, teamId);
        }
    }

    return teamId;
}

export function extractMainAddress(addressesArray) {
    if (!addressesArray || !Array.isArray(addressesArray) || addressesArray.length === 0) {
        return null;
    }

    return addressesArray.find((e) => {
        return e.typeId === config.userResidenceAddress.userPlaceOfResidence
    })
}

export function callPhone(translation) {
    return number => {
        Alert.alert(
            getTranslation(translations.alertMessages.alertLabel, translation),
            `${getTranslation(
                translations.alertMessages.dialNumberAlertDescription,
                translation
            )} (${number})`,
            [
                {
                    text: getTranslation(translations.alertMessages.yesButtonLabel, translation),
                    onPress: () => {
                        Linking.openURL(`tel:${number}`);
                    }
                },
                {
                    text: getTranslation(translations.alertMessages.cancelButtonLabel, translation)
                }
            ], {cancelable: true});

    }
}

export function extractLocationId(person) {
    let locationId = null;
    let addresses = get(person, 'addresses', null);
    if (addresses !== null) {
        let currentAddress = addresses.find((e) => {
            return e.typeId === config.userResidenceAddress.userPlaceOfResidence
        });
        locationId = get(currentAddress, 'locationId', null);
    }
    return locationId;
}

// Promise wrapper around getCurrentPosition from react-native
export function getLocationAccurate() {
    return new Promise((resolve, reject) => {
        geolocation.getCurrentPosition(
            (position) => {
                return resolve({
                    lat: get(position, 'coords.latitude', null),
                    lng: get(position, 'coords.longitude', null)
                })
            },
            (errorGetPosition) => {
                return reject(errorGetPosition);
            },
            {
                timeout: 5000
            }
        )
    })
}

export function filterByUser(locationTree, userTeams) {
    let locationIds = [];
    for (let i = 0; i < userTeams.length; i++) {
        if (userTeams[i].hasOwnProperty('locationIds') && userTeams[i].locationIds.length > 0) {
            let teamLocations = userTeams[i].locationIds;
            for (let j = 0; j < teamLocations.length; j++) {
                if (locationIds.indexOf(teamLocations[j]) === -1) {
                    locationIds.push(teamLocations[j]);
                }
            }
        }

    }
    return extractLocations(locationTree, locationIds);
}

export function generatePermissionMessage(mainPermission, dataType, translation) {
    return `${getTranslation(translations.alertMessages.permission, translation)}${getTranslation(mainPermission, translation)} ${getTranslation(dataType, translation)}`;
}