/**
 * Created by florinpopa on 20/07/2018.
 */
import {ACTION_TYPE_STORE_CONTACTS} from './../utils/enums';
import {getContactsForOutbreakIdRequest} from './../requests/contacts';


// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
export function storeContacts(followUps) {
    return {
        type: ACTION_TYPE_STORE_CONTACTS,
        payload: followUps
    }
}

export function getContactsForOutbreakId(outbreakId, token) {
    return async function (dispatch, getState) {
        getContactsForOutbreakIdRequest(outbreakId, token, (error, response) => {
            if (error) {
                console.log("*** getContactsForOutbreakId error: ", error);
            }
            if (response) {
                dispatch(storeContacts(response));
            }
        })
    }
}