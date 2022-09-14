/**
 * Created by mobileclarisoft on 16/07/2018.
 */
import React, {Component} from 'react';
import {Text, View, StyleSheet} from 'react-native';
import config from './../utils/config'
import PropTypes from 'prop-types';
import {TextField} from 'react-native-material-textfield';
import {Dropdown} from 'react-native-material-dropdown';
import translations from './../utils/translations';
import {getDropDownInputDisplayParameters, getTooltip, getTranslation} from './../utils/functions';
import TooltipComponent from './TooltipComponent';
import get from 'lodash/get';
import styles from './../styles';

class TextInputWithDropDown extends Component {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);

        this.state={
            noneValueSelectedInDropdown: false
        };

        this.changeDropdown = this.changeDropdown.bind(this);
    }

    // Please add here the react lifecycle methods that you need
    componentDidUpdate(prevProps){
        if (this.props.isEditMode !== prevProps.isEditMode && prevProps.isEditMode === false){
            this.setState({
                noneValueSelectedInDropdown: false
            })
        }
    }

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
        let tooltip = getTooltip(this.props.label, this.props.translation);

        //  get Value
        const unit =  get(config, `[${this.props.dropDownData}][${this.props.selectedDropDownItemIndex}].value`, '');
        const value = get(this.props.value, `[${unit}]`, '');

        let stringValue = '';
        if (value !== undefined && value !== null){
            stringValue = value.toString();
        }

        //  get DropDown data
        let dropDownData = config[this.props.dropDownData].map((e) => {
            return {label: getTranslation(e.label, this.props.translation), value: e.value}
        });
        dropDownData.unshift({ label: getTranslation(translations.generalLabels.noneLabel, this.props.translation), value: null});

        //  get labels
        const textLabel = getTranslation(get(config, `[${this.props.dropDownData}][${this.props.selectedDropDownItemIndex}].label`, ' '), this.props.translation);
        const dropdownLabel =  `${getTranslation(translations.ageUnitOfMeasureDropDown.yearsLabel, this.props.translation)} / ${getTranslation(translations.ageUnitOfMeasureDropDown.monthsLabel, this.props.translation)}`

        const dropDownParams = getDropDownInputDisplayParameters(this.props.screenSize, dropDownData.length);
        return (
            <View style={[style.textWithDropdownContainer, this.props.style]}>
                <View style={style.textWithDropdown}>
                {
                    this.state.noneValueSelectedInDropdown === false ? (
                        <View style={{width: '45%'}}>
                        <TextField
                            label={this.props.isRequired ? textLabel + ' * ' : textLabel}
                            value={stringValue}
                            onChangeText={(value) => this.handleOnChangeText(value)}
                            textColor={styles.textColor}
                            fontSize={14}
                            labelFontSize={14}
                            // labelHeight={30}
                            labelTextStyle={{fontFamily: 'Roboto-Regular'}}
                            tintColor={styles.primaryColor}
                            multiline={this.props.multiline != undefined ? this.props.multiline : false}
                            onPress={() => {console.log("On press textInput")}}
                            keyboardType={this.props.keyboardType ? this.props.keyboardType : 'default'}
                            formatText={this.formatForNumeric}
                            onSubmitEditing={this.props.onSubmitEditing}
                        />
                    </View>
                    ) : null
                }
                <View style={{width: this.state.noneValueSelectedInDropdown === true ? '100%' : '45%'}}>
                    <Dropdown
                        label={dropdownLabel}
                        data={dropDownData}
                        onChangeText={(value) => this.changeDropdown(value)}
                        value={
                            this.state.noneValueSelectedInDropdown === true 
                                ? 'None'
                                : get(config, `[${this.props.dropDownData}][${this.props.selectedDropDownItemIndex}].value`, '')
                        }
                        fontSize={14}
                        labelFontSize={14}
                        selectedItemColor={styles.primaryColor}
                        dropdownMargins={{min: 4, max: 8}}
                        dropdownPosition={dropDownParams.dropdownPosition}
                        itemCount={dropDownParams.itemCount}
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
            </View>
        );
    }

    formatForNumeric = (text) => {
        if(this.props.keyboardType === 'numeric'){
            return Number.isNaN(parseFloat(text)) ? text : parseFloat(text).toString();
        }
        return text;
    }

    viewInput() {
        let tooltip = getTooltip(this.props.label, this.props.translation);
        const unit =  get(config, `[${this.props.dropDownData}][${this.props.selectedDropDownItemIndex}].value`, '');
        const value = get(this.props.value, `[${unit}]`, '');

        let stringValue = '';
        if (value !== undefined && value !== null){
            stringValue = value.toString();
        }
        
        return (
            <View style={[style.textWithDropdownContainer, this.props.style]}>
                <View style={[style.textWithDropdown, {marginVertical: 8}]}>
                    <View style={{width: '45%'}}>
                        <Text style={style.textWithDropdownLabel}>
                            {getTranslation(this.props.label, this.props.translation)}
                        </Text>
                        <Text style={style.textWithDropdownValue}>
                            {stringValue !== '' ? stringValue + ' ' + get(config, `[${this.props.dropDownData}][${this.props.selectedDropDownItemIndex}].value`, '') : ''}
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
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    changeDropdown(selectedValue) {
        if (selectedValue !== null){
            this.setState({
                noneValueSelectedInDropdown: false
            }, () => {
                let selectedValueIndex = config[this.props.dropDownData].map((e) => {return e.value}).indexOf(selectedValue);
                this.props.onChangeDropDown(selectedValueIndex, this.props.selectedItemIndexForAgeUnitOfMeasureDropDown)
            });
        } else {
            this.setState({
                noneValueSelectedInDropdown: true
            }, () => {
                this.handleOnChangeText("")
            })
        }
       
    }

    handleOnChangeText = (value) => {
        this.props.onChange(
            value,
            this.props.id, 
            this.props.objectType,
            this.props.selectedItemIndexForAgeUnitOfMeasureDropDown
        )
    }
}

const style = StyleSheet.create({
    textWithDropdownContainer: {
        width: '100%'
    },
    textWithDropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    textWithDropdownLabel: {
        color: styles.secondaryColor,
        fontFamily: 'Roboto-Regular',
        fontSize: 14
    },
    textWithDropdownValue: {
        color: styles.textColor,
        fontFamily: 'Roboto-Regular',
        fontSize: 14
    }
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

