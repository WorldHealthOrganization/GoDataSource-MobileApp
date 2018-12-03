/**
 * Created by florinpopa on 18/09/2018.
 */
import {getDatabase} from './database';

export function getAvailableLanguagesRequest (callback) {
    let database = getDatabase();

    let start =  new Date().getTime();
    // database.allDocs({
    //     startkey: `language.json_`,
    //     endkey: `language.json_\uffff`,
    //     include_docs: true
    // })
    //     .then((result) => {
    //         console.log("result with the new index for available languages: ", new Date().getTime() - start);
    //         callback(null, result.rows.map((e) => {return e.doc}));
    //     })
    //     .catch((errorQuery) => {
    //         console.log("Error with the new index for available languages: ", errorQuery);
    //         callback(errorQuery);
    //     })

    database.find({
        selector: {
            _id: {
                $gt: 'language.json_',
                $lt: 'language.json_\uffff'
            },
            deleted: false
        }
    })
        .then((resultFind) => {
            console.log('Result for find time for available languages: ', new Date().getTime() - start, resultFind.docs);
            callback(null, resultFind.docs)
        })
        .catch((errorFind) => {
            console.log('Error find for available languages: ', errorFind);
            callback(errorFind);
        })
}

export function getTranslationRequest (languageId, callback) {
    let database = getDatabase();

    console.log("getTranslationRequest: ", languageId);

    let start =  new Date().getTime();
    // database.allDocs({
    //     startkey: `languageToken.json_${languageId}`,
    //     endkey: `languageToken.json_${languageId}\uffff`,
    //     include_docs: true
    // })
    //     .then((result) => {
    //         console.log("result with the new index for translation: ", new Date().getTime() - start);
    //         callback(null, result.rows.map((e) => {return e.doc}));
    //     })
    //     .catch((errorQuery) => {
    //         console.log("Error with the new index for translation: ", errorQuery);
    //         callback(errorQuery);
    //     })

    database.find({
        selector: {
            _id: {
                $gte: `languageToken.json_${languageId}`,
                $lte: `languageToken.json_${languageId}\uffff`,
            },
            deleted: false
        }
    })
        .then((resultFind) => {
            console.log('Result for find time for translations: ', new Date().getTime() - start);
            callback(null, resultFind.docs)
        })
        .catch((errorFind) => {
            console.log('Error find for translations: ', errorFind);
            callback(errorFind);
        })
}