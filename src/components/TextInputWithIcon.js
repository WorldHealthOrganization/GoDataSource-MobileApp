/**
 * Created by florinpopa on 19/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {StyleSheet, TextInput, View} from 'react-native';
import {Icon} from 'react-native-material-ui';
import {getTranslation} from './../utils/functions';
import {connect} from "react-redux";
import translations from './../utils/translations';
import get from 'lodash/get';
import styles from './../styles';
import colors from "../styles/colors";

class TextInputWithIcon extends Component {
    searchRef = React.createRef();
    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {
            search: ''
        };

        this.handleTextChange = this.handleTextChange.bind(this);

    }

    // Please add here the react lifecycle methods that you need


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <View style={[style.container]}>
                <Icon name="search" size={20} style={{color: styles.primaryColor}} />
                <TextInput
                    label={getTranslation(translations.generalLabels.searchLabel, this.props.translation)}
                    ref={this.searchRef}
                    value={this.props.value}
                    style={style.textInput}
                    placeholder={getTranslation(translations.generalLabels.searchLabel, this.props.translation)}
                    placeholderTextColor={colors.secondaryColor}
                    underlineColorAndroid={'transparent'}
                    onChangeText={this.handleTextChange}
                    onSubmitEditing={this.handleOnSubmitEditing}
                    onEndEditing={this.handleOnEndEditing}
                    translation={this.props.translation}
                />
            </View>
        );
    }

    handleTextChange = (text) => {
        ['search']
            .map((name) => ({ name, ref: this[`${name}Ref`] }))
            .forEach(({ name, ref }) => {
                if (ref.current && ref.current.isFocused()) {
                    this.props.onChangeText(text);
                }
            });
    };

    handleOnSubmitEditing = () => {
        this.props.onSubmitEditing(this.state.search);
    };

    handleOnEndEditing = (event) => {
        this.props.onEndEditing(get(event, 'nativeEvent.text'));
    };
}


// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        alignItems: 'center',
        flexDirection: 'row',
        borderWidth: 0,
        flex: 1,
        marginTop: 0,
        marginLeft: -16,
        marginRight: 8,
        paddingLeft: 16,
        height: 30
    },
    textInput: {
        color: styles.textColor,
        paddingVertical: 5,
        flex: 1
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        translation: state.app.translation
    };
}

export default connect(mapStateToProps)(TextInputWithIcon);
