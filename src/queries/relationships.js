/**
 * Created by florinpopa on 02/10/2018.
 */
import {getDatabase} from './database';
import _ from 'lodash';

// Credentials: {email, encryptedPassword}
export function getRelationshipsForTypeRequest (outbreakId, searchType, keys, callback) {
    let database = getDatabase();

    console.log("getCasesForOutbreakIdRequest: ", outbreakId);

    database.find({
        selector: {
            fileType: {$in: ['relationship.json']},
            outbreakId: outbreakId,
            deleted: false,
            $or: [
                {'persons.0.id': {$in: keys}},
                {'persons.1.id': {$in: keys}}
            ]
        }
    })
        .then((result) => {
            console.log('Result in finding relationships: ');
            // Test something
            callback(null, result.docs)
        })
        .catch((error) => {
            console.log('Error in finding relationships: ', error);
            callback(error)
        })
}