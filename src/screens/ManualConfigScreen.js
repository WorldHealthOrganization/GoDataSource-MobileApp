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
import {Button} from 'react-native-material-ui';
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

class ManualConfigScreen extends Component {

    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
            url: '',
            clientId: '',
            clientSecret: ''
        };
        // Bind here methods, or at least don't declare methods in the render method
        this.urlRef = this.updateRef.bind(this, 'url');
        this.clientIDRef = this.updateRef.bind(this, 'clientId');
        this.clientSecretRef = this.updateRef.bind(this, 'clientSecret');
    }

    // Please add here the react lifecycle methods that you need

    static getDerivedStateFromProps(props, state) {
        if (props.errors && props.errors.type && props.errors.message) {
            Alert.alert(props.errors.type, props.errors.message, [
                {
                    text: 'Ok', onPress: () => {props.removeErrors()}
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
                <View style={[style.welcomeTextContainer]}>
                    <Text style={style.welcomeText}>HUB configuration</Text>
                </View>
                <View style={style.inputsContainer}>
                    <TextField
                        ref={this.urlRef}
                        value={this.state.url}
                        autoCorrect={false}
                        lineWidth={1}
                        enablesReturnKeyAutomatically={true}
                        containerStyle={style.textInput}
                        onChangeText={this.handleTextChange}
                        label='HUB URL'
                    />
                    <TextField
                        ref={this.clientIDRef}
                        value={this.state.clientId}
                        autoCorrect={false}
                        lineWidth={1}
                        enablesReturnKeyAutomatically={true}
                        containerStyle={style.textInput}
                        onChangeText={this.handleTextChange}
                        label='Client ID'
                    />
                    <TextField
                        ref={this.clientSecretRef}
                        value={this.state.clientSecret}
                        autoCorrect={false}
                        lineWidth={1}
                        enablesReturnKeyAutomatically={true}
                        containerStyle={style.textInput}
                        onChangeText={this.handleTextChange}
                        label='Client secret'
                        secureTextEntry={true}
                    />
                    <Button upperCase={false} raised onPress={this.saveHubConfiguration} text="Save HUB configuration" style={styles.buttonLogin} />
                </View>
                <View style={style.logoContainer}>
                    <Image source={{uri: 'logo_app'}} style={style.logoStyle} />
                </View>
                {
                    this.props && this.props.syncState && this.props.syncState !== 'Finished processing' ? (
                        <LoaderScreen message={this.props.syncState || ''} overlay />
                    ) : (
                        null
                    )
                }
            </KeyboardAwareScrollView>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    updateRef(name, ref) {
        this[name] = ref;
    }

    saveHubConfiguration = () => {
        if (!this.state.url || !this.state.clientId || !this.state.clientSecret) {
            Alert.alert("Alert", "Please make sure you have completed all the fields before moving forward", [
                {
                    text: 'Ok', onPress: () => {console.log('Ok pressed')}
                }
            ])
        } else {
            this.props.storeHubConfiguration({url: this.state.url, clientId: this.state.clientId, clientSecret: this.state.clientSecret});
        }
    };

    handleTextChange = (text) => {
        ['url', 'clientId', 'clientSecret']
            .map((name) => ({ name, ref: this[name] }))
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
        syncState: state.app.syncState
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