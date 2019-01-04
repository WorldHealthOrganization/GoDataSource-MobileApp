/**
 * Created by florinpopa on 25/07/2018.
 */
/**
 * Created by florinpopa on 19/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {View, Text, StyleSheet, Platform, Dimensions, Image, FlatList, ScrollView} from 'react-native';
import {ListItem, Icon} from 'react-native-material-ui';
import {calculateDimension, handleExposedTo, getAddress, extractIdFromPouchId} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import Button from './Button';
import styles from './../styles';
import Ripple from 'react-native-material-ripple';
import ElevatedView from 'react-native-elevated-view';
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

class CardComponent extends Component {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {
            showDropdown: false
        };
    }

    // Please add here the react lifecycle methods that you need
    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.screen === 'FollowUpsFilter' || nextProps.screen === 'CasesFilter' || nextProps.screen === 'HelpFilter') {
            return true
        }

        if (nextProps.screen === 'FollowUpsSort' || nextProps.screen === 'CasesSort' || nextProps.screen === 'HelpSort') {
            return false
        }

        if (this.props.followUp) {
            if (this.props.followUp.date !== nextProps.followUp.date) {
                return true
            }
        }

        let myDatePickerItems = []
        let hasDateChanged = null

        //ContactsSingleScreen
        if (nextProps && nextProps.item && nextProps.screen === 'ContactsSingleScreen') {
            myDatePickerItems = nextProps.item.filter((e) => {return e.type === 'DatePicker'})
            if (myDatePickerItems.length > 0) {
                hasDateChanged = myDatePickerItems.filter((e) => {return this.props.contact[e.id] !== nextProps.contact[e.id]})
            }
        }

        if (this.props.contact && hasDateChanged && hasDateChanged.length > 0) {
            console.log("It's for single screen contact");
            return true
        }

        //Usual place of residence change for Contacts and Cases
        if (nextProps.screen === 'ContactsSingleScreen' || nextProps.screen === 'CaseSingleScreen') {
            if (nextProps.anotherPlaceOfResidenceWasChosen !== undefined && nextProps.anotherPlaceOfResidenceWasChosen === true) {
                this.props.anotherPlaceOfResidenceChanged()
                return true
            }
        }

        if (nextProps.screen === 'ContactsSingleScreen') {
            if (this.props.contact && this.props.contact.addresses && Array.isArray(this.props.contact.addresses)) {
                if (this.props.contact.addresses.length === nextProps.contact.addresses.length) {
                    for (let i = 0; i < this.props.contact.addresses.length; i++) {
                        if (this.props.contact.addresses[i].locationId !== nextProps.contact.addresses[i].locationId) {
                            return true
                        }
                        if (this.props.contact.addresses[i].date !== nextProps.contact.addresses[i].date) {
                            return true
                        }
                    }
                }
            }
            if (this.props.contact !== null && nextProps.contact !== null && nextProps.contact.age !== null && this.props.contact.age !== null && this.props.contact !== undefined && nextProps.contact !== undefined && nextProps.contact.age !== undefined && this.props.contact.age !== undefined) {
                if (this.props.contact.age.months !== undefined && this.props.contact.age.months !== null && this.props.contact.age.years !== undefined && this.props.contact.age.years !== null) {
                    if (this.props.contact.age.months === 0 && this.props.contact.age.years === 0 && nextProps.contact.age.months === 0 && nextProps.contact.age.years === 0) {
                        return true
                    } else if (this.props.contact.age.months !== nextProps.contact.age.months || this.props.contact.age.years !== nextProps.contact.age.years){
                        return true
                    } else if (nextProps.contact.age.months === 0 || this.props.contact.age.years === 0){
                        return true
                    }
                }
            }
        }

        //CaseSingleScreen
        if (nextProps && nextProps.item && nextProps.screen === 'CaseSingleScreen') {
            myDatePickerItems = nextProps.item.filter((e) => {return e.type === 'DatePicker'})
            if (myDatePickerItems.length > 0) {
                hasDateChanged = myDatePickerItems.filter((e) => {return this.props.case[e.id] !== nextProps.case[e.id]})
            }
        }
        if (this.props.case) {
            if (hasDateChanged && hasDateChanged.length > 0) {
                return true
            } else if (this.props.case.deceased !== nextProps.case.deceased) {
                return true
            }
            if (this.props.case.hospitalizationDates && this.props.case.hospitalizationDates.length > 0 && nextProps.case.hospitalizationDates && nextProps.case.hospitalizationDates.length > 0 && this.props.case.hospitalizationDates.length === nextProps.case.hospitalizationDates.length) {
                for (let i=0; i<this.props.case.hospitalizationDates.length; i++){
                    if (this.props.case.hospitalizationDates[i][nextProps.item[0].id] !== undefined && this.props.case.hospitalizationDates[i][nextProps.item[1].id] !== undefined) {
                        if (this.props.case.hospitalizationDates[i][nextProps.item[0].id] !== nextProps.case.hospitalizationDates[i][nextProps.item[0].id] || this.props.case.hospitalizationDates[i][nextProps.item[1].id] !== nextProps.case.hospitalizationDates[i][nextProps.item[1].id]){
                            return true
                        }
                    }
                }
            }
            if (this.props.case.isolationDates && this.props.case.isolationDates.length > 0 && nextProps.case.isolationDates && nextProps.case.isolationDates.length > 0 && this.props.case.isolationDates.length === nextProps.case.isolationDates.length) {
                for (let i=0; i<this.props.case.isolationDates.length; i++){
                    if (this.props.case.isolationDates[i][nextProps.item[0].id] !== undefined && this.props.case.isolationDates[i][nextProps.item[1].id] !== undefined) {
                        if (this.props.case.isolationDates[i][nextProps.item[0].id] !== nextProps.case.isolationDates[i][nextProps.item[0].id] || this.props.case.isolationDates[i][nextProps.item[1].id] !== nextProps.case.isolationDates[i][nextProps.item[1].id]){
                            return true
                        }
                    }
                }
            }
        }

        if (this.props.isEditMode !== nextProps.isEditMode) {
            return true
        }

        if (nextProps.screen === 'CaseSingleScreen') {

            //SwitchInput type inputs should not update => infinite loop refresh
            if (this.props.case && this.props.case.addresses && Array.isArray(this.props.case.addresses)) {
                if (this.props.case.addresses.length === nextProps.case.addresses.length) {
                    for (let i = 0; i < this.props.case.addresses.length; i++) {
                        if (this.props.case.addresses[i].locationId !== nextProps.case.addresses[i].locationId) {
                            return true
                        }
                        if (this.props.case.addresses[i].date !== nextProps.case.addresses[i].date) {
                            return true
                        }
                    }
                }
            }
            if (this.props.case !== null && nextProps.case !== null && nextProps.case.age !== null && this.props.case.age !== null && this.props.case !== undefined && nextProps.case !== undefined && nextProps.case.age !== undefined && this.props.case.age !== undefined) {
                if (this.props.case.age.months !== undefined && this.props.case.age.months !== null && this.props.case.age.years !== undefined && this.props.case.age.years !== null) {
                    if (this.props.case.age.months !== nextProps.case.age.months || this.props.case.age.years !== nextProps.case.age.years){
                        return true
                    } else if (nextProps.case.age.months === 0 && this.props.case.age.months !== 0 || nextProps.case.age.years === 0 && this.props.case.age.years !== 0 ){
                        return true
                    }
                }
            }
        }

        if (nextProps.screen === 'ExposureScreen') {
            return true;
        }

        if (this.props.selectedItemIndexForTextSwitchSelectorForAge !== null && this.props.selectedItemIndexForTextSwitchSelectorForAge !== undefined && nextProps.selectedItemIndexForTextSwitchSelectorForAge !== null && nextProps.selectedItemIndexForTextSwitchSelectorForAge !== undefined){
            if (this.props.selectedItemIndexForTextSwitchSelectorForAge !== nextProps.selectedItemIndexForTextSwitchSelectorForAge) {
                return true;
            }
        }
        if (this.props.selectedItemIndexForAgeUnitOfMeasureDropDown !== null && this.props.selectedItemIndexForAgeUnitOfMeasureDropDown !== undefined && nextProps.selectedItemIndexForAgeUnitOfMeasureDropDown !== null && nextProps.selectedItemIndexForAgeUnitOfMeasureDropDown !== undefined){
            if (this.props.selectedItemIndexForAgeUnitOfMeasureDropDown !== nextProps.selectedItemIndexForAgeUnitOfMeasureDropDown) {
                return true
            }
        }
        
        return false;
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <ElevatedView elevation={3} style={[style.container, {
                marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                width: calculateDimension(config.designScreenSize.width - 32, false, this.props.screenSize),
                marginVertical: 4,
                minHeight: calculateDimension(72, true, this.props.screenSize)
            }, this.props.style]}>
                <ScrollView scrollEnabled={false} style={{flex: 1}} contentContainerStyle={{flexGrow: 1}}>
                    {
                        this.props && this.props.item && this.props.item.map((item, index) => {
                            return this.handleRenderItem(item,index);
                        })
                    }
                </ScrollView>
            </ElevatedView>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (item, index) => {
        // item = item.item;
        return (
            <View style={[style.containerCardComponent, {
                flex: 1
            }]} key={index}>
                {
                    this.handleRenderItemByType(item)
                }
            </View>
        )
    };

    handleRenderItemByType = (item) => {

        let width = calculateDimension(315, false, this.props.screenSize);
        let marginHorizontal = calculateDimension(14, false, this.props.screenSize);
        let addContactFromCasesScreen = false;
        let value = '';
        let minimumDate = undefined;
        let maximumDate = undefined;
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

        if (this.props.screen === 'FollowUpsFilter' || this.props.screen === 'CasesFilter' || this.props.screen === 'HelpFilter') {
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
            if (item.type === 'DropDown' && item.id === 'categories') {
                data = this.computeDataForDropdown(item);
                value = this.props.filter.filter[item.id];
            }
        }

        if (this.props.screen === 'FollowUpsSort' || this.props.screen === 'CasesSort') {
            if (item.type === 'DropdownInput' && item.id === 'sortCriteria') {
                let configSortCiteriaFilter = config.sortCriteriaDropDownItems.filter ((e) => {
                    return this.props.filter.sort.map((k) => {return k.sortCriteria}).indexOf(e.value) === -1
                })

                item.data = configSortCiteriaFilter.map((e) => { return {label: this.getTranslation(e.value), value: e.value }})
                value = this.computeValueForCaseSortScreen(item, this.props.index);
            }
            if (item.type === 'DropdownInput' && item.id === 'sortOrder') {
                item.data = config.sortOrderDropDownItems.map((e) => { return {label: this.getTranslation(e.value), value: e.value }})
                value = this.computeValueForCaseSortScreen(item, this.props.index);
            }
            if (item.type === 'ActionsBar') {
                item.onPressArray = [this.props.onDeletePress]
            }
        }

        if (this.props.screen === 'HelpSort') {
            if (item.type === 'DropdownInput' && item.id === 'sortCriteria') {
                let configSortCiteriaFilter = config.helpItemsSortCriteriaDropDownItems.filter ((e) => {
                    return this.props.filter.sort.map((k) => {return k.sortCriteria}).indexOf(e.value) === -1
                })

                item.data = configSortCiteriaFilter.map((e) => { return {label: this.getTranslation(e.value), value: e.value }})
                value = this.computeValueForCaseSortScreen(item, this.props.index);
            }
            if (item.type === 'DropdownInput' && item.id === 'sortOrder') {
                item.data = config.sortOrderDropDownItems.map((e) => { return {label: this.getTranslation(e.value), value: e.value }})
                value = this.computeValueForCaseSortScreen(item, this.props.index);
            }
            if (item.type === 'ActionsBar') {
                item.onPressArray = [this.props.onDeletePress]
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

        if (this.props.screen === 'CaseSingleScreen') {
            if (item.type === 'DropdownInput') {
                item.data = this.computeDataForCasesSingleScreenDropdownInput(item, this.props.index);
            }
            if (item.type === 'ActionsBar') {
                item.onPressArray = [this.props.onDeletePress]
            }

            if (item.type === 'DatePicker' && this.props.case[item.id] !== undefined) {
                value = this.props.case[item.id]
            } else if (item.type === 'DropDownSectioned') {
                if (this.props.case && this.props.case.addresses && Array.isArray(this.props.case.addresses) && this.props.case.addresses[this.props.index] && this.props.case.addresses[this.props.index][item.id] && this.props.case.addresses[this.props.index][item.id] !== "") {
                    for (let i = 0; i < this.props.locations.length; i++) {
                        let myLocationName = this.getLocationNameById(this.props.locations[i], this.props.case.addresses[this.props.index][item.id])
                        if (myLocationName !== null){
                            value = myLocationName
                            break
                        }
                    }
                }
            } else if (item.type === 'SwitchInput' && this.props.case[item.id] !== undefined) {
                value = this.props.case[item.id]
            } else {
                value = this.computeValueForCasesSingleScreen(item, this.props.index);
            }
            if (this.props.selectedItemIndexForTextSwitchSelectorForAge !== null && this.props.selectedItemIndexForTextSwitchSelectorForAge !== undefined && item.objectType === 'Case' && item.dependsOn !== undefined && item.dependsOn !== null){
                let itemIndexInConfigTextSwitchSelectorValues = config[item.dependsOn].map((e) => {return e.value}).indexOf(item.id)
                if (itemIndexInConfigTextSwitchSelectorValues > -1) {
                    if (itemIndexInConfigTextSwitchSelectorValues != this.props.selectedItemIndexForTextSwitchSelectorForAge) {
                        return
                    }
                }
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

        switch(item.type) {
            case 'Section':
                return (
                    <Section
                        label={item.label}
                        hasBorderBottom={item.hasBorderBottom}
                        borderBottomColor={item.borderBottomColor}
                        containerStyle={{height: calculateDimension(54, true, this.props.screenSize)}}
                        translation={this.props.translation}
                    />
                );
            case 'TextInput':
                return (
                    <TextInput
                        id={item.id}
                        label={item.label}
                        index={this.props.index}
                        value={value}
                        isEditMode={item.isEditMode}
                        isRequired={item.isRequired}
                        onChange={this.props.onChangeText}
                        multiline={item.multiline}
                        style={{width: width, marginHorizontal: marginHorizontal}}
                        objectType={item.objectType}
                        keyboardType={item.keyboardType}
                        translation={this.props.translation}
                    />
                );
            case 'DropdownInput':
                return (
                    <DropdownInput
                        id={item.id}
                        index={this.props.index}
                        label={item.label}
                        labelValue={item.labelValue}
                        value={value}
                        data={item.data}
                        isEditMode={isEditModeForDropDownInput}
                        isRequired={item.isRequired}
                        onChange={this.props.onChangeDropDown}
                        style={{width: width, marginHorizontal: marginHorizontal}}
                        objectType={item.objectType}
                        translation={this.props.translation}
                    />
                );
            case 'DropDown':
                return (
                    <DropDown
                        key={item.id}
                        id={item.id}
                        label={translations.dropDownLabels.selectedAnswersLabel}
                        labelValue={item.label}
                        value={value}
                        data={data}
                        isEditMode={true}
                        isRequired={item.required}
                        onChange={this.props.onChangeMultipleSelection}
                        style={{width: width, marginHorizontal: marginHorizontal}}
                        dropDownStyle={{width: width, alignSelf: 'center'}}
                        showDropdown={this.state.showDropdown}
                        objectType={item.objectType}
                    />
                );
            case 'DropDownSectioned':
                return (
                    <DropDownSectioned
                        key={item.id}
                        id={item.id}
                        label={item.label}
                        index={this.props.index}
                        value={value}
                        data={this.props.locations}
                        isEditMode={item.isEditMode}
                        isRequired={item.isRequired}
                        sectionedSelectedItems={sectionedSelectedItems}
                        onChange={this.props.onChangeSectionedDropDown}
                        style={{width: width, marginHorizontal: marginHorizontal}}
                        dropDownStyle={{width: width, alignSelf: 'center'}}
                        objectType={item.objectType}
                        single={item.single}
                    />
                );
            case 'SwitchInput':
                return(
                    <SwitchInput
                        id={item.id}
                        label={item.label}
                        index={this.props.index}
                        value={value}
                        showValue={true}
                        isEditMode={item.isEditMode}
                        isRequired={item.isRequired}
                        onChange={this.props.onChangeSwitch}
                        activeButtonColor={item.activeButtonColor}
                        activeBackgroundColor={item.activeBackgroundColor}
                        style={{justifyContent: 'space-between', width: width, marginHorizontal: marginHorizontal}}
                        objectType={item.objectType}
                        translation={this.props.translation}
                    />
                );
            case 'DatePicker':
                return (
                    <DatePicker
                        id={item.id}
                        label={item.label}
                        value={value}
                        index={this.props.index}
                        isEditMode={item.isEditMode}
                        isRequired={item.isRequired}
                        onChange={this.props.onChangeDate}
                        minimumDate={minimumDate}
                        maximumDate={maximumDate}
                        style={{width: width, marginHorizontal: marginHorizontal}}
                        objectType={item.objectType}
                        translation={this.props.translation}
                    />
                );
            case 'Selector':
                return (
                    <Selector
                        id={item.id}
                        key={item.id}
                        data={item.data}
                        selectItem={this.props.onSelectItem}
                        style={{width: width, height: '100%', marginHorizontal: marginHorizontal}}
                        objectType={item.objectType}
                    />
                );
            case 'IntervalPicker':
                return (
                    <IntervalPicker
                        id={item.id}
                        label={item.label}
                        value={item.value}
                        min={item.min}
                        max={item.max}
                        style={{width, marginHorizontal}}
                        onChange={this.props.onChangeInterval}
                        objectType={item.objectType}
                    />
                );
            case 'ActionsBar':
                return (
                    <ActionsBar
                        id={item.id}
                        key={item.id}
                        addressIndex={this.props.index}
                        textsArray={item.textsArray}
                        textsStyleArray={item.textsStyleArray}
                        onPressArray={item.onPressArray}
                        containerTextStyle={{width, marginHorizontal, height: calculateDimension(46, true, this.props.screenSize)}}
                        isEditMode = {this.props.isEditMode !== undefined && this.props.isEditMode !== null ? this.props.isEditMode : true}
                        translation={this.props.translation}
                    />
                );
            case 'TextSwitchSelector':
                return (
                    <TextSwitchSelector 
                        selectedItem={this.props[item.selectedItemIndexForTextSwitchSelector]}
                        selectedItemIndexForTextSwitchSelector={item.selectedItemIndexForTextSwitchSelector}
                        onChange={this.props.onChangeTextSwitchSelector}
                        values={item.values}
                        isEditMode = {this.props.isEditMode}
                        style={{width: width, marginHorizontal: marginHorizontal}}
                        translation={this.props.translation}
                    />
                );
            case 'TextInputWithDropDown':
                return (
                    <TextInputWithDropDown 
                        id={item.id}
                        label={item.label}
                        index={this.props.index}
                        value={value}
                        isEditMode={item.isEditMode}
                        isRequired={item.isRequired}
                        multiline={item.multiline}
                        dropDownData={item.dropDownData}
                        onChange={this.props.onChangeextInputWithDropDown}
                        style={{width: width, marginHorizontal: marginHorizontal}}
                        objectType={item.objectType}
                        keyboardType={item.keyboardType}
                        onChangeDropDown={this.props.onChangeTextSwitchSelector}
                        selectedDropDownItemIndex={this.props[item.selectedItemIndexForAgeUnitOfMeasureDropDown]}
                        selectedItemIndexForAgeUnitOfMeasureDropDown ={item.selectedItemIndexForAgeUnitOfMeasureDropDown}
                        translation={this.props.translation}
                    />
                )
            default:
                return (
                    <View style={{backgroundColor: 'red'}}>
                        <Text>{"TODO: item type: " + item.type + " is not implemented yet"}</Text>
                    </View>
                )
        }
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

            //Other validations that doesn't have to be added yet
            // * Event:
            //     * date
            //         * same or before
            //             * current date
            //     * dateOfReporting
            //         * same or before
            //             * current date
            // * Case lab:
            //     * dateSampleTaken
            //         * same or before
            //             * current date
            //             * dateSampleDelivered
            //             * dateTesting
            //             * dateOfResult
            //     * dateSampleDelivered
            //         * same or before
            //             * current date
            //             * dateTesting
            //             * dateOfResult
            //         * same or after
            //             * dateSampleTaken
            //     * dateTesting
            //         * same or before
            //             * current date
            //             * dateOfResult
            //         * same or after
            //             * dateSampleDelivered
            //             * dateSampleTaken
            //     * dateOfResult
            //         * same or before
            //             * current date
            //         * same or after
            //             * dateTesting
            //             * dateSampleDelivered
            //             * dateSampleTaken
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

        // return followUp[id] ? followUp[id] : contact[id] ? contact[id] : '';

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

        // if (item.type === 'DropdownInput') {
        //     value = this.props.exposure && this.props.exposure[item.id] && this.props.exposure[item.id].id;
        // }

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

    computeDataForCasesSingleScreenDropdownInput = (item, index) => {
        // console.log("computeDataForCasesSingleScreenDropdownInput: ", item, this.props.case);
        if (item.id === 'riskLevel') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId.includes("RISK_LEVEL")
            }).map((o) => {return {value: this.getTranslation(o.value), id: o.value}})
        }
        if (item.id === 'gender') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_GENDER'
            }).map((o) => {return {label: this.getTranslation(o.value), value: o.value}})
        }
        if (item.id === 'typeId') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_ADDRESS_TYPE'
            }).map((o) => {return {value: this.getTranslation(o.value), id: o.value}})
        }
        if (item.id === 'classification') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_CASE_CLASSIFICATION'
            }).map((o) => {return {label: this.getTranslation(o.value), value: o.value}})
        }
        if (item.id === 'outcomeId') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_OUTCOME'
            }).map((o) => {return {label: this.getTranslation(o.value), value: o.value}})
        }
        if (item.id === 'type') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_DOCUMENT_TYPE'
            }).map((o) => {return {label: this.getTranslation(o.value), value: o.value}})
        }
        if (item.id === 'occupation') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_OCCUPATION'
            }).map((o) => {return {value: this.getTranslation(o.value), id: o.value}})
        }
    };

    getLocationNameById = (element, locationId) => {
        if(extractIdFromPouchId(element._id, 'location') === locationId) {
            return element.name;
        } else {
            if (element.children && element.children.length > 0) {
                let i;
                let result = null;

                for(i=0; result === null && i < element.children.length; i++){
                    result = this.getLocationNameById(element.children[i], locationId);
                }
                return result;
            }
        }
        return null;
    }

    computeDataForContactsSingleScreenDropdownInput = (item, index) => {
        // console.log("computeDataForContactsSingleScreenDropdownInput: ", item, this.props.contact);
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

    getTranslation = (value) => {
        let valueToBeReturned = value;
        if (value && typeof value === 'string' && value.includes('LNG')) {
            valueToBeReturned = value && this.props.translation && Array.isArray(this.props.translation) && this.props.translation[this.props.translation.map((e) => {return e && e.token ? e.token : null}).indexOf(value)] ? this.props.translation[this.props.translation.map((e) => {
                return e.token
            }).indexOf(value)].translation : '';
        }
        return valueToBeReturned;
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
