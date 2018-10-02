/**
 * Created by florinpopa on 18/09/2018.
 */
import {getDatabase} from './database';

// Credentials: {email, encryptedPassword}
export function getEventsForOutbreakIdRequest (outbreakId, token, callback) {
    let database = getDatabase();

    console.log("getEventsForOutbreakIdRequest: ", outbreakId);

    database.allDocs({
        startkey: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_EVENT_false_${outbreakId}`,
        endkey: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_EVENT_false_${outbreakId}\uffff`,
        include_docs: true
    })
        .then((result) => {
            console.log("result with the new index for events: ");
            callback(null, result.rows.map((e) => {return e.doc}));
        })
        .catch((errorQuery) => {
            console.log("Error with the new index for events: ", errorQuery);
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