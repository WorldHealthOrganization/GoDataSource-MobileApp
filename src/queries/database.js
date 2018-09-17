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

let database = null;

// PouchDB wrapper over SQLite uses one database per user, so we will store all documents from all the mongo collection to a single database.
// We will separate the records by adding a new property called type: <collection_name>
export function createDatabase(databaseName, databasePassword, callback) {
    // Define the document that tells the database to build indexes in order to query
    let ddoc1 = {
        _id: "_design/whoIndexes",
        views: {
            // Get objects from the database by type
            byType: {
                map: function (doc) { emit(doc.fileType); }.toString()
            },
            mapStuff: {
                map: function (doc) {
                    switch (doc.fileType){
                        case 'user.json':
                            emit(doc.email);
                            break;
                        case 'outbreak.json':
                            emit(doc._id);
                            break;
                        case 'person.json':
                            if (doc.type === 'contact') {
                                emit([doc.outbreakId, 1]);
                            } else {
                                if (doc.type === 'case') {
                                    emit([doc.outbreakId, 2]);
                                } else {
                                    emit([doc.outbreakId, 3])
                                }
                            }
                            break;
                        case 'followUp.json':
                            emit([doc.outbreakId, 0]);
                            break;
                        default:
                            emit(doc._id);
                            break
                    }
                }.toString()
            },
            getContactsForOutbreakId: {
                map: function (doc, emit) {
                        if (doc.fileType === 'outbreak.json') {
                                emit(doc._id);
                            }
                }.toString()
            }
        }
    };

    // Check first if the database is cached
    if (database) {
        // database.put(ddoc)
        //     .then(() => {
        //         callback(database);
        //     })
        //     .catch((errorAddViews) => {
        //         console.log("Error add views: ", errorAddViews);
                callback(database);
            // })
    }
    // After that, check if there is already a database with the name and return that
    RNFetchBlobFS.exists(RNFetchBlobFS.dirs.DocumentDir + databaseName)
        .then((exists) => {
            const SQLiteAdapter = SQLiteAdapterFactory(SQLite);
            PouchDB.plugin(SQLiteAdapter);
            PouchDB.plugin(PouchUpsert);
            PouchDB.plugin(PouchFind);
            database = new PouchDB(encodeName(databaseName, databasePassword), {adapter: 'react-native-sqlite'});
            // database.put(ddoc1)
            //     .then(() => {
            //       callback(database);
            //     })
            //     .catch((errorAddViews) => {
            //         console.log("Error add views: ", errorAddViews);
                    callback(database);
                // })
        })
        .catch((errorExistsDatabase) => {
            console.log("Database exists error: ", errorExistsDatabase);
            const SQLiteAdapter = SQLiteAdapterFactory(SQLite);
            PouchDB.plugin(SQLiteAdapter);
            PouchDB.plugin(PouchUpsert);
            PouchDB.plugin(PouchFind);
            database = new PouchDB(encodeName(databaseName, databasePassword), {adapter: 'react-native-sqlite'});
            // PouchDB.debug.enable('*');
            // database.put(ddoc1)
            //     .then(() => {
            //       callback(database);
            //     })
            //     .catch((errorAddViews) => {
            //         console.log("Error add views: ", errorAddViews);
                    callback(database);
                // })
        });
}

export function getDatabase() {
    return database || null;
}

export function updateFileInDatabase(file, type) {
    return new Promise((resolve, reject) => {
        if (database) {
            database.upsert(file._id, (doc) => {
                // If we have to insert the doc, then add the type property
                if (!doc) {
                    console.log("Insert Doc " + type);
                    file.fileType = type;
                    return file;
                }
                // If the local version is the latest or they have the same updatedAt then we shouldn't update
                if (doc.updatedAt > file.updatedAt || doc.updatedAt === file.updatedAt) {
                    console.log("Don't update " + type);
                    return false;
                }
                // Update the doc with the new fields: add the type and _rev fields to the file object and insert it
                console.log("Update doc " + type);
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