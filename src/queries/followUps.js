/**
 * Created by florinpopa on 18/09/2018.
 */
import {getDatabase} from './database';
import {extractIdFromPouchId} from './../utils/functions';
import {generateId} from './../utils/functions';

// Credentials: {email, encryptedPassword}
export function getFollowUpsForOutbreakIdRequest (outbreakId, filter, token, callback) {
    let database = getDatabase();

    // Possible filters here are date and type, but we're not going to focus on type(to do, missed) since that can be mapped on the component
    // Here we're only going to get the followUps from a certain date
    console.log('getFollowUpsForOutbreakIdRequest check date filter: ', filter);
    let oneDay = 24 * 60 * 60 * 1000;
    let startDate = '';
    let endDate = '';
    if (filter && filter.date) {
        startDate = new Date(filter.date).getTime() - oneDay;
        endDate = new Date(filter.date).getTime()  + oneDay;
    }

    database.allDocs({startkey: `followUp.json_false_${outbreakId}_${startDate}`, endkey: `followUp.json_false_${outbreakId}_${endDate}\uffff`, include_docs: true})
        .then((result) => {
            console.log("result with the new index for followUps: ", result.rows.map((e) => {return e.doc}));
            result.rows = result.rows.filter((e) => {return e.doc.deleted === false})
            callback(null, result.rows.map((e) => {return e.doc}));
        })
        .catch((errorQuery) => {
            console.log("Error with the new index for followUps: ", errorQuery);
            callback(errorQuery);
        })

    // database.query('whoQueries/getContactsForOutbreakId', {key: [outbreakId, 0], include_docs: true})
    //     .then((result) => {
    //         console.log("Result from getting contacts for outbreak id: ", result);
    //     })
    //     .catch((error) => {
    //         console.log("Error while getting contact for outbreak id: ", error);
    //     })
}

export function updateFollowUpRequest (outbreakId, contactId, followUpId, followUp, token, callback) {
    let database = getDatabase();

    console.log('updateFollowUpRequest: ', outbreakId, contactId, followUpId, followUp, token);
    
    if (!followUp.personId) {
        followUp.personId = contactId
    }

    database.get(followUp._id)
        .then((resultGet) => {
            if (followUp.date !== resultGet.date) {
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
            } else {
                database.put(followUp)
                    .then((responseUpdateFollowUp) => {
                        // console.log("Update followUp response: ", responseUpdateFollowUp);
                        database.get(followUp._id)
                            .then((resultGetUpdatedFollowUp) => {
                                // console.log("Updated followUp: ", resultGetUpdatedFollowUp);
                                callback(null, resultGetUpdatedFollowUp);
                            })
                            .catch((errorGetUpdatedFollowUp) => {
                                console.log("Error from updated followUp: ", errorGetUpdatedFollowUp);
                                callback(errorGetUpdatedFollowUp);
                            })
                    })
                    .catch((errorUpdateFollowUp) => {
                        console.log("Update followUp error: ", errorUpdateFollowUp);
                        callback(errorUpdateFollowUp);
                    })
            }
        })
        .catch((errorGet) => {
            console.log('Error get: ', errorGet);
            callback(errorGet);
        })
}

export function addFollowUpRequest (outbreakId, contactId, followUp, token, callback) {
    let database = getDatabase();

    if (!followUp._id || !followUp._id.includes('followUp')) {
        if (!followUp.date) {
            followUp.date = new Date().toISOString();
        }
        let generatedId = generateId();
        followUp._id = 'followUp.json_false_' + outbreakId + '_' + new Date(followUp.date).getTime() + '_' + generatedId;
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
}

export function getFollowUpsForContactRequest (outbreakId, keys, callback) {
    let database = getDatabase();

    console.log("getCasesForOutbreakIdRequest: ", outbreakId, keys);

    database.find({
        selector: {
            fileType: {$in: ['followUp.json']},
            outbreakId: outbreakId,
            deleted: false,
            personId: {$in: keys}
        }
    })
        .then((result) => {
            console.log('getFollowUpsForContactRequest request: ', JSON.stringify(result));
            callback(null, result.docs)
        })
        .catch((error) => {
            console.log('getFollowUpsForContactRequest error: ', error);
            callback(error)
        })
}