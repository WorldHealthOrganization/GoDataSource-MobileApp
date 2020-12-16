import {getTeamsForUserRequest} from './../queries/user';
import {ACTION_TYPE_STORE_USER_TEAMS} from './../utils/enums';
import errorTypes from './../utils/errorTypes';

export function storeUserTeams(userTeams) {
    return {
        type: ACTION_TYPE_STORE_USER_TEAMS,
        payload: userTeams
    }
}

export function getUserTeams(userPouchId) {
    return new Promise((resolve, reject) => {
        getTeamsForUserRequest((error, response) => {
            if (error) {
                console.log("*** getUserTeams error: ", error);
                reject(errorTypes.ERROR_USER_TEAMS);
            }
            if (response) {
                const userId = userPouchId.split('_')[1];

                const userTeams = [];
                response.map((e) =>{
                    if (e.userIds.indexOf(userId) > -1){
                        const teamId = e._id.split('_')[1];
                        userTeams.push(Object.assign({}, e, {teamId: teamId}));
                    } 
                });
                resolve(userTeams);
            }
        })
    })
}