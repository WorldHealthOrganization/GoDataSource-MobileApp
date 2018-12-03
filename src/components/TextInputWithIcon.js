/**
 * Created by florinpopa on 19/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {TextInput, View, Text, StyleSheet, Platform, Dimensions} from 'react-native';
import {ListItem, Icon} from 'react-native-material-ui';
import {calculateDimension, getTranslation} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {TextField} from 'react-native-material-textfield';
import Button from './Button';
import styles from './../styles';
import translations from './../utils/translations'

class TextInputWithIcon extends Component {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {
            search: ''
        };

        this.handleTextChange = this.handleTextChange.bind(this);

        this.searchRef = this.updateRef.bind(this, 'search');
    }

    // Please add here the react lifecycle methods that you need


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <View style={[style.container]}>
                <Icon name="search" size={20} style={{alignSelf: 'center'}} />
                <TextInput
                    label={getTranslation(translations.generalLabels.searchLabel, this.props.translation)}
                    ref={this.searchRef}
                    value={this.props.value}
                    style={style.textInput}
                    placeholder={getTranslation(translations.generalLabels.searchLabel, this.props.translation)}
                    underlineColorAndroid={'transparent'}
                    onChangeText={this.handleTextChange}
                    onSubmitEditing={this.handleOnSubmitEditing}
                    translation={this.props.translation}
                />
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    updateRef(name, ref) {
        this[name] = ref;
    }

    handleTextChange = (text) => {
        ['search']
            .map((name) => ({ name, ref: this[name] }))
            .forEach(({ name, ref }) => {
                if (ref.isFocused()) {
                    this.props.onChangeText(text);
                }
            });
    };

    handleOnSubmitEditing = () => {
        this.props.onSubmitEditing(this.state.search);
    }
}


// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
        flex: 1,
        marginRight: 9
    },
    textInput: {
        width: '100%',
        alignSelf: 'center',
        paddingVertical: 5,
        flex: 0.75
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        translation: state.app.translation
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(TextInputWithIcon);
