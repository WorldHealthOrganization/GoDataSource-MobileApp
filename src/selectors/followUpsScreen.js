import {createSelector} from 'reselect';
import get from "lodash/get";
import set from 'lodash/set';
import cloneDeep from 'lodash/cloneDeep';
import {handleExposedTo, getTranslation} from './../utils/functions';
import {prepareFirstComponentData} from './../utils/selectorsHelperFunctions';
import translations from './../utils/translations';
import {setLoaderState} from "../actions/app";

function selectFollowUps(state) {
    return state.followUps;
}

function selectCases(state) {
    return state.cases;
}

function selectContacts(state) {
    return state.contacts;
}

function selectEvents(state) {
    return state.events;
}

function selectFilters(state) {
    return state.app.filter;
}

function selectTranslations(state) {
    return state.app.translation;
}

function selectLocations(state) {
    return get(state, `locations.locationsList`, []);
}


// FollowUps screen selector
// Accepts the state, gets followUps, contacts, cases, events and translations
// Returns follow-ups mapped to be directly showed
// Sorting and filtering will be done at component level(a good improvement will be to change the way the data are got to exclude mapping of the redux state so intensly, but for that will need a better database)
export const mapFollowUps = createSelector(
    [selectFollowUps, selectContacts, selectCases, selectEvents, selectTranslations, selectLocations],
    (followUps, allContacts, cases, events, translation, locations) => {
        // console.log('Selectors logic: ', followUps, allContacts);
        if (followUps && allContacts && cases && events) {
            const contactsHasFollowUps = allContacts.some(e => {
                return e.followUps !== undefined && e.followUps !== null && e.followUps.length > 0
            });

            if (contactsHasFollowUps) {
                let fUps = [];
                let contacts = cloneDeep(allContacts);
                for (let i = 0; i < contacts.length; i++) {
                    if (contacts[i].followUps) {

                        // if (!contacts[i].additionalData) {
                            contacts[i].additionalData = {};
                        // }

                        // Map relationships
                        if (contacts[i].relationships) {
                            // console.log('selectors logic: ', contacts[i].relationships);
                            set(contacts, `[${i}].additionalData.secondComponentData`, computeSecondComponentData(contacts[i], cases, events));
                            set(contacts, `[${i}].additionalData.secondComponentData.exposedToMessage`, getTranslation(translations.followUpsScreen.exposedToMessage, translation));
                        }

                        set(contacts, `[${i}].additionalData.firstComponentData`, prepareFirstComponentData('Contacts', contacts[i], translations, locations));

                        contacts[i].followUps.forEach((element) => {
                            set(element, `additionalData`, get(contacts, `[${i}].additionalData`, null));
                            set(element, `additionalData.secondComponentData.followUpDay`, element.index || null);
                            set(element, `additionalData.secondComponentData.followUpDayLabel`, getTranslation(translations.personListItem.dayOfFollowUp, translation));

                            set(element, `additionalData.thirdComponentData`, {
                                followUpStatus: getTranslation(element.statusId, translation),
                                addExposureLabel: getTranslation(translations.followUpsScreen.addExposureFollowUpLabel, translation)
                            });
                        });
                        fUps = fUps.concat(contacts[i].followUps);
                    }
                }
                return fUps;
            } else {
                return [];
            }
        } else {
            return null;
        }
    }
);

computeSecondComponentData = (contact, cases, events) => {
    return {
        exposedTo: handleExposedTo(contact, false, cases, events)
    }
};