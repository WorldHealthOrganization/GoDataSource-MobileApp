import { Navigation, NativeEventsReceiver } from 'react-native-navigation';
import {connect, Provider} from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import promise from 'redux-promise';
import { createLogger } from 'redux-logger';
import { Platform, DeviceEventEmitter, NativeEventEmitter, NativeModules, AsyncStorage } from 'react-native';
import RNFetchBlobFS from 'rn-fetch-blob/fs';
import RNFS from 'react-native-fs';
import {getInternetCredentials} from 'react-native-keychain';
import {wipeCompleteRequest} from './requests/wipeData'

import appReducers from './reducers';
import appActions from './actions';
import {appInitialized} from './actions/app';
import { registerScreens } from './screens';
import config from './utils/config';
import Modal from 'react-native-root-modal';

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
            ParseNativeModule = DeviceEventEmitter
        }
        ParseNativeModule.addListener('onParseInit', (item) => {
            console.log('~~~ TODO save installation Id onParseInit ~~~', item.toString())
            AsyncStorage.setItem('installationId', item.installationId);
        })

        ParseNativeModule.addListener('onPushReceived', (item) => {
            console.log('~~~ TODO WIPE onPushReceived ~~~', item)

            //Request to server after finish wipe data
            this.removeAllDatabases((errorWipe, success) => {
                if (errorWipe) {
                    console.log('error at wiping data: ', errorWipe)
                }
                if (success) {
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

                                                                        wipeCompleteRequest(currentHubConfig.url, installationId, currentHubConfig.clientId, currentHubConfig.clientSecret, (error, response) => {
                                                                            if (error) {
                                                                                console.log ('wipeCompleteRequest error: ', error)
                                                                            }
                                                                            if (response) {
                                                                                this.startApp('config');
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
                }
            })
        })

        store.subscribe(this.onStoreUpdate);
        store.dispatch(appActions.appInitialized());
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

    removeAllDatabases = (callback) => {
        // Remove DocumentDirectory and LibraryDirectory
        // console.log('Path for debug purposes: ', RNFetchBlobFS.dirs.DocumentDir);

        RNFetchBlobFS.unlink(RNFetchBlobFS.dirs.DocumentDir)
            .then(() => {
                console.log('Document Directory Delete Successful');
                // If the platform is IOS, delete also the Library folder
                if (Platform.OS === 'ios') {
                    RNFetchBlobFS.unlink(RNFS.LibraryDirectoryPath)
                        .then(() => {
                            console.log('Library Directory Delete Successful');
                            // If the platform is IOS, delete also the Library folder
                            callback(null, 'success');
                        })
                        .catch((errorDeleteLibraryDirectory) => {
                            console.log('Error delete library directory: ', errorDeleteLibraryDirectory);
                            callback(errorDeleteLibraryDirectory)
                        })
                } else {
                    callback(null, 'success');
                }
            })
            .catch((errorDeleteDocumentDirectory) => {
                console.log('Error delete document directory: ', errorDeleteDocumentDirectory);
                callback(errorDeleteDocumentDirectory);
            })
    }
}
