/**
 * Created by mobileclarisoft on 05/12/2018.
 */
import {ACTION_TYPE_STORE_HELP_CATEGORY} from './../utils/enums';
import {getHelpCategoryRequest} from '../queries/helpCategory';
import errorTypes from './../utils/errorTypes';


// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
export function storeHelpCategory(helpCategory) {
    return {
        type: ACTION_TYPE_STORE_HELP_CATEGORY,
        payload: helpCategory
    }
}

export function getHelpCategory() {
    return new Promise((resolve, reject) => {
        getHelpCategoryRequest (null, (error, response) => {
            if (error) {
                console.log("*** getHelpCategoryRequest error: ", error);
                reject(errorTypes.ERROR_HELP);
            }
            if (response) {
                resolve({helpCategory: response})
            }
        })
    })
}