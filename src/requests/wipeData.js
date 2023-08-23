import {Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import base64 from 'base-64';

export function wipeCompleteRequest(url, installationId, clientId, clientSecret, callback) {
    if (url && installationId) {
        let requestUrl = `${url}/devices/wipe-complete`

        let deviceInfoStringify = JSON.stringify({
            id: installationId,
            os: Platform.OS,
            manufacturer: DeviceInfo.getManufacturerSync().replace(/\u0022|\u0027|\u0060|\u00b4|\u2018|\u2019|\u201c|\u201d/g, `\'`),
            model: DeviceInfo.getModel().replace(/\u0022|\u0027|\u0060|\u00b4|\u2018|\u2019|\u201c|\u201d/g, `\'`),
            name: DeviceInfo.getDeviceNameSync().replace(/\u0022|\u0027|\u0060|\u00b4|\u2018|\u2019|\u201c|\u201d/g, `\'`)
        });

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
