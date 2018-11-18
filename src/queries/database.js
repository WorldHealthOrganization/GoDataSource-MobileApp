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

let database = null;

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
        // Define the design documents that tells the database to build indexes in order to query
        let promisesArray = [];

        // Check first if the database is cached
        if (database && !forceNewDatabase) {
            return resolve(database);
        }
        // After that, check if there is already a database with the name and return that
        console.log("Database name: ", databaseName);
        let pathToDatabase = RNFetchBlobFS.dirs.DocumentDir + '/' + databaseName;

        if (Platform.OS === 'ios') {
            pathToDatabase = RNFS.LibraryDirectoryPath + '/NoCloud/' + databaseName;
        }

        RNFetchBlobFS.ls(RNFetchBlobFS.dirs.DocumentDir)
            .then((result) => {
                console.log('Android list: ', result);
                console.log('Path to database: ', pathToDatabase);
                RNFetchBlobFS.exists(pathToDatabase)
                    .then((exists) => {
                        console.log('Database exists? ', exists);
                        const SQLiteAdapter = SQLiteAdapterFactory(SQLite);
                        PouchDB.plugin(SQLiteAdapter);
                        PouchDB.plugin(PouchUpsert);
                        PouchDB.plugin(PouchFind);
                        // PouchDB.debug.enable('pouchdb:find');
                        database = new PouchDB(encodeName(databaseName, databasePassword), {adapter: 'react-native-sqlite'});

                        if (!exists) {
                            // for (let i=0; i<databaseIndexes.length; i++) {
                            //     console.log("Create index: ", i);
                            //     promisesArray.push(database.createIndex(databaseIndexes[i]));
                            // }
                            // promisesArray.push(createIndexContact());
                            // promisesArray.push(createIndex());
                            // promisesArray.push(createIndexPerson());
                            // Add all the design docs and then return the database
                            Promise.all(promisesArray)
                                .then((results) => {
                                    console.log("Results from creating indexes: ", results);
                                    resolve(database);
                                })
                                .catch((error) => {
                                    console.log("Error from creating indexes: ", error);
                                    resolve(database);
                                })
                        } else {
                            resolve(database);
                        }
                    })
                    .catch((errorExistsDatabase) => {
                        console.log("Database exists error: ", errorExistsDatabase);
                        const SQLiteAdapter = SQLiteAdapterFactory(SQLite);
                        PouchDB.plugin(SQLiteAdapter);
                        PouchDB.plugin(PouchUpsert);
                        PouchDB.plugin(PouchFind);
                        // PouchDB.debug.enable('pouchdb:find');
                        database = new PouchDB(encodeName(databaseName, databasePassword), {adapter: 'react-native-sqlite'});
                        // for (let i=0; i<databaseIndexes.length; i++) {
                        //     console.log("Create index: ", i);
                        //     promisesArray.push(database.createIndex(databaseIndexes[i]));
                        // }
                        // promisesArray.push(createIndexContact());
                        // promisesArray.push(createIndex());
                        // promisesArray.push(createIndexPerson());
                        // Add al the design docs and then return the database
                        Promise.all(promisesArray)
                            .then((results) => {
                                console.log("Results from creating indexes: ", results);
                                resolve(database);
                            })
                            .catch((error) => {
                                console.log("Error from creating indexes: ", error);
                                resolve(database);
                            })
                    });
            })
            .catch((error) => {
                console.log('Android error: ', error);
                reject(error)
            })
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

export function getDatabase() {
    return database || null;
}

// We're gonna profit of the PouchDB "free" index and include our most used query criteria inside the id field
// TODO don't forget to recreate the original id when syncing
export function updateFileInDatabase(file, type) {
    return new Promise((resolve, reject) => {
        if (database) {
            file._id = createIdForType(file, type);
            database.upsert(file._id, (doc) => {
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
}

export function processBulkDocs(data, type) {
    return new Promise((resolve, reject) => {
        if (database) {
            database.bulkDocs(data.map((e) => {return Object.assign({}, e, {_id: createIdForType(e, type), fileType: type})}))
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
}

// Create new ID's in order to be used more easily for querying the Pouch database
export function createIdForType(file, type) {
    switch (type) {
        case 'person.json':
            return (type + '_' + file.type + '_' + file.deleted + '_' + file.outbreakId + '_' + file._id);
        case 'languageToken.json':
            return (type + '_' + file.deleted + '_' + file.languageId + '_' + file._id);
        case 'followUp.json':
            return (type + '_' + file.deleted + '_' + file.outbreakId + '_' + new Date(file.date).getTime() + '_' + file._id);
            // return (type + '_' + file.outbreakId + '_' + file._id);
        case 'relationship.json':
            return (type + '_' + file.deleted + '_' + file.outbreakId + '_' + file._id);
        default:
            return (type + '_' + file.deleted + '_' + file._id);
    }
}