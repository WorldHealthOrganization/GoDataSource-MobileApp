import {executeQuery} from "./sqlTools/helperMethods";
import config from './../utils/config';
import {rawSQLQuery} from './sqlHelper';

export function getLocationsByOutbreakIdRequest (outbreakResponse, callback) {

    // let query = {
    //     type: 'select',
    //     table: 'location',
    //     fields: [
    //         {
    //             name: 'json',
    //             alias: 'locationData',
    //             table: 'location'
    //         }
    //     ]
    // };
    //
    // executeQuery(query)
    //     .then((locationData) => {
    //         callback(null, locationData.map((e) => e.locationData));
    //     })
    //     .catch((errorLanguageData) => {
    //         callback(errorLanguageData);
    //     })

    rawSQLQuery(config.mongoCollections.location, `${config.rawSQLQueryString}`, [])
        .then((result) => {
            callback(null, result);
        })
        .catch((error) => {
            callback(error)
        })
}
