/**
 * Created by florinpopa on 14/06/2018.
 */
import React, {Component} from 'react';
import {View, Text, StyleSheet, Platform, Image, Alert, TouchableOpacity} from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import {Button, Icon} from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import styles from './../styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { loginUser, cleanDataAfterLogout } from './../actions/user';
import { removeErrors } from './../actions/errors';
import {changeAppRoot, setSyncState} from './../actions/app';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import url from './../utils/url';
import {LoaderScreen} from 'react-native-ui-lib';
import Ripple from 'react-native-material-ripple';

class LoginScreen extends Component {

    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            // url: config.baseUrls[0].value,
            showLoading: false
        };
        // Bind here methods, or at least don't declare methods in the render method
        this.handleLogin = this.handleLogin.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);

        this.emailRef = this.updateRef.bind(this, 'email');
        this.passwordRef = this.updateRef.bind(this, 'password');
        // this.urlRef = this.updateRef.bind(this, 'url');
    }

    // Please add here the react lifecycle methods that you need
    componentDidMount() {
        // createDatabase('testDatabase', 'testPassword', (database) => {
        //     if (database) {
                setTimeout(() => {
                    console.log("Component LoginScreen mounted. Time to clean the redux mess");
                    this.props.cleanDataAfterLogout();
                }, 500);
        //     }
        // })
    }

    static getDerivedStateFromProps(props, state) {
        if (props.errors && props.errors.type && props.errors.message) {
            Alert.alert(props.errors.type, props.errors.message, [
                {
                    text: 'Ok', onPress: () => {props.removeErrors()}
                }
            ])
        }
        if (props.loginState && (props.loginState === 'Finished logging' || props.loginState === 'Error')) {
            // props.changeAppRoot('after-login');
            state.showLoading = false;
        }
        return null;
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        console.log('Render method of LoginScreen');
        return (
            <KeyboardAwareScrollView
                style={[style.container, {paddingTop: Platform.OS === 'ios' ? this.props.screenSize.height === 812 ? 44 : 20 : 0}]}
                contentContainerStyle={style.contentContainerStyle}
                keyboardShouldPersistTaps={'always'}
            >
                {
                    this.state && this.state.showLoading ? (
                        <LoaderScreen overlay={true} backgroundColor={'white'} message={this.props && this.props.loginState ? this.props.loginState : 'Loading...'} />
                    ) : (null)
                }
                <Ripple style={{position: "absolute", top: 20, left: 20}} onPress={this.handleOnPressBack}>
                    <Icon name="arrow-back"/>
                </Ripple>
                <View style={[style.welcomeTextContainer]}>
                    <Text style={style.welcomeText}>Welcome!</Text>
                </View>
                <View style={style.inputsContainer}>
                    {/*<View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>*/}
                        {/*<TextField*/}
                            {/*ref={this.urlRef}*/}
                            {/*value={this.state.url}*/}
                            {/*autoCorrect={false}*/}
                            {/*lineWidth={1}*/}
                            {/*enablesReturnKeyAutomatically={true}*/}
                            {/*containerStyle={[style.textInput]}*/}
                            {/*onChangeText={this.handleTextChange}*/}
                            {/*label='URL'*/}
                            {/*autoCapitalize={'none'}*/}
                        {/*/>*/}
                    {/*</View>*/}
                    <TextField
                        ref={this.emailRef}
                        value={this.state.email}
                        autoCorrect={false}
                        lineWidth={1}
                        enablesReturnKeyAutomatically={true}
                        containerStyle={style.textInput}
                        onChangeText={this.handleTextChange}
                        label='Email address'
                        autoCapitalize={'none'}
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
                        autoCapitalize={'none'}
                    />
                    <Button onPress={this.handleLogin} text="Login" style={styles.buttonLogin} height={35} />
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
                // let urlNew = this.state.url.toLowerCase();
                // if (!urlNew.includes('http://')) {
                //     urlNew = 'http://' + urlNew;
                // }
                // if (!urlNew.includes('/api')) {
                //     urlNew += '/api';
                // }
                // url.setBaseUrl(urlNew);

                this.setState({
                    showLoading: true
                }, () => {
                    this.props.loginUser({
                        email: this.state.email.toLowerCase(),
                        password: this.state.password
                    });
                });
            }
        }
    };

    handleTextChange = (text) => {
        ['email', 'password']
            .map((name) => ({ name, ref: this[name] }))
            .forEach(({ name, ref }) => {
                if (ref.isFocused()) {
                    this.setState({ [name]: text });
                }
            });
    };

    handleOnPressBack = () => {
        this.props.setSyncState(null);
        this.props.navigator.resetTo({
            screen: 'FirstConfigScreen'
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
        screenSize: state.app.screenSize,
        errors: state.errors,
        loginState: state.app.loginState
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

export default connect(mapStateToProps, matchDispatchToProps)(LoginScreen);