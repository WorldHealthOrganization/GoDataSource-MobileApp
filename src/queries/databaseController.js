import {Platform} from 'react-native';
import PouchDB from 'pouchdb-react-native';
import SQLite, {encodeName} from 'react-native-sqlcipher-2';
import SQLiteAdapterFactory from 'pouchdb-adapter-react-native-sqlite';
import RNFetchBlobFS from 'rn-fetch-blob/fs';
import PouchUpsert from 'pouchdb-upsert';
import PouchFind from 'pouchdb-find';
import RNFS from 'react-native-fs';

class DatabaseController {
    constructor(databaseName, databasePassword) {
        this.databaseName = databaseName;
        this.databasePassword = databasePassword;
    }
}

export default DatabaseController;