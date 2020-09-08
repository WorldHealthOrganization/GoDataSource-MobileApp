import React, {useState, useEffect} from 'react';
import {View} from 'react-native';
import PINCode, {deleteUserPinCode, resetPinCodeInternalStates} from '@haskkor/react-native-pincode';
import AsyncStorage from '@react-native-community/async-storage';
import {useDispatch} from 'react-redux';
import {logoutUser} from './../../actions/user';
import appConfig from './../../../app.config';
import {LoaderScreen} from 'react-native-ui-lib';

export default function withPincode() {
    return function withPincodeFunction (WrappedComponent) {

        const WithPincode = React.memo((props) => {

            const NUMBER_OF_ATTEMPTS = 5;
            const DELAY_BETWEEN_ATTEMPTS = 500;

            const [validPinCode, setValidPinCode] = useState(false);
            const [status, setStatus] = useState(null);
            const [retries, setRetries] = useState(NUMBER_OF_ATTEMPTS);
            const dispatch = useDispatch();

            useEffect(() => {
                if (appConfig.env === 'development'){
                    setValidPinCode(true)
                } else {
                    checkFirstInstall()
                        .then((resp) => AsyncStorage.getItem('wasPinSet'))
                        .then((hasPin) => {
                            if (props.isAppInitialize) {
                                setStatus(hasPin ? 'enter' : 'choose');
                            } else {
                                setValidPinCode(true);
                            }
                        });
                }
            });

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
                    console.log("stuff: ", errorGetWasPinSet);
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
                console.log('test');
                setValidPinCode(true);
            };

            const onFail = async (failedAttempts) => {
                console.log('FailedAttempts: ', failedAttempts);
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
                        console.log('errorGetLoggedUser: ', errorGetLoggedUser);
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
                    console.log('UserLogged');
                    if (userLogged) {
                        // Handle logout
                        dispatch(logoutUser());
                    }
                    console.log('Time to reset shit');
                    await resetPinCodeInternalStates();
                } catch(errorGetLoggedUser) {
                    console.log('errorGetLoggedUser: ', errorGetLoggedUser);
                    await resetPinCodeInternalStates();
                    setValidPinCode(true);
                }
            };

            const renderLockedPage = () => (
                <View>
                    <LoaderScreen
                        overlay={true}
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

        WithPincode.navigatorStyle = {
            navBarHidden: true
        };

        return WithPincode;
    }
}