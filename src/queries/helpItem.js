/**
 * Created by mobileclarisoft on 05/12/2018.
 */
import {getDatabase} from './database';
import config from './../utils/config';

export function getHelpItemRequest (token, callback) {
    getDatabase(config.mongoCollections.helpItem)
        .then((database) => {
            database.find({
                selector: {
                    _id: {
                        $gte: `helpItem.json_`,
                        $lte: `helpItem.json_\uffff`
                    },
                    deleted: false
                }
            })
                .then((result) => {
                    // console.log("result getHelpRequest: ", result);
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
