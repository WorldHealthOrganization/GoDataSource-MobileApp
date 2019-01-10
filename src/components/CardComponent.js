/**
 * Created by florinpopa on 25/07/2018.
 */
/**
 * Created by florinpopa on 19/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component, PureComponent} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {calculateDimension, handleExposedTo, getAddress, extractIdFromPouchId} from './../utils/functions';
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
                    />
                );
            case 'DropdownInput':
                return (
                    <DropdownInput
                        id={this.props.item.id}
                        index={this.props.index}
                        label={this.props.item.label}
                        labelValue={this.props.item.labelValue}
                        value={this.props.value}
                        data={this.props.item.data}
                        isEditMode={this.props.isEditModeForDropDownInput}
                        isRequired={this.props.item.isRequired}
                        style={{width: width, marginHorizontal: marginHorizontal}}
                        objectType={this.props.item.objectType}
                        translation={this.props.translation}
                        onChange={this.props.onChangeDropDown}
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
                        value={this.props.value}
                        index={this.props.index}
                        isEditMode={this.props.item.isEditMode}
                        isRequired={this.props.item.isRequired}
                        onChange={this.props.onChangeDate}
                        minimumDate={this.props.minimumDate}
                        maximumDate={this.props.maximumDate}
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
                        selectedItem={this.props[this.props.item.selectedItemIndexForTextSwitchSelector]}
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
                    />
                )
            default:
                return (
                    <View style={{backgroundColor: 'red'}}>
                        <Text>{"TODO: item type: " + this.props.item.type + " is not implemented yet"}</Text>
                    </View>
                )
        }
    }

    handleRenderItemByType = (item) => {
        if (this.props.screen === 'HelpFilter') {
            if (item.type === 'DropdownInput' && item.id === 'sortCriteria') {
                let configSortCiteriaFilter = config.helpItemsSortCriteriaDropDownItems.filter ((e) => {
                    return this.props.filter.sort.map((k) => {return k.sortCriteria}).indexOf(e.value) === -1
                })
                item.data = configSortCiteriaFilter.map((e) => { return {label: this.getTranslation(e.label), value: e.value }})
                value = this.computeValueForCaseSortScreen(item, this.props.index);
            }
            if (item.type === 'DropdownInput' && item.id === 'sortOrder') {
                item.data = config.sortOrderDropDownItems.map((e) => { return {label: this.getTranslation(e.label), value: e.value }})
                value = this.computeValueForCaseSortScreen(item, this.props.index);
            }
            if (item.type === 'ActionsBar') {
                item.onPressArray = [this.props.onDeletePress]
            }
            if (item.type === 'DropDown' && item.id === 'categories') {
                data = this.computeDataForDropdown(item);
                value = this.props.filter.filter[item.id];
            }
        }

        if (this.props.screen === 'HelpSingleScreen') {
            value = this.computeValueForHelpSingleScreen(item)
        }

        if (item.type === 'DatePicker' && value === '') {
            value = null
        }

        let dateValidation = this.setDateValidations(item);
        minimumDate = dateValidation.minimumDate;
        maximumDate = dateValidation.maximumDate;
    };

    setDateValidations = (item) => {
        let minimumDate = undefined;
        let maximumDate = undefined;

        if (item.type === 'DatePicker') {
            if (this.props.screen === 'CaseSingleScreen') {
                if (item.id === 'dob' || item.id === 'dateBecomeCase' || item.id === 'dateOfOutcome' ) {
                    maximumDate = new Date()
                } else if (item.id === 'dateOfOnset') {
                    if (this.props.case && this.props.case !== undefined && this.props.case.deceased !== null && this.props.case.deceased !== undefined && this.props.case.deceased === true && this.props.case.dateDeceased && this.props.case.dateDeceased !== undefined && this.props.case.dateDeceased !== ''){
                        maximumDate = new Date(this.props.case.dateDeceased);
                    } else {
                        maximumDate = new Date();
                    }
                } else if (item.id === 'dateOfReporting') {
                    if (this.props.case && this.props.case !== undefined && this.props.case.deceased !== null && this.props.case.deceased !== undefined && this.props.case.deceased === true && this.props.case.dateDeceased && this.props.case.dateDeceased !== undefined && this.props.case.dateDeceased !== ''){
                        maximumDate = this.props.case.dateDeceased
                    } else {
                        maximumDate = new Date()
                    }
                } else if (item.id === 'dateOfInfection') {
                    let hasDeceasedDate = false;
                    let hasDateOfOnset = false;
                    if (this.props.case && this.props.case !== undefined && this.props.case.deceased !== null && this.props.case.deceased !== undefined && this.props.case.deceased === true && this.props.case.dateDeceased && this.props.case.dateDeceased !== undefined && this.props.case.dateDeceased !== ''){
                        hasDeceasedDate = true
                    }
                    if (this.props.case && this.props.case !== undefined && this.props.case.dateOfOnset && this.props.case.dateOfOnset !== undefined && this.props.case.dateOfOnset !== ''){
                        hasDateOfOnset = true
                    }

                    if (hasDeceasedDate === true && hasDateOfOnset === false) {
                        maximumDate = new Date(this.props.case.dateDeceased);
                    } else if (hasDeceasedDate === false && hasDateOfOnset === true) {
                        maximumDate = new Date(this.props.case.dateOfOnset);
                    } else if (hasDeceasedDate === true && hasDateOfOnset === true) {
                        maximumDate = _.min([this.props.case.dateOfOnset, this.props.case.dateDeceased])
                    } else {
                        maximumDate = new Date()
                    }
                } else if (item.id === 'dateDeceased') {
                    maximumDate = new Date()
                    let hasDateOfOnset = false   
                    let hasDateOfReporting = false
                    let hasDateOfInfection = false

                    if (this.props.case && this.props.case !== undefined && this.props.case.dateOfOnset && this.props.case.dateOfOnset !== undefined && this.props.case.dateOfOnset !== ''){
                        hasDateOfOnset = true
                    }
                    if (this.props.case && this.props.case !== undefined && this.props.case.dateOfReporting && this.props.case.dateOfReporting !== undefined && this.props.case.dateOfReporting !== ''){
                        hasDateOfReporting = true
                    }
                    if (this.props.case && this.props.case !== undefined && this.props.case.dateOfInfection && this.props.case.dateOfInfection !== undefined && this.props.case.dateOfInfection !== ''){
                        hasDateOfInfection = true
                    }

                    if (hasDateOfOnset === false && hasDateOfReporting === false && hasDateOfInfection === true) {
                        minimumDate = this.props.case.dateOfInfection
                    } else if (hasDateOfOnset === false && hasDateOfReporting === true && hasDateOfInfection === false) {
                        minimumDate = this.props.case.dateOfReporting
                    } else if (hasDateOfOnset === true && hasDateOfReporting === false && hasDateOfInfection === false) {
                        minimumDate = this.props.case.dateOfOnset
                    } else if (hasDateOfOnset === false && hasDateOfReporting === true && hasDateOfInfection === true) {
                        minimumDate = _.max([this.props.case.dateOfReporting, this.props.case.dateOfInfection])
                    } else if (hasDateOfOnset === true && hasDateOfReporting === false && hasDateOfInfection === true) {
                        minimumDate = _.max([this.props.case.dateOfOnset, this.props.case.dateOfInfection])
                    } else if (hasDateOfOnset === true && hasDateOfReporting === true && hasDateOfInfection === false) {
                        minimumDate = _.max([this.props.case.dateOfOnset, this.props.case.dateOfReporting])
                    } else if (hasDateOfOnset === true && hasDateOfReporting === true && hasDateOfInfection === true) {
                        minimumDate = _.max([this.props.case.dateOfOnset, this.props.case.dateOfReporting, this.props.case.dateOfInfection])
                    }
                } else if (item.objectType === 'HospitalizationDates'){
                    if (this.props.case && this.props.case.hospitalizationDates && Array.isArray(this.props.case.hospitalizationDates) && this.props.case.hospitalizationDates.length > 0 && this.props.case.hospitalizationDates[this.props.index]) {
                        if (this.props.case.hospitalizationDates[this.props.index].startDate !== null && item.id !== 'startDate') {
                            minimumDate = this.props.case.hospitalizationDates[this.props.index].startDate
                        }
                        if (this.props.case.hospitalizationDates[this.props.index].endDate !== null && item.id !== 'endDate') {
                            maximumDate = this.props.case.hospitalizationDates[this.props.index].endDate
                        }
                    }
                } else if (item.objectType === 'IsolationDates'){
                    if (this.props.case && this.props.case.isolationDates && Array.isArray(this.props.case.isolationDates) && this.props.case.isolationDates.length > 0 && this.props.case.isolationDates[this.props.index]) {
                        if (this.props.case.isolationDates[this.props.index].startDate !== null && item.id !== 'startDate') {
                            minimumDate = this.props.case.isolationDates[this.props.index].startDate
                        }
                        if (this.props.case.isolationDates[this.props.index].endDate !== null && item.id !== 'endDate') {
                            maximumDate = this.props.case.isolationDates[this.props.index].endDate
                        }
                    }
                }
            } else if (this.props.screen === 'ContactsSingleScreen') {
                if (item.id === 'dob' || item.id === 'dateOfReporting') {
                    maximumDate = new Date()
                }
            } else if (this.props.screen === 'ExposureScreen') {
                if (item.id === 'contactDate') {
                    maximumDate = new Date()
                }
            }

            if (item.objectType === 'Address' && item.id === 'date') {
                maximumDate = new Date()
            }
        }
        
        let dateValidation = {minimumDate, maximumDate}
        return dateValidation
    }

    computeDataForDropdown = (item, contact) => {
        if (item.id === 'exposedTo') {
            if (this.props.cases && this.props.cases.length > 0){
                return this.props.cases.map((e) => {return {value: ((e.firstName ? e.firstName : '') + (e.lastName ? (" " + e.lastName) : ''))}});
            }
        }

        if (item.id === 'address') {
            return contact.addresses.map((e) => {return Object.assign({}, e, {value: getAddress(e, true)})});
        }

        if (item.id === 'riskLevel') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId.includes("RISK_LEVEL")
            }).map((o) => {return {value: this.getTranslation(o.value), id: o.value}})
        }

        if (item.id === 'classification') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId.includes("CASE_CLASSIFICATION")
            }).map((o) => {return {label: this.getTranslation(o.value), value: o.value}})
        }

        if (item.id === 'gender') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_GENDER'
            }).map((o) => {return {label: this.getTranslation(o.value), value: o.value}})
        }

        if (item.id === 'typeId') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_ADDRESS_TYPE'
            }).map((o) => {return {label: this.getTranslation(o.value), value: o.value}})
        }

        if (item.id === 'labName') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_LAB_NAME'
            }).map((o) => {return {value: this.getTranslation(o.value), id: o.value}})
        }

        if (item.id === 'sampleType') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_TYPE_OF_SAMPLE'
            }).map((o) => {return {value: this.getTranslation(o.value), id: o.value}})
        }

        if (item.id === 'testType') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_TYPE_OF_LAB_TEST'
            }).map((o) => {return {value: this.getTranslation(o.value), id: o.value}})
        }

        if (item.id === 'result') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_LAB_TEST_RESULT'
            }).map((o) => {return {value: this.getTranslation(o.value), id: o.value}})
        }

        if (item.id === 'status') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_LAB_TEST_RESULT_STATUS'
            }).map((o) => {return {value: this.getTranslation(o.value), id: o.value}})
        }

        if (item.id === 'categories') {
            return _.filter(this.props.helpCategory, (o) => {
                return o.deleted === false && o.fileType === 'helpCategory.json'
            }).map((o) => {return {label: this.getTranslation(o.name), value: o._id}})
        }

        return [];
    };

    computeValueForCaseSortScreen = (item, index) => {
        if (index !== null && index >= 0) {
            if (item.objectType === 'Sort') {
                return this.props.filter && this.props.filter.sort && Array.isArray(this.props.filter.sort) && this.props.filter.sort.length > 0 && this.props.filter.sort[index][item.id] !== undefined ?
                this.getTranslation(this.props.filter.sort[index][item.id]) : '';
            }
        }
        return this.props.filter && this.props.filter[item.id] ? this.getTranslation(this.props.filter[item.id]) : '';
    }

    computeValueForHelpSingleScreen = (item) => {
        return this.props.helpItem && this.props.helpItem[item.id] ? this.getTranslation(this.props.helpItem[item.id]) : '';
    }
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
        contacts: state.contacts,
        cases: state.cases,
        events: state.events,
        referenceData: state.referenceData,
        locations: state.locations,
        translation: state.app.translation,
        helpCategory: state.helpCategory
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(CardComponent);
