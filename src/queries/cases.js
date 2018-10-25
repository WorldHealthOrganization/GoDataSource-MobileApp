/**
 * Created by florinpopa on 18/09/2018.
 */
import {getDatabase} from './database';

// Credentials: {email, encryptedPassword}
export function getCasesForOutbreakIdRequest (outbreakId, filter, token, callback) {
    let database = getDatabase();

    console.log("getCasesForOutbreakIdRequest: ", outbreakId);

    let start =  new Date().getTime();
    database.allDocs({
        startkey: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE_false_${outbreakId}_`,
        endkey: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE_false_${outbreakId}_\uffff`,
        include_docs: true
    })
        .then((result) => {
            console.log("result with the new index for cases: ", new Date().getTime() - start);
            callback(null, result.rows.filter((e) => {return e.doc.deleted === false}).map((e) => {return e.doc}));
            
        })
        .catch((errorQuery) => {
            console.log("Error with the new index for cases: ", errorQuery);
            callback(errorQuery);
        })

    // database.find({
    //     selector: {
    //         type: 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE',
    //         fileType: 'person.json',
    //         deleted: false,
    //         outbreakId: outbreakId
    //     }
    // })
    //     .then((resultFind) => {
    //         console.log('Result for find cases time: ', new Date().getTime() - start);
    //         callback(null, resultFind.docs)
    //     })
    //     .catch((errorFind) => {
    //         console.log('Error find cases: ', errorFind);
    //         callback(errorFind);
    //     })
}

export function addCaseRequest (outbreakId, myCase, token, callback) {
    let database = getDatabase();

    console.log('addCaseRequest: ', outbreakId, myCase);
    database.put(myCase)
        .then((responseAddCase) => {
            console.log('responseAddCase', responseAddCase)
            database.get(responseAddCase.id)
                .then((responseGetAddedCase) => {
                    console.log('responseGetAddedCase', responseGetAddedCase)
                    callback(null, responseGetAddedCase);
                })
                .catch((errorGetAddedCase) => {
                    console.log('errorGetAddedCase: ', errorGetAddedCase)
                    callback(errorGetAddedCase)
                })
        })
        .catch((errorAddCase) => {
            console.log("errorAddCase: ", errorAddCase);
            callback(errorAddCase)
        })
}

export function updateCaseRequest (outbreakId, caseId, myCase, token, callback) {
    let database = getDatabase();

    console.log('updateCaseRequest: ', outbreakId, caseId, myCase);
    database.get(myCase._id)
        .then((resultGetCase) => {
            console.log ('Get case result: ', JSON.stringify(resultGetCase))
            database.remove(resultGetCase)
            .then((resultRemove) => {
                console.log ('Remove case result: ', JSON.stringify(resultRemove))
                delete myCase._rev;
                database.put(myCase)
                    .then((responseUpdateCase) => {
                        console.log("Update case response: ", responseUpdateCase);
                        database.get(myCase._id)
                            .then((resultGetUpdatedCase) => {
                                console.log("Response resultGetUpdatedCase: ", JSON.stringify(resultGetUpdatedCase));
                                callback(null, resultGetUpdatedCase);
                            })
                            .catch((errorGetUpdatedCase) => {
                                console.log("Error errorGetUpdatedCase: ", errorGetUpdatedCase);
                                callback(errorGetUpdatedCase);
                            })
                    })
                    .catch((errorUpdateCase) => {
                        console.log('Update case error: ', errorUpdateCase);
                        callback(errorUpdateCase);
                    })
            })
            .catch((errorRemove) => {
                console.log('Remove case error: ', errorRemove);
                callback(errorRemove);
            })
        })
        .catch((errorGetCase) => {
            console.log('Get case error:  ', errorGetCase);
            callback(errorGetCase);
        })
}

