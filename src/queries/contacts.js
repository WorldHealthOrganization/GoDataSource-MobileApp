/**
 * Created by florinpopa on 13/09/2018.
 */
import {getDatabase} from './database';
import {generateId, extractIdFromPouchId} from './../utils/functions';

export function getContactsForOutbreakIdRequest (outbreakId, filter, token, callback) {
    let database = getDatabase();

    console.log("getContactsForOutbreakIdRequest: ", outbreakId, filter, token, callback);

    let start = new Date().getTime();
    if (filter && filter.keys) {
        // console.log('getContactsForOutbreakIdRequest if')
        let keys = filter.keys.map((e) => {return `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT_false_${outbreakId}_${e}`});
        // console.log("@@@ filter keys: ", keys);
        let start =  new Date().getTime();
        database.allDocs({
            keys: keys,
            include_docs: true
        })
            .then((result) => {
                let contacts = result.rows.filter((e) => {return e.error !== 'not_found'}).map((e) => {return e.doc});
                console.log("Result with the new index for contacts: ", new Date().getTime() - start);
                callback(null, contacts);
            })
            .catch((errorQuery) => {
                console.log("Error with the new index for contacts: ", errorQuery);
                callback(errorQuery);
            })

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

            database.find({
                selector: {
                    type: {$eq: 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT'},
                    gender: filter.gender ? {$eq: filter.gender} : {},
                    age: filter.age ? { $gte: filter.age[0]} : {},
                    age: filter.age ? { $lte: filter.age[1]} : {},
                    $or: [
                        {firstName: filter.searchText ? {$regex: filter.searchText} : {}},
                        {lastName: filter.searchText ? {$regex: filter.searchText} : {}}
                    ]
                },
            })
                .then((resultFilterContacts) => {
                    console.log('Result when filtering contacts: ', new Date().getTime() - start);
                    callback(null, resultFilterContacts.docs)
                })
                .catch((errorFilterContacts) => {
                    console.log('Error when filtering contacts: ', errorFilterContacts);
                    callback(errorFilterContacts);
                })
        } else {
            // console.log('getContactsForOutbreakIdRequest else');

            database.allDocs({
                startkey: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT_false_${outbreakId}`,
                endkey: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT_false_${outbreakId}\uffff`,
                include_docs: true
            })
                .then((result) => {
                    console.log("result with the new index for contacts: ", JSON.stringify(result));
                    callback(null, result.rows.filter((e) => {return e.doc.deleted === false}).map((e) => {return e.doc}))
                })
                .catch((errorQuery) => {
                    console.log("Error with the new index for contacts: ", errorQuery);
                    callback(errorQuery);
                })

            // database.find({
            //     selector: {
            //         type: 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT',
            //         fileType: 'person.json',
            //         deleted: false,
            //         outbreakId: outbreakId
            //     }
            // })
            //     .then((resultFind) => {
            //         console.log('Result for find time for contacts: ', new Date().getTime() - start);
            //         callback(null, resultFind.docs)
            //     })
            //     .catch((errorFind) => {
            //         console.log('Error find for contacts: ', errorFind);
            //         callback(errorFind);
            //     })
        }
    }
}

export function getContactByIdRequest(outbreakId, contactId, token, callback) {

    let database = getDatabase();
    console.log('getContactByIdRequest: ', outbreakId, contactId);

    database.get(contactId)
        .then((resultGetContactById) => {
            console.log("Result getContactByIdRequest: ", JSON.stringify(resultGetContactById));
            callback(null, resultGetContactById);
        })
        .catch((errorGetContactById) => {
            console.log("Error getContactByIdRequest: ", JSON.stringify(errorGetContactById));
            callback(errorGetContactById);
        })
         
}

export function updateContactRequest(outbreakId, contactId, contact, token, callback) {
    let database = getDatabase();

    console.log('updateContactRequest: ', outbreakId, contactId, contact, token);

    database.get(contact._id)
        .then((resultGetContact) => {
            console.log ('Get contact result: ', JSON.stringify(resultGetContact))
            database.remove(resultGetContact)
                .then((resultRemove) => {
                    console.log ('Remove contact result: ', JSON.stringify(resultRemove))
                    delete contact._rev;
                    database.put(contact)
                        .then((responseUpdateContact) => {
                            console.log("Update contact response: ", responseUpdateContact);
                            database.get(contact._id)
                                .then((resultGetUpdatedContact) => {
                                    console.log("Response getUpdatedContact: ", JSON.stringify(resultGetUpdatedContact));
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

    console.log('exposure for put', JSON.stringify(exposure))
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

    database.get(exposure._id)
        .then((resultGetExposure) => {
            console.log ('Get exposure result: ', JSON.stringify(resultGetExposure))
            database.remove(resultGetExposure)
                .then((resultRemove) => {
                    console.log ('Remove exposure result: ', JSON.stringify(resultRemove))
                    delete exposure._rev;
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
                })
                .catch((errorRemove) => {
                    console.log('Remove exposure error: ', errorRemove);
                    callback(errorRemove);
                })
        })
        .catch((errorGetExposure) => {
            console.log('Get exposure error:  ', errorGetExposure);
            callback(errorGetExposure);
        })
}

export function deleteExposureForContactRequest(outbreakId, contactId, exposure, token, callback) {
    let database = getDatabase();

    database.put(exposure)
        .then((result) => {
            console.log('Result deleteExposureForContactRequest: ', result);
        })
        .catch((errorAddExposure) => {
            console.log("Error deleteExposureForContactRequest: ", errorAddExposure);
        })
}