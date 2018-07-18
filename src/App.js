import { Navigation } from 'react-native-navigation';
import {connect, Provider} from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import promise from 'redux-promise';
import { createLogger } from 'redux-logger';
import { Platform } from 'react-native';

import appReducers from './reducers';
import appActions from './actions';
import {appInitialized} from './actions/app';
import { registerScreens } from './screens';
import config from './utils/config';
import Modal from 'react-native-root-modal';

console.disableYellowBox = true;

const logger = createLogger();
export const store = createStore(appReducers, applyMiddleware(thunk, promise, logger));

registerScreens(store, Provider);

export default class App {

    constructor() {
        store.subscribe(this.onStoreUpdate);
        store.dispatch(appActions.appInitialized());
    };

    onStoreUpdate = () => {
        const { root } = store.getState().app;

        if (this.currentRoot !== root) {
            this.currentRoot = root;
            this.startApp(root);
        }
    };

    startApp = (root) => {
        switch (root) {
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
                            screen: 'NavigationDrawer',
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
                        screen: 'LoginScreen',
                    },
                    appStyle: {
                        orientation: 'portrait'
                    }
                });
        }
    };
}
