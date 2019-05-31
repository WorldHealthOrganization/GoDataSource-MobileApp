/**
 * Created by florinpopa on 13/09/2018.
 */
import {getDatabase} from './database';
import config from './../utils/config';

// Credentials: {email, encryptedPassword}
export function getOutbreakByIdRequest (outbreakId, token, callback) {
    getDatabase(config.mongoCollections.outbreak)
        .then((database) => {
            let start =  new Date().getTime();
            // For searching by ID it is recommended to use the PouchDB allDocs method with the ID as a key, since primary indexes are much faster than secondary ones

            database.get('outbreak.json_' + outbreakId)
                .then((result) => {
                    console.log("Result for find time for getting outbreak: ", new Date().getTime() - start);
                    callback(null, result);
                })
                .catch((errorGetOutbreak) => {
                    console.log("Error from getting outbreak: ", errorGetOutbreak);
                    callback(errorGetOutbreak);
                })
        })
        .catch((errorGetDatabase) => {
            console.log('Error while getting database: ', errorGetDatabase);
            callback(errorGetDatabase);
        });
}