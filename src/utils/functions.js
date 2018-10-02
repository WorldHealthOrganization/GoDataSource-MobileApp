/**
 * Created by florinpopa on 14/06/2018.
 */
import errorTypes from './errorTypes';
import config from './config';
import RNFetchBlobFS from 'rn-fetch-blob/fs';
import {unzip} from 'react-native-zip-archive';
import {updateFileInDatabase} from './../queries/database';
import {setSyncState} from './../actions/app';
import bcrypt from 'react-native-bcrypt';
import uuid from 'react-native-uuid';
import {getContactsForOutbreakId} from './../actions/contacts';

// This method is used for handling server responses. Please add here any custom error handling
export function handleResponse(response) {
    if (response.status === 200) {
        return response.json();
    }

    if (response.status === 204) {
        return {};
    }

    return response.json().then(response => {
        if (response.error && response.error.message && (typeof response.error.message === 'string')) {

            // TODO ERROR HANDLING

        }
        throw new Error(errorTypes.UNKNOWN_ERROR);
    });
};

// This method is used for calculating dimensions for components.
// Because the design is made only for one screen, this means that for other screen resolutions, the views will not be scaled
// To use the method
// First argument is the size of the component from the design
// Second argument is the size of the screen {width, height} from the design. You can find it in the config file
// Third argument is the screen size {width, height}
export function calculateDimension (designResourceDimension, isHeight, screenSize) {
    // Check phones with different aspect ratio
    let designScreenDimension = config.designScreenSize;
    let scaledHeight = designScreenDimension.height;
    if (designScreenDimension.height / designScreenDimension.width !== screenSize.height / screenSize.width) {
        scaledHeight = designScreenDimension.width * designScreenDimension.height / screenSize.width;
    }

    if (isHeight) {
        return (designResourceDimension * scaledHeight) / designScreenDimension.height;
    }

    return (designResourceDimension * screenSize.width) / designScreenDimension.width;
}

export function checkIfSameDay(date1, date2) {
    if (Object.prototype.toString.call(date1) !== '[object Date]' || Object.prototype.toString.call(date2) !== '[object Date]') {
        return false;
    }
    return date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
}

export function getAddress(address, returnString) {
    let addressArray = [];

    if (address) {
        addressArray = [address.addressLine1, address.addressLine2, address.city, address.country, address.postalCode];
        addressArray = addressArray.filter((e) => {return e});
    }

    return returnString ? addressArray.join(', ') : addressArray;
}

export function navigation(event, navigator) {
    if (event.type === 'DeepLink') {
        // console.log("###");
        if (event.link.includes('Navigate')) {
            let linkComponents = event.link.split('/');
            // console.log("### linkComponents: ", linkComponents);
            if (linkComponents.length > 0) {
                let screenToSwitchTo = null;
                let addScreen = null;
                switch(linkComponents[1]) {
                    case '0':
                        screenToSwitchTo = 'FollowUpsScreen';
                        break;
                    case '1':
                        screenToSwitchTo = "ContactsScreen";
                        break;
                    case '2':
                        screenToSwitchTo = "CasesScreen";
                        break;
                    case '2-add':
                        screenToSwitchTo = "CasesScreen";
                        addScreen = "AddSingleCaseScreen";
                        break;
                    default:
                        screenToSwitchTo = "FollowUpsScreen";
                        break;
                }
                navigator.resetTo({
                    screen: screenToSwitchTo,
                    animated: true
                });
                if(addScreen) {
                    navigator.push({
                        screen: addScreen,
                        animated: true,
                        animationType: 'fade',
                        passProps: {
                            item: {},
                            filter: null
                        }
                    })
                }
            }
        }
    }
}

// This method returns the cases/events that a contact has been exposed to
// It can return either as a string or as an array of cases
export function handleExposedTo(contact, returnString, cases, events) {
    if (!contact || !contact.relationships || !Array.isArray(contact.relationships) || contact.relationships.length === 0) {
        return ' ';
    }

    let relationshipArray = [];

    let relationships = contact.relationships;

    for (let i=0; i<relationships.length; i++) {
        // Get only the persons that the contact has been exposed to
        // Since on the local storage we keep the ids as the actual id concatenated with other strings, we must parse this
        let contactId = contact._id.split('_');
        contactId = contactId[contactId.length - 1];
        let persons = relationships[i].persons.filter((e) => {return e.id !== contactId});
        for (let j=0; j<persons.length; j++) {
            if (persons[j].type === 'case' && cases && Array.isArray(cases)) {
                let auxCase = cases[cases.map((e) => {return e._id.split('_')[e._id.split('_').length - 1]}).indexOf(persons[j].id)];
                if (auxCase) {
                    relationshipArray.push((auxCase.firstName || '') + " " + (auxCase.lastName || ''));
                }
            } else {
                if (events && Array.isArray(events)) {
                    let auxEvent = events[events.map((e) => {
                        return e._id.split('_')[e._id.split('_').length - 1]
                    }).indexOf(persons[j].id)];
                    if (auxEvent && auxEvent.name) {
                        relationshipArray.push(auxEvent.name);
                    }
                }
            }
        }
    }

    return returnString ? relationshipArray.join(", ") : relationshipArray;
}

