/**
 * Created by florinpopa on 18/09/2018.
 */
import {getDatabase} from './database';

// Credentials: {email, encryptedPassword}
export function getTranslationRequest (languageId, callback) {
    let database = getDatabase();

    console.log("getTranslationRequest: ", languageId);

    let start =  new Date().getTime();
    database.allDocs({startkey: `languageToken.json_false_${languageId}`, endkey: `languageToken.json_false_${languageId}\uffff`, include_docs: true})
        .then((result) => {
            console.log("result with the new index for translation: ", new Date().getTime() - start);
            callback(null, result.rows.map((e) => {return e.doc}));
        })
        .catch((errorQuery) => {
            console.log("Error with the new index for translation: ", errorQuery);
            callback(errorQuery);
        })

    // database.find({
    //     selector: {
    //         languageId: languageId,
    //         fileType: 'languageToken.json',
    //         deleted: false
    //     }
    // })
    //     .then((resultFind) => {
    //         console.log('Result for find time for translations: ', new Date().getTime() - start);
    //         callback(null, resultFind.docs)
    //     })
    //     .catch((errorFind) => {
    //         console.log('Error find for translations: ', errorFind);
    //         callback(errorFind);
    //     })
}