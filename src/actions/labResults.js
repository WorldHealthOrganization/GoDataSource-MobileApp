import { getAllLabResultsForOutbreakQuery } from "../queries/labResults";
import {insertOrUpdate} from "../queries/sqlTools/helperMethods";

export function getAllLabResultsForOutbreak({outbreakId, labResultsFilter, searchText, lastElement, offset}, computeCount) {

    return getAllLabResultsForOutbreakQuery(
        outbreakId,
        labResultsFilter,
        searchText,
        lastElement,
        offset,
        computeCount)
        .then((results) => {
            console.log("get lab results filter", results?.data, results?.dataCount);
            return Promise.resolve({data: results?.data, dataCount: results?.dataCount});
        })
        .catch((error) => {
            console.log('lab error', error);
            return Promise.reject(error);
        })
}

export function updateLabResultAndContact(labResult) {
    return Promise.resolve()
        .then(() => insertOrUpdate('common', 'labResult', [labResult], true))
        .then((response) => Promise.resolve(response))
        .catch((errorUpdateFollowUp) => Promise.reject(errorUpdateFollowUp));
}