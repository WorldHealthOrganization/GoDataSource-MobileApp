import SQLite, {encodeName} from 'react-native-sqlcipher-2';
import {database} from './../database';
import constants from './constants';
import get from 'lodash/get';
import {extractLocationId} from './../../utils/functions';
import {checkArray, checkArrayAndLength} from './../../utils/typeCheckingFunctions';
import translations from "../../utils/translations";
import {generalMapping} from "../../actions/followUps";
import appConfig from './../../../app.config';

var jsonSql = require('json-sql')();
var jsonSqlPrime = require('json-sql')();
jsonSqlPrime.configure({separatedValues: false});
jsonSql.setDialect('sqlite');

export function openDatabase(databaseName) {
    return new Promise((resolve, reject) => {
        let fullDatabaseName = `${databaseName}${database.getDatabaseName()}`;
        try {
            SQLite.openDatabase(encodeName(fullDatabaseName, database.getDatabasePassword()), null, null, null, (sqlDb) => {
                resolve(sqlDb);
            });
        } catch(errorOpenDatabase) {
            reject(new Error('Could not open database'));
        }
    })
}

export function initTables () {
    let promiseArray = [];
    return Promise.resolve()
        .then(() => openDatabase('common'))
        .then(wrapTransationInPromise)
        .then((txn) => {
            for(let i=0; i<constants.databaseTables.length; i++) {
                promiseArray.push(createTable(txn, constants.databaseTables[i]))
            }
            return Promise.all(promiseArray);
        })
}

export function initIndexes () {
    let promiseArray = [];
    return Promise.resolve()
        .then(() => openDatabase('common'))
        .then(wrapTransationInPromise)
        .then((txn) => {
            let indexes = [];
            indexes.push(wrapExecuteSQLInPromise(txn, 'CREATE INDEX IF NOT EXISTS translationIndex ON languageToken (languageId ASC, deleted ASC)', [], true))
            indexes.push(wrapExecuteSQLInPromise(txn, 'CREATE INDEX IF NOT EXISTS personIndex ON person (lastName ASC, firstName ASC, _id ASC)', [], true))
            indexes.push(wrapExecuteSQLInPromise(txn, 'CREATE INDEX IF NOT EXISTS relationshipIndex ON relationship (sourceId ASC, targetId ASC)', [], true))

            return Promise.all(indexes);
        })
}

export function wrapTransationInPromise (database) {
    return new Promise((resolve, reject) => {
        database.transaction((transaction) => resolve(transaction), (errorTransaction) => reject(errorTransaction));
    })
}

export function wrapReadTransactionInPromise (database) {
    return new Promise((resolve, reject) => {
        database.readTransaction((transaction) => resolve(transaction), (errorTransaction) => reject(errorTransaction));
    })
}

export function wrapExecuteSQLInPromise (transaction, sqlStatement, arrayOfFields, skipCallback) {
    if (appConfig.env === 'development') {
        console.log('Execute query: ', sqlStatement, arrayOfFields);
    }
    if (transaction && sqlStatement && checkArray(arrayOfFields)) {
        return new Promise((resolve, reject) => {
            if (skipCallback) {
                transaction.executeSql(sqlStatement, arrayOfFields, null, (txn, errorStatement) => {return reject(errorStatement)});
                return resolve('Success');
            } else {
                transaction.executeSql(sqlStatement, arrayOfFields
                    , (transaction, resultSet) => {
                        // console.log('Good stuff:');
                        return resolve(resultSet)
                    },
                    (transaction, errorStatement) => {
                        console.log('Error query execution: ', errorStatement);
                        return reject(errorStatement);
                    }
                    );
            }
        })
    } else {
        return Promise.reject('Invalid arguments');
    }
}

// This methods refer to the process of creating the needed database for the searchable data
function createTableStringMethod(tableName) {
    let createTableString = `CREATE TABLE IF NOT EXISTS ${tableName} (`;
    let tableFields = constants.tableStructure[tableName].concat(constants.tableStructure.commonFields);
    for (let i=0; i<tableFields.length; i++) {
        createTableString = createTableString + `${tableFields[i].fieldName} ${tableFields[i].fieldType}`;
        if (tableFields[i].isForeignKey) {
            createTableString = createTableString + ` REFERENCES ${tableFields[i].referencesTable}(${tableFields[i].referencesField})`
        }
        if (i === tableFields.length - 1) {
            createTableString = createTableString + `)`;
        } else {
            createTableString = createTableString + `, `;
        }
    }

    return createTableString;
}
export function createTable(transaction, tableName) {
    let createTableString = createTableStringMethod(tableName);
    return wrapExecuteSQLInPromise(transaction, createTableString, [], true)
            .then((resultSet) => Promise.resolve(`Success ${tableName}`))
            .then(() => Promise.resolve(transaction))
            .catch((errorStatement) => Promise.reject(errorStatement));
}

