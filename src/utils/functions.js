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
import defaultTranslations from './defaultTranslations'
import {getContactsForOutbreakId} from './../actions/contacts';
import {getSyncEncryptPassword, encrypt, decrypt} from './../utils/encryption';
import RNFS from 'react-native-fs';
import {Buffer} from 'buffer';


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
                    case 'help':
                        screenToSwitchTo = "HelpScreen";
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
                            // animated: true,
                            // animationType: 'fade',
                            passProps: {
                                isNew: true,
                            }
                        })
                    }, 1500);
                } else {

                    navigator.resetTo({
                        screen: screenToSwitchTo,
                        // animated: true
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

export function unzipFile (source, dest, password, clientCredentials) {
    console.log('Stuff: ', source, dest, password, clientCredentials);
        return new Promise((resolve, reject) => {
            RNFetchBlobFS.exists(source)
                .then((exists) => {
                    if (exists) {
                        // If the encrypted file exists, compute its size, and decrypt it
                        // RNFS.stat(source)
                        //     .then((RNFSStatResponse) => {
                                // Call decryptFile(filePath, fileSize, callback)

                        unzip(source, dest)
                            .then((path) => {
                                console.log(`unzip completed at ${path}`);
                                // Delete the zip file after unzipping
                                RNFetchBlobFS.unlink(source)
                                    .then(() => {
                                        resolve(path);
                                    })
                                    .catch((errorDelete) => {
                                        console.log('Error delete: ', errorDelete);
                                        resolve(path);
                                    })
                            })
                            .catch((error) => {
                                console.log(error);
                                // Delete the zip file after unzipping
                                RNFetchBlobFS.unlink(source)
                                    .then(() => {
                                        reject(error);
                                    })
                                    .catch((errorDelete) => {
                                        console.log('Error delete: ', errorDelete);
                                        reject(error);
                                    });
                            })
                            // })
                            // .catch((RNFSStatError) => {
                            //     console.log('An error occurred while getting encrypted file status: ', RNFSStatError);
                            //     reject(RNFSStatError);
                            // })




                        // Read file as stream, decrypt the chunks and append them to the new zip
            // let password = getSyncEncryptPassword(password, clientCredentials);
            // let numberOfChunks = 0;
            // RNFetchBlobFS.readStream(source, 'base64', 131072, 10)
            //     .then((stream) => {
            //         stream.open();
            //         let iv = '';
            //         let salt = '';
            //         stream.onData((chunk) => {
            //             if (chunk) {
            //                 console.log('Chunk length: ', chunk.length);
            //                 if (numberOfChunks === 0) {
            //                     let buffer = Buffer.from(chunk, 'base64');
            //                     // read IV
            //                     iv = buffer.slice(0, 16);
            //                     // read salt
            //                     salt = buffer.slice(16, 16 + 8);
            //                     console.log('Time to create iv and salt: ', iv, salt);
            //                 }
            //                 decrypt(password, chunk, iv, salt, numberOfChunks)
            //                     .then((decryptedChunk) => {
            //                         RNFetchBlobFS.appendFile(`${source}.zip`, decryptedChunk, 'base64')
            //                             .then(() => {
            //                                 console.log('Appended chunk');
            //                                 numberOfChunks++;
            //                                 if (chunk.length < 174764) {
            //                                     // this means that we are at the last chunk and should unzip
            //                                     unzip(`${source}.zip`, dest)
            //                                         .then((path) => {
            //                                             console.log(`unzip completed at ${path}`);
            //                                             resolve(path);
            //                                         })
            //                                         .catch((error) => {
            //                                             console.log(error);
            //                                             reject(error);
            //                                         })
            //                                 } else {
            //                                     chunk = null;
            //                                 }
            //                             })
            //                             .catch((errorAppend) => {
            //                                 console.log("Error at appending file: ", errorAppend)
            //                             })
            //                     })
            //                     .catch((errorDecryptChunk) => {
            //                         console.log('Error at decrypting chunk: ', errorDecryptChunk);
            //                     })
            //             } else {
            //                 console.log('Not chunk: ')
            //             }
            //         });
            //         stream.onEnd(() => {
            //             // After all the decryption is done, try unzipping the file
            //             console.log("Finished returning all events from read stream. Number of chunks: ", numberOfChunks, numberOfChunks * 131072);
            //         });
            //     })

                        // First get the raw file in order to decrypt it
                        // readRawFile(source, (errorRawFile, rawFile) => {
                        //     if (errorRawFile) {
                        //         return callback('Error while reading raw file');
                        //     }
                        //     if (rawFile) {
                        //         // Decrypt the raw file
                        //         // Compute password
                        //         let password = getSyncEncryptPassword(password, clientCredentials);
                        //         decrypt(password, rawFile)
                        //             .then((decryptedFile) => {
                        //                 // Now that we have the decrypted zip file, it's time to write it on disk
                        //                 writeFile(source + '.zip', decryptedFile, (errorWriteFile, pathToZip) => {
                        //                     if (errorWriteFile) {
                        //                         callback(errorWriteFile);
                        //                     }
                        //                     if (pathToZip) {
                        //                         // Proceed to unzip the file to the specified destination
                        //                         unzip(pathToZip, dest)
                        //                             .then((path) => {
                        //                                 console.log(`unzip completed at ${path}`);
                        //                                 callback(null, path);
                        //                             })
                        //                             .catch((error) => {
                        //                                 console.log(error);
                        //                                 callback(error);
                        //                             })
                        //                     }
                        //                 })
                        //             })
                        //             .catch((errorDecryptedFile) => {
                        //                 console.log('Error while decrypting file: ', errorDecryptedFile);
                        //                 callback(errorDecryptedFile);
                        //             })
                        //     }
                        // })
                    } else {
                        reject('Zip file does not exist');
                    }
                })
                .catch((existsError) => {
                    reject(('There was an error with getting the zip file: ' + existsError));
                });
        })

}

async function decryptFile(filePath, password, fileSize) {
    let numberOfBytes = 524288;
    let numberOfIterations = Math.floor(fileSize / numberOfBytes);
    let remainder = fileSize % numberOfBytes;
    let iv = null;
    let salt = null;

    for (let i = 0; i < numberOfIterations; i++) {
        try {
            console.log(`Iteration ${i}/${numberOfIterations}`);
            console.log(`Read from ${i === 0 ? 0 : (i * numberOfBytes)}, ${i === numberOfIterations - 1 ? remainder : numberOfBytes} number of bytes`);
            let encryptedString = await RNFS.read(filePath, i === numberOfIterations - 1 ? remainder : numberOfBytes, i === 0 ? 0 : (i * numberOfBytes), 'base64');
            if (encryptedString) {
                console.log('Encrypted string length: ', encryptedString.length, encryptedString);
                try {
                    if (i === 0){
                            let buffer = await Buffer.from(encryptedString, 'base64');
                            // read IV
                            iv = buffer.slice(0, 16);
                            // read salt
                            salt = buffer.slice(16, 16 + 8);
                            console.log('Time to create iv and salt: ', iv, salt);
                    }
                    let decryptedString = await decrypt(password, encryptedString, iv, salt, i);
                    if (decryptedString) {
                        console.log('Decrypted string length: ', decryptedString.length, decryptedString);
                        try {
                            let appendedNumberOfBytes = await RNFetchBlobFS.appendFile(`${filePath}.zip`, decryptedString, 'base64');
                            if (appendedNumberOfBytes > 0) {
                                console.log(`Appended ${appendedNumberOfBytes} bytes i=${i}`);
                                encryptedString = null;
                                decryptedString = null;
                                appendedNumberOfBytes = null;
                            } else {
                                console.log('Could not append file');
                                return Promise.reject('Could not append file');
                            }
                        } catch (errorAppendFile) {
                            console.log('Error while appending file: ', errorAppendFile);
                            return Promise.reject(errorAppendFile);
                        }
                    } else {
                        console.log('Could not decrypt');
                        return Promise.reject('Could not decrypt')
                    }
                } catch (errorDecrypt) {
                    console.log('Error while decrypting: ', errorDecrypt);
                    return Promise.reject(errorDecrypt);
                }
            } else {
                console.log('No encrypted string found');
                return Promise.reject('No encrypted string found');
            }
        } catch (errorReadEncryptedString) {
            console.log('Error while reading stream: ', errorReadEncryptedString);
            return Promise.reject(errorReadEncryptedString);
        }
    }

    return Promise.resolve(`${filePath}.zip`);
}

export function readRawFile (path, callback) {
    RNFetchBlobFS.readFile(path, 'base64')
        .then((data) => {
            callback(null, data);
        })
        .catch((errorReadFile) => {
            console.log("Error while reading the file: ", errorReadFile);
            callback(errorReadFile)
        })
}

export function writeFile (path, content, callback) {
    RNFetchBlobFS.writeFile(path, content, 'base64')
        .then(() => {
            callback(null, path);
        })
        .catch((errorWriteFile) => {
            console.log('Error while writing file: ', errorWriteFile);
            callback(errorWriteFile);
        })
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


// hubConfig = {name, url, clientId, clientSecret, encryptDatabase}
export async function processFile (path, type, totalNumberOfFiles, dispatch, isFirstTime, forceBulk, encryptedData, hubConfig) {
    return new Promise((resolve, reject) => {
        if (path) {
            console.log('Process file: ', type, ' From path: ', path);
            RNFetchBlobFS.exists(path)
                .then((exists) => {
                    if (exists) {
                        // File exists, time to read it in order to process
                        if (encryptedData) {
                            // If the file is encrypted, read it raw, decrypt it, unzip it, and then process the data
                            readRawFile(path, (errorEncryptedFile, encryptedData) => {
                                if (errorEncryptedFile) {
                                    console.log("Error while reading file: ", type, errorEncryptedFile);
                                    reject("Error while reading file");
                                }
                                if (encryptedData) {
                                    let password = getSyncEncryptPassword(null, hubConfig);
                                    let startTimeDecrypt = new Date().getTime();
                                    decrypt(password, encryptedData)
                                        .then((decryptedData) => {
                                            console.log(`Time for decrypting file: ${type}: ${new Date().getTime() - startTimeDecrypt}`);
                                            encryptedData = null;
                                            // Decrypted data is a zip file that needs first to be written to disk
                                            RNFetchBlobFS.writeFile(`${path}`, decryptedData, 'base64')
                                                .then((bytesWritten) => {
                                                    // Now unzip the data
                                                    let fileName = path.split('/')[path.split('/').length - 1];
                                                    let unzipLocation = path.substr(0, (path.length - fileName.length));
                                                    unzip(`${path}`, `${unzipLocation}`)
                                                        .then((unzipPath) => {
                                                            readFile(`${unzipPath}/${fileName.substring(0, fileName.length - 4)}`, (error, data) => {
                                                                if (error) {
                                                                    console.log("Error while reading file: ", type);
                                                                    reject("Error while reading file");
                                                                }
                                                                if (data) {
                                                                    if (isFirstTime && forceBulk) {
                                                                        // If is first time processing files, do a bulk insert
                                                                        processBulkDocs(data, type)
                                                                            .then((resultBulk) => {
                                                                                console.log('Bulk docs: ', resultBulk);
                                                                                let numberOfFilesProcessedAux = getNumberOfFilesProcessed();
                                                                                numberOfFilesProcessedAux += 1;
                                                                                data = null;
                                                                                setNumberOfFilesProcessed(numberOfFilesProcessedAux);
                                                                                dispatch(setSyncState(({id: 'sync', name: 'Syncing', status: numberOfFilesProcessedAux + "/" + totalNumberOfFiles})));
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
                                                                                promises = null;
                                                                                setNumberOfFilesProcessed(numberOfFilesProcessedAux);
                                                                                dispatch(setSyncState(({id: 'sync', name: 'Syncing', status: numberOfFilesProcessedAux + "/" + totalNumberOfFiles})));
                                                                                resolve('Finished syncing');
                                                                            })
                                                                            .catch((error) => {
                                                                                console.log("Error at syncing file of type: ", type, error);
                                                                                data = null;
                                                                                promises = null;
                                                                                reject("Error at syncing file");
                                                                            })
                                                                    }
                                                                }
                                                            })
                                                        })
                                                        .catch((errorUnzipFile) => {
                                                            console.log(`Error while unzipping file ${type}: ${errorUnzipFile}`);
                                                            reject('Error while unzipping file');
                                                        })
                                                })
                                                .catch((errorWriteBytes) => {
                                                    console.log("Error while creating inner zip: ", type, errorWriteBytes);
                                                    reject("Error while creating inner zip");
                                                })
                                        })
                                        .catch((errorDecryptingData) => {
                                            console.log('Error while decrypting data: ', type, errorDecryptingData);
                                            reject('Error while decrypting file');
                                        })
                                }
                            })
                        } else {
                            let fileName = path.split('/')[path.split('/').length - 1];
                            let unzipLocation = path.substr(0, (path.length - fileName.length));

                            unzip(`${path}`, `${unzipLocation}`)
                                .then((unzipPath) => {
                                    readFile(`${unzipPath}/${fileName.substring(0, fileName.length - 4)}`, (error, data) => {
                                        if (error) {
                                            console.log("Error while reading file: ", type);
                                            reject("Error while reading file");
                                        }
                                        if (data) {
                                            if (isFirstTime && forceBulk) {
                                                // If is first time processing files, do a bulk insert
                                                processBulkDocs(data, type)
                                                    .then((resultBulk) => {
                                                        console.log('Bulk docs: ', resultBulk);
                                                        let numberOfFilesProcessedAux = getNumberOfFilesProcessed();
                                                        numberOfFilesProcessedAux += 1;
                                                        data = null;
                                                        setNumberOfFilesProcessed(numberOfFilesProcessedAux);
                                                        dispatch(setSyncState(({id: 'sync', name: 'Syncing', status: numberOfFilesProcessedAux + "/" + totalNumberOfFiles})));
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
                                                        promises = null;
                                                        numberOfFilesProcessedAux += 1;
                                                        data = null;
                                                        setNumberOfFilesProcessed(numberOfFilesProcessedAux);
                                                        dispatch(setSyncState(({id: 'sync', name: 'Syncing', status: numberOfFilesProcessedAux + "/" + totalNumberOfFiles})));
                                                        resolve('Finished syncing');
                                                    })
                                                    .catch((error) => {
                                                        console.log("Error at syncing file of type: ", type, error);
                                                        data = null;
                                                        promises = null;
                                                        reject("Error at syncing file");
                                                    })
                                            }
                                        }
                                    })
                                })
                                .catch((errorUnzipFile) => {
                                    console.log(`Error while unzipping file ${type}: ${errorUnzipFile}`);
                                    reject('Error while unzipping file');
                                })
                        }

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

function extractFromDatabase(database, fileType, lastSyncDate, startKey) {
    return new Promise((resolve, reject) => {
        if(startKey) {
            database.find({
                selector: {
                    _id: {
                        $gte: `${fileType}_`,
                        $lte: `${fileType}_\uffff`
                    },
                    fileType: {$eq: fileType},
                    updatedAt: {$gte: lastSyncDate}
                },
                limit: 1000
            })
                .then((response) => {
                    resolve(response.docs);
                })
                .catch((error) => {
                    console.log('Error while getting data: ', error);
                    reject(error);
                })
        } else {
            database.find({
                selector: {
                    _id: {
                        $gte: `${startKey}`,
                        $lte: `${fileType}_\uffff`
                    },
                    fileType: {$eq: fileType},
                    updatedAt: {$gte: lastSyncDate}
                },
                limit: 1000
            })
                .then((response) => {
                    resolve(response.docs);
                })
                .catch((error) => {
                    console.log('Error while getting data: ', error);
                    reject(error);
                })
        }
    })
}

export function getDataFromDatabaseFromFile (database, fileType, lastSyncDate, password) {
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
                // If there are more than 1000 collections split in chunks of 1000 records
                let responseArray = response.docs.map((e) => {
                    delete e._rev;
                    e._id = extractIdFromPouchId(e._id, fileType);
                    // delete e._id;
                    delete e.fileType;
                    return e;
                });
                if (responseArray && Array.isArray(responseArray) && responseArray.length > 0) {
                    createFilesWithName(fileType, responseArray, password)
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
                    resolve(`No data to send`);
                }
            })
            .catch((error) => {
                database = null;
                console.log(`An error occurred while getting data for collection: ${fileType}`);
                reject(error);
            })
    })


    // try {
    //     let dataFromDb = await extractFromDatabase(database, fileType, lastSyncDate);
    //     if (dataFromDb && Array.isArray(dataFromDb)) {
    //         if (dataFromDb.length === 1000) {
    //
    //         } else {
    //             createFilesWithName(fileType, JSON.stringify(dataFromDb), password)
    //                 .then((responseFromCreate) => {
    //                     database = null;
    //                     return Promise.resolve(responseFromCreate);
    //                 })
    //                 .catch((errorFromCreate) => {
    //                     database = null;
    //                     console.log(`An error occurred while creating file: ${errorFromCreate}`);
    //                     return Promise.reject(errorFromCreate);
    //                 })
    //         }
    //     } else {
    //         console.log(`Error while extracting first time from the database. fileType: ${fileType}, errorExtractFromDb: ${errorExtractFromDb}`);
    //         return Promise.reject(`Error while extracting first time from the database`);
    //     }
    // } catch(errorExtractFromDb) {
    //     console.log(`Error while extracting first time from the database. fileType: ${fileType}, errorExtractFromDb: ${errorExtractFromDb}`);
    //     return Promise.reject(errorExtractFromDb);
    // }
}

function writeOperations (collectionName, index, data, password, jsonPath) {
    return new Promise((resolve, reject) => {
        RNFetchBlobFS.createFile(jsonPath, JSON.stringify(data), 'utf8')
            .then((writtenBytes) => {
                // After creating the json file, is time to create the zip
                zip(jsonPath, `${jsonPath}.zip`)
                    .then((zipPath) => {
                        // After creating the zip file, delete the .json file and proceed to encrypt the zip file
                        // First we have to read the base64 file
                        RNFetchBlobFS.unlink(jsonPath)
                            .then(() => {
                                // If the password is null, then don't encrypt data
                                if (password) {
                                    RNFetchBlobFS.readFile(zipPath, 'base64')
                                        .then((rawZipFile) => {
                                            // Encrypt the file and overwrite the previous zip file
                                            encrypt(password, rawZipFile)
                                                .then((encryptedData) => {
                                                    RNFetchBlobFS.writeFile(zipPath, encryptedData, 'base64')
                                                        .then((writtenEncryptedData) => {
                                                            console.log(`Finished creating file: ${collectionName}, index: ${index}, writtenEncryptedData: ${writtenEncryptedData}`);
                                                            resolve('Finished creating file')
                                                        })
                                                        .catch((errorWrittenEncryptedData) => {
                                                            console.log(`createFileWithIndex collectionName: ${collectionName}, index: ${index}, error: ${errorWrittenEncryptedData}`);
                                                            reject(errorWrittenEncryptedData);
                                                        })
                                                })
                                                .catch((errorEncryptedData) => {
                                                    console.log(`createFileWithIndex collectionName: ${collectionName}, index: ${index}, error: ${errorEncryptedData}`);
                                                    reject(errorEncryptedData);
                                                })
                                        })
                                        .catch((errorRawZipFile) => {
                                            console.log(`writeOperations collectionName: ${collectionName}, index: ${index}, error: ${errorRawZipFile}`);
                                            reject(errorRawZipFile);
                                        })
                                } else {
                                    resolve('Success');
                                }
                            })
                            .catch((errorDeleteJsonFile) => {
                                console.log(`writeOperations collectionName: ${collectionName}, index: ${index}, error: ${errorDeleteJsonFile}`);
                                reject(errorDeleteJsonFile);
                            });
                    })
                    .catch((zipPathError) => {
                        console.log(`writeOperations collectionName: ${collectionName}, index: ${index}, error: ${zipPathError}`);
                        reject(zipPathError);
                    })
            })
            .catch((errorWriteBytes) => {
                console.log(`writeOperations collectionName: ${collectionName}, index: ${index}, error: ${errorWriteBytes}`);
                reject(errorWriteBytes);
            })
    });
};

// This method creates the json file, archives it and encrypts it
export function createFileWithIndex (collectionName, index, data, password) {
    return new Promise((resolve, reject) => {
        let jsonPath = `${RNFetchBlobFS.dirs.DocumentDir}/who_files/${collectionName.split('.')[0]}.${index}.json`;
        // Check if the file exists. If it exists, delete and recreate it, else continue

        RNFetchBlobFS.exists(jsonPath)
            .then((exists) => {
                if (exists) {
                    // Delete the file
                    RNFetchBlobFS.unlink(jsonPath)
                        .then(() => {
                            writeOperations(collectionName, index, data, password, jsonPath)
                                .then((result) => {
                                    resolve('Success')
                                })
                                .catch((errorWriteOperations) => {
                                    console.log(`Error write operations: method: createFileWithIndex collectionName: ${collectionName} index: ${index} error: ${JSON.stringify(errorWriteOperations)}`);
                                    reject(errorWriteOperations)
                                })
                        })
                        .catch((errorDeleteFile) => {
                            console.log(`Error delete existing file: method: createFileWithIndex collectionName: ${collectionName} index: ${index} error: ${JSON.stringify(errorDeleteFile)}`);
                            reject(errorDeleteFile);
                        })
                } else {
                    writeOperations(collectionName, index, data, password, jsonPath)
                        .then((result) => {
                            resolve('Success')
                        })
                        .catch((errorWriteOperations) => {
                            console.log(`Error write operations: method: createFileWithIndex collectionName: ${collectionName} index: ${index} error: ${JSON.stringify(errorWriteOperations)}`);
                            reject(errorWriteOperations)
                        })
                }
            })
            .catch((errorFileExists) => {
                console.log(`Error file exists: method: createFileWithIndex collectionName: ${collectionName} index: ${index} error: ${JSON.stringify(errorFileExists)}`);
                writeOperations(collectionName, index, data, password, jsonPath)
                    .then((result) => {
                        resolve('Success')
                    })
                    .catch((errorWriteOperations) => {
                        console.log(`Error write operations: method: createFileWithIndex collectionName: ${collectionName} index: ${index} error: ${JSON.stringify(errorWriteOperations)}`);
                        reject(errorWriteOperations)
                    })
            })
    })
}

export async function createFilesWithName (fileName, data, password) {
    // return new Promise((resolve, reject) => {
    // First check if the directory exists
    try {
        let exists = await RNFetchBlobFS.exists(RNFetchBlobFS.dirs.DocumentDir + '/who_files');
        if (exists) {
            console.log(`Directory ${RNFetchBlobFS.dirs.DocumentDir + '/who_files'} exists`);
            let numberOfChunks = parseInt(data.length / 1000);
            let remainder = data.length % 1000;
            let arrayOfResponses = [];

            for (let i=0; i<=numberOfChunks; i++) {
                try {
                    let response = await createFileWithIndex(fileName, i, data.slice(i * 1000, i * 1000 + 1000), password);
                    if (response) {
                        arrayOfResponses.push(response);
                    } else {
                        console.log(`No response received from createFileWithIndex. fileName: ${fileName}, index: ${i}`);
                        return reject('No response received from createFileWithIndex');
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

                for (let i=0; i<=numberOfChunks; i++) {
                    try {
                        let response = await createFileWithIndex(fileName, i, data.slice(i * 1000, i * 1000 + 1000), password);
                        if (response) {
                            arrayOfResponses.push(response);
                        } else {
                            console.log(`No response received from createFileWithIndex. fileName: ${fileName}, index: ${i}`);
                            return reject('No response received from createFileWithIndex');
                        }
                    } catch (errorCreateFileWithIndex) {
                        console.log('An error occurred while creating directory: ', errorCreateFileWithIndex);
                return Promise.reject(errorCreateFileWithIndex);
                    }
                }

                if (arrayOfResponses.length === numberOfChunks) {
                    return Promise.resolve('Success');
                }
            } catch (errorCreateDir) {
                console.log('An error occurred while creating directory: ', errorCreateDir);
                return Promise.reject(errorCreateDir);
            }
        }
    } catch(errorExists) {
        console.log("An error occurred while getting if the root directory exists: ", errorExists);
        return Promise.reject(errorExists);
    }

    // })
}

export function createZipFileAtPath (source, target, callback) {
    // First check if the source exists, so that we don't create an empty zip file
    console.log('Checking source: ', source);
    RNFetchBlobFS.exists(source)
        .then((exists) => {
            if (exists) {
                // We don't need to check for archives with the same name, since the zip function overwrites the previous archive
                zip(source, target)
                    .then((path) => {
                        console.log('Zip file created at path: ', path);
                        return callback(null, path);
                    })
                    .catch((errorCreateZip) => {
                        console.log('Error while creating zip file: ', errorCreateZip);
                        callback(errorCreateZip);
                    })
            } else {
                console.log('File does not exist at path: ', source);
                return callback('File does not exist');
            }
        })
        .catch((errorFileExists) => {
            console.log('Error while checking if file exists: ', errorFileExists);
            return callback(errorFileExists);
        });
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
        return pouchId.substr('referenceData.json_'.length)
    }
    return pouchId.split('_')[pouchId.split('_').length - 1];
}

export function computeIdForFileType (fileType, outbreakId, file, type) {
    switch (fileType) {
        case 'person.json':
            return (fileType + '_' + type + '_' + outbreakId + '_' + generateId());
        case 'followUp.json':
            return (fileType + '_' + outbreakId + '_' + new Date(file.date).getTime() + '_' + generateId());
        // return (type + '_' + file.outbreakId + '_' + file._id);
        case 'relationship.json':
            return (fileType + '_' + outbreakId + '_' + generateId());
        default:
            return (fileType + '_' + generateId());
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

        let contactIndexAsFirstPerson = mappedContacts.map((e) => {return extractIdFromPouchId(e._id, 'person')}).indexOf(relationships[i].persons[0].id)
        let contactIndexAsSecondPerson = mappedContacts.map((e) => {return extractIdFromPouchId(e._id, 'person')}).indexOf(relationships[i].persons[1].id)
        if ((relationships[i].persons[0].type === 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT' || relationships[i].persons[0].type === 'contact') && contactIndexAsFirstPerson > -1) {
            contactObject = Object.assign({}, contacts.find((e) => {
                return extractIdFromPouchId(e._id, 'person') === relationships[i].persons[0].id
            }))

            if (!contactObject.relationships || contactObject.relationships.length === 0) {
                contactObject.relationships = [];
            }
            contactObject.relationships.push(relationships[i]);
            mappedContacts[contactIndexAsFirstPerson] = contactObject;
        } else {
            if ((relationships[i].persons[1].type === 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT' || relationships[i].persons[1].type === 'contact') && contactIndexAsSecondPerson > -1) {
                contactObject = Object.assign({}, contacts.find((e) => {
                    return extractIdFromPouchId(e._id, 'person') === relationships[i].persons[1].id
                }))

                if (!contactObject.relationships || contactObject.relationships.length === 0) {
                    contactObject.relationships = [];
                }
                contactObject.relationships.push(relationships[i]);
                mappedContacts[contactIndexAsSecondPerson] = contactObject;
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
        // Review Anda si devine in singur indexOf

        let contactPersonIndex = mappedContacts.map((e) => {return extractIdFromPouchId(e._id, 'person')}).indexOf(followUps[i].personId)
        if (contactPersonIndex === -1) {
            let contactObject = {};
            contactObject = Object.assign({}, contacts.find((e) => {
                return extractIdFromPouchId(e._id, 'person') === followUps[i].personId
            }))
                
            contactObject.followUps = [];
            contactObject.followUps.push(followUps[i]);
            mappedContacts.push(contactObject);
        } else {
            mappedContacts[contactPersonIndex].followUps.push(followUps[i]);
        }
    }
    // console.log ('mapContactsAndFollowUps mappedContacts', JSON.stringify(mappedContacts))
    return mappedContacts.filter((e) => {return e._id !== undefined && e._id});
}

export function updateRequiredFields(outbreakId, userId, record, action, fileType = '', type = '') {

    // console.log ('updateRequiredFields ', record, action)
    switch (action) {
        case 'create':
            record._id = record._id ? record._id : computeIdForFileType(fileType, outbreakId, record, type);
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

            // WGD-1806 when removing cases/contacts and they have visualId, set it to null, and add a new document
            if (fileType === 'person.json' && (type === config.personTypes.contacts || type === config.personTypes.cases) && record.visualId) {
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
            console.log ('updateRequiredFields default record', JSON.stringify(record));
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
                            returnedQuestions = returnedQuestions.concat(extractAllQuestions(_.sortBy(questions[i].answers[j].additionalQuestions, ['order', 'variable']), item))
                        }
                    } else {
                        // For the multiple select the answers are in an array of values
                        if (questions[i].answerType === "LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_MULTIPLE_ANSWERS") {
                            if (item && item.questionnaireAnswers && item.questionnaireAnswers[questions[i].variable] && Array.isArray(item.questionnaireAnswers[questions[i].variable]) && item.questionnaireAnswers[questions[i].variable].indexOf(questions[i].answers[j].value) > -1 && questions[i].answers[j].additionalQuestions) {
                                returnedQuestions = returnedQuestions.concat(extractAllQuestions(_.sortBy(questions[i].answers[j].additionalQuestions, ['order', 'variable']), item))
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
                if (mappedQuestions && Array.isArray(mappedQuestions) && mappedQuestions.length > 0 && mappedQuestions.map((e )=> {
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

export function getTranslation (value, allTransactions) {
    if (!getTranslation.cache) {
        getTranslation.cache = {}
    }
    let key = `${value}`
    if (allTransactions && Array.isArray(allTransactions) && allTransactions[0] && allTransactions[0].languageId) {
        key = `${key}-${allTransactions[0].languageId}`
    }
    if (getTranslation.cache[key] !== undefined) {
        // console.log('~~~ return cache value ~~~', key)
        return getTranslation.cache[key]
    }
    let valueToBeReturned = value;
    if (value && typeof value === 'string' && value.includes('LNG')) {
        let item = null
        if (value && allTransactions && Array.isArray(allTransactions)) {
            item = allTransactions.find(e => {return e && e.token === value})
        }

        // valueToBeReturned = item ? item.translation : '';

        if (item !== null && item !== undefined && item.translation !== null && item.translation !== undefined) {
            valueToBeReturned = item.translation
        } else if (defaultTranslations[`${value}`] !== undefined && defaultTranslations[`${value}`] !== null){
            valueToBeReturned = defaultTranslations[`${value}`]
        } else {
            valueToBeReturned = ''
        }
    }
    getTranslation.cache[key] = valueToBeReturned;
    return valueToBeReturned;
}

export function localSortContactsForFollowUps (contactsCopy, propsFilter, stateFilter, filterFromFilterScreen) {
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
    // Take care of sort
    if (filterFromFilterScreen && filterFromFilterScreen.sort && filterFromFilterScreen.sort !== undefined && filterFromFilterScreen.sort.length > 0) {
        contactsCopy = localSortItems(contactsCopy, filterFromFilterScreen.sort)
    } else {
        contactsCopy = objSort(contactsCopy, ['lastName', false])
    }

    return contactsCopy
}

export function localSortHelpItem (helpItemsCopy, propsFilter, stateFilter, filterFromFilterScreen, translations) {
    // Take care of search filter
    if (stateFilter.searchText) {
        helpItemsCopy = helpItemsCopy.filter((e) => {
            return  e && e.title && stateFilter.searchText.toLowerCase().includes(getTranslation(e.title, translations).toLowerCase()) ||
                e && e.title && getTranslation(e.title, translations).toLowerCase().includes(stateFilter.searchText.toLowerCase()) 
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
        let sortCriteria = []
        let sortOrder = []
        for(let i = 0; i < filterFromFilterScreen.sort.length; i++) {
            if (filterFromFilterScreen.sort[i].sortCriteria && filterFromFilterScreen.sort[i].sortCriteria.trim().length > 0 && filterFromFilterScreen.sort[i].sortOrder && filterFromFilterScreen.sort[i].sortOrder.trim().length > 0){
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
        })

        helpItemsCopy = helpItemsCopyMapped

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

export function filterItemsForEachPage (helpItemsCopy, pageAskingHelpFrom) {
    helpItemsCopy = helpItemsCopy.filter((e) => {
        let itemPage = null
        if (e.page && e.page !== undefined) {
            itemPage = e.page
        }
        if (itemPage) {
            if (pageAskingHelpFrom === 'followUps') {
                return e.page.toLowerCase().includes('followups') && !e.page.toLowerCase().includes('modify') && !e.page.toLowerCase().includes('edit') &&
                    !e.page.toLowerCase().includes('view') && !e.page.toLowerCase().includes('add') && !e.page.toLowerCase().includes('create')
            } else if (pageAskingHelpFrom === 'contacts') {
                return e.page.toLowerCase().includes('contacts') && !e.page.toLowerCase().includes('modify') && !e.page.toLowerCase().includes('edit') &&
                    !e.page.toLowerCase().includes('view') && !e.page.toLowerCase().includes('add') && !e.page.toLowerCase().includes('create')
            } else if (pageAskingHelpFrom === 'cases') {
                return e.page.toLowerCase().includes('cases') && !e.page.toLowerCase().includes('modify') && !e.page.toLowerCase().includes('edit') &&
                    !e.page.toLowerCase().includes('view') && !e.page.toLowerCase().includes('add') && !e.page.toLowerCase().includes('create')
            }
            else if (pageAskingHelpFrom === 'followUpSingleScreenAdd') {
                return e.page.toLowerCase().includes('followups') && !e.page.toLowerCase().includes('modify') && !e.page.toLowerCase().includes('edit') &&
                    !e.page.toLowerCase().includes('view') && (e.page.toLowerCase().includes('add') || e.page.toLowerCase().includes('create'))
            } else if (pageAskingHelpFrom === 'contactsSingleScreenAdd') {
                return e.page.toLowerCase().includes('contacts') && !e.page.toLowerCase().includes('modify') && !e.page.toLowerCase().includes('edit') &&
                    !e.page.toLowerCase().includes('view') && (e.page.toLowerCase().includes('add') || e.page.toLowerCase().includes('create'))
            } else if (pageAskingHelpFrom === 'casesSingleScreenAdd') {
                return e.page.toLowerCase().includes('cases') && !e.page.toLowerCase().includes('modify') && !e.page.toLowerCase().includes('edit') &&
                    !e.page.toLowerCase().includes('view') && (e.page.toLowerCase().includes('add') || e.page.toLowerCase().includes('create'))
            }
            else if (pageAskingHelpFrom === 'followUpSingleScreenEdit') {
                return e.page.toLowerCase().includes('followups') && (e.page.toLowerCase().includes('modify') || e.page.toLowerCase().includes('edit')) &&
                    !e.page.toLowerCase().includes('view') && !e.page.toLowerCase().includes('add') && !e.page.toLowerCase().includes('create')
            } else if (pageAskingHelpFrom === 'contactsSingleScreenEdit') {
                return e.page.toLowerCase().includes('contacts') && (e.page.toLowerCase().includes('modify') || e.page.toLowerCase().includes('edit')) &&
                    !e.page.toLowerCase().includes('view') && !e.page.toLowerCase().includes('add') && !e.page.toLowerCase().includes('create')
            } else if (pageAskingHelpFrom === 'casesSingleScreenEdit') {
                return e.page.toLowerCase().includes('cases') && (e.page.toLowerCase().includes('modify') || e.page.toLowerCase().includes('edit')) &&
                    !e.page.toLowerCase().includes('view') && !e.page.toLowerCase().includes('add') && !e.page.toLowerCase().includes('create')
            }
            else if (pageAskingHelpFrom === 'followUpSingleScreenView') {
                return e.page.toLowerCase().includes('followups') && !e.page.toLowerCase().includes('modify') && !e.page.toLowerCase().includes('edit') &&
                    e.page.toLowerCase().includes('view') && !e.page.toLowerCase().includes('add') && !e.page.toLowerCase().includes('create')
            } else if (pageAskingHelpFrom === 'contactsSingleScreenView') {
                return e.page.toLowerCase().includes('contacts') && !e.page.toLowerCase().includes('modify') && !e.page.toLowerCase().includes('edit') &&
                    e.page.toLowerCase().includes('view') && !e.page.toLowerCase().includes('add') && !e.page.toLowerCase().includes('create')
            } else if (pageAskingHelpFrom === 'casesSingleScreenView') {
                return e.page.toLowerCase().includes('cases') && !e.page.toLowerCase().includes('modify') && !e.page.toLowerCase().includes('edit') &&
                    e.page.toLowerCase().includes('view') && !e.page.toLowerCase().includes('add') && !e.page.toLowerCase().includes('create')
            }
            else if (pageAskingHelpFrom === 'exposureAdd') {
                return e.page.toLowerCase().includes('relationships') && !e.page.toLowerCase().includes('modify') && !e.page.toLowerCase().includes('edit') &&
                    !e.page.toLowerCase().includes('view') && (e.page.toLowerCase().includes('add') || e.page.toLowerCase().includes('create'))
            } else if (pageAskingHelpFrom === 'exposureEdit') {
                return e.page.toLowerCase().includes('relationships') && (e.page.toLowerCase().includes('modify') || e.page.toLowerCase().includes('edit') ||
                    e.page.toLowerCase().includes('view')) && !e.page.toLowerCase().includes('add') && !e.page.toLowerCase().includes('create')
            }
        }
    })

    return helpItemsCopy
}

export function localSortItems (itemsToSort, sortFilter) {
    if (sortFilter && sortFilter !== undefined && sortFilter.length > 0) {
        let sortCriteria = []
        let sortOrder = []
        for(let i = 0; i < sortFilter.length; i++) {
            if (sortFilter[i].sortCriteria && sortFilter[i].sortCriteria.trim().length > 0 && sortFilter[i].sortOrder && sortFilter[i].sortOrder.trim().length > 0){
                sortCriteria.push(sortFilter[i].sortCriteria === 'LNG_CONTACT_FIELD_LABEL_FIRST_NAME' ? 'firstName' : 'lastName')
                sortOrder.push(sortFilter[i].sortOrder === 'LNG_SIDE_FILTERS_SORT_BY_ASC_PLACEHOLDER' ? false : true)
            }
        }
        if (sortCriteria.length > 0 && sortOrder.length > 0) {
            if (sortOrder.length === 1) {
                itemsToSort = objSort(itemsToSort, [sortCriteria[0], sortOrder[0]])
            } else if (sortOrder.length === 2) {
                itemsToSort = objSort(itemsToSort, [sortCriteria[0], sortOrder[0]], [sortCriteria[1], sortOrder[1]])
            }
        }
    }
    return itemsToSort

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

            if (case_sensitive === false && typeof a === 'string' && typeof b === "string") {
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

export function getTooltip (label, translation, forceTooltip, tooltipsMessage) {

    if (forceTooltip) {
        return {
            hasTooltip: true,
            tooltipMessage: tooltipsMessage
        };
    }

    let hasTooltip = false
    let tooltipMessage = ''

    let labelTooltip = label + '_DESCRIPTION'
    let tooltipTranslation = getTranslation(labelTooltip, translation)
    if (tooltipTranslation && typeof tooltipTranslation === 'string' && !tooltipTranslation.includes('LNG') && !tooltipTranslation.includes('_DESCRIPTION') && tooltipTranslation.trim().length > 0){
        hasTooltip = true
        tooltipMessage = tooltipTranslation
    }

    let tooltip = {
        hasTooltip: hasTooltip,
        tooltipMessage: tooltipMessage
    }
    
    return tooltip
}

export function createFilterCasesObject(filterFromFilterScreen, filter){
    let allFilters = {}

    //age
    if (filterFromFilterScreen && filterFromFilterScreen.age) {
        allFilters.age = filterFromFilterScreen.age
    } else {
        allFilters.age = null
    }

    //gender
    if (filterFromFilterScreen && filterFromFilterScreen.gender && filterFromFilterScreen.gender !== null) {
        allFilters.gender = filterFromFilterScreen.gender

    } else {
        allFilters.gender = null
    }

    //classification
    if (filterFromFilterScreen && filterFromFilterScreen.classification) {
        allFilters.classification = filterFromFilterScreen.classification;
    } else {
        allFilters.classification = null
    }

    //search text
    if (filter && filter.searchText && filter.searchText.trim().length > 0) {
        let splitedFilter= filter.searchText.split(" ")
        splitedFilter = splitedFilter.filter((e) => {return e !== ""})
        allFilters.searchText = new RegExp(splitedFilter.join("|"), "ig");
    } else {
        allFilters.searchText = null
    }

    //selected locations
    if (filterFromFilterScreen && filterFromFilterScreen.selectedLocations && filterFromFilterScreen.selectedLocations.length > 0) {
        allFilters.selectedLocations = filterFromFilterScreen.selectedLocations;
    } else {
        allFilters.selectedLocations = null
    }

    //sort rules
    if (filterFromFilterScreen && filterFromFilterScreen.sort && filterFromFilterScreen.sort.length > 0) {
        allFilters.sort = filterFromFilterScreen.sort;
    } else {
        allFilters.sort = null
    }

    if (!allFilters.age && !allFilters.gender && !allFilters.searchText && !allFilters.classification && !allFilters.selectedLocations && !allFilters.sort) {
        allFilters = null
    }

    return allFilters;
}

export function createFilterContactsObject(filterFromFilterScreen, filter){
    let allFilters = {}

    if (filterFromFilterScreen && filterFromFilterScreen.age) {
        allFilters.age = filterFromFilterScreen.age
    } else {
        allFilters.age = null
    }

    if (filterFromFilterScreen && filterFromFilterScreen.gender && filterFromFilterScreen.gender !== null) {
        allFilters.gender = filterFromFilterScreen.gender
    } else {
        allFilters.gender = null
    }

    if (filter && filter.searchText && filter.searchText.trim().length > 0) {
        let splitedFilter= filter.searchText.split(" ");
        splitedFilter = splitedFilter.filter((e) => {return e !== ""});
        allFilters.searchText = new RegExp(splitedFilter.join("|"), "ig");
    } else {
        allFilters.searchText = null
    }

    if (filterFromFilterScreen && filterFromFilterScreen.selectedLocations && filterFromFilterScreen.selectedLocations.length > 0) {
        allFilters.selectedLocations = filterFromFilterScreen.selectedLocations;
    } else {
        allFilters.selectedLocations = null
    }

    if (filterFromFilterScreen && filterFromFilterScreen.sort && filterFromFilterScreen.sort.length > 0) {
        allFilters.sort = filterFromFilterScreen.sort;
    } else {
        allFilters.sort = null
    }
    
    if (!allFilters.age && !allFilters.gender && !allFilters.searchText && !allFilters.selectedLocations && !allFilters.sort) {
        allFilters = null
    }

    return allFilters
}
