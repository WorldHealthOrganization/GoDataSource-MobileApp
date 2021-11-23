/**
 * Created by florinpopa on 18/09/2018.
 */
import config from './../utils/config';
import {rawSQLQuery} from "./sqlHelper";

// Credentials: {email, encryptedPassword}
export function getReferenceDataRequest (token, callback) {

    rawSQLQuery(config.mongoCollections.referenceData, `${config.rawSQLQueryString} WHERE deleted like false`, [])
        .then((result) => {
            callback(null, result);
        })
        .catch((error) => {
            console.log('Error get translations: ', error);
            callback(error)
        })
}