// import {getDatabase} from './database';
import config from './../utils/config'
import {rawSQLQuery} from "./sqlHelper";

export function getLocationsByOutbreakIdRequest (outbreakResponse, callback) {


    rawSQLQuery(config.mongoCollections.location, `${config.rawSQLQueryString}`, [])
        .then((result) => {
            callback(null, result);
        })
        .catch((error) => {
            callback(error)
        })
}
