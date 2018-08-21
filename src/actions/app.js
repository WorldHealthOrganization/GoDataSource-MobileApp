/**
 * Created by florinpopa on 14/06/2018.
 */
import {
    ACTION_TYPE_ROOT_CHANGE,
    ACTION_TYPE_SAVE_SCREEN_SIZE,
    ACTION_TYPE_ADD_FILTER_FOR_SCREEN,
    ACTION_TYPE_REMOVE_FILTER_FOR_SCREEN,
    ACTION_TYPE_SAVE_TRANSLATION
} from './../utils/enums';
import url from '../utils/url';
import config from './../utils/config';
import { loginUser } from './user';
import {Dimensions} from 'react-native';
import {Platform, NativeModules} from 'react-native';
import {getTranslationRequest} from './../requests/translation';


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

export function saveTranslation(translation) {
    return {
        type: ACTION_TYPE_SAVE_TRANSLATION,
        translation: translation
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

export function getTranslations() {
    return async function (dispatch, getState) {
        let language = '';
        if (Platform.OS === 'ios') {
            language = NativeModules.SettingsManager.settings.AppleLocale;
        } else {
            language = NativeModules.I18nManager.localeIdentifier;
        }

        if (language === 'en_US') {
            language = 'english_us';
        }

        getTranslationRequest(language, (error, response) => {
            if (error) {
                console.log("*** addExposureForContact error: ", error);
            }
            if (response) {
                console.log("Response from add exposure");
                dispatch(saveTranslation(response));
            }
        })
    }
}

export function appInitialized() {
    return async function (dispatch, getState) {
        // Get Screen Dimensions and store them to the redux store in order to use them throughout the app
        let width = Dimensions.get("window").width;
        let height = Dimensions.get('window').height;

        let screenSize = {width, height};

        dispatch(saveScreenSize(screenSize));

        // Get the translations from the api and save them to the redux store
        dispatch(getTranslations());

        // dispatch(changeAppRoot('login'));
        // Login to skip the first step. Only for develop mode
        dispatch(loginUser({
            email: 'florin.popa@clarisoft.com',
            password: 'Cl@r1soft'
        }))
    }
}