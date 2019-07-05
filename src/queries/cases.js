/**
 * Created by florinpopa on 18/09/2018.
 */
import {getDatabase} from './database';
import {objSort, localSortItems} from './../utils/functions'
import {getRelationshipsAndFollowUpsForContactRequest} from './relationships';
import {extractIdFromPouchId, mapContactsAndRelationships, mapContactsAndFollowUps} from './../utils/functions';
import config from './../utils/config';

// Credentials: {email, encryptedPassword}
export function getCasesForOutbreakIdRequest (outbreakId, filter, token, callback) {
    let start =  new Date().getTime();
    console.log('Result for find start time for getCases: ', new Date());
    getDatabase(config.mongoCollections.person)
        .then ((database) => {
            console.log("getCasesForOutbreakIdRequest: ", outbreakId);
            if (filter && filter.keys) {

                let promiseArray = [];
                promiseArray = filter.keys.map((e) => {return getFromDb(database, `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE_${outbreakId}_${e}`)});

                Promise.all(promiseArray)
                    .then((resultGetAll) => {
                        console.log("Result from get queries: ", new Date().getTime() - start);
                        callback(null, resultGetAll.filter((e) => {return e && e._id !== null}));
                    })
                    .catch((errorGetAll) => {
                        console.log('Error from get queries: ', new Date().getTime() - start, errorGetAll);
                        callback(errorGetAll);
                    })
            } else {
                if (filter) {
                    console.log('getCasesForOutbreakIdRequest else, if');
                    // console.log ('myFilter', filter);

                    let classificationOrFilter = null
                    if(filter.classification){
                        classificationOrFilter = []
                        if(filter.classification.length > 0 && Array.isArray(filter.classification)){
                            for (let i=0; i<filter.classification.length; i++) {
                                if (filter.classification[i].classification !== null) {
                                    classificationOrFilter.push(filter.classification[i].classification);
                                }
                            }
                        }
                    }

                    let myFilterAge = null
                    if (filter.age) {
                        myFilterAge = Object.assign([], filter.age)
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
                                $gt: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE_${outbreakId}_`,
                                $lt: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE_${outbreakId}_\uffff`
                            },
                            type: {$eq: 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE'},
                            gender: filter.gender ? {$eq: filter.gender} : {},
                            deleted: false,
                            classification: classificationOrFilter && classificationOrFilter.length > 0 ? {$in: classificationOrFilter} : {},
                            $or: [
                                {'age.years': myFilterAge && myFilterAge.length > 0 ? { $in: myFilterAge} : {}},
                                {'age.months': myFilterAge && myFilterAge.length > 0 ? { $in: myFilterAge} : {}},
                            ],
                            $or: [
                                {firstName: filter.searchText ? {$regex: filter.searchText} : {}},
                                {lastName: filter.searchText ? {$regex: filter.searchText} : {}}
                            ],
                        },
                    })
                        .then((resultFilterCases) => {
                            console.log('Result when filtering cases: ', new Date().getTime() - start);
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
                                    if (filter.age[0] === 0 && filter.age[1] === 150) {
                                        return e.age === null || e.age === undefined
                                    }
                                });
                            }
                            //local filter for selectedLocations bcause it can't be done in mango queries
                            if (filter.selectedLocations && filter.selectedLocations.length > 0) {
                                resultFilterCasesDocs = resultFilterCasesDocs.filter((e) => {
                                    let address = undefined
                                    if (e.addresses && e.addresses !== undefined) {
                                        address = e.addresses.find((k) => {
                                            return k.locationId !== '' && filter.selectedLocations.indexOf(k.locationId) >= 0
                                        })
                                    }

                                    return address === undefined ? false : true
                                })
                            }

                            //sort
                            if (filter.sort && filter.sort !== undefined && filter.sort.length > 0) {
                                resultFilterCasesDocs = localSortItems(resultFilterCasesDocs, filter.sort)
                            } else {
                                resultFilterCasesDocs = objSort(resultFilterCasesDocs, ['lastName', false])
                            }

                            callback(null, resultFilterCasesDocs)
                        })
                        .catch((errorFilterCases) => {
                            console.log('Error when filtering cases: ', errorFilterCases);
                            callback(errorFilterCases);
                        })
                } else {
                    // database.allDocs({
                    //     startkey: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE_${outbreakId}`,
                    //     endkey: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE_${outbreakId}\uffff`,
                    //     include_docs: true
                    // })
                    //     .then((result) => {
                    //         console.log("result with the new index for cases: ", new Date().getTime() - start);
                    //         callback(null, result.rows.filter((e) => {return e.doc.deleted === false}).map((e) => {return e.doc}));
                    //
                    //     })
                    //     .catch((errorQuery) => {
                    //         console.log("Error with the new index for cases: ", errorQuery);
                    //         callback(errorQuery);
                    //     });


                    database.find({
                        selector: {
                            _id: {
                                $gte: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE_${outbreakId}`,
                                $lte: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE_${outbreakId}\uffff`,
                            },
                            deleted: false,
                            classification: {$ne: 'LNG_REFERENCE_DATA_CATEGORY_CASE_CLASSIFICATION_NOT_A_CASE_DISCARDED'}
                        }
                    })
                        .then((resultFind) => {
                            console.log('Result for find cases time: ', new Date().getTime() - start);
                            callback(null, objSort(resultFind.docs, ['lastName', false]));
                        })
                        .catch((errorFind) => {
                            console.log('Error find cases: ', errorFind);
                            callback(errorFind);
                        })
                }
            }
        })
        .catch((errorGetDatabase) => {
            console.log('Error while getting database: ', errorGetDatabase);
            callback(errorGetDatabase);
        });
}

