/**
 * Created by florinpopa on 28/08/2018.
 */
/**
 * Created by florinpopa on 14/06/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {Alert, Image, Platform, StyleSheet, Text, View} from 'react-native';
import {Button, Icon} from 'react-native-material-ui';
import styles from './../styles';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {loginUser} from './../actions/user';
import { setSyncState } from './../actions/app';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Ripple from 'react-native-material-ripple';
import lodashGet from 'lodash/get';
import translations from './../utils/translations';
import config from './../utils/config';
import {createStackFromComponent, getTranslation} from './../utils/functions';
import VersionNumber from 'react-native-version-number';
import withPincode from "../components/higherOrderComponents/withPincode";
import {compose} from "redux";
import {Navigation} from "react-native-navigation";
import {fadeInAnimation, fadeOutAnimation} from "../utils/animations";

class FirstConfigScreen extends Component {

    constructor(props) {
        console.log("Constructor");
        super(props);
        this.state = {
        };
        // Bind here methods, or at least don't declare methods in the render method
    }
    componentDidMount() {
        console.log("Comp did mount")
    }

    // Please add here the react lifecycle methods that you need

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        console.log("Rendering first config screen");
        return (
            <KeyboardAwareScrollView
                style={[style.container, {paddingTop: Platform.OS === 'ios' ? this.props.screenSize.height === 812 ? 44 : 20 : 0}]}
                contentContainerStyle={style.contentContainerStyle}
                keyboardShouldPersistTaps={'always'}
            >
                {
                    this.props && this.props.allowBack ? (
                        <Ripple style={{flexDirection: 'row', position: "absolute", top: 20, left: 20}} onPress={this.handleOnPressBack}>
                            <Icon name="arrow-back"/>
                            <Text style={{fontFamily: 'Roboto-Medium', fontSize: 18, color: 'white'}}>Hub config</Text>
                        </Ripple>
                    ) : (<View/>)
                }
                {
                    this.props && this.props.activeDatabase && !this.props.skipEdit ? (
                        <Ripple style={{flexDirection: 'row', alignItems: 'center', position: "absolute", top: 20, right: 20}} onPress={this.handleOnPressForward}>
                            <Text style={{fontFamily: 'Roboto-Medium', fontSize: 18, color: 'white'}}>Current Hub config</Text>
                            <Icon name="arrow-forward"/>
                        </Ripple>
                    ) : (<View/>)
                }
                <View style={[style.welcomeTextContainer]}>
                    <Text style={style.welcomeText}>
                        {getTranslation(translations.firstConfigScreen.welcomeMessage, null)}
                    </Text>
                </View>
                <View style={style.inputsContainer}>
                    <Text style={style.text}>
                        {getTranslation(translations.firstConfigScreen.infoMessage, null)}
                    </Text>
                    <Button onPress={this.handlePressScanQR} upperCase={false} icon="photo-camera" raised text={getTranslation(translations.firstConfigScreen.qrScanButton, null)} style={styles.buttonLogin} />
                    {/*<Button onPress={this.handlePressImport} upperCase={false} icon={<MaterialCommunityIcons size={24} name="download" />} raised text="Import config file" style={styles.buttonLogin} />*/}
                    <Button onPress={this.handlePressManual} upperCase={false} icon="short-text" raised text={getTranslation(translations.firstConfigScreen.manualConfigButton, null)} style={styles.buttonLogin} />
                </View>
                <View style={style.logoContainer}>
                    <Image source={{uri: 'logo_app'}} style={style.logoStyle} />
                    <Text
                        style={{
                            color: 'white',
                            fontFamily: 'Roboto-Medium',
                            fontSize: 14
                        }}
                    >
                        {`Version: ${VersionNumber.appVersion} - build ${VersionNumber.buildVersion}`}
                    </Text>
                </View>
            </KeyboardAwareScrollView>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleOnPressBack = () => {
        Navigation.pop(this.props.componentId)
            .catch(reason => {

            })
    };

    handleOnPressForward = () => {
        Navigation.push(this.props.componentId,{
            component:{
                name: 'ManualConfigScreen',
                passProps: {
                    allowBack: this.props.allowBack,
                    isMultipleHub: this.props.isMultipleHub
                }
            }
        })
    };

    handlePressScanQR = () => {
        console.log("Press scan QR", this.props.allowBack, this.props.isMultipleHub);
        Navigation.showModal(createStackFromComponent({
            name: 'QRScanScreen',
            passProps: {
                pushNewScreen: this.pushNewScreen,
                allowBack: this.props.allowBack,
                isMultipleHub: this.props.isMultipleHub
            }
        }))
    };

    handlePressImport = () => {
        Alert.alert("Warning", 'Work in progress', [
            {
                text: 'Ok', onPress: () => {console.log('Ok pressed')}
            }
        ])
    };

    handlePressManual = () => {
        console.log("Here change screen", this.props.componentId, this.props.navigator);
        Navigation.push(this.props.componentId, {
            component:{
                name: 'ManualConfigScreen',
                // animated: true,
                // animationType: 'fade',
                passProps: {
                    isNewHub: true,
                    allowBack: this.props.allowBack,
                    isMultipleHub: this.props.isMultipleHub
                }
            }
        }).then((res)=>{console.log("navpush res", res)})
            .catch((err)=>{console.log("catch error", err)});
    };

    pushNewScreen = (QRCodeInfo, allowBack, skipEdit, isMultipleHub) => {
        console.log('PushNewScreen: ', QRCodeInfo);
        if (QRCodeInfo && QRCodeInfo.data) {
            try {
                let QRCodeInfoData = JSON.parse(QRCodeInfo.data);
                if (QRCodeInfoData && QRCodeInfoData.url && QRCodeInfoData.clientId && QRCodeInfoData.clientSecret) {
                    // this.props.navigator.dismissAllModals();
                    this.props.setSyncState(null);
                    setTimeout(() => {
                        Navigation.push(this.props.componentId,{
                            component:{
                                name: 'ManualConfigScreen',
                                options:{
                                    animations:{
                                        push:fadeInAnimation,
                                        pop:fadeOutAnimation
                                    }
                                },
                                passProps: {
                                    QRCodeInfo: QRCodeInfo,
                                    allowBack: allowBack,
                                    isNewHub: true,
                                    skipEdit: skipEdit,
                                    isMultipleHub: isMultipleHub
                                }
                            }

                        })
                    }, 250);
                } else {
                    Alert.alert('QR Code Error', 'The QR code scan failed to find a code. Please try again or add the credentials manually', [
                        {
                            text: 'Ok', onPress: () => {console.log('Ok pressed')}
                        }
                    ])
                }
            } catch (errorParse) {
                Alert.alert('QR Code Error', 'The QR code scan failed to find a code. Please try again or add the credentials manually', [
                    {
                        text: 'Ok', onPress: () => {console.log('Ok pressed')}
                    }
                ])
            }
        } else {
            Alert.alert('QR Code Error', 'The QR code scan failed to find a code. Please try again or add the credentials manually', [
                {
                    text: 'Ok', onPress: () => {console.log('Ok pressed')}
                }
            ])
        }
    };
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#55b5a6'
    },
    contentContainerStyle: {
        justifyContent: 'space-around',
        alignItems: 'center',
        flexGrow: 1
    },
    textInput: {
        width: '100%',
        alignSelf: 'center'
    },
    welcomeTextContainer: {
        flex: 0.35,
        width: '75%',
        justifyContent: 'center'
    },
    welcomeText: {
        fontFamily: 'Roboto-Bold',
        fontSize: 35,
        color: 'white',
        textAlign: 'left'
    },
    inputsContainer: {
        flex: 0.15,
        width: '75%',
        justifyContent: 'space-around',
    },
    logoContainer: {
        flex: 0.5,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    logoStyle: {
        width: 180,
        height: 34
    },
    text: {
        fontFamily: 'Roboto-Light',
        fontSize: 16,
        color: 'white'
    }
});

function mapStateToProps(state) {
    return {
        screenSize: lodashGet(state, 'app.screenSize', config.designScreenSize),
        activeDatabase: lodashGet(state, 'app.activeDatabase', null)
    };
}

function matchDispatchToProps(dispatch) {
    return bindActionCreators({
        loginUser,
        setSyncState
    }, dispatch);
}

// export default connect(mapStateToProps, matchDispatchToProps)(FirstConfigScreen);
export default compose(
    withPincode(),
    connect(mapStateToProps, matchDispatchToProps),
)(FirstConfigScreen)