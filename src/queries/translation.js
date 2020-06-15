/**
 * Created by florinpopa on 18/09/2018.
 */
import config from './../utils/config';
import {rawSQLQuery} from './sqlHelper';
import {executeQuery} from './sqlTools/helperMethods';
import {getDatabase} from "./database";

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

    // let start = new Date().getTime();
    // getDatabase(config.mongoCollections.languageToken)
    //     .then((database) => {
    //         database.find({
    //             selector: {
    //                 _id: {
    //                     $gte: `languageToken.json_${languageId}`,
    //                     $lte: `languageToken.json_${languageId}\uffff`,
    //                 },
    //                 deleted: false
    //             }
    //         })
    //             .then((resultFind) => {
    //                 console.log('Result for find time for translations: ', new Date().getTime() - start);
    //                 callback(null, resultFind.docs)
    //             })
    //             .catch((errorFind) => {
    //                 console.log('Error find for translations: ', errorFind);
    //                 callback(errorFind);
    //             })
    //     })
    //     .catch((errorGetDatabase) => {
    //         console.log('Error while getting database: ', errorGetDatabase);
    //         callback(errorGetDatabase);
    //     });

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