export function checkForNameDuplicatesRequest (id, firstName, lastName, outbreakId, callback){
    getDatabase(config.mongoCollections.person)
        .then((database) => {
            let start = new Date().getTime();

            database.find({
                selector: {
                    _id: {
                        $gt: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE_${outbreakId}_`,
                        $lt: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE_${outbreakId}_\uffff`,
                        $ne: id
                    },
                    deleted: false,
                    firstName: firstName,
                    lastName: lastName
                },
            }).then((resultsCaseName) => {
                console.log('Result get duplicates name time: ', new Date().getTime() - start);
                // console.log('Result get duplicates name: ', resultsCaseName);
                callback(null, resultsCaseName.docs)
            }).catch((errorCaseName) => {
                console.log('Error when get duplicates name: ', errorCaseName);
                callback(errorCaseName);
            })
        })
        .catch((errorGetDatabase) => {
            console.log('Error while getting database: ', errorGetDatabase);
        });
}

export function addCaseRequest (outbreakId, myCase, token, callback) {
    getDatabase(config.mongoCollections.person)
        .then((database) => {
            // console.log('addCaseRequest: ', outbreakId, myCase);
            database.put(myCase)
                .then((responseAddCase) => {
                    console.log('responseAddCase', responseAddCase)
                    database.get(responseAddCase.id)
                        .then((responseGetAddedCase) => {
                            // console.log('responseGetAddedCase', responseGetAddedCase)
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
        })
        .catch((errorGetDatabase) => {
            console.log('Error while getting database: ', errorGetDatabase);
        })
}

export function updateCaseRequest (outbreakId, caseId, myCase, token, callback) {
    getDatabase(config.mongoCollections.person)
        .then((database) => {
            // console.log('updateCaseRequest: ', outbreakId, caseId, myCase);
            database.get(myCase._id)
                .then((resultGetCase) => {
                    // console.log ('Get case result: ', JSON.stringify(resultGetCase))
                    database.remove(resultGetCase)
                        .then((resultRemove) => {
                            // console.log ('Remove case result: ', JSON.stringify(resultRemove))
                            delete myCase._rev;
                            database.put(myCase)
                                .then((responseUpdateCase) => {
                                    // console.log("Update case response: ", responseUpdateCase);
                                    database.get(myCase._id)
                                        .then((resultGetUpdatedCase) => {
                                            // console.log("Response resultGetUpdatedCase: ", JSON.stringify(resultGetUpdatedCase));
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
        })
        .catch((errorGetDatabase) => {
            console.log('Error while getting database: ', errorGetDatabase);
        });
}

export function getItemByIdRequest (outbreakId, itemId, itemType, userTeams, callback) {
    getDatabase(config.mongoCollections.person)
        .then((database) => {
            database.get(itemId)
                .then((result) => {
                    // console.log('getItemByIdRequest result', result);
                    if (itemType === 'contact') {
                        getRelationshipsAndFollowUpsForContactRequest(outbreakId, extractIdFromPouchId(itemId, 'person'), null, userTeams, (errorRelationshipsAndFollowUps, responseRelationshipsAndFollowUps) => {
                            if (errorRelationshipsAndFollowUps) {
                                console.log("*** getItemByIdRequest getRelationshipsAndFollowUpsForContact error: ", JSON.stringify(errorRelationshipsAndFollowUps));
                                callback(errorRelationshipsAndFollowUps);
                            }
                            if (responseRelationshipsAndFollowUps) {
                                // console.log("*** getItemByIdRequest getRelationshipsAndFollowUpsForContact response: ", JSON.stringify(responseRelationshipsAndFollowUps));
                                let relationships = responseRelationshipsAndFollowUps.filter((e) => {if (e.persons) {return e}});
                                let followUps = responseRelationshipsAndFollowUps.filter((e) => {if (e.personId) {return e}});

                                let mappedContact = mapContactsAndRelationships([result], relationships);
                                if (followUps.length > 0) {
                                    mappedContact = mapContactsAndFollowUps(mappedContact, followUps);
                                }
                                callback(null, mappedContact[0]);
                            }
                        });
                    } else if (itemType === 'case'){
                        callback(null, result);
                    }
                })
                .catch((error) => {
                    console.log('getItemByIdRequest error: ', error);
                    callback(error);
                })
        })
        .catch((errorGetDatabase) => {
            console.log('Error while getting database: ', errorGetDatabase);
        })
}