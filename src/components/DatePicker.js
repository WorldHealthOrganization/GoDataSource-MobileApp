/**
 * Created by florinpopa on 04/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import { TextField } from 'react-native-material-textfield';
import DateTimePicker from 'react-native-modal-datetime-picker';
import Ripple from 'react-native-material-ripple';
import moment from 'moment/min/moment.min';
import {getTranslation, getTooltip, createDate} from './../utils/functions';
import TooltipComponent from './TooltipComponent';
import {useDarkMode} from 'react-native-dark-mode';
import stylesGlobal from './../styles';

const DatePicker = React.memo(({
            id,
            isEditMode,
            label,
            value,
            isRequired,
            onChange,
            style,
            objectType,
            translation,
            minimumDate,
            maximumDate,
            index,
            skipLabel
                               }) => {
    const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState(false);
    const [date, setDate] = useState(value);

    React.useEffect(() => {
        if(date !== value){
            setDate(value);
        }
    },[value])


    const isDarkMode = useDarkMode();

    const editInput = () => {
        let newDate = date;
        let tooltip = getTooltip(label, translation);
        let customStyle = newDate !== undefined && newDate !== null ? customStyles.hasDateTooltipStyle : customStyles.emptyDateTooltipStyle;
        if (newDate && typeof newDate === 'string' && newDate !== '') {
            newDate = new Date(value);
        }
        return (
            <View style={[{flexDirection: 'row', marginVertical: 8}, style]}>
                <View style={{flex: 1}}>
                    {newDate !== null && newDate !== undefined && newDate !== '' ? (
                            <View>
                                <Ripple onPress={handleShowDatePicker}>
                                    <Text style={customStyles.datePickerLabel}>
                                        {isRequired ? getTranslation(label, translation) + ' * ' : getTranslation(label, translation)}
                                    </Text>

                                    <Text style={customStyles.datePickerValue}>
                                        {moment.utc(newDate).format('MM/DD/YYYY') || ''}
                                    </Text>
                                </Ripple>
                            </View>
                        ) : (
                            <Ripple onPress={handleShowDatePicker}>
                                <TextField
                                    label={isRequired ? getTranslation(label, translation) + ' * ' : getTranslation(label, translation)}
                                    textColor={stylesGlobal.textColor}
                                    fontSize={14}
                                    labelTextStyle={{fontFamily: 'Roboto-Regular'}}
                                    tintColor={stylesGlobal.primaryColor}
                                >
                                </TextField>
                            </Ripple>
                        )
                    }
                    <DateTimePicker
                        minimumDate={minimumDate || null}
                        maximumDate={maximumDate || null}
                        timeZoneOffsetInMinutes={0}
                        isVisible={isDateTimePickerVisible}
                        onConfirm={handleDatePicked}
                        onCancel={handleDateCancelled}
                        isDarkModeEnabled={isDarkMode}
                        date={value ? new Date(
                            Date.parse(
                                moment(value, 'DD/MM/YYYY').format(
                                    'ddd MMM DD YYYY HH:mm:ss ZZ',
                                ),
                            ),
                        ) : new Date()}
                    />
                </View>
                {
                    tooltip.hasTooltip === true ? (
                        <TooltipComponent
                            tooltipMessage={tooltip.tooltipMessage}
                            style={customStyle}
                        />
                    ) : null
                }
            </View>
        );
    };


    const viewInput = () => {
        let tooltip = getTooltip(label, translation);
        return (
            <View style={[{flexDirection: 'row', marginVertical: 8}, style]}>
                <View style={{flex: 1}}>
                    {
                        skipLabel ? (null) : (
                            <Text style={customStyles.datePickerLabel}>
                                {getTranslation(label, translation)}
                            </Text>
                        )
                    }
                    <Text style={customStyles.datePickerValue}>
                        {value !== null && value !== undefined && value !== '' ? moment.utc(value).format('MM/DD/YYYY') : ''}
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

    const handleShowDatePicker = () => {
        console.log("Show date picker", isDateTimePickerVisible);
        setIsDateTimePickerVisible(true);
    };

    const handleDateCancelled = () => {
        if (isDateTimePickerVisible) {
            setIsDateTimePickerVisible(false);
        }
    };

    const handleDatePicked = (date) => {
        // console.log("### date picked: ", date, moment.utc(date).format());
        handleDateCancelled();
        setDate(createDate(date));
        onChange(
            createDate(date),
            id,
            objectType ? (objectType === 'Address' || objectType === 'DateRanges' || objectType === 'Vaccines' ? index : objectType) : null,
            objectType
        );
    };

    return isEditMode ? editInput() : viewInput()
});


// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const customStyles = StyleSheet.create({
    datePickerLabel: {
        color: stylesGlobal.secondaryColor,
        fontFamily: 'Roboto-Regular',
        fontSize: 14
    },
    datePickerValue: {
        color: stylesGlobal.textColor,
        fontFamily: 'Roboto-Regular',
        fontSize: 14
    },
    hasDateTooltipStyle: {
        flex: 0,
        marginTop: 16,
        marginBottom: 16
    },
    emptyDateTooltipStyle: {
        flex: 0,
        marginTop: 32,
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
    style: PropTypes.object,
    skipLabel: PropTypes.bool
};

DatePicker.defaultTypes = {
    id: null,
    label: 'Select date',
    value: new Date(),
    isEditMode: true,
    isRequired: false,
    onChange: () => {console.log('Default DatePicker onChange')},
    style: {},
    skipLabel: false
};

export default DatePicker;
