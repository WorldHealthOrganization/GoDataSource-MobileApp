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
import {getTranslation} from './../utils/functions';

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

        let addContactFromCasesScreen = false;
        let value = '';
        let data = [];
        let sectionedSelectedItems = [];

        if (this.props.followUp && this.props.contact) {
            let followUp = this.props.followUp;
            let contact = this.props.contact;
            if (item.type === 'DropdownInput') {
                item.data = this.computeDataForDropdown(item, contact);
            }

            value = this.computeValueForId(item.type, item.id, followUp, contact);
        }

        if (this.props.screen === 'FollowUpsFilter' || this.props.screen === 'CasesFilter') {
            if (item.type === 'Selector' && item.id === 'gender') {
                item.data = item.data.map((e) => {return {
                    value: this.getTranslation(e.value), 
                    selected: this.props.filter && this.props.filter.filter && this.props.filter.filter.gender && this.props.filter.filter.gender[e.value] ? true : false}
                })
            }
            if (item.type === 'IntervalPicker' && item.id === 'age') {
                item.value = this.props.filter.filter[item.id];
            }
            if (item.type === 'DropDownSectioned' && item.id === 'selectedLocations') {
                sectionedSelectedItems = this.props.filter.filter[item.id].map ((e) => {
                    return 'location.json_' + e
                })
            }
            if (item.type === 'DropDown' && item.id === 'exposure') {
                if (this.props.cases && this.props.cases.length > 0){
                    data = this.props.cases.map((e) => {return {label: ((e.firstName ? e.firstName : '') + (e.lastName ? (" " + e.lastName) : '')), value: e.id}})
                }
                value = this.props.filter.filter[item.id];
            }
            if (item.type === 'DropDown' && item.id === 'classification') {
                data = this.computeDataForDropdown(item);
                value = this.props.filter.filter[item.id];
            }
            if (item.type === 'DropdownInput' && item.id === 'sortCriteria') {
                let configSortCiteriaFilter = config.sortCriteriaDropDownItems.filter ((e) => {
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
        }

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

        if (this.props.screen === 'ExposureScreen') {
            if (item.type === 'DropdownInput') {
                item.data = this.computeDataForExposure(item);
            }
            value = this.computeExposureValue(item);
            if (this.props.addContactFromCasesScreen && this.props.addContactFromCasesScreen !== undefined && item.id === 'exposure') {
                addContactFromCasesScreen = true
            }
        }

        if (this.props.screen === 'ContactsSingleScreen') {
            if (item.type === 'DropdownInput') {
                item.data = this.computeDataForContactsSingleScreenDropdownInput(item, this.props.index);
            }
            if (item.type === 'ActionsBar') {
                item.onPressArray = [this.props.onDeletePress]
            }

            if (item.type === 'DatePicker' && item.objectType !== 'Address') {
                value = this.props.contact[item.id]
            } else if (item.type === 'DropDownSectioned') {
                if (this.props.contact && this.props.contact.addresses && Array.isArray(this.props.contact.addresses) && this.props.contact.addresses[this.props.index] && this.props.contact.addresses[this.props.index][item.id] && this.props.contact.addresses[this.props.index][item.id] !== "") {
                    for (let location of this.props.locations) {
                        let myLocationName = this.getLocationNameById(location, this.props.contact.addresses[this.props.index][item.id])
                        if (myLocationName !== null){
                            value = myLocationName
                            break
                        }
                    }
                }
            } else if (item.type === 'SwitchInput' && this.props.contact[item.id] !== undefined) {
                value = this.props.contact[item.id]
            } else {
                value = this.computeValueForContactsSingleScreen(item, this.props.index);
            }

            if (this.props.selectedItemIndexForTextSwitchSelectorForAge !== null && this.props.selectedItemIndexForTextSwitchSelectorForAge !== undefined && item.objectType === 'Contact' && item.dependsOn !== undefined && item.dependsOn !== null){
                let itemIndexInConfigTextSwitchSelectorValues = config[item.dependsOn].map((e) => {return e.value}).indexOf(item.id)
                if (itemIndexInConfigTextSwitchSelectorValues > -1) {
                    if (itemIndexInConfigTextSwitchSelectorValues != this.props.selectedItemIndexForTextSwitchSelectorForAge) {
                        return
                    }
                }
            }
            if (item.id === 'dob' && item.type === 'DatePicker' && item.objectType === 'Contact') {
                maximumDate = new Date();
            }
        }

        if (this.props.screen === 'FollowUpSingle') {
            if (item.type === 'DropdownInput') {
                item.data = this.computeDataForFollowUpSingleScreenDropdownInput(item, this.props.index);
            }
            
            if (item.type === 'DatePicker' && this.props.followUp[item.id] !== undefined) {
                value = this.props.followUp[item.id]
            } else if (item.type === 'SwitchInput' && this.props.followUp[item.id] !== undefined) {
                value = this.props.followUp[item.id]
            } else if (item.type === 'DropDownSectioned') {
                if (this.props.followUp && this.props.followUp.address && this.props.followUp.address[item.id] && this.props.followUp.address[item.id] !== "") {
                    for (let i = 0; i < this.props.locations.length; i++) {
                        let myLocationName = this.getLocationNameById(this.props.locations[i], this.props.followUp.address[item.id])
                        if (myLocationName !== null){
                            value = myLocationName
                            break
                        }
                    }
                }
            } else {
                value = this.computeValueForFollowUpSingleScreen(item);
            }
        }

        if (this.props.screen === 'HelpSingleScreen') {
            value = this.computeValueForHelpSingleScreen(item)
        }

        let isEditModeForDropDownInput = addContactFromCasesScreen ? false : (this.props.screen === 'ExposureScreen' ? item.id === 'exposure' ? true : item.isEditMode : item.isEditMode)

        if (item.type === 'DatePicker' && value === '') {
            value = null
        }

        let dateValidation = this.setDateValidations(item);
        minimumDate = dateValidation.minimumDate;
        maximumDate = dateValidation.maximumDate;
    };

    computeValueForCasesSingleScreen = (item, index) => {
        if (index || index >= 0) {
            if (item.objectType === 'Address') {

                if (item.id === 'lng') {
                    return this.props.case && this.props.case.addresses && Array.isArray(this.props.case.addresses) &&
                    this.props.case.addresses[index] && this.props.case.addresses[index].geoLocation &&
                    this.props.case.addresses[index].geoLocation.coordinates &&
                    Array.isArray(this.props.case.addresses[index].geoLocation.coordinates) ?
                        this.getTranslation(this.props.case.addresses[index].geoLocation.coordinates[0]) : '';
                } else {
                    if (item.id === 'lat') {
                        return this.props.case && this.props.case.addresses && Array.isArray(this.props.case.addresses) &&
                        this.props.case.addresses[index] && this.props.case.addresses[index].geoLocation &&
                        this.props.case.addresses[index].geoLocation.coordinates &&
                        Array.isArray(this.props.case.addresses[index].geoLocation.coordinates) ?
                            this.getTranslation(this.props.case.addresses[index].geoLocation.coordinates[1]) : '';
                    } else {
                        return this.props.case && this.props.case.addresses && Array.isArray(this.props.case.addresses) ?
                            this.getTranslation(this.props.case.addresses[index][item.id]) : '';
                    }
                }
            } else if (item.objectType === 'Documents') {
                return this.props.case && this.props.case.documents && Array.isArray(this.props.case.documents) && this.props.case.documents.length > 0 && this.props.case.documents[index][item.id] !== undefined ?
                    this.getTranslation(this.props.case.documents[index][item.id]) : '';
            } else if (item.objectType === 'HospitalizationDates') {
                return this.props.case && this.props.case.hospitalizationDates && Array.isArray(this.props.case.hospitalizationDates) && this.props.case.hospitalizationDates.length > 0 && this.props.case.hospitalizationDates[index][item.id] !== undefined ?
                    this.getTranslation(this.props.case.hospitalizationDates[index][item.id]) : '';
            } else if (item.objectType === 'IsolationDates') {
                return this.props.case && this.props.case.isolationDates && Array.isArray(this.props.case.isolationDates) && this.props.case.isolationDates.length > 0 && this.props.case.isolationDates[index][item.id] !== undefined ?
                    this.getTranslation(this.props.case.isolationDates[index][item.id]) : '';
            }
        }
        return this.props.case && this.props.case[item.id] ? this.getTranslation(this.props.case[item.id]) : '';
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

    computeValueForId = (type, id, followUp, contact, cases = []) => {
        if (type === 'DropdownInput' && id === 'exposedTo') {
            return handleExposedTo(contact, true, this.props.cases);
        }

        if (type === 'DropdownInput' && id === 'address' && followUp.address) {
            return getAddress(followUp.address, true)
        }

        if (type === 'SwitchInput' && id === "fillGeoLocation") {
            return followUp.fillGeoLocation ? true : false
        }

        if (followUp[id]) {
            if (typeof followUp[id] === 'string' && followUp[id].includes('LNG_')) {
                return this.getTranslation(followUp[id]);
            } else {
                return followUp[id];
            }
        } else {
            if (contact[id]) {
                if (typeof contact[id] === 'string' && contact[id].includes('LNG_')) {
                    return this.getTranslation(contact[id]);
                } else {
                    return contact[id];
                }
            } else {
                if(cases[id]){
                    if (typeof cases[id] === 'string' && cases[id].includes('LNG_')) {
                        return this.getTranslation(cases[id]);
                    } else {
                        return cases[id];
                    }
                }else {
                    return '';
                }
            }
        }
    };

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

    computeDataForExposure = (item) => {
        console.log ('computeDataForExposure', JSON.stringify(item))
        let data = [];
        if (item.categoryId) {
            data = this.props.referenceData.filter((e) => {
                return e.active === true && e.categoryId === item.categoryId
            }).map((e) => {
                return {value: this.getTranslation(e.value), id: extractIdFromPouchId(e._id, 'referenceData')}
            });
        } else {
            if (item.id === 'exposure') {
                if (this.props.type !== 'Contact') {
                    data = this.props.contacts.map((e) => {return {value: ((e.firstName ? e.firstName + ' ' : '') + (e.lastName ? e.lastName : '')), id: extractIdFromPouchId(e._id, 'person'), type: 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT'}});
                }
                if (this.props.cases && this.props.cases.length > 0){
                    data = this.props.cases.map((e) => {return {value: ((e.firstName ? e.firstName + ' ' : '') + (e.lastName ? e.lastName : '')), id: extractIdFromPouchId(e._id, 'person'), type: 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE'}});
                }
                data = data.concat(this.props.events.map((e) => {return {value: e.name, id: extractIdFromPouchId(e._id, 'person'), type: 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_EVENT'}}));
            } else {
                if (item.id === 'clusterId') {
                    // return _.filter(this.props.referenceData, (o) => {
                    //     return o.categoryId.includes("")
                    // }).map((o) => {return {value: this.getTranslation(o.value), id: o.value}})
                }
            }
        }
        return data;
    };

    computeExposureValue = (item) => {
        let value = '';

        value = this.props.exposure[item.id];

        if (item.id === 'exposure') {
            if (this.props.exposure.persons && Array.isArray(this.props.exposure.persons) && this.props.exposure.persons.length > 0) {
                let persons = this.props.exposure.persons.filter((e) => {return e.type !== (this.props.type === 'Contact' ? config.personTypes.contacts : config.personTypes.contacts)});
                value = this.extractNameForExposure(persons[0]);
            }
        }
        console.log ('computeExposureValue', JSON.stringify(value));

        return this.getTranslation(value);
    };

    extractNameForExposure = (person) => {
        switch (person.type) {
            case config.personTypes.cases:
                return (this.props.cases && Array.isArray(this.props.cases) && this.props.cases.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id) > -1 && this.props.cases[this.props.cases.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].firstName ? (this.props.cases[this.props.cases.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].firstName + ' ') : '') +
                    (this.props.cases && Array.isArray(this.props.cases) && this.props.cases.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id) > -1 && this.props.cases[this.props.cases.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].lastName ? (this.props.cases[this.props.cases.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].lastName) : '');
            case config.personTypes.events:
                return (this.props.events && Array.isArray(this.props.events) && this.props.events.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id) > -1 && this.props.events[this.props.events.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].name ? (this.props.events[this.props.events.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].name) : '');
            case config.personTypes.contacts:
                return (this.props.contacts && Array.isArray(this.props.contacts) && this.props.contacts.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id) > -1 && this.props.contacts[this.props.contacts.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].firstName ? (this.props.contacts[this.props.contacts.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].firstName + ' ') : '') +
                    (this.props.contacts && Array.isArray(this.props.contacts) && this.props.contacts.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id) > -1 && this.props.contacts[this.props.contacts.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].lastName ? (this.props.contacts[this.props.contacts.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].lastName) : '');
            default:
                return ''
        }
    };

    computeDataForFollowUpSingleScreenDropdownInput = (item, index) => {
        // console.log("computeDataForFollowUpSingleScreenDropdownInput: ", item, this.props.case);
        if (item.id === 'statusId') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId.includes("LNG_REFERENCE_DATA_CONTACT_DAILY_FOLLOW_UP_STATUS_TYPE")
            }).map((o) => {return {label: this.getTranslation(o.value), value: o.value}})
        }
        if (item.id === 'typeId') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_ADDRESS_TYPE'
            }).map((o) => {return {value: this.getTranslation(o.value), id: o.value}})
        }
    };

    computeDataForContactsSingleScreenDropdownInput = (item, index) => {
        if (item.id === 'riskLevel') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId.includes("RISK_LEVEL")
            }).map((o) => {return {value: this.getTranslation(o.value), id: o.value}})
        }
        if (item.id === 'gender') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_GENDER'
            }).map((o) => {return {value: this.getTranslation(o.value), id: o.value}})
        }
        if (item.id === 'typeId') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_ADDRESS_TYPE'
            }).map((o) => {return {value: this.getTranslation(o.value), id: o.value}})
        }
        if (item.id === 'occupation') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_OCCUPATION'
            }).map((o) => {return {value: this.getTranslation(o.value), id: o.value}})
        }
    };

    computeValueForFollowUpSingleScreen = (item) => {
        if (item.objectType === 'Address') {
            return this.props.followUp && this.props.followUp.address && this.props.followUp.address[item.id] !== undefined ?
                this.getTranslation(this.props.followUp.address[item.id]) : '';
        }
        return this.props.followUp && this.props.followUp[item.id] ? this.getTranslation(this.props.followUp[item.id]) : '';
    }

    computeValueForContactsSingleScreen = (item, index) => {
        if (index || index >= 0) {
            if (item.id === 'lng') {
                return this.props.contact && this.props.contact.addresses && Array.isArray(this.props.contact.addresses) &&
                    this.props.contact.addresses[index] && this.props.contact.addresses[index].geoLocation &&
                    this.props.contact.addresses[index].geoLocation.coordinates &&
                    Array.isArray(this.props.contact.addresses[index].geoLocation.coordinates) ?
                    this.getTranslation(this.props.contact.addresses[index].geoLocation.coordinates[0]) : '';
            } else {
                if (item.id === 'lat') {
                    return this.props.contact && this.props.contact.addresses && Array.isArray(this.props.contact.addresses) &&
                        this.props.contact.addresses[index] && this.props.contact.addresses[index].geoLocation &&
                        this.props.contact.addresses[index].geoLocation.coordinates &&
                        Array.isArray(this.props.contact.addresses[index].geoLocation.coordinates) ?
                        this.getTranslation(this.props.contact.addresses[index].geoLocation.coordinates[1]) : '';
                } else {
                    return this.props.contact && this.props.contact.addresses && Array.isArray(this.props.contact.addresses) ?
                        this.getTranslation(this.props.contact.addresses[index][item.id]) : '';
                }
            }
        }
        return this.props.contact && this.props.contact[item.id] ? this.getTranslation(this.props.contact[item.id]) : '';
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
