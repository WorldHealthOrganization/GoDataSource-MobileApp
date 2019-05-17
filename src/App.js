import { Navigation, NativeEventsReceiver } from 'react-native-navigation';
import {connect, Provider} from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import promise from 'redux-promise';
import { createLogger } from 'redux-logger';
import { Platform, DeviceEventEmitter, NativeEventEmitter, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import RNFetchBlobFS from 'rn-fetch-blob/fs';
import RNFS from 'react-native-fs';
import {getInternetCredentials} from 'react-native-keychain';
import {wipeCompleteRequest} from './requests/wipeData';
import appReducers from './reducers';
import appActions from './actions';
import {appInitialized} from './actions/app';
import { registerScreens } from './screens';
import config from './utils/config';
import Modal from 'react-native-root-modal';
import {resetInternetCredentials} from 'react-native-keychain';
import {checkDeviceStatus} from "./requests/deviceStatus";

console.disableYellowBox = true;

// const logger = createLogger();
export const store = createStore(appReducers, applyMiddleware(thunk, promise));

registerScreens(store, Provider);

export default class App {

    constructor() {
        let NativeModule = null;
        if (Platform.OS === 'ios') {
            ParseNativeModule = new NativeEventEmitter(NativeModules.APNSEventEmitter)
        } else {
            ParseNativeModule = DeviceEventEmitter;
        }
        ParseNativeModule.addListener('onParseInit', (item) => {
            console.log('~~~ TODO save installation Id onParseInit ~~~', item);
            AsyncStorage.setItem('installationId', item.installationId);
        });

        ParseNativeModule.addListener('onPushReceived', (item) => {
            console.log('~~~ TODO WIPE onPushReceived ~~~', item)

            //Request to server after finish wipe data
            AsyncStorage.getItem('installationId')
                .then((installationId) => {
                    console.log('Response installationId', installationId);
                    if (installationId) {
                        AsyncStorage.getItem('activeDatabase')
                            .then((activeDatabase) => {
                                console.log('Response activeDatabase', activeDatabase);
                                if (activeDatabase) {
                                    AsyncStorage.getItem(activeDatabase)
                                        .then((lastSyncDate) => {
                                            console.log('Response lastSyncDate: ', lastSyncDate);
                                            if (lastSyncDate) {
                                                lastSyncDate = new Date(lastSyncDate).toUTCString();
                                                getInternetCredentials(activeDatabase)
                                                    .then((activeDatabaseCredentials) => {
                                                        if (activeDatabaseCredentials) {
                                                            console.log('Response activeDatabaseCredentials ', activeDatabaseCredentials);
                                                            let currentHubConfig = JSON.parse(activeDatabaseCredentials.username);
                                                            if (currentHubConfig && currentHubConfig !== undefined && currentHubConfig.url && currentHubConfig.url !== undefined && currentHubConfig.url.trim().length > 0 && installationId && installationId !== undefined) {
                                                                // console.log ('configHubInfo', currentHubConfig)
                                                                // console.log ('installationId', installationId)
                                                                this.removeAllDatabases((errorWipe, success) => {
                                                                    if (errorWipe) {
                                                                        console.log('error at wiping data: ', errorWipe)
                                                                    }
                                                                    if (success) {
                                                                        wipeCompleteRequest(currentHubConfig.url, installationId, currentHubConfig.clientId, currentHubConfig.clientSecret, (error, response) => {
                                                                            if (error) {
                                                                                console.log('wipeCompleteRequest error: ', error)
                                                                            }
                                                                            if (response) {
                                                                                store.dispatch(appActions.saveActiveDatabase(null));
                                                                                store.dispatch(appActions.changeAppRoot('config'));
                                                                                store.dispatch(appActions.storeUser(null));
                                                                                store.dispatch(appActions.storeContacts(null));
                                                                                store.dispatch(appActions.storeFollowUps(null));
                                                                                store.dispatch(appActions.storeCases(null));
                                                                                store.dispatch(appActions.storeEvents(null));
                                                                                store.dispatch(appActions.storeOutbreak(null));
                                                                                store.dispatch(appActions.storeHelpCategory(null));
                                                                                store.dispatch(appActions.storeHelpItem(null));
                                                                                store.dispatch(appActions.storeClusters(null));
                                                                                store.dispatch(appActions.storePermissions(null));
                                                                            }
                                                                        })
                                                                    }
                                                                })
                                                            }
                                                        }
                                                    })
                                                    .catch((errorActiveDatabaseCredentials) => {
                                                        console.log('Error active database credentials: ', errorActiveDatabaseCredentials);
                                                    })
                                            }
                                        })
                                        .catch((errorLastSyncDate) => {
                                            console.log('Error while getting last sync date: ', errorLastSyncDate);
                                        })
                                }
                            })
                            .catch((errorActiveDatabase) => {
                                console.log("Error while getting active database: ", errorActiveDatabase);
                            });
                    }
                })
                .catch((errorInstallationId) => {
                    console.log('Error device id: ', errorInstallationId);
                })
        });

        store.subscribe(this.onStoreUpdate);
        console.log('Proceed to initialize the app');
        this.checkDevice(() => {
            store.dispatch(appActions.appInitialized(Platform.OS === 'ios' ? NativeModules.APNSEventEmitter : NativeModules.ParseReceiver));
        })
        // console.log('App loaded');
        // NativeModules.APNSEventEmitter.appLoaded();
    };

    onStoreUpdate = () => {
        const { root } = store.getState().app;
        const oldRoot = this.currentRoot;
        if (this.currentRoot !== root) {
            this.currentRoot = root;
            if (Platform.OS === 'ios') {
                this.startApp(root, oldRoot);
            } else {
                Navigation.isAppLaunched()
                    .then((appLaunched) => {
                        if (appLaunched) {
                            this.startApp(root, oldRoot);
                        }
                        new NativeEventsReceiver().appLaunched(this.startApp(root, oldRoot));
                    })
            }
        }
    };

    startApp = (root, oldRoot) => {
        if (!oldRoot) {
            if (Platform.OS === 'ios') {
                ParseNativeModule = NativeModules.APNSEventEmitter
            } else {
                ParseNativeModule = NativeModules.ParseReceiver
            }
            console.log('~~~ Calling native module ready to start init parse ~~~')
            ParseNativeModule.initParse()
        }
        switch (root) {
            case 'config':
                console.log("### config startApp");
                // this.unregister();
                Navigation.startSingleScreenApp({
                    screen: {
                        screen: 'FirstConfigScreen'
                    },
                    appStyle: {
                        orientation: 'portrait'
                    }
                });
                break;
            case 'login':
                console.log("### login startApp");
                // this.unregister();
                Navigation.startSingleScreenApp({
                    screen: {
                        screen: 'LoginScreen'
                    },
                    appStyle: {
                        orientation: 'portrait'
                    }
                });
                break;
            case 'after-login':
                Navigation.startSingleScreenApp({
                    screen: {
                        screen: 'FollowUpsScreen'
                    },
                    appStyle: {
                        orientation: 'portrait'
                    },
                    drawer: {
                        left: {
                            screen: 'NavigationDrawer'
                        },
                        style: {
                            drawerShadow: false,
                            contentOverlayColor: 'rgba(0,0,0,0.25)',
                        }
                    },
                    animationType: 'slide-down'
                });
                break;
            default:
                // this.unregister();
                Navigation.startSingleScreenApp({
                    screen: {
                        screen: 'FirstConfigScreen',
                    },
                    appStyle: {
                        orientation: 'portrait'
                    }
                });
        }
    };


    // Checks device status if exists, and if the status is pending wipe, removes everything
    checkDevice = async (callback) => {
        try {
            let installationId = await AsyncStorage.getItem('installationId');
            if (installationId) {
                try {
                    let activeDatabase = await AsyncStorage.getItem('activeDatabase');
                    if (activeDatabase) {
                        try {
                            let databaseCredentials = await getInternetCredentials(activeDatabase);
                            if (databaseCredentials) {
                                let serverData = JSON.parse(databaseCredentials.username);
                                checkDeviceStatus(serverData.url, installationId, serverData.clientId, serverData.clientSecret, (errorDeviceStatus, deviceStatus) => {
                                    if (errorDeviceStatus) {
                                        return callback();
                                    }
                                    if (deviceStatus) {
                                        if (deviceStatus === config.statusPendingWipe) {
                                            this.removeAllDatabases((errorWipe, success) => {
                                                if (errorWipe) {
                                                    return callback()
                                                } else {
                                                    wipeCompleteRequest(serverData.url, installationId, serverData.clientId, serverData.clientSecret, (errorCompletedWipe, successCompletedWipe) => {
                                                        return callback();
                                                    })
                                                }
                                            })
                                        } else {
                                            return callback();
                                        }
                                    }
                                })
                            } else {
                                return callback();
                            }
                        } catch(errorGetDatabaseCredentials) {
                            return callback();
                        }
                    } else {
                        return callback();
                    }
                } catch (errorGetActiveDatabase) {
                    return callback();
                }
            } else {
                return callback();
            }
        } catch (errorGetInstallationId) {
            console.log('checkDevice ErrorGetInstallationId: ', errorGetInstallationId);
            return callback();
        }
    };

    removeAllDatabases = async (callback) => {
        // Remove DocumentDirectory and LibraryDirectory
        // console.log('Path for debug purposes: ', RNFetchBlobFS.dirs.DocumentDir);


        // First clear the internet credentials
        try {
            let allDatabases = await AsyncStorage.getItem('databases');
            if (allDatabases) {
                allDatabases = JSON.parse(allDatabases);
                allDatabases = allDatabases.map((e) => {return e.id});
                try {
                    let deleteAllKeys = await AsyncStorage.multiRemove(allDatabases);
                    for (let i=0; i<allDatabases.length; i++) {
                        try {
                            let responseRemoveInternetCredentials = await resetInternetCredentials(allDatabases[i]);
                        } catch(removeInternetCredentialsError) {
                            console.log('removeInternetCredentialsError: ', removeInternetCredentialsError);
                            break;
                        }
                    }
                    // After removing the internet credentials delete everything from AsyncStorage
                    try {
                        let clearAsyncStorage = await AsyncStorage.multiRemove(['loggedUser', 'databases', 'activeDatabase']);
                        // Proceed to removing the databases. For this take into consideration the differences between the two platforms

                        try {
                            let libraryFiles = await RNFetchBlobFS.ls(Platform.OS === 'ios' ? `${RNFS.LibraryDirectoryPath}/NoCloud` : `${RNFetchBlobFS.dirs.DocumentDir}`);
                            if (libraryFiles && Array.isArray(libraryFiles) && libraryFiles.length > 0) {
                                for (let i = 0; i < libraryFiles.length; i++) {
                                    try {
                                        console.log('Trying to delete file: ', libraryFiles[i]);
                                        let deletedFile = await RNFetchBlobFS.unlink(`${RNFetchBlobFS.dirs.DocumentDir}/${libraryFiles[i]}`)
                                    } catch (errorUnlinkDocumentDir) {
                                        console.log('ErrorUnlinkDocumentDir: ', errorUnlinkDocumentDir);
                                        return callback(errorUnlinkDocumentDir);
                                    }
                                }
                                callback(null, 'success');
                            }
                        } catch (errorLsLibraryDir) {
                            console.log('ErrorLsDocumentDir: ', errorLsLibraryDir);
                            return callback(errorLsLibraryDir);
                        }
                    } catch (errorClearAsyncStorage) {
                        console.log('ErrorClearAsyncStorage: ', errorClearAsyncStorage);
                        // Proceed to removing the databases. For this take into consideration the differences between the two platforms
                        try {
                            let libraryFiles = await RNFetchBlobFS.ls(Platform.OS === 'ios' ? `${RNFS.LibraryDirectoryPath}/NoCloud` : `${RNFetchBlobFS.dirs.DocumentDir}`);
                            if (libraryFiles && Array.isArray(libraryFiles) && libraryFiles.length > 0) {
                                for (let i = 0; i < libraryFiles.length; i++) {
                                    try {
                                        console.log('Trying to delete file: ', libraryFiles[i]);
                                        let deletedFile = await RNFetchBlobFS.unlink(`${RNFetchBlobFS.dirs.DocumentDir}/${libraryFiles[i]}`)
                                    } catch (errorUnlinkDocumentDir) {
                                        console.log('ErrorUnlinkDocumentDir: ', errorUnlinkDocumentDir);
                                        return callback(errorUnlinkDocumentDir);
                                    }
                                }
                                callback(null, 'success');
                            }
                        } catch (errorLsLibraryDir) {
                            console.log('ErrorLsDocumentDir: ', errorLsLibraryDir);
                            return callback(errorLsLibraryDir);
                        }
                    }
                } catch(deleteAllLastSyncDates) {
                    console.log('Error while removing last sync dates: ', deleteAllLastSyncDates)
                }
            } else {
                console.log('No hubs found');
                callback('No hubs found');
            }
        } catch (getAllHubsError) {
            console.log('Get All hubs error: ', getAllHubsError);
            callback(getAllHubsError);
        }
    }
}
