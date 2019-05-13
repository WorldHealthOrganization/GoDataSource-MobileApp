import {getDatabase} from './database';
import config from './../utils/config';

export function getClustersdRequest (token, callback) {
    getDatabase(config.mongoCollections.cluster)
        .then((database) => {
            database.find({
                selector: {
                    _id: {
                        $gte: `cluster.json_`,
                        $lte: `cluster.json_\uffff`,
                    },
                    deleted: false,
                }
            })
                .then((resultFind) => {
                    // console.log('Result for find clusters: ', resultFind);
                    callback(null, resultFind.docs);
                })
                .catch((errorFind) => {
                    console.log('Error find clusters: ', errorFind);
                    callback(errorFind);
                })
        })
        .catch((errorGetDatabase) => {
            console.log('Error while getting database: ', errorGetDatabase);
            callback(errorGetDatabase);
        });
}