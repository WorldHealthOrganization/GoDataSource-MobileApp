/**
 * Created by florinpopa on 19/07/2018.
 */
// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
import { ACTION_TYPE_STORE_CASES,
    ACTION_TYPE_ADD_CASE,
    ACTION_TYPE_UPDATE_CASE,
    ACTION_TYPE_REMOVE_CASE} from './../utils/enums';
// import {deleteCaseRequest} from './../requests/cases';
// import {getCasesForOutbreakIdRequest, addCaseRequest, updateCaseRequest} from './../queries/cases';
// import { addError } from './errors';
// import errorTypes from './../utils/errorTypes';
// import config from './../utils/config';
// import {batchActions} from 'redux-batched-actions';
// import {setLoaderState} from "./app";
// import {addExposure, updateExposure, removeExposure} from './exposure';
import {executeQuery, insertOrUpdate} from "../queries/sqlTools/helperMethods";
import translations from "../utils/translations";
import sqlConstants from "../queries/sqlTools/constants";
// import {generalMapping} from "./followUps";
import get from 'lodash/get';
var jsonSql = require('json-sql')();
jsonSql.setDialect('sqlite');

// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
export function storeCases(cases) {
    return {
        type: ACTION_TYPE_STORE_CASES,
        payload: cases
    }
};

export function addCaseAction(myCase) {
    return {
        type: ACTION_TYPE_ADD_CASE,
        payload: myCase
    }
}

export function updateCaseAction(myCase) {
    return {
        type: ACTION_TYPE_UPDATE_CASE,
        payload: myCase
    }
}

export function removeCaseAction(myCase) {
    return {
        type: ACTION_TYPE_REMOVE_CASE,
        payload: myCase
    }
}

export function getCasesForOutbreakId({outbreakId, casesFilter, searchText, lastElement}) {
    let casesQuery = {
        type: 'select',
        query: sqlConstants.createMainQuery(translations.personTypes.cases, outbreakId, casesFilter, searchText, lastElement), // Here will take place the contact/exposure filter/sort
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

    return Promise.resolve()
        .then(() => executeQuery(casesQuery))
        .then((mappedData) => Promise.resolve(mappedData))
        .catch((errorGetCases) => Promise.reject(errorGetCases));
};

export function addCase(myCase) {
    return insertOrUpdate('common', 'person', [myCase], false);
};

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

export function getCaseAndExposuresById (caseId) {
    let query = {
        type: 'select',
        table: 'person',
        alias: 'Main',
        fields: [
            {
                table: 'Main',
                name: 'json',
                alias: 'caseData'
            },
            {
                func: {
                    name: 'group_concat',
                    args: [{field: `relationship.json`}, '***']
                },
                alias: 'relationshipData'
            },
            {
                func: {
                    name: 'group_concat',
                    args: [{field: `Exposure.json`}, '***']
                },
                alias: 'exposureData'
            }
        ],
        join: [
            {
                type: 'left',
                table: 'relationship',
                on: {'Main._id': 'relationship.sourceId'}
            },
            {
                type: 'left',
                table: 'person',
                alias: 'Exposure',
                on: {'relationship.targetId': 'Exposure._id'}
            }
        ],
        condition: {
            'Main._id': caseId,
            'Exposure.type': translations.personTypes.contacts
        }
    };

    return Promise.resolve()
        .then(() => executeQuery(query))
        .then((mappedData) => Promise.resolve(get(mappedData, '[0]', null)))
        .then((mappedData) => {
            if (mappedData['relationshipData'] !== null) {
                let exposures = mappedData['relationshipData'].split('***');
                mappedData['relationshipData'] = exposures.map((f) => JSON.parse(f));
            }
            return Promise.resolve(mappedData);
        })
        .catch((errorGetData) => Promise.reject(errorGetData))
}