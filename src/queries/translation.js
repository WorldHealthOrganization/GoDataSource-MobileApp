/**
 * Created by florinpopa on 18/09/2018.
 */
import {getDatabase} from './database';

// Credentials: {email, encryptedPassword}
export function getTranslationRequest (languageId, callback) {
    let database = getDatabase();

    console.log("getTranslationRequest: ", languageId);

    database.allDocs({startkey: `languageToken.json_false_${languageId}`, endkey: `languageToken.json_false_${languageId}\uffff`, include_docs: true})
        .then((result) => {
            console.log("result with the new index for translation: ");
            callback(null, result.rows.map((e) => {return e.doc}));
        })
        .catch((errorQuery) => {
            console.log("Error with the new index for translation: ", errorQuery);
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