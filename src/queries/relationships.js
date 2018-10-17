/**
 * Created by florinpopa on 02/10/2018.
 */
import {getDatabase} from './database';
import _ from 'lodash';

// Credentials: {email, encryptedPassword}
export function getRelationshipsForTypeRequest (outbreakId, searchType, keys, callback) {
    let database = getDatabase();

    console.log("getRelationshipsForOutbreakIdRequest: ", outbreakId, keys);

    let start =  new Date().getTime();
    database.find({
        selector: {
            fileType: {$eq: ['relationship.json']},
            outbreakId: outbreakId,
            deleted: false,
            $or: [
                {'persons.0.id': {$in: keys}},
                {'persons.1.id': {$in: keys}}
            ]
        }
    })
        .then((result) => {
            console.log('Result in finding relationships: ', new Date().getTime() - start);
            callback(null, result.docs)
        })
        .catch((error) => {
            console.log('Error in finding relationships: ', error);
            callback(error)
        })
}

export function getRelationshipsAndFollowUpsForContactRequest (outbreakId, keys, callback) {
    let database = getDatabase();

    console.log("getRelationshipsAndFollowUpsForContact: ", outbreakId, keys);

    database.find({
        selector: {
            outbreakId: outbreakId,
            deleted: false,
            fileType: {$in: ['followUp.json', 'relationship.json']},
            $or: [
                {'persons.0.id': {$in: keys}},
                {'persons.1.id': {$in: keys}},
                {personId: {$in: keys}}
            ]
        }
    })
        .then((result) => {
            console.log('Result in finding relationships and followUp: ', JSON.stringify(result));
            callback(null, result.docs)
        })
        .catch((error) => {
            console.log('Error in finding relationships and followUp: ', error);
            callback(error)
        })
}