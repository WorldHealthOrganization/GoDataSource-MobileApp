import {getDatabase} from './database';

export function generalQuery(collection, query) {
    return new Promise((resolve, reject) => {
        getDatabase(collection)
            .then((database) => {
                database.find({
                    selector: query
                })
                    .then((resultFind) => {
                        resolve(resultFind.docs);
                    })
                    .catch((errorFind) => {
                        console.log('generalQuery find error: ', errorFind);
                        reject(errorFind);
                    })
            })
            .catch((errorGetDatabase) => {
                console.log('generalQuery getDatabase error: ', errorGetDatabase);
                reject(errorGetDatabase)
            })
    })
}

export function getPersonData() {

}