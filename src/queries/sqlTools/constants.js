// Here will be stored different values in relation to the sql structure
const databaseTables = ['person', 'followUp', 'relationship'];
const tableStructure = {
    person: [
        {
            fieldName: 'id',
            fieldType: 'TEXT PRIMARY KEY'
        },
        {
            fieldName: 'firstName',
            fieldType: 'TEXT NOT NULL'
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
    ],
    followUp: [
        {
            fieldName: 'id',
            fieldType: 'TEXT PRIMARY KEY'
        },
        {
            fieldName: 'status',
            fieldType: 'TEXT NOT NULL'
        },
        {
            fieldName: 'date',
            fieldType: 'TEXT NOT NULL'
        },
        {
            fieldName: 'index',
            fieldType: 'INT NOT NULL'
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
            fieldName: 'id',
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
    commonFields: [
        {
            fieldName: 'createdAt',
            fieldType: 'DATE NOT NULL'
        },
        {
            fieldName: 'createdBy',
            fieldType: 'TEXT NOT NULL'
        },
        {
            fieldName: 'updatedAt',
            fieldType: 'DATE NOT NULL'
        },
        {
            fieldName: 'updatedBy',
            fieldType: 'TEXT NOT NULL'
        },
        {
            fieldName: 'deleted',
            fieldType: 'BOOLEAN NOT NULL'
        },
        {
            fieldName: 'deletedAt',
            fieldType: 'DATE'
        },
        {
            fieldName: 'deletedBy',
            fieldType: 'TEXT'
        },
        {
            fieldName: 'json',
            fieldType: 'TEXT NOT NULL'
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
    createTableRelationship: `${createTableString} relationship (${idFieldString}, sourceId TEXT NOT NULL, sourceType TEXT NOT NULL, targetId TEXT NOT NULL, targetType TEXT NOT NULL ${essentialFields}, FOREIGN KEY (sourceId) REFERENCES person(id), FOREIGN KEY (targetId) REFERENCES person(id))`
};

const insertOrUpdateQueries = {
    insertTablePerson: `INSERT INTO person VALUES (:id, :firstName, :lastName, :age, :gender, :type, :createdAt, :createdBy, :updatedAt, :updatedBy, :deleted, :deletedAt, :deletedBy, :json) ON CONFLICT (id) DO UPDATE SET firstName=excluded.firstName, lastName=excluded.lastName, age=excluded.age, gender=excluded.gender, type=excluded.type, createdAt=excluded.createdAt, createdBy=excluded.createdBy, updatedAt=excluded.updatedAt, updatedBy=excluded.updatedBy, deleted=excluded.deleted, deletedAt=excluded.deletedAt, deletedBy=excluded.deletedBy, json=excluded.json`,
    insertTableFollowUp: `INSERT INTO followUp VALUES (:id, :status, :date, :personId, :index, :createdAt, :createdBy, :updatedAt, :updatedBy, :deleted, :deletedAt, :deletedBy, :json) ON CONFLICT (id) DO UPDATE SET status=excluded.status, date=excluded.date, personId=excluded.personId, index=excluded.index, createdAt=excluded.createdAt, createdBy=excluded.createdBy, updatedAt=excluded.updatedAt, updatedBy=excluded.updatedAt, deleted=excluded.deleted, deletedAt=excluded.deletedAt, deletedBy=excluded.deletedBy, json=excluded.json`,
    insertTableRelationship: `INSERT INTO relationship values (:id, :sourceId, :sourceType, :targetId, :targetType, :createdAt, :createdBy, :updatedAt, :updatedBy, :deleted, :deletedAt, :deletedBy, :json) ON CONFLICT (id) DO UPDATE SET sourceId=excluded.sourceId, sourceType=excluded.sourceType, targetId=excluded.targetId, targetTyp=excluded.targetType, createdAt=excluded.createdAt, createdBy=excluded.createdBy, updatedAt=excluded.updatedAt, updatedBy=excluded.updatedBy, deleted=excluded.deleted, deletedAt=excluded.deletedAt, deletedBy=excluded.deletedBy, json=excluded.json`
};

const updateQueries = {

};

const selectQueries = {

};

export default {
    databaseTables,
    tableStructure,
    createQueries,
    insertOrUpdateQueries,
    updateQueries,
    selectQueries,
    relationshipsMappedFields
}