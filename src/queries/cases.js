/**
 * Created by florinpopa on 18/09/2018.
 */
import {getDatabase} from './database';

// Credentials: {email, encryptedPassword}
export function getCasesForOutbreakIdRequest (outbreakId, filter, token, callback) {
    let database = getDatabase();

    console.log("getCasesForOutbreakIdRequest: ", outbreakId);

    database.allDocs({
        startkey: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE_false_${outbreakId}`,
        endkey: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE_${outbreakId}\uffff`,
        include_docs: true
    })
        .then((result) => {
            console.log("result with the new index for cases: ");
            callback(null, result.rows.map((e) => {return e.doc}));
        })
        .catch((errorQuery) => {
            console.log("Error with the new index for cases: ", errorQuery);
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