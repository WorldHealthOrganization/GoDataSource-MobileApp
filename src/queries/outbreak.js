/**
 * Created by florinpopa on 13/09/2018.
 */
import {getDatabase} from './database';

// Credentials: {email, encryptedPassword}
export function getOutbreakByIdRequest (outbreakId, token, callback) {
    let database = getDatabase();

    // For searching by ID it is recommended to use the PouchDB allDocs method with the ID as a key, since primary indexes are much faster than secondary ones
    database.allDocs({key: outbreakId, include_docs: true})
        .then((result) => {
            console.log("Result from getting outbreak: ", result);
            callback(null, result.rows[0]);
        })
        .catch((errorGetOutbreak) => {
            console.log("Error from getting outbreak: ", errorGetOutbreak);
            callback(errorGetOutbreak);
        })
}