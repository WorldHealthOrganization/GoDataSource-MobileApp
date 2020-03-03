/**
 * Created by mobileclarisoft on 05/12/2018.
 */
import {ACTION_TYPE_STORE_HELP_ITEM} from './../utils/enums';
import {getHelpItemRequest} from '../queries/helpItem';
import errorTypes from './../utils/errorTypes';


// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
export function storeHelpItem(helpItem) {
    return {
        type: ACTION_TYPE_STORE_HELP_ITEM,
        payload: helpItem
    }
}

export function getHelpItem() {
    return new Promise((resolve, reject) => {
        getHelpItemRequest (null, (error, response) => {
            if (error) {
                console.log("*** getHelpItemRequest error: ", error);
                reject(errorTypes.ERROR_HELP);
            }
            if (response) {
                resolve({helpItem: response})
            }
        })
    })
}