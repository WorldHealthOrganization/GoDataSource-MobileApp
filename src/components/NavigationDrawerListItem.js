/**
 * Created by florinpopa on 14/06/2018.
 */
import React, {PureComponent} from 'react';
import {TextInput, View, Text, StyleSheet} from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import {ListItem, Icon} from 'react-native-material-ui';

class NavigationDrawerListItem extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: ''
        };
    }

    // Please add here the react lifecycle methods that you need


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <View style={style.container}>
                <ListItem
                    numberOfLines={1}
                    leftElement={<Icon name={this.props.name} />}
                    centerElement={this.props.label}
                />
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    textInput: {
        borderColor: 'red',
        borderWidth: 1,
        borderRadius: 20,
        flex: 1
    }
});

export default NavigationDrawerListItem;
