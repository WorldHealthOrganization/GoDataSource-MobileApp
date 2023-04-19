// Here will be stored different values in relation to the sql structure
import translations from './../../utils/translations';
import get from 'lodash/get';
import {checkArrayAndLength} from './../../utils/typeCheckingFunctions';

const databaseTables = ['person', 'followUp', 'relationship', 'languageToken', 'labResult'];
const tableStructure = {
    person: [
        {
            fieldName: '_id',
            fieldType: 'TEXT PRIMARY KEY'
        },
        {
            fieldName: 'outbreakId',
            fieldType: 'TEXT NOT NULL'
        },
        {
            fieldName: 'firstName',
            fieldType: 'TEXT'
        },
        {
            fieldName: 'lastName',
            fieldType: 'TEXT'
        },
        {
            fieldName: 'age',
            fieldType: 'INT'
        },
        {
            fieldName: 'gender',
            fieldType: 'TEXT'
        },
        {
            fieldName: 'type',
            fieldType: 'TEXT'
        },
        {
            fieldName: 'locationId',
            fieldType: 'TEXT'
        },
        {
            fieldName: 'classification',
            fieldType: 'TEXT'
        },
        {
            fieldName: 'visualId',
            fieldType: 'TEXT'
        },
        // {
        //     fieldName: 'address',
        //     fieldType: 'JSON'
        // }
    ],
    followUp: [
        {
            fieldName: '_id',
            fieldType: 'TEXT PRIMARY KEY'
        },
        {
            fieldName: 'statusId',
            fieldType: 'TEXT'
        },
        {
            fieldName: 'date',
            fieldType: 'TEXT NOT NULL'
        },
        {
            fieldName: 'indexDay',
            fieldType: 'INT'
        },
        {
            fieldName: 'outbreakId',
            fieldType: 'TEXT NOT NULL'
        },
        {
            fieldName: 'teamId',
            fieldType: 'TEXT'
        },
        {
            fieldName: 'personId',
            fieldType: 'TEXT NOT NULL',
            isForeignKey: true,
            referencesTable: 'person',
            referencesField: 'id'
        },
    ],
    relationship: [
        {
            fieldName: '_id',
            fieldType: 'TEXT PRIMARY KEY'
        },
        {
            fieldName: 'sourceId',
            fieldType: 'TEXT NOT NULL',
            isForeignKey: true,
            referencesTable: 'person',
            referencesField: 'id'
        },
        {
            fieldName: 'sourceType',
            fieldType: 'TEXT NOT NULL'
        },
        {
            fieldName: 'targetId',
            fieldType: 'TEXT NOT NULL',
            isForeignKey: true,
            referencesTable: 'person',
            referencesField: 'id'
        },
        {
            fieldName: 'targetType',
            fieldType: 'TEXT NOT NULL'
        },
    ],
    languageToken: [
        {
            fieldName: '_id',
            fieldType: 'TEXT PRIMARY KEY'
        },
        {
            fieldName: "languageId",
            fieldType: "TEXT NOT NULL"
        },
    ],
    location: [
        {
            fieldName: '_id',
            fieldType: 'TEXT PRIMARY KEY'
        }
    ],
    commonFields: [
        {
            fieldName: 'createdAt',
            fieldType: 'DATE NOT NULL'
        },
        // {
        //     fieldName: 'createdBy',
        //     fieldType: 'TEXT NOT NULL'
        // },
        {
            fieldName: 'updatedAt',
            fieldType: 'DATE NOT NULL'
        },
        // {
        //     fieldName: 'updatedBy',
        //     fieldType: 'TEXT NOT NULL'
        // },
        {
            fieldName: 'deleted',
            fieldType: 'BOOLEAN NOT NULL'
        },
        // {
        //     fieldName: 'deletedAt',
        //     fieldType: 'DATE'
        // },
        // {
        //     fieldName: 'deletedBy',
        //     fieldType: 'TEXT'
        // },
        {
            fieldName: 'json',
            fieldType: 'TEXT NOT NULL'
        },
    ],
    labResult: [
        {
            fieldName: '_id',
            fieldType: 'TEXT PRIMARY KEY'
        },
        {
            fieldName: "createdOn",
            fieldType: 'TEXT'
        },
        {
            fieldName: "dateSampleTaken",
            fieldType: 'TEXT'
        },
        {
          fieldName: "dateSampleDelivered",
          fieldType: 'TEXT'
        },
        {
            fieldName: "labName",
            fieldType: 'TEXT'
        },
        {
            fieldName: "outbreakId",
            fieldType: 'TEXT'
        },
        {
            fieldName: "personType",
            fieldType: 'TEXT'
        },
        {
            fieldName: "result",
            fieldType: 'TEXT'
        },
        {
            fieldName: 'sampleIdentifier',
            fieldType: 'TEXT'
        },
        {
            fieldName: "sampleType",
            fieldType: 'TEXT'
        },
        {
            fieldName: "status",
            fieldType: 'TEXT'
        },
        {
            fieldName: "testType",
            fieldType: 'TEXT'
        },
        // {
        //     fieldName: "questionnaireAnswers",
        //     fieldType: 'TEXT'
        // },
        // {
        //     fieldName: 'sequence',
        //     fieldType: 'TEXT'
        // },
        {
            fieldName: 'quantitativeResult',
            fieldType: 'TEXT'
        },
        {
            fieldName: 'dateTesting',
            fieldType: 'TEXT'
        },
        {
            fieldName: 'dateOfResult',
            fieldType: 'TEXT'
        },
        {
          fieldName: 'notes',
          fieldType: 'TEXT'
        },
        {
            fieldName: 'personId',
            fieldType: 'TEXT NOT NULL',
            isForeignKey: true,
            referencesTable: 'person',
            referencesField: 'id'
        },
    ]
};
const relationshipsMappedFields = ['sourceId', 'sourceType', 'targetId', 'targetType'];


