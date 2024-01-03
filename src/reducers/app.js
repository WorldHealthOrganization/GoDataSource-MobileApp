/**
 * Created by florinpopa on 18/06/2018.
 */
import {
    ACTION_TYPE_ADD_FILTER_FOR_SCREEN,
    ACTION_TYPE_REMOVE_FILTER_FOR_SCREEN,
    ACTION_TYPE_ROOT_CHANGE,
    ACTION_TYPE_SAVE_ACTIVE_DATABASE,
    ACTION_TYPE_SAVE_AVAILABLE_LANGUAGES,
    ACTION_TYPE_SAVE_GENERATED_FOLLOWUPS,
    ACTION_TYPE_SAVE_HELP_CATEGORY,
    ACTION_TYPE_SAVE_HELP_ITEM,
    ACTION_TYPE_SAVE_HUB_CONFIGURATION,
    ACTION_TYPE_SAVE_SCREEN_SIZE,
    ACTION_TYPE_CHANGES_EXIST,
    ACTION_TYPE_SAVE_SELECTED_SCREEN,
    ACTION_TYPE_SAVE_TRANSLATION,
    ACTION_TYPE_SET_LOADER_STATE,
    ACTION_TYPE_SET_LOGIN_STATE,
    ACTION_TYPE_SET_SYNC_STATE, ACTION_TYPE_SET_TIMEZONE
} from './../utils/enums';
import {sideMenuKeys} from './../utils/config';

// Do not add unnecessary business logic in the reducer. Here should only be updated the store
export default function app(state = { root: undefined, screenSize: {width: 375, height: 667}, changesExist: 'Unverified', selectedScreen: sideMenuKeys[0], filters: {}, translation: {}, helpCategory: {}, helpItem: {}, availableLanguages: [], hubConfiguration:{}, syncState: '', generatedFollowUps: '', loginState: '',  loaderState: false, activeDatabase: '', timezone: 'UTC' }, action = {}) {
    let stateClone = null;
    switch (action.type) {
        case ACTION_TYPE_ROOT_CHANGE:
            return Object.assign({}, state, {
                root: action.root
            });
        case ACTION_TYPE_CHANGES_EXIST:
            return Object.assign({}, state, {
                changesExist: action.changesExist
            });
        case ACTION_TYPE_SAVE_SCREEN_SIZE:
            return Object.assign({}, state, {
                screenSize: action.screenSize
            });
        case ACTION_TYPE_SAVE_SELECTED_SCREEN:
            return Object.assign({}, state, {
                selectedScreen: action.selectedScreen
            });
        case ACTION_TYPE_SAVE_TRANSLATION:
            return Object.assign({}, state, {
                translation: action.translation
            });
        case ACTION_TYPE_SAVE_HELP_CATEGORY:
            return Object.assign({}, state, {
                helpCategory: action.helpCategory
            });
        case ACTION_TYPE_SAVE_HELP_ITEM:
            return Object.assign({}, state, {
                helpItem: action.helpItem
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
        case ACTION_TYPE_SET_TIMEZONE:
            return Object.assign({}, state, {
                timezone: action.timezoneState || 'UTC'
            })
        case ACTION_TYPE_SAVE_GENERATED_FOLLOWUPS:
            console.log('generatedFollowUps',action.generatedFollowUps);
            return Object.assign({}, state, {
                generatedFollowUps: action.generatedFollowUps
            });
        case ACTION_TYPE_SAVE_ACTIVE_DATABASE:
            console.log('activeDatabase',action.activeDatabase);
            return Object.assign({}, state, {
                activeDatabase: action.activeDatabase
            });
        case ACTION_TYPE_SET_LOGIN_STATE:
            return Object.assign({}, state, {
                loginState: action.loginState
            });
        case ACTION_TYPE_SET_LOADER_STATE:
            return Object.assign({}, state, {
                loaderState: action.loaderState
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