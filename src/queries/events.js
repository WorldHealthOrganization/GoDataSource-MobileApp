/**
 * Created by florinpopa on 18/09/2018.
 */
import {getDatabase} from './database';
import config from './../utils/config';

// Credentials: {email, encryptedPassword}
export function getEventsForOutbreakIdRequest (outbreakId, token, callback) {
    let start =  new Date().getTime();
    getDatabase(config.mongoCollections.cluster)
        .then((database) => {
            database.find({
                selector: {
                    _id: {
                        $gte: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_EVENT_${outbreakId}_`,
                        $lte: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_EVENT_${outbreakId}_\uffff`,
                    },
                    deleted: false
                }
            })
                .then((resultFind) => {
                    console.log('Result for find time for events: ', new Date().getTime() - start);
                    callback(null, resultFind.docs)
                })
                .catch((errorFind) => {
                    console.log('Error find for events: ', errorFind);
                    callback(errorFind);
                })
        })
        .catch((errorGetDatabase) => {
            console.log('Error while getting database: ', errorGetDatabase);
            callback(errorGetDatabase);
        });
}