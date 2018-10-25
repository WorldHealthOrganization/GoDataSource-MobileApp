/**
 * Created by florinpopa on 18/06/2018.
 */
import {
    ACTION_TYPE_ROOT_CHANGE,
    ACTION_TYPE_SAVE_SCREEN_SIZE,
    ACTION_TYPE_ADD_FILTER_FOR_SCREEN,
    ACTION_TYPE_REMOVE_FILTER_FOR_SCREEN,
    ACTION_TYPE_SAVE_TRANSLATION,
    ACTION_TYPE_SAVE_AVAILABLE_LANGUAGES,
    ACTION_TYPE_SAVE_HUB_CONFIGURATION,
    ACTION_TYPE_SET_SYNC_STATE,
    ACTION_TYPE_SET_LOGIN_STATE
} from './../utils/enums';

// Do not add unnecessary business logic in the reducer. Here should only be updated the store
export default function app(state = { root: undefined, screenSize: {width: 375, height: 667}, filters: {}, translation: {}, availableLanguages: [], hubConfiguration:{}, syncState: '', loginState: '' }, action = {}) {
    let stateClone = null;
    switch (action.type) {
        case ACTION_TYPE_ROOT_CHANGE:
            return Object.assign({}, state, {
                root: action.root
            });
        case ACTION_TYPE_SAVE_SCREEN_SIZE:
            return Object.assign({}, state, {
                screenSize: action.screenSize
            });
        case ACTION_TYPE_SAVE_TRANSLATION:
            return Object.assign({}, state, {
                translation: action.translation
            });
        case ACTION_TYPE_SAVE_AVAILABLE_LANGUAGES:
            return Object.assign({}, state, {
                availableLanguages: action.availableLanguages
            });
        case ACTION_TYPE_SAVE_HUB_CONFIGURATION:
            return Object.assign({}, state, {
                hubConfiguration: action.hubConfiguration
            });
        case ACTION_TYPE_SET_SYNC_STATE:
            return Object.assign({}, state, {
                syncState: action.syncState
            });
        case ACTION_TYPE_SET_LOGIN_STATE:
            return Object.assign({}, state, {
                loginState: action.loginState
            });
        case ACTION_TYPE_ADD_FILTER_FOR_SCREEN:
            if (!action.payload) {
                return null;
            }
            stateClone = Object.assign({}, state);
            if (!stateClone.filters) {
                stateClone.filters = {};
            }
            console.log("### log screenName and filter: ", JSON.stringify(action.payload), action.payload.screenName, action.payload.filters);
            stateClone.filters[action.payload.screenName] = action.payload.filters;
            return Object.assign({}, stateClone);
        case ACTION_TYPE_REMOVE_FILTER_FOR_SCREEN:
            if (!action.payload) {
                return null;
            }
            stateClone = Object.assign({}, state);
            if (!stateClone.filters) {
                stateClone.filters = {};
            }
            stateClone.filters[action.payload.screenName] = null;
            return Object.assign({}, stateClone);
        default:
            return state;
    }
};