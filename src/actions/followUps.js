/**
 * Created by florinpopa on 19/07/2018.
 */
import get from 'lodash/get';
import {createDate} from './../utils/functions';
import {executeQuery, insertOrUpdate} from './../queries/sqlTools/helperMethods';
import {checkArrayAndLength} from "../utils/typeCheckingFunctions";
var jsonSql = require('json-sql')();
jsonSql.setDialect('sqlite');
import translations from './../utils/translations';

// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
export function getFollowUpsForOutbreakId({outbreakId, followUpFilter, userTeams, contactsFilter, exposureFilter, lastElement, offset}, computeCount) {
    let countPromise = null;
    let followUpPromise = null;

    // Query for follow-ups
    let fUpsQuery = {};
    // contactFilters will apply here but exposureFilter will apply on the fUpsQuery
    let contactsWithRelationshipsQuery = {};

    // need to do custom logic for followUps
    let queryFUps = createMainQuery(translations.personTypes.contacts, outbreakId, contactsFilter, exposureFilter, lastElement, offset, false);

    queryFUps.join.push({
        type: 'inner',
        table: 'followUp',
        alias: 'FollowUps',
        on: {[`MainQuery._id`]: `FollowUps.personId`}
    });
    queryFUps.fields.push({
        table: 'FollowUps',
        name: 'json',
        alias: 'followUpData'
    });

    let followUpCondition = Object.assign({}, queryFUps.condition);
    followUpCondition['FollowUps.deleted'] = 0;
    if (outbreakId) {
        followUpCondition['FollowUps.outbreakId'] = outbreakId;
    }
    if (followUpFilter.date) {
        followUpCondition['FollowUps.date'] = {
            '$gte': `${createDate(followUpFilter.date).toISOString()}`,
            '$lte': `${createDate(followUpFilter.date, true).toISOString()}`
        };
    }
    if (followUpFilter.statusId) {
        followUpCondition['FollowUps.statusId'] = followUpFilter.statusId
    }
    if (checkArrayAndLength(userTeams)) {
        followUpCondition['$or'] = [
            {
                ['FollowUps.teamId']: {'$in': userTeams.map((e) => e.teamId)}
            },
            {
                ['FollowUps.teamId']: {'$is': null}
            }
        ]
    }

    let sort = {};

    if (checkArrayAndLength(get(contactsFilter, 'sort', null))) {
        for (let i = 0; i < contactsFilter.sort.length; i++) {
            let sortOrder = get(contactsFilter, `sort[${i}].sortOrder`, null) === translations.sortTab.sortOrderAsc ? 1 : -1;
            // Sort by firstName
            if (get(contactsFilter, `sort[${i}].sortCriteria`, null) === translations.sortTab.sortFirstName) {
                sort[`ContactsWithExposures.firstName`] = sortOrder;
            }
            // Sort by lastName
            if (get(contactsFilter, `sort[${i}].sortCriteria`, null) === translations.sortTab.sortLastName) {
                sort[`ContactsWithExposures.lastName`] = sortOrder;
            }
            // Sort by visualId
            if (get(contactsFilter, `sort[${i}].sortCriteria`, null) === translations.sortTab.sortVisualId) {
                sort[`ContactsWithExposures.visualId`] = sortOrder;
            }
            // Sort by createdAt
            if (get(contactsFilter, `sort[${i}].sortCriteria`, null) === translations.sortTab.sortCreatedAt) {
                sort[`ContactsWithExposures.createdAt`] = sortOrder;
            }
            // Sort by updatedAt
            if (get(contactsFilter, `sort[${i}].sortCriteria`, null) === translations.sortTab.sortUpdatedAt) {
                sort[`ContactsWithExposures.updatedAt`] = sortOrder;
            }
        }
        // followUpCondition['$not'] = notQuery;
    } else {
        sort[`MainQuery.lastName`] = 1;
        sort[`MainQuery.firstName`] = 1;
        sort['MainQuery._id'] = 1;
        sort['FollowUps._id'] = 1;
        if (lastElement) {
            followUpCondition = Object.assign({}, followUpCondition, {
                $expression: {
                    pattern: `(MainQuery.lastName, MainQuery.firstName, MainQuery._id, FollowUps._id)>({lastName}, {firstName}, {id}, {followUpId})`,
                    values: {
                        lastName: get(lastElement, 'lastName', ''),
                        firstName: get(lastElement, 'firstName', ''),
                        id: get(lastElement, '_id', ''),
                        followUpId: get(lastElement, 'followUpId', '')
                    }
                }
            })
        }
    }

    queryFUps.condition = followUpCondition;
    queryFUps.sort = sort;

    if (computeCount) {
        let followUpCount = createMainQuery(translations.personTypes.contacts, outbreakId, contactsFilter, exposureFilter, lastElement, offset, true);
        followUpCount.join.push({
            type: 'inner',
            table: 'followUp',
            alias: 'FollowUps',
            on: {[`MainQuery._id`]: `FollowUps.personId`}
        });
        followUpCount.condition = followUpCondition;
        delete followUpCount.limit;
        delete followUpCount.group;
        countPromise = executeQuery(followUpCount);
    }
    followUpPromise = executeQuery(queryFUps);

    return Promise.all([followUpPromise, countPromise])
        .then(([followUps, followUpsCount]) => {
            console.log('Returned values FollowUps: ', followUps.length);
            return Promise.resolve({data: followUps, dataCount: checkArrayAndLength(followUpsCount) ? followUpsCount[0].countRecords : undefined});
        })
        .catch((errorGetFollowUps) => Promise.reject(errorGetFollowUps))
}

