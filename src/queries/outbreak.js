/**
 * Created by florinpopa on 13/09/2018.
 */
import {getDatabase} from './database';
import config from './../utils/config';

// Credentials: {email, encryptedPassword}
export function getOutbreakByIdRequest(outbreakId, token, callback) {
    let start =  new Date().getTime();
    getDatabase(config.mongoCollections.outbreak)
        .then((database) => {
            console.log("This is the PK", 'outbreak.json_' + outbreakId);
            let request = database.get('outbreak.json_' + outbreakId);
            if (!outbreakId) {
                request = database.find({
                    selector: {deleted: false},
                    limit: 1
                })
            }
            // For searching by ID it is recommended to use the PouchDB allDocs method with the ID as a key, since primary indexes are much faster than secondary ones
            request
                .then((result) => {
                    console.log("Result for find time for getting outbreak: ", new Date().getTime() - start, result);
                    callback(null, result.docs ? result.docs[0] : result);
                })
                .catch((errorGetOutbreak) => {
                    console.log("Error from getting outbreak: ", errorGetOutbreak);
                    if (outbreakId) {
                        getOutbreakByIdRequest(null, token, callback);
                    } else {
                        callback(errorGetOutbreak);
                    }
                })
        })
        .catch((errorGetDatabase) => {
            console.log('Error while getting database: ', errorGetDatabase);
            callback(errorGetDatabase);
        });
}

export function getAllOutbreaks(callback) {
    let start =  new Date().getTime();
    getDatabase(config.mongoCollections.outbreak)
        .then((database) => {
            // For searching by ID it is recommended to use the PouchDB allDocs method with the ID as a key, since primary indexes are much faster than secondary ones
            database.find({
                selector: {deleted: false},
                // fields: ["name", "_id"]
            })
                .then((result) => {
                    console.log("Result for find time for getting all outbreaks: ", new Date().getTime() - start);
                    if(result?.docs){
                        callback(null, result.docs);
                    } else {
                        callback(null,[]);
                    }
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