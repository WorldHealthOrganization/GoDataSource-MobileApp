import translations from './../../utils/translations';
import {executeQuery} from './helperMethods';
import lodashGet from 'lodash/get';
import lodashSet from 'lodash/set';
import {checkArrayAndLength} from "../../utils/typeCheckingFunctions";
import get from "lodash/get";
import {createDate} from "../../utils/functions";
var jsonSql = require('json-sql')();
jsonSql.configure({separatedValues: false});

export function getPersonWithRelationsForOutbreakId({outbreakId, filter, search, lastElement, offset, personType}, computeCount) {

    let countPromise = null;
    let mainPromise = executeQuery(createGeneralQuery({
        outbreakId: outbreakId,
        innerFilter: filter,
        search,
        lastElement,
        offset,
        computeCount: false,
        type: personType
    }, {
        innerQueryAlias: 'CoC',
        relationshipAlias: 'Relation',
        filteredExposuresAlias: 'FilteredExposure',
        unfilteredExposuresAlias: 'AllExposures'
    }));


    if (computeCount) {
        countPromise = executeQuery(createGeneralQuery({
            outbreakId: outbreakId,
            innerFilter: filter,
            search,
            lastElement,
            offset,
            computeCount: true,
            type: personType
        }, {
            innerQueryAlias: 'CoC',
            relationshipAlias: 'Relation',
            filteredExposuresAlias: 'FilteredExposure',
            unfilteredExposuresAlias: 'AllExposures'
        }));
    } else {
        countPromise = Promise.resolve();
    }

    return Promise.all([mainPromise, countPromise])
        .then(([data, count]) => {
            return Promise.resolve({data, dataCount: lodashGet(count, '[0].countRecords', null)})
        })
        .catch((errorGetData) => Promise.reject(errorGetData));
}

