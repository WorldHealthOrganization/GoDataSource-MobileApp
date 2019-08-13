import SQLite, {encodeName} from 'react-native-sqlcipher-2';
import {database} from './../database';
import constants from './constants';
import get from 'lodash/get';
import {extractLocationId} from './../../utils/functions';

function openDatabase(databaseName) {
    return new Promise((resolve, reject) => {
        let fullDatabaseName = `${databaseName}${database.getDatabaseName()}`;
        try {
            let sqlDb = SQLite.openDatabase(encodeName(fullDatabaseName, database.getDatabasePassword()));
            resolve(sqlDb);
        } catch(errorOpenDatabase) {
            reject(new Error('Could not open database'));
        }
    })
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
export function createTable(databaseName, tableName) {
    return new Promise(async (resolve, reject) => {
        try {
            let createTableString = createTableStringMethod(tableName);
            let sqlDb = await openDatabase(databaseName);
            sqlDb.transaction((txn) => {
                txn.executeSql(createTableString, [],
                    (txn, resultSet) => {
                        console.log('SQLite console: Created table: ', tableName);
                        resolve(`Success ${tableName}`);
                    },
                    (txn, errorCreate) => {
                        console.log('SQLite console: Error while creating database: ', errorCreate);
                        reject(errorCreate);
                    })
            })
        } catch(openDatabaseError) {
            reject(new Error('Could not open database'));
        }
    })
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
        insertOrUpdateString = insertOrUpdateString + ` ON CONFLICT (id) DO UPDATE SET `;
        // Skip the id field (first field in the declared structure)
        for (let i=1; i<tableFields.length; i++) {
            insertOrUpdateString = insertOrUpdateString + `${tableFields[i].fieldName}=excluded.${tableFields[i].fieldName}`;
            if (i < tableFields - 1) {
                insertOrUpdateString = insertOrUpdateString + `, `;
            }
        }
        return insertOrUpdateString
    } catch (errorAtCreatingString) {
        console.log('SQLite console: error at creating insertOrUpdate string: ', errorAtCreatingString)
    }
}
// This method takes the databaseName, tableName and the mappedData and inserts it in bulk in the database
export function insertOrUpdate(databaseName, tableName, data) {
    return new Promise(async(resolve, reject) => {
        if (!mappedData || !Array.isArray(mappedData) || mappedData.length === 0) {
            resolve('Success');
        }
        try {
            let insertOrUpdateString = insertOrUpdateStringCreation(tableName);
            let mappedData = mapDataForInsert(tableName, data);
            if (mappedData && Array.isArray(mappedData) && mappedData.length > 0) {
                let sqlDb = await openDatabase(databaseName);
                sqlDb.transaction((txn) => {
                    for (let i=0; i<mappedData.length; i++) {
                        sqlDb.executeSql(insertOrUpdateString, mappedData[i],
                            (txn, resultSQL) => {
                                console.log('SQL Console: insertOrUpdate result of insert: ', resultSQL);
                            },
                            (txn, errorSQL) => {
                                console.log('SQL Console: insert or update error: ', errorSQL);
                            })
                    }
                    resolve('Success');
                });
            } else {
                resolve('Success');
            }
        } catch (openDatabaseError) {
            reject(new Error('Could not open database'));
        }
    })
}

// Data mapping method based on the structure of the tables
export function mapDataForInsert(tableName, data) {
    if (!tableName || !data || !Array.isArray(data) || data.length === 0) {
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
                    if (constants.relationshipsMappedFields.includes(tableFields[i].fieldName)) {
                        innerArray.push(mapRelationshipFields(e, tableFields[i].fieldName));
                    } else {
                        innerArray.push(get(e, `[${tableFields[i].fieldName}]`, null));
                    }
                }
            }
        }
        return innerArray;
    })
}
// Method for mapping the relationship data as needed in the database structure
function mapRelationshipFields(relationship, fieldName) {
    if (!relationship || !relationship.persons || !Array.isArray(relationship.persons) || relationship.persons.length !== 2) {
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