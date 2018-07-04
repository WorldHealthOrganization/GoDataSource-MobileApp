/**
 * Created by florinpopa on 03/07/2018.
 */
import { changeAppRoot } from './app';

// Add here only the actions, not also the requests that are executed.
// For that purpose is the requests directory
export function loginUser(credentials) {
    console.log("LoginUser credentials: ", credentials);
    return async function (dispatch, getState) {
        dispatch(changeAppRoot('after-login'));
    }
}