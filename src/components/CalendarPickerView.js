/**
 * Created by florinpopa on 16/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {StyleSheet, Platform} from 'react-native';
import {calculateDimension} from './../utils/functions';
import Calendar from "react-native-calendars/src/calendar/index";
import Modal from 'react-native-root-modal';
import {connect} from "react-redux";
import ElevatedView from 'react-native-elevated-view';
import moment from 'moment-timezone';
import styles from './../styles';

class CalendarPickerView extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {
            selectedDate: this.parseDate(this.props.value)
        };

        this.calculateTop = this.calculateTop.bind(this);
    }

    // Please add here the react lifecycle methods that you need


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        console.log("selected date: ", this.state.selectedDate);
        return (
            <Modal
                visible={this.props.showPicker}
                style={[style.container, {
                    top: this.calculateTop(),
                    left: calculateDimension(16, false, this.props.screenSize),
                    width: this.props.width
                }, Platform.OS === 'android' && {elevation: 2}]}
            >
                <ElevatedView elevation={4} style={style.calendarWrapper}>
                    <Calendar
                        current={ this.state.selectedDate }
                        markedDates={{[this.state.selectedDate]: {selected: true, selectedColor: styles.primaryColor}}}
                        onDayPress={this.handleDateChanged}
                        monthFormat={'MMMM yyyy'}

                        style={style.calendarStyle}
                        theme={{
                            backgroundColor: 'transparent',
                            calendarBackground: 'transparent',
                            todayBackgroundColor: styles.primaryColorRgb,
                            todayTextColor: styles.primaryColor,
                            dotColor: styles.warningColor,
                            selectedDotColor: styles.warningColor,
                            disabledArrowColor: styles.disabledColor,
                            arrowColor: styles.primaryColor,
                            selectedDayTextColor: styles.backgroundColor,
                            dayTextColor: styles.textColor,
                            textDisabledColor: styles.disabledColor,
                            indicatorColor: styles.primaryColor,
                            textMonthFontFamily: 'Roboto-Bold',
                            weekVerticalMargin: 4
                        }}
                    />
                </ElevatedView>
            </Modal>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    calculateTop = () => {
        return calculateDimension(80, true, this.props.screenSize) + (Platform.OS === 'ios' ? this.props.screenSize.height === 812 ? 44 : 20 : 0);
    };

    parseDate = (date) => {
        return moment.tz(date, this.props.timezone).format('YYYY-MM-DD');
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
        borderRadius: 4,
        position: 'absolute'
    },
    calendarWrapper: {
        borderRadius: 4,
        flex: 1
    },
    calendarStyle: {
        backgroundColor: styles.backgroundColor,
        borderRadius: 4
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        translation: state.app.translation,
        timezone: state.app.timezone
    };
}

export default connect(mapStateToProps)(CalendarPickerView);
