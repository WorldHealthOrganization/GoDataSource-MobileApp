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
import DropdownInput from './../components/DropdownInput';
import config from './../utils/config';
import url from './../utils/url';

class LoginScreen extends Component {

    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            url: config.baseUrls[0].value
        };
        // Bind here methods, or at least don't declare methods in the render method
        this.handleLogin = this.handleLogin.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);

        this.emailRef = this.updateRef.bind(this, 'email');
        this.passwordRef = this.updateRef.bind(this, 'password');
        this.urlRef = this.updateRef.bind(this, 'url');
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
        return null;
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <KeyboardAwareScrollView
                style={[style.container, {paddingTop: Platform.OS ? this.props.screenSize.height === 812 ? 44 : 20 : 0}]}
                contentContainerStyle={style.contentContainerStyle}
                keyboardShouldPersistTaps={'always'}
            >
                <View style={[style.welcomeTextContainer]}>
                    <Text style={style.welcomeText}>Welcome!</Text>
                </View>
                <View style={style.inputsContainer}>
                    {/*<DropdownInput*/}
                        {/*id="baseUrl"*/}
                        {/*label="Select URL"*/}
                        {/*value={this.state.url}*/}
                        {/*data={config.baseUrls}*/}
                        {/*isEditMode={true}*/}
                        {/*isRequired={false}*/}
                        {/*onChange={this.handleChangeUrl}*/}
                    {/*/>*/}
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                        <Text style={{alignSelf: 'flex-end', marginBottom: 20, fontFamily: 'Roboto-Medium', fontSize: 15}}>http://</Text>
                        <TextField
                            ref={this.urlRef}
                            value={this.state.url}
                            autoCorrect={false}
                            lineWidth={1}
                            enablesReturnKeyAutomatically={true}
                            containerStyle={[style.textInput, {width: '65%'}]}
                            onChangeText={this.handleTextChange}
                            label='URL'
                        />
                        <Text style={{alignSelf: 'flex-end', marginBottom: 20, fontFamily: 'Roboto-Medium', fontSize: 15}}>/api</Text>
                    </View>
                    <TextField
                        ref={this.emailRef}
                        value={this.state.email}
                        autoCorrect={false}
                        lineWidth={1}
                        enablesReturnKeyAutomatically={true}
                        containerStyle={style.textInput}
                        onChangeText={this.handleTextChange}
                        label='Email address'
                    />
                    <TextField
                        ref={this.passwordRef}
                        value={this.state.password}
                        autoCorrect={false}
                        lineWidth={1}
                        enablesReturnKeyAutomatically={true}
                        containerStyle={style.textInput}
                        onChangeText={this.handleTextChange}
                        label='Password'
                        secureTextEntry={true}
                    />
                    <Button raised onPress={this.handleLogin} text="Login" style={styles.buttonLogin} />
                </View>
                <View style={style.logoContainer}>
                    <Image source={{uri: 'logo_app'}} style={style.logoStyle} />
                </View>
            </KeyboardAwareScrollView>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    updateRef(name, ref) {
        this[name] = ref;
    }

    handleLogin = () => {
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!this.state.email || !this.state.password) {
            Alert.alert('Invalid credentials', "Please make sure you have completed the fields", [
                {
                    text: 'Ok', onPress: () => {console.log('Ok pressed')}
                }
            ])
        } else {
            if (!re.test(this.state.email)) {
                Alert.alert('Invalid email', "Please make sure you have entered a valid email address", [
                    {
                        text: 'Ok', onPress: () => {console.log('Ok pressed')}
                    }
                ])
            } else {
                let urlNew = this.state.url;
                if (!urlNew.includes('http://')) {
                    urlNew = 'http://' + urlNew;
                }
                if (!urlNew.includes('/api')) {
                    urlNew += '/api';
                }
                url.setBaseUrl(urlNew);

                this.props.loginUser({
                    email: this.state.email.toLowerCase(),
                    password: this.state.password
                });
            }
        }
    };

    handleTextChange = (text) => {
        ['email', 'password', 'url']
            .map((name) => ({ name, ref: this[name] }))
            .forEach(({ name, ref }) => {
                if (ref.isFocused()) {
                    this.setState({ [name]: text });
                }
            });
    };

    handleChangeUrl = (value) => {
        url.setBaseUrl(value);
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
        screenSize: state.app.screenSize,
        errors: state.errors
    };
}

function matchDispatchToProps(dispatch) {
    return bindActionCreators({
        loginUser,
        removeErrors
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchToProps)(LoginScreen);