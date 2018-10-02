/**
 * Created by florinpopa on 18/09/2018.
 */
import {getDatabase} from './database';

// Credentials: {email, encryptedPassword}
export function getReferenceDataRequest (token, callback) {
    let database = getDatabase();

    console.log("getReferenceDataRequest: ");

    database.allDocs({startkey: `referenceData.json_false_`, endkey: `referenceData.json_false_\uffff`, include_docs: true})
        .then((result) => {
            console.log("result with the new index for reference data: ");
            callback(null, result.rows.map((e) => {return e.doc}));
        })
        .catch((errorQuery) => {
            console.log("Error with the new index for reference data: ", errorQuery);
            callback(errorQuery);
        })

    // database.query('whoQueries/getContactsForOutbreakId', {key: [outbreakId, 0], include_docs: true})
    //     .then((result) => {
    //         console.log("Result from getting contacts for outbreak id: ", result);
    //     })
    //     .catch((error) => {
    //         console.log("Error while getting contact for outbreak id: ", error);
    //     })
}