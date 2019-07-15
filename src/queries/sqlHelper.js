import SQLite, {encodeName} from 'react-native-sqlcipher-2';
import {database} from './database';
import get from 'lodash/get';
import groupBy from 'lodash/groupBy';

// import SQLiteQueryBuilder from 'simple-sql-query-builder';

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

// Given 2 queries, 2 join conditions and an optional filter cond for the result, performs joins. Can work as nested
export function innerJoin (leftQuery, rightQuery, leftJoinCond, rightJoinCond, additionalFilter) {
    return new Promise((resolve, reject) => {
        Promise.all([
            leftQuery,
            rightQuery
        ])
            .then((results) => {
                let result = [];
                let left = get(results, '[0]');
                let right = groupBy(get(results, '[1]'), rightJoinCond);

                for (let i=0; i<left.length; i++) {
                    if (right(left[i][leftJoinCond])) {
                        result.push({left: left[i], right: right[left[i][leftJoinCond][0]]})
                    }
                }

                resolve(result);
            })
            .catch((errorQueries) => {
                reject(errorQueries)
            })
    })
}

// Given a query, this method returns all the related models in a one to many relationship by performing multiple gets
export function populate (query, relatedDatabase, idFormula) {
    return new Promise((resolve, reject) => {

    })
}