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
import TextInput from './TextInput';
import SwitchInput from './SwitchInput';
import DatePicker from './DatePicker';
import _ from 'lodash';

class CardComponent extends Component {

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
        return (
            <ElevatedView elevation={3} style={[this.props.style, style.container, {
                marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                width: calculateDimension(config.designScreenSize.width - 32, false, this.props.screenSize),
                marginVertical: 4
            }]}>
                <ScrollView scrollEnabled={false}>
                    {
                        this.props.item.map((item) => {
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
                minHeight: calculateDimension(72, true, this.props.screenSize)
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
        let followUp = this.props.followUp;
        let contact = this.props.contact;

        if (item.type === 'DropdownInput') {
            item.data = this.computeDataForDropdown(item, contact);
        }

        let value = this.computeValueForId(item.type, item.id, followUp, contact);

        switch(item.type) {
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
                    />
                );
            case 'DropdownInput':
                return (
                    <DropdownInput
                        id={item.id}
                        label={item.label}
                        value={value}
                        data={item.data}
                        isEditMode={item.isEditMode}
                        isRequired={item.isRequired}
                        onChange={this.props.onChangeDropDown}
                        style={{width: width, marginHorizontal: marginHorizontal}}
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
                    />
                );
            case 'DatePicker':
                return(
                    <DatePicker
                        id={item.id}
                        label={item.label}
                        value={value}
                        isEditMode={item.isEditMode}
                        isRequired={item.isRequired}
                        onChange={this.props.onChangeDate}
                        style={{width: width, marginHorizontal: marginHorizontal}}
                    />
                );
            default:
                return(
                    <View>
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

        if (type === 'SwitchInput' && id === "fillGeolocation") {
            return followUp.fillGeolocation ? true : false
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
}


// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 2
    },
    containerCardComponent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        contacts: state.contacts,
        cases: state.cases,
        events: state.events,
        referenceData: state.referenceData
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(CardComponent);