export function unzipFile (source, dest, callback) {
    RNFetchBlobFS.exists(source)
        .then((exists) => {
            if (exists) {
                // Proceed to unzip the file to the specified destination
                unzip(source, dest)
                    .then((path) => {
                        console.log(`unzip completed at ${path}`);
                        callback(null, path);
                    })
                    .catch((error) => {
                        console.log(error);
                        callback(error);
                    })
            } else {
                return callback('Zip file does not exist');
            }
        })
        .catch((existsError) => {
            callback(('There was an error with getting the zip file: ' + existsError));
        });
}

export function readFile (path, callback) {
    RNFetchBlobFS.readFile(path, 'utf8')
        .then((data) => {
            callback(null, JSON.parse(data));
        })
        .catch((errorReadFile) => {
            console.log("Error while reading the file: ", errorReadFile);
            callback(errorReadFile)
        })
}

export function syncFile (path, callback) {
    readFile(path, (errorReadFile, data) => {
        if (errorReadFile) {
            console.log("Error while reading the file: ", errorReadFile);
            callback(errorReadFile)
        }
        if (data) {

        }
    })
}

export function readDir (path, callback) {
    RNFetchBlobFS.ls(path)
        .then((files) => {
            callback(null, files);
        })
        .catch((errorLs) => {
            callback(errorLs);
        })
}

let numberOfFilesProcessed = 0;

export function setNumberOfFilesProcessed(number) {
    numberOfFilesProcessed = number;
}

export function getNumberOfFilesProcessed() {
    return numberOfFilesProcessed;
}

export async function processFile (path, type, totalNumberOfFiles, dispatch) {
    return new Promise((resolve, reject) => {
        if (path) {
            console.log('Process file: ', type, ' From path: ', path);
            RNFetchBlobFS.exists(path)
                .then((exists) => {
                    if (exists) {
                        // File exists, time to read it in order to process
                        readFile(path, (error, data) => {
                            if (error) {
                                console.log("Error while reading file");
                                reject("Error while reading file");
                            }
                            if (data) {
                                // Since there is data in the file, it's time to sync it
                                let promises = [];
                                for (let i=0; i<data.length; i++) {
                                    promises.push(updateFileInDatabase(data[i], type))
                                }

                                Promise.all(promises)
                                    .then((responses) => {
                                        console.log('Finished syncing: ', responses);
                                        let numberOfFilesProcessedAux = getNumberOfFilesProcessed();
                                        numberOfFilesProcessedAux += 1;
                                        setNumberOfFilesProcessed(numberOfFilesProcessedAux);
                                        dispatch(setSyncState(("Synced " + numberOfFilesProcessedAux + "/" + totalNumberOfFiles)));
                                        resolve('Finished syncing');
                                    })
                                    .catch((error) => {
                                        console.log("Error at syncing file of type: ", type, error);
                                        reject("Error at syncing file");
                                    })
                            }
                        })
                    } else {
                        reject("The file does not exist")
                    }
                })
                .catch((fileNotExistsError) => {
                    reject(fileNotExistsError);
                })
        } else {
            reject("Path not defined");
        }
    })
}

export function comparePasswords (password, encryptedPassword, callback) {
    bcrypt.compare(password, encryptedPassword, (errorCompare, isMatch) => {
        if (errorCompare) {
            return callback(errorCompare)
        }
        callback(null, isMatch)
    })
}

// Method for extracting the mongo id from the pouch id
// type is the name of the mongo collection: (follow)
export function extractIdFromPouchId (pouchId, type) {
    if (!pouchId.includes(type)) {
        return pouchId
    }
    return pouchId.split('_')[pouchId.split('_').length - 1];
}

export function generateId () {
    return uuid.v4();
}