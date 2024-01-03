/**
 * Created by florinpopa on 19/07/2018.
 */
import get from 'lodash/get';
import {createDate} from './../utils/functions';
import {executeQuery, insertOrUpdate} from './../queries/sqlTools/helperMethods';
import {checkArrayAndLength} from "../utils/typeCheckingFunctions";
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
        .catch((errorGetFollowUps) => {
            Promise.reject(errorGetFollowUps)
        })
}

function createQueryContactsWithRelations(outbreakId, dataTypes, mainFilter) {

    let contactAlias = 'Contact';
    let relationAlias = 'Relation';

    let condition = createConditionContactsWithRelations(outbreakId, dataTypes, mainFilter);

    return {
        type: 'select',
        table: 'person',
        alias: contactAlias,
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

function createConditionContactsWithRelations(outbreakId, dataTypes, filter) {
    let contactAlias = 'Contact';

    let condition = {
        [`${contactAlias}.deleted`]: 0,
        [`${contactAlias}.type`]: { ['$in']: dataTypes },
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

    let innerQuery = createQueryContactsWithRelations(outbreakId, [translations.personTypes.contacts, translations.personTypes.cases], contactsFilter);
    let {condition, sort} = createConditionFollowUps(outbreakId, followUpsFilter, userTeams, [translations.personTypes.contacts, translations.personTypes.cases], contactsFilter, searchText, lastElement, offset, isCount);

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
        sort: sort
    };

    if (isCount) {
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
        query.limit = 10;
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
        ];
        query.group = `${aliasForFollowUps}._id`;
    }

    if (offset) {
        query.offset = offset;
    }

    return query;
}

function createConditionFollowUps (outbreakId, followUpFilter, userTeams, dataTypes, contactsFilter, search, lastElement, offset, skipExposure) {
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
    if (followUpFilter.date) {
        condition[`${aliasFollowUps}.date`] = {
            '$gte': `${createDate(followUpFilter.date).toISOString()}`,
            '$lte': `${createDate(followUpFilter.date, true).toISOString()}`
        };
    }
    if (followUpFilter.statusId) {
        condition[`${aliasFollowUps}.statusId`] = followUpFilter.statusId
    }
    if (contactsFilter?.selectedIndexDay && contactsFilter.selectedIndexDay.length){
        condition['indexDay'] = {
            ['$gte']: get(contactsFilter, 'selectedIndexDay[0]', 0),
            ['$lte']: get(contactsFilter, 'selectedIndexDay[1]', 150)
        };
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
        if (dataTypes === translations.personTypes.cases) {
            condition['$or'] = [
                {[`${aliasForContacts}.firstName`]: {'$like': `%${search.text}%`}},
                {[`${aliasForContacts}.lastName`]: {'$like': `%${search.text}%`}},
                {[`${aliasForContacts}.visualId`]: {'$like': `%${search.text}%`}},
                {[`${aliasForContacts}.locationId`]: {'$in': search.locations}},
            ]
        } else {
            condition['$or'] = [
                {[`${aliasForContacts}.firstName`]: {'$like': `%${search.text}%`}},
                {[`${aliasForContacts}.lastName`]: {'$like': `%${search.text}%`}},
                {[`${aliasForContacts}.visualId`]: {'$like': `%${search.text}%`}},
                {[`${aliasForContacts}.locationId`]: {'$in': search.locations}},
                {[`${aliasForFilteredExposures}.firstName`]: {'$like': `%${search.text}%`}},
                {[`${aliasForFilteredExposures}.lastName`]: {'$like': `%${search.text}%`}},
                {[`${aliasForFilteredExposures}.visualId`]: {'$like': `%${search.text}%`}}
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
    } else {
        sort[`${aliasForContacts}.lastName`] = 1;
        sort[`${aliasForContacts}.firstName`] = 1;
        sort[`${aliasForContacts}._id`] = 1;
        sort[`${aliasFollowUps}._id`] = 1;
        // if (lastElement) {
        //     condition = Object.assign({}, condition, {
        //         $expression: {
        //             pattern: `(${aliasForContacts}.lastName, ${aliasForContacts}.firstName, ${aliasForContacts}._id, ${aliasFollowUps}._id)>({lastName}, {firstName}, {id}, {followUpId})`,
        //             values: {
        //                 lastName: get(lastElement, 'lastName', ''),
        //                 firstName: get(lastElement, 'firstName', ''),
        //                 id: get(lastElement, '_id', ''),
        //                 followUpId: get(lastElement, 'followUpId', '')
        //             }
        //         }
        //     })
        // }
    }

    return {condition, sort};
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
            '$or': [
                {'teamId': {'$in': userTeams.map((e) => e.teamId)}},
                {'teamId': {'$is': null}},
            ],
            'outbreakId': outbreakId,
            'deleted': 0
        }
    };

    return executeQuery(query);
}