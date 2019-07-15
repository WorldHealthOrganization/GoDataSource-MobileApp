/**
 * Created by florinpopa on 18/09/2018.
 */
import {getDatabase} from './database';
import {extractIdFromPouchId} from './../utils/functions';
import {generateId} from './../utils/functions';
import moment from 'moment';
import config from './../utils/config';

// Credentials: {email, encryptedPassword}
export function getFollowUpsForOutbreakRequest (outbreakId, filter, userTeams) {
    return new Promise((resolve, reject) => {
        let start = new Date().getTime();
        getDatabase(config.mongoCollections.followUp)
            .then((database) => {
                // Possible filters here are date and type, but we're not going to focus on type(to do, missed) since that can be mapped on the component
                // Here we're only going to get the followUps from a certain date
                // console.log('getFollowUpsForOutbreakIdRequest check date filter: ', filter);
                let oneDay = 24 * 60 * 60 * 1000;
                let startDate = '';
                let endDate = '';
                // new Date().getTimezoneOffset()
                if (filter && filter.date) {
                    startDate = new Date(`${filter.date.getMonth() + 1}/${filter.date.getDate()}/${filter.date.getFullYear()}`).getTime();
                    endDate = moment(filter.date.getTime() + (oneDay + (moment().isDST() ? filter.date.getTimezoneOffset() : (filter.date.getTimezoneOffset() - 60)) * 60 * 1000)).add(-1, 'second')._d.getTime();
                }

                database.find({
                    selector: {
                        _id: {
                            $gte: `followUp.json_${outbreakId}_${startDate}_`,
                            $lte: `followUp.json_${outbreakId}_${endDate}_\uffff`
                        },
                        deleted: false
                    }
                })
                    .then((resultFind) => {
                        let followUpList = resultFind.docs;
                        if (userTeams !== null && userTeams !== undefined && Array.isArray(userTeams) && userTeams.length > 0) {
                            followUpList = followUpList.filter((e) => {
                                return userTeams.indexOf(e.teamId) >= 0 || e.teamId === undefined || e.teamId === null
                            })
                        }
                        console.log('Result for find time for followUps: ', new Date().getTime() - start);
                        resolve(followUpList);
                    })
                    .catch((errorFind) => {
                        console.log('Error find for followUps: ', errorFind);
                        reject(errorFind);
                    })
            })
            .catch((errorGetDatabase) => {
                console.log('Error while getting database: ', errorGetDatabase);
                reject(errorGetDatabase);
            });
    })
}


export function getFollowUpsForOutbreakIdRequest (outbreakId, filter, userTeams, token, callback) {
    let start = new Date().getTime();
    getDatabase(config.mongoCollections.followUp)
        .then((database) => {
            // Possible filters here are date and type, but we're not going to focus on type(to do, missed) since that can be mapped on the component
            // Here we're only going to get the followUps from a certain date
            // console.log('getFollowUpsForOutbreakIdRequest check date filter: ', filter);
            let oneDay = 24 * 60 * 60 * 1000;
            let startDate = '';
            let endDate = '';
            // new Date().getTimezoneOffset()
            if (filter && filter.date) {
                startDate = new Date(`${filter.date.getMonth() + 1}/${filter.date.getDate()}/${filter.date.getFullYear()}`).getTime();
                endDate = moment(filter.date.getTime() + (oneDay + (moment().isDST() ? filter.date.getTimezoneOffset() : (filter.date.getTimezoneOffset() - 60)) * 60 * 1000)).add(-1, 'second')._d.getTime();
            }

            database.find({
                selector: {
                    _id: {
                        $gte: `followUp.json_${outbreakId}_${startDate}_`,
                        $lte: `followUp.json_${outbreakId}_${endDate}_\uffff`
                    },
                    deleted: false
                }
            })
                .then((resultFind) => {
                    let followUpList = resultFind.docs;
                    if (userTeams !== null && userTeams !== undefined && Array.isArray(userTeams) && userTeams.length > 0) {
                        followUpList = followUpList.filter((e) => {
                            return userTeams.indexOf(e.teamId) >= 0 || e.teamId === undefined || e.teamId === null
                        })
                    }
                    console.log('Result for find time for followUps: ', new Date().getTime() - start);
                    callback(null, followUpList);
                })
                .catch((errorFind) => {
                    console.log('Error find for followUps: ', errorFind);
                    callback(errorFind);
                })
        })
        .catch((errorGetDatabase) => {
            console.log('Error while getting database: ', errorGetDatabase);
            callback(errorGetDatabase);
        });
}

export function getFollowUpsForContactIds (outbreakId, date, contactIds, callback) {
    getDatabase(config.mongoCollections.followUp)
        .then((database) => {
            let oneDay = 24 * 60 * 60 * 1000;
            let startDate = new Date(`${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`).getTime();
            let endDate = moment(date.getTime() + (oneDay + (moment().isDST() ? date.getTimezoneOffset() : (date.getTimezoneOffset() - 60)) * 60 * 1000)).add(-1, 'second')._d.getTime();



            let start = new Date().getTime();
            database.find({
                selector: {
                    _id: {
                        $gt: `followUp.json_${outbreakId}_${startDate}_`,
                        $lt: `followUp.json_${outbreakId}_${endDate}_\uffff`
                    },
                    personId: {$in: contactIds},
                    deleted: false
                }
            })
                .then((resultGetFollowUps) => {
                    console.log('Result for find time for getFollowUpsForContactIds result: ', new Date().getTime() - start);
                    callback(null, resultGetFollowUps.docs);
                })
                .catch((errorGetFollowUps) => {
                    console.log('getFollowUpsForContactIds error: ', new Date().getTime() - start);
                    callback(errorGetFollowUps);
                })
        })
        .catch((errorGetDatabase) => {
            console.log('Error while getting database: ', errorGetDatabase);
            callback(errorGetDatabase);
        });
}

