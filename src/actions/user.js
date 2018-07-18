/**
 * Created by florinpopa on 03/07/2018.
 */
import {ACTION_TYPE_STORE_USER} from './../utils/enums';
import { changeAppRoot } from './app';
import {loginUserRequest, getUserByIdRequest} from './../requests/user';

// Add here only the actions, not also the requests that are executed.
// For that purpose is the requests directory
export function storeUser(user) {
    return {
        type: ACTION_TYPE_STORE_USER,
        payload: user
    }
}

export function loginUser(credentials) {
    console.log("LoginUser credentials: ", credentials);
    return async function (dispatch, getState) {
        loginUserRequest(credentials, (error, response) => {
            if (error) {
                console.log("*** An error occurred while logging the user");
            }
            if (response) {
                if (response.userId && response.id) {
                    dispatch(getUserById(response.userId, response.id));
                }
            }
        })
    }
}

export function logoutUser() {
    return async function (dispatch) {
        dispatch(storeUser(null));
        dispatch(changeAppRoot('login'));
    }
}

export function getUserById(userId, token) {
    return async function(dispatch) {
        getUserByIdRequest(userId, token, (error, response) => {
            if (error) {
                console.log("*** getUserById error: ", error);
            }
            if (response) {
                // store also the token
                let user = Object.assign({}, response, {token: token});
                dispatch(storeUser(user));
                dispatch(changeAppRoot('after-login'));
            }
        })
    }
}