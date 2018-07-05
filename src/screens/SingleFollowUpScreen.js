/**
 * Created by florinpopa on 05/07/2018.
 */
import React, {Component} from 'react';
import {TextInput, View, Text, StyleSheet} from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import {Button} from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import styles from './../styles';

class SingleFollowUpScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {

        };
        // Bind here methods, or at least don't declare methods in the render method

    }

    // Please add here the react lifecycle methods that you need


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <View style={style.container}>
                <Text>TODO! FollowUps screen</Text>
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods

}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({

});

export default SingleFollowUpScreen;