/**
 * Created by florinpopa on 28/08/2018.
 */
/**
 * Created by florinpopa on 14/06/2018.
 */
import React, {Component} from 'react';
import {View, Text, StyleSheet, Platform, Image, Alert} from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import {Button, Icon} from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import styles from './../styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { loginUser } from './../actions/user';
import { removeErrors } from './../actions/errors';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import DropdownInput from './../components/DropdownInput';
import config from './../utils/config';
import url from './../utils/url';
import Ripple from 'react-native-material-ripple';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker';
import translations from './../utils/translations'
import {getTranslation} from './../utils/functions';

class FirstConfigScreen extends Component {

    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
        };
        // Bind here methods, or at least don't declare methods in the render method
    }

    // Please add here the react lifecycle methods that you need

    static getDerivedStateFromProps(props, state) {
        if (props.errors && props.errors.type && props.errors.message) {
            Alert.alert(props.errors.type, props.errors.message, [
                {
                    text: getTranslation(translations.alertMessages.okButtonLabel, null), 
                    onPress: () => {props.removeErrors()}
                }
            ])
        }
        return null;
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <KeyboardAwareScrollView
                style={[style.container, {paddingTop: Platform.OS === 'ios' ? this.props.screenSize.height === 812 ? 44 : 20 : 0}]}
                contentContainerStyle={style.contentContainerStyle}
                keyboardShouldPersistTaps={'always'}
            >
                {
                    this.props && this.props.allowBack ? (
                        <Ripple style={{position: "absolute", top: 20, left: 20}} onPress={this.handleOnPressBack}>
                            <Icon name="arrow-back"/>
                        </Ripple>
                    ) : (null)
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
                </View>
            </KeyboardAwareScrollView>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleOnPressBack = () => {
        this.props.navigator.dismissModal();
    };

    handlePressScanQR = () => {
        this.props.navigator.showModal({
            screen: 'QRScanScreen',
            animated: true,
            passProps: {
                pushNewScreen: this.pushNewScreen
            }
        })
    };

    handlePressImport = () => {
        Alert.alert("Warning", 'Work in progress', [
            {
                text: 'Ok', onPress: () => {console.log('Ok pressed')}
            }
        ])
    };

    handlePressManual = () => {
        console.log("Here change screen");
        this.props.navigator.push({
            screen: 'ManualConfigScreen',
            animated: true,
            animationType: 'fade'
        })
    };
    pushNewScreen = (QRCodeInfo) => {
        this.props.navigator.push({
            screen: 'ManualConfigScreen',
            animated: true,
            animationType: 'fade',
            passProps: {
                QRCodeInfo: QRCodeInfo
            }
        })
    }
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
        screenSize: state.app.screenSize,
        errors: state.errors,
    };
}

function matchDispatchToProps(dispatch) {
    return bindActionCreators({
        loginUser,
        removeErrors
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchToProps)(FirstConfigScreen);