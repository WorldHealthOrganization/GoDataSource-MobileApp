/**
 * Created by florinpopa on 31/08/2018.
 */
import {Platform} from 'react-native';
import PouchDB from 'pouchdb-react-native';
import SQLite, {encodeName} from 'react-native-sqlcipher-2';
import SQLiteAdapterFactory from 'pouchdb-adapter-react-native-sqlite';
import RNFetchBlobFS from 'rn-fetch-blob/fs';
import PouchUpsert from 'pouchdb-upsert';
import PouchFind from 'pouchdb-find';
import RNFS from 'react-native-fs';
import _ from 'lodash';
import moment from 'moment';
import config from './../utils/config';
import Database from './databaseController';
import {extractIdFromPouchId} from './../utils/functions';

export let database = null;
let databaseCache = null;
let databaseCacheCollectionName = null;

const SQLiteAdapter = SQLiteAdapterFactory(SQLite);
PouchDB.plugin(SQLiteAdapter);
PouchDB.plugin(PouchUpsert);
PouchDB.plugin(PouchFind);

let databaseIndexes = [
    {
        index: {fields: ['languageId', 'fileType', 'deleted']},
        name: 'translationIndex',
        ddoc: 'translationIndex',
    },
    // {
    //     index: {fields: ['fileType', 'outbreakId', 'deleted']},
    //     name: 'generalIndex',
    //     ddoc: 'generalIndex',
    // },
    // {
    //     index: {fields: [
    //         {name: 'persons.[].id', type: 'string'}]},
    //     name: 'arrayIndex',
    //     ddoc: 'arrayIndex',
    //     type: 'text'
    // },
    // {
    //     index: {fields: ['date', 'fileType', 'outbreakId', 'deleted']},
    //     name: 'followUpIndex',
    //     ddoc: 'followUpIndex',
    // },
    // {
    //     index: {fields: ['languageId', 'fileType', 'deleted']},
    //     name: 'languageIndex',
    //     ddoc: 'languageIndex',
    // },
    // {
    //     index: {fields: ['email', 'fileType', 'deleted']},
    //     name: 'userIndex',
    //     ddoc: 'userIndex',
    // }
];

// PouchDB wrapper over SQLite uses one database per user, so we will store all documents from all the mongo collection to a single database.
// We will separate the records by adding a new property called type: <collection_name>
export function createDatabase(databaseName, databasePassword, forceNewDatabase) {
    return new Promise((resolve, reject) => {
        if (database && !forceNewDatabase) {
            resolve(database);
        }
        database = new Database(databaseName, databasePassword);
        resolve(database);
    })
}

function createIndexContact() {
    return new Promise ((resolve, reject) => {
        if (database) {
            // Index for contacts based on fileType, type, outbreakId, firstName, lastName, age, gender
            database.createIndex({
                index: {fields: ['type', 'fileType', 'outbreakId', 'deleted']},
                name: 'indexContact',
                ddoc: 'indexContact',
            })
                .then((res) => {
                    console.log('Creating index: ', res);
                    resolve('Done creating Mango index');
                })
                .catch((errorMangoIndex) => {
                    console.log('Error creating mango index: ', errorMangoIndex);
                    reject(errorMangoIndex)
                })
        } else {
            reject('No database');
        }
    })
}

function createIndex() {
    return new Promise ((resolve, reject) => {
        if (database) {
            // Index for contacts based on fileType, type, outbreakId, firstName, lastName, age, gender
            database.createIndex({
                index: {fields: ['languageId', 'fileType', 'deleted']},
                name: 'index1',
                ddoc: 'index1',
            })
                .then((res) => {
                    console.log('Creating index: ', res);
                    resolve('Done creating Mango index');
                })
                .catch((errorMangoIndex) => {
                    console.log('Error creating mango index: ', errorMangoIndex);
                    reject(errorMangoIndex)
                })
        } else {
            reject('No database');
        }
    })
}

function createIndexPerson() {
    return new Promise ((resolve, reject) => {
        if (database) {
            // Index for contacts based on fileType, type, outbreakId, firstName, lastName, age, gender
            database.createIndex({
                index: {fields: ['updatedAt']},
                name: 'indexPerson',
                ddoc: 'indexPerson',
            })
                .then((res) => {
                    console.log('Creating index: ', res);
                    resolve('Done creating Mango index');
                })
                .catch((errorMangoIndex) => {
                    console.log('Error creating mango index: ', errorMangoIndex);
                    reject(errorMangoIndex)
                })
        } else {
            reject('No database');
        }
    })
}

export function addDesignDocs(ddoc, database) {
    return new Promise((resolve, reject) => {
        database.put(ddoc)
            .then(() => {
            console.log("Created design Doc: ", ddoc);
                resolve(null, database);
            })
            .catch((errorAddingDocument) => {
                if (errorAddingDocument.name === 'conflict') {
                    console.log("Had conflict with creating design doc: ", ddoc, errorAddingDocument);
                    resolve(null, database)
                } else {
                    console.log("Error while creating design doc: ", ddoc, errorAddingDocument);
                    reject(errorAddingDocument);
                }
            })
    })
}

