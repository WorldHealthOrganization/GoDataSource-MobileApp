import {getDatabase} from './database';
import config from './../utils/config';

export function getClustersdRequest (outbreakId, callback) {
    let start = new Date().getTime();
    getDatabase(config.mongoCollections.cluster)
        .then((database) => {
            database.find({
                selector: {
                    _id: {
                        $gte: `cluster.json_`,
                        $lte: `cluster.json_\uffff`,
                    },
                    deleted: false,
                    outbreakId: outbreakId
                }
            })
                .then((resultFind) => {
                    console.log('Result for find time for clusters: ', new Date().getTime() - start);
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