/**
 * Created by florinpopa on 18/07/2018.
 */
import React, {Component} from 'react';
import {TextInput, View, Text, StyleSheet, Platform, Dimensions} from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import {Button} from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import styles from './../styles';
import NavBarCustom from './../components/NavBarCustom';
import {Calendar} from 'react-native-calendars';
import CalendarPicker from './../components/CalendarPicker';
import {calculateDimension} from './../utils/functions';
import config from './../utils/config';
import ButtonWithIcons from './../components/ButtonWithIcons';

let height = Dimensions.get('window').height;
let width = Dimensions.get('window').width;

class ContactsScreen extends Component {

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


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <View style={style.container}>
                <NavBarCustom title="Follow-ups">
                    <CalendarPicker
                        width={calculateDimension(124, false, {width, height})}
                        height={calculateDimension(25, true, {width, height})}
                    />
                    <ButtonWithIcons
                        label="Altceva"
                        width={calculateDimension(124, false, {width, height})}
                        height={calculateDimension(25, true, {width, height})}
                        firstIcon="visibility"
                        secondIcon="arrow-drop-down"
                        isFirstIconPureMaterial={true}
                        isSecondIconPureMaterial={true}
                    />
                    <Button raised text="" onPress={() => console.log("Empty button")} icon="add"
                            style={{
                                container: {width: calculateDimension(33, true, {width, height}),height: calculateDimension(25, true, {width, height}), margin: 0, padding: 0},
                                text: {width: 0, margin: 0, padding: 0, height: 0},
                                icon: {margin: 0, padding: 0, alignSelf: 'center'}
                            }}/>
                </NavBarCustom>
                <View style={style.containerContent}>
                    <Text>TODO! FollowUps screen</Text>
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
        backgroundColor: 'white',
    },
    containerContent: {
        flex: 1,
        backgroundColor: 'gray'
    }
});

export default ContactsScreen;