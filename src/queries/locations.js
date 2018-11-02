
import {getDatabase} from './database';

export function getLocationsByOutbreakIdRequest (outbreakResponse, callback) {
    let database = getDatabase();


    if (outbreakResponse && outbreakResponse.locationIds) {
        database.find({
            selector: {
                _id: {
                    $gte: `location.json_false_`,
                    $lte: `location.json_false_\uffff`,
                    $in: outbreakResponse.locationIds
                },
                parentLocationId: {
                    $in: outbreakResponse.locationIds
                }
            }
        })
            .then((result) => {
                console.log("result getLocationsByOutbreakIdRequest: ");
                callback(null, result.docs);
            })
            .catch((errorQuery) => {
                console.log("Error getLocationsByOutbreakIdRequest: ", errorQuery);
                callback(errorQuery);
            })
    } else {
        database.find({
            selector: {
                _id: {
                    $gte: `location.json_false_`,
                    $lte: `location.json_false_\uffff`
                }
            }
        })
            .then((result) => {
                console.log("result getLocationsByOutbreakIdRequest: ");
                callback(null, result.docs);
            })
            .catch((errorQuery) => {
                console.log("Error getLocationsByOutbreakIdRequest: ", errorQuery);
                callback(errorQuery);
            })
    }
}
