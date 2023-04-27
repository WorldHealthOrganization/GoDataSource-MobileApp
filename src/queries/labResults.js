import {getDatabase} from "./database";
import config from "../utils/config";
import {executeQuery, openDatabase, wrapExecuteSQLInPromise, wrapTransationInPromise} from "./sqlTools/helperMethods";
import {checkArrayAndLength} from "../utils/typeCheckingFunctions";
import translations from "../utils/translations";
import get from "lodash/get";
import {createDate} from "../utils/functions";


export function getAllLabResultsForOutbreakQuery(outbreakId, labResultFilter, searchText, lastElement, offset, computeCount) {
    let countPromise = null;
    let labResultPromise = null;

    console.log("Condition get all results", outbreakId, labResultFilter);
    let queryLabResults = createQueryLabResults(outbreakId, labResultFilter, searchText, lastElement, offset);


    if (computeCount) {
        let labResultCount = createQueryLabResults(outbreakId, labResultFilter, searchText, lastElement, offset, true);

        countPromise = executeQuery(labResultCount);
    }
    labResultPromise = executeQuery(queryLabResults);

    return Promise.all([labResultPromise, countPromise])
        .then(([labResults, labResultsCount]) => {
            console.log('Returned values labResults: ', labResults.length);
            return Promise.resolve({data: labResults, dataCount: checkArrayAndLength(labResultsCount) ? labResultsCount[0]?.countRecords : undefined});
        })
        .catch((errorGetlabResults) => Promise.reject(errorGetlabResults))
}

function createQueryLabResults(outbreakId, labResultsFilter, searchText, lastElement, offset, isCount) {
    let aliasForLabResults = 'LabResults';
    let aliasForContacts = 'Contacts';
    let aliasForFilteredExposures = 'FilteredExposures';
    let aliasForAllExposures = 'AllExposures';

    console.log("Condition query", labResultsFilter);
    let innerQuery = createQueryContactsWithRelations(outbreakId, translations.personTypes.contacts, labResultsFilter, searchText);
    let {condition, sort} = createConditionLabResults(outbreakId, labResultsFilter, translations.personTypes.contacts, searchText, lastElement, offset, isCount);

    let query = {
        type: 'select',
        table: 'labResult',
        alias: aliasForLabResults,
        join: [
            {
                type: 'inner',
                query: innerQuery,
                alias: aliasForContacts,
                on: {[`${aliasForLabResults}.personId`]: `${aliasForContacts}._id`}
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
                            pattern: `distinct ${aliasForLabResults}._id`
                        }}]
                },
                alias: 'countRecords'
            }
        ];
    } else {
        query.limit = 10;
        query.fields = [
            {
                table: aliasForLabResults,
                name: 'json',
                alias: 'labResultData'
            },
            {
                table: aliasForContacts,
                name: 'json',
                alias: 'mainData'
            },
            // {
            //     func: {
            //         name: 'group_concat',
            //         args: [{field: `${aliasForAllExposures}.json`}, '***']
            //     },
            //     alias: 'exposureData'
            // }
        ];
        query.group = `${aliasForLabResults}._id`;
    }

    if (offset) {
        query.offset = offset;
    }

    return query;
}

