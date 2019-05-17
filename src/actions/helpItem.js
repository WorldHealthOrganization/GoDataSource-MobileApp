/**
 * Created by mobileclarisoft on 05/12/2018.
 */
import {ACTION_TYPE_STORE_HELP_ITEM} from './../utils/enums';
import {getHelpItemRequest} from '../queries/helpItem';
import { addError } from './errors';
import errorTypes from './../utils/errorTypes';


// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
export function storeHelpItem(helpItem) {
    return {
        type: ACTION_TYPE_STORE_HELP_ITEM,
        payload: helpItem
    }
}

export function getHelpItem(token, dispatch) {
    return new Promise((resolve, reject) => {
        getHelpItemRequest (null, (error, response) => {
            if (error) {
                console.log("*** getHelpItemRequest error: ", error);
                dispatch(addError(errorTypes.ERROR_HELP));
                reject(error);
            }
            if (response) {
                // console.log('response help item: ',response);
                dispatch(storeHelpItem(response));
                resolve('Done help item');
            }
        })
    })
}