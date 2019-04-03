/**
 * Created by florinpopa on 04/07/2018.
 */
import React, {PureComponent} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Icon} from 'react-native-material-ui';
import PropTypes from 'prop-types';
import translations from './../utils/translations'
import {getTranslation, calculateDimension, getTooltip} from './../utils/functions';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import { TextField } from 'react-native-material-textfield';
import ElevatedView from 'react-native-elevated-view';
import Ripple from 'react-native-material-ripple';
import styles from './../styles';
import TooltipComponent from './TooltipComponent'

class TextInput extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
    }

    // Please add here the react lifecycle methods that you need


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        if(this.props.isEditMode){
            return this.editInput();
        }else{
            return this.viewInput();
        }
    }

    // Please write here all the methods that are not react native lifecycle methods
    editInput = () => {
        let tooltip = getTooltip(this.props.label, this.props.translation)
        return (
            <View style={[{flexDirection: 'row'},this.props.style]}>
                <View style={{flex: 1}}> 
                    <TextField
                        label={this.props.isRequired ? getTranslation(this.props.label, this.props.translation) + ' * ' : getTranslation(this.props.label, this.props.translation)}
                        value={typeof this.props.value === 'number' ? isNaN(this.props.value) ? '' : this.props.value.toString() : this.props.value && this.props.value != undefined && (typeof this.props.value === 'string' || typeof this.props.value === 'number') ? this.props.value.toString() : ''}
                        onChangeText={this.handleOnChangeText}
                        textColor='rgb(0,0,0)'
                        fontSize={15}
                        labelFontSize={12.5}
                        labelHeight={30}
                        labelTextStyle={{
                            fontFamily: 'Roboto',
                            textAlign: 'left'
                        }}
                        tintColor='rgb(77,176,160)'
                        multiline={this.props.multiline != undefined ? this.props.multiline : false}
                        onPress={() => {console.log("On press textInput")}}
                        keyboardType={this.props.keyboardType ? this.props.keyboardType : 'default'}
                        onSubmitEditing={this.props.onSubmitEditing}
                        secureTextEntry={this.props.secureTextEntry}
                        onFocus={this.props.onFocus}
                        onBlur={this.props.onBlur}
                    />
                </View>
                {
                    tooltip.hasTooltip === true ? (
                        <TooltipComponent
                            tooltipMessage={tooltip.tooltipMessage}
                        />
                    ) : null
                }
            </View>
        );
    };

    viewInput = () => {
        let localValue = this.extractAgeForViewInput()
        let tooltip = getTooltip(this.props.label, this.props.translation)
        return (
            <View style={[{flexDirection: 'row'},this.props.style]}>
                <View style={{flex: 1}}>
                    <Text style={{
                        fontFamily: 'Roboto-Regular',
                        fontSize: 15,
                        lineHeight: 30,
                        textAlign: 'left',
                        color: 'rgb(0,0,0)',
                        marginBottom: 7.5
                    }}>
                        {getTranslation(this.props.label, this.props.translation)}
                    </Text>
                    <Text style={{
                        fontFamily: 'Roboto-Light',
                        fontSize: 12.5,
                        textAlign: 'left',
                        color: 'rgb(60,60,60)',
                    }}>
                        {localValue}
                    </Text>
                </View>
                {
                    tooltip.hasTooltip === true ? (
                        <TooltipComponent
                            tooltipMessage={tooltip.tooltipMessage}
                        />
                    ) : null
                }
            </View>
        );
    }

    extractAgeForViewInput = () => {
        let localValue = typeof this.props.value === 'number' ? this.props.value : '';
        if (this.props.value && this.props.value != undefined) {
            if (typeof this.props.value === 'string') {
                localValue = this.props.value
            } else {
                if (this.props.value.years && this.props.value.years !== 0) {
                    localValue = this.props.value.years + ' years'
                }
                if (this.props.value.months && this.props.value.months !== 0) {
                    localValue = this.props.value.months + ' months'
                }
            }
        }
        return localValue
    }

    handleOnChangeText = (state) => {
        if (this.props.labelValue) {
            //QuestionCard
            console.log("textInput has this.props.labelValue: ", this.props.data, state);
                this.props.onChange(
                    state,
                    this.props.id
                )
        } else {
            //CardComponent
            this.props.onChange(
                state,
                this.props.id,
                this.props.objectType ? (this.props.objectType === 'Address' || this.props.objectType === 'LabResult' || this.props.objectType === 'Documents' || this.props.objectType === 'DateRanges' ? this.props.index : this.props.objectType) : null,
                this.props.objectType
            )
        }
    }
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    editLabel: {

    },
    viewLabel: {

    }
});


TextInput.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    isEditMode: PropTypes.bool.isRequired,
    isRequired: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
    multiline: PropTypes.bool
};

export default TextInput;
