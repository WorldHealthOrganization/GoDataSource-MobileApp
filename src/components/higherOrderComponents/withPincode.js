import React, {useState, useEffect, useRef} from 'react';
import {View, AppState} from 'react-native';
import PINCode, {deleteUserPinCode, resetPinCodeInternalStates} from '@haskkor/react-native-pincode';
import AsyncStorage from '@react-native-community/async-storage';
import {useDispatch} from 'react-redux';
import {logoutUser} from './../../actions/user';
import appConfig from './../../../app.config';
import {LoaderScreen} from 'react-native-ui-lib';
import {Navigation} from "react-native-navigation";
import styles from './../../styles';

export default function withPincode() {
    return function withPincodeFunction (WrappedComponent) {

        const WithPincode = React.memo((props) => {

            const NUMBER_OF_ATTEMPTS = 5;
            const DELAY_BETWEEN_ATTEMPTS = 500;
            const INACTIVE_TIMEOUT = 1000 * 20 * 60; // Wait for 20 mins of inactivity

            const [validPinCode, setValidPinCode] = useState(false);
            const [status, setStatus] = useState(null);
            const [retries, setRetries] = useState(NUMBER_OF_ATTEMPTS);
            const dispatch = useDispatch();
            const appStateStatus = useRef(AppState.currentState);
            const appStateStatusTimer = useRef(0);

            useEffect(() => {
                if (appConfig.env === 'development'){
                    setValidPinCode(true)
                } else {
                    checkFirstInstall()
                        .then((resp) => AsyncStorage.getItem('wasPinSet'))
                        .then((hasPin) => {
                            if (props.isAppInitialize) {
                                Navigation.mergeOptions(props.componentId, {
                                    sideMenu: {
                                        left: {
                                            visible: false,
                                        },
                                    },
                                });
                                // Navigation.setDrawerEnabled({
                                //     side: 'left',
                                //     enabled: false
                                // });
                                setStatus(hasPin ? 'enter' : 'choose');
                            } else {
                                setValidPinCode(true);
                            }

                            if (hasPin || props.isAppInitialize) {
                                AppState.addEventListener('change', handleAppStateChange);

                                // This is added because the event listener is added after the app changes state.
                                // The initialization from the top makes it 'background', and it would remain to background unless updated manually here
                                // Since this code is only ran at the first render, this should not cause any issues
                                appStateStatus.current = AppState.currentState;
                            }
                        });
                }

                return () => {
                    // console.log("withPincode component has unmounted somehow ", appStateStatus, appStateStatusTimer);
                    AppState.removeEventListener('change', handleAppStateChange);
                }
            }, []);

            const handleAppStateChange = (nextAppState) => {
                // console.log(`withPincode handleAppStateChange appStateStatus: ${appStateStatus.current} --- nextAppState: ${nextAppState}`);
                if (props && props.componentId) {
                    Navigation.mergeOptions(props.componentId, {
                        sideMenu: {
                            left: {
                                visible: false,
                            },
                        },
                    });
                }
                if (appStateStatus.current ==='active' && nextAppState.match(/inactive|background/)) {
                    // console.log("withPincode moving to background", appStateStatus, appStateStatusTimer);
                    appStateStatusTimer.current = new Date().getTime();
                }
                if (appStateStatus.current.match(/inactive|background/) && nextAppState === 'active') {
                    // console.log("withPincode coming from background", appStateStatus, appStateStatusTimer);
                    if (new Date().getTime() - appStateStatusTimer.current > INACTIVE_TIMEOUT) {
                        Navigation.mergeOptions(props.componentId, {
                            sideMenu: {
                                left: {
                                    visible: false,
                                },
                            },
                        });
                        // props.navigator.setDrawerEnabled({
                        //     side: 'left',
                        //     enabled: false
                        // });
                        setStatus('enter');
                        setValidPinCode(false);
                    }
                }

                appStateStatus.current = nextAppState;
            };

            const checkFirstInstall = async() => {
                try {
                    let wasPinSet = await AsyncStorage.getItem('wasPinSet');

                    if (!wasPinSet) {
                        let smth = await deleteUserPinCode();

                        return Promise.resolve('success');
                    } else {
                        return Promise.resolve('success');
                    }
                } catch (errorGetWasPinSet) {
                    // console.log("stuff: ", errorGetWasPinSet);
                    return Promise.reject(errorGetWasPinSet)
                }
            };

            const finishProcess = async (pin) => {
                try {
                    let wasPinSet = await AsyncStorage.getItem('wasPinSet');
                    if (!wasPinSet) {
                        let smth = await AsyncStorage.setItem('wasPinSet', 'true');
                    }
                } catch(wasPinSetError) {
                    console.log('wasPinSetError: ', wasPinSetError);
                }
                console.log("FINISH PROCESS?");
                Navigation.mergeOptions(props.componentId, {
                    sideMenu: {
                        left: {
                            visible: false,
                        },
                    },
                });
                // props.navigator.setDrawerEnabled({
                //     side: 'left',
                //     enabled: true
                // });
                setValidPinCode(true);
            };

            const onFail = async (failedAttempts) => {
                if (failedAttempts === NUMBER_OF_ATTEMPTS) {
                    setValidPinCode(true);
                    setRetries(NUMBER_OF_ATTEMPTS);
                    // Check if user is logged in first
                    try {
                        let userLogged = await AsyncStorage.getItem('loggedUser');
                        if (userLogged) {
                            // Handle logout
                            dispatch(logoutUser());
                        }
                        await resetPinCodeInternalStates();
                    } catch(errorGetLoggedUser) {
                        // console.log('errorGetLoggedUser: ', errorGetLoggedUser);
                        await resetPinCodeInternalStates();
                    }
                } else {
                    setRetries(retries - 1);
                }
            };

            const handleFailedAttempts = async () => {
                setValidPinCode(true);
                try {
                    let userLogged = await AsyncStorage.getItem('loggedUser');
                    if (userLogged) {
                        // Handle logout
                        dispatch(logoutUser());
                    }
                    await resetPinCodeInternalStates();
                } catch(errorGetLoggedUser) {
                    await resetPinCodeInternalStates();
                    setValidPinCode(true);
                }
            };

            const renderLockedPage = () => (
                <View>
                    <LoaderScreen
                        overlay={true}
                        loaderColor={styles.primaryColor}
                        backgroundColor={'rgba(255, 255, 255, 0.8)'}
                        message={"Loading..."}
                    />
                </View>
            ) ;

            return (
                <View style={{flex: 1}}>
                    {
                        validPinCode ? (
                            <WrappedComponent
                                {...props}
                            />
                        ) : (
                            <PINCode
                                status={status}
                                finishProcess={finishProcess}
                                subtitleChoose={"Go.Data requires a pin to protect the data of the people that are registered in the app"}
                                onClickButtonLockedPage={handleFailedAttempts}
                                textDescriptionLockedPage={"You've been logged out from Go.Data"}
                                textSubDescriptionLockedPage={"You can try logging in if you click Retry"}
                                textButtonLockedPage={"Retry"}
                                onFail={onFail}
                                maxAttempts={NUMBER_OF_ATTEMPTS}
                                delayBetweenAttempts={DELAY_BETWEEN_ATTEMPTS}
                                lockedPage={renderLockedPage}
                                subtitleEnter={`Retries: ${retries} \nYou will be logged out if failing all the retries`}
                            />
                        )
                    }
                </View>
            )
        });


        return WithPincode;
    }
}