/**
 * Created by mobileclarisoft on 05/12/2018.
 */
import config from './../utils/config';
import {rawSQLQuery} from "./sqlHelper";

export function getHelpItemRequest (token, callback) {

    rawSQLQuery(config.mongoCollections.helpItem, `${config.rawSQLQueryString}`, [])
        .then((result) => {
            callback(null, result);
        })
        .catch((error) => {
            console.log('Error get translations: ', error);
            callback(error)
        })
}
