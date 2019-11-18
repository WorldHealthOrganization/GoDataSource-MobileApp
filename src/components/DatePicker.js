/**
 * Created by florinpopa on 04/07/2018.
 */
import React, {PureComponent} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import { TextField } from 'react-native-material-textfield';
import DateTimePicker from 'react-native-modal-datetime-picker';
import Ripple from 'react-native-material-ripple';
import style from './../styles';
import moment from 'moment';
import {getTranslation, getTooltip, createDate} from './../utils/functions';
import TooltipComponent from './TooltipComponent'

class DatePicker extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {
            isDateTimePickerVisible: false
        };
    }

    // Please add here the react lifecycle methods that you need
    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        if(this.props.isEditMode){
            return this.editInput();
        }else{
            return this.viewInput();
        }
    }

    // Please write here all the methods that are not react native lifecycle methods
    editInput = () => {
        // console.log('This.props.value: ', this.props.value);
        let tooltip = getTooltip(this.props.label, this.props.translation);
        let customStyle = this.props.value !== undefined && this.props.value !== null ? styles.hasDateTooltipStyle : style.emptyDateTooltipStyle;
        return (
            <View style={[{marginVertical: 10, flexDirection: 'row'},this.props.style]}>
                <View style = {{flex: 1}}>
                    {
                        this.props.value !== null && this.props.value !== undefined && this.props.date !== '' ? (
                            <View>
                                <Text style={{
                                    fontFamily: 'Roboto',
                                    fontSize: 12.5,
                                    textAlign: 'left',
                                    color: 'rgba(0, 0, 0, .38)',
                                }}>
                                    {this.props.isRequired ? getTranslation(this.props.label, this.props.translation) + ' * ' : getTranslation(this.props.label, this.props.translation)}
                                </Text>

                                <Ripple onPress={this.handleShowDatePicker}>
                                    <Text 
                                        style={{
                                        fontFamily: 'Roboto-Regular',
                                        fontSize: 15,
                                        textAlign: 'left',
                                        lineHeight: 30,
                                        color: 'rgb(60,60,60)',
                                        marginBottom: 7.5
                                    }}>
                                        {this.props.value !== null && this.props.value !== undefined && this.props.value !== '' ? moment.utc(this.props.value).format('MM/DD/YYYY') : ''}
                                    </Text>
                                </Ripple>
                            </View>
                        ) : ( 
                            <Ripple onPress={this.handleShowDatePicker}>
                                <TextField
                                    label={this.props.isRequired ? getTranslation(this.props.label, this.props.translation) + ' * ' : getTranslation(this.props.label, this.props.translation)}
                                    textColor='rgb(0,0,0)'
                                    labelFontSize={12.5}
                                    labelHeight={30}
                                    labelTextStyle={{
                                        fontFamily: 'Roboto',
                                        textAlign: 'left',
                                        marginBottom: 7.5
                                    }}
                                    tintColor='rgb(77,176,160)'
                                >
                                </TextField> 
                            </Ripple>
                        )
                    }
                    <DateTimePicker
                        minimumDate={this.props.minimumDate}
                        maximumDate={this.props.maximumDate}
                        timeZoneOffsetInMinutes={0}
                        isVisible={this.state.isDateTimePickerVisible}
                        onConfirm={this.handleDatePicked}
                        onCancel={this.handleDateCancelled}
                    />
                </View>
                {
                    tooltip.hasTooltip === true ? (
                        <TooltipComponent
                            tooltipMessage={tooltip.tooltipMessage}
                            style = {customStyle}
                        />
                    ) : null
                }
            </View>
        );
    };

    viewInput = () => {
        let tooltip = getTooltip(this.props.label, this.props.translation);
        return (
            <View style={[{flexDirection: 'row'}, this.props.style]}>
                <View style={{flex: 1}}> 
                    <Text style={{
                        fontFamily: 'Roboto-Regular',
                        fontSize: 15,
                        lineHeight: 30,
                        textAlign: 'left',
                        color: 'rgb(0,0,0)',
                        marginBottom: 7.5
                    }}>
                        {getTranslation(this.props.label, this.props.translation)}
                    </Text>
                    <Text
                style={{
                    fontFamily: 'Roboto-Light',
                    fontSize: 12.5,
                    textAlign: 'left',
                    color: 'rgb(60,60,60)',
                }}>
                    {this.props.value !== null && this.props.value !== undefined && this.props.value !== '' ? moment.utc(this.props.value).format('MM/DD/YYYY') : ''}
                </Text>
                </View>
                {
                    tooltip.hasTooltip === true ? (
                        <TooltipComponent
                            tooltipMessage={tooltip.tooltipMessage}
                        />
                    ) : null
                }
            </View>
        );
    };

    handleShowDatePicker = () => {
        this.setState({isDateTimePickerVisible: true})
    };

    handleDateCancelled = () => {
        if (this.state.isDateTimePickerVisible) {
            this.setState({isDateTimePickerVisible: false})
        }
    };

    handleDatePicked = (date) => {
        console.log("### date picked: ", date, moment.utc(date).format());
        this.props.onChange(
            createDate(date),
            this.props.id, 
            this.props.objectType ? (this.props.objectType === 'Address' || this.props.objectType === 'LabResult' || this.props.objectType === 'DateRanges' || this.props.objectType === 'Vaccines' ? this.props.index : this.props.objectType) : null,
            this.props.objectType
        );
        this.handleDateCancelled();
    };

}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const styles = StyleSheet.create({
    editLabel: {

    },
    viewLabel: {

    },
    hasDateTooltipStyle: {
        flex: 0,
        marginTop: 15,
        marginBottom: 15
    },
    emptyDateTooltipStyle: {
        flex: 0,
        marginTop: 30,
        marginBottom: 8
    }
});


DatePicker.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]).isRequired,
    isEditMode: PropTypes.bool.isRequired,
    isRequired: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object
};

export default DatePicker;
