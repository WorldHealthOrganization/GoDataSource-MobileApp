/**
 * Created by florinpopa on 23/07/2018.
 */
import React, {PureComponent} from 'react';
import {TextInput, View, Text, StyleSheet, Platform, Dimensions, TouchableOpacity} from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import {ListItem, Icon, Button} from 'react-native-material-ui';
import {calculateDimension} from './../utils/functions';
import config from './../utils/config';
import styles from './../styles';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import ElevatedView from 'react-native-elevated-view';
import ButtonWithIcons from './ButtonWithIcons';
import {Dropdown} from 'react-native-material-dropdown';

class ValuePicker extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {
            selectedText: config.dropDownValues[0].value
        };
    }

    // Please add here the react lifecycle methods that you need


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <ElevatedView elevation={2}>
                <ButtonWithIcons
                    label={this.state.selectedText}
                    width={calculateDimension(124, false, this.props.screenSize)}
                    height={calculateDimension(25, true, this.props.screenSize)}
                    firstIcon="visibility"
                    secondIcon="arrow-drop-down"
                    isFirstIconPureMaterial={true}
                    isSecondIconPureMaterial={true}
                    onPress={this.handlePressDropdown}
                >
                    <Dropdown
                        ref='dropdown'
                        data={config.dropDownValues}
                        value={config.dropDownValues[0].value}
                        renderAccessory={() => {
                            return null;
                        }}
                        dropdownOffset={{
                            top: this.props.top,
                            left: -calculateDimension(110, false, this.props.screenSize)
                        }}
                        dropdownPosition={0}
                        onChangeText={this.handleChangeText}
                    />
                </ButtonWithIcons>
            </ElevatedView>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handlePressDropdown = () => {
        this.refs.dropdown.focus();
    };

    handleChangeText = (value, index, data) => {
        this.setState({
            selectedText: value
        }, () => {
            this.props.onSelectValue(value);
        })
    }
}

ValuePicker.defaultProps = {
    width: 124,
    height: 25,
    firstIcon: "3d-rotation",
    secondIcon: "arrow-drop-down"
};

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    containerButton: {
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 4,
    },
    containerInnerView: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 9,
        justifyContent: 'space-between',
        flex: 1
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(ValuePicker);
