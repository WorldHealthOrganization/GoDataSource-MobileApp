
import {getDatabase} from './database';

export function getLocationsByOutbreakIdRequest (callback) {
    let database = getDatabase();

    database.allDocs({
        startkey: `location.json_false_`,
        endkey: `location.json_false_\uffff`,
        include_docs: true
    })
        .then((result) => {
            console.log("result getLocationsByOutbreakIdRequest: ");
            callback(null, result.rows.map((e) => {return e.doc}));
        })
        .catch((errorQuery) => {
            console.log("Error getLocationsByOutbreakIdRequest: ", errorQuery);
            callback(errorQuery);
        })
}
