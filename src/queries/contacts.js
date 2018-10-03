/**
 * Created by florinpopa on 13/09/2018.
 */
import {getDatabase} from './database';
import {generateId} from './../utils/functions';

export function getContactsForOutbreakIdRequest (outbreakId, filter, token, callback) {
    let database = getDatabase();

    console.log("getContactsForOutbreakIdRequest: ", outbreakId, filter, token, callback);

    if (filter && filter.keys) {
        let keys = filter.keys.map((e) => {return `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT_false_${outbreakId}_${e}`});
        console.log("@@@ filter keys: ", keys);
        database.allDocs({
            keys: keys,
            include_docs: true
        })
            .then((result) => {
                let contacts = result.rows.filter((e) => {return e.error !== 'not_found'}).map((e) => {return e.doc});
                console.log("Result with the new index for contacts: ", contacts);
                callback(null, contacts);
            })
            .catch((errorQuery) => {
                console.log("Error with the new index for contacts: ", errorQuery);
                callback(errorQuery);
            })
    } else {
        if (filter) {
            database.query('getUserByEmail', {
                startkey: [outbreakId, filter.gender, filter.age[0]],
                endkey: [outbreakId, filter.gender, filter.age[1]],
                include_docs: true,
                group: true
            })
                .then((resultFilterContacts) => {
                    console.log('Result when filtering contacts: ', resultFilterContacts);
                })
                .catch((errorFilterContacts) => {
                    console.log('Error when filtering contacts: ', errorFilterContacts);
                })
        } else {
            database.allDocs({
                startkey: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT_false_${outbreakId}`,
                endkey: `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT_false_${outbreakId}\uffff`,
                include_docs: true
            })
                .then((result) => {
                    console.log("result with the new index for contacts: ");
                    callback(null, result.rows.map((e) => {
                        return e.doc
                    }));
                })
                .catch((errorQuery) => {
                    console.log("Error with the new index for contacts: ", errorQuery);
                    callback(errorQuery);
                })
        }
    }
    // }
}

export function updateContactRequest(outbreakId, contactId, contact, token, callback) {
    let database = getDatabase();

    console.log('updateContactRequest: ', outbreakId, contactId, contact, token);

    if (!contact._id.includes('person.json')) {
        contact._id = 'person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT_false_' + contact.outbreakId + '_' + contact._id;
    }

    database.get(contact._id)
        .then((resultGetContact) => {
            database.put(contact)
                .then((responseUpdateContact) => {
                    console.log("Update contact response: ", responseUpdateContact);
                    database.get(contact._id)
                        .then((resultGetUpdatedContact) => {
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
        .catch((errorGetContact) => {
            console.log('Error getContact: ', errorGetContact);
            callback(errorGetContact);
        })
}

export function addContactRequest(outbreakId, contact, token, callback) {
    let database = getDatabase();

    console.log('addContactRequest: ', outbreakId, contact);

    if (!contact._id) {
        let uuid = generateId();
        contact._id = 'person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT_false_' + outbreakId + '_' + uuid;
    }

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

    // Here should add the data as an relationship.json type, while also updating the contact to contain the new added exposure

    database.put(exposure)
        .then((result) => {
            console.log('Result addExposureForContactRequest: ', result);
        })
        .catch((errorAddExposure) => {
            console.log("Error addExposureForContactRequest: ", errorAddExposure);
        })
}

export function updateExposureForContactRequest(outbreakId, contactId, exposure, token, callback) {
    let database = getDatabase();

    database.put(exposure)
        .then((result) => {
            console.log('Result updateExposureForContactRequest: ', result);
        })
        .catch((errorAddExposure) => {
            console.log("Error updateExposureForContactRequest: ", errorAddExposure);
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