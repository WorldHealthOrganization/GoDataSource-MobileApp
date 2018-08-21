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
import {calculateDimension, handleExposedTo, getAddress} from './../utils/functions';
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
        if (nextProps.screen === 'FollowUpsFilter') {
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

        if (this.props.followUp && this.props.contact) {
            console.log("It's for single screen");
            return true
        }

        return true;
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
                        this.props && this.props.item && this.props.item.map((item) => {
                            return this.handleRenderItem(item);
                        })
                    }
                </ScrollView>
            </ElevatedView>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (item) => {
        // item = item.item;
        return (
            <View style={[style.containerCardComponent, {
                flex: 1
            }]}>
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
        let data = [];

        if (this.props.followUp && this.props.contact) {
            let followUp = this.props.followUp;
            let contact = this.props.contact;
            if (item.type === 'DropdownInput') {
                item.data = this.computeDataForDropdown(item, contact);
            }

            value = this.computeValueForId(item.type, item.id, followUp, contact);
        }

        if (this.props.screen === 'FollowUpsFilter') {
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
                data = this.props.cases.map((e) => {return {label: ((e.firstName ? e.firstName : '') + (e.lastName ? (" " + e.lastName) : '')), value: e.id}})
                value = this.props.filter.filter[item.id];
            }
        }

        if (this.props.screen === 'ExposureScreen') {
            if (item.type === 'DropdownInput') {
                item.data = this.computeDataForExposure(item);
            }
            value = this.computeExposureValue(item);
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
                        label={item.label}
                        labelValue={item.labelValue}
                        value={value}
                        data={item.data}
                        isEditMode={item.isEditMode}
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
                        labelValue={item.text}
                        value={item.value}
                        data={this.props.locations}
                        isEditMode={true}
                        isRequired={item.required}
                        onChange={this.props.onChangeSectionedDropDown}
                        style={{width: width, marginHorizontal: marginHorizontal, flex: 1}}
                        dropDownStyle={{width: width, alignSelf: 'center'}}
                        objectType={item.objectType}
                    />
                );
            case 'SwitchInput':
                return(
                    <SwitchInput
                        id={item.id}
                        label={item.label}
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
                        isEditMode={item.isEditMode}
                        isRequired={item.isRequired}
                        onChange={this.props.onChangeDate}
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
            default:
                return (
                    <View style={{backgroundColor: 'red'}}>
                        <Text>{"TODO: item type: " + item.type + " is not implemented yet"}</Text>
                    </View>
                )
        }
    };

    computeValueForId = (type, id, followUp, contact) => {
        if (type === 'DropdownInput' && id === 'exposedTo') {
            return handleExposedTo(contact, true, this.props.cases);
        }

        if (type === 'DropdownInput' && id === 'address' && followUp.address) {
            return getAddress(followUp.address, true)
        }

        if (type === 'SwitchInput' && id === "fillGeoLocation") {
            return followUp.fillGeoLocation ? true : false
        }



        return followUp[id] ? followUp[id] : contact[id] ? contact[id] : '';
    }

    computeDataForDropdown = (item, contact) => {
        if (item.id === 'exposedTo') {
            return this.props.cases.map((e) => {return {value: ((e.firstName ? e.firstName : '') + (e.lastName ? (" " + e.lastName) : ''))}});
        }

        if (item.id === 'address') {
            return contact.addresses.map((e) => {return Object.assign({}, e, {value: getAddress(e, true)})});
        }

        if (item.id === 'riskLevel') {
            return _.filter(this.props.referenceData, (o) => {
                return o.categoryId.includes("RISK_LEVEL")
            }).map((o) => {return {value: o.value}})
        }

        return [];
    }

    computeDataForExposure = (item) => {
        let data = [];
        if (item.categoryId) {
            data = this.props.referenceData.filter((e) => {
                return e.categoryId === item.categoryId
            }).map((e) => {
                return {value: e.value, id: e.id}
            });
        } else {
            if (item.id === 'exposure') {
                if (this.props.type !== 'Contact') {
                    data = this.props.contacts.map((e) => {return {value: ((e.firstName ? e.firstName + ' ' : '') + (e.lastName ? e.lastName : '')), id: e.id, type: 'contact'}});
                }
                data = this.props.cases.map((e) => {return {value: ((e.firstName ? e.firstName + ' ' : '') + (e.lastName ? e.lastName : '')), id: e.id, type: 'case'}});
                data = data.concat(this.props.events.map((e) => {return {value: e.name, id: e.id, type: 'event'}}));
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

        return value;
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
        locations: state.locations
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(CardComponent);
