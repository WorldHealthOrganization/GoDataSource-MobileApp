/**
 * Created by florinpopa on 13/09/2018.
 */
import {getDatabase} from './database';

// Credentials: {email, encryptedPassword}
export function getOutbreakByIdRequest (outbreakId, token, callback) {
    let database = getDatabase();

    console.log('GetOutbreakByIdRequest: ', outbreakId);

    let start =  new Date().getTime();
    // For searching by ID it is recommended to use the PouchDB allDocs method with the ID as a key, since primary indexes are much faster than secondary ones

    // database.allDocs({
    //     startkey: 'outbreak.json_false_',
    //     endkey: 'outbreak.json_false_\uffff',
    //     include_docs: true
    // })
    //     .then((allOutbreaks) => {
    //         console.log('All outbreaks: ', allOutbreaks.rows.map((e) => {return e.doc}));
            database.get('outbreak.json_false_' + outbreakId)
                .then((result) => {
                    console.log("Result from getting outbreak: ", new Date().getTime() - start);
                    callback(null, result);
                })
                .catch((errorGetOutbreak) => {
                    console.log("Error from getting outbreak: ", errorGetOutbreak);
                    callback(errorGetOutbreak);
                })
        // })
        // .catch((errorAllOutbreaks) => {
        //     console.log('Error all outbreaks: ', errorAllOutbreaks);
        // })
}