import SQLite, {encodeName} from 'react-native-sqlcipher-2';
import {database} from './../database';
import constants from './constants';
import get from 'lodash/get';
import isObject from 'lodash/isObject';
import {extractLocationId} from './../../utils/functions';
import {checkArray, checkArrayAndLength} from './../../utils/typeCheckingFunctions';
import translations from "../../utils/translations";
import {generalMapping} from "../../actions/followUps";
var jsonSql = require('json-sql')();
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
    // console.log('Execute query: ', sqlStatement, arrayOfFields);
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
            let insertOrUpdateString = insertOrUpdateStringCreation(tableName);
            let mappedData = mapDataForInsert(tableName, data);
            if (checkArrayAndLength(mappedData)) {
                return Promise.resolve()
                    .then(() => openDatabase(databaseName))
                    .then(wrapTransationInPromise)
                    .then((txn) => {
                        if (createTableBool) {
                            return createTable(txn, tableName);
                        }
                        return Promise.resolve(txn);
                    })
                    .then((txn) => {
                        let dataToBeInsertedPromise = [];
                        let i = 0;
                        while(i < mappedData.length) {
                            dataToBeInsertedPromise.push(wrapExecuteSQLInPromise(txn, insertOrUpdateString, mappedData[i], i < mappedData.length  - 1).catch((error) => console.log('stuff')));
                            i++;
                        }
                        return Promise.all(dataToBeInsertedPromise)
                            .then((results) => {
                                dataToBeInsertedPromise = null;
                                return Promise.resolve(results)
                            });
                    })
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
            if (i === tableFields.length - 1) {
                innerArray.push(JSON.stringify(e));
            } else {
                if (tableFields[i].fieldName === 'locationId') {
                    innerArray.push(extractLocationId(e));
                } else {
                    if (tableFields[i].fieldName === 'age') {
                        let years = get(e, `[${tableFields[i].fieldName}].years`, 0);
                        let months = get(e, `[${tableFields[i].fieldName}].months`, 0);
                        innerArray.push(Math.max(years, months));
                    } else {
                        if (tableFields[i].fieldName === 'indexDay') {
                            innerArray.push(get(e, `[index]`, null));
                        } else {
                            if (constants.relationshipsMappedFields.includes(tableFields[i].fieldName)) {
                                innerArray.push(mapRelationshipFields(e, tableFields[i].fieldName));
                            } else {
                                if (tableName === 'person' && e.type === translations.personTypes.events && tableFields[i].fieldName === 'firstName') {
                                    innerArray.push(get(e, `name`, null));
                                } else {
                                    if (tableName === 'person' && (tableFields[i].fieldName === 'firstName' || tableFields[i].fieldName === 'lastName')) {
                                        innerArray.push(get(e, `[${tableFields[i].fieldName}]`, ''));
                                    } else {
                                        innerArray.push(get(e, `[${tableFields[i].fieldName}]`, null));
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return innerArray;
    })
}
// Method for mapping the relationship data as needed in the database structure
function mapRelationshipFields(relationship, fieldName) {
    if (!checkArray(get(relationship, 'persons', null)) || relationship.persons.length !== 2) {
        return null;
    }
    switch(fieldName) {
            // sourceId
        case constants.relationshipsMappedFields[0]:
            return relationship.persons.find((e) => {return e.source === true;}).id;
            // sourceType
        case constants.relationshipsMappedFields[1]:
            return relationship.persons.find((e) => {return e.source === true;}).type;
            // targetId
        case constants.relationshipsMappedFields[2]:
            return relationship.persons.find((e) => {return e.target === true;}).id;
            // targetType
        case constants.relationshipsMappedFields[3]:
            return relationship.persons.find((e) => {return e.target === true;}).type;
        default:
            return null;
    }
}

// Execute a query based on a query object
export function executeQuery(queryObject) {
    // return async function (dispatch) {
    let start = new Date().getTime();
    return openDatabase('common')
        .then((database) => wrapTransationInPromise(database))
        .then((transaction) => {

            let sql = jsonSql.build(queryObject);

            // console.log('Sql statement: ', sql);
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
    if (checkArrayAndLength(queryFields)) {
        let fields = queryFields.map((e) => e.alias);
        return unmappedData.map((e) => {
            for (let i=0; i<fields.length; i++) {
                if (fields[i].includes('xposure')) {
                    if (e[fields[i]] !== null) {
                        let exposures = e[fields[i]].split('***');
                        e[fields[i]] = exposures.map((f) => JSON.parse(f));
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