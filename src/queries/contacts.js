/**
 * Created by florinpopa on 13/09/2018.
 */
import {getDatabase} from './database';

// Credentials: {email, encryptedPassword}
export function getContactsForOutbreakIdRequest (outbreakId, filter, token, callback) {
    let database = getDatabase();

    console.log("getContactsForOutbreakIdRequest: ", outbreakId, filter, token, callback);

    database.createIndex({
        index: {
            fields: ['fileType', 'type', 'outbreakId'],
            name: 'indexForPerson'
        }
    })
        .then((result) => {
            console.log("Create index result: ", result);
            database.find({
                selector: {fileType: 'person.json', type: 'contact', outbreakId: outbreakId}
            })
                .then((resultFind) => {
                    console.log("Result From find: ", resultFind)
                })
                .catch((errorFind) => {
                    console.log("Error from find: ", errorFind);
                })
        })
        .catch((errorCreateIndex) => {
            console.log('Error while creating index: ', errorCreateIndex);
        })

    // database.query('whoIndexes/mapStuff', {startKey: [outbreakId, 0], endKey: [outbreakId, 2], include_docs: true})
    //     .then((result) => {
    //         console.log("Result from getting contacts for outbreak id: ", result);
    //     })
    //     .catch((error) => {
    //         console.log("Error while getting contact for outbreak id: ", error);
    //     })
}