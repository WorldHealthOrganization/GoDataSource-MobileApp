/**
 * Created by florinpopa on 29/08/2018.
 */
import url from './../utils/url';
import {handleResponse} from './../utils/functions';
import RNFetchBlob from 'rn-fetch-blob';
import base64 from 'base-64';
import {createDatabase} from './../queries/database'

export function getDatabaseSnapshotRequest(hubConfig, lastSyncDate, callback) {

    let filter = {};

    if (lastSyncDate) {
        filter.where = {
            fromDate: lastSyncDate
        }
    }

    let requestUrl = url.getDatabaseSnapshotUrl() + (lastSyncDate ? ('?filter=' + JSON.stringify(filter)) : '');

    console.log('Request URL: ', requestUrl);

    let dirs = RNFetchBlob.fs.dirs.DocumentDir;

    console.log('Get database');

    RNFetchBlob.config({
        fileCache: true,
        appendExt: 'zip',
        path: dirs + '/database.zip'
    })
        .fetch('GET', requestUrl, {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Basic ' + base64.encode(`${hubConfig.clientId}:${hubConfig.clientSecret}`)
    }, '0', '20000')
        .then((res) => {
            let status = res.info().status;
            // After getting zip file from the server, unzip it and then proceed to the importing of the data to the SQLite database
            if(status === 200) {
                // After returning the database, return the path to it
                console.log("Got database");
                callback(null, (dirs + '/database.zip'))
            } else {
                callback('Status Code Error')
            }
        })
        .catch((errorMessage, statusCode) => {
            // error handling
            console.log("*** getDatabaseSnapshotRequest error: ", JSON.stringify(errorMessage));
            callback(errorMessage);
        });
}

export function postDatabaseSnapshotRequest(hubConfig, lastSyncDate, callback) {
    let filter = {};

    if (lastSyncDate) {
        filter.where = {
            fromDate: lastSyncDate
        }
    }

    let requestUrl = url.postDatabaseSnapshot() + (lastSyncDate ? ('?filter=' + JSON.stringify(filter)) : '');

    console.log('Request URL: ', requestUrl);

    let dirs = RNFetchBlob.fs.dirs.DocumentDir;

    console.log('Get database');

    RNFetchBlob.fetch('POST', requestUrl, {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
        'Authorization': 'Basic ' + base64.encode(`${hubConfig.clientId}:${hubConfig.clientSecret}`)
    }, [
        {name: 'test', filename: 'test'}
    ])
        .then((res) => {
            let status = res.info().status;
            // After getting zip file from the server, unzip it and then proceed to the importing of the data to the SQLite database
            if (status === 200) {
                // After returning the database, return the path to it
                console.log("Got database");
                callback(null, (dirs + '/database.zip'))
            } else {
                callback('Status Code Error')
            }
        })
        .catch((errorMessage, statusCode) => {
            // error handling
            console.log("*** getDatabaseSnapshotRequest error: ", JSON.stringify(errorMessage));
            callback(errorMessage);
        });
}