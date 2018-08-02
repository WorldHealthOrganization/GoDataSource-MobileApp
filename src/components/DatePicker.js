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
        return (
            <View style={[{

            },this.props.style]}
            >
                <TextField
                    ref="textField"
                    label={this.props.isRequired ? this.props.label + ' * ' : this.props.label}
                    value={this.props.value != undefined ? this.props.value : ''}
                    onChangeText={ (value) => this.props.onChange(value,this.props.id)}
                    textColor='rgb(0,0,0)'
                    fontSize={15}
                    labelFontSize={12.5}
                    labelHeight={30}
                    labelTextStyle={{
                        fontFamily: 'Roboto-Light',
                        textAlign: 'left'
                    }}
                    tintColor='rgb(77,176,160)'
                    multiline={this.props.multiline != undefined ? this.props.multiline : false}
                    editable={!this.state.isDateTimePickerVisible}
                    onFocus={this.handleShowDatePicker}
                />
                <DateTimePicker
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
                <Text style={{
                    fontFamily: 'Roboto-Light',
                    fontSize: 12.5,
                    textAlign: 'left',
                    color: 'rgb(60,60,60)',
                }}>
                    {this.props.value != undefined ? this.props.value : ''}
                </Text>
            </View>
        );
    };

    handleShowDatePicker = () => {
        if (!this.state.isDateTimePickerVisible && this.refs.textField.isFocused()) {
            this.setState({isDateTimePickerVisible: true})
        }
    };

    handleDateCancelled = () => {
        if (this.state.isDateTimePickerVisible) {
            this.setState({isDateTimePickerVisible: false})
        }
    };

    handleDatePicked = (date) => {
        this.props.onChange(date, this.props.id);
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
