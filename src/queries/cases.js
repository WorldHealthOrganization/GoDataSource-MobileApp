/**
 * Created by florinpopa on 18/09/2018.
 */
import {getDatabase} from './database';

// Credentials: {email, encryptedPassword}
export function getCasesForOutbreakIdRequest (outbreakId, filter, token, callback) {
    let database = getDatabase();
    let start =  new Date().getTime();

    console.log("getCasesForOutbreakIdRequest: ", outbreakId);
    if (filter && filter.keys) {
        let keys = filter.keys.map((e) => {return `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE_false_${outbreakId}_${e}`});
        let promiseArray = [];

        for (let i=0; i<keys.length; i++) {
            promiseArray.push(getFromDb(database, keys[i]));
        }

        Promise.all(promiseArray)
            .then((resultGetAll) => {
                console.log("Result from get queries: ", new Date().getTime() - start, resultGetAll.length);
                callback(null, resultGetAll.filter((e) => {return e && e._id !== null}));
            })
            .catch((errorGetAll) => {
                console.log('Error from get queries: ', new Date().getTime() - start, errorGetAll);
                callback(errorGetAll);
            })
    } else {
        if (filter) {
            console.log('getCasesForOutbreakIdRequest else, if');
            console.log ('myFilter', filter);

            let classificationOrFilter = []
            if(filter.classification){
                if(filter.classification.length > 0 && Array.isArray(filter.classification)){
                    for (let i=0; i<filter.classification.length; i++) {
                        if (filter.classification[i].classification !== null) {
                            classificationOrFilter.push(filter.classification[i].classification);
                        }
                    }
                }
            }
            let myFilterAge = filter.age
            if (myFilterAge) {
                let maxAge = filter.age[1]
                let minAge = filter.age[0]
                while (maxAge - 1 > minAge) {
                    myFilterAge.push(minAge + 1)
                    minAge = minAge + 1
                }
            }

            database.find({
                selector: {
                    _id: {
                        $gt: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE_false_${outbreakId}_`,
                        $lt: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE_false_${outbreakId}_\uffff`
                    },
                    type: {$eq: 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE'}, 
                    gender: filter.gender ? {$eq: filter.gender} : {},
                    deleted: false,
                    classification: classificationOrFilter && classificationOrFilter.length > 0 ? {$in: classificationOrFilter} : {},
                    $or: [
                        {firstName: filter.searchText ? {$regex: filter.searchText} : {}},
                        {lastName: filter.searchText ? {$regex: filter.searchText} : {}}
                    ],
                    $or: [
                        {'age.years': myFilterAge ? { $in: myFilterAge} : {}},
                        {'age.months': myFilterAge ? { $in: myFilterAge} : {}},
                    ]
                },
            })
                .then((resultFilterCases) => {
                    console.log('Result when filtering cases: ', new Date().getTime() - start, resultFilterCases.docs);
                    //local filter for age because it can't be done in mango (can't use and in or filter
                    let resultFilterCasesDocs = resultFilterCases.docs
                    if (filter.age) {
                        resultFilterCasesDocs = resultFilterCasesDocs.filter((e) => {
                            if (e.age && e.age.years !== null && e.age.years !== undefined && e.age.months !== null && e.age.months !== undefined) {
                                if (e.age.years > 0 && e.age.months === 0) {
                                    return e.age.years >= filter.age[0] && e.age.years <= filter.age[1]
                                } else if (e.age.years === 0 && e.age.months > 0){
                                    return e.age.months >= filter.age[0] && e.age.months <= filter.age[1]
                                } else if (e.age.years === 0 && e.age.months === 0) {
                                    return e.age.years >= filter.age[0] && e.age.years <= filter.age[1]
                                }
                            }
                        });
                    }
                    //local filter for selectedLocations bcause it can't be done in mango queries
                    if (filter.selectedLocations && filter.selectedLocations.length > 0) {
                        resultFilterCasesDocs = resultFilterCasesDocs.filter((e) => {
                            let addresses = e.addresses.filter((k) => {
                                return k.locationId !== '' && filter.selectedLocations.indexOf(k.locationId) >= 0
                            })
                            return addresses.length > 0
                        })
                    }
                    callback(null, resultFilterCasesDocs)
                })
                .catch((errorFilterCases) => {
                    console.log('Error when filtering cases: ', errorFilterCases);
                    callback(errorFilterCases);
                })
        } else {
            database.allDocs({
                startkey: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE_false_${outbreakId}`,
                endkey: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE_false_${outbreakId}\uffff`,
                include_docs: true
            })
                .then((result) => {
                    console.log("result with the new index for cases: ", new Date().getTime() - start);
                    callback(null, result.rows.filter((e) => {return e.doc.deleted === false}).map((e) => {return e.doc}));

                })
                .catch((errorQuery) => {
                    console.log("Error with the new index for cases: ", errorQuery);
                    callback(errorQuery);
                });
        }
    }
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

