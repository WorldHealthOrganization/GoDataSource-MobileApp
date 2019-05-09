/**
 * Created by florinpopa on 25/07/2018.
 */
/**
 * Created by florinpopa on 19/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component, PureComponent} from 'react';
import {View, Text, StyleSheet, WebView} from 'react-native';
import {calculateDimension, handleExposedTo, getAddress, extractIdFromPouchId, getTranslation} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import DropdownInput from './DropdownInput';
import DropDown from './DropDown';
import TextInputWithDropDown from './TextInputWithDropDown'
import TextSwitchSelector from './TextSwitchSelector'
import DropDownSectioned from './DropDownSectioned';
import TextInput from './TextInput';
import SwitchInput from './SwitchInput';
import DatePicker from './DatePicker';
import _ from 'lodash';
import Section from './Section';
import Selector from './Selector';
import IntervalPicker from './IntervalPicker';
import ActionsBar from './ActionsBar';
import translations from './../utils/translations'

class CardComponent extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {
            showDropdown: false
        };
    }

    // Please add here the react lifecycle methods that you need
   
    
    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        let width = calculateDimension(315, false, this.props.screenSize);
        let marginHorizontal = calculateDimension(14, false, this.props.screenSize);

        switch(this.props.item.type) {
            case 'Section':
                return (
                    <Section
                        label={this.props.item.label}
                        hasBorderBottom={this.props.item.hasBorderBottom}
                        borderBottomColor={this.props.item.borderBottomColor}
                        containerStyle={{height: calculateDimension(54, true, this.props.screenSize)}}
                        translation={this.props.translation}
                    />
                );
            case 'TextInput':
                return (
                    <TextInput
                        id={this.props.item.id}
                        label={this.props.item.label}
                        index={this.props.index}
                        value={this.props.value}
                        isEditMode={this.props.item.isEditMode}
                        isRequired={this.props.item.isRequired}
                        multiline={this.props.item.multiline}
                        style={{width: width, marginHorizontal: marginHorizontal}}
                        objectType={this.props.item.objectType}
                        keyboardType={this.props.item.keyboardType}
                        translation={this.props.translation}
                        onChange={this.props.onChangeText}
                        onFocus={this.props.onFocus}
                        onBlur={this.props.onBlur}
                    />
                );
            case 'DropdownInput':
                const dataWithNoneOption = _.cloneDeep(this.props.item.data)
                if (dataWithNoneOption !== undefined && dataWithNoneOption !== null && dataWithNoneOption.length > 0) {
                    const dataFormatKeys = Object.keys(dataWithNoneOption[0])
                    if (dataFormatKeys.length === 2) {
                        const noneLabel = getTranslation(translations.generalLabels.noneLabel, this.props.translation)
                        if (dataFormatKeys[0] === 'label' && dataFormatKeys[1] === 'value'){
                            noneData = { label: noneLabel, value: null }
                            dataWithNoneOption.unshift(noneData)
                        } else if (dataFormatKeys[0] === 'value' && dataFormatKeys[1] === 'id'){
                            noneData = { value: noneLabel, id: null }
                            dataWithNoneOption.unshift(noneData)
                        }
                    }
                }
                return (
                    <DropdownInput
                        id={this.props.item.id}
                        index={this.props.index}
                        label={this.props.item.label}
                        labelValue={this.props.item.labelValue}
                        value={this.props.value}
                        data={dataWithNoneOption}
                        isEditMode={this.props.isEditModeForDropDownInput}
                        isRequired={this.props.item.isRequired}
                        style={{width: width, marginHorizontal: marginHorizontal}}
                        objectType={this.props.item.objectType}
                        translation={this.props.translation}
                        onChange={this.props.onChangeDropDown}
                        screenSize={this.props.screenSize}
                    />
                );
            case 'DropDown':
                return (
                    <DropDown
                        key={this.props.item.id}
                        id={this.props.item.id}
                        label={translations.dropDownLabels.selectedAnswersLabel}
                        labelValue={this.props.item.label}
                        value={this.props.value}
                        data={this.props.data}
                        isEditMode={true}
                        isRequired={this.props.item.required}
                        onChange={this.props.onChangeMultipleSelection}
                        style={{width: width, marginHorizontal: marginHorizontal}}
                        dropDownStyle={{width: width, alignSelf: 'center'}}
                        showDropdown={this.state.showDropdown}
                        objectType={this.props.item.objectType}
                    />
                );
            case 'DropDownSectioned':
                return (
                    <DropDownSectioned
                        key={this.props.item.id}
                        id={this.props.item.id}
                        label={this.props.item.label}
                        index={this.props.index}
                        value={this.props.value}
                        data={this.props.locations}
                        isEditMode={this.props.item.isEditMode}
                        isRequired={this.props.item.isRequired}
                        sectionedSelectedItems={this.props.sectionedSelectedItems}
                        onChange={this.props.onChangeSectionedDropDown}
                        style={{width: width, marginHorizontal: marginHorizontal}}
                        dropDownStyle={{width: width, alignSelf: 'center'}}
                        objectType={this.props.item.objectType}
                        single={this.props.item.single}
                    />
                );
            case 'SwitchInput':
                return(
                    <SwitchInput
                        id={this.props.item.id}
                        label={this.props.item.label}
                        index={this.props.index}
                        value={this.props.value}
                        showValue={true}
                        isEditMode={this.props.item.isEditMode}
                        isRequired={this.props.item.isRequired}
                        onChange={this.props.onChangeSwitch}
                        activeButtonColor={this.props.item.activeButtonColor}
                        activeBackgroundColor={this.props.item.activeBackgroundColor}
                        style={{justifyContent: 'space-between', width: width, marginHorizontal: marginHorizontal}}
                        objectType={this.props.item.objectType}
                        translation={this.props.translation}
                    />
                );
            case 'DatePicker':
                return (
                    <DatePicker
                        id={this.props.item.id}
                        label={this.props.item.label}
                        value={this.props.value instanceof Date ? this.props.value : this.props.value ? new Date(this.props.value) : this.props.value}
                        index={this.props.index}
                        isEditMode={this.props.item.isEditMode}
                        isRequired={this.props.item.isRequired}
                        onChange={this.props.onChangeDate}
                        minimumDate={this.props.minimumDate instanceof Date ? this.props.minimumDate : this.props.minimumDate ? new Date(this.props.minimumDate) : this.props.minimumDate}
                        maximumDate={this.props.maximumDate instanceof Date ? this.props.maximumDate : this.props.maximumDate ? new Date(this.props.maximumDate) : this.props.maximumDate}
                        style={{width: width, marginHorizontal: marginHorizontal}}
                        objectType={this.props.item.objectType}
                        translation={this.props.translation}
                    />
                );
            case 'Selector':
                return (
                    <Selector
                        id={this.props.item.id}
                        key={this.props.item.id}
                        data={this.props.item.data}
                        selectItem={this.props.onSelectItem}
                        style={{width: width, height: '100%', marginHorizontal: marginHorizontal}}
                        objectType={this.props.item.objectType}
                    />
                );
            case 'IntervalPicker':
                return (
                    <IntervalPicker
                        id={this.props.item.id}
                        label={this.props.item.label}
                        value={this.props.item.value}
                        min={this.props.item.min}
                        max={this.props.item.max}
                        style={{width, marginHorizontal}}
                        onChange={this.props.onChangeInterval}
                        objectType={this.props.item.objectType}
                    />
                );
            case 'ActionsBar':
                return (
                    <ActionsBar
                        id={this.props.item.id}
                        key={this.props.item.id}
                        addressIndex={this.props.index}
                        textsArray={this.props.item.textsArray}
                        textsStyleArray={this.props.item.textsStyleArray}
                        onPressArray={this.props.item.onPressArray}
                        containerTextStyle={{width, marginHorizontal, height: calculateDimension(46, true, this.props.screenSize)}}
                        isEditMode={this.props.isEditMode !== undefined && this.props.isEditMode !== null ? this.props.isEditMode : true}
                        translation={this.props.translation}
                    />
                );
            case 'TextSwitchSelector':
                return (
                    <TextSwitchSelector 
                        selectedItem={this.props.selectedItemIndexForTextSwitchSelectorForAge}
                        // selectedItem={this.props[this.props.item.selectedItemIndexForTextSwitchSelector]}
                        selectedItemIndexForTextSwitchSelector={this.props.item.selectedItemIndexForTextSwitchSelector}
                        onChange={this.props.onChangeTextSwitchSelector}
                        values={this.props.item.values}
                        isEditMode = {this.props.isEditMode}
                        style={{width: width, marginHorizontal: marginHorizontal}}
                        translation={this.props.translation}
                    />
                );
            case 'TextInputWithDropDown':
                return (
                    <TextInputWithDropDown 
                        id={this.props.item.id}
                        label={this.props.item.label}
                        index={this.props.index}
                        value={this.props.value}
                        isEditMode={this.props.item.isEditMode}
                        isRequired={this.props.item.isRequired}
                        multiline={this.props.item.multiline}
                        dropDownData={this.props.item.dropDownData}
                        onChange={this.props.onChangeextInputWithDropDown}
                        style={{width: width, marginHorizontal: marginHorizontal}}
                        objectType={this.props.item.objectType}
                        keyboardType={this.props.item.keyboardType}
                        onChangeDropDown={this.props.onChangeTextSwitchSelector}
                        selectedDropDownItemIndex={this.props[this.props.item.selectedItemIndexForAgeUnitOfMeasureDropDown]}
                        selectedItemIndexForAgeUnitOfMeasureDropDown ={this.props.item.selectedItemIndexForAgeUnitOfMeasureDropDown}
                        translation={this.props.translation}
                        screenSize={this.props.screenSize}
                    />
                );
            case 'WebView':
                return (
                    <WebView
                        style={{
                            height: calculateDimension(300, true, this.props.screenSize),
                            width: width
                        }}
                        source={{html: `<html><head></head><body>${this.props.value}</body></html>`}}
                    />
                );
            default:
                return (
                    <View style={{backgroundColor: 'red'}}>
                        <Text>{"TODO: item type: " + this.props.item.type + " is not implemented yet"}</Text>
                    </View>
                )
        }
    };
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 2
    },
    containerCardComponent: {
        alignItems: 'center',
        flex: 1
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        locations: state.locations.locations,
        translation: state.app.translation,
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(CardComponent);