const essentialFields = `createdAt DATE NOT NULL, createdBy TEXT, updatedAt DATE NOT NULL, updatedBy TEXT, deleted BOOLEAN NOT NULL, deletedAt DATE, deletedBy TEXT, json TEXT NOT NULL`;
const createTableString = 'CREATE TABLE IF NOT EXISTS';
const idFieldString = `id TEXT PRIMARY KEY`;

const createQueries = {
    createTablePerson: `${createTableString} person (${idFieldString}, firstName TEXT NOT NULL, lastName TEXT, age INT, gender TEXT, type TEXT, ${essentialFields})`,
    createTableFollowUp: `${createTableString} followUp (${idFieldString}, date DATE NOT NULL, status TEXT NOT NULL, index INT NOT NULL, personId TEXT NOT NULL ${essentialFields}, FOREIGN KEY (personId) REFERENCES person(id))`,
    createTableRelationship: `${createTableString} relationship (${idFieldString}, sourceId TEXT NOT NULL, sourceType TEXT NOT NULL, targetId TEXT NOT NULL, targetType TEXT NOT NULL ${essentialFields}, FOREIGN KEY (sourceId) REFERENCES person(id), FOREIGN KEY (targetId) REFERENCES person(id))`,
    createTableLabResult: `${createTableString} labResult (${idFieldString}, dateSampleTaken DATE NOT NULL, status TEXT NOT NULL, personId TEXT NOT NULL ${essentialFields}, FOREIGN KEY (personId) REFERENCES person(id))`
};

