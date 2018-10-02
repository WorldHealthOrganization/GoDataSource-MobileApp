/**
 * Created by florinpopa on 13/09/2018.
 */
import {getDatabase} from './database';

// Credentials: {email, encryptedPassword}
export function getOutbreakByIdRequest (outbreakId, token, callback) {
    let database = getDatabase();

    console.log('GetOutbreakByIdRequest: ', outbreakId);

    // For searching by ID it is recommended to use the PouchDB allDocs method with the ID as a key, since primary indexes are much faster than secondary ones
    database.get('outbreak.json_false_' + outbreakId)
        .then((result) => {
            console.log("Result from getting outbreak: ", result);
            callback(null, result);
        })
        .catch((errorGetOutbreak) => {
            console.log("Error from getting outbreak: ", errorGetOutbreak);
            callback(errorGetOutbreak);
        })
}