/**
 * Created by mobileclarisoft on 05/12/2018.
 */
import {ACTION_TYPE_STORE_HELP_CATEGORY} from './../utils/enums';
import {getHelpCategoryRequest} from '../queries/helpCategory';
import { addError } from './errors';
import errorTypes from './../utils/errorTypes';


// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
export function storeHelpCategory(helpCategory) {
    return {
        type: ACTION_TYPE_STORE_HELP_CATEGORY,
        payload: helpCategory
    }
}

export function getHelpCategory(token, dispatch) {
    return new Promise((resolve, reject) => {
        getHelpCategoryRequest (null, (error, response) => {
            if (error) {
                console.log("*** getHelpCategoryRequest error: ", error);
                dispatch(addError(errorTypes.ERROR_HELP));
                reject(error);
            }
            if (response) {
                // console.log('response help category: ',response);
                dispatch(storeHelpCategory(response));
                resolve('Done help category');
            }
        })
    })
}