export function createDesignDoc(name, mapFunction) {
    let ddoc = {
        _id: '_design/' + name,
        views: {}
    };

    ddoc.views[name] = {map: mapFunction.toString()};
    return ddoc;
}

export function getDatabase(collectionName) {
    return new Promise((resolve, reject) => {
        // Define the design documents that tells the database to build indexes in order to query
        let promisesArray = [];
        let start = new Date().getTime();

        // Check first if the database is cached
        if (databaseCache && databaseCache.name.includes(collectionName)) {
            return resolve(databaseCache);
        }
        // After that, check if there is already a database with the name and return that
        // console.log("Database name: ", databaseName);
        let databaseName = `${collectionName}${database.databaseName}`;
        let pathToDatabase = `${RNFetchBlobFS.dirs.DocumentDir}/${databaseName}`;

        if (Platform.OS === 'ios') {
            pathToDatabase = `${RNFS.LibraryDirectoryPath}/NoCloud/${databaseName}`;
        }

        console.log('Path to database: ', pathToDatabase);

        RNFetchBlobFS.exists(pathToDatabase)
            .then((exists) => {
                // console.log('Database exists? ', exists);
                // PouchDB.debug.enable('pouchdb:find');
                databaseCache = new PouchDB(encodeName(databaseName, database.databasePassword), {adapter: 'react-native-sqlite'});
                // console.log('Result for find time for chech if database exists: ', collectionName, new Date().getTime() - start);

                if (!exists) {
                    // for (let i=0; i<databaseIndexes.length; i++) {
                    //     console.log("Create index: ", i);
                    //     promisesArray.push(database.createIndex(databaseIndexes[i]));
                    // }
                    // promisesArray.push(createIndexContact());
                    // promisesArray.push(createIndex());
                    // promisesArray.push(createIndexPerson());
                    // Add all the design docs and then return the database
                    // Promise.all(promisesArray)
                    //     .then((results) => {
                    //         console.log("Results from creating indexes: ", results);
                            databaseCacheCollectionName = collectionName;
                            resolve(databaseCache);
                        // })
                        // .catch((error) => {
                        //     console.log("Error from creating indexes: ", error);
                        //     databaseCacheCollectionName = collectionName;
                        //     resolve(databaseCache);
                        // })
                } else {
                    resolve(databaseCache);
                }
            })
            .catch((errorExistsDatabase) => {
                console.log("Database exists error: ", errorExistsDatabase);
                // const SQLiteAdapter = SQLiteAdapterFactory(SQLite);
                // PouchDB.plugin(SQLiteAdapter);
                // PouchDB.plugin(PouchUpsert);
                // PouchDB.plugin(PouchFind);
                // PouchDB.debug.enable('pouchdb:find');
                databaseCache = new PouchDB(encodeName(databaseName, database.databasePassword), {adapter: 'react-native-sqlite'});
                // for (let i=0; i<databaseIndexes.length; i++) {
                //     console.log("Create index: ", i);
                //     promisesArray.push(database.createIndex(databaseIndexes[i]));
                // }
                // promisesArray.push(createIndexContact());
                // promisesArray.push(createIndex());
                // promisesArray.push(createIndexPerson());
                // Add al the design docs and then return the database
                // Promise.all(promisesArray)
                //     .then((results) => {
                //         console.log("Results from creating indexes: ", results);
                        databaseCacheCollectionName = collectionName;
                        resolve(databaseCache);
                    // })
                    // .catch((error) => {
                    //     console.log("Error from creating indexes: ", error);
                    //     databaseCacheCollectionName = collectionName;
                    //     resolve(databaseCache);
                    // })
            });
    })
}

// We're gonna profit of the PouchDB "free" index and include our most used query criteria inside the id field
// TODO don't forget to recreate the original id when syncing
export function updateFileInDatabase(file, type) {
    return new Promise((resolve, reject) => {
        let collectionName = `${type.split('.')[0]}`;
        getDatabase(collectionName)
            .then((database) => {
                if (database) {
                    file._id = createIdForType(file, type);
                    type = `${type.split('.')[0]}.${type.split('.')[2]}`;
                    // Person needs special treatment
                    if (type.includes('person') && (file.type === config.personTypes.cases || file.type === config.personTypes.contacts)) {
                        // This method checks for changing id
                        upsertDataWithChangingId(file, type, database)
                            .then((res) => {
                                // console.log("Res: ", res);
                                file = null;
                                resolve('Done');
                            })
                            .catch((error) => {
                                console.log("Error: ", error);
                                file = null;
                                reject("Error at inserting: ", error);
                            })
                    }
                    database.upsert(file._id, (doc) => {
                        return upsertFunction(doc, file, type)
                    })
                        .then((res) => {
                            // console.log("Res: ", res);
                            file = null;
                            resolve('Done');
                        })
                        .catch((error) => {
                            console.log("Error: ", error);
                            file = null;
                            reject("Error at inserting: ", error);
                        })
                } else {
                    return reject("Nonexistent database");
                }
            })
            .catch((errorGetDatabase) => {
                return reject('nonexistent database');
            })
    })
}

