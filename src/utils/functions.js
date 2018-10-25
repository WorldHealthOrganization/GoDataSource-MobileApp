/**
 * Created by florinpopa on 14/06/2018.
 */
import errorTypes from './errorTypes';
import config from './config';
import RNFetchBlobFS from 'rn-fetch-blob/fs';
import {zip, unzip} from 'react-native-zip-archive';
import {updateFileInDatabase, processBulkDocs} from './../queries/database';
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
                        addScreen = "CaseSingleScreen";
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
        // console.log('PErsons: ', persons);
        for (let j=0; j<persons.length; j++) {
            if ((persons[j].type === 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE' || persons[j].type === 'case') && cases && Array.isArray(cases)) {
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

    // console.log('Relationship array: ', relationshipArray);

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
                                console.log("Error while reading file: ", type);
                                reject("Error while reading file");
                            }
                            if (data) {



                                // processBulkDocs(data, type)
                                //     .then((resultBulk) => {
                                //         console.log('Bulk docs: ', resultBulk);
                                //         resolve('Finished inserting');
                                //     })
                                //     .catch((errorBulk) => {
                                //         console.log('Error bulk docs: ', errorBulk);
                                //         reject(errorBulk);
                                //     })


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

export function getDataFromDatabaseFromFile (database, fileType, lastSyncDate) {
    return new Promise((resolve, reject) => {
        database.find({
            selector: {
                fileType: {$in: [fileType]},
                updatedAt: {$gte: lastSyncDate}
            }
        })
            .then((response) => {
                // Now that we have some files, we should recreate the mongo collections
                if (response && response.docs && Array.isArray(response.docs) && response.docs.length > 0) {
                    createFilesWithName(fileType, JSON.stringify(response.docs.map((e) => {
                        delete e._rev;
                        e.id = extractIdFromPouchId(e._id, fileType);
                        delete e._id;
                        delete e.fileType;
                        return e;
                    })))
                        .then((responseFromCreate) => {
                            resolve(responseFromCreate);
                        })
                        .catch((errorFromCreate) => {
                            console.log(`An error occurred while creating file: ${errorFromCreate}`);
                            reject(errorFromCreate);
                        })
                } else {
                    resolve(`Done with ${fileType}`);
                }
            })
            .catch((error) => {
                console.log(`An error occurred while getting data for collection: ${fileType}`);
                reject(error);
            })
    })
}

export function createFilesWithName (fileName, data) {
    return new Promise((resolve, reject) => {
        // First check if the directory exists
        RNFetchBlobFS.exists(RNFetchBlobFS.dirs.DocumentDir + '/who_files')
            .then((exists) => {
                if (exists) {
                    // If the file exists, proceed to check if the file exists
                    RNFetchBlobFS.exists(`${RNFetchBlobFS.dirs.DocumentDir}/who_files/${fileName}`)
                        .then((exists) => {
                            if (exists) {
                                RNFetchBlobFS.writeFile(`${RNFetchBlobFS.dirs.DocumentDir}/who_files/${fileName}`, data, 'utf8')
                                    .then(() => {
                                        resolve(`Done with file ${fileName}`);
                                    })
                                    .catch((errorWriteFile) => {
                                        console.log(`Error while writing to file: ${fileName}`, errorWriteFile);
                                        reject(errorWriteFile);
                                    })
                            } else {
                                // If the file does not exist, create it
                                RNFetchBlobFS.createFile(`${RNFetchBlobFS.dirs.DocumentDir}/who_files/${fileName}`, data, "utf8")
                                    .then(() => {
                                        resolve(`Done with ${fileName}`);
                                    })
                                    .catch((errorCreateFile) => {
                                        console.log(`An error occurred while creating file: ${errorCreateFile}`, errorCreateFile);
                                        reject(errorCreateFile);
                                    })
                            }
                        })
                        .catch((errorFileExists) => {
                            console.log('An error occurred while trying to see if file exists: ', fileName, errorFileExists);
                            reject(errorFileExists);
                        })
                } else {
                    // Create the directory
                    RNFetchBlobFS.mkdir(RNFetchBlobFS.dirs.DocumentDir + '/who_files')
                        .then(() => {
                            // Since the directory was created just now, we don't have to test if the file exists
                            RNFetchBlobFS.createFile(RNFetchBlobFS.dirs.DocumentDir + '/who_files/' + fileName, data, "utf8")
                                .then(() => {
                                    resolve(`Done with ${fileName}`)
                                })
                                .catch((errorCreateFile) => {
                                    console.log("An error occurred while creating file: ", fileName, errorCreateFile);
                                    reject(errorCreateFile);
                                })
                        })
                        .catch((errorCreateDir) => {
                            console.log('An error occurred while creating directory: ', errorCreateDir);
                            reject(errorCreateDir);
                        })
                }
            })
            .catch((errorExists) => {
                console.log("An error occurred while getting if the root directory exists: ", errorExists);
                reject(errorExists)
            })
    })
}

export function createZipFileAtPath (source, target, callback) {
    // We don't need to check for archives with the same name, since the zip function overwrites the previous archive
    zip(source, target)
        .then((path) => {
            console.log('Zip file created at path: ', path);
            callback(null, path);
        })
        .catch((errorCreateZip) => {
            console.log('Error while creating zip file: ', errorCreateZip);
            callback(errorCreateZip);
        })
}

// Method for extracting the mongo id from the pouch id
// type is the name of the mongo collection: (follow)
export function extractIdFromPouchId (pouchId, type) {
    if (!pouchId) {
        return null;
    }
    if (!pouchId.includes(type)) {
        return pouchId
    }
    return pouchId.split('_')[pouchId.split('_').length - 1];
}

export function computeIdForFileType (fileType, outbreakId, file, type) {
    switch (fileType) {
        case 'person.json':
            return (fileType + '_' + type + '_false' + '_' + outbreakId + '_' + generateId());
        case 'followUp.json':
            return (fileType + '_false_' + outbreakId + '_' + new Date(file.date).getTime() + '_' + generateId());
        // return (type + '_' + file.outbreakId + '_' + file._id);
        case 'relationship.json':
            return (fileType + '_false_' + outbreakId + '_' + generateId());
        default:
            return (fileType + '_false_' + generateId());
    }
}

export function generateId () {
    return uuid.v4();
}

export function mapContactsAndRelationships(contacts, relationships) {
    console.log ('mapContactsAndRelationships')
    // console.log ('mapContactsAndRelationships contacts', JSON.stringify(contacts))
    // console.log ('mapContactsAndRelationships relationships', JSON.stringify(relationships))

    let mappedContacts = contacts;
    for (let i = 0; i < relationships.length; i++) {
        let contactObject = {};
        if ((relationships[i].persons[0].type === 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT' || relationships[i].persons[0].type === 'contact') && mappedContacts.map((e) => {
                return extractIdFromPouchId(e._id, 'person')
            }).indexOf(relationships[i].persons[0].id) > -1) {
                
            contactObject = Object.assign({}, contacts[contacts.map((e) => {
                return extractIdFromPouchId(e._id, 'person')
            }).indexOf(relationships[i].persons[0].id)]);

            if (!contactObject.relationships || contactObject.relationships.length === 0) {
                contactObject.relationships = [];
            }
            contactObject.relationships.push(relationships[i]);
            mappedContacts[mappedContacts.map((e) => {
                return extractIdFromPouchId(e._id, 'person')
            }).indexOf(relationships[i].persons[0].id)] = contactObject;
        } else {
            if ((relationships[i].persons[1].type === 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT' || relationships[i].persons[1].type === 'contact') && mappedContacts.map((e) => {
                    return extractIdFromPouchId(e._id, 'person')
                }).indexOf(relationships[i].persons[1].id) > -1) {

                contactObject = Object.assign({}, contacts[contacts.map((e) => {
                    return extractIdFromPouchId(e._id, 'person')
                }).indexOf(relationships[i].persons[1].id)]);

                if (!contactObject.relationships || contactObject.relationships.length === 0) {
                    contactObject.relationships = [];
                }
                contactObject.relationships.push(relationships[i]);
                mappedContacts[mappedContacts.map((e) => {
                    return extractIdFromPouchId(e._id, 'person')
                }).indexOf(relationships[i].persons[1].id)] = contactObject;
            }
        }
    }

    // console.log ('mapContactsAndRelationships mappedContacts', JSON.stringify(mappedContacts))
    return mappedContacts;
}

export function mapContactsAndFollowUps(contacts, followUps) {
    console.log ('mapContactsAndFollowUps')
    // console.log ('mapContactsAndFollowUps contacts', JSON.stringify(contacts))
    // console.log ('mapContactsAndFollowUps followUps', JSON.stringify(followUps))
    
    let mappedContacts = [];
    for (let i=0; i < followUps.length; i++) {
        if (mappedContacts.map((e) => { return extractIdFromPouchId(e._id, 'person') }).indexOf(followUps[i].personId) === -1) {
            let contactObject = {};
            contactObject = Object.assign({}, contacts[contacts.map((e) => {return extractIdFromPouchId(e._id, 'person')}).indexOf(followUps[i].personId)]);
            contactObject.followUps = [];
            contactObject.followUps.push(followUps[i]);
            mappedContacts.push(contactObject);
        } else {
            mappedContacts[mappedContacts.map((e) => {return extractIdFromPouchId(e._id, 'person')}).indexOf(followUps[i].personId)].followUps.push(followUps[i]);
        }
    }
    // console.log ('mapContactsAndFollowUps mappedContacts', JSON.stringify(mappedContacts))
    return mappedContacts.filter((e) => {return e._id !== undefined && e._id});
}

export function updateRequiredFields(outbreakId, userId, record, action, fileType = '', type = '') {

    // console.log ('updateRequiredFields ', record, action)
    switch (action) {
        case 'create':
            record._id = computeIdForFileType(fileType, outbreakId, record, type);
            record.fileType = fileType
            record.updatedAt = new Date().toISOString()
            record.updatedBy = extractIdFromPouchId(userId, 'user')
            record.deleted = false
            record.deletedAt = 'undefined'
            if (type !== '') {
                record.type = type
            }
            // console.log ('updateRequiredFields create record', JSON.stringify(record))
            return record

        case 'update':
            //required fields: userId, record
            record.updatedAt = new Date().toISOString()
            record.updatedBy = extractIdFromPouchId(userId, 'user')
            record.deleted = false
            record.deletedAt = 'undefined'
            // console.log ('updateRequiredFields update record', JSON.stringify(record))
            return record;

        case 'delete':
            //required fields: userId, record
            record.updatedAt = new Date().toISOString()
            record.updatedBy = extractIdFromPouchId(userId, 'user')
            record.deleted = true
            record.deletedAt = new Date().toISOString()
            // console.log ('updateRequiredFields delete record', JSON.stringify(record))
            return record;

        default: 
            console.log ('updateRequiredFields default record', JSON.stringify(record))
    }
}

export function createName(type, firstName, lastName) {
    if (type === 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_EVENT') {
        return firstName;
    } else {
        return ((firstName ? (firstName + ' ') : '') + (lastName ? lastName : ''));
    }
}