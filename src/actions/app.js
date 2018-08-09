/**
 * Created by florinpopa on 14/06/2018.
 */
import {ACTION_TYPE_ROOT_CHANGE, ACTION_TYPE_SAVE_SCREEN_SIZE, ACTION_TYPE_ADD_FILTER_FOR_SCREEN, ACTION_TYPE_REMOVE_FILTER_FOR_SCREEN} from './../utils/enums';
import url from '../utils/url';
import config from './../utils/config';
import { loginUser } from './user';
import {Dimensions} from 'react-native';


// Add here only the actions, not also the requests that are executed. For that purpose is the requests directory
export function changeAppRoot(root) {
    return {
        type: ACTION_TYPE_ROOT_CHANGE,
        root: root
    };
}

export function saveScreenSize(screenSize) {
    return {
        type: ACTION_TYPE_SAVE_SCREEN_SIZE,
        screenSize: screenSize
    };
}

export function addFilterForScreen(screenName, filter) {
    return {
        type: ACTION_TYPE_ADD_FILTER_FOR_SCREEN,
        payload: {screenName: screenName, filters: filter}
    }
}

export function removeFilterForScreen(screenName) {
    return {
        type: ACTION_TYPE_REMOVE_FILTER_FOR_SCREEN,
        payload: {screenName: screenName}
    }
}

export function appInitialized() {
    return async function (dispatch, getState) {
        // Get Screen Dimensions and store them to the redux store in order to user them throughout the app
        let width = Dimensions.get("window").width;
        let height = Dimensions.get('window').height;

        let screenSize = {width, height};

        dispatch(saveScreenSize(screenSize));

        dispatch(changeAppRoot('login'));
        // Login to skip the first step. Only for develop mode
        // dispatch(loginUser({
        //     email: 'florin.popa@clarisoft.com',
        //     password: 'Cl@r1soft'
        // }))
    }
};