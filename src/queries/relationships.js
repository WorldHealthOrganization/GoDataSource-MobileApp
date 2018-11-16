/**
 * Created by florinpopa on 02/10/2018.
 */
import {getDatabase} from './database';
import moment from 'moment';

// Credentials: {email, encryptedPassword}
export function getRelationshipsForTypeRequest (outbreakId, searchType, keys, callback) {
    let database = getDatabase();

    // console.log("getRelationshipsForOutbreakIdRequest: ", outbreakId, keys);

    let start =  new Date().getTime();
    if (!keys || keys.length === 0) {
        callback(null, []);
    }
    database.find({
        selector: {
            _id: {
                $gte: `relationship.json_false_${outbreakId}_`,
                $lte: `relationship.json_false_${outbreakId}_\uffff`
            },
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

export function getRelationshipsAndFollowUpsForContactRequest (outbreakId, keys, filter, callback) {
    let database = getDatabase();

    let oneDay = 24 * 60 * 60 * 1000;
    let startDate = '';
    let endDate = '';
    if (filter && filter.date) {
        startDate = new Date(`${filter.date.getMonth() + 1}/${filter.date.getDate()}/${filter.date.getFullYear()}`).getTime();
        endDate = moment(filter.date.getTime() + oneDay).add(-1, 'second')._d.getTime();
    }

    database.find({
        selector: {
            $or: [
                {
                    _id: {
                        $gte: `followUp.json_false_${outbreakId}_${startDate}_`,
                        $lte: `followUp.json_false_${outbreakId}_${endDate}_\uffff`
                    },
                    deleted: false,
                    outbreakId: outbreakId,
                    personId: {$eq: keys}
                },{
                    _id: {
                        $gte: `relationship.json_false_${outbreakId}_`,
                        $lte: `relationship.json_false_${outbreakId}_\uffff`
                    },
                    deleted: false,
                    $or: [
                        {'persons.0.id': {$eq: keys}},
                        {'persons.1.id': {$eq: keys}},
                    ],
                }
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