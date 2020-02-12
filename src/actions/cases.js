/**
 * Created by florinpopa on 19/07/2018.
 */
// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
import {executeQuery, insertOrUpdate} from "../queries/sqlTools/helperMethods";
import translations from "../utils/translations";
import sqlConstants from "../queries/sqlTools/constants";
import get from 'lodash/get';
import {checkArrayAndLength} from "../utils/typeCheckingFunctions";
import {insertOrUpdateExposure} from "./exposure";

// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
export function getCasesForOutbreakId({outbreakId, casesFilter, searchText, lastElement, offset}, computeCount) {
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
        };
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

export function getCaseAndExposuresById (caseId, outbreakId) {
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
            // 'relationship.outbreakId': outbreakId,
        }
    };
    if (outbreakId) {
        queryRelations.condition[`person.outbreakId`] = outbreakId;
    }

    let promiseCaseData = executeQuery(queryCase)
        .then((caseData) => Promise.resolve(get(caseData, `[0].caseData`, null)));
    let promiseRelationsData = executeQuery(queryRelations);

    return Promise.all([promiseCaseData, promiseRelationsData])
        .then(([caseData, relationshipData]) => Promise.resolve({caseData: caseData, relationshipData: relationshipData}))
        .catch((errorGetData) => Promise.reject(errorGetData))
}

export function getRelationsForCase (caseId) {
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