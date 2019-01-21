
import {getDatabase} from './database';

export function getClustersdRequest (token, callback) {
    let database = getDatabase();

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
            console.log('Result for find clusters: ', resultFind);
            callback(null, resultFind.docs);
        })
        .catch((errorFind) => {
            console.log('Error find clusters: ', errorFind);
            callback(errorFind);
        })
}