export function updateFollowUpRequest (outbreakId, contactId, followUpId, followUp, token, callback) {
    getDatabase(config.mongoCollections.followUp)
        .then((database) => {
            console.log('updateFollowUpRequest: ', outbreakId, contactId, followUpId, followUp, token);

            if (!followUp.personId) {
                followUp.personId = contactId
            }

            database.get(followUp._id)
                .then((resultGet) => {
                    console.log('Date changed. TIme to delete the record with the previous date and insert one with the new date');
                    database.remove(resultGet)
                        .then((resultRemove) => {
                            console.log('Remove follow up response : ', resultRemove);
                            delete followUp._rev;
                            database.put(followUp)
                                .then((responseUpdateFollowUp) => {
                                    console.log("Update followUp response: ", responseUpdateFollowUp);
                                    database.get(followUp._id)
                                        .then((resultGetUpdatedFollowUp) => {
                                            console.log("Response get updated followUp: ", resultGetUpdatedFollowUp);
                                            callback(null, resultGetUpdatedFollowUp);
                                        })
                                        .catch((errorGetUpdatedFollowUp) => {
                                            console.log("Error get updated followUp: ", errorGetUpdatedFollowUp);
                                            callback(errorGetUpdatedFollowUp);
                                        })
                                })
                                .catch((errorUpdateFollowUp) => {
                                    console.log("Update followUp response:", errorUpdateFollowUp);
                                    callback(errorUpdateFollowUp);
                                })
                        })
                        .catch((errorRemove) => {
                            console.log('Remove follow up error: ', errorRemove);
                            callback(errorRemove);
                        })
                })
                .catch((errorGet) => {
                    console.log('Error get: ', errorGet);
                    callback(errorGet);
                })
        })
        .catch((errorGetDatabase) => {
            console.log('Error while getting database: ', errorGetDatabase);
            callback(errorGetDatabase);
        });
}

export function addFollowUpRequest (outbreakId, contactId, followUp, token, callback) {
    getDatabase(config.mongoCollections.followUp)
        .then((database) => {
            if (!followUp._id || !followUp._id.includes('followUp')) {
                if (!followUp.date) {
                    followUp.date = new Date().toISOString();
                }
                let generatedId = generateId();
                followUp._id = 'followUp.json_' + outbreakId + '_' + new Date(followUp.date).getTime() + '_' + generatedId;
            }
            if (!followUp.personId) {
                followUp.personId = contactId
            }

            database.put(followUp)
                .then((resultAddFollowUp) => {
                    console.log('Result add followUp: ', JSON.stringify(resultAddFollowUp));
                    database.get(followUp._id)
                        .then((resultGetFollowUp) => {
                            console.log('Result get followUp: ', JSON.stringify(resultGetFollowUp));
                            callback(null, resultGetFollowUp);
                        })
                        .catch((errorGetFollowUp) => {
                            console.log('Error get followUp: ', errorGetFollowUp);
                            callback(errorGetFollowUp);
                        })
                })
                .catch((errorAddFollowUp) => {
                    console.log('Error add followUp: ', errorAddFollowUp);
                    callback(errorAddFollowUp);
                })
        })
        .catch((errorGetDatabase) => {
            console.log('Error while getting database: ', errorGetDatabase);
            callback(errorGetDatabase);
        });
}

export function addFollowUpsBulkRequest (followUps, callback) {
    getDatabase(config.mongoCollections.followUp)
        .then((database) => {
            database.bulkDocs(followUps)
                .then((resultBulkInsert) => {
                    console.log('Result bulk insert: ', resultBulkInsert);
                    callback(null, 'Success')
                })
                .catch((errorBulkInsert) => {
                    console.log('Error bulk add follow-ups: ', errorBulkInsert);
                    callback(errorBulkInsert);
                })
        })
        .catch((errorGetDatabase) => {
            console.log('Error while getting database: ', errorGetDatabase);
            callback(errorGetDatabase);
        });
}

export function getFollowUpsForContactRequest (outbreakId, keys, contactFollowUp, userTeams, callback) {
    let start = new Date().getTime();
    getDatabase(config.mongoCollections.followUp)
        .then((database) => {
            console.log("getCasesForOutbreakIdRequest: ", outbreakId, keys);
            let startDate = null;
            let endDate = null;
            if (contactFollowUp) {
                startDate = contactFollowUp.startDate;
                endDate = contactFollowUp.endDate;
            }

            database.find({
                selector: {
                    _id: {
                        $gte: `followUp.json_${outbreakId}_`,
                        $lte: `followUp.json_${outbreakId}_\uffff`
                    },
                    outbreakId: outbreakId,
                    deleted: false,
                    personId: {$in: keys}
                }
            })
                .then((result) => {
                    let followUpList = result.docs;
                    if (userTeams !== null && userTeams !== undefined && Array.isArray(userTeams) && userTeams.length > 0) {
                        followUpList = followUpList.filter((e) => userTeams.indexOf(e.teamId) >= 0 || e.teamId === undefined || e.teamId === null)
                    }
                    console.log('Result for find time for getFollowUpsForContactRequest request time: ', new Date().getTime() - start);
                    callback(null, followUpList)
                })
                .catch((error) => {
                    console.log('getFollowUpsForContactRequest error: ', error);
                    callback(error)
                })
        })
        .catch((errorGetDatabase) => {
            console.log('Error while getting database: ', errorGetDatabase);
            callback(errorGetDatabase);
        });
}