/**
 * Created by mobileclarisoft on 05/12/2018.
 */
// import {getDatabase} from './database';
import config from './../utils/config';
import {rawSQLQuery} from "./sqlHelper";

export function getHelpCategoryRequest (token, callback) {

    rawSQLQuery(config.mongoCollections.helpCategory, `${config.rawSQLQueryString}`, [])
        .then((result) => {
            callback(null, result);
        })
        .catch((error) => {
            console.log('Error get translations: ', error);
            callback(error)
        })
}
