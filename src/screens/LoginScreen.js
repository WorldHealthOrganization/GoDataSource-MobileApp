/**
 * Created by florinpopa on 14/06/2018.
 */
import React, {Component} from 'react';
import {TextInput, View, Text, StyleSheet} from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import {Button} from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import styles from './../styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { loginUser } from './../actions/user';

class LoginScreen extends Component {

    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: ''
        };
        // Bind here methods, or at least don't declare methods in the render method
        this.handleLogin = this.handleLogin.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);

        this.emailRef = this.updateRef.bind(this, 'email');
        this.passwordRef = this.updateRef.bind(this, 'password');
    }

    // Please add here the react lifecycle methods that you need


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <View style={style.container}>
                <Text>Welcome!</Text>
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
                />
                <Button raised onPress={this.handleLogin} text="Login" style={styles.buttonLogin} />
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    updateRef(name, ref) {
        this[name] = ref;
    }

    handleLogin = () => {
        console.log("handleLogin");
        this.props.loginUser({
            email: this.state.email,
            password: this.state.password
        });
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
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        backgroundColor: '#55b5a6'
    },
    textInput: {
        width: '75%',
        alignSelf: 'center'
    }
});

function mapStateToProps(state) {
    return {

    };
}

function matchDispatchToProps(dispatch) {
    return bindActionCreators({
        loginUser,
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchToProps)(LoginScreen);