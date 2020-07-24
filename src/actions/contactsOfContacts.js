// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
import {getPersonWithRelationsForOutbreakId} from "../queries/sqlTools/sqlQueryInterface";
import translations from "../utils/translations";

export function getContactsOfContactsForOutbreakId({outbreakId, contactsFilter, exposureFilter, lastElement, offset}, computeCount) {
    return getPersonWithRelationsForOutbreakId({
        outbreakId,
        filter: contactsFilter,
        search: exposureFilter,
        lastElement: lastElement,
        offset,
        personType: translations.personTypes.contactsOfContacts
    }, computeCount)
        .then((results) => {
            // console.log('results', results);
            return Promise.resolve({data: results.data, dataCount: results.dataCount || undefined});
        })
        .catch((error) => {
            console.log('error', error);
            return Promise.reject(error);
        })
}