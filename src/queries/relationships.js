/**
 * Created by florinpopa on 02/10/2018.
 */
import { getDatabase } from './database';
import moment from 'moment';
import config from './../utils/config';
import {createDate} from './../utils/functions';
import {filterFollowUpsByTeams} from './followUps';

// Credentials: {email, encryptedPassword}
export function getRelationshipsForTypeRequest(outbreakId, searchType, keys, callback) {
    let start = new Date().getTime();
    getDatabase(config.mongoCollections.relationship)
        .then((database) => {
            if (!keys || keys.length === 0) {
                callback(null, []);
            }
            database.find({
                selector: {
                    _id: {
                        $gte: `relationship.json_${outbreakId}_`,
                        $lte: `relationship.json_${outbreakId}_\uffff`
                    },
                    deleted: false,
                    $or: [
                        { 'persons.0.id': { $in: keys } },
                        { 'persons.1.id': { $in: keys } }
                    ]
                }
            })
                .then((result) => {
                    console.log('Result for find time in finding relationships: ', new Date().getTime() - start, result.docs.length);
                    callback(null, result.docs)
                })
                .catch((error) => {
                    console.log('Error in finding relationships: ', error);
                    callback(error)
                })
        })
        .catch((errorGetDatabase) => {
            console.log('Error while getting database: ', errorGetDatabase);
            callback(errorGetDatabase);
        });
}

export function getRelationshipsAndFollowUpsForContactRequest(outbreakId, keys, filter, userTeams, callback) {

    let start = new Date().getTime();

    let oneDay = 24 * 60 * 60 * 1000;
    let startDate = '';
    let endDate = '';
    if (filter && filter.date) {
        startDate = createDate(filter.date).getTime();
        endDate = createDate(filter.date, true).getTime();
    }

    // let promiseArray = [];


    // Rewrite here to improve readability
    let followUpsPromise = getDatabase(config.mongoCollections.followUp)
                                .then((database) => database.find({
                                    selector: {
                                        _id: {
                                            $gte: `followUp.json_${outbreakId}_${startDate}_`,
                                            $lte: `followUp.json_${outbreakId}_${endDate}_\uffff`
                                        },
                                        deleted: false,
                                        outbreakId: outbreakId,
                                        personId: {$eq: keys}
                                    }
                                }))
                                .then((result) => {
                                    return filterFollowUpsByTeams(result.docs, userTeams);
                                });

    let relationshipsPromise = getDatabase(config.mongoCollections.relationship)
                                .then((database) => database.find({
                                    selector: {
                                        _id: {
                                            $gte: `relationship.json_${outbreakId}_`,
                                            $lte: `relationship.json_${outbreakId}_\uffff`
                                        },
                                        deleted: false,
                                        $or: [
                                            { 'persons.0.id': { $eq: keys } },
                                            { 'persons.1.id': { $eq: keys } },
                                        ]
                                    }
                                }))
                                .then((result) => result.docs);

    Promise.all([followUpsPromise, relationshipsPromise])
        .then((results) => {
            let aux = [];
            Array.from(results, (x) => { x.map((e) => { aux.push(e) }) });
            console.log('Result for find time for getRelationshipsAndFollowUpsForContactsRequest: ', new Date().getTime() - start);
            callback(null, aux);
        })
        .catch((errorGetData) => {
            console.log(errorGetData);
            callback(errorGetData);
        });

    // getDatabase(config.mongoCollections.followUp)
    //     .then((databaseFollowUp) => {
    //         promiseArray.push(databaseFollowUp.find({
    //             selector: {
    //                 _id: {
    //                     $gte: `followUp.json_${outbreakId}_${startDate}_`,
    //                     $lte: `followUp.json_${outbreakId}_${endDate}_\uffff`
    //                 },
    //                 deleted: false,
    //                 outbreakId: outbreakId,
    //                 personId: { $eq: keys }
    //             }
    //         }).then((result) => {
    //             let followUpList = result.docs;
    //             if (userTeams !== null && userTeams !== undefined && Array.isArray(userTeams) && userTeams.length > 0) {
    //                 followUpList = followUpList.filter((e) => {
    //                     return userTeams.indexOf(e.teamId) >= 0 || e.teamId === undefined || e.teamId === null
    //                 })
    //             }
    //             return followUpList
    //         }));
    //
    //         getDatabase(config.mongoCollections.relationship)
    //             .then((databaseRelationship) => {
    //                 promiseArray.push(databaseRelationship.find({
    //                     selector: {
    //                         _id: {
    //                             $gte: `relationship.json_${outbreakId}_`,
    //                             $lte: `relationship.json_${outbreakId}_\uffff`
    //                         },
    //                         deleted: false,
    //                         $or: [
    //                             { 'persons.0.id': { $eq: keys } },
    //                             { 'persons.1.id': { $eq: keys } },
    //                         ]
    //                     }
    //                 }).then((result) => { return result.docs }));
    //
    //                 Promise.all(promiseArray)
    //                     .then((results) => {
    //                         let aux = [];
    //                         Array.from(results, (x) => { x.map((e) => { aux.push(e) }) });
    //                         console.log('Result for find time for getRelationshipsAndFollowUpsForContactsRequest: ', new Date().getTime() - start);
    //                         callback(null, aux);
    //                     })
    //                     .catch((errorGetData) => {
    //                         console.log(errorGetData);
    //                         callback(errorGetData);
    //                     })
    //
    //             })
    //             .catch((errorGetDatabase) => {
    //                 console.log('Error while getting databaseRelationship: ', errorGetDatabase);
    //                 callback(errorGetDatabase);
    //             });
    //     })
    //     .catch((errorGetDatabase) => {
    //         console.log('Error while getting databaseFollowUp: ', errorGetDatabase);
    //         callback(errorGetDatabase);
    //     });
}