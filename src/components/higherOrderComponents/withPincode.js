import React, {useState, useEffect} from 'react';
import {View} from 'react-native';
import PINCode, {deleteUserPinCode, resetPinCodeInternalStates} from '@haskkor/react-native-pincode';
import AsyncStorage from '@react-native-community/async-storage';
import {useDispatch} from 'react-redux';
import {logoutUser} from './../../actions/user';
import appConfig from './../../../app.config';

export default function withPincode() {
    return function withPincodeFunction (WrappedComponent) {

        const WithPincode = React.memo((props) => {

            const [validPinCode, setValidPinCode] = useState(false);
            const [status, setStatus] = useState(null);
            const dispatch = useDispatch();
            const NUMBER_OF_ATTEMPTS = 2;

            useEffect(() => {
                if (appConfig.env === 'developmen'){
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
                    // Handle logout
                    dispatch(logoutUser());
                    await resetPinCodeInternalStates();
                }
            };

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
                                // onClickButtonLockedPage={handleFailedAttempts}
                                // timeLocked={30000}
                                textDescriptionLockedPage={"You've been logged out from Go.Data"}
                                textSubDescriptionLockedPage={"You can try logging in if you click Retry"}
                                textButtonLockedPage={"Retry"}
                                onFail={onFail}
                                maxAttempts={NUMBER_OF_ATTEMPTS}
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