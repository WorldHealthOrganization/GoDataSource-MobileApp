/**
 * Created by florinpopa on 29/08/2018.
 */
import url from './../utils/url';
import {handleResponse} from './../utils/functions';
import RNFetchBlob from 'rn-fetch-blob';
import base64 from 'base-64';
import {unzip} from 'react-native-zip-archive';
import SQLite, {encodeName} from 'react-native-sqlcipher-2';
import {createTableUser, insertUser} from './../queries/user';

export function getDatabaseSnapshotRequest(hubConfig, callback) {
    let requestUrl = url.getDatabaseSnapshotUrl();

    let dirs = RNFetchBlob.fs.dirs.DocumentDir;

    console.log('Get database');

    RNFetchBlob.config({
        fileCache: true,
        appendExt: 'zip',
        path: dirs + '/database.zip'
    })
        .fetch('GET', requestUrl, {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Basic ' + base64.encode(`${hubConfig.clientId}:${hubConfig.clientSecret}`)
    })
        .then((res) => {
            let status = res.info().status;

            // After getting zip file from the server, unzip it and then proceed to the importing of the data to the SQLite database

            // console.log("Got database");
            //
            // const db = SQLite.openDatabase(encodeName('test.db', 'florin'), '1.0', '', 1);
            // db.transaction((txn) => {
            //     txn.executeSql('DROP TABLE IF EXISTS Users', []);
            //     txn.executeSql('CREATE TABLE IF NOT EXISTS Users(user_id INTEGER PRIMARY KEY NOT NULL, name VARCHAR(30))', []);
            //     txn.executeSql('INSERT INTO Users (name) VALUES (:name)', ['nora']);
            //     txn.executeSql('INSERT INTO Users (name) VALUES (:name)', ['takuya']);
            //     txn.executeSql('SELECT * FROM `users`', [], function (tx, res) {
            //         for (let i = 0; i < res.rows.length; ++i) {
            //             console.log('item:', res.rows.item(i));
            //         }
            //     });
            // })


            RNFetchBlob.fs.exists(dirs + '/database2.zip')
                .then((exists) => {
                    if (exists) {
                        RNFetchBlob.fs.exists(dirs + '/who_databases')
                            .then((exists) => {
                                if (exists) {
                                    unzipFile(`${dirs}/database2.zip`,`${dirs}/who_databases`, (error, path) => {
                                        if (error) {
                                            console.log("An error occurred while unzipping the file")
                                        }
                                        if (path) {
                                            RNFetchBlob.fs.ls(path)
                                                .then((files) => {
                                                    console.log(files);
                                                    console.log("Move to the reading of the first file: ", (path + files[0]));
                                                    RNFetchBlob.fs.readFile(path + '/' + files[files.indexOf('user.json')], 'utf8')
                                                        .then((data) => {
                                                        // console.log("Data result: ", JSON.parse(data));
                                                        let databaseData = JSON.parse(data);
                                                            createTableUser('test.db', 'test', '1.0', (errorCreate, resCreate) => {
                                                                if (errorCreate) {
                                                                    console.log('Error while creating the table')
                                                                }
                                                                if (resCreate) {
                                                                    insertUser('test.db', 'test', '1.0', databaseData[0], (errorInsert, resInsert) => {
                                                                        if (errorInsert) {
                                                                            console.log('Error while inserting')
                                                                        }
                                                                        if (resInsert) {
                                                                            console.log('Check inserted data');
                                                                            const db = SQLite.openDatabase(encodeName('test.db', 'test'), '1.0', '', 1);
                                                                            db.transaction((txn) => {
                                                                                txn.executeSql('SELECT * FROM User', [], function (tx, res) {
                                                                                    console.log('item:', res);
                                                                                }, (errorSelect) =>{
                                                                                    console.log("Error select: ", errorSelect)
                                                                                })
                                                                            })
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        })
                                                        .catch((readFileError) => {
                                                        console.log("ReadFileError: ", readFileError);
                                                        })
                                                })
                                        }
                                    })
                                } else {
                                    RNFetchBlob.fs.mkdir(dirs + '/who_databases')
                                        .then(() => {
                                            unzipFile(`${dirs}/database2.zip`,`${dirs}/who_databases`, (error, path) => {
                                                if (error) {
                                                    console.log("An error occurred while unzipping the file")
                                                }
                                                if (path) {
                                                    RNFetchBlob.fs.ls(path)
                                                        .then((files) => {
                                                            console.log(files);
                                                            // console.log("Move to the reading of the first file: ", (path + files[0]));
                                                            RNFetchBlob.fs.readFile(path + '/' + files[files.indexOf('user.json')], 'utf8')
                                                                .then((data) => {
                                                                // console.log("Data result: ", JSON.parse(data));
                                                                    let databaseData = JSON.parse(data);
                                                                    createTableUser('test.db', 'test', '1.0', (errorCreate, resCreate) => {
                                                                        if (errorCreate) {
                                                                            console.log('Error while creating the table')
                                                                        }
                                                                        if (resCreate) {
                                                                            insertUser('test.db', 'test', '1.0', databaseData[0], (errorInsert, resInsert) => {
                                                                                if (errorInsert) {
                                                                                    console.log('Error while inserting')
                                                                                }
                                                                                if (resInsert) {
                                                                                    console.log('Check inserted data');
                                                                                    const db = SQLite.openDatabase(encodeName('test.db', 'test'), '1.0', '', 1);
                                                                                    db.transaction((txn) => {
                                                                                        txn.executeSql('SELECT * FROM User', [], function (tx, res) {
                                                                                            console.log('item:', res);
                                                                                        })
                                                                                    },
                                                                                        (errorSelect) =>{
                                                                                        console.log("Error select: ", errorSelect)
                                                                                    })
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                })
                                                                .catch((readFileError) => {
                                                                console.log("ReadFileError: ", readFileError);
                                                                })
                                                        })
                                                }
                                            })
                                        })
                                        .catch((errorCreateDir) => {
                                            console.log("ErrorCreateDir: ", errorCreateDir)
                                        })
                                }
                            })
                            .catch((error) => {
                                console.log("Error : ", error);
                            });
                    } else {
                        console.log('Strange but the file is not seen');
                    }
                })
                .catch((error) => {
                    console.log("Error while creating directory", error);
                });

            // if(status === 200) {
            //
            // } else {
            //     callback('Error')
            // }
        })
        .catch((errorMessage, statusCode) => {
            // error handling
            console.log("*** getDatabaseSnapshotRequest error: ", JSON.stringify(errorMessage));
            callback(errorMessage);
        });
}

export function unzipFile (source, dest, callback) {
    unzip(source, dest)
        .then((path) => {
            console.log(`unzip completed at ${path}`);
            callback(null, path);
        })
        .catch((error) => {
            console.log(error);
            callback(error);
        })
};