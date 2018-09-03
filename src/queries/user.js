/**
 * Created by florinpopa on 31/08/2018.
 */
import SQLite, {encodeName} from 'react-native-sqlcipher-2';
import {DROP_TABLE_USER, CREATE_TABLE_USER} from './../utils/enums';

export function createTableUser(databaseName, key, version, callback) {
    const db = SQLite.openDatabase(encodeName(databaseName, key), version, '', 1);
    db.transaction((txn) => {
        txn.executeSql(DROP_TABLE_USER, []);
        txn.executeSql(CREATE_TABLE_USER, [], (tx, res) => {
            console.log("Create table: ", tx, res);
            callback(null, res);
        }, (error, ceva) => {
            console.log("Error create table: ", error, ceva);
            callback(error);
        });
    })
}

export function insertUser(databaseName, key, version, user, callback) {
    // console.log("User to be inserted: ", user);
    const db = SQLite.openDatabase(encodeName(databaseName, key), version, '', 1);
    db.transaction((txn) => {
        txn.executeSql('INSERT INTO User VALUES (:id, ' +
            ':firstName, :lastName, :roleIds, :languageId, ' +
            ':email, :deleted, :outbreakIds, :activeOutbreakId, :passwordChange, ' +
            ':securityQuestions, :realm, :username, :emailVerified, :createdAt, ' +
            ':updatedAt, :updatedBy, :deletedAt)',
            [
                user._id,
                user.firstName,
                user.lastName,
                user.roleIds ? user.roleIds.toString() : 'test',
                user.languageId,
                user.email,
                user.deleted,
                user.outbreakIds ? user.outbreakIds.toString() : 'test',
                user.activeOutbreakId,
                user.passwordChange,
                user.securityQuestions ? user.securityQuestions.toString() : 'test',
                user.realm, user.username,
                user.emailVerified,
                user.createdAt,
                user.updateAt,
                user.updatedBy,
                user.deletedAt
            ], (tx, res) => {
                console.log("inserted user table: ", tx, res);
                callback(null, res);
            }, (error, ceva) => {
                console.log("Insert error: ", error, ceva);
                callback(error);
            });
    })
}