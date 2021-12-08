/**
 * Created by florinpopa on 14/06/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {Alert, Image, Platform, StyleSheet, Text, View} from 'react-native';
import {Button, Icon} from 'react-native-material-ui';
import {TextField} from 'react-native-material-textfield';
import styles from './../styles';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {cleanDataAfterLogout, loginUser} from './../actions/user';
import {removeErrors} from './../actions/errors';
import {changeAppRoot, setSyncState} from './../actions/app';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import {LoaderScreen} from 'react-native-ui-lib';
import Ripple from 'react-native-material-ripple';
import lodashGet from 'lodash/get';
import translations from './../utils/translations';
import config from './../utils/config';
import {getTranslation} from './../utils/functions';
import VersionNumber from 'react-native-version-number';
import appConfig from './../../app.config';
import withPincode from "../components/higherOrderComponents/withPincode";
import {compose} from "redux";
import {Navigation} from "react-native-navigation";

class LoginScreen extends Component {

    emailRef = React.createRef();
    passwordRef = React.createRef();

    constructor(props) {
        super(props);
        this.state = {
            email: appConfig.env === 'development' ? 'andrei.postelnicu@clarisoft.com' : '',
            password: appConfig.env === 'development' ? '123123123123' : '',
            hasAlert: false
        };
        // Bind here methods, or at least don't declare methods in the render method
        this.handleLogin = this.handleLogin.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);

    }

    // Please add here the react lifecycle methods that you need
    componentDidMount() {
        setTimeout(() => {
            console.log("Component LoginScreen mounted. Time to clean the redux mess");
            this.props.cleanDataAfterLogout();
        }, 500);
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        let showLoaderScreen = this.props.loginState && this.props.loginState !== 'Finished logging' && this.props.loginState !== 'Error';

        if (this.props.errors && this.props.errors.type && this.props.errors.message) {
            Alert.alert(this.props.errors.type, this.props.errors.message, [
                {
                    text: getTranslation(translations.alertMessages.okButtonLabel, null),
                    onPress: () => {
                        this.props.removeErrors();
                    }
                }
            ])
        }

        return (
            <KeyboardAwareScrollView
                style={[style.container, {paddingTop: Platform.OS === 'ios' ? this.props.screenSize.height === 812 ? 44 : 20 : 0}]}
                contentContainerStyle={style.contentContainerStyle}
                keyboardShouldPersistTaps={'always'}
            >
                {
                    showLoaderScreen ? (
                        <LoaderScreen overlay={true} backgroundColor={'white'} message={this.props && this.props.loginState ? this.props.loginState : 'Loading'} />
                    ) : (null)
                }
                <Ripple style={{flexDirection: 'row', alignItems: 'center', position: "absolute", top: 20, left: 20}} onPress={this.handleOnPressBack}>
                    <Icon name="arrow-back"/>
                    <Text style={{fontFamily: 'Roboto-Medium', fontSize: 18, color: 'white'}}>Hub configuration</Text>
                </Ripple>
                <View style={[style.welcomeTextContainer]}>
                    <Text style={style.welcomeText}>
                        {getTranslation(translations.loginScreen.welcomeMessage, this.props && this.props.translation ? this.props.translation : null)}
                    </Text>
                </View>
                <View style={style.inputsContainer}>
                    <TextField
                        ref={this.emailRef}
                        value={this.state.email}
                        autoCorrect={false}
                        keyboardType={'email-address'}
                        lineWidth={1}
                        enablesReturnKeyAutomatically={true}
                        containerStyle={style.textInput}
                        onChangeText={this.handleTextChange}
                        label={getTranslation(translations.loginScreen.emailLabel, this.props && this.props.translation ? this.props.translation : null)}
                        autoCapitalize={'none'}
                        tintColor={styles.colorTint}
                        baseColor={styles.colorBase}
                        textColor={styles.colorWhite}
                    />
                    <TextField
                        ref={this.passwordRef}
                        value={this.state.password}
                        autoCorrect={false}
                        lineWidth={1}
                        enablesReturnKeyAutomatically={true}
                        containerStyle={style.textInput}
                        onChangeText={this.handleTextChange}
                        label={getTranslation(translations.loginScreen.passwordLabel, this.props && this.props.translation ? this.props.translation : null)}
                        secureTextEntry={true}
                        autoCapitalize={'none'}
                        tintColor={styles.colorTint}
                        baseColor={styles.colorBase}
                        textColor={styles.colorWhite}
                    />
                    <Button onPress={this.handleLogin} text={getTranslation(translations.loginScreen.loginButtonLabel, this.props && this.props.translation ? this.props.translation : null)} style={styles.buttonLogin} height={35} />
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


    handleLogin = () => {
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!this.state.email || !this.state.password) {
            Alert.alert(getTranslation(translations.alertMessages.invalidCredentials, this.props && this.props.translation ? this.props.translation : null), getTranslation(translations.alertMessages.credentialsValidationError, this.props && this.props.translation ? this.props.translation : null), [
                {
                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props && this.props.translation ? this.props.translation : null),
                    onPress: () => {console.log('Ok pressed')}
                }
            ])
        } else {
            if (!re.test(this.state.email)) {
                Alert.alert(getTranslation(translations.alertMessages.invalidEmail, this.props && this.props.translation ? this.props.translation : null), getTranslation(translations.alertMessages.emailValidationError, this.props && this.props.translation ? this.props.translation : null), [
                    {
                        text: getTranslation(translations.alertMessages.okButtonLabel, this.props && this.props.translation ? this.props.translation : null),
                        onPress: () => {console.log('Ok pressed')}
                    }
                ])
            } else {
                this.props.loginUser({
                    email: this.state.email.toLowerCase(),
                    password: this.state.password
                });
            }
        }
    };

    handleTextChange = (text) => {
        ['email', 'password']
            .map((name) => ({ name, ref: this[`${name}Ref`] }))
            .forEach(({ name, ref }) => {
                if (ref.current && ref.current.isFocused()) {
                    this.setState({ [name]: text });
                }
            });
    };

    handleOnPressBack = () => {
        this.props.setSyncState(null);
        Navigation.setStackRoot(this.props.componentId,{
            component:{
                name: this.props.activeDatabase ? 'ManualConfigScreen' : 'FirstConfigScreen',
                passProps: {
                    allowBack: this.props.allowBack,
                    isMultipleHub: this.props.isMultipleHub
                }
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
    }
});

function mapStateToProps(state) {
    return {
        screenSize: lodashGet(state, 'app.screenSize', config.designScreenSize),
        errors: lodashGet(state, 'errors', null),
        loginState: lodashGet(state, 'app.loginState', null),
        activeDatabase: lodashGet(state, 'app.activeDatabase', null)
    };
}

function matchDispatchToProps(dispatch) {
    return bindActionCreators({
        loginUser,
        removeErrors,
        cleanDataAfterLogout,
        changeAppRoot,
        setSyncState
    }, dispatch);
}

// export default connect(mapStateToProps, matchDispatchToProps)(LoginScreen);
export default compose(
    withPincode(),
    connect(mapStateToProps, matchDispatchToProps),
)(LoginScreen)