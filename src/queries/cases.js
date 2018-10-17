/**
 * Created by florinpopa on 18/09/2018.
 */
import {getDatabase} from './database';

// Credentials: {email, encryptedPassword}
export function getCasesForOutbreakIdRequest (outbreakId, filter, token, callback) {
    let database = getDatabase();

    console.log("getCasesForOutbreakIdRequest: ", outbreakId);

    let start =  new Date().getTime();
    database.allDocs({
        startkey: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE_false_${outbreakId}`,
        endkey: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE_false_${outbreakId}\uffff`,
        include_docs: true
    })
        .then((result) => {
            console.log("result with the new index for cases: ", new Date().getTime() - start);
            callback(null, result.rows.map((e) => {return e.doc}));
        })
        .catch((errorQuery) => {
            console.log("Error with the new index for cases: ", errorQuery);
            callback(errorQuery);
        })

    // database.find({
    //     selector: {
    //         type: 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE',
    //         fileType: 'person.json',
    //         deleted: false,
    //         outbreakId: outbreakId
    //     }
    // })
    //     .then((resultFind) => {
    //         console.log('Result for find cases time: ', new Date().getTime() - start);
    //         callback(null, resultFind.docs)
    //     })
    //     .catch((errorFind) => {
    //         console.log('Error find cases: ', errorFind);
    //         callback(errorFind);
    //     })
}