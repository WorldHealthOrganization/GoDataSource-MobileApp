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
import _ from 'lodash';
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
    // Correct timezone differences
    let date1Time = new Date(date1).getTime();
    date1 = new Date(date1Time + (new Date(date1Time).getTimezoneOffset() * 60 * 1000));
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
    console.log('Event: ', event);
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
                    case '1-add':
                        screenToSwitchTo = "ContactsScreen";
                        addScreen = "ContactsSingleScreen";
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

                if(addScreen) {
                    navigator.resetTo({
                        screen: screenToSwitchTo,
                    })
                    setTimeout(function(){ 
                        navigator.push({
                            screen: addScreen,
                            animated: true,
                            animationType: 'fade',
                            passProps: {
                                isNew: true,
                            }
                        })
                    }, 1500);
                } else {

                    navigator.resetTo({
                        screen: screenToSwitchTo,
                        animated: true
                    });
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

export function unzipFile (source, dest) {
    return new Promise((resolve, reject) => {
        RNFetchBlobFS.exists(source)
            .then((exists) => {
                if (exists) {
                    // Proceed to unzip the file to the specified destination
                    unzip(source, dest)
                        .then((path) => {
                            console.log(`unzip completed at ${path}`);
                            resolve(path);
                        })
                        .catch((error) => {
                            console.log(error);
                            reject(error);
                        })
                } else {
                    return reject('Zip file does not exist');
                }
            })
            .catch((existsError) => {
                reject(('There was an error with getting the zip file: ' + existsError));
            });
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

export function readDir (path) {
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

let numberOfFilesProcessed = 0;

export function setNumberOfFilesProcessed(number) {
    numberOfFilesProcessed = number;
}

export function getNumberOfFilesProcessed() {
    return numberOfFilesProcessed;
}

export async function processFile (path, type, totalNumberOfFiles, dispatch, isFirstTime) {
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
                                if (isFirstTime) {
                                    // If is first time processing files, do a bulk insert
                                    processBulkDocs(data, type)
                                        .then((resultBulk) => {
                                            console.log('Bulk docs: ', resultBulk);
                                            let numberOfFilesProcessedAux = getNumberOfFilesProcessed();
                                            numberOfFilesProcessedAux += 1;
                                            data = null;
                                            setNumberOfFilesProcessed(numberOfFilesProcessedAux);
                                            dispatch(setSyncState(("Synced " + numberOfFilesProcessedAux + "/" + totalNumberOfFiles)));
                                            resolve('Finished inserting');
                                        })
                                        .catch((errorBulk) => {
                                            console.log('Error bulk docs: ', errorBulk);
                                            data = null;
                                            reject(errorBulk);
                                        })
                                } else {
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
                                            data = null;
                                            setNumberOfFilesProcessed(numberOfFilesProcessedAux);
                                            dispatch(setSyncState(("Synced " + numberOfFilesProcessedAux + "/" + totalNumberOfFiles)));
                                            resolve('Finished syncing');
                                        })
                                        .catch((error) => {
                                            console.log("Error at syncing file of type: ", type, error);
                                            data = null;
                                            reject("Error at syncing file");
                                        })
                                }
                            }
                        })


                        // RNFetchBlobFS.readStream(path, 'utf8')
                        //     .then((stream) => {
                        //         let data = '';
                        //         stream.open();
                        //         stream.onData((chunk) => {
                        //             if (chunk.includes('[\n')) {
                        //                 chunk = chunk.substr(2);
                        //             }
                        //             // If the chunk doesn't end in " }", then the previous read object is not finished
                        //             if (!data && chunk.substr(chunk.length -3, 2) !== ' }') {
                        //                 data = chunk;
                        //             } else {
                        //                 if (data && chunk.substr(chunk.length -3, 2) !== ' }') {
                        //
                        //                 }
                        //             }
                        //         });
                        //         stream.onEnd(() => {
                        //             console.log(data)
                        //         });
                        //     })
                        //     .catch((errorReadStream) => {
                        //         console.log('ErrorReadStream: ', errorReadStream);
                        //         reject(errorReadStream);
                        //     })
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
                _id: {
                    $gte: `${fileType}_`,
                    $lte: `${fileType}_\uffff`
                },
                fileType: {$eq: fileType},
                updatedAt: {$gte: lastSyncDate}
            }
        })
            .then((response) => {
                // Now that we have some files, we should recreate the mongo collections
                if (response && response.docs && Array.isArray(response.docs) && response.docs.length > 0) {
                    createFilesWithName(fileType, JSON.stringify(response.docs.map((e) => {
                        delete e._rev;
                        e._id = extractIdFromPouchId(e._id, fileType);
                        // delete e._id;
                        delete e.fileType;
                        return e;
                    })))
                        .then((responseFromCreate) => {
                            database = null;
                            resolve(responseFromCreate);
                        })
                        .catch((errorFromCreate) => {
                            database = null;
                            console.log(`An error occurred while creating file: ${errorFromCreate}`);
                            reject(errorFromCreate);
                        })
                } else {
                    database = null;
                    resolve(`Done with ${fileType}`);
                }
            })
            .catch((error) => {
                database = null;
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
    if (type.includes('referenceData')) {
        return pouchId.substr('referenceData.json_false_'.length)
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
            record.fileType = fileType;
            record.updatedAt = new Date().toISOString();
            record.updatedBy = extractIdFromPouchId(userId, 'user');
            record.deleted = false;
            record.deletedAt = null;
            if (type !== '') {
                record.type = type
            }
            // console.log ('updateRequiredFields create record', JSON.stringify(record))
            return record;

        case 'update':
            //required fields: userId, record
            record.updatedAt = new Date().toISOString();
            record.updatedBy = extractIdFromPouchId(userId, 'user');
            record.deleted = false;
            record.deletedAt = null;
            // console.log ('updateRequiredFields update record', JSON.stringify(record))
            return record;

        case 'delete':
            //required fields: userId, record
            record.updatedAt = new Date().toISOString();
            record.updatedBy = extractIdFromPouchId(userId, 'user');
            record.deleted = true;
            record.deletedAt = new Date().toISOString();
            // console.log ('updateRequiredFields delete record', JSON.stringify(record))
            return record;

        default:
            console.log ('updateRequiredFields default record', JSON.stringify(record));
    }
}

export function createName(type, firstName, lastName) {
    if (type === 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_EVENT') {
        return firstName;
    } else {
        return ((firstName ? (firstName + ' ') : '') + (lastName ? lastName : ''));
    }
}

export function mapLocations(locationList, parentLocationId) {
    let output = []
    for (let obj of locationList) {
        if(obj.parentLocationId === parentLocationId) {
            let children = mapLocations(locationList, extractIdFromPouchId(obj._id, 'location'))

            if (children.length) {
                obj.children = children
            }
            output.push(obj)
        }
    }
    return output
}

//recursively functions for mapping questionCard questions (followUps and Cases)
export function extractAllQuestions (questions, item) {
    let returnedQuestions = [];

    if (questions && Array.isArray(questions) && questions.length > 0) {
        for (let i = 0; i < questions.length; i++) {
            // First add every question
            returnedQuestions.push(questions[i]);
            if (questions[i] && questions[i].answerType && (questions[i].answerType === "LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_SINGLE_ANSWER" || questions[i].answerType === "LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_MULTIPLE_ANSWERS") && questions[i].answers && Array.isArray(questions[i].answers) && questions[i].answers.length > 0) {
                // For every answer check if the user answered that question and then proceed with the showing
                for (let j = 0; j < questions[i].answers.length; j++) {
                    // First check for single select since it has only a value
                    if (questions[i].answerType === "LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_SINGLE_ANSWER" ) {
                        if (item && item.questionnaireAnswers && item.questionnaireAnswers[questions[i].variable] === questions[i].answers[j].value && questions[i].answers[j].additionalQuestions) {
                            returnedQuestions = returnedQuestions.concat(extractAllQuestions(questions[i].answers[j].additionalQuestions, item))
                        }
                    } else {
                        // For the multiple select the answers are in an array of values
                        if (questions[i].answerType === "LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_MULTIPLE_ANSWERS") {
                            if (item && item.questionnaireAnswers && item.questionnaireAnswers[questions[i].variable] && Array.isArray(item.questionnaireAnswers[questions[i].variable]) && item.questionnaireAnswers[questions[i].variable].indexOf(questions[i].answers[j].value) > -1 && questions[i].answers[j].additionalQuestions) {
                                returnedQuestions = returnedQuestions.concat(extractAllQuestions(questions[i].answers[j].additionalQuestions, item))
                            }
                        }
                    }
                }
            }
        }
    }
    return returnedQuestions;
};

export function mapQuestions (questions) {
    // mappedQuestions format: [{categoryName: 'cat1', questions: [{q1}, {q2}]}]
    let mappedQuestions = [];

    if (questions && Array.isArray(questions) && questions.length > 0) {
        for (let i = 0; i < questions.length; i++) {
            if (mappedQuestions.map((e) => {return e.categoryName}).indexOf(questions[i].category) === -1) {
                mappedQuestions.push({categoryName: questions[i].category, questions: [questions[i]]});
            } else {
                if (mappedQuestions && Array.isArray(mappedQuestions) && mappedQuestions.length > 0 && mappedQuestions.map((e) => {
                        return e.categoryName
                    }).indexOf(questions[i].category) > -1 && mappedQuestions[mappedQuestions.map((e) => {
                        return e.categoryName
                    }).indexOf(questions[i].category)] && mappedQuestions[mappedQuestions.map((e) => {
                        return e.categoryName
                    }).indexOf(questions[i].category)].questions && Array.isArray(mappedQuestions[mappedQuestions.map((e) => {
                        return e.categoryName
                    }).indexOf(questions[i].category)].questions)) {
                        mappedQuestions[mappedQuestions.map((e) => {return e.categoryName}).indexOf(questions[i].category)].questions.push(questions[i]);
                }
            }
        }
    }

    // console.log('Mapped questions: ', mappedQuestions);

    return mappedQuestions;
};

export function localSortContactsForFollowUps (contactsCopy, propsFilter, stateFilter, filterFromFilterScreen) {
    if (propsFilter && (propsFilter['FollowUpsFilterScreen'] || propsFilter['FollowUpsScreen'])) {
        // Take care of search filter
        if (stateFilter.searchText) {
            contactsCopy = contactsCopy.filter((e) => {
                return  e && e.firstName && stateFilter.searchText.toLowerCase().includes(e.firstName.toLowerCase()) ||
                    e && e.lastName && stateFilter.searchText.toLowerCase().includes(e.lastName.toLowerCase()) ||
                    e && e.firstName && e.firstName.toLowerCase().includes(stateFilter.searchText.toLowerCase()) ||
                    e && e.lastName && e.lastName.toLowerCase().includes(stateFilter.searchText.toLowerCase())
            });
        }
        // Take care of gender filter
        if (filterFromFilterScreen && filterFromFilterScreen.gender) {
            contactsCopy = contactsCopy.filter((e) => {return e.gender === filterFromFilterScreen.gender});
        }
        // Take care of age range filter
        if (filterFromFilterScreen && filterFromFilterScreen.age && Array.isArray(filterFromFilterScreen.age) && filterFromFilterScreen.age.length === 2 && (filterFromFilterScreen.age[0] >= 0 || filterFromFilterScreen.age[1] <= 150)) {
            contactsCopy = contactsCopy.filter((e) => {
                if (e.age && e.age.years !== null && e.age.years !== undefined && e.age.months !== null && e.age.months !== undefined) {
                    if (e.age.years > 0 && e.age.months === 0) {
                        return e.age.years >= filterFromFilterScreen.age[0] && e.age.years <= filterFromFilterScreen.age[1]
                    } else if (e.age.years === 0 && e.age.months > 0){
                        return e.age.months >= filterFromFilterScreen.age[0] && e.age.months <= filterFromFilterScreen.age[1]
                    } else if (e.age.years === 0 && e.age.months === 0) {
                        return e.age.years >= filterFromFilterScreen.age[0] && e.age.years <= filterFromFilterScreen.age[1]
                    }
                }
            });
        }
        // Take care of locations filter
        if (filterFromFilterScreen  && filterFromFilterScreen.selectedLocations && filterFromFilterScreen.selectedLocations.length > 0) {
            contactsCopy = contactsCopy.filter((e) => {
                let addresses = e.addresses.filter((k) => {
                    return k.locationId !== '' && filterFromFilterScreen.selectedLocations.indexOf(k.locationId) >= 0
                })
                return addresses.length > 0
            })
        }
        //Take care of sort
        if (filterFromFilterScreen  && filterFromFilterScreen.sort && filterFromFilterScreen.sort.length > 0) {
            let sortCriteria = []
            let sortOrder = []
            for(let i = 0; i < filterFromFilterScreen.sort.length; i++) {
                if (filterFromFilterScreen.sort[i].sortCriteria && filterFromFilterScreen.sort[i].sortCriteria !== '' && filterFromFilterScreen.sort[i].sortOrder && filterFromFilterScreen.sort[i].sortOrder !== ''){
                    sortCriteria.push(filterFromFilterScreen.sort[i].sortCriteria)
                    sortOrder.push(filterFromFilterScreen.sort[i].sortOrder === 'LNG_SIDE_FILTERS_SORT_BY_ASC_PLACEHOLDER' ? false : true)
                }
            }
            if (sortCriteria.length > 0 && sortOrder.length > 0) {
                if (sortOrder.length === 1) {
                    contactsCopy = objSort(contactsCopy, [sortCriteria[0], sortOrder[0]])
                } else if (sortOrder.length === 2) {
                    contactsCopy = objSort(contactsCopy, [sortCriteria[0], sortOrder[0]], [sortCriteria[1], sortOrder[1]])
                }
            }
        }
    }
    return contactsCopy
}

export function objSort() {
    var args = arguments,
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

            if (case_sensitive === false && typeof a === 'string') {
                a = a !== undefined && a.trim().length > 0 ? a.toLowerCase() : '~'; // place caracters that does not have property or has it but is '' at the end of array
                b = b !== undefined && b.trim().length > 0 ? b.toLowerCase() : '~'; // place caracters that does not have property or has it but is '' at the end of array
                //null if wanted at the start of array
            }

            if (! desc) {
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
