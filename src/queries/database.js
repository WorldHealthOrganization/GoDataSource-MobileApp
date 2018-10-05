/**
 * Created by florinpopa on 31/08/2018.
 */
import PouchDB from 'pouchdb-react-native';
import SQLite, {encodeName} from 'react-native-sqlcipher-2';
import SQLiteAdapterFactory from 'pouchdb-adapter-react-native-sqlite';
import RNFetchBlobFS from 'rn-fetch-blob/fs';
import PouchUpsert from 'pouchdb-upsert';
import PouchFind from 'pouchdb-find';
import _ from 'lodash';
import moment from 'moment';
import config from './../utils/config';

let database = null;

// PouchDB wrapper over SQLite uses one database per user, so we will store all documents from all the mongo collection to a single database.
// We will separate the records by adding a new property called type: <collection_name>
export function createDatabase(databaseName, databasePassword, callback) {
    // Define the design documents that tells the database to build indexes in order to query
    let ddocArray = [];
    let promisesArray = [];
    // ddocArray.push(createDesignDoc('getContacts1', function (doc) {
    //     if (doc.fileType === 'person.json' && doc.type === 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT') {
    //         if (doc.age) {
    //             emit([doc.outbreakId, doc.gender, doc.age]);
    //         } else {
    //             if (doc.dob) {
    //                 let now = new moment();
    //                 let dob = new moment(doc.dob);
    //                 let age = Math.round(moment.duration(now.diff(dob)).asYears());
    //                 emit([doc.outbreakId, doc.gender, age]);
    //             } else {
    //                 emit([doc.outbreakId, doc.gender, 0]);
    //             }
    //         }
    //     }
    // }));

    ddocArray.push(createDesignDoc('getUserByEmail', function (doc) {
        if (doc.fileType === 'user.json') {
            emit(doc.email);
        } else {
            if (doc.fileType === 'person.json' && doc.type === 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT') {
                if (doc.age) {
                    emit([doc.outbreakId, doc.gender, doc.age]);
                } else {
                    emit([doc.outbreakId, doc.gender, 0]);
                }
            } else {
                if (doc.fileType === 'relationship.json') {
                    emit([doc.outbreakId, doc.deleted, doc.active, doc.persons[0].type, doc.persons[0].id, doc.persons[1].type, doc.persons[1].id]);
                }
            }
        }
    }));

    // Check first if the database is cached
    if (database) {
        for (let i=0; i<ddocArray.length; i++) {
            console.log('Create design doc: ', i);
            promisesArray.push(addDesignDocs(ddocArray[i], database));
        }
        // promisesArray.push(createIndexes());
        // Add al the design docs and then return the database
        Promise.all(promisesArray)
            .then((results) => {
                console.log("Results from creating indexes: ", results);
                callback(database);
            })
            .catch((error) => {
                console.log("Error from creating indexes: ", error);
                callback(database);
            })
    }
    // After that, check if there is already a database with the name and return that
    RNFetchBlobFS.exists(RNFetchBlobFS.dirs.DocumentDir + databaseName)
        .then((exists) => {
            const SQLiteAdapter = SQLiteAdapterFactory(SQLite);
            PouchDB.plugin(SQLiteAdapter);
            PouchDB.plugin(PouchUpsert);
            PouchDB.plugin(PouchFind);
            database = new PouchDB(encodeName(databaseName, databasePassword), {adapter: 'react-native-sqlite'});
            for (let i=0; i<ddocArray.length; i++) {
                console.log("Create index: ", i);
                promisesArray.push(addDesignDocs(ddocArray[i], database));
            }
            // promisesArray.push(createIndexes());
            // Add al the design docs and then return the database
            Promise.all(promisesArray)
                .then((results) => {
                    console.log("Results from creating indexes: ", results);
                    callback(database);
                })
                .catch((error) => {
                    console.log("Error from creating indexes: ", error);
                    callback(database);
                })
        })
        .catch((errorExistsDatabase) => {
            console.log("Database exists error: ", errorExistsDatabase);
            const SQLiteAdapter = SQLiteAdapterFactory(SQLite);
            PouchDB.plugin(SQLiteAdapter);
            PouchDB.plugin(PouchUpsert);
            PouchDB.plugin(PouchFind);
            database = new PouchDB(encodeName(databaseName, databasePassword), {adapter: 'react-native-sqlite'});
            for (let i=0; i<ddocArray.length; i++) {
                console.log("Create index: ", i);
                promisesArray.push(addDesignDocs(ddocArray[i], database));
            }
            // promisesArray.push(createIndexes());
            // Add al the design docs and then return the database
            Promise.all(promisesArray)
                .then((results) => {
                    console.log("Results from creating indexes: ", results);
                    callback(database);
                })
                .catch((error) => {
                    console.log("Error from creating indexes: ", error);
                    callback(database);
                })
        });
}

// function createIndexes() {
//     return new Promise ((resolve, reject) => {
//         if (database) {
//             // Index for contacts based on fileType, type, outbreakId, firstName, lastName, age, gender
//             database.createIndex({
//                 index: {fields: ['fileType', 'type']}
//             })
//                 .then(() => {
//                     console.log('Creating index');
//                     resolve('Done creating Mango index');
//                 })
//                 .catch((errorMangoIndex) => {
//                     console.log('Error creating mango index: ', errorMangoIndex);
//                     reject(errorMangoIndex)
//                 })
//         } else {
//             reject('No database');
//         }
//     })
// }

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
                if (!doc) {
                    // console.log("Insert Doc " + type);
                    file.fileType = type;
                    return file;
                }
                // If the local version is the latest or they have the same updatedAt then we shouldn't update
                if (doc.updatedAt > file.updatedAt || doc.updatedAt === file.updatedAt) {
                    // console.log("Don't update " + type);
                    return false;
                }
                // Update the doc with the new fields: add the type and _rev fields to the file object and insert it
                // console.log("Update doc " + type);
                file.fileType = type;
                file._rev = doc.rev;
                return file;
            })
                .then((res) => {
                    // console.log("Res: ", res);
                    resolve('Done');
                })
                .catch((error) => {
                    console.log("Error: ", error);
                    reject("Error at inserting: ", error);
                })
        } else {
            return reject("Nonexistent database");
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