
import {Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import base64 from 'base-64';

export function wipeCompleteRequest(url, installationId, clientId, clientSecret, callback) {
    if (url && installationId) {
        let requestUrl = `${url}/devices/wipe-complete`

        let deviceInfoStringify = JSON.stringify({
            id: installationId,
            os: Platform.OS,
            manufacturer: DeviceInfo.getManufacturer().replace(/\u0022|\u0027|\u0060|\u00b4|\u2018|\u2019|\u201c|\u201d/g, `\'`),
            model: DeviceInfo.getModel().replace(/\u0022|\u0027|\u0060|\u00b4|\u2018|\u2019|\u201c|\u201d/g, `\'`),
            name: DeviceInfo.getDeviceName().replace(/\u0022|\u0027|\u0060|\u00b4|\u2018|\u2019|\u201c|\u201d/g, `\'`)
        });
    
        // console.log ('operatingSystem: ', operatingSystem)
        // console.log ('deviceManufacturer: ', deviceManufacturer)
        // console.log ('deviceModel: ', deviceModel)
        // console.log ('deviceName: ', deviceName)
        // console.log ('deviceDescription: ', deviceDescription)
        // console.log ('requestUrl: ', requestUrl)
        // console.log ('installationId: ', installationId)

        // let deviceInfoStringify = `{"id": "${installationId}", "os": "${operatingSystem}", "manufacturer": "${deviceManufacturer}", "model": "${deviceModel}", "name": "${deviceName}"}`
        // console.log('deviceInfoStringify: ', deviceInfoStringify)

        fetch( encodeURI(requestUrl), {
            method: 'POST',
            headers: {
                "device-info": deviceInfoStringify,
                'Authorization': 'Basic ' + base64.encode(`${clientId}:${clientSecret}`),
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
                console.log("*** wipeCompleteRequest response: ", response);
                callback(null, response);
            })
            .catch((error) => {
                console.log("*** wipeCompleteRequest error: ", error);
                callback(error);
            })
    }
    
};
