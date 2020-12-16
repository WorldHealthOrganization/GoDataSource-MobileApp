/**
 * Created by florinpopa on 20/08/2018.
 */
import url from './../utils/url';
import {handleResponse} from './../utils/functions';

export function getTranslationRequest(languageId, callback) {
    let requestUrl = url.getLanguagesUrl() + '/' + languageId + "/language-tokens";

    fetch(requestUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
        .then((response) => {
            return handleResponse(response);
        })
        .then((response) => {
            console.log('### getTranslationRequest response: ');
            callback(null, response);
        })
        .catch((error) => {
            console.log("*** getTranslationRequest error: ", JSON.stringify(error));
            callback(error);
        })
}