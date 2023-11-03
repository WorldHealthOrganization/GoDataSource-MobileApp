/**
 * Created by florinpopa on 04/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {useState, useRef} from 'react';
import {View, Text, StyleSheet, TouchableWithoutFeedback} from 'react-native';
import PropTypes from 'prop-types';
import {TextField} from 'react-native-material-textfield';
import DateTimePicker from 'react-native-modal-datetime-picker';
import Ripple from 'react-native-material-ripple';
import moment from 'moment-timezone';
import {getTranslation, getTooltip, createDate} from './../utils/functions';
import TooltipComponent from './TooltipComponent';
import stylesGlobal from './../styles';
import {useSelector} from "react-redux";
import {Button, Icon} from "react-native-material-ui";
import colors from "../styles/colors";

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
    const fieldRef = useRef(null);
    const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState(false);
    let newDate = value;
    if (newDate && typeof newDate === 'string' && newDate !== '') {
        newDate = new Date(value);
    }
    const [date, setDate] = useState(newDate);
    const timezone = useSelector((state) => state.app.timezone);

    React.useEffect(() => {
        if (date !== value) {
            let nDate = value;
            if (nDate && typeof nDate === 'string' && nDate !== '') {
                nDate = new Date(value);
            }
            if (fieldRef.current) {
                fieldRef.current.setValue(nDate ? moment.tz(nDate, timezone).format('MM/DD/YYYY') : '');
            }
            setDate(newDate);
        }
    }, [value])

    const editInput = () => {
        let tooltip = getTooltip(label, translation);
        let customStyle = date !== undefined && date !== null ? customStyles.hasDateTooltipStyle : customStyles.emptyDateTooltipStyle;

        return (
            <View style={[{flexDirection: 'row'}, style]}>
                <TouchableWithoutFeedback
                    onPress={handleDateCancelled}
                >
                    <View style={{flex: 1}}>
                        <Ripple onPress={handleShowDatePicker}>
                            <TextField
                                label={isRequired ? getTranslation(label, translation) + ' * ' : getTranslation(label, translation)}
                                textColor={stylesGlobal.textColor}
                                fontSize={14}
                                value={date ? moment.tz(newDate, timezone).format('MM/DD/YYYY') : null}
                                ref={fieldRef}
                                labelTextStyle={{fontFamily: 'Roboto-Regular'}}
                                tintColor={stylesGlobal.primaryColor}
                            >
                            </TextField>
                        </Ripple>
                        <DateTimePicker
                            minimumDate={minimumDate || null}
                            maximumDate={maximumDate || null}
                            timeZoneOffsetInMinutes={moment.tz(timezone).utcOffset()}
                            isVisible={isDateTimePickerVisible}
                            onConfirm={handleDatePicked}
                            onCancel={handleDateCancelled}
                            isDarkModeEnabled={false}
                            date={value ? new Date(
                                Date.parse(
                                    moment.tz(new Date(value), 'DD/MM/YYYY', timezone).format(
                                        'ddd MMM DD YYYY HH:mm:ss ZZ',
                                    ),
                                ),
                            ) : new Date()}
                        />
                    </View>
                </TouchableWithoutFeedback>
                {
                    date !== undefined && date !== null ?
                        <TouchableWithoutFeedback
                            onPress={press => {
                                // setDate(null);
                                onChange(
                                    null,
                                    id,
                                    objectType ? (objectType === 'Address' || objectType === 'DateRanges' || objectType === 'Vaccines' ? index : objectType) : null,
                                    objectType
                                );
                            }}
                        >
                            <View style={{
                                marginTop: 16,
                                marginLeft: 8,
                                justifySelf: 'center',
                                justifyContent: 'center',
                                alignSelf: 'center',
                                alignContent: 'center',
                            }}>
                                <Icon
                                    name={'cancel'}
                                    color={colors.primaryColor}
                                    style={{
                                        width: 22,
                                    }}
                                    size={22}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                        :
                        null
                }
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
                        {value !== null && value !== undefined && value !== '' ? moment.tz(value, timezone).format('MM/DD/YYYY') : ''}
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
        setIsDateTimePickerVisible(true);
    };

    const handleDateCancelled = () => {
        if (isDateTimePickerVisible) {
            setIsDateTimePickerVisible(false);
        }
    };

    const handleDatePicked = (datePicked) => {
        handleDateCancelled();
        setDate(createDate(datePicked));
        onChange(
            createDate(datePicked),
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
    onChange: () => {
        console.log('Default DatePicker onChange')
    },
    style: {},
    skipLabel: false
};

export default DatePicker;
