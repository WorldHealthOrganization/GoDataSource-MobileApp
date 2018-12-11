/**
 * Created by mobileclarisoft on 05/12/2018.
 */
import {ACTION_TYPE_STORE_HELP} from './../utils/enums';
import {getHelpRequest} from './../queries/help';
import { addError } from './errors';
import errorTypes from './../utils/errorTypes';


// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
export function storeHelp(help) {
    return {
        type: ACTION_TYPE_STORE_HELP,
        payload: help
    }
}

export function getHelp(token, dispatch) {
    return new Promise((resolve, reject) => {
        getHelpRequest (null, (error, response) => {
            if (error) {
                console.log("*** getHelpRequest error: ", error);
                dispatch(addError(errorTypes.ERROR_HELP));
                reject(error);
            }
            if (response) {
                console.log('response help: ',response);
                dispatch(storeHelp(response));
                resolve('Done help');
            }
        })
    })
}