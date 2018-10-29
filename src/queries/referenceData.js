/**
 * Created by florinpopa on 18/09/2018.
 */
import {getDatabase} from './database';

// Credentials: {email, encryptedPassword}
export function getReferenceDataRequest (token, callback) {
    let database = getDatabase();

    console.log("getReferenceDataRequest: ");

    let start =  new Date().getTime();
    database.allDocs({
        startkey: `referenceData.json_false_`,
        endkey: `referenceData.json_false_\uffff`,
        include_docs: true
    })
        .then((result) => {
            console.log("result with the new index for reference data: ", new Date().getTime() - start);
            callback(null, result.rows.map((e) => {return e.doc}));
        })
        .catch((errorQuery) => {
            console.log("Error with the new index for reference data: ", errorQuery);
            callback(errorQuery);
        })

    // database.find({
    //     selector: {
    //         fileType: 'referenceData.json',
    //         deleted: false
    //     }
    // })
    //     .then((resultFind) => {
    //         console.log('Result for find time for reference data: ', new Date().getTime() - start);
    //         callback(null, resultFind.docs)
    //     })
    //     .catch((errorFind) => {
    //         console.log('Error find for reference data: ', errorFind);
    //         callback(errorFind);
    //     })
}