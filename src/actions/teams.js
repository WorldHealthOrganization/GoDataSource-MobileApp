

import { getTeamsForUserRequest } from './../queries/user';
import { addError } from './errors';
import {ACTION_TYPE_STORE_USER_TEAMS} from './../utils/enums';
import errorTypes from './../utils/errorTypes';

export function storeUserTeams(userTeams) {
    return {
        type: ACTION_TYPE_STORE_USER_TEAMS,
        payload: userTeams
    }
}

export function getUserTeams(userPouchId, dispatch) {
    return new Promise((resolve, reject) => {
        getTeamsForUserRequest((error, response) => {
            if (error) {
                console.log("*** getUserTeams error: ", error);
                dispatch(addError(errorTypes.ERROR_USER_TEAMS));
                reject(error);
            }
            if (response) {
                console.log ('getUserTeams response', response);
                const userId = userPouchId.split('_')[1];

                const userTeams = [];
                response.map((e) =>{
                    if (e.userIds.indexOf(userId) > -1){
                        const teamId = e._id.split('_')[1];
                        userTeams.push(teamId);
                    } 
                });
                dispatch(storeUserTeams(userTeams));
                resolve(userTeams);
            }
        })
    })
}