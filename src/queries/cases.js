/**
 * Created by florinpopa on 18/09/2018.
 */
import {getDatabase} from './database';
import config from './../utils/config';

// Credentials: {email, encryptedPassword}

export function checkForNameDuplicatesRequest (id, firstName, lastName, outbreakId, callback){
    getDatabase(config.mongoCollections.person)
        .then((database) => {
            let start = new Date().getTime();

            database.find({
                selector: {
                    _id: {
                        $gt: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE_${outbreakId}_`,
                        $lt: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE_${outbreakId}_\uffff`,
                        $ne: id
                    },
                    deleted: false,
                    firstName: firstName,
                    lastName: lastName
                },
            }).then((resultsCaseName) => {
                console.log('Result for find time for get duplicates name time: ', new Date().getTime() - start);
                // console.log('Result get duplicates name: ', resultsCaseName);
                callback(null, resultsCaseName.docs)
            }).catch((errorCaseName) => {
                console.log('Error when get duplicates name: ', errorCaseName);
                callback(errorCaseName);
            })
        })
        .catch((errorGetDatabase) => {
            console.log('Error while getting database: ', errorGetDatabase);
        });
}

