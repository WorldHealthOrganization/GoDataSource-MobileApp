import {createSelector} from 'reselect';
import lodashGet from "lodash/get";
import config from "./config";

export const selectUser = createSelector(
    state => lodashGet(state, 'user', null),
    user => user
);

export const selectAllLanguages = createSelector(
    state => lodashGet(state, 'app.availableLanguages', []),
    languages => languages
);

export const selectScreenSize = createSelector(
    state => lodashGet(state, 'app.screenSize', config.designScreenSize),
    screenSize => screenSize
);

export const selectTranslations = createSelector(
    state => lodashGet(state, 'translation', []),
    translation => translation
);

export const selectUserLanguage = createSelector(
    state => lodashGet(state, 'user', null),
    user => lodashGet(user, 'languageId', null)
);