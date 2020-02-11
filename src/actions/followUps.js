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

    let queryFollowUps = createQueryFollowUps(outbreakId, followUpFilter, userTeams, contactsFilter, exposureFilter, lastElement, offset);


    if (computeCount) {
        let followUpCount = createQueryFollowUps(outbreakId, followUpFilter, userTeams, contactsFilter, exposureFilter, lastElement, offset, true);

        countPromise = executeQuery(followUpCount);
    }
    followUpPromise = executeQuery(queryFollowUps);

    return Promise.all([followUpPromise, countPromise])
        .then(([followUps, followUpsCount]) => {
            console.log('Returned values FollowUps: ', followUps.length);
            return Promise.resolve({data: followUps, dataCount: checkArrayAndLength(followUpsCount) ? followUpsCount[0].countRecords : undefined});
        })
        .catch((errorGetFollowUps) => Promise.reject(errorGetFollowUps))
}

function createQueryContactsWithRelations(outbreakId, dataType, mainFilter) {

    let contactAlias = 'Contact';
    let relationAlias = 'Relation';

    let condition = createConditionContactsWithRelations(outbreakId, dataType, mainFilter);

    return {
        type: 'select',
        table: 'person',
        alias: contactAlias,
        fields: [
            {
                table: contactAlias
            },
            {
                table: relationAlias,
                name: 'sourceId',
                alias: 'SourceId'
            },
            {
                table: relationAlias,
                name: 'targetId',
                alias: 'TargetId'
            },
            {
                table: relationAlias,
                name: '_id',
                alias: 'RelId'
            }
        ],
        join: [
            {
                type: 'left',
                table: 'relationship',
                alias: relationAlias,
                on: {[`${contactAlias}._id`]: `${relationAlias}.targetId`}
            }
        ],
        condition: condition
    }
}

function createConditionContactsWithRelations(outbreakId, dataType, filter) {
    let contactAlias = 'Contact';

    let condition = {
        [`${contactAlias}.deleted`]: 0,
        [`${contactAlias}.type`]: dataType,
        [`${contactAlias}.outbreakId`]: outbreakId
    };

    if (checkArrayAndLength(get(filter, 'age', null)) && filter.age.length === 2) {
        condition[`${contactAlias}.age`] = {
            ['$gte']: get(filter, 'age[0]', 0),
            ['$lte']: get(filter, 'age[1]', 150)
        };
    }
    if (get(filter, 'gender', null) !== null) {
        condition[`${contactAlias}.gender`] = filter.gender;
    }
    if (checkArrayAndLength(get(filter, 'categories', null))) {
        condition[`${contactAlias}.categoryId`] = {
            ['$in']: filter.categories
        };
    }
    if (checkArrayAndLength(get(filter, 'classification', null))) {
        condition[`${contactAlias}.classification`] = {
            ['$in']: filter.classification
        };
    }
    if (checkArrayAndLength(get(filter, 'selectedLocations', null))) {
        condition[`${contactAlias}.locationId`] = {
            ['$in']: filter.selectedLocations
        };
    }

    return condition
}

function createQueryFollowUps(outbreakId, followUpsFilter, userTeams, contactsFilter, searchText, lastElement, offset, isCount) {
    let aliasForFollowUps = 'FollowUps';
    let aliasForContacts = 'Contacts';
    let aliasForFilteredExposures = 'FilteredExposures';
    let aliasForAllExposures = 'AllExposures';

    let innerQuery = createQueryContactsWithRelations(outbreakId, translations.personTypes.contacts, contactsFilter);
    let {condition, sort} = createConditionFollowUps(outbreakId, followUpsFilter, userTeams, translations.personTypes.contacts, contactsFilter, searchText, lastElement, offset, skipExposure);

    let query = {
        type: 'select',
        table: 'followUp',
        alias: aliasForFollowUps,
        join: [
            {
                type: 'inner',
                query: innerQuery,
                alias: aliasForContacts,
                on: {[`${aliasForFollowUps}.personId`]: `${aliasForContacts}._id`}
            },
            {
                type: "left",
                table: 'person',
                alias: aliasForFilteredExposures,
                on: {[`${aliasForContacts}.sourceId`]: `${aliasForFilteredExposures}._id`}
            },
            {
                type: "left",
                table: 'person',
                alias: aliasForAllExposures,
                on: {[`${aliasForContacts}.sourceId`]: `${aliasForAllExposures}._id`}
            }
        ],
        condition: condition,
        group: `${aliasForContacts}._id`,
        sort: sort
    };

    if (isCount) {
        query.limit = 10;
        query.fields = [
            {
                func: {
                    name: 'count',
                    args: [{
                        expression: {
                            pattern: `distinct ${aliasForFollowUps}._id`
                        }}]
                },
                alias: 'countRecords'
            }
        ];
    } else {
        query.fields = [
            {
                table: aliasForFollowUps,
                name: 'json',
                alias: 'followUpData'
            },
            {
                table: aliasForContacts,
                name: 'json',
                alias: 'mainData'
            },
            {
                func: {
                    name: 'group_concat',
                    args: [{field: `${aliasForAllExposures}.json`}, '***']
                },
                alias: 'exposureData'
            }
        ]
    }

    return query;
}