const insertOrUpdateQueries = {
    insertTablePerson: `INSERT INTO person VALUES (:id, :firstName, :lastName, :age, :gender, :type, :createdAt, :createdBy, :updatedAt, :updatedBy, :deleted, :deletedAt, :deletedBy, :json) ON CONFLICT (id) DO UPDATE SET firstName=excluded.firstName, lastName=excluded.lastName, age=excluded.age, gender=excluded.gender, type=excluded.type, createdAt=excluded.createdAt, createdBy=excluded.createdBy, updatedAt=excluded.updatedAt, updatedBy=excluded.updatedBy, deleted=excluded.deleted, deletedAt=excluded.deletedAt, deletedBy=excluded.deletedBy, json=excluded.json`,
    insertTableFollowUp: `INSERT INTO followUp VALUES (:id, :status, :date, :personId, :index, :createdAt, :createdBy, :updatedAt, :updatedBy, :deleted, :deletedAt, :deletedBy, :json) ON CONFLICT (id) DO UPDATE SET status=excluded.status, date=excluded.date, personId=excluded.personId, index=excluded.index, createdAt=excluded.createdAt, createdBy=excluded.createdBy, updatedAt=excluded.updatedAt, updatedBy=excluded.updatedAt, deleted=excluded.deleted, deletedAt=excluded.deletedAt, deletedBy=excluded.deletedBy, json=excluded.json`,
    insertTableRelationship: `INSERT INTO relationship values (:id, :sourceId, :sourceType, :targetId, :targetType, :createdAt, :createdBy, :updatedAt, :updatedBy, :deleted, :deletedAt, :deletedBy, :json) ON CONFLICT (id) DO UPDATE SET sourceId=excluded.sourceId, sourceType=excluded.sourceType, targetId=excluded.targetId, targetTyp=excluded.targetType, createdAt=excluded.createdAt, createdBy=excluded.createdBy, updatedAt=excluded.updatedAt, updatedBy=excluded.updatedBy, deleted=excluded.deleted, deletedAt=excluded.deletedAt, deletedBy=excluded.deletedBy, json=excluded.json`,
    insertTableLabResult: `INSERT INTO labResult VALUES (:id, :status, :dateSampleTaken, :personId, :createdAt, :createdBy, :updatedAt, :updatedBy, :deleted, :deletedAt, :deletedBy, :json) ON CONFLICT (id) DO UPDATE SET status=excluded.status, dateSampleTaken=excluded.dateSampleTaken, personId=excluded.personId, createdAt=excluded.createdAt, createdBy=excluded.createdBy, updatedAt=excluded.updatedAt, updatedBy=excluded.updatedAt, deleted=excluded.deleted, deletedAt=excluded.deletedAt, deletedBy=excluded.deletedBy, json=excluded.json`,

};

const tableNamesAndAliases = {
    selectQueryString: 'select',
    followUpTable: databaseTables[1],
    personTable: databaseTables[0],
    relationshipTable: databaseTables[2],
    labResultTable: databaseTables[4],
    followUpAlias: 'FollowUps',
    followUpJsonAlias: 'followUpsJson',
    labResultAlias: 'LabResults',
    labResultJsonAlias: 'labResultsJson',
    contactsAlias: 'Contacts',
    contactsJsonAlias: 'contactsJson',
    relationshipsAlias: 'Relations',
    relationshipsJsonAlias: 'relationsJson',
    exposuresAlias: 'Exposures',
    exposuresJsonAlias: 'exposuresJson',
    casesAlias: 'Cases',
    casesJsonAlias: 'casesJson',
    jsonField: tableStructure.commonFields[tableStructure.commonFields.length - 1].fieldName,
    innerJoinField: 'inner',
    leftJoinField: 'left',
    all: '*'
};

const innerQueriesStrings = {
    filteredRelationsTable: 'filteredRelations',
    filteredRelationsExposureId: 'filteredRelationsExposureId',
    filteredRelationsId: 'filteredRelationsId',
    filteredExposuresTable: 'filteredExposures',
    unfilteredRelationsTable: 'unfilteredRelations',
    unfilteredRelationsExposureId: 'unfilteredRelationsExposureId',
    unfilteredRelationsId: 'unfilteredRelationsId',
    unfilteredExposuresTable: 'unfilteredExposures',
    unfilteredExposuresAllExposures: 'AllExposures'
};

