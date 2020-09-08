// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
import {getPersonWithRelationsForOutbreakId} from "../queries/sqlTools/sqlQueryInterface";
import translations from "../utils/translations";
import {executeQuery, insertOrUpdate} from "../queries/sqlTools/helperMethods";
import set from "lodash/set";
import {checkArrayAndLength} from "../utils/typeCheckingFunctions";
import get from "lodash/get";
import {addExposureForContact, getContactById, updateContactRequest} from "./contacts";
import {insertOrUpdateExposure} from "./exposure";
import {updateRequiredFields} from "../utils/functions";

export function getContactsOfContactsForOutbreakId({outbreakId, contactsFilter, exposureFilter, lastElement, offset}, computeCount) {
    return getPersonWithRelationsForOutbreakId({
        outbreakId,
        filter: contactsFilter,
        search: exposureFilter,
        lastElement: lastElement,
        offset,
        personType: translations.personTypes.contactsOfContacts
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

export function getExposuresForContactOfContact(contactOfContactId, outbreakId) {
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
            'relationship.targetId': contactOfContactId,
            // 'relationship.outbreakId': outbreakId,
            'person.outbreakId': outbreakId
        }
    };

    return executeQuery(query);
}

export function addContactOfContact(contactOfContact, userId) {
    let exposure = get(contactOfContact, 'relationships[0]', null);
    let exposurePersons = get(exposure, 'persons');
    if (checkArrayAndLength(exposurePersons)) {
        // let contactToBeUpdated = exposurePersons.find((e) => e.type === translations.personTypes.contacts);
        // if (contactToBeUpdated) {
        //     set(contactToBeUpdated, 'id', get(contact, '_id', null));
        // }
        set(exposure, `persons[${exposurePersons.findIndex((e) => e.type === translations.personTypes.contactsOfContacts)}].id`, get(contactOfContact, '_id', null));
    }
    if (contactOfContact.relationships) {
        delete contactOfContact.relationships;
    }
    let promiseContactOfContact = insertOrUpdate('common', 'person', [contactOfContact], false);
    let promiseRelationship = addExposureForContactOfContact(exposure, userId);
    return Promise.all([promiseContactOfContact, promiseRelationship])
        .then(([resultContactOfContact, resultAddRelationship]) => Promise.resolve('Success'));
}

export function updateContactOfContact(contactOfContact) {
    if (contactOfContact.relationships) {
        delete contactOfContact.relationships;
    }
    return insertOrUpdate('common', 'person', [contactOfContact], true);
}

export function addExposureForContactOfContact(exposure, userId) {
    exposure = updateRequiredFields(null, userId, exposure, 'create', 'relationship');

    return insertOrUpdateExposure(exposure);
}

export function updateExposureForContactOfContact(exposure, userId) {
    exposure = updateRequiredFields(null, userId, exposure, 'update', 'relationship');

    return insertOrUpdateExposure(exposure)
}

export function deleteExposureForContactOfContact(exposure, userId) {
    return insertOrUpdateExposure(exposure);
}