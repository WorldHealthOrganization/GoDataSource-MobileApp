/**
 * Created by florinpopa on 07/01/2019.
 */

export function testApi(testUrl, callback) {
    fetch(testUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
        .then((response) => {
            callback(null, response);
        })
        .catch((error) => {
            console.log("*** testApi error: ", error);
            callback(error);
        })
}