const selectQueries = {
    contactsBaseQuery: {
        type: tableNamesAndAliases.selectQueryString,
        alias: tableNamesAndAliases.contactsAlias,
        fields: [
            {
                table: tableNamesAndAliases.contactsAlias,
                name: tableNamesAndAliases.jsonField,
                alias: tableNamesAndAliases.contactsJsonAlias
            }
        ],
        query: {
            type: tableNamesAndAliases.selectQueryString,
            alias: 'mappedData',
            table: null
        }
        // condition: {'FollowUps.date': {$gt: moment.utc().subtract(30, 'd')._d.toISOString()}},
        // sort: {'Contacts._id': 1},
        // limit: 30
    },
    getContactsWithExposures: {
        type: 'select',
        table: 'person',
        alias: 'filteredContacts',
        fields: [
            {
                table: 'filteredContacts',
                name: 'json',
                alias: 'ContactData'
            },
            {
                func: {
                    name: 'group_concat',
                    args: [{field: 'unfilteredData.AllExposures'}, '***']
                },
                alias: 'AllOfExposures'
            }
        ],
        join: [
            {
                type: 'left',
                query: createInnerQuery(false, translations.personTypes.contacts),
                alias: 'filteredData',
                on: {'filteredContacts._id': 'filteredData.filteredRelationsTargetId'}
            },
            {
                type: 'left',
                query: createInnerQuery(true, translations.personTypes.contacts),
                alias: 'unfilteredData',
                on: {'filteredContacts._id': 'unfilteredData.unfilteredRelationsTargetId'}
            }
        ],
        group: 'filteredData.filteredRelationsId'
    }
};

const mainQueryStrings = {
    outerFilter: 'outerFilter',
    mainData: 'MainData',
    idField: 'IdField',
    allOfExposures: 'AllOfExposures'
};

