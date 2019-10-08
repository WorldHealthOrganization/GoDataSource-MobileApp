/**
 * Created by florinpopa on 20/07/2018.
 */
import {
    ACTION_TYPE_STORE_CONTACTS,
    ACTION_TYPE_UPDATE_CONTACT,
    ACTION_TYPE_ADD_CONTACT,
    ACTION_TYPE_REMOVE_CONTACT
} from './../utils/enums';
import {
    getContactsForOutbreakIdRequest,
    getContactByIdRequest,
    // updateContactRequest,
    addContactRequest,
    addExposureForContactRequest,
    updateExposureForContactRequest,
    deleteExposureForContactRequest
} from './../queries/contacts'
import { addError } from './errors';
import errorTypes from './../utils/errorTypes';
import {getRelationshipsForTypeRequest, getRelationshipsAndFollowUpsForContactRequest} from './../queries/relationships';
import {extractIdFromPouchId, mapContactsAndRelationships, updateRequiredFields, mapContactsAndFollowUps, createDate} from './../utils/functions';
import moment from 'moment';
import config from './../utils/config';
import max from 'lodash/max';
import get from 'lodash/get';
import set from 'lodash/set';
import {setLoaderState} from "./app";
import {batchActions} from 'redux-batched-actions';
import {checkArrayAndLength} from "../utils/typeCheckingFunctions";
import {executeQuery, insertOrUpdate} from "../queries/sqlTools/helperMethods";
import translations from "../utils/translations";
import sqlConstants from "../queries/sqlTools/constants";
import {generalMapping} from "./followUps";
import {insertOrUpdateExposure} from './exposure';
var jsonSql = require('json-sql')();
jsonSql.setDialect('sqlite');

// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
export function getContactsForOutbreakId({outbreakId, contactsFilter, exposureFilter, lastElement}) {
    let contactsAndExposuresQuery = {
        type: 'select',
        distinct: true,
        query: sqlConstants.createMainQuery(translations.personTypes.contacts, outbreakId, contactsFilter, exposureFilter, lastElement), // Here will take place the contact/exposure filter/sort
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
        // limit: 10
    };

    // if (lastElement) {
    //     contactsAndExposuresQuery['condition'] = {
    //         'MappedData.IdField': {'$gt': lastElement}
    //     }
    // }

    return executeQuery(contactsAndExposuresQuery)
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
    delete contact.relationships;
    return Promise.resolve()
        .then(() => insertOrUpdate('common', 'person', [contact], false))
        .then(() => addExposureForContact(exposure, contact, periodOfFollowUp, userId))
    // // Since will have only one relationship, we can set here all the data needed dateOfLastContact, followUp: {originalStartDate, startDate, endDate, status}
    // let relationship = contact.relationships[0];
    // relationship = updateRequiredFields(outbreakId = outbreakId, userId = contact.updatedBy, record = relationship, action = 'create', fileType = 'relationship.json')
    // delete contact.relationships;
    //
    // return async function(dispatch, getState) {
    //     addContactRequest(outbreakId, contact, token, (error, response) => {
    //         if (error) {
    //             console.log("*** addContact error: ", error);
    //             dispatch(addError(errorTypes.ERROR_ADD_CONTACT));
    //         }
    //         if (response) {
    //             console.log("*** addContact response: ", JSON.stringify(response));
    //             if (contactMatchFilter === true) {
    //                 dispatch(addContactAction(response));
    //                 console.log('test ajunge aici')
    //             }
    //             dispatch(addExposureForContact(outbreakId, response._id, relationship, token, null));
    //         }
    //     })
    // }
}

export function updateContactRequest(contact) {
    return insertOrUpdate('common', 'person', [contact], true);
}

export function updateContact(contact) {
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
            contact = get(contact, '[0].contactJson');
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
            // 'relationship.outbreakId': outbreakId,
            'person.outbreakId': outbreakId
        }
    };

    return executeQuery(query)
        // .then((resultGetRelations) => {
        //     return Promise.resolve(resultGetRelations.map((e) => e.))
        // })
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
        .then((result) => checkArrayAndLength(result))
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
        contact.followUp.startDate = moment.utc(maxDate).add(1, 'days')._d.toISOString();
        if (!contact.followUp.originalStartDate) {
            contact.followUp.originalStartDate = contact.followUp.startDate;
        }
        contact.followUp.endDate = moment.utc(contact.followUp.startDate).add(outbreakPeriodOfFollowup, 'days')._d.toISOString();
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