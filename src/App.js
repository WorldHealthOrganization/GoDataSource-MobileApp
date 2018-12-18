import { Navigation, NativeEventsReceiver } from 'react-native-navigation';
import {connect, Provider} from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import promise from 'redux-promise';
import { createLogger } from 'redux-logger';
import { Platform, DeviceEventEmitter, NativeEventEmitter, NativeModules } from 'react-native';

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
        let ParseNativeModule = null
        if (Platform.OS === 'ios') {
            ParseNativeModule = new NativeEventEmitter(NativeModules.APNSEventEmitter)
        } else {
            ParseNativeModule = DeviceEventEmitter
        }
        ParseNativeModule.addListener('onParseInit', (item) => {
            console.log('~~~ TODO save installation Id onParseInit ~~~', item)
        })
        ParseNativeModule.addListener('onPushReceived', (item) => {
            console.log('~~~ TODO WIPE onPushReceived ~~~', item)
        })

        store.subscribe(this.onStoreUpdate);
        store.dispatch(appActions.appInitialized());
    };

    onStoreUpdate = () => {
        const { root } = store.getState().app;
        const oldRoot = this.currentRoot
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
                ParseNativeModule = NativeModules.APNSEventEmitter
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
}
