/**
 * Created by florinpopa on 18/09/2018.
 */
import {getDatabase} from './database';

// Credentials: {email, encryptedPassword}
export function getEventsForOutbreakIdRequest (outbreakId, token, callback) {
    let database = getDatabase();

    console.log("getEventsForOutbreakIdRequest: ", outbreakId);

    let start =  new Date().getTime();
    database.allDocs({
        startkey: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_EVENT_false_${outbreakId}`,
        endkey: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_EVENT_false_${outbreakId}\uffff`,
        include_docs: true
    })
        .then((result) => {
            console.log("result with the new index for events: ", new Date().getTime() - start);
            callback(null, result.rows.map((e) => {return e.doc}));
        })
        .catch((errorQuery) => {
            console.log("Error with the new index for events: ", errorQuery);
            callback(errorQuery);
        })

    // database.find({
    //     selector: {
    //         type: 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_EVENT',
    //         fileType: 'person.json',
    //         deleted: false,
    //         outbreakId: outbreakId
    //     }
    // })
    //     .then((resultFind) => {
    //         console.log('Result for find time for events: ', new Date().getTime() - start);
    //         callback(null, resultFind.docs)
    //     })
    //     .catch((errorFind) => {
    //         console.log('Error find for events: ', errorFind);
    //         callback(errorFind);
    //     })
}