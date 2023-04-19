/**
 * Created by florinpopa on 19/07/2018.
 */
// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
import {executeQuery, insertOrUpdate} from "../queries/sqlTools/helperMethods";
import translations from "../utils/translations";
import sqlConstants from "../queries/sqlTools/constants";
import constants from "../utils/constants";
import get from 'lodash/get';
import {checkArrayAndLength} from "../utils/typeCheckingFunctions";
import {getPersonWithRelationsForOutbreakId} from './../queries/sqlTools/sqlQueryInterface';

// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
export function getCasesForOutbreakId({outbreakId, casesFilter, searchText, lastElement, offset}, computeCount) {
    return getPersonWithRelationsForOutbreakId({
        outbreakId,
        filter: casesFilter,
        search: searchText,
        lastElement: lastElement,
        offset,
        personType: translations.personTypes.cases
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

export function getCasesForOutbreakIdOld({outbreakId, casesFilter, searchText, lastElement, offset}, computeCount) {
    let countPromise = null;
    let casesPromise = null;

    let casesQuery = {
        type: 'select',
        query: sqlConstants.createMainQuery(translations.personTypes.cases, outbreakId, casesFilter, searchText, lastElement, offset), // Here will take place the contact/exposure filter/sort
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
        ]
    };

    if (computeCount) {
        let casesQueryCount = {
            type: 'select',
            query: sqlConstants.createMainQuery(translations.personTypes.cases, outbreakId, casesFilter, searchText, lastElement, offset, true), // Here will take place the contact/exposure filter/sort
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
        }
        countPromise = executeQuery(casesQueryCount);
    }
    casesPromise = executeQuery(casesQuery);

    return Promise.all([casesPromise, countPromise])
        .then(([cases, casesCount]) => {
            console.log('Returned values: ');
            return Promise.resolve({data: cases, dataCount: checkArrayAndLength(casesCount) ? casesCount[0].countRecords : undefined});
        })
        .catch((errorGetCases) => Promise.reject(errorGetCases))
}

export function addCase(myCase) {
    return insertOrUpdate('common', 'person', [myCase], false);
}

export function updateCase (myCase) {
    return  insertOrUpdate('common', 'person', [myCase], false)
}

export function getCasesByName(outbreakId, search) {
    let casesQuery = {
        type: 'select',
        table: 'person',
        fields: [
            {
                table: 'person',
                name: '_id',
                alias: '_id',
            },
            {
                table: 'person',
                name: 'firstName',
                alias: 'firstName',
            },
            {
                table: 'person',
                name: 'lastName',
                alias: 'lastName',
            },
            {
                table: 'person',
                name: 'visualId',
                alias: 'visualId',
            },
            {
                table: 'person',
                name: 'type',
                alias: 'type',
            }
        ],
        condition: {
            'outbreakId': outbreakId,
            'type': {'$ne': translations.personTypes.contacts},
            '$or': [
                {'firstName': {'$like': `%${search}%`}},
                {'lastName': {'$like': `%${search}%`}},
                {'visualId': {'$like': `%${search}%`}},
            ]
        }
    };

    return Promise.resolve()
        .then(() => executeQuery(casesQuery))
        .then((mappedData) => Promise.resolve(mappedData))
        .catch((errorGetData) => Promise.reject(errorGetData))
}

export function getPersonsByName(outbreakId, search, type, relationshipType) {
    let condition = {
        '$and':[
            {
                '$or': [
                    {
                        ['deleted']: 0,
                    },
                    {
                        ['deleted']: {'$is': null}
                    }
                ]
            },
            {
                '$or': [
                    {'firstName': {'$like': `%${search}%`}},
                    {'lastName': {'$like': `%${search}%`}},
                    {'visualId': {'$like': `%${search}%`}},
                ],
                'outbreakId': outbreakId,
            },

        ]
    };

    if (relationshipType === constants.RELATIONSHIP_TYPE.contact){
        if((type === 'Case' || type === translations.personTypes.cases) || (type === 'Event' || type === translations.personTypes.events)){
            condition['type'] = {'$in': [translations.personTypes.events,translations.personTypes.cases, translations.personTypes.contacts ]};
        } else if ((type === 'Contact' || type === translations.personTypes.contacts)){
            condition['type'] = {'$in':[translations.personTypes.contactsOfContacts]};
        }
    } else if (relationshipType === constants.RELATIONSHIP_TYPE.exposure){
        if((type === 'Case' || type === translations.personTypes.cases) || (type === 'Event' || type === translations.personTypes.events)) {
            condition['type'] = {'$in': [translations.personTypes.events, translations.personTypes.cases]};
        } else if (type === 'Contact' || type === translations.personTypes.contacts){
            condition['type'] = {'$in': [translations.personTypes.events,translations.personTypes.cases ]};
        } else if (type === 'ContactOfContact' || type === translations.personTypes.contactsOfContacts){
            condition['type'] = {'$in': [translations.personTypes.contacts]};
        }
    }
    let casesQuery = {
        type: 'select',
        table: 'person',
        fields: [
            {
                table: 'person',
                name: '_id',
                alias: '_id',
            },
            {
                table: 'person',
                name: 'firstName',
                alias: 'firstName',
            },
            {
                table: 'person',
                name: 'lastName',
                alias: 'lastName',
            },
            {
                table: 'person',
                name: 'visualId',
                alias: 'visualId',
            },
            {
                table: 'person',
                name: 'type',
                alias: 'type',
            }
        ],
        condition: condition,
        sort: {'firstName': 1, 'lastName': 2}
    };

    return Promise.resolve()
        .then(() => executeQuery(casesQuery))
        .then((mappedData) => Promise.resolve(mappedData))
        .catch((errorGetData) => Promise.reject(errorGetData))
}

export function getCaseAndRelationshipsById (caseId, outbreakId) {
    let queryCase = {
        type: 'select',
        table: 'person',
        fields: [
            {
                table: 'person',
                name: 'json',
                alias: 'caseData'
            }
        ],
        condition: {
            '_id': caseId
        }
    };

    let queryExposureRelations = {
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
                alias: 'contactData'
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
            'relationship.targetId': caseId,
            'relationship.deleted': 0
            // 'person.type': translations.personTypes.contacts
            // 'relationship.outbreakId': outbreakId,
        }
    };
    let queryContactRelations = {
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
                alias: 'contactData'
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
            'relationship.sourceId': caseId,
            'relationship.deleted': 0
        }
    };
    if (outbreakId) {
        queryContactRelations.condition[`person.outbreakId`] = outbreakId;
    }

    let promiseCaseData = executeQuery(queryCase)
        .then((caseData) => Promise.resolve(get(caseData, `[0].caseData`, null)));
    let promiseContactRelationsData = executeQuery(queryContactRelations);
    let promiseExposureRelationsData = executeQuery(queryExposureRelations);

    return Promise.all([promiseCaseData, promiseContactRelationsData, promiseExposureRelationsData])
        .then(([caseData, relationshipContactData, relationshipExposureData ]) => Promise.resolve({caseData, relationshipContactData, relationshipExposureData }))
        .catch((errorGetData) => Promise.reject(errorGetData))
}

export function getRelationsContactForCase (caseId) {
    let queryRelations = {
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
                alias: 'contactData'
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
            'relationship.sourceId': caseId,
            'relationship.deleted': 0
         }
    };
    return executeQuery(queryRelations);
}
export function getRelationsExposureForCase (caseId) {
    let queryRelations = {
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
                alias: 'contactData'
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
            'relationship.targetId': caseId,
            'relationship.deleted': 0
            // 'person.type': translations.personTypes.contacts
            // 'relationship.outbreakId': outbreakId,
        }
    };

    return executeQuery(queryRelations);
}

export function getItemByIdRequest (personId) {
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
            '_id': personId
        }
    };

    return executeQuery(query)
        .then((response) => Promise.resolve(get(response, `[0].personData`, null)))
}