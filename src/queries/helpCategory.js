/**
 * Created by mobileclarisoft on 05/12/2018.
 */
import {getDatabase} from './database';
import config from './../utils/config';
import {rawSQLQuery} from "./sqlHelper";

export function getHelpCategoryRequest (token, callback) {

    // rawSQLQuery(config.mongoCollections.helpCategory, `${config.rawSQLQueryString}`, [])
    //     .then((result) => {
    //         callback(null, result);
    //     })
    //     .catch((error) => {
    //         console.log('Error get translations: ', error);
    //         callback(error)
    //     })

    let start = new Date().getTime();
    getDatabase(config.mongoCollections.helpCategory)
        .then((database) => {
            database.find({
                selector: {
                    _id: {
                        $gte: `helpCategory.json_`,
                        $lte: `helpCategory.json_\uffff`
                    },
                    deleted: false
                }
            })
                .then((result) => {
                    console.log("Result for find time for getHelpRequest: ", new Date().getTime() - start);
                    callback(null, result.docs);
                })
                .catch((errorQuery) => {
                    console.log("Error getHelpRequest: ", errorQuery);
                    callback(errorQuery);
                })
        })
        .catch((errorGetDatabase) => {
            console.log('Error while getting database: ', errorGetDatabase);
            callback(errorGetDatabase);
        });
}
