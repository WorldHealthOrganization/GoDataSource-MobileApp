/**
 * Created by florinpopa on 07/01/2019.
 */

export function testApi(testUrl, deviceInfo, callback) {
    fetch(testUrl, {
        method: 'GET',
        headers: {
            'device-info': deviceInfo,
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