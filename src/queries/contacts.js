/**
 * Created by florinpopa on 13/09/2018.
 */
import {getDatabase} from './database';
import {objSort, localSortItems} from './../utils/functions';

export function getContactsForOutbreakIdRequest (outbreakId, filter, token, callback) {
    let database = getDatabase();

    // console.log("getContactsForOutbreakIdRequest: ", outbreakId, filter, token, callback);

    let start = new Date().getTime();
    if (filter && filter.keys) {

        let promiseArray = [];
        promiseArray = filter.keys.map((e) => {return getFromDb(database, `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT_${outbreakId}_${e}`)});

        let start =  new Date().getTime();
        Promise.all(promiseArray)
            .then((resultGetAll) => {
                console.log("Result from get queries: ", new Date().getTime() - start, resultGetAll.length);
                callback(null, resultGetAll.filter((e) => {return e && e._id !== null}));
            })
            .catch((errorGetAll) => {
                console.log('Error from get queries: ', new Date().getTime() - start, errorGetAll);
                callback(errorGetAll);
            })


        // database.allDocs({
        //     keys: keys,
        //     include_docs: true
        // })
        //     .then((result) => {
        //         let contacts = result.rows.filter((e) => {return e.error !== 'not_found'}).map((e) => {return e.doc});
        //         console.log("Result with the new index for contacts: ", new Date().getTime() - start);
        //         callback(null, contacts);
        //     })
        //     .catch((errorQuery) => {
        //         console.log("Error with the new index for contacts: ", errorQuery);
        //         callback(errorQuery);
        //     })

        // database.find({
        //     selector: {
        //         type: 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT',
        //         fileType: 'person.json',
        //         deleted: false,
        //         outbreakId: outbreakId,
        //         _id: {$in: filter.keys}
        //     }
        // })
        //     .then((resultFind) => {
        //         console.log('Result for find contacts with keys time: ', new Date().getTime() - start);
        //         callback(null, resultFind.docs)
        //     })
        //     .catch((errorFind) => {
        //         console.log('Error find contact with keys: ', errorFind);
        //         callback(errorFind);
        //     })
    } else {
        if (filter) {
            console.log('getContactsForOutbreakIdRequest else, if');
            console.log ('myFilter', filter);

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
                        $gt: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT_${outbreakId}_`,
                        $lt: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT_${outbreakId}_\uffff`
                    },
                    type: {$eq: 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT'},
                    gender: filter.gender ? {$eq: filter.gender} : {},
                    deleted: false,
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
                .then((resultFilterContacts) => {
                    console.log('Result when filtering contacts: ', new Date().getTime() - start, resultFilterContacts);

                    let resultFilterContactsDocs = resultFilterContacts.docs
                    if (resultFilterContactsDocs && resultFilterContactsDocs !== undefined) {
                        // Filter for age because it can't be done in mango (can't use and in or filter)
                        if (filter.age) {
                            resultFilterContactsDocs = resultFilterContactsDocs.filter((e) => {
                                if (e.age && e.age.years !== null && e.age.years !== undefined && e.age.months !== null && e.age.months !== undefined ) {
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
    
                        // Filter for selectedLocations bcause it can't be done in mango queries
                        if (filter.selectedLocations && filter.selectedLocations.length > 0) {
                            resultFilterContactsDocs = resultFilterContactsDocs.filter((e) => {
                                let address = undefined
                                if (e.addresses && e.addresses !== undefined) {
                                    address = e.addresses.find((k) => {
                                        return k.locationId !== '' && filter.selectedLocations.indexOf(k.locationId) >= 0
                                    })
                                }
                            
                                return address === undefined ? false : true
                            })
                        }
    
                        // Sort
                        if (filter.sort && filter.sort !== undefined && filter.sort.length > 0) {
                            resultFilterContactsDocs = localSortItems(resultFilterContactsDocs, filter.sort)
                        } else {
                            resultFilterContactsDocs = objSort(resultFilterContactsDocs, ['lastName', false])
                        }
                    }

                    callback(null, resultFilterContactsDocs)
                })
                .catch((errorFilterContacts) => {
                    console.log('Error when filtering contacts: ', errorFilterContacts);
                    callback(errorFilterContacts);
                })
        } else {
            // console.log('getContactsForOutbreakIdRequest else');

            // database.allDocs({
            //     startkey: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT_${outbreakId}_`,
            //     endkey: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT_${outbreakId}_\uffff`,
            //     include_docs: true
            // })
            //     .then((result) => {
            //         console.log("result with the new index for contacts: ", new Date().getTime() - start);
            //         callback(null, result.rows.filter((e) => {return e.doc.deleted === false}).map((e) => {return e.doc}))
            //     })
            //     .catch((errorQuery) => {
            //         console.log("Error with the new index for contacts: ", errorQuery);
            //         callback(errorQuery);
            //     })

            database.find({
                selector: {
                    _id: {
                        $gte: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT_${outbreakId}_`,
                        $lte: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT_${outbreakId}_\uffff`,
                    },
                    deleted: false
                }
            })
                .then((resultFind) => {
                    console.log('Result for find time for contacts: ', new Date().getTime() - start);
                    callback(null, objSort(resultFind.docs, ['lastName', false]));
                })
                .catch((errorFind) => {
                    console.log('Error find for contacts: ', errorFind);
                    callback(errorFind);
                })
        }
    }
}

export function getContactsForFollowUpPeriodRequest (outbreakId, followUpDate, callback) {
    // Filter has followUpDate
    let database = getDatabase();

    let start = new Date().getTime();
    database.find({
        selector: {
            _id: {
                $gt: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT_${outbreakId}_`,
                $lt: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT_${outbreakId}_\uffff`
            },
            'followUp.status': 'LNG_REFERENCE_DATA_CONTACT_FINAL_FOLLOW_UP_STATUS_TYPE_UNDER_FOLLOW_UP',
            'followUp.startDate': {$lte: followUpDate},
            'followUp.endDate': {$gte: followUpDate},
            deleted: false
        },
        fields: ['_id']
    })
        .then((resultFilterContacts) => {
            console.log('getContactsForFollowUpPeriod result: ', new Date().getTime() - start);
            callback(null, resultFilterContacts.docs)
        })
        .catch((errorFilterContacts) => {
            console.log('getContactsForFollowUpPeriod error: ', errorFilterContacts);
            callback(errorFilterContacts);
        })
}

function getFromDb(database, id) {
    return new Promise((resolve, reject) => {
        console.log('Get record with id: ', id);
        database.get(id)
            .then((result) => {
                console.log('Found result. Return stuff');
                resolve(result);
            })
            .catch((error) => {
                console.log('Error get function: ', JSON.stringify(error));
                if (error.name === 'not_found' && error.message === 'missing') {
                    resolve(null);
                } else {
                    reject(error);
                }
            })
    })
}

export function getContactByIdRequest(outbreakId, contactId, token, callback) {

    let database = getDatabase();
    console.log('getContactByIdRequest: ', outbreakId, contactId);

    database.get(contactId)
        .then((resultGetContactById) => {
            console.log("Result getContactByIdRequest: ", resultGetContactById);
            callback(null, resultGetContactById);
        })
        .catch((errorGetContactById) => {
            console.log("Error getContactByIdRequest: ", JSON.stringify(errorGetContactById));
            callback(errorGetContactById);
        })

}

export function updateContactRequest(outbreakId, contactId, contact, token, callback) {
    let database = getDatabase();

    // console.log('updateContactRequest: ', outbreakId, contactId, contact, token);

    database.get(contact._id)
        .then((resultGetContact) => {
            console.log ('Get contact result: ');
            database.remove(resultGetContact)
                .then((resultRemove) => {
                    console.log ('Remove contact result: ')
                    delete contact._rev;
                    database.put(contact)
                        .then((responseUpdateContact) => {
                            console.log("Update contact response: ");
                            database.get(contact._id)
                                .then((resultGetUpdatedContact) => {
                                    console.log("Response getUpdatedContact: ");
                                    callback(null, resultGetUpdatedContact);
                                })
                                .catch((errorGetUpdatedContact) => {
                                    console.log("Error getUpdatedContact: ", errorGetUpdatedContact);
                                    callback(errorGetUpdatedContact);
                                })
                        })
                        .catch((errorUpdateContact) => {
                            console.log('Update contact error: ', errorUpdateContact);
                            callback(errorUpdateContact);
                        })
                })
                .catch((errorRemove) => {
                    console.log('Remove contact error: ', errorRemove);
                    callback(errorRemove);
                })
        })
        .catch((errorGetContact) => {
            console.log('Get contact error:  ', errorGetContact);
            callback(errorGetContact);
        })
}

export function addContactRequest(outbreakId, contact, token, callback) {
    let database = getDatabase();

    console.log('addContactRequest: ', outbreakId, contact);
    database.put(contact)
        .then((responseAddContact) => {
            database.get(responseAddContact.id)
                .then((responseGetAddedContact) => {
                    callback(null, responseGetAddedContact);
                })
                .catch((errorGetAddedContact) => {
                    console.log('errorGetAddedContact: ', errorGetAddedContact)
                    callback(errorGetAddedContact)
                })
        })
        .catch((errorAddContact) => {
            console.log("errorAddContact: ", errorAddContact);
            callback(errorAddContact)
        })
}

export function addExposureForContactRequest(outbreakId, contactId, exposure, token, callback) {
    let database = getDatabase();

    if (exposure.persons[0].id === null && contactId !== null) {
        exposure.persons[0].id = contactId;
    } else {
        if (exposure.persons[1].id === null && contactId !== null) {
            exposure.persons[1].id = contactId;
        }
    }

    // console.log('exposure for put')
    // exposure.outbreakId = outbreakId
    database.put(exposure)
        .then((result) => {
            console.log('Result addExposureForContactRequest: ', JSON.stringify(result));
            callback(null, result)
        })
        .catch((errorAddExposure) => {
            console.log("Error addExposureForContactRequest: ", errorAddExposure);
            callback(errorAddExposure)

        })
}

export function updateExposureForContactRequest(outbreakId, contactId, exposure, token, callback) {
    let database = getDatabase();

    console.log ('updateExposureForContactRequest', outbreakId, contactId, JSON.stringify(exposure))
    database.put(exposure)
        .then((responseUpdateExposure) => {
            console.log("Update exposure response: ", responseUpdateExposure);
            database.get(exposure._id)
                .then((resultGetUpdatedExposure) => {
                    console.log("Response getUpdatedExposure: ", JSON.stringify(resultGetUpdatedExposure));
                    callback(null, resultGetUpdatedExposure);
                })
                .catch((errorGetUpdatedExposure) => {
                    console.log("Error getUpdatedExposure: ", errorGetUpdatedExposure);
                    callback(errorGetUpdatedExposure);
                })
        })
        .catch((errorUpdateExposure) => {
            console.log('Update exposure error: ', errorUpdateExposure);
            callback(errorUpdateExposure);
        })
}

export function deleteExposureForContactRequest(outbreakId, contactId, exposure, token, callback) {
    let database = getDatabase();

    database.put(exposure)
        .then((result) => {
            console.log('Result deleteExposureForContactRequest: ', result);
            callback(null, result);
        })
        .catch((errorAddExposure) => {
            console.log("Error deleteExposureForContactRequest: ", errorAddExposure);
            callback(errorAddExposure);
        })
}