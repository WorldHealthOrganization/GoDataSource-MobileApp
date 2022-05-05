/**
 * Created by florinpopa on 19/07/2018.
 */
// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
import {executeQuery, insertOrUpdate} from "../queries/sqlTools/helperMethods";
import translations from "../utils/translations";
import sqlConstants from "../queries/sqlTools/constants";
import constants from "../utils/constants";
import get from 'lodash/get';
import {checkArrayAndLength} from "../utils/typeCheckingFunctions";
import {getPersonWithRelationsForOutbreakId} from './../queries/sqlTools/sqlQueryInterface';

// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
export function getEventsForOutbreakId({outbreakId, eventsFilter, searchText, lastElement, offset}, computeCount) {
    return getPersonWithRelationsForOutbreakId({
        outbreakId,
        filter: eventsFilter,
        search: searchText,
        lastElement: lastElement,
        offset,
        personType: translations.personTypes.events
    }, computeCount)
        .then((results) => {
            // console.log('results', results);
            return Promise.resolve({data: results.data, dataCount: results?.dataCount});
        })
        .catch((error) => {
            console.log('error', error);
            return Promise.reject(error);
        })
}

export function getEventsForOutbreakIdOld({outbreakId, eventsFilter, searchText, lastElement, offset}, computeCount) {
    let countPromise = null;
    let eventsPromise = null;

    let eventsQuery = {
        type: 'select',
        query: sqlConstants.createMainQuery(translations.personTypes.events, outbreakId, eventsFilter, searchText, lastElement, offset), // Here will take place the contact/exposure filter/sort
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
        let eventsQueryCount = {
            type: 'select',
            query: sqlConstants.createMainQuery(translations.personTypes.events, outbreakId, eventsFilter, searchText, lastElement, offset, true), // Here will take place the contact/exposure filter/sort
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
        }
        countPromise = executeQuery(eventsQueryCount);
    }
    eventsPromise = executeQuery(eventsQuery);

    return Promise.all([eventsPromise, countPromise])
        .then(([events, eventsCount]) => {
            console.log('Returned values: ');
            return Promise.resolve({data: events, dataCount: checkArrayAndLength(eventsCount) ? eventsCount[0].countRecords : undefined});
        })
        .catch((errorGetEvents) => Promise.reject(errorGetEvents))
}

export function addEvent(myEvent) {
    return insertOrUpdate('common', 'person', [myEvent], false);
}

export function updateEvent (myEvent) {
    return  insertOrUpdate('common', 'person', [myEvent], false)
}

export function getEventsByName(outbreakId, search) {
    let eventsQuery = {
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
        .then(() => executeQuery(eventsQuery))
        .then((mappedData) => Promise.resolve(mappedData))
        .catch((errorGetData) => Promise.reject(errorGetData))
}

export function getPersonsByName(outbreakId, search, type, relationshipType) {
    let condition = {
        '$and':[
            {
                '$or': [
                    {
                        ['deleted']: 0,
                    },
                    {
                        ['deleted']: {'$is': null}
                    }
                ]
            },
            {
                '$or': [
                    {'firstName': {'$like': `%${search}%`}},
                    {'lastName': {'$like': `%${search}%`}},
                    {'visualId': {'$like': `%${search}%`}},
                ],
                'outbreakId': outbreakId,
            },

        ]
    };

    if (relationshipType === constants.RELATIONSHIP_TYPE.contact){
        if((type === 'Event' || type === translations.personTypes.events) || (type === 'Event' || type === translations.personTypes.events)){
            condition['type'] = {'$in': [translations.personTypes.events,translations.personTypes.events, translations.personTypes.contacts ]};
        } else if ((type === 'Contact' || type === translations.personTypes.contacts)){
            condition['type'] = {'$in':[translations.personTypes.contactsOfContacts]};
        }
    } else if (relationshipType === constants.RELATIONSHIP_TYPE.exposure){
        if((type === 'Event' || type === translations.personTypes.events) || (type === 'Event' || type === translations.personTypes.events)) {
            condition['type'] = {'$in': [translations.personTypes.events, translations.personTypes.events]};
        } else if (type === 'Contact' || type === translations.personTypes.contacts){
            condition['type'] = {'$in': [translations.personTypes.events,translations.personTypes.events ]};
        } else if (type === 'ContactOfContact' || type === translations.personTypes.contactsOfContacts){
            condition['type'] = {'$in': [translations.personTypes.contacts]};
        }
    }
    let eventsQuery = {
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
        condition: condition,
        sort: {'firstName': 1, 'lastName': 2}
    };

    return Promise.resolve()
        .then(() => executeQuery(eventsQuery))
        .then((mappedData) => Promise.resolve(mappedData))
        .catch((errorGetData) => Promise.reject(errorGetData))
}

export function getEventAndRelationshipsById (eventId, outbreakId) {
    let queryEvent = {
        type: 'select',
        table: 'person',
        fields: [
            {
                table: 'person',
                name: 'json',
                alias: 'eventData'
            }
        ],
        condition: {
            '_id': eventId
        }
    };

    let queryExposureRelations = {
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
                on: {'person._id': 'relationship.sourceId'}
            }
        ],
        condition: {
            'relationship.targetId': eventId,
            'relationship.deleted': 0
            // 'person.type': translations.personTypes.contacts
            // 'relationship.outbreakId': outbreakId,
        }
    };
    let queryContactRelations = {
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
            'relationship.sourceId': eventId,
            'relationship.deleted': 0
        }
    };
    if (outbreakId) {
        queryContactRelations.condition[`person.outbreakId`] = outbreakId;
    }

    let promiseEventData = executeQuery(queryEvent)
        .then((eventData) => Promise.resolve(get(eventData, `[0].eventData`, null)));
    let promiseContactRelationsData = executeQuery(queryContactRelations);
    let promiseExposureRelationsData = executeQuery(queryExposureRelations);

    return Promise.all([promiseEventData, promiseContactRelationsData, promiseExposureRelationsData])
        .then(([eventData, relationshipContactData, relationshipExposureData ]) => Promise.resolve({eventData, relationshipContactData, relationshipExposureData }))
        .catch((errorGetData) => Promise.reject(errorGetData))
}

export function getRelationsContactForEvent (eventId) {
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
            'relationship.sourceId': eventId,
            'relationship.deleted': 0
        }
    };
    return executeQuery(queryRelations);
}
export function getRelationsExposureForEvent (eventId) {
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
                on: {'person._id': 'relationship.sourceId'}
            }
        ],
        condition: {
            'relationship.targetId': eventId,
            'relationship.deleted': 0
            // 'person.type': translations.personTypes.contacts
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