/**
 * Created by florinpopa on 16/07/2018.
 */
import React, {PureComponent} from 'react';
import {TextInput, View, Text, StyleSheet, Platform, Dimensions} from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import {ListItem, Icon, Button} from 'react-native-material-ui';
import {calculateDimension} from './../utils/functions';
import config from './../utils/config';
import Calendar from "react-native-calendars/src/calendar/index";
import Modal from 'react-native-root-modal';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import ElevatedView from 'react-native-elevated-view';

class CalendarPickerView extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {
            selectedDate: new Date()
        };

        this.calculateTop = this.calculateTop.bind(this);
    }

    // Please add here the react lifecycle methods that you need


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <Modal
                visible={this.props.showPicker}
                style={[style.container, {
                    position: 'absolute',
                    top: this.calculateTop(),
                    left: calculateDimension(16, false, this.props.screenSize),
                    width: this.props.width
                }, Platform.OS === 'android' && {elevation: 2}]}
            >
                <ElevatedView elevation={4} style={{flex: 1}}>
                    <Calendar
                        markedDates={{[this.state.selectedDate]: {marked: true}}}
                        onDayPress={this.handleDateChanged}
                        monthFormat={'MMMM yyyy'}
                    />
                </ElevatedView>
            </Modal>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    calculateTop = () => {
        return calculateDimension(74, true, this.props.screenSize) + (Platform.OS === 'ios' ? this.props.screenSize.height === 812 ? 44 : 20 : 0);
    };

    handleDateChanged = (date) => {
        this.setState({
            selectedDate: date.dateString
        }, () => {
            this.props.dateChanged(date);
        })
    };
}

CalendarPickerView.defaultProps = {
    showPicker: false,
    width: 343
};

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        borderRadius: 5,
        backgroundColor: 'white'
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

export default connect(mapStateToProps, matchDispatchProps)(CalendarPickerView);
