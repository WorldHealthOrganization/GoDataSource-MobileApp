import {getDatabase} from './database';
import config from './../utils/config'

export function getLocationsByOutbreakIdRequest (outbreakResponse, callback) {
    let start = new Date().getTime();
    getDatabase(config.mongoCollections.location)
        .then((database) => {
            database.find({
                selector: {
                    _id: {
                        $gte: `location.json_`,
                        $lte: `location.json_\uffff`
                    },
                    deleted: false
                }
            })
                .then((result) => {
                    console.log("Result for find time for getLocationsByOutbreakIdRequest: ", new Date().getTime() - start);
                    callback(null, result.docs);
                })
                .catch((errorQuery) => {
                    console.log("Error getLocationsByOutbreakIdRequest: ", errorQuery);
                    callback(errorQuery);
                })
        })
        .catch((errorGetDatabase) => {
            console.log('Error while getting database: ', errorGetDatabase);
            callback(errorGetDatabase);
        });
}