// The following methods refer to the bulk insert or update of mapped data. Data mapping will not be done here
function insertOrUpdateStringCreation (tableName) {
    try {
        let insertOrUpdateString = `INSERT INTO ${tableName} values (`;
        let tableFields = constants.tableStructure[tableName].concat(constants.tableStructure.commonFields);
        for (let i=0; i<tableFields.length; i++) {
            insertOrUpdateString = insertOrUpdateString + `:${tableFields[i].fieldName}`;
            if (i === tableFields.length - 1) {
                insertOrUpdateString = insertOrUpdateString + `)`;
            } else {
                insertOrUpdateString = insertOrUpdateString + `, `;
            }
        }
        insertOrUpdateString = insertOrUpdateString + ` ON CONFLICT (_id) DO UPDATE SET `;
        // Skip the id field (first field in the declared structure)
        for (let i=1; i<tableFields.length; i++) {
            insertOrUpdateString = insertOrUpdateString + `${tableFields[i].fieldName}=excluded.${tableFields[i].fieldName}`;
            if (i < tableFields.length - 1) {
                insertOrUpdateString = insertOrUpdateString + `, `;
            }
        }
        return insertOrUpdateString
    } catch (errorAtCreatingString) {
        console.log('SQLite console: error at creating insertOrUpdate string: ', errorAtCreatingString)
    }
}
// This method takes the databaseName, tableName and the mappedData and inserts it in bulk in the database
// Use this even for a single value
export function insertOrUpdate(databaseName, tableName, data, createTableBool) {
    // return new Promise((resolve, reject) => {
    //     try {
            let start = new Date().getTime();
            let mapTime, mapEnd, openCreateTime, openCreateEnd, insertTime, insertEnd;
            let insertOrUpdateString = insertOrUpdateStringCreation(tableName);
            console.log("Lab help", tableName, data?.length);
            let mappedData = mapDataForInsert(tableName, data);
            console.log("Lab help mapped", tableName, mappedData?.length);
            mapEnd = new Date().getTime();
            mapTime = mapEnd - start;
            console.log("time for mapping: ", tableName, mapTime);
            if (checkArrayAndLength(mappedData)) {
                return Promise.resolve()
                    .then(() => openDatabase(databaseName))
                    .then((database) => {
                        let i = 0;
                        database.transaction((txn) => {
                            database = null;
                            if (createTableBool) {
                                let createTableString = createTableStringMethod(tableName);
                                txn.executeSql(createTableString, []);
                            }
                            openCreateEnd = new Date().getTime();
                            openCreateTime = openCreateEnd - mapEnd;
                            console.log("time for open create database: ", tableName, openCreateTime);

                            // let insertObject =


                            while (i < mappedData.length) {
                                if (i < mappedData.length - 1) {
                                    txn.executeSql(insertOrUpdateString, mappedData[i]);
                                } else {
                                    txn.executeSql(insertOrUpdateString, mappedData[mappedData.length - 1])//,
                                        // (success) => {
                                        //     insertEnd = new Date().getTime();
                                        //     insertTime = insertEnd - openCreateEnd;
                                        //     console.log('time for insert: ', tableName, insertTime);
                                        //     console.log('Transactional insert took: ', new Date().getTime() - start);
                                        //     txn = null;
                                        //     // database = null;
                                        //     return Promise.resolve(success);
                                        // },
                                        // (error) => {
                                        //     return Promise.reject(error);
                                        // })
                                }
                                i++;
                            }
                        },
                            (errorTransaction) => {
                            return Promise.reject(errorTransaction)
                            },
                            () => {
                                insertEnd = new Date().getTime();
                                insertTime = insertEnd - openCreateEnd;
                                console.log('time for insert: ', tableName, insertTime);
                                console.log('Transactional insert took: ', new Date().getTime() - start);
                                // database = null;
                                return openDatabase('test')
                                    .then((db) => Promise.resolve('Success'))
                            })
                    })

                    // .then(wrapTransationInPromise)
                    // .then((txn) => {
                    //     if (createTableBool) {
                    //         return createTable(txn, tableName);
                    //     }
                    //     return Promise.resolve(txn);
                    // })
                    // .then((txn) => {
                    //     let start = new Date().getTime();
                    //     // console.log('Transaction wrapped: ', JSON.stringify(txn));
                    //     let dataToBeInsertedPromise = [];
                    //     let i = 0;
                    //     while(i < mappedData.length) {
                    //         dataToBeInsertedPromise.push(wrapExecuteSQLInPromise(txn, insertOrUpdateString, mappedData[i], i < mappedData.length  - 1).catch((error) => console.log('stuff')));
                    //         i++;
                    //     }
                    //     return Promise.all(dataToBeInsertedPromise)
                    //         .then((results) => {
                    //             dataToBeInsertedPromise = null;
                    //             console.log('Transaction wrapped: time for processing file: ', new Date().getTime() - start, tableName);
                    //             return Promise.resolve(results)
                    //         });
                    // })
                    .catch((errorInsertOrUpdate) => Promise.reject(errorInsertOrUpdate))
            } else {
                return Promise.resolve('Success');
            }
        // } catch (openDatabaseError) {
        //     reject(new Error('Could not open database'));
        // }
    // })
}

