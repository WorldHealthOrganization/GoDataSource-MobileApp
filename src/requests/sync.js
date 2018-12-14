/**
 * Created by florinpopa on 29/08/2018.
 */
import url from './../utils/url';
import RNFetchBlob from 'rn-fetch-blob';
import base64 from 'base-64';
import {Platform} from 'react-native';

export function getDatabaseSnapshotRequest(hubConfig, lastSyncDate, callback) {

    // hubConfiguration = {url: databaseName, clientId: JSON.stringify({name, url, clientId, clientSecret}), clientSecret: databasePass}
    let hubConfiguration = JSON.parse(hubConfig.clientId);

    let filter = {};

    if (lastSyncDate) {
        filter.where = {
            fromDate: new Date(lastSyncDate)
        }
    }

    let requestUrl = hubConfiguration.url + '/sync/database-snapshot' + (lastSyncDate ? ('?filter=' + JSON.stringify(filter)) : '');

    console.log('Request URL: ', requestUrl);

    let dirs = RNFetchBlob.fs.dirs.DocumentDir;

    console.log('Get database');

    RNFetchBlob.config({
        fileCache: true,
        appendExt: 'zip',
        path: dirs + '/database.zip'
    })
        .fetch('GET', encodeURI(requestUrl), {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Basic ' + base64.encode(`${hubConfiguration.clientId}:${hubConfiguration.clientSecret}`)
    }, '0', '20000')
        .progress({count: 1}, (received, total) => {
            console.log(received, total)
        })
        .then((res) => {
            let status = res.info().status;
            let info = res.info();
            // After getting zip file from the server, unzip it and then proceed to the importing of the data to the SQLite database
            if(status === 200) {
                // After returning the database, return the path to it
                console.log("Got database");
                callback(null, (dirs + '/database.zip'));
            } else {
                callback(`Status Code Error: ${status}. Please make sure you entered the correct data`);
            }
        })
        .catch((errorMessage, statusCode) => {
            // error handling
            console.log("*** getDatabaseSnapshotRequest error: ", JSON.stringify(errorMessage));
            callback(errorMessage.message);
        });
}

export function postDatabaseSnapshotRequest(internetCredentials, path, callback) {
    // internetCredentials = {server: databaseName, username: JSON.stringify({name, url, clientId, clientSecret}), password: databasePass}
    let hubConfig = JSON.parse(internetCredentials.username);
    let requestUrl = hubConfig.url + '/sync/import-database-snapshot';
    // let requestUrl = url.postDatabaseSnapshot();

    console.log('Request URL:' + requestUrl);

    console.log('Send database to server');

    RNFetchBlob.fetch('POST', requestUrl, {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
        'Authorization': 'Basic ' + base64.encode(`${hubConfig.clientId}:${hubConfig.clientSecret}`)
    }, [
        {name: 'snapshot', filename: 'snapshot', data: RNFetchBlob.wrap(path)}
    ])
        .then((res) => {
            console.log('Finished sending the data to the server: ', res);
            let status = res.info().status;
            if(status === 200) {
            //     console.log("Got database");
                callback(null, 'Finished sending data to the server')
            } else {
                callback(res, 'Finished sending data to the server');
            }
        })
        .catch((errorMessage, statusCode) => {
            // error handling
            console.log("*** postDatabaseSnapshotRequest error: ", JSON.stringify(errorMessage));
            callback(errorMessage);
        });
}