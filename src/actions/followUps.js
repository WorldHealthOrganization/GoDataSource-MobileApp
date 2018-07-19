/**
 * Created by florinpopa on 19/07/2018.
 */
import {ACTION_TYPE_GET_FOLLOWUPS, ACTION_TYPE_STORE_FOLLOWUPS} from './../utils/enums';
import {getFollowUpsForOutbreakIdRequest} from './../requests/followUps';


// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
export function storeFollowUps(followUps) {
    return {
        type: ACTION_TYPE_STORE_FOLLOWUPS,
        payload: followUps
    }
}

export function getFollowUpsForOutbreakId(outbreakId, token) {
    return async function (dispatch, getState) {
        getFollowUpsForOutbreakIdRequest(outbreakId, token, (error, response) => {
            if (error) {
                console.log("*** getFollowUpsForOutbreakId error: ", error);
            }
            if (response) {
                dispatch(storeFollowUps(response));
            }
        })
    }
}