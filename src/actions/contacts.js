/**
 * Created by florinpopa on 20/07/2018.
 */
import {createDate, updateRequiredFields} from './../utils/functions';
import moment from 'moment-timezone';
import config from './../utils/config';
import max from 'lodash/max';
import get from 'lodash/get';
import set from 'lodash/set';
import {checkArrayAndLength} from "../utils/typeCheckingFunctions";
import {executeQuery, insertOrUpdate} from "../queries/sqlTools/helperMethods";
import translations from "../utils/translations";
import sqlConstants from "../queries/sqlTools/constants";
import {insertOrUpdateExposure} from './exposure';
import {getPersonWithRelationsForOutbreakId} from "../queries/sqlTools/sqlQueryInterface";
import {store} from './../App';

// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
export function getContactsForOutbreakId({outbreakId, contactsFilter, exposureFilter, lastElement, offset}, computeCount) {
    return getPersonWithRelationsForOutbreakId({
        outbreakId,
        filter: contactsFilter,
        search: exposureFilter,
        lastElement: lastElement,
        offset,
        personType: translations.personTypes.contacts
    }, computeCount)
        .then((results) => {
            // console.log('results', results);
            return Promise.resolve({data: results.data, dataCount: results?.dataCount});
        })
        .catch((error) => {
            console.log('error', error);
            return Promise.reject(error);
        })
}


export function getContactsForOutbreakIdOld({outbreakId, contactsFilter, exposureFilter, lastElement, offset}, computeCount) {
    let countPromise = null;
    let contactsPromise = null;

    let contactsAndExposuresQuery = {
        type: 'select',
        distinct: true,
        query: sqlConstants.createMainQuery(translations.personTypes.contacts, outbreakId, contactsFilter, exposureFilter, lastElement, offset), // Here will take place the contact/exposure filter/sort
        alias: 'MappedData',
        fields: [
            {
                table: 'MappedData',
                name: 'IdField',
                alias: '_id'
            },
            {
                table: 'MappedData',
                name: 'MainData',
                alias: 'mainData'
            },
            {
                table: 'MappedData',
                name: 'AllOfExposures',
                alias: 'exposureData'
            }
        ],
    };

    if (computeCount) {
        let contactsQueryCount = {
            type: 'select',
            query: sqlConstants.createMainQuery(translations.personTypes.contacts, outbreakId, contactsFilter, exposureFilter, lastElement, offset, true), // Here will take place the contact/exposure filter/sort
            alias: 'MappedData',
            fields: [
                {
                    func: {
                        name: 'count',
                        args: [{field: `MappedData.IdField`}]
                    },
                    alias: 'countRecords'
                }
            ]
        };
        countPromise = executeQuery(contactsQueryCount);
    }
    contactsPromise = executeQuery(contactsAndExposuresQuery);

    return Promise.all([contactsPromise, countPromise])
        .then(([contacts, contactsCount]) => {
            console.log('Returned values: ');
            return Promise.resolve({data: contacts, dataCount: checkArrayAndLength(contactsCount) ? contactsCount[0].countRecords : undefined});
        })
        .catch((errorGetContacts) => Promise.reject(errorGetContacts))
    // return executeQuery(contactsAndExposuresQuery)
}

export function getContactById(outbreakId, contactId) {
    let contactQueryObject = {
        type: 'select',
        table: 'person',
        fields: [
            {
                table: 'person',
                name: 'json',
                alias: 'contactJson'
            }
        ],
        condition: {
            'outbreakId': outbreakId,
            '_id': contactId
        }
    };

    return executeQuery(contactQueryObject)
        .then((contacts) => Promise.resolve(get(contacts, '[0].contactJson', null)))

}

export function addContact(contact, periodOfFollowUp, userId) {
    let exposure = get(contact, 'relationships[0]', null);
    let exposurePersons = get(exposure, 'persons');
    if (checkArrayAndLength(exposurePersons)) {
        // let contactToBeUpdated = exposurePersons.find((e) => e.type === translations.personTypes.contacts);
        // if (contactToBeUpdated) {
        //     set(contactToBeUpdated, 'id', get(contact, '_id', null));
        // }
        set(exposure, `persons[${exposurePersons.findIndex((e) => e.type === translations.personTypes.contacts)}].id`, get(contact, '_id', null));
    }
    if (contact.followUps) {
        delete contact.followUps;
    }
    if (contact.relationships) {
        delete contact.relationships;
    }
    return Promise.resolve()
        .then(() => insertOrUpdate('common', 'person', [contact], false))
        .then(() => addExposureForContact(exposure, contact, periodOfFollowUp, userId))
}

export function updateContactRequest(contact) {
    if (contact.followUps) {
        delete contact.followUps;
    }
    if (contact.relationships) {
        delete contact.relationships;
    }
    return insertOrUpdate('common', 'person', [contact], true);
}

