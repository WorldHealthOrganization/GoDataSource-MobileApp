import {getDatabase} from './database';
import config from './../utils/config'

export function getLocationsByOutbreakIdRequest (outbreakResponse, callback) {
    getDatabase(config.mongoCollections.location)
        .then((database) => {
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
        })
        .catch((errorGetDatabase) => {
            console.log('Error while getting database: ', errorGetDatabase);
            callback(errorGetDatabase);
        });
}
