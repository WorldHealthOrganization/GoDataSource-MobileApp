/**
 * Created by florinpopa on 19/07/2018.
 */
// import { ACTION_TYPE_STORE_FOLLOWUPS, ACTION_TYPE_UPDATE_FOLLOWUP} from './../utils/enums';
// import { updateContactAction, getContactsForOutbreakIdWithPromises, getContactsForOutbreakPromise} from './contacts';
import { addError } from './errors';
import errorTypes from './../utils/errorTypes';
import {
    getFollowUpsForOutbreakIdRequest,
} from './../queries/followUps';
import uniq from 'lodash/uniq';
import get from 'lodash/get';
import {mapContactsAndFollowUps, createDate} from './../utils/functions';
import {executeQuery, insertOrUpdate} from './../queries/sqlTools/helperMethods';
import sqlConstants from './../queries/sqlTools/constants';
import {checkArrayAndLength} from "../utils/typeCheckingFunctions";
var jsonSql = require('json-sql')();
jsonSql.setDialect('sqlite');
import translations from './../utils/translations';

// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
// export function storeFollowUps(followUps) {
//     return {
//         type: ACTION_TYPE_STORE_FOLLOWUPS,
//         payload: followUps
//     }
// }
//
// export function updateFollowUpAction(followUp) {
//     return {
//         type: ACTION_TYPE_UPDATE_FOLLOWUP,
//         payload: followUp
//     }
// }

export function getFollowUpsForOutbreakId({outbreakId, followUpFilter, userTeams, contactsFilter, exposureFilter, lastElement}, computeCount) {
    let countPromise = null;
    let followUpPromise = null;

    let followUpCondition = {
        'FollowUps.deleted': 0
    };
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
        // userTeams = userTeams.concat([{teamId: null}]);
        // userTeams = userTeams.concat([{teamId: ''}]);
        followUpCondition['$or'] = [
            {
                ['FollowUps.teamId']: {'$in': userTeams.map((e) => e.teamId)}
            },
            {
                ['FollowUps.teamId']: {'$is': null}
            }
        ]
        // followUpCondition['FollowUps.teamId'] = {'$in': userTeams.map((e) => e.teamId)};
    }

    let contactsAndExposuresQuery = {
        type: 'select',
        query: sqlConstants.createMainQuery(translations.personTypes.contacts, outbreakId, contactsFilter, exposureFilter, lastElement), // Here will take place the contact/exposure filter/sort
        alias: 'MappedData',
        fields: [
            {
                table: 'MappedData',
                name: 'IdField',
                alias: 'ContactId'
            },
            {
                table: 'MappedData',
                name: 'MainData',
                alias: 'MainData'
            },
            {
                table: 'MappedData',
                name: 'AllOfExposures',
                alias: 'ExposureData'
            }
        ]
    };
    let followUpQuery = {
        type: 'select',
        table: 'followUp',
        alias: 'FollowUps',
        fields: [
            {
                table: 'FollowUps',
                name: '_id',
                alias: '_id'
            },
            {
                table: 'FollowUps',
                name: 'json',
                alias: 'followUpData'
            },
            {
                table: 'ContactsWithExposures',
                name: 'MainData',
                alias: 'mainData'
            },
            {
                table: 'ContactsWithExposures',
                name: 'ExposureData',
                alias: 'exposureData'
            }
        ],
        join: [
            {
                type: 'inner',
                query: contactsAndExposuresQuery,
                alias: 'ContactsWithExposures',
                on: {'FollowUps.personId': 'ContactsWithExposures.ContactId'}
            }
        ],
        condition: followUpCondition
    };

    if (computeCount) {
        let contactsQueryCount = {
            type: 'select',
            query: sqlConstants.createMainQuery(translations.personTypes.contacts, outbreakId, contactsFilter, exposureFilter, lastElement, true), // Here will take place the contact/exposure filter/sort
            alias: 'MappedData',
            fields: [
                {
                    table: 'MappedData',
                    name: 'IdField',
                    alias: 'ContactId'
                }
            ]
        };
        let followUpCount = {
            type: 'select',
            table: 'followUp',
            alias: 'FollowUps',
            fields: [
                {
                    func: {
                        name: 'count',
                        args: [{field: `FollowUps._id`}]
                    },
                    alias: 'countRecords'
                }
            ],
            join: [
                {
                    type: 'inner',
                    query: contactsQueryCount,
                    alias: 'ContactsWithExposures',
                    on: {'FollowUps.personId': 'ContactsWithExposures.ContactId'}
                }
            ],
            condition: followUpCondition
        };
        countPromise = executeQuery(followUpCount);
    }
    followUpPromise = executeQuery(followUpQuery);

    return Promise.all([followUpPromise, countPromise])
        .then(([followUps, followUpsCount]) => {
            console.log('Returned values: ');
            return Promise.resolve({data: followUps, dataCount: checkArrayAndLength(followUpsCount) ? followUpsCount[0].countRecords : null});
        })
        .catch((errorGetFollowUps) => Promise.reject(errorGetFollowUps))
}

export function generalMapping(unmappedData) {
    return unmappedData.map((e) => {
        let followUpData = JSON.parse(get(e, 'FollowUpsData', null));
        let mainData = JSON.parse(get(e, 'MainData', null));
        let unparsedExposureData = e.ExposuresData ? e.ExposuresData.split('***') : null;
        let exposureData = [];
        if (unparsedExposureData) {
            exposureData = unparsedExposureData.map((e) => JSON.parse(e));
        }
        let mappedObject = {};
        if(followUpData) {
            mappedObject['followUpData'] = followUpData;
        }
        if (mainData) {
            mappedObject['mainData'] = mainData
        }
        if (exposureData) {
            mappedObject['exposureData'] = exposureData;
        }

        return mappedObject;
    })
}

export function getFollowUpsForOutbreakIdWithPromises(outbreakId, filter, userTeams, token, dispatch) {
    return new Promise((resolve, reject) => {
        if (!filter) {
            filter = {};
            filter.date = createDate(null);
        }
        console.log("getFollowUpsForOutbreakId Filter: ", filter);
        getFollowUpsForOutbreakIdRequest(outbreakId, filter, userTeams, token, (error, response) => {
            if (error) {
                console.log("*** getFollowUpsForOutbreakId error: ", error);
                // dispatch(addError(errorTypes.ERROR_FOLLOWUPS));
                reject(errorTypes.ERROR_FOLLOWUPS)
            }
            if (response) {
                // After getting the followUps by date, it's time to get their respective contacts
                let keys = response.map((e) => {return e.personId});
                keys = uniq(keys);
                console.log('### Keys for getting contacts: ', keys);
                getContactsForOutbreakIdWithPromises(outbreakId, {keys: keys}, null, dispatch)
                    .then((responseGetContacts) => {
                        // dispatch(storeFollowUps(response));
                        // getRelationshipsForTypeRequest(outbreakId, 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT', keys, (errorGetRelationships, resultGetRelationships) => {
                            let mappedContact = mapContactsAndFollowUps(responseGetContacts, response);
                            // mappedContact = mapContactsAndRelationships(mappedContact, resultGetRelationships);
                            // dispatch(storeContacts(mappedContact));
                            resolve({followUps: {followUps: response, contacts: mappedContact}});
                        // })
                    })
                    .catch((errorGetContactsForFollowUps) => {
                        dispatch(addError(errorTypes.ERROR_CONTACT));
                        reject(errorGetContactsForFollowUps);
                    })
            }
        })
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