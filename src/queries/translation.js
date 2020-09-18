/**
 * Created by florinpopa on 18/09/2018.
 */
import config from './../utils/config';
import {rawSQLQuery} from './sqlHelper';
import {executeQuery} from './sqlTools/helperMethods';
import {getDatabase} from "./database";
import {extractIdFromPouchId} from "../utils/functions";
import appConfig from './../../app.config';


// This method will extract both all the languages available on API and the ones on mobile and will do a diff
export function getAvailableLanguagesRequest (callback) {
    let allLangPromise = rawSQLQuery(config.mongoCollections.language, `${config.rawSQLQueryString}`, []);
    let deviceLangPromise = getLocalTranslations();

    Promise.all([allLangPromise, deviceLangPromise])
        .then(([allLang, deviceLang]) => {
            let allLangFilter = allLang.filter((e) => deviceLang.includes(extractIdFromPouchId(e._id, 'language.json'))).map((e) => {return {value: e._id.substr('language.json_'.length), label: e.name}});
            callback(null, {apiLanguages: allLang.map((e) => Object.assign({}, e, {_id: extractIdFromPouchId(e._id, 'language.json')})), deviceLanguages: allLangFilter})
        })
        .catch((error) => {
            console.log('Error get translations: ', error);
            callback(error)
        });

    // rawSQLQuery(config.mongoCollections.language, `${config.rawSQLQueryString}`, [])
    //     .then((result) => {
    //         callback(null, result);
    //     })
    //     .catch((error) => {
    //         console.log('Error get translations: ', error);
    //         callback(error)
    //     })
}

export function getTranslationRequest (languageId, outbreakId, callback) {
    let query = {
        type: 'select',
        table: 'languageToken',
        fields: [
            {
                name: 'json',
                alias: 'languageData',
                table: 'languageToken'
            }
        ],
        condition: {
            languageId: languageId
        }
    };

    if (appConfig.env === 'development' && outbreakId) {
        query.condition = Object.assign({}, query.condition, {
            $or: [
                {
                    _id: {$nlike: `LNG_OUTBREAK_%`}
                },
                {
                    _id: {$like: `LNG_OUTBREAK_${outbreakId}_%`}
                },
            ]
        });
    }

    executeQuery(query)
        .then((languageData) => {
            callback(null, languageData.map((e) => e.languageData));
        })
        .catch((errorLanguageData) => {
            callback(errorLanguageData);
        })
}

export function getLocalTranslations () {
    let query = {
        type: 'select',
        table: 'languageToken',
        fields: [
            {
                expression: {
                    pattern: `distinct languageToken.languageId`
                },
                alias: 'languageData'
            }
        ],
        condition: {
            deleted: 0
        }
    };

    return executeQuery(query)
        .then((languageData) => Promise.resolve(languageData.map((e) => e.languageData)))
        .catch((errorLanguageData) => Promise.reject(errorLanguageData))
}