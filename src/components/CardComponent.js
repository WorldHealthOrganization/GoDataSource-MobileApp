/**
 * Created by florinpopa on 25/07/2018.
 */
/**
 * Created by florinpopa on 19/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {View, Text, StyleSheet, Platform, Dimensions, Image, FlatList, ScrollView} from 'react-native';
import {ListItem, Icon} from 'react-native-material-ui';
import {calculateDimension} from './../utils/functions';
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

class FollowUpListItem extends PureComponent {

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
            <ElevatedView elevation={3} style={[style.container, {
                marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                width: calculateDimension(this.props.screenSize.width - 32, false, this.props.screenSize),
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
        let source = this.props.source;

        switch(item.type) {
            case 'TextInput':
                return (
                    <TextInput
                        id={item.id}
                        label={item.label}
                        value={item.value}
                        isEditMode={item.isEditMode}
                        isRequired={item.isRequired}
                        onChange={() => {console.log("On change")}}
                        multiline={item.multiline}
                        style={{width: width, marginHorizontal: marginHorizontal}}
                    />
                );
            case 'DropdownInput':
                return (
                    <DropdownInput
                        id={item.id}
                        label={item.label}
                        value={item.value}
                        data={item.data}
                        isEditMode={item.isEditMode}
                        isRequired={item.isRequired}
                        onChange={() => {console.log("On change")}}
                        style={{width: width, marginHorizontal: marginHorizontal}}
                    />
                );
            case 'SwitchInput':
                return(
                    <SwitchInput
                        id={item.id}
                        label={item.label}
                        value={item.value}
                        showValue={true}
                        isEditMode={item.isEditMode}
                        isRequired={item.isRequired}
                        onChange={() => {console.log("On change")}}
                        activeButtonColor={item.activeButtonColor}
                        activeBackgroundColor={item.activeBackgroundColor}
                        style={{width: width, marginHorizontal: marginHorizontal}}
                    />
                );
            case 'DatePicker':
                return(
                    <DatePicker
                        id={item.id}
                        label={item.label}
                        value={item.value}
                        isEditMode={item.isEditMode}
                        isRequired={item.isRequired}
                        onChange={() => {console.log("On change")}}
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
        events: state.events
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(FollowUpListItem);