function upsertFunction(doc, file, type) {
    // If we have to insert the doc, then add the type property
    if (!doc || (typeof doc === 'object' && Object.keys(doc).length === 0)) {
        // console.log("Insert Doc " + type);
        file.fileType = type;
        return file;
    }
    if (type === 'person.json' && file.firstName === 'JSON1') {
        return false;
    }
    // If the local version is the latest or they have the same updatedAt then we shouldn't update
    if (doc.updatedAt > file.updatedAt || doc.updatedAt === file.updatedAt) {
        // console.log("Don't update " + type);
        return false;
    }
    // Update the doc with the new fields: add the type and _rev fields to the file object and insert it
    // console.log("Update doc " + type);
    if (type === 'relationship.json') {
        if (file.persons[0].source) {
            file.source = file.persons[0].id;
        } else {
            if (file.persons[1].source) {
                file.source = file.persons[1].id;
            }
        }

        if (file.persons[0].target) {
            file.target = file.persons[0].id;
        } else {
            if (file.persons[1].target) {
                file.target = file.persons[1].id;
            }
        }
    }
    file.fileType = type;
    file._rev = doc.rev;
    return file;
}

export function processBulkDocs(data, type) {
    return new Promise((resolve, reject) => {
        let collectionName = `${type.split('.')[0]}`;
        getDatabase(collectionName)
            .then((database) => {
                if (database) {
                    // New types: fileType.number.json
                    let fileType = `${type.split('.')[0]}.${type.split('.')[2]}`;
                    // if (type.includes('location')) {
                    //     data = data.splice(0, 1000);
                    // }
                    // if (type.includes('languageToken')) {
                    //     data = data.filter((e) => {return e.languageId === 'english_en'})
                    // }
                    database.bulkDocs(data.map((e) => {
                        return Object.assign({}, e, {_id: createIdForType(e, type), fileType})
                    }))
                        .then(() => {
                            console.log('Bulk docs finished: ');
                            data = null;
                            resolve('Done Bulk');
                        })
                        .catch((errorBulkDocs) => {
                            console.log('Bulk docs encountered an error: ', errorBulkDocs);
                            data = null;
                            reject(errorBulkDocs)
                        })
                } else {
                    data = null;
                    reject('Database does not exist');
                }
            })
            .catch((errorGetDatabase) => {
                return reject('nonexistent database');
            })
    })
}

// Create new ID's in order to be used more easily for querying the Pouch database
export function createIdForType(file, type) {
    let fileType = `${type.split('.')[0]}.${type.split('.')[2]}`;
    switch (fileType) {
        case 'person.json':
            return (fileType + '_' + file.type + '_' + file.outbreakId + '_' + file._id);
        case 'languageToken.json':
            return (fileType + '_' + file.languageId + '_' + file._id);
        case 'followUp.json':
            return (fileType + '_' + file.outbreakId + '_' + new Date(file.date).getTime() + '_' + file._id);
            // return (type + '_' + file.outbreakId + '_' + file._id);
        case 'relationship.json':
            return (fileType + '_' + file.outbreakId + '_' + file._id);
        default:
            return (fileType + '_' + file._id);
    }
}


// Algorithm
function upsertDataWithChangingId(file, type, database) {
    let alternateId = `person.json_${file.type === config.personTypes.contacts ? config.personTypes.cases : file.type === config.personTypes.cases ? config.personTypes.contacts : file.type}_${file.outbreakId}_${extractIdFromPouchId(file._id, 'person')}`;
    let promiseForOriginalId = database.find({selector: { _id: file._id } })
        .then((result) => {
            return result.docs && Array.isArray(result.docs) && result.docs.length > 0 ? result.docs[0] : null;
        });
    let promiseForAlternateId = database.find({selector: {_id: alternateId } })
        .then((result) => {
            return result.docs && Array.isArray(result.docs) && result.docs.length > 0 ? result.docs[0] : null;
        });
    let upsertFile = database.upsert(file._id, (doc) => {
        return upsertFunction(doc, file, type);
    });

    return Promise.all([promiseForOriginalId, promiseForAlternateId])
        .then((results) => {
            let promiseRemoveOldData = results[1] && database.remove(results[1]);
            return Promise.all([promiseRemoveOldData, upsertFile])
        })
        .catch((errorGetData) => {
            // If the operation failed, proceed to upsert
            return upsertFile;
        });
}

export function generalUpsert(collectionName, record) {
    return getDatabase(collectionName)
        .then((database) => {
            return database.upsert(record._id, (doc) => {
                return upsertFunction(doc, record, null);
            })
                .then((resultUpsert) => {
                    return database.get(resultUpsert.id)
                })
        })
}