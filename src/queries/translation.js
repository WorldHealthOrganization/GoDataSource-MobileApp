/**
 * Created by florinpopa on 18/09/2018.
 */
import config from './../utils/config';
import {rawSQLQuery} from './sqlHelper';
import {executeQuery} from './sqlTools/helperMethods';

export function getAvailableLanguagesRequest (callback) {

    rawSQLQuery(config.mongoCollections.language, `${config.rawSQLQueryString}`, [])
        .then((result) => {
            callback(null, result);
        })
        .catch((error) => {
            console.log('Error get translations: ', error);
            callback(error)
        })
}

export function getTranslationRequest (languageId, callback) {

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

    executeQuery(query)
        .then((languageData) => {
            callback(null, languageData.map((e) => e.languageData));
        })
        .catch((errorLanguageData) => {
            callback(errorLanguageData);
        })
}