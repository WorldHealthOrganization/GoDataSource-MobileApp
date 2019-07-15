/**
 * Created by florinpopa on 18/09/2018.
 */
import {getDatabase} from './database';
import config from './../utils/config';
import {rawSQLQuery} from "./sqlHelper";

// Credentials: {email, encryptedPassword}
export function getReferenceDataRequest (token, callback) {

    rawSQLQuery(config.mongoCollections.referenceData, `${config.rawSQLQueryString}`, [])
        .then((result) => {
            callback(null, result);
        })
        .catch((error) => {
            console.log('Error get translations: ', error);
            callback(error)
        })

    // let start =  new Date().getTime();
    // getDatabase(config.mongoCollections.referenceData)
    //     .then((database) => {
    //         database.find({
    //             selector: {
    //                 _id: {
    //                     $gte: `referenceData.json_`,
    //                     $lte: `referenceData.json_\uffff`,
    //                 },
    //                 deleted: false
    //             }
    //         })
    //             .then((resultFind) => {
    //                 console.log('Result for find time for reference data: ', new Date().getTime() - start);
    //                 callback(null, resultFind.docs)
    //             })
    //             .catch((errorFind) => {
    //                 console.log('Error find for reference data: ', errorFind);
    //                 callback(errorFind);
    //             })
    //     })
    //     .catch((errorGetDatabase) => {
    //         console.log('Error while getting database: ', errorGetDatabase);
    //         callback(errorGetDatabase);
    //     });
}