function createConditionFollowUps (outbreakId, followUpFilter, userTeams, dataType, contactsFilter, searchText, lastElement, offset, skipExposure) {
    let aliasFollowUps = 'FollowUps';
    let aliasForContacts = 'Contacts';
    let aliasForFilteredExposures = 'FilteredExposures';

    let condition = {
        [`${aliasFollowUps}.deleted`]: 0,

    };
    let sort = {};

    // Here take care of follow-ups conditions
    if (outbreakId) {
        condition[`${aliasFollowUps}.outbreakId`] = outbreakId;
    }
    if (contactsFilter.date) {
        condition[`${aliasFollowUps}.date`] = {
            '$gte': `${createDate(followUpFilter.date).toISOString()}`,
            '$lte': `${createDate(followUpFilter.date, true).toISOString()}`
        };
    }
    if (followUpFilter.statusId) {
        condition[`${aliasFollowUps}.statusId`] = followUpFilter.statusId
    }
    if (checkArrayAndLength(userTeams)) {
        condition['$or'] = [
            {
                ['FollowUps.teamId']: {'$in': userTeams.map((e) => e.teamId)}
            },
            {
                ['FollowUps.teamId']: {'$is': null}
            }
        ]
    }

    // Here take care of searches
    if (search) {
        if (dataType === translations.personTypes.cases) {
            condition['$or'] = [
                {[`${aliasForContacts}.firstName`]: {'$like': `%${search}%`}},
                {[`${aliasForContacts}.lastName`]: {'$like': `%${search}%`}},
                {[`${aliasForContacts}.visualId`]: {'$like': `%${search}%`}}
            ]
        } else {
            condition['$or'] = [
                {[`${aliasForContacts}.firstName`]: {'$like': `%${search}%`}},
                {[`${aliasForContacts}.lastName`]: {'$like': `%${search}%`}},
                {[`${aliasForContacts}.visualId`]: {'$like': `%${search}%`}},
                {[`${aliasForFilteredExposures}.firstName`]: {'$like': `%${search}%`}},
                {[`${aliasForFilteredExposures}.lastName`]: {'$like': `%${search}%`}},
                {[`${aliasForFilteredExposures}.visualId`]: {'$like': `%${search}%`}}
            ]
        }
    }

    // Here take care of sorting
    if (checkArrayAndLength(get(contactsFilter, 'sort', null))) {
        for (let i = 0; i < contactsFilter.sort.length; i++) {
            let sortOrder = get(contactsFilter, `sort[${i}].sortOrder`, null) === translations.sortTab.sortOrderAsc ? 1 : -1;
            // Sort by firstName
            if (get(contactsFilter, `sort[${i}].sortCriteria`, null) === translations.sortTab.sortFirstName) {
                sort[`${aliasForContacts}.firstName`] = sortOrder;
            }
            // Sort by lastName
            if (get(contactsFilter, `sort[${i}].sortCriteria`, null) === translations.sortTab.sortLastName) {
                sort[`${aliasForContacts}.lastName`] = sortOrder;
            }
            // Sort by visualId
            if (get(contactsFilter, `sort[${i}].sortCriteria`, null) === translations.sortTab.sortVisualId) {
                sort[`${aliasForContacts}.visualId`] = sortOrder;
            }
            // Sort by createdAt
            if (get(contactsFilter, `sort[${i}].sortCriteria`, null) === translations.sortTab.sortCreatedAt) {
                sort[`${aliasForContacts}.createdAt`] = sortOrder;
            }
            // Sort by updatedAt
            if (get(contactsFilter, `sort[${i}].sortCriteria`, null) === translations.sortTab.sortUpdatedAt) {
                sort[`${aliasForContacts}.updatedAt`] = sortOrder;
            }
        }
        // followUpCondition['$not'] = notQuery;
    } else {
        sort[`${aliasForContacts}.lastName`] = 1;
        sort[`${aliasForContacts}.firstName`] = 1;
        sort[`${aliasForContacts}._id`] = 1;
        sort[`${aliasFollowUps}._id`] = 1;
        if (lastElement) {
            condition = Object.assign({}, condition, {
                $expression: {
                    pattern: `(${aliasForContacts}.lastName, ${aliasForContacts}.firstName, ${aliasForContacts}._id, ${aliasFollowUps}._id)>({lastName}, {firstName}, {id}, {followUpId})`,
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

    return {condition, sort};

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