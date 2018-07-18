/**
 * Created by florinpopa on 03/07/2018.
 */
import React, {Component} from 'react';
import {TextInput, View, StyleSheet} from 'react-native';
import NavigationDrawerListItem from './../components/NavigationDrawerListItem';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box


class NavigationDrawer extends Component {

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
                <View style={{flex: 0.33}} />
                <View style={{flex: 0.33}}>
                    <NavigationDrawerListItem label='Follow-ups' name="update" />
                    <NavigationDrawerListItem label='Contacts' name="people" />
                    <NavigationDrawerListItem label='Cases' name="create-new-folder" />
                </View>
                <View style={{flex: 0.33}}>
                    <NavigationDrawerListItem label='Logout' name="power-settings-new" />
                </View>
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: 'white'
    },
    textInput: {
        borderColor: 'red',
        borderWidth: 1,
        borderRadius: 20,
        flex: 1
    }
});

export default NavigationDrawer;