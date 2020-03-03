import SQLite, {encodeName} from 'react-native-sqlcipher-2';
import {database} from './database';
import get from 'lodash/get';

export function rawSQLQuery (collectionName, query, params) {
    return new Promise((resolve, reject) => {
        let start = new Date().getTime();

        // If we don't have a collection, than throw error
        if (!collectionName) {
            throw new Error('No collection name provided');
        }

        if (!query) {
            throw new Error('No query provided')
        }

        let databaseName = `${collectionName}${database.getDatabaseName()}`;
        try {
            let sqlDb = SQLite.openDatabase(encodeName(databaseName, database.getDatabasePassword()));
            sqlDb.readTransaction((txn) => {
                txn.executeSql(query, params,
                    (txn, resultQuery) => {
                        let mappedResult = get(resultQuery, 'rows._array', null);
                        if (mappedResult && Array.isArray(mappedResult) && mappedResult.length > 0) {
                            mappedResult = mappedResult.map((e) => { return Object.assign({}, JSON.parse(e.json), {_id: e._id}) }).filter((e) => { return !e.deleted });
                            console.log(`Result for find time for collection ${collectionName}: ${new Date().getTime() - start}`);
                            resolve(mappedResult);
                        } else {
                            console.log(`Result for find time for collection ${collectionName} with no result: ${new Date().getTime() - start}`);
                            resolve([]);
                        }
                    },
                    (txn, errorQuery) => {
                        console.log(`Error for find time for collection ${collectionName}: ${new Date().getTime() - start}`);
                        reject(errorQuery)
                    }
                )
            })
        } catch (errorOpenDatabase) {
            console.log('Error while opening Database: ', errorOpenDatabase);
            return reject(errorOpenDatabase);
        }
    })
}