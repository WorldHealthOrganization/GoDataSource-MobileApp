/**
 * Created by florinpopa on 14/06/2018.
 */
import {ACTION_TYPE_ROOT_CHANGE} from './../utils/enums';
import url from '../utils/url';
import config from './../utils/config';


// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
export function changeAppRoot(root) {
    return {
        type: ACTION_TYPE_ROOT_CHANGE,
        root: root
    };
};

export function appInitialized() {
    return async function (dispatch, getState) {
        dispatch(changeAppRoot('login'));
    }
};