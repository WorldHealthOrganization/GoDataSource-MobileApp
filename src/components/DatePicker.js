/**
 * Created by florinpopa on 04/07/2018.
 */
import React, {PureComponent} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Icon} from 'react-native-material-ui';
import PropTypes from 'prop-types';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import { TextField } from 'react-native-material-textfield';
import DateTimePicker from 'react-native-modal-datetime-picker';
import Ripple from 'react-native-material-ripple';
import style from './../styles';
import moment from 'moment';

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
        // console.log("### date from value: ", this.props.value);
        return (
            <View style={[{marginVertical: 10},this.props.style]}>
                {
                    this.props.value !== undefined && this.props.value !== null ? (
                        <View>
                            <Text style={{
                                fontFamily: 'Roboto',
                                fontSize: 12.5,
                                textAlign: 'left',
                                color: 'rgba(0, 0, 0, .38)',
                            }}>
                                {this.props.isRequired ? this.props.label + ' * ' : this.props.label}
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
                                    {this.props.value !== undefined && this.props.value !== null ? moment(this.props.value).format('MM/DD/YYYY') : ''}
                                </Text>
                            </Ripple>
                        </View>
                    ) : ( 
                        <Ripple onPress={this.handleShowDatePicker}>
                            <TextField
                                label={this.props.isRequired ? this.props.label + ' * ' : this.props.label}
                                textColor='rgb(0,0,0)'
                                labelFontSize={12.5}
                                labelHeight={30}
                                labelTextStyle={{
                                    fontFamily: 'Roboto',
                                    textAlign: 'left',
                                    marginBottom: 7.5
                                }}
                                tintColor='rgb(77,176,160)'>
                            </TextField> 
                        </Ripple>
                    )
                }
                <DateTimePicker
                    minimumDate={this.props.minimumDate}
                    maximumDate={this.props.maximumDate}
                    isVisible={this.state.isDateTimePickerVisible}
                    onConfirm={this.handleDatePicked}
                    onCancel={this.handleDateCancelled}
                />
            </View>
        );
    };

    viewInput = () => {
        return (
            <View style={[{ 
            },this.props.style]}>
                <Text style={{
                    fontFamily: 'Roboto-Regular',
                    fontSize: 15,
                    lineHeight: 30,
                    textAlign: 'left',
                    color: 'rgb(0,0,0)',
                    marginBottom: 7.5
                }}>
                    {this.props.label}
                </Text>
                <Text
                style={{
                    fontFamily: 'Roboto-Light',
                    fontSize: 12.5,
                    textAlign: 'left',
                    color: 'rgb(60,60,60)',
                }}>
                    {this.props.value !== undefined && this.props.value !== null ? moment(this.props.value).format('MM/DD/YYYY') : ''}
                </Text>
            </View>
        );
    };

    handleShowDatePicker = () => {
        // if (!this.state.isDateTimePickerVisible && this.refs.textField.isFocused()) {
            this.setState({isDateTimePickerVisible: true})
        // }
    };

    handleDateCancelled = () => {
        if (this.state.isDateTimePickerVisible) {
            this.setState({isDateTimePickerVisible: false})
        }
    };

    handleDatePicked = (date) => {
        console.log("### date picked: ", date, moment(date).format());
        this.props.onChange(
            date, 
            this.props.id, 
            this.props.objectType ? (this.props.objectType === 'Address' || this.props.objectType === 'LabResult' || this.props.objectType === 'HospitalizationDates' || this.props.objectType === 'IsolationDates' ? this.props.index : this.props.objectType) : null, 
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

    }
});


DatePicker.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    isEditMode: PropTypes.bool.isRequired,
    isRequired: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object
};

export default DatePicker;
