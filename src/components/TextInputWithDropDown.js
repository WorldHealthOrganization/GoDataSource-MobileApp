/**
 * Created by mobileclarisoft on 16/07/2018.
 */
import React, {Component} from 'react';
import {View, Text, StyleSheet, Platform} from 'react-native';
import config from './../utils/config'
import PropTypes from 'prop-types';
import { TextField } from 'react-native-material-textfield';
import { Dropdown } from 'react-native-material-dropdown';

class TextInputWithDropDown extends Component {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
    }

    // Please add here the react lifecycle methods that you need
    shouldComponentUpdate () {
        return true
    }

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

    editInput() {
        let smth = this.props.value[config[this.props.dropDownData][this.props.selectedDropDownItemIndex].value];
        smth = smth.toString();
        return (
            <View style={[{   
            width: '100%',
            },this.props.style]}>
                <View style={{flexDirection: 'row',  justifyContent: 'space-between'}}>
                    <View style={{width: '45%'}}>
                        <TextField
                            label={this.props.isRequired ? this.props.label + ' * ' : this.props.label}
                            value={smth}
                            onChangeText={(value) => this.handleOnChangeText(value)}
                            textColor='rgb(0,0,0)'
                            fontSize={15}
                            labelFontSize={12.5}
                            labelHeight={30}
                            labelTextStyle={{
                                fontFamily: 'Roboto-Light',
                                textAlign: 'left'
                            }}
                            tintColor='rgb(77,176,160)'
                            multiline={this.props.multiline != undefined ? this.props.multiline : false}
                            onPress={() => {console.log("On press textInput")}}
                            keyboardType={this.props.keyboardType ? this.props.keyboardType : 'default'}
                            onSubmitEditing={this.props.onSubmitEditing}
                        />
                    </View>
                    <View style={{width: '45%'}}>
                        <Dropdown
                            label={config[this.props.dropDownData][this.props.selectedDropDownItemIndex].label}
                            data={config[this.props.dropDownData]}
                            onChangeText={(value) => this.changeDropdown(value)}
                            value={config[this.props.dropDownData][this.props.selectedDropDownItemIndex].value || ''}
                            fontSize={15}
                            labelFontSize={12.5}
                            selectedItemColor={'rgb(255,60,56)'}
                            dropdownPosition={1}
                            dropdownMargins={{min: 4, max: 8}}
                        />
                    </View>
                </View>
            </View>
        );
    }

    viewInput() {
        let smth = this.props.value[config[this.props.dropDownData][this.props.selectedDropDownItemIndex].value];
        smth = smth.toString();
        return (
            <View style={[{width: '100%'},this.props.style]}>
                <View style={{flexDirection: 'row',  justifyContent: 'space-between'}}>
                    <View style={{width: '45%'}}>
                        <Text style={{
                            fontFamily: 'Roboto-Regular',
                            fontSize: 15,
                            lineHeight: 30,
                            textAlign: 'left',
                            color: 'rgb(0,0,0)',
                            marginBottom: 7.5
                        }}>
                            {this.props.label}
                        </Text>
                        <Text style={{
                            fontFamily: 'Roboto-Light',
                            fontSize: 12.5,
                            textAlign: 'left',
                            color: 'rgb(60,60,60)',
                        }}>
                            {smth + ' ' + config[this.props.dropDownData][this.props.selectedDropDownItemIndex].value || ''}
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    changeDropdown(selectedValue) {
        let selectedValueIndex = config[this.props.dropDownData].map((e) => {return e.value}).indexOf(selectedValue)
        console.log ('TextInputWithDropDown changeDropdown', selectedValueIndex, this.props.selectedItemIndexForAgeUnitOfMeasureDropDown)
        this.props.onChangeDropDown(selectedValueIndex, this.props.selectedItemIndexForAgeUnitOfMeasureDropDown)
    }

    handleOnChangeText = (value) => {
        this.props.onChange(
            value,
            this.props.id, 
            this.props.objectType,
            this.props.selectedItemIndexForAgeUnitOfMeasureDropDown
        )
    }

    // Please write here all the methods that are not react native lifecycle methods
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
});

TextInputWithDropDown.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.bool.isRequired,
    isEditMode: PropTypes.bool.isRequired,
    isRequired: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
    labelStyle: PropTypes.object,
};

export default TextInputWithDropDown;