export function updateContact(contact) {
    if (contact.followUps) {
        delete contact.followUps;
    }
    if (contact.relationships) {
        delete contact.relationships;
    }
    return insertOrUpdate('common', 'person', [contact], true);
}

export function addExposureForContact(exposure, contact, periodOfFollowUp, userId) {
    exposure = updateRequiredFields(null, userId, exposure, 'create', 'relationship');
    let getContactByIdPromise = getContactById(get(contact, 'outbreakId', null), get(contact, '_id', null));
    let getRelationshipsForPersonPromise = getRelationshipsForPerson(get(contact, 'outbreakId', null), get(contact, '_id', null));

    return Promise.all([getContactByIdPromise, getRelationshipsForPersonPromise])
        .then(([contact, relationshipsArray]) => {
            relationshipsArray.push(exposure);
            // contact.relationships = relationshipsArray;
            // contact = get(contact, '[0].contactJson');
            contact = updateContactFollowUpFields(contact, relationshipsArray, periodOfFollowUp);
            return updateContactRequest(contact)
        })
        .then(() => insertOrUpdateExposure(exposure))
}

function getRelationshipsForPerson(outbreakId, personId) {
    let query = {
        type: 'select',
        table: 'relationship',
        fields: [
            {
                table: 'relationship',
                name: 'json',
                alias: 'relationshipData'
            }
        ],
        condition: {
            // 'outbreakId': outbreakId,
            '$or': [
                {'sourceId': personId},
                {'targetId': personId}
            ],
            'deleted': 0
        }
    };

    return executeQuery(query)
        .then((relationships) => {
            return Promise.resolve(relationships.map((e) => e.relationshipData))
        })
}

export function getExposuresForContact(contactId, outbreakId) {
    let query = {
        type: 'select',
        table: 'relationship',
        fields: [
            {
                table: 'relationship',
                name: 'json',
                alias: 'relationshipData'
            },
            {
                table: 'person',
                name: 'json',
                alias: 'caseData'
            }
        ],
        join: [
            {
                type: 'inner',
                table: 'person',
                on: {'person._id': 'relationship.sourceId'}
            }
        ],
        condition: {
            'relationship.targetId': contactId,
            'relationship.deleted': 0
        }
    };

    return executeQuery(query);
}

export function getContactRelationForContact(contactId, outbreakId) {
    let query = {
        type: 'select',
        table: 'relationship',
        fields: [
            {
                table: 'relationship',
                name: 'json',
                alias: 'relationshipData'
            },
            {
                table: 'person',
                name: 'json',
                alias: 'caseData'
            }
        ],
        join: [
            {
                type: 'inner',
                table: 'person',
                on: {'person._id': 'relationship.targetId'}
            }
        ],
        condition: {
            'relationship.sourceId': contactId,
            'relationship.deleted': 0
        }
    };

    return executeQuery(query);
}

export function checkForNameDuplicated(id, firstName, lastName, outbreakId) {
    let query = {
        type: 'select',
        table: 'person',
        fields: [
            {
                table: 'person',
                name: 'json',
                alias: 'personData'
            }
        ],
        condition: {
            '_id': {'$ne': id},
            'outbreakId': outbreakId,
            'firstName': firstName,
            'lastName': lastName
        }
    };

    return executeQuery(query)
        .then((result) => Promise.resolve(checkArrayAndLength(result)))
}

// Expects relationships to be an array of relationships
function updateContactFollowUpFields(contact, exposures, outbreakPeriodOfFollowup) {
    if (checkArrayAndLength(exposures)) {
        let maxDate = max(exposures.map((e) => {return createDate(e.contactDate)}));
        let oldStartDate = get(contact, 'followUp.startDate', null);
        // let oldEndDate = contact && contact.followUp && contact.followUp.endDate ? contact.followUp.endDate : null;

        contact.dateOfLastContact = maxDate.toISOString();
        if (!contact.followUp) {
            contact.followUp = {};
        }
        const timezone = store.getState().app.timezone;
        contact.followUp.startDate = moment.tz(maxDate, timezone).add(1, 'days')._d.toISOString();
        if (!contact.followUp.originalStartDate) {
            contact.followUp.originalStartDate = contact.followUp.startDate;
        }
        contact.followUp.endDate = moment.tz(contact.followUp.startDate, timezone)
            .add(outbreakPeriodOfFollowup > 0 ? outbreakPeriodOfFollowup - 1 : 0, 'days')._d.toISOString();
        if (oldStartDate !== contact.followUp.startDate) {
            contact.followUp.status = config.contactFollowUpStatuses.underFollowUp;
        }
    }
    return contact;
}

// TODO investigate why here the contact followUp fields are not updated
export function updateExposureForContact(exposure, contact, periodOfFollowUp, userId) {
    return addExposureForContact(exposure, contact, periodOfFollowUp, userId);
}