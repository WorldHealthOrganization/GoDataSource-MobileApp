/**
 * Created by florinpopa on 16/07/2018.
 */
import React, {PureComponent} from 'react';
import {TextInput, View, Text, StyleSheet, Platform, Dimensions, TouchableOpacity} from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import {ListItem, Icon, Button} from 'react-native-material-ui';
import {calculateDimension, checkIfSameDay} from './../utils/functions';
import config from './../utils/config';
import CalendarPickerView from './CalendarPickerView';
import Ripple from 'react-native-material-ripple';
import ButtonWithIcons from './ButtonWithIcons';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import ElevatedView from 'react-native-elevated-view';

class CalendarPicker extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            label: checkIfSameDay(new Date(this.props.value), new Date()) ? 'Today' : new Date(this.props.value).toLocaleDateString()
        };

        this.handleDateChanged = this.handleDateChanged.bind(this);
    }

    // Please add here the react lifecycle methods that you need


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <ElevatedView elevation={2} style={[style.container, {width: this.props.width, height: this.props.height}]}>
                <ButtonWithIcons
                    height={this.props.height}
                    width={this.props.width}
                    onPress={this.props.openCalendarModal}
                    label={this.state.label}
                    firstIcon="calendar-blank"
                    secondIcon="arrow-drop-down"
                    isFirstIconPureMaterial={false}
                    isSecondIconPureMaterial={true}
                />
                <CalendarPickerView
                    showPicker={this.props.pickerOpen}
                    width={2.75 * this.props.width}
                    dateChanged={this.handleDateChanged}
                    value={this.props.value}
                />
            </ElevatedView>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleDateChanged = (date) => {
        // Adjust timezone differences
        let dateAux = 'Today';
        if (!checkIfSameDay(new Date(date.dateString), new Date())) {
            // dateAux format = "YYYY-MM-DD"
            let date1Time = new Date(date.dateString).getTime();
            dateAux = new Date(date1Time + (new Date(date1Time).getTimezoneOffset() * 60 * 1000)).toLocaleDateString();
        }
        // let dateAux = checkIfSameDay(new Date(date.dateString), new Date()) ? 'Today' : new Date(date.dateString).toLocaleDateString();
        this.setState({
            label: dateAux
        }, () => {
            this.props.openCalendarModal();
            this.props.onDayPress(new Date(date.dateString));
        })
    };
}

CalendarPicker.defaultProps = {
    width: 124,
    height: 25
};

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {

    },
    containerButton: {
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 4,
        backgroundColor: 'red'
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(CalendarPicker);
