
import {getDatabase} from './database';

export function getLocationsByOutbreakIdRequest (outbreakResponse, callback) {
    let database = getDatabase();
    if (outbreakResponse && outbreakResponse.locationIds && Array.isArray(outbreakResponse.locationIds) && outbreakResponse.locationIds.length > 0) {
        database.find({
            selector: {
                _id: {
                    $gte: `location.json_`,
                    $lte: `location.json_\uffff`
                },
                $or: [
                    {
                        _id: {$in: outbreakResponse.locationIds.map((e) => {return `location.json_${e}`})}
                    },
                    {
                        parentLocationId: {
                            $in: outbreakResponse.locationIds
                        }
                    }
                ],
                deleted: false
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
                    $gte: `location.json_`,
                    $lte: `location.json_\uffff`
                },
                deleted: false
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
