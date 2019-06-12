import {getDatabase} from './database';
import config from './../utils/config';
import {rawSQLQuery} from "./sqlHelper";

export function getClustersdRequest (token, callback) {

    // rawSQLQuery(config.mongoCollections.cluster, `${config.rawSQLQueryString}`, [])
    //     .then((result) => {
    //         callback(null, result);
    //     })
    //     .catch((error) => {
    //         callback(error)
    //     })

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