function getContactsWithRelationships(outbreakId, dataType, contactFilter) {

    let condition = {
        [`Contact.deleted`]: 0,
        [`Contact.type`]: dataType,
        [`MainQuery.outbreakId`]: outbreakId
    };


    if (checkArrayAndLength(get(mainFilter, 'age', null)) && mainFilter.age.length === 2) {
        condition[`MainQuery.age`] = {
            ['$gte']: get(mainFilter, 'age[0]', 0),
            ['$lte']: get(mainFilter, 'age[1]', 150)
        };
    }
    if (get(mainFilter, 'gender', null) !== null) {
        condition[`MainQuery.gender`] = mainFilter.gender;
    }
    if (checkArrayAndLength(get(mainFilter, 'categories', null))) {
        condition[`MainQuery.categoryId`] = {
            ['$in']: mainFilter.categories
        };
    }
    if (checkArrayAndLength(get(mainFilter, 'classification', null))) {
        condition[`MainQuery.classification`] = {
            ['$in']: mainFilter.classification
        };
    }
    if (checkArrayAndLength(get(mainFilter, 'selectedLocations', null))) {
        condition[`MainQuery.locationId`] = {
            ['$in']: mainFilter.selectedLocations
        };
    }



    return {
        type: 'select',
        table: 'person',
        alias: 'Contact',
        fields: [
            {
                table: 'Contact'
            },
            {
                table: 'Relation',
                name: 'sourceId',
                alias: 'SourceId'
            },
            {
                table: 'Relation',
                name: 'targetId',
                alias: 'TargetId'
            },
            {
                table: 'Relation',
                name: '_id',
                alias: 'RelId'
            }
        ],
        join: [
            {
                type: 'left',
                table: 'relationship',
                alias: 'Relation',
                on: {['Contact._id']: 'Relation.targetId'}
            }
        ],
        condition: {
            'Contact.type': translations.personTypes.contacts,
            'Contact.outbreakId': outbreakId
        }
    }
}

