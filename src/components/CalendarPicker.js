/**
 * Created by florinpopa on 16/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {StyleSheet} from 'react-native';
import {createDate, checkIfSameDay, getTranslation} from './../utils/functions';
import CalendarPickerView from './CalendarPickerView';
import ButtonWithIcons from './ButtonWithIcons';
import {connect} from "react-redux";
import ElevatedView from 'react-native-elevated-view';
import translations from './../utils/translations';
import moment from "moment-timezone";

class CalendarPicker extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            label: checkIfSameDay(new Date(this.props.value), new Date()) ? getTranslation(translations.generalLabels.today, this.props.translation) : new Date(this.props.value).toLocaleDateString()
        };

        this.handleDateChanged = this.handleDateChanged.bind(this);
    }

    // Please add here the react lifecycle methods that you need


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <ElevatedView elevation={2} style={[style.container, {backgroundColor: 'transparent', width: this.props.width, height: this.props.height}]}>
                <ButtonWithIcons
                    height={this.props.height}
                    width={this.props.width}
                    onPress={this.props.openCalendarModal}
                    label={getTranslation(this.state.label, this.props.translation)}
                    firstIcon="calendar-blank"
                    secondIcon="arrow-drop-down"
                    isFirstIconPureMaterial={false}
                    isSecondIconPureMaterial={true}
                />
                <CalendarPickerView
                    showPicker={this.props.pickerOpen}
                    width={2.1 * this.props.width}
                    dateChanged={this.handleDateChanged}
                    value={this.props.value}
                />
            </ElevatedView>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleDateChanged = (date) => {
        // Adjust timezone differences
        let dateAux = getTranslation(translations.generalLabels.today, this.props.translation);
        if (!checkIfSameDay(new Date(date.dateString), new Date())) {
            // dateAux format = "YYYY-MM-DD"
            // let date1Time = new Date(date.dateString).getTime();
            dateAux = moment(date.dateString).utc(true).toDate().toLocaleDateString();
                // new Date(date1Time + (new Date(date1Time).getTimezoneOffset() * 60 * 1000)).toLocaleDateString();
        }
        // let dateAux = checkIfSameDay(new Date(date.dateString), new Date()) ? 'Today' : new Date(date.dateString).toLocaleDateString();
        this.setState({
            label: dateAux
        }, () => {
            this.props.openCalendarModal();
            this.props.onDayPress(moment(date.dateString).utc(true).toDate().toISOString());
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
        alignItems: 'center',
        borderRadius: 4,
        flexDirection: 'row',
        height: '100%'
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        translation: state.app.translation
    };
}

export default connect(mapStateToProps)(CalendarPicker);