function createGeneralQuery ({outbreakId, innerFilter, search, lastElement, offset, computeCount, type}, aliases) {
    let {innerQueryAlias, relationshipAlias, filteredExposuresAlias, unfilteredExposuresAlias} = aliases;

    // Take care of inner query conditions. This will do the preliminary filtering of the data, before moving to relationships, searching and sorting
    let innerCondition = {
        '$and': [
            {
                '$or': [
                    {
                        [`${innerQueryAlias}.deleted`]: 0,
                    },
                    {
                        [`${innerQueryAlias}.deleted`]: {'$is': null}
                    }
                ]
            },
            {[`${innerQueryAlias}.type`]: type},
            {[`${innerQueryAlias}.outbreakId`]: outbreakId},
        ]
    };
    const innerAnd = innerCondition.$and;

    if (checkArrayAndLength(lodashGet(innerFilter, 'age', null)) && innerFilter.age.length === 2) {
        innerAnd.push({[`${innerQueryAlias}.age`] : {
            ['$gte']: lodashGet(innerFilter, 'age[0]', 0),
            ['$lte']: lodashGet(innerFilter, 'age[1]', 150)
        }});
    }
    if (lodashGet(innerFilter, 'gender', null) !== null) {
        innerAnd.push({[`${innerQueryAlias}.gender`] : innerFilter.gender});
    }
    if (checkArrayAndLength(lodashGet(innerFilter, 'categories', null))) {
        innerAnd.push({[`${innerQueryAlias}.categoryId`] : {
            ['$in']: innerFilter.categories
        }});
    }
    if (checkArrayAndLength(lodashGet(innerFilter, 'classification', null))) {
        innerAnd.push({[`${innerQueryAlias}.classification`] : {
            ['$in']: innerFilter.classification.map(i=>i?.value)
        }});
    }
    if (checkArrayAndLength(lodashGet(innerFilter, 'selectedLocations', null))) {
        innerAnd.push({[`${innerQueryAlias}.locationId`] : {
            ['$in']: innerFilter.selectedLocations
        }});
    }

    // Take care of the outer query conditions like searching
    let deletedCheck = {
        $or: [
            {
                [`${filteredExposuresAlias}.deleted`]: 0
            },
            {
                [`${filteredExposuresAlias}.deleted`]: {'$is': null}
            },
            {
                [`${unfilteredExposuresAlias}.deleted`]: 0
            },
            {
                [`${unfilteredExposuresAlias}.deleted`]: {'$is': null}
            }
        ]
    };

    let searchCondition = {
        $or:[]
    };
    // TODO handle email
    let shouldSearchEmail = false;
    if (search && search.text) {
        shouldSearchEmail = true;
        searchCondition['$or'] = [
            {[`${innerQueryAlias}.firstName`]: {'$like': `%${search.text}%`}},
            {[`${innerQueryAlias}.lastName`]: {'$like': `%${search.text}%`}},
            {[`${innerQueryAlias}.visualId`]: {'$like': `%${search.text}%`}},
            {[`${innerQueryAlias}.locationId`]: {'$in': search.locations}},
            // {$expression: `json_extract(${innerQueryAlias}.json, '$.emailAddress') like '%${search.text}%'`}
        ];

        if (type !== translations.personTypes.cases) {
            searchCondition['$or'] = searchCondition['$or'].concat([
                {[`${filteredExposuresAlias}.firstName`]: {'$like': `%${search.text}%`}},
                {[`${filteredExposuresAlias}.lastName`]: {'$like': `%${search.text}%`}},
                {[`${filteredExposuresAlias}.visualId`]: {'$like': `%${search.text}%`}},
            ])
        }
    }

    let filterCondition = {
        $and:[]
    }

    if (checkArrayAndLength(lodashGet(innerFilter, 'vaccines', null))) {
        filterCondition.$and.push({
                $expression: `json_extract(vaccinesReceived.value, '$.vaccine') in (${innerFilter.vaccines.map(vax=>`"${vax.value}"`).join(', ')})`
            }
        )
    }
    if (checkArrayAndLength(lodashGet(innerFilter, 'vaccineStatuses', null))) {
        filterCondition.$and.push({
                $expression: `json_extract(vaccinesReceived.value, '$.status') in (${innerFilter.vaccineStatuses.map(vax=>`"${vax.value}"`).join(', ')})`
            }
        )
    }
    if (checkArrayAndLength(lodashGet(innerFilter, 'pregnancyStatuses', null))) {
        filterCondition.$and.push({
            $expression: `json_extract(${innerQueryAlias}.json, '$.pregnancyStatus') in (${innerFilter.pregnancyStatuses.map(vax=>`"${vax.value}"`).join(', ')})`
        })
    }


    let mainCondition = {
        $and: [deletedCheck, searchCondition, filterCondition]
    }
    // Take care of sorting
    let sort = {};
    if (checkArrayAndLength(lodashGet(innerFilter, 'sort', null))) {
        for (let i = 0; i < innerFilter.sort.length; i++) {
            let sortOrder = lodashGet(innerFilter, `sort[${i}].sortOrder`, null) === translations.sortTab.sortOrderAsc ? 1 : -1;
            // Sort by name
            if (lodashGet(innerFilter, `sort[${i}].sortCriteria`, null) === translations.sortTab.sortName) {
                sort[`${innerQueryAlias}.firstName`] = sortOrder;
            }
            // Sort by firstName
            if (lodashGet(innerFilter, `sort[${i}].sortCriteria`, null) === translations.sortTab.sortFirstName) {
                sort[`${innerQueryAlias}.firstName`] = sortOrder;
            }
            // Sort by lastName
            if (lodashGet(innerFilter, `sort[${i}].sortCriteria`, null) === translations.sortTab.sortLastName) {
                sort[`${innerQueryAlias}.lastName`] = sortOrder;
            }
            // Sort by visualId
            if (lodashGet(innerFilter, `sort[${i}].sortCriteria`, null) === translations.sortTab.sortVisualId) {
                sort[`${innerQueryAlias}.visualId`] = sortOrder;
            }
            // Sort by createdAt
            if (lodashGet(innerFilter, `sort[${i}].sortCriteria`, null) === translations.sortTab.sortCreatedAt) {
                sort[`${innerQueryAlias}.createdAt`] = sortOrder;
            }
            // Sort by updatedAt
            if (lodashGet(innerFilter, `sort[${i}].sortCriteria`, null) === translations.sortTab.sortUpdatedAt) {
                sort[`${innerQueryAlias}.updatedAt`] = sortOrder;
            }
        }
    } else {
        sort[`${innerQueryAlias}.lastName`] = 1;
        sort[`${innerQueryAlias}.firstName`] = 1;
        sort[`${innerQueryAlias}._id`] = 1;
        //TODO: This was placed here for faster performance.This only works for sorted lists. After last name, first name, id. Otherwise this leads to problems displaying the items correctly when there's an offset.The sort does not sort the entire database.
        // if (lastElement) {
        //     mainCondition = Object.assign({}, mainCondition, {
        //         $expression: {
        //             pattern: `(${innerQueryAlias}.lastName, ${innerQueryAlias}.firstName, ${innerQueryAlias}._id)>({lastName}, {firstName}, {id})`,
        //             values: {
        //                 lastName: lodashGet(lastElement, 'lastName', ''),
        //                 firstName: lodashGet(lastElement, 'firstName', ''),
        //                 id: lodashGet(lastElement, '_id', '')
        //             }
        //         }
        //     })
        // }
    }

    // Create queries
    // Inner query
    let innerQuery = {
        type: 'select',
        table: 'person',
        alias: innerQueryAlias,
        condition: innerCondition,
        join:[],
        group: `${innerQueryAlias}._id`
    };

    if (lodashGet(innerFilter, 'selectedIndexDay', null)) {
        const relationshipsJoinForFollowUp = {
            type: 'left',
            table: 'followUp',
            alias: "FollowUp",
            fields: [
                {
                    table: "FollowUp",
                    name: 'indexDay'
                },
                {
                    table: "FollowUp",
                    name: 'deleted'
                }
            ],
            on: {
                'FollowUp.personId': `${innerQueryAlias}._id`,
                'FollowUp.deleted' : 0,
                'FollowUp.indexDay': {
                    ['$gte']: get(innerFilter, 'selectedIndexDay[0]', 0),
                    ['$lte']: get(innerFilter, 'selectedIndexDay[1]', 150)
                },
                'FollowUp.date': {
                    ['$gte']: {expression: `"${createDate(new Date()).toISOString()}"`},
                    ['$lte']: {expression: `"${createDate(new Date(), true).toISOString()}"`}
                }
            }
        };
        innerQuery.join.push(
            relationshipsJoinForFollowUp
        )
        innerQuery.condition.$and.push({
            'FollowUp.indexDay': {
                ['$gte']: get(innerFilter, 'selectedIndexDay[0]', 0),
                ['$lte']: get(innerFilter, 'selectedIndexDay[1]', 150)
            }
        })
    }

    // Main query
    let source = type === translations.personTypes.contacts || type === translations.personTypes.contactsOfContacts ? 'sourceId' : 'targetId';
    let sourceType = type === translations.personTypes.contacts || type === translations.personTypes.contactsOfContacts ? 'sourceType' : 'targetType';
    let target = type === translations.personTypes.contacts || type === translations.personTypes.contactsOfContacts ? 'targetId' : 'sourceId';
    let targetType = type === translations.personTypes.contacts || type === translations.personTypes.contactsOfContacts ? 'targetType' : 'sourceType';

    let relationshipJoin = {
        type: 'left',
        alias: relationshipAlias,
        on: {[`${innerQueryAlias}._id`]: `${relationshipAlias}.${target}`}
    };
    let relationshipJoinForCases = {
        table: 'relationship'
    };
    let relationshipsJoinForContacts = {
        query: {
            type: 'select',
            table: 'relationship',
            alias: relationshipAlias,
            fields: [
                {
                    table: relationshipAlias,
                    name: 'sourceId',
                    alias: 'sourceId'
                },
                {
                    table: relationshipAlias,
                    name: 'targetId',
                    alias: 'targetId'
                },
                {
                    table: relationshipAlias,
                    name: 'sourceType',
                    alias: 'sourceType'
                },
                {
                    table: relationshipAlias,
                    name: 'targetType',
                    alias: 'targetType'
                },
                {
                    table: relationshipAlias,
                    name: 'deleted',
                    alias: 'deleted'
                }
            ],
            // group: `${relationshipAlias}.${target}`
        }
    };
    if (type === translations.personTypes.contacts) {
        relationshipJoin = Object.assign({}, relationshipJoin, relationshipsJoinForContacts);
    } else {
        relationshipJoin = Object.assign({}, relationshipJoin, relationshipJoinForCases);
    }

    let mainQuery = {
        type: 'select',
        // with: {
        //     innerQueryTable:{
        //         query: innerQuery
        //     }},
        // table: 'innerQueryTable',
        query: innerQuery,
        alias: innerQueryAlias,
        join: [
            relationshipJoin,
            {
                type: 'left',
                table: 'person',
                alias: filteredExposuresAlias,
                on: {
                    [`${relationshipAlias}.${source}`]: `${filteredExposuresAlias}._id`,
                    [`${relationshipAlias}.deleted`]: 0,
                }
            },
            {
                type: 'left',
                table: 'person',
                alias: unfilteredExposuresAlias,
                on: {
                    [`${relationshipAlias}.${source}`]: `${unfilteredExposuresAlias}._id`,
                    [`${relationshipAlias}.deleted`]: 0
                }
            },
        ],
        condition: mainCondition
    };

    // TODO handle email
    if (shouldSearchEmail || checkArrayAndLength(lodashGet(innerFilter, 'vaccines', null)) || checkArrayAndLength(lodashGet(innerFilter, 'vaccineStatuses', null))) {
        delete mainQuery.query;
        delete mainQuery.alias;
        let pattern = `(${jsonSql.build(innerQuery).query.slice(0, -1)}) as ${innerQueryAlias}`;

        if (checkArrayAndLength(lodashGet(innerFilter, 'vaccines', null)) ||
            checkArrayAndLength(lodashGet(innerFilter, 'vaccineStatuses', null))
        ) {
            pattern = `${pattern}, json_each(${innerQueryAlias}.json, '$.vaccinesReceived') as "vaccinesReceived"`;
        }
        mainQuery.expression = {
            pattern: pattern
            // pattern: `(${jsonSql.build(innerQuery).query.slice(0, -1)}) as ${innerQueryAlias}, json_each(${innerQueryAlias}.json, '$.addresses')`
        }
    }

    if (type === translations.personTypes.contactsOfContacts) {
        // lodashSet(mainQuery, `join[1].on['${relationshipAlias}.${sourceType}']`, translations.personTypes.contacts);
        // lodashSet(mainQuery, `join[2].on['${relationshipAlias}.${sourceType}']`, translations.personTypes.contacts);
        // mainCondition[`${filteredExposuresAlias}.type`] = translations.personTypes.contacts;
        // mainCondition[`${unfilteredExposuresAlias}.type`] = translations.personTypes.contacts;
    }
    if (type === translations.personTypes.cases) {
        // lodashSet(mainQuery, `join[1].on['${relationshipAlias}Contact.${sourceType}']`, translations.personTypes.contacts);
        // lodashSet(mainQuery, `join[2].on['${relationshipAlias}Contact.${sourceType}']`, translations.personTypes.contacts);
        // mainCondition[`${unfilteredExposuresAlias}.type`] = translations.personTypes.contacts;
    }

    if (computeCount) {
        mainQuery.fields = [
            {
                func: {
                    name: 'count',
                    args: [{
                        expression: {
                            pattern: `distinct ${innerQueryAlias}._id`
                        }}]
                },
                alias: 'countRecords'
            }
        ]
    } else {
        mainQuery.limit = 10;
        if (offset) {
            mainQuery.offset = offset;
        }
        mainQuery.fields = [
            {
                table: innerQueryAlias,
                name: '_id',
                alias: '_id'
            },
            {
                table: innerQueryAlias,
                name: 'json',
                alias: 'mainData'
            },
            {
                func: {
                    name: 'group_concat',
                    args: [{field: `${unfilteredExposuresAlias}.json`}, '***']
                },
                alias: 'exposureData'
            }
        ];
        mainQuery.sort = sort;
        mainQuery.group = checkArrayAndLength(lodashGet(innerFilter, 'sort', null)) ? [`${innerQueryAlias}._id`] : [`${innerQueryAlias}.lastName`, `${innerQueryAlias}.firstName`, `${innerQueryAlias}._id`];

        if (lodashGet(innerFilter, 'selectedIndexDay', null)) {
            mainQuery.group.push(mainQuery.group = `${innerQueryAlias}._id`);
        }
        mainQuery = {
            type:'select',
            fields:[
                {
                    table: 'mainQuery',
                    name: '_id',
                    alias: '_id'
                },
                {
                    table: 'mainQuery',
                    name: 'mainData',
                    alias: 'mainData'
                },
                {
                    table: 'mainQuery',
                    name: 'exposureData',
                    alias: 'exposureData'
                },
                // {
                //     expression: {
                //         pattern:'{a}.*',
                //         values: {
                //             a: {field: 'mainQuery'}
                //         }
                //     }},
                {
                    query:{
                        type: 'select',
                        table: 'relationship',
                        fields:[{
                            func: {
                                name: 'count',
                                args: [{
                                    field: 'relationship._id'
                                }],
                            }
                        }],
                        condition: [
                            {[`mainQuery._id`]: {$eq:{field:'relationship.targetId'}}},
                            {'relationship.deleted': 0},
                        ]
                    },
                    alias: 'countExposures'
                },
                {
                    query:{
                        type: 'select',
                        table: 'relationship',
                        fields:[{
                            func: {
                                name: 'count',
                                args: [{
                                    field: 'relationship._id'
                                }],
                            }
                        }],
                        condition: [
                            {[`mainQuery._id`]: {$eq:{field:'relationship.sourceId'}}},
                            {'relationship.deleted': 0},
                        ]
                    },
                    alias: 'countContacts'
                },
            ],
            query: mainQuery,
            join:[],
            condition:{
                $and:[]
            },
            alias: 'mainQuery'
        }
    }



    return mainQuery;
}