function createMainQuery (dataType, outbreakId, mainFilter, search, lastElement, offset, skipExposures) {
    let condition = {
        [`MainQuery.deleted`]: 0,
        [`MainQuery.type`]: dataType,
        [`MainQuery.outbreakId`]: outbreakId
    };
    let joinFieldMainQueryRelations = dataType !== translations.personTypes.cases ? 'targetId' : 'sourceId';
    let joinFieldRelationsFilteredExposures = dataType !== translations.personTypes.cases ? 'sourceId' : 'targetId';

    if (search) {
        if (dataType === translations.personTypes.cases) {
            condition['$or'] = [
                {[`MainQuery.firstName`]: {'$like': `%${search}%`}},
                {[`MainQuery.lastName`]: {'$like': `%${search}%`}},
                {[`MainQuery.visualId`]: {'$like': `%${search}%`}}
            ]
        } else {
            condition['$or'] = [
                {[`MainQuery.firstName`]: {'$like': `%${search}%`}},
                {[`MainQuery.lastName`]: {'$like': `%${search}%`}},
                {[`MainQuery.visualId`]: {'$like': `%${search}%`}},
                {[`FilteredExposures.firstName`]: {'$like': `%${search}%`}},
                {[`FilteredExposures.lastName`]: {'$like': `%${search}%`}},
                {[`FilteredExposures.visualId`]: {'$like': `%${search}%`}}
            ]
        }
    }

    if (checkArrayAndLength(get(mainFilter, 'age', null)) && mainFilter.age.length === 2) {
        condition[`MainQuery.age`] = {
            ['$gte']: get(mainFilter, 'age[0]', 0),
            ['$lte']: get(mainFilter, 'age[1]', 150)
        };
    }
    if (get(mainFilter, 'gender', null) !== null) {
        condition[`MainQuery.gender`] = mainFilter.gender;
    }
    if (checkArrayAndLength(get(mainFilter, 'categories', null))) {
        condition[`MainQuery.categoryId`] = {
            ['$in']: mainFilter.categories
        };
    }
    if (checkArrayAndLength(get(mainFilter, 'classification', null))) {
        condition[`MainQuery.classification`] = {
            ['$in']: mainFilter.classification
        };
    }
    if (checkArrayAndLength(get(mainFilter, 'selectedLocations', null))) {
        condition[`MainQuery.locationId`] = {
            ['$in']: mainFilter.selectedLocations
        };
    }

    let query = {
        type: 'select',
        table: 'person',
        alias: 'MainQuery',
        fields: [
            {
                table: 'MainQuery',
                name: 'json',
                alias: 'mainData',
            }
        ],
        join: [
            {
                type: 'left',
                table: 'relationship',
                alias: 'Relations',
                on: {[`MainQuery._id`]: `Relations.${joinFieldMainQueryRelations}`}
            },
            {
                type: 'left',
                table: 'person',
                alias: 'FilteredExposures',
                on: {[`Relations.${joinFieldRelationsFilteredExposures}`]: `FilteredExposures._id`}
            }
        ],
        condition: condition,
        group: 'FollowUps._id'
    };

    if (!skipExposures) {
        query.join.push({
            type: 'left',
            query: {
                type: 'select',
                table: 'relationship',
                alias: 'AllRelations',
                fields: [
                    {
                        table: 'AllRelations',
                        name: dataType !== translations.personTypes.cases ? 'targetId' : 'sourceId',
                        alias: 'linkExposures'
                    },
                    {
                        table: 'AllPersons',
                        name: 'json',
                        alias: 'AllExposuresString'
                    }
                ],
                join: [
                    {
                        type: 'inner',
                        table: 'person',
                        alias: 'AllPersons',
                        on: {[`AllRelations.${joinFieldRelationsFilteredExposures}`]: `AllPersons._id`}
                    }
                ]
            },
            alias: 'AllExposures',
            on: {[`MainQuery._id`]: `AllExposures.linkExposures`}
        });
        query.fields.push({
            func: {
                name: 'group_concat',
                args: [{field: `AllExposures.AllExposuresString`}, '***']
            },
            alias: 'exposureData'
        });
        query.limit = 10;
    } else {
        query.fields = [
            {
                func: {
                    name: 'count',
                    args: [{
                        expression: {
                            pattern: `distinct FollowUps._id`
                        }}]
                },
                alias: 'countRecords'
            }
        ]
    }

    if (checkArrayAndLength(get(mainFilter, 'sort', null)) && lastElement) {
        query['offset'] = offset;
    }


    return query;
}

export function getFollowUpById(followUpId, outbreakId) {
    let queryObject = {
        type: 'select',
        table: 'followUp',
        fields: [
            {
                table: 'followUp',
                name: 'json',
                alias: 'followUpData'
            }
        ],
        condition: {
            '_id': followUpId,
            'outbreakId': outbreakId
        }
    };

    return executeQuery(queryObject)
        .then((result) => {
            return get(result, '[0].followUpData', null);
        })
}

export function updateFollowUpAndContact(followUp) {
    return Promise.resolve()
        .then(() => insertOrUpdate('common', 'followUp', [followUp], true))
        .then((response) => Promise.resolve(response))
        .catch((errorUpdateFollowUp) => Promise.reject(errorUpdateFollowUp));
}

export function addFollowUp(followUp) {
    return updateFollowUpAndContact(followUp);
}

export function createFollowUp(followUp) {
    return updateFollowUpAndContact(followUp)
}

export function getFollowUpsForContactId(contactId, outbreakId, userTeams) {
    let query = {
        type: 'select',
        table: 'followUp',
        fields: [
            {
                table: 'followUp',
                name: 'json',
                alias: 'followUps'
            }
        ],
        condition: {
            'personId': contactId,
            'teamId': {'$in': userTeams.map((e) => e.teamId)},
            'outbreakId': outbreakId,
            'deleted': 0
        }
    };

    return executeQuery(query);
}