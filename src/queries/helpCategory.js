/**
 * Created by mobileclarisoft on 05/12/2018.
 */
import {getDatabase} from './database';

export function getHelpCategoryRequest (token, callback) {
    let database = getDatabase();

    database.find({
        selector: {
            _id: {
                $gte: `helpCategory.json_`,
                $lte: `helpCategory.json_\uffff`
            },
            deleted: false
        }
    })
    .then((result) => {
        console.log("result getHelpRequest: ", result);
        callback(null, result.docs);
    })
    .catch((errorQuery) => {
        console.log("Error getHelpRequest: ", errorQuery);
        callback(errorQuery);
    })
}