function createMainQuery(dataType, outbreakId, filter, search, lastElement, offset, skipAllExposures, skipLimit) {
    dataType = dataType ? dataType : translations.personTypes.contacts;
    let sort = {};
    let notQuery = [];
    let outerFilterCondition = {
        [`${mainQueryStrings.outerFilter}.deleted`]: 0,
        [`${mainQueryStrings.outerFilter}.type`]: dataType,
        [`${mainQueryStrings.outerFilter}.outbreakId`]: outbreakId,
    };
    if (search) {
        if (dataType === translations.personTypes.cases) {
            outerFilterCondition['$or'] = [
                {[`${mainQueryStrings.outerFilter}.firstName`]: {'$like': `%${search.text}%`}},
                {[`${mainQueryStrings.outerFilter}.lastName`]: {'$like': `%${search.text}%`}},
                {[`${mainQueryStrings.outerFilter}.visualId`]: {'$like': `%${search.text}%`}},
                {[`${mainQueryStrings.outerFilter}.locationId`]: {'$in': search.locations}},
                // {[`${innerQueriesStrings.filteredExposuresTable}.firstName`]: {'$like': `%${search}%`}},
                // {[`${innerQueriesStrings.filteredExposuresTable}.lastName`]: {'$like': `%${search}%`}},
            ]
        } else {
            outerFilterCondition['$or'] = [
                {[`${mainQueryStrings.outerFilter}.firstName`]: {'$like': `%${search.text}%`}},
                {[`${mainQueryStrings.outerFilter}.lastName`]: {'$like': `%${search.text}%`}},
                {[`${mainQueryStrings.outerFilter}.visualId`]: {'$like': `%${search.text}%`}},
                {[`${mainQueryStrings.outerFilter}.locationId`]: {'$in': search.locations}},
                {[`${innerQueriesStrings.filteredExposuresTable}.firstName`]: {'$like': `%${search.text}%`}},
                {[`${innerQueriesStrings.filteredExposuresTable}.lastName`]: {'$like': `%${search.text}%`}},
                {[`${innerQueriesStrings.filteredExposuresTable}.visualId`]: {'$like': `%${search.text}%`}}
            ]
        }
    }
    if (checkArrayAndLength(get(filter, 'age', null)) && filter.age.length === 2) {
        outerFilterCondition[`${mainQueryStrings.outerFilter}.age`] = {
            ['$gte']: get(filter, 'age[0]', 0),
            ['$lte']: get(filter, 'age[1]', 150)
        };
    }
    if (get(filter, 'gender', null) !== null) {
        outerFilterCondition[`${mainQueryStrings.outerFilter}.gender`] = filter.gender;
    }
    if (checkArrayAndLength(get(filter, 'categories', null))) {
        outerFilterCondition[`${mainQueryStrings.outerFilter}.categoryId`] = {
            ['$in']: filter.categories
        };
    }
    if (checkArrayAndLength(get(filter, 'classification', null))) {
        outerFilterCondition[`${mainQueryStrings.outerFilter}.classification`] = {
            ['$in']: filter.classification
        };
    }
    if (checkArrayAndLength(get(filter, 'selectedLocations', null))) {
        outerFilterCondition[`${mainQueryStrings.outerFilter}.locationId`] = {
            ['$in']: filter.selectedLocations
        };
    }
    if (!skipLimit) {
        if (checkArrayAndLength(get(filter, 'sort', null))) {
            for (let i = 0; i < filter.sort.length; i++) {
                let sortOrder = get(filter, `sort[${i}].sortOrder`, null) === translations.sortTab.sortOrderAsc ? 1 : -1;
                // Sort by firstName
                if (get(filter, `sort[${i}].sortCriteria`, null) === translations.sortTab.sortFirstName) {
                    sort[`${mainQueryStrings.outerFilter}.firstName`] = sortOrder;
                }
                // Sort by lastName
                if (get(filter, `sort[${i}].sortCriteria`, null) === translations.sortTab.sortLastName) {
                    sort[`${mainQueryStrings.outerFilter}.lastName`] = sortOrder;
                }
                // Sort by visualId
                if (get(filter, `sort[${i}].sortCriteria`, null) === translations.sortTab.sortVisualId) {
                    sort[`${mainQueryStrings.outerFilter}.visualId`] = sortOrder;
                }
                // Sort by createdAt
                if (get(filter, `sort[${i}].sortCriteria`, null) === translations.sortTab.sortCreatedAt) {
                    sort[`${mainQueryStrings.outerFilter}.createdAt`] = sortOrder;
                }
                // Sort by updatedAt
                if (get(filter, `sort[${i}].sortCriteria`, null) === translations.sortTab.sortUpdatedAt) {
                    sort[`${mainQueryStrings.outerFilter}.updatedAt`] = sortOrder;
                }
            }
            outerFilterCondition['$not'] = notQuery;
        } else {
            sort[`${mainQueryStrings.outerFilter}.lastName`] = 1;
            sort[`${mainQueryStrings.outerFilter}.firstName`] = 1;
            // if (lastElement) {
            //     outerFilterCondition = Object.assign({}, outerFilterCondition, {
            //         $expression: {
            //             pattern: `(${mainQueryStrings.outerFilter}.lastName, ${mainQueryStrings.outerFilter}.firstName, ${mainQueryStrings.outerFilter}._id)>({lastName}, {firstName}, {id})`,
            //             values: {
            //                 lastName: get(lastElement, 'lastName', ''),
            //                 firstName: get(lastElement, 'firstName', ''),
            //                 id: get(lastElement, '_id', '')
            //             }
            //         }
            //     })
            // }
        }
    }
    let query = {
        type: tableNamesAndAliases.selectQueryString,
        table: tableNamesAndAliases.personTable,
        alias: mainQueryStrings.outerFilter,
        distinct: true,
        fields: [
            {
                table: mainQueryStrings.outerFilter,
                name: tableStructure.person[0].fieldName,
                alias: mainQueryStrings.idField
            },
            {
                table: mainQueryStrings.outerFilter,
                name: tableNamesAndAliases.jsonField,
                alias: mainQueryStrings.mainData
            }
        ],
        join: [
            {
                type: tableNamesAndAliases.leftJoinField,
                query: createInnerQuery(false, dataType, dataType === translations.personTypes.cases),
                alias: innerQueriesStrings.filteredExposuresTable,
                on: {[`${mainQueryStrings.outerFilter}.${tableStructure.person[0].fieldName}`]: `${innerQueriesStrings.filteredExposuresTable}.${innerQueriesStrings.filteredRelationsExposureId}`}
            }
        ],
        condition: outerFilterCondition,
        group: `${innerQueriesStrings.filteredExposuresTable}.${innerQueriesStrings.filteredRelationsId}`
    };

    sort[`${mainQueryStrings.outerFilter}._id`] = 1;
    query['sort'] = sort;

    if (dataType !== translations.personTypes.contacts) {
        query.group = [
            `${mainQueryStrings.outerFilter}._id`,
            `${innerQueriesStrings.filteredExposuresTable}.${innerQueriesStrings.filteredRelationsId}`
        ];
    }

    if (!skipAllExposures) {
        query.join.push(
            {
                type: tableNamesAndAliases.leftJoinField,
                query: createInnerQuery(true, dataType, dataType === translations.personTypes.cases),
                alias: innerQueriesStrings.unfilteredExposuresTable,
                on: {[`${mainQueryStrings.outerFilter}.${tableStructure.person[0].fieldName}`]: `${innerQueriesStrings.unfilteredExposuresTable}.${innerQueriesStrings.unfilteredRelationsExposureId}`}
            }
        );

        query.fields.push(
            {
                func: {
                    name: 'group_concat',
                    args: [{field: `${innerQueriesStrings.unfilteredExposuresTable}.${innerQueriesStrings.unfilteredExposuresAllExposures}`}, '***']
                },
                alias: mainQueryStrings.allOfExposures
            }
        );
        if (!skipLimit) {
            query.limit = 10;
        }
    }
    if (skipAllExposures === true) {
        // query.fields.push(
        //     {
        //         func: {
        //             name: 'count',
        //             args: [{field: `${mainQueryStrings.outerFilter}._id`}]
        //         },
        //         alias: 'CountRecords'
        //     }
        // );
        delete query.sort;
    }

    if (!skipLimit) {
        if (checkArrayAndLength(get(filter, 'sort', null)) && lastElement) {
            query['offset'] = offset;
        }
    }

    return query
}

