/**
 * Created by florinpopa on 25/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {View, Text, StyleSheet, Platform,} from 'react-native';
import {calculateDimension} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import styles from './../styles';
import Ripple from 'react-native-material-ripple';
import ElevatedView from 'react-native-elevated-view';
import SwitchInput from './SwitchInput'
import TextInput from './TextInput';

class SwitchAndTextInputComponent extends PureComponent {

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
        // Get contact info from the follow-ups

        return (
            <ElevatedView elevation={3} style={[style.container, {
                marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                minHeight: calculateDimension(72, true, this.props.screenSize),
                width: calculateDimension(this.props.screenSize.width - 32, false, this.props.screenSize)
            }]}>
                <SwitchInput
                    id='flagged'
                    label={this.props.switchInputLabel}
                    value={this.props.switchInputValue}
                    isEditMode={this.props.isEditMode}
                    isRequired={true}
                    activeButtonColor={'rgb(255,60,56)'}
                    activeBackgroundColor={'rgba(255,60,56,0.3)'}
                    onChange={this.changeValue}
                    showValue={false}
                    style={{
                        marginHorizontal: 14,
                        marginTop: 18,
                        marginBottom: 1
                    }}
                    labelStyle={{
                        fontFamily: 'Roboto-Medium',
                        fontSize: 15,
                        textAlign: 'left',
                        color: 'rgb(255,60,56)',
                        lineHeight: 30,
                        // flex: 0.8
                    }}
                />
                <TextInput
                    id='reason'
                    label={this.props.textInputLabel}
                    value={this.props.textInputValue}
                    isEditMode={this.props.isEditMode}
                    isRequired={true}
                    onChange={this.changeValue}
                    style={{
                        marginHorizontal: 14,
                        marginBottom: 1
                    }}
                    multiline={this.props.multilineTextInput}
                />
            </ElevatedView>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
}

SwitchAndTextInputComponent.defaultProps = {
    switchInputLabel: 'FLAGGED',
    switchInputValue: true,
    isEditMode: true,
    textInputLabel: 'Reason',
    textInputValue: 'Test',
    multilineTextInput: true
};

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 2
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

export default connect(mapStateToProps, matchDispatchProps)(SwitchAndTextInputComponent);
