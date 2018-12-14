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
import config from './../utils/config';
import url from './../utils/url';
import {storeHubConfiguration} from './../actions/app';
import {LoaderScreen} from 'react-native-ui-lib';
import Ripple from 'react-native-material-ripple';
import {getTranslation, generateId} from './../utils/functions';
import translations from './../utils/translations'

class ManualConfigScreen extends Component {

    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
            name: '',
            url: '',
            clientId: '',
            clientSecret: ''
        };
        // Bind here methods, or at least don't declare methods in the render method
        this.nameRef = this.updateRef.bind(this, 'name');
        this.urlRef = this.updateRef.bind(this, 'url');
        this.clientIDRef = this.updateRef.bind(this, 'clientId');
        this.clientSecretRef = this.updateRef.bind(this, 'clientSecret');
    }

    // Please add here the react lifecycle methods that you need
    componentDidMount = () => {
        if (this.props && this.props.QRCodeInfo && this.props.QRCodeInfo.data) {
            //TO DO map this.props.QRCodeInfo info to props
            console.log('Here have the QRCodeInfo: ', JSON.parse(this.props.QRCodeInfo.data));
            let QRCodeData = JSON.parse(this.props.QRCodeInfo.data);
            this.setState({
                url: QRCodeData.url || '',
                clientId: QRCodeData.clientId || '',
                clientSecret: QRCodeData.clientSecret || ''
            })
        }
    };

    static getDerivedStateFromProps(props, state) {
        if (props.errors && props.errors.type && props.errors.message) {
            Alert.alert(props.errors.type, props.errors.message, [
                {
                    text: getTranslation(translations.alertMessages.okButtonLabel, null),
                    onPress: () => {props.removeErrors()}
                }
            ])
        }
        if (props.syncState && props.syncState === 'Finished processing') {
            props.navigator.push({
                screen: 'LoginScreen',
                animationType: 'fade',
                animated: true
            })
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

                <Ripple style={{position: "absolute", top: 20, left: 20}} onPress={this.handleOnPressBack}>
                    <Icon name="arrow-back"/>
                </Ripple>

                <View style={[style.welcomeTextContainer]}>
                    <Text style={style.welcomeText}>
                        {getTranslation(translations.manualConfigScreen.title, null)}
                    </Text>
                </View>
                <View style={style.inputsContainer}>
                    <TextField
                        ref={this.nameRef}
                        value={this.state.name}
                        autoCorrect={false}
                        lineWidth={1}
                        enablesReturnKeyAutomatically={true}
                        containerStyle={style.textInput}
                        onChangeText={this.handleTextChange}
                        label={getTranslation(translations.manualConfigScreen.nameLabel, this.props.translation)}
                        autoCapitalize={'none'}
                    />
                    <TextField
                        ref={this.urlRef}
                        value={this.state.url}
                        autoCorrect={false}
                        lineWidth={1}
                        enablesReturnKeyAutomatically={true}
                        containerStyle={style.textInput}
                        onChangeText={this.handleTextChange}
                        label={getTranslation(translations.manualConfigScreen.hubUrlLabel, null)}
                        autoCapitalize={'none'}
                    />
                    <TextField
                        ref={this.clientIDRef}
                        value={this.state.clientId}
                        autoCorrect={false}
                        lineWidth={1}
                        enablesReturnKeyAutomatically={true}
                        containerStyle={style.textInput}
                        onChangeText={this.handleTextChange}
                        label={getTranslation(translations.manualConfigScreen.clientIdLabel, null)}
                        autoCapitalize={'none'}
                    />
                    <TextField
                        ref={this.clientSecretRef}
                        value={this.state.clientSecret}
                        autoCorrect={false}
                        lineWidth={1}
                        enablesReturnKeyAutomatically={true}
                        containerStyle={style.textInput}
                        onChangeText={this.handleTextChange}
                        label={getTranslation(translations.manualConfigScreen.clientSecretPass, null)}
                        secureTextEntry={true}
                        autoCapitalize={'none'}
                    />
                    <Button upperCase={false} onPress={this.saveHubConfiguration} text={getTranslation(translations.manualConfigScreen.saveHubConfigButton, null)} style={styles.buttonLogin} />
                </View>
                <View style={style.logoContainer}>
                    <Image source={{uri: 'logo_app'}} style={style.logoStyle} />
                </View>
                {
                    this.props && this.props.syncState && (this.props.syncState !== 'Finished processing' && this.props.syncState !== 'Error') ? (
                        <LoaderScreen message={this.props.syncState || ''} overlay={true} backgroundColor={'white'} />
                    ) : (
                        null
                    )
                }
            </KeyboardAwareScrollView>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleOnPressBack = () => {
        this.props.navigator.pop();
    };

    updateRef(name, ref) {
        this[name] = ref;
    }

    saveHubConfiguration = () => {
        if (!this.state.name || !this.state.url || !this.state.clientId || !this.state.clientSecret) {
            Alert.alert("Alert", "Please make sure you have completed all the fields before moving forward", [
                {
                    text: 'Ok', onPress: () => {console.log('Ok pressed')}
                }
            ])
        } else {
            // First generate an id and a password for the hub
            let hubId = generateId();
            hubId = hubId.replace(/\/|\.|\:|\-/g, '');
            let hubPassword = generateId();
            hubPassword = hubPassword.replace(/\/|\.|\:|\-/g, '');
            let clientIdObject = {name: this.state.name, url: this.state.url, clientId: this.state.clientId, clientSecret: this.state.clientSecret};
            this.props.storeHubConfiguration({url: hubId, clientId: JSON.stringify(clientIdObject), clientSecret: hubPassword});
        }
    };

    handleTextChange = (text) => {
        ['name', 'url', 'clientId', 'clientSecret'].map((name) => ({ name, ref: this[name] }))
            .forEach(({ name, ref }) => {
                if (ref.isFocused()) {
                    this.setState({ [name]: text });
                }
            });
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
        fontSize: 25,
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
        screenSize: state.app.screenSize,
        errors: state.errors,
        syncState: state.app.syncState,
    };
}

function matchDispatchToProps(dispatch) {
    return bindActionCreators({
        loginUser,
        removeErrors,
        storeHubConfiguration
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchToProps)(ManualConfigScreen);