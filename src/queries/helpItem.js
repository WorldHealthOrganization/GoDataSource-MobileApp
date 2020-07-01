/**
 * Created by mobileclarisoft on 05/12/2018.
 */
import config from './../utils/config';
import {rawSQLQuery} from "./sqlHelper";
import {getDatabase} from "./database";

export function getHelpItemRequest (token, callback) {

    // rawSQLQuery(config.mongoCollections.helpItem, `${config.rawSQLQueryString} WHERE `, [])
    //     .then((result) => {
    //         callback(null, result);
    //     })
    //     .catch((error) => {
    //         console.log('Error get translations: ', error);
    //         callback(error)
    //     })

    let start = new Date().getTime();
    getDatabase(config.mongoCollections.helpItem)
        .then((database) => {
            database.find({
                selector: {
                    _id: {
                        $gte: `helpItem.json_`,
                        $lte: `helpItem.json_\uffff`,
                    },
                    deleted: false,
                }
            })
                .then((resultFind) => {
                    console.log('Result for find time for helpItems: ', new Date().getTime() - start);
                    callback(null, resultFind.docs);
                })
                .catch((errorFind) => {
                    console.log('Error find helpItems: ', errorFind);
                    callback(errorFind);
                })
        })
        .catch((errorGetDatabase) => {
            console.log('Error while getting database: ', errorGetDatabase);
            callback(errorGetDatabase);
        });
}