// Data mapping method based on the structure of the tables
export function mapDataForInsert(tableName, data) {
    if (!tableName || !checkArrayAndLength(data)) {
        return [];
    }
    let tableFields = constants.tableStructure[tableName].concat(constants.tableStructure.commonFields);

    return data.map((e) => {
        let innerArray = [];
        for (let i=0; i<tableFields.length; i++) {

            switch (tableFields[i].fieldName) {
                case 'locationId':
                    innerArray.push(extractLocationId(e));
                    break;
                case 'age':
                    let years = get(e, `[${tableFields[i].fieldName}].years`, 0);
                    let months = get(e, `[${tableFields[i].fieldName}].months`, 0);
                    innerArray.push(Math.max(years, months));
                    break;
                case 'deleted':
                    if (get(e, `[${tableFields[i].fieldName}]`, null) !== true) {
                        innerArray.push(false);
                    } else {
                        innerArray.push(get(e, `[${tableFields[i].fieldName}]`, false));
                    }
                    break;
                case 'indexDay':
                    innerArray.push(get(e, `[index]`, null));
                    break;
                case 'address':
                    innerArray.push(get(e, '[addresses]', null) ? JSON.stringify(get(e, '[addresses]', null)) : null);
                    break;
                default:
                    if (i === tableFields.length - 1) {
                        innerArray.push(JSON.stringify(e));
                    } else if (constants.relationshipsMappedFields.includes(tableFields[i].fieldName)) {
                        innerArray.push(mapRelationshipFields(e, tableFields[i].fieldName));
                    } else if (tableName === 'person' && e.type === translations.personTypes.events && tableFields[i].fieldName === 'firstName') {
                        innerArray.push(get(e, `name`, null));
                    } else if (tableName === 'person' && (tableFields[i].fieldName === 'firstName' || tableFields[i].fieldName === 'lastName')) {
                        innerArray.push(get(e, `[${tableFields[i].fieldName}]`, ''));
                    } else {
                        innerArray.push(get(e, `[${tableFields[i].fieldName}]`, null));
                    }
            }
        }

        //     if (i === tableFields.length - 1) {
        //         innerArray.push(JSON.stringify(e));
        //     } else {
        //         if (tableFields[i].fieldName === 'locationId') {
        //             innerArray.push(extractLocationId(e));
        //         } else {
        //             if (tableFields[i].fieldName === 'age') {
        //                 let years = get(e, `[${tableFields[i].fieldName}].years`, 0);
        //                 let months = get(e, `[${tableFields[i].fieldName}].months`, 0);
        //                 innerArray.push(Math.max(years, months));
        //             } else {
        //                 if (tableFields[i].fieldName === 'indexDay') {
        //                     innerArray.push(get(e, `[index]`, null));
        //                 } else {
        //                     if (constants.relationshipsMappedFields.includes(tableFields[i].fieldName)) {
        //                         innerArray.push(mapRelationshipFields(e, tableFields[i].fieldName));
        //                     } else {
        //                         if (tableName === 'person' && e.type === translations.personTypes.events && tableFields[i].fieldName === 'firstName') {
        //                             innerArray.push(get(e, `name`, null));
        //                         } else {
        //                             if (tableName === 'person' && (tableFields[i].fieldName === 'firstName' || tableFields[i].fieldName === 'lastName')) {
        //                                 innerArray.push(get(e, `[${tableFields[i].fieldName}]`, ''));
        //                             } else {
        //                                 if (tableFields[i].fieldName === 'deleted') {
        //                                     if (get(e, `[${tableFields[i].fieldName}]`, null) !== true) {
        //                                         innerArray.push(false);
        //                                     } else {
        //                                         innerArray.push(get(e, `[${tableFields[i].fieldName}]`, false));
        //                                     }
        //                                 } else {
        //                                     innerArray.push(get(e, `[${tableFields[i].fieldName}]`, null));
        //                                 }
        //                             }
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }
        return innerArray;
    })
}
// Method for mapping the relationship data as needed in the database structure
function mapRelationshipFields(relationship, fieldName) {
    if (checkArray(get(relationship, 'persons', null)) && relationship.persons.length === 2) {
        // console.log('Relationship log: ', relationship.persons);
        if ((!relationship.persons[0].source && !relationship.persons[0].target) || (!relationship.persons[1].source && !relationship.persons[1].target)) {
            if (appConfig.env === 'development') {
                console.log('mapRelationshipFields relationship without source/target: ', relationship._id);
            }
            return null;
        }
        switch (fieldName) {
            // sourceId
            case constants.relationshipsMappedFields[0]:
                return relationship.persons.find((e) => {
                    return e.source === true;
                }).id;
            // sourceType
            case constants.relationshipsMappedFields[1]:
                return relationship.persons.find((e) => {
                    return e.source === true;
                }).type;
            // targetId
            case constants.relationshipsMappedFields[2]:
                return relationship.persons.find((e) => {
                    return e.target === true;
                }).id;
            // targetType
            case constants.relationshipsMappedFields[3]:
                return relationship.persons.find((e) => {
                    return e.target === true;
                }).type;
            default:
                return null;
        }
    } else {
        return null;
    }
}

