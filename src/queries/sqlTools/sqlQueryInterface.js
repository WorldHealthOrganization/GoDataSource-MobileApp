import translations from './../../utils/translations';
import {executeQuery} from './helperMethods';
import lodashGet from 'lodash/get';
import lodashSet from 'lodash/set';
import {checkArrayAndLength} from "../../utils/typeCheckingFunctions";
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
        '$or': [
            {
                [`${innerQueryAlias}.deleted`]: 0,
            },
            {
                [`${innerQueryAlias}.deleted`]: {'$is': null}
            }
        ],
        [`${innerQueryAlias}.type`]: type,
        [`${innerQueryAlias}.outbreakId`]: outbreakId,
    };

    if (checkArrayAndLength(lodashGet(innerFilter, 'age', null)) && innerFilter.age.length === 2) {
        innerCondition[`${innerQueryAlias}.age`] = {
            ['$gte']: lodashGet(innerFilter, 'age[0]', 0),
            ['$lte']: lodashGet(innerFilter, 'age[1]', 150)
        };
    }
    if (lodashGet(innerFilter, 'gender', null) !== null) {
        innerCondition[`${innerQueryAlias}.gender`] = innerFilter.gender;
    }
    if (checkArrayAndLength(lodashGet(innerFilter, 'categories', null))) {
        innerCondition[`${innerQueryAlias}.categoryId`] = {
            ['$in']: innerFilter.categories
        };
    }
    if (checkArrayAndLength(lodashGet(innerFilter, 'classification', null))) {
        innerCondition[`${innerQueryAlias}.classification`] = {
            ['$in']: innerFilter.classification
        };
    }
    if (checkArrayAndLength(lodashGet(innerFilter, 'selectedLocations', null))) {
        innerCondition[`${innerQueryAlias}.locationId`] = {
            ['$in']: innerFilter.selectedLocations
        };
    }

    // Take care of the outer query conditions like searching
    let mainCondition = {
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

    // TODO handle email
    let shouldSearchEmail = false;
    if (search && search.text) {
        shouldSearchEmail = true;
        mainCondition['$or'] = [
            {[`${innerQueryAlias}.firstName`]: {'$like': `%${search.text}%`}},
            {[`${innerQueryAlias}.lastName`]: {'$like': `%${search.text}%`}},
            {[`${innerQueryAlias}.visualId`]: {'$like': `%${search.text}%`}},
            {[`${innerQueryAlias}.locationId`]: {'$in': search.locations}},
            {$expression: `json_extract(json_each.value, '$.emailAddress') like '%${search.text}%'`}
        ];

        if (type !== translations.personTypes.cases) {
            mainCondition['$or'] = mainCondition['$or'].concat([
                {[`${filteredExposuresAlias}.firstName`]: {'$like': `%${search.text}%`}},
                {[`${filteredExposuresAlias}.lastName`]: {'$like': `%${search.text}%`}},
                {[`${filteredExposuresAlias}.visualId`]: {'$like': `%${search.text}%`}},
            ])
        }
    }

    // Take care of sorting
    let sort = {};
    if (checkArrayAndLength(lodashGet(innerFilter, 'sort', null))) {
        for (let i = 0; i < innerFilter.sort.length; i++) {
            let sortOrder = lodashGet(innerFilter, `sort[${i}].sortOrder`, null) === translations.sortTab.sortOrderAsc ? 1 : -1;
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
        if (lastElement) {
            mainCondition = Object.assign({}, mainCondition, {
                $expression: {
                    pattern: `(${innerQueryAlias}.lastName, ${innerQueryAlias}.firstName, ${innerQueryAlias}._id)>({lastName}, {firstName}, {id})`,
                    values: {
                        lastName: lodashGet(lastElement, 'lastName', ''),
                        firstName: lodashGet(lastElement, 'firstName', ''),
                        id: lodashGet(lastElement, '_id', '')
                    }
                }
            })
        }
    }

    // Create queries
    // Inner query
    let innerQuery = {
        type: 'select',
        table: 'person',
        alias: innerQueryAlias,
        condition: innerCondition
    };

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
        query: innerQuery,
        alias: innerQueryAlias,
        join: [
            relationshipJoin,
            {
                type: 'left',
                table: 'person',
                alias: filteredExposuresAlias,
                on: {[`${relationshipAlias}.${source}`]: `${filteredExposuresAlias}._id`}
            },
            {
                type: 'left',
                table: 'person',
                alias: unfilteredExposuresAlias,
                on: {
                    [`${relationshipAlias}.${source}`]: `${unfilteredExposuresAlias}._id`
                }
            },
        ],
        condition: mainCondition
    };

    // TODO handle email
    if (shouldSearchEmail) {
        delete mainQuery.query;
        delete mainQuery.alias;
        mainQuery.expression = {
            pattern: `(${jsonSql.build(innerQuery).query.slice(0, -1)}) as ${innerQueryAlias}, json_each(${innerQueryAlias}.json, '$.addresses')`
        }
    }

    if (type === translations.personTypes.contactsOfContacts) {
        lodashSet(mainQuery, `join[1].on['${relationshipAlias}.${sourceType}']`, translations.personTypes.contacts);
        lodashSet(mainQuery, `join[2].on['${relationshipAlias}.${sourceType}']`, translations.personTypes.contacts);
        // mainCondition[`${filteredExposuresAlias}.type`] = translations.personTypes.contacts;
        // mainCondition[`${unfilteredExposuresAlias}.type`] = translations.personTypes.contacts;
    }
    if (type === translations.personTypes.cases) {
        lodashSet(mainQuery, `join[1].on['${relationshipAlias}.${sourceType}']`, translations.personTypes.contacts);
        lodashSet(mainQuery, `join[2].on['${relationshipAlias}.${sourceType}']`, translations.personTypes.contacts);
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
        if (checkArrayAndLength(lodashGet(innerFilter, 'sort', null)) && lastElement && offset) {
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
        mainQuery.group = checkArrayAndLength(lodashGet(innerFilter, 'sort', null)) ? `${innerQueryAlias}._id` : [`${innerQueryAlias}.lastName`, `${innerQueryAlias}.firstName`, `${innerQueryAlias}._id`];
    }

    return mainQuery;
}