function createQueryContactsWithRelations(outbreakId, dataType, mainFilter, searchText) {

    let contactAlias = 'Contact';
    let relationAlias = 'Relation';

    let condition = createConditionContactsWithRelations(outbreakId, dataType, mainFilter, searchText);

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

function createConditionContactsWithRelations(outbreakId, dataType, filter, searchText) {
    let contactAlias = 'Contact';

    console.log("What's the dataType", dataType, filter);

    let condition = {
        [`${contactAlias}.deleted`]: 0,
        // [`${contactAlias}.type`]: dataType,
        [`${contactAlias}.outbreakId`]: outbreakId
    };

    if(searchText){
        condition['$or'] = [
            {[`${contactAlias}.firstName`]: {'$like': `%${searchText.text}%`}},
            {[`${contactAlias}.lastName`]: {'$like': `%${searchText.text}%`}},
        ]
    }

    if(filter?.type && filter.type.length){
        condition[`${contactAlias}.type`] = {
            '$in': [...filter.type]
        };
    }

    // if (checkArrayAndLength(get(filter, 'age', null)) && filter.age.length === 2) {
    //     condition[`${contactAlias}.age`] = {
    //         ['$gte']: get(filter, 'age[0]', 0),
    //         ['$lte']: get(filter, 'age[1]', 150)
    //     };
    // }
    // if (get(filter, 'gender', null) !== null) {
    //     condition[`${contactAlias}.gender`] = filter.gender;
    // }
    // if (checkArrayAndLength(get(filter, 'categories', null))) {
    //     condition[`${contactAlias}.categoryId`] = {
    //         ['$in']: filter.categories
    //     };
    // }
    // if (checkArrayAndLength(get(filter, 'classification', null))) {
    //     condition[`${contactAlias}.classification`] = {
    //         ['$in']: filter.classification
    //     };
    // }
    // if (checkArrayAndLength(get(filter, 'selectedLocations', null))) {
    //     condition[`${contactAlias}.locationId`] = {
    //         ['$in']: filter.selectedLocations
    //     };
    // }

    return condition
}

function createConditionLabResults (outbreakId, labResultFilter, dataType, search, lastElement, offset, skipExposure) {
    let aliasLabResults = 'LabResults';
    let aliasForContacts = 'Contacts';
    let aliasForCases = 'Cases';
    let aliasForFilteredExposures = 'FilteredExposures';

    let condition = {
        [`${aliasLabResults}.deleted`]: 0,

    };
    let sort = {};

    // Here take care of follow-ups conditions
    if (outbreakId) {
        condition[`${aliasLabResults}.outbreakId`] = outbreakId;
    }
    // if (labResultFilter.date) {
    //     condition[`${aliasLabResults}.date`] = {
    //         '$gte': `${createDate(labResultFilter.date).toISOString()}`,
    //         '$lte': `${createDate(labResultFilter.date, true).toISOString()}`
    //     };
    // }
    // if (labResultFilter.statusId) {
    //     condition[`${aliasLabResults}.statusId`] = labResultFilter.statusId
    // }
    if(labResultFilter?.type && labResultFilter.type.length){
        condition[`${aliasForContacts}.type`] = {
            '$in': [...labResultFilter.type]
        };
    }
    if(labResultFilter?.personId){
        condition[`${aliasForContacts}._id`] = {
            '$like': labResultFilter.personId
        }
    }

    // Here take care of searches
    if (search) {
            condition['$or'] = [
                {[`${aliasForContacts}.firstName`]: {'$like': `%${search.text}%`}},
                {[`${aliasForContacts}.lastName`]: {'$like': `%${search.text}%`}},
            ]
    }

    // Here take care of sorting
    if (checkArrayAndLength(get(labResultFilter, 'sort', null))) {
        for (let i = 0; i < labResultFilter.sort.length; i++) {
            let sortOrder = get(labResultFilter, `sort[${i}].sortOrder`, null) === translations.sortTab.sortOrderAsc ? 1 : -1;
            // Sort by firstName
            if (get(labResultFilter, `sort[${i}].sortCriteria`, null) === translations.sortTab.sortFirstName) {
                sort[`${aliasForContacts}.firstName`] = sortOrder;
            }
            // Sort by lastName
            if (get(labResultFilter, `sort[${i}].sortCriteria`, null) === translations.sortTab.sortLastName) {
                sort[`${aliasForContacts}.lastName`] = sortOrder;
            }
            // Sort by visualId
            if (get(labResultFilter, `sort[${i}].sortCriteria`, null) === translations.sortTab.sortVisualId) {
                sort[`${aliasForContacts}.visualId`] = sortOrder;
            }
            // Sort by createdAt
            if (get(labResultFilter, `sort[${i}].sortCriteria`, null) === translations.sortTab.sortCreatedAt) {
                sort[`${aliasForContacts}.createdAt`] = sortOrder;
            }
            // Sort by updatedAt
            if (get(labResultFilter, `sort[${i}].sortCriteria`, null) === translations.sortTab.sortUpdatedAt) {
                sort[`${aliasForContacts}.updatedAt`] = sortOrder;
            }
        }
    } else {
        sort[`${aliasForContacts}.lastName`] = 1;
        sort[`${aliasForContacts}.firstName`] = 1;
        sort[`${aliasForContacts}._id`] = 1;
        sort[`${aliasLabResults}._id`] = 1;
        // if (lastElement) {
        //     condition = Object.assign({}, condition, {
        //         $expression: {
        //             pattern: `(${aliasForContacts}.lastName, ${aliasForContacts}.firstName, ${aliasForContacts}._id, ${aliasLabResults}._id)>({lastName}, {firstName}, {id}, {labResultId})`,
        //             values: {
        //                 lastName: get(lastElement, 'lastName', ''),
        //                 firstName: get(lastElement, 'firstName', ''),
        //                 id: get(lastElement, '_id', ''),
        //                 labResultId: get(lastElement, 'labResultId', '')
        //             }
        //         }
        //     })
        // }
    }

    return {condition, sort};
}