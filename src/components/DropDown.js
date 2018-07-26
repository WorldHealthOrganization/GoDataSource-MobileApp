/**
 * Created by florinpopa on 25/07/2018.
 */
import React, {PureComponent} from 'react';
import {TextInput, View, Text, StyleSheet, Platform, Dimensions, TouchableOpacity} from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import {ListItem, Icon, Button} from 'react-native-material-ui';
import {calculateDimension} from './../utils/functions';
import config from './../utils/config';
import Ripple from 'react-native-material-ripple';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './../styles';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import ElevatedView from "react-native-elevated-view";
import {Dropdown} from 'react-native-material-dropdown';
import DropdownInput from './DropdownInput';

class DropDown extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    // Please add here the react lifecycle methods that you need


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <ElevatedView elevation={3} style={[this.props.style, style.container, {marginHorizontal: calculateDimension(16, false, this.props.screenSize)}]}>
                <DropdownInput
                    id="dropDown"
                    label={this.props.label}
                    value={this.props.value}
                    data={this.props.data}
                    isEditMode={this.props.isEditMode}
                    isRequired={this.props.isRequired}
                    onChange={this.props.onChange}
                    style={style.dropdownStyle}
                />
            </ElevatedView>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
}

DropDown.defaultProps = {
    label: 'DropDownLabel',
    value: 'Test',
    data: [],
    isEditMode: true,
    isRequired: true,
    onChange: () => {console.log("Default on change");}
};

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 2
    },
    dropdownStyle: {
        marginHorizontal: 14
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

export default connect(mapStateToProps, matchDispatchProps)(DropDown);