// Execute a query based on a query object
export function executeQuery(queryObject) {
    let wasCount = false;
    // return async function (dispatch) {
    let start = new Date().getTime();
    return openDatabase('common')
        .then((database) => wrapTransationInPromise(database))
        .then((transaction) => {

            let sql = jsonSql.build(queryObject);
            if (sql.query.includes('count')) {
                wasCount = true;
            }

            start = new Date().getTime();
            return wrapExecuteSQLInPromise(transaction, sql.query, Object.values(sql.values))
        })
        .then((result) => {
            console.log('Query executed in: ', new Date().getTime() - start);
            // dispatch(storeFollowUps([]));
            let mappedData = generalMapping1(result.rows._array, queryObject.fields);
            return Promise.resolve(mappedData);
        })
        .catch((errorGetStuff) => {
            console.log('Error for query execution: ', errorGetStuff);
            return Promise.reject(errorGetStuff)
        })
    // }
}
function generalMapping1(unmappedData, queryFields) {
    console.log("The unmapped data", unmappedData.length);
    if (checkArrayAndLength(queryFields)) {
        let fields = queryFields.map((e) => e.alias);
        return unmappedData.map((e) => {
            // console.log("Problem", fields);
            for (let i=0; i<fields.length; i++) {
                if (fields[i].includes('count')){
                    e[fields[i]] = e[fields[i]];
                }
                else if (fields[i].includes('xposure')) {
                    if (e[fields[i]] !== null) {
                        let exposures = e[fields[i]].split('***');
                        e[fields[i]] = exposures.map((f) => {return JSON.parse(f)});
                    }
                } else {
                    try {
                        e[fields[i]] = JSON.parse(e[fields[i]]);
                    } catch(errorParseNonJson) {
                        e[fields[i]] = e[fields[i]];
                    }
                }
            }
            return e;
        })
    } else {
        throw new Error('Invalid object send to map: queryFields')
    }
}