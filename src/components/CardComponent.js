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
import DropDownSectioned from './DropDownSectioned';
import TextInput from './TextInput';
import SwitchInput from './SwitchInput';
import DatePicker from './DatePicker';
import _ from 'lodash';
import Section from './Section';
import Selector from './Selector';
import IntervalPicker from './IntervalPicker';
import ActionsBar from './ActionsBar';

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
        if (nextProps.screen === 'FollowUpsFilter' || nextProps.screen === 'CasesFilter') {
            if (nextProps && nextProps.item && nextProps.item[1] && this.props && this.props.item && this.props.item[1] && nextProps.item[1].type === 'Selector' && nextProps.item[1].id === 'gender') {
                // console.log("Return true for selector: ", nextProps.filter.filter[nextProps.item[1].id], this.props.filter.filter[this.props.item[1].id]);
                return true;
            }
            if (nextProps && nextProps.item && nextProps.item[1] && this.props && this.props.item && this.props.item[1] && nextProps.item[1].type === 'IntervalPicker' && nextProps.item[1].id === 'age' && nextProps.filter.filter[nextProps.item[1].id] !== this.props.filter.filter[this.props.item[1].id]) {
                // console.log("Return true for interval: ");
                return true;
            }
            if (nextProps && nextProps.item && nextProps.item[1] && this.props && this.props.item && this.props.item[1] && nextProps.item[1].type === 'DropDownSectioned' && nextProps.item[1].id === 'selectedLocations' && nextProps.filter.filter[nextProps.item[1].id] !== this.props.filter.filter[this.props.item[1].id]) {
                // console.log("Return true for sectioned drop down, ");
                return true;
            }
            if (nextProps && nextProps.item && nextProps.item[1] && this.props && this.props.item && this.props.item[1] && nextProps.item[1].type === 'DropdownInput' && nextProps.item[1].id === 'exposure') {
                // console.log("Return true for exposure: ");
                return false;
            }
        }

        if (this.props.followUp) {
            console.log("It's for single screen followUp");
            return true
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

        if (nextProps.screen === 'ContactsSingleScreen' && nextProps.anotherPlaceOfResidenceWasChosen !== undefined && nextProps.anotherPlaceOfResidenceWasChosen === true) {
            this.props.anotherPlaceOfResidenceChanged()
            return true
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
        if (nextProps.screen === 'CaseSingleScreen') {
            if (this.props.isEditMode !== nextProps.isEditMode) {
                return true
            }
        }

        if (nextProps.screen === 'ExposureScreen') {
            return true;
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
        let value = '';
        let minimumDate = undefined
        let maximumDate = undefined
        let data = [];

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
                item.data = item.data.map((e) => {return {value: e.value, selected: this.props.filter && this.props.filter.filter && this.props.filter.filter.gender && this.props.filter.filter.gender[e.value] ? true : false}})
            }
            if (item.type === 'IntervalPicker' && item.id === 'age') {
                item.value = this.props.filter.filter[item.id];
            }

            if (item.type === 'DropDownSectioned' && item.id === 'selectedLocations') {
                item.value = this.props.filter.filter[item.id];
            }

            if (item.type === 'DropDown' && item.id === 'exposure') {
                if (this.props.cases && this.props.cases.length > 0){
                    data = this.props.cases.map((e) => {return {label: ((e.firstName ? e.firstName : '') + (e.lastName ? (" " + e.lastName) : '')), value: e.id}})
                }
                value = this.props.filter.filter[item.id];
            }
            if (item.type === 'DropDown' && item.id == 'classification') {
                data = this.computeDataForDropdown(item);
                value = this.props.filter.filter[item.id];
            }
        }

        if (this.props.screen === 'ExposureScreen') {
            if (item.type === 'DropdownInput') {
                item.data = this.computeDataForExposure(item);
            }
            value = this.computeExposureValue(item);
        }

        if (this.props.screen === 'ContactsSingleScreen') {
            if (item.type === 'DropdownInput') {
                item.data = this.computeDataForContactsSingleScreenDropdownInput(item, this.props.index);
            }
            if (item.type === 'ActionsBar') {
                item.onPressArray = [this.props.onDeletePress]
            }
            value = this.computeValueForContactsSingleScreen(item, this.props.index);

            if (item.type === 'DatePicker') {
                value = this.props.contact[item.id]
            }
        }

        if (this.props.screen === 'ContactsSingleScreenAddress') {
            console.log("ContactsSingleScreenAddress: ", item);
        }

        if (this.props.screen === 'CaseSingleScreen') {
            if (item.type === 'DropdownInput') {
                item.data = this.computeDataForCasesSingleScreenDropdownInput(item, this.props.index);
            }
            if (item.type === 'ActionsBar') {
                item.onPressArray = [this.props.onDeletePress]
            }

            value = this.computeValueForCasesSingleScreen(item, this.props.index);

            if (item.type === 'DatePicker' && this.props.case[item.id] !== undefined) {
                value = this.props.case[item.id]
            } else if (item.type === 'SwitchInput' && this.props.case[item.id] !== undefined) {
                value = this.props.case[item.id]
            }

            //HospitalizationDates && IsolationDates validation
            if (item.type === 'DatePicker') {
                if( item.objectType === 'HospitalizationDates'){
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
            }
        }

        switch(item.type) {
            case 'Section':
                return (
                    <Section
                        label={item.label}
                        hasBorderBottom={item.hasBorderBottom}
                        borderBottomColor={item.borderBottomColor}
                        containerStyle={{height: calculateDimension(54, true, this.props.screenSize)}}
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
                        isEditMode={this.props.screen === 'ExposureScreen' ? item.id === 'exposure' ? true : item.isEditMode : item.isEditMode}
                        isRequired={item.isRequired}
                        onChange={this.props.onChangeDropDown}
                        style={{width: width, marginHorizontal: marginHorizontal}}
                        objectType={item.objectType}
                    />
                );
            case 'DropDown':
                return (
                    <DropDown
                        key={item.id}
                        id={item.id}
                        label={'Select answer(s)'}
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
                        key={item.variable}
                        id={item.variable}
                        index={this.props.index}
                        labelValue={item.text}
                        value={item.value}
                        data={this.props.locations}
                        isEditMode={true}
                        isRequired={item.required}
                        onChange={this.props.onChangeSectionedDropDown}
                        style={{width: width, marginHorizontal: marginHorizontal, flex: 1}}
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
                        isEditMode = {this.props.isEditMode}
                    />
                );
            default:
                return (
                    <View style={{backgroundColor: 'red'}}>
                        <Text>{"TODO: item type: " + item.type + " is not implemented yet"}</Text>
                    </View>
                )
        }
    };

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
                return o.categoryId.includes("RISK_LEVEL")
            }).map((o) => {return {value: this.getTranslation(o.value), id: o.value}})
        }

        if (item.id === 'classification') {
            return _.filter(this.props.referenceData, (o) => {
                return o.categoryId.includes("CASE_CLASSIFICATION")
            }).map((o) => {return {label: this.getTranslation(o.value), value: o.value}})
        }

        if (item.id === 'gender') {
            return _.filter(this.props.referenceData, (o) => {
                return o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_GENDER'
            }).map((o) => {return {label: this.getTranslation(o.value), value: o.value}})
        }

        if (item.id === 'typeId') {
            return _.filter(this.props.referenceData, (o) => {
                return o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_ADDRESS_TYPE'
            }).map((o) => {return {label: this.getTranslation(o.value), value: o.value}})
        }

        if (item.id === 'labName') {
            return _.filter(this.props.referenceData, (o) => {
                return o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_LAB_NAME'
            }).map((o) => {return {value: this.getTranslation(o.value), id: o.value}})
        }

        if (item.id === 'sampleType') {
            return _.filter(this.props.referenceData, (o) => {
                return o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_TYPE_OF_SAMPLE'
            }).map((o) => {return {value: this.getTranslation(o.value), id: o.value}})
        }

        if (item.id === 'testType') {
            return _.filter(this.props.referenceData, (o) => {
                return o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_TYPE_OF_LAB_TEST'
            }).map((o) => {return {value: this.getTranslation(o.value), id: o.value}})
        }

        if (item.id === 'result') {
            return _.filter(this.props.referenceData, (o) => {
                return o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_LAB_TEST_RESULT'
            }).map((o) => {return {value: this.getTranslation(o.value), id: o.value}})
        }

        if (item.id === 'status') {
            return _.filter(this.props.referenceData, (o) => {
                return o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_LAB_TEST_RESULT_STATUS'
            }).map((o) => {return {value: this.getTranslation(o.value), id: o.value}})
        }

        return [];
    };

    computeDataForExposure = (item) => {
        console.log ('computeDataForExposure', JSON.stringify(item))
        let data = [];
        if (item.categoryId) {
            data = this.props.referenceData.filter((e) => {
                return e.categoryId === item.categoryId
            }).map((e) => {
                return {value: this.getTranslation(e.value), id: e._id.split('_')[e._id.split('_').length - 1]}
            });
        } else {
            if (item.id === 'exposure') {
                if (this.props.type !== 'Contact') {
                    data = this.props.contacts.map((e) => {return {value: ((e.firstName ? e.firstName + ' ' : '') + (e.lastName ? e.lastName : '')), id: extractIdFromPouchId(e._id, 'person'), type: 'contact'}});
                }
                if (this.props.cases && this.props.cases.length > 0){
                    data = this.props.cases.map((e) => {return {value: ((e.firstName ? e.firstName + ' ' : '') + (e.lastName ? e.lastName : '')), id: extractIdFromPouchId(e._id, 'person'), type: 'case'}});
                }
                data = data.concat(this.props.events.map((e) => {return {value: e.name, id: extractIdFromPouchId(e._id, 'person'), type: 'event'}}));
            } else {
                if (item.id === 'clusterId') {

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
                let persons = this.props.exposure.persons.filter((e) => {return e.type !== (this.props.type === 'Contact' ? 'contact' : 'contact')});
                value = this.extractNameForExposure(persons[0]);
            }
        }
        console.log ('computeExposureValue', JSON.stringify(value))

        return this.getTranslation(value);
    };

    extractNameForExposure = (person) => {
        switch (person.type) {
            case 'case':
                return (this.props.cases && Array.isArray(this.props.cases) && this.props.cases.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id) > -1 && this.props.cases[this.props.cases.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].firstName ? (this.props.cases[this.props.cases.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].firstName + ' ') : '') +
                (this.props.cases && Array.isArray(this.props.cases) && this.props.cases.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id) > -1 && this.props.cases[this.props.cases.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].lastName ? (this.props.cases[this.props.cases.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].lastName) : '');
            case 'event':
                return (this.props.events && Array.isArray(this.props.events) && this.props.events.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id) > -1 && this.props.events[this.props.events.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].name ? (this.props.events[this.props.events.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].name) : '');
            case 'contact':
                return (this.props.contacts && Array.isArray(this.props.contacts) && this.props.contacts.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id) > -1 && this.props.contacts[this.props.contacts.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].firstName ? (this.props.contacts[this.props.contacts.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].firstName + ' ') : '') +
                (this.props.contacts && Array.isArray(this.props.contacts) && this.props.contacts.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id) > -1 && this.props.contacts[this.props.contacts.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].lastName ? (this.props.contacts[this.props.contacts.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].lastName) : '');
            default:
                return ''
        }
    };

    computeDataForCasesSingleScreenDropdownInput = (item, index) => {
        console.log("computeDataForCasesSingleScreenDropdownInput: ", item, this.props.case);
        if (item.id === 'riskLevel') {
            return _.filter(this.props.referenceData, (o) => {
                return o.categoryId.includes("RISK_LEVEL")
            }).map((o) => {return {value: this.getTranslation(o.value), id: o.value}})
        }
        if (item.id === 'gender') {
            return _.filter(this.props.referenceData, (o) => {
                return o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_GENDER'
            }).map((o) => {return {value: this.getTranslation(o.value), id: o.value}})
        }
        if (item.id === 'name') {
            return _.filter(this.props.referenceData, (o) => {
                return o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_ADDRESS_TYPE'
            }).map((o) => {return {value: this.getTranslation(o.value), id: o.value}})
        }
        if (item.id === 'classification') {
            return _.filter(this.props.referenceData, (o) => {
                return o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_CASE_CLASSIFICATION'
            }).map((o) => {return {label: this.getTranslation(o.value), value: o.value}})
        }
        if (item.id === 'outcome') {
            return _.filter(this.props.referenceData, (o) => {
                return o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_OUTCOME'
            }).map((o) => {return {label: this.getTranslation(o.value), value: o.value}})
        }
        if (item.id === 'documentType') {
            return _.filter(this.props.referenceData, (o) => {
                return o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_DOCUMENT_TYPE'
            }).map((o) => {return {label: this.getTranslation(o.value), value: o.value}})
        }
    };

    computeDataForContactsSingleScreenDropdownInput = (item, index) => {
        console.log("computeDataForContactsSingleScreenDropdownInput: ", item, this.props.contact);
        if (item.id === 'riskLevel') {
            return _.filter(this.props.referenceData, (o) => {
                return o.categoryId.includes("RISK_LEVEL")
            }).map((o) => {return {value: this.getTranslation(o.value), id: o.value}})
        }
        if (item.id === 'gender') {
            return _.filter(this.props.referenceData, (o) => {
                return o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_GENDER'
            }).map((o) => {return {value: this.getTranslation(o.value), id: o.value}})
        }
        if (item.id === 'name') {
            return _.filter(this.props.referenceData, (o) => {
                return o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_ADDRESS_TYPE'
            }).map((o) => {return {value: this.getTranslation(o.value), id: o.value}})
        }
    };

    computeValueForCasesSingleScreen = (item, index) => {
        if (index || index >= 0) {
            if (item.objectType === 'Address') {
                return this.props.case && this.props.case.addresses && Array.isArray(this.props.case.addresses) && this.props.case.addresses.length > 0 && this.props.case.addresses[index][item.id] !== undefined ?
                this.getTranslation(this.props.case.addresses[index][item.id]) : '';
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
            return this.props.contact && this.props.contact.addresses && Array.isArray(this.props.contact.addresses) ?
                this.getTranslation(this.props.contact.addresses[index][item.id]) : '';
        }
        return this.props.contact && this.props.contact[item.id] ? this.getTranslation(this.props.contact[item.id]) : '';
    };

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
        translation: state.app.translation
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(CardComponent);
