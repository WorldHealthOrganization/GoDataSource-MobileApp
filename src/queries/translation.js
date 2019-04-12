/**
 * Created by florinpopa on 18/09/2018.
 */
import {getDatabase} from './database';
import config from './../utils/config';

export function getAvailableLanguagesRequest (callback) {
    let start =  new Date().getTime();

    getDatabase(config.mongoCollections.languageToken)
        .then((database) => {
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
        })
        .catch((errorGetDatabase) => {
            console.log('Error while getting database: ', errorGetDatabase);
            callback(errorGetDatabase);
        });
}

export function getTranslationRequest (languageId, callback) {
    let start =  new Date().getTime();

    getDatabase(config.mongoCollections.languageToken)
        .then((database) => {
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
        })
        .catch((errorGetDatabase) => {
            console.log('Error while getting database: ', errorGetDatabase);
            callback(errorGetDatabase);
        });
}