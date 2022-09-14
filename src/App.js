import { Navigation} from 'react-native-navigation';
import {Provider} from 'react-redux';
import {applyMiddleware, createStore} from 'redux';
import {enableBatching} from 'redux-batched-actions';
import thunk from 'redux-thunk';
import promise from 'redux-promise';
import {DeviceEventEmitter, NativeEventEmitter, NativeModules, Platform} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import RNFetchBlobFS from 'rn-fetch-blob/fs';
import RNFS from 'react-native-fs';
import {getInternetCredentials, resetInternetCredentials} from 'react-native-keychain';
import {wipeCompleteRequest} from './requests/wipeData';
import appReducers from './reducers';
import appActions from './actions';
//here
import {registerScreens} from './screens';
import config, {sideMenuKeys} from './utils/config';
import {checkDeviceStatus} from "./requests/deviceStatus";
import isNumber from 'lodash/isNumber';
import constants from './utils/constants';
import {slideInAnimation, slideOutAnimation} from "./utils/animations";

console.disableYellowBox = true;

export const store = createStore(
  enableBatching(appReducers),
  applyMiddleware(thunk, promise)
);

registerScreens(store, Provider);




export default class App {

    constructor() {
        let ParseNativeModule = null;
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
            console.log('~~~ TODO WIPE onPushReceived ~~~', item);

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
    };

    onStoreUpdate = () => {
        const { root, selectedScreen } = store.getState().app;
        const oldRoot = this.currentRoot;
        console.log("Store has updated", root, oldRoot, selectedScreen);
        if (this.currentRoot !== root) {
            this.currentRoot = root;
            console.log("Register listener");
            // this.appLaunchedListener = Navigation.events().registerAppLaunchedListener(() => {
            //     console.log("app launched listener");
            //     // Each time the event is received you should call Navigation.setRoot
            //     this.startApp(root, oldRoot, selectedScreen);
            // });
            this.startApp(root, oldRoot, selectedScreen);
        }
    };

    startApp = (root, oldRoot, selectedScreens) => {
        let isAppInitialize = false;
        console.log('Update root start app: ', root, oldRoot);
        if (!oldRoot) {
            let ParseNativeModule;
            if (Platform.OS === 'ios') {
                ParseNativeModule = NativeModules.APNSEventEmitter
            } else {
                ParseNativeModule = NativeModules.ParseReceiver
            }
            console.log('~~~ Calling native module ready to start init parse ~~~');
            isAppInitialize = true;
            ParseNativeModule.initParse()
        }

        let screen;
        switch (selectedScreens) {
            case sideMenuKeys[1]:
                screen = constants.appScreens.contactsScreen;
                break;
            case sideMenuKeys[2]:
                screen = constants.appScreens.contactsOfContactsScreen;
                break;
            case sideMenuKeys[3]:
                screen = constants.appScreens.casesScreen;
                break;
            case sideMenuKeys[4]:
                screen = constants.appScreens.labResultsScreen;
                break;
            case sideMenuKeys[5]:
                screen = constants.appScreens.eventsScreen;
                break;
            default:
                screen = constants.appScreens.followUpScreen;
                break;
        }

        let componentObject = {
            passProps: {
                isAppInitialize: isAppInitialize
            },
            options:{
                sideMenu:{
                    left:{
                        visible: false
                    }
                }
            }
        };
        let rootObject = null;

        switch (root) {
            case 'config':
                componentObject = Object.assign({}, componentObject,
                    {
                            name: 'FirstConfigScreen'
                    });
                break;
            case 'login':
                componentObject = Object.assign({}, componentObject,
                    {
                            name: 'LoginScreen'
                    });
                break;
            case 'after-login':
                componentObject = {
                    name: screen,
                    options: {
                        sideMenu:{
                            left: {
                                name: 'NavigationDrawer',
                                visible: false
                            },
                        },
                        animations: {
                            push: slideInAnimation,
                            pop: slideOutAnimation
                        }
                    },
                    passProps: {
                        isAppInitialize: isAppInitialize
                    },
                    animationType: 'slide-down'
                };
                break;
            default:
                componentObject = Object.assign({}, componentObject,
                    {
                            name: 'FirstConfigScreen'
                    });
        }

        console.log("Nav set root", componentObject);
            rootObject = {
                root: {
                    stack: {
                        id: "CenterStack",
                        children: [{component: componentObject}],
                        options: {
                            layout: {
                                orientation: ['portrait']
                            },
                            topBar: {
                                visible: false,
                                drawBehind: true,
                                animate: false
                            }
                        }
                    }
                }
            }
            if(root === 'after-login'){
                rootObject = {
                    root: {
                        sideMenu:{
                            left:{
                                component:{
                                    name: 'NavigationDrawer',
                                    options:{
                                        animations: {
                                            push: slideInAnimation,
                                            pop: slideOutAnimation
                                        },
                                        sideMenu:{
                                            left:{
                                                visible: false
                                            }
                                        }
                                    }
                                }
                            },
                            center:{
                                stack: {
                                    id: "CenterStack",
                                    children: [{component: componentObject}],
                                    options: {
                                        layout: {
                                            orientation: ['portrait']
                                        },
                                        topBar: {
                                            visible: false,
                                            drawBehind: true,
                                            animate: false
                                        },
                                        sideMenu:{
                                            left:{
                                                visible: false
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }}
            }

        console.log("Root object", rootObject);
        Navigation.setRoot(rootObject)
            .then((onfulfilled)=>{
                console.log("On fulfilled", onfulfilled);
            },(onrejected)=>{
                console.log("On rejected", onrejected);
            })
            .catch((onreject2)=>{
                console.log("Catch onreject", onreject2);
            });
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
                                    } else {
                                        return callback();
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
                        let clearAsyncStorage = await AsyncStorage.multiRemove(['loggedUser', 'databases', 'activeDatabase', 'databaseVersioningToken']);
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