function createInnerQuery(isAllExposures, differentFrom, isCase) {
    let fields = isAllExposures ? [
        {
            table: innerQueriesStrings.unfilteredRelationsTable,
            name: tableStructure.relationship[isCase ? 1 : 3].fieldName,
            alias: innerQueriesStrings.unfilteredRelationsExposureId
        },
        {
            table: innerQueriesStrings.unfilteredExposuresTable,
            name: tableNamesAndAliases.jsonField,
            alias: innerQueriesStrings.unfilteredExposuresAllExposures
        }
    ] : [
        {
            table: innerQueriesStrings.filteredRelationsTable,
            name: tableStructure.relationship[isCase ? 1 : 3].fieldName,
            alias: innerQueriesStrings.filteredRelationsExposureId
        },
        {
            table: innerQueriesStrings.filteredRelationsTable,
            name: tableStructure.relationship[0].fieldName,
            alias: innerQueriesStrings.filteredRelationsId
        },
        {
            table: innerQueriesStrings.filteredExposuresTable,
            name: tableNamesAndAliases.all
        },
    ];
    let relationTable = isAllExposures ? innerQueriesStrings.unfilteredRelationsTable : innerQueriesStrings.filteredRelationsTable;
    let exposureTable = isAllExposures ? innerQueriesStrings.unfilteredExposuresTable : innerQueriesStrings.filteredExposuresTable;
    return {
        type: tableNamesAndAliases.selectQueryString,
        table: tableNamesAndAliases.relationshipTable,
        alias: relationTable,
        fields: fields,
        join: [
            {
                type: tableNamesAndAliases.leftJoinField,
                table: tableNamesAndAliases.personTable,
                alias: exposureTable,
                on: {[`${relationTable}.${tableStructure.relationship[isCase ? 3 : 1].fieldName}`]: `${exposureTable}.${tableStructure.person[0].fieldName}`}
            }
        ],
        condition: {
            [`${exposureTable}.type`]: {'$ne': differentFrom},
            [`${relationTable}.deleted`]: 0,
            [`${exposureTable}.deleted`]: 0
        }
    }
}

export default {
    databaseTables,
    tableStructure,
    createQueries,
    insertOrUpdateQueries,
    selectQueries,
    relationshipsMappedFields,
    tableNamesAndAliases,
    createMainQuery
}