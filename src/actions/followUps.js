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

export function getFollowUpsForOutbreakId(outbreakId, filter, token) {
    return async function (dispatch, getState) {
        if (!filter || !filter.where || filter.where.and.length === 0 || !Array.isArray(filter.where.and)) {
            filter = null;
        }
        getFollowUpsForOutbreakIdRequest(outbreakId, filter, token, (error, response) => {
            if (error) {
                console.log("*** getFollowUpsForOutbreakId error: ", error);
            }
            if (response) {
                dispatch(storeFollowUps(response));
            }
        })
    }
}