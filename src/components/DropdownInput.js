/**
 * Created by mobileclarisoft on 16/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import PropTypes from 'prop-types';
import {getTranslation, getTooltip, getDropDownInputDisplayParameters} from './../utils/functions';
import { Dropdown } from 'react-native-material-dropdown';
import TooltipComponent from './TooltipComponent'
import get from 'lodash/get';
import styles from './../styles';

class DropdownInput extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
    }

    // Please add here the react lifecycle methods that you need


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        if (this.props.isEditMode) {
            return this.editInput();
        } else {
            return this.viewInput();
        }
    }

    // Please write here all the methods that are not react native lifecycle methods
    editInput() {
        let tooltip = getTooltip(this.props.label, this.props.translation);
        const dropDownParams = getDropDownInputDisplayParameters(this.props.screenSize, get(this.props, 'data.length', 3));

        return (
            <View style={[{flexDirection: 'row'}, this.props.style]}>
                <View style={style.dropdownWrapper}>
                    <Dropdown
                        label={this.props.isRequired ? getTranslation(this.props.label, this.props.translation) + ' * ' : getTranslation(this.props.label, this.props.translation)}
                        data={this.props.data}
                        value={this.props.value || ''}
                        fontSize={14}
                        labelFontSize={14}
                        textColor={styles.textColor}
                        selectedItemColor={styles.primaryColor}
                        onChangeText={this.handleOnChangeText}
                        dropdownMargins={{min: 4, max: 8}}
                        dropdownPosition={dropDownParams.dropdownPosition}
                        itemCount={dropDownParams.itemCount}
                    />
                </View>
                {
                    tooltip.hasTooltip === true ? (
                        <TooltipComponent tooltipMessage={tooltip.tooltipMessage} />
                    ) : null
                }
            </View>
        );
    }

    viewInput = () => {
        let tooltip = getTooltip(this.props.label, this.props.translation);
        return (
            <View style={[{flexDirection: 'row', marginTop: 8}, this.props.style]}>
                <View style={style.dropdownWrapper}>
                    {
                        this.props.skipLabel ? (null) : (
                            <Text style={style.dropdownWrapperLabel}>
                                {getTranslation(this.props.label, this.props.translation)}
                            </Text>
                        )
                    }
                    <Text style={style.dropdownWrapperValue}>
                        {this.props.value !== undefined ? this.props.value : ''}
                    </Text>
                </View>
                {
                    tooltip.hasTooltip === true ? (
                        <TooltipComponent tooltipMessage={tooltip.tooltipMessage} />
                    ) : null
                }
            </View>
        );
    };

    handleOnChangeText = (state) => {
        console.log("Label value branch: ", this.props.data, state);
        if (this.props.labelValue) {
            if (this.props && this.props.data && Array.isArray(this.props.data)) {
                this.props.onChange(
                    {
                        label: state,
                        value: this.props.data[this.props.data.map((e) => { return e.value}).indexOf(state)].id
                    },
                    this.props.id,
                    this.props.id === 'exposure'
                        ? this.props.data[this.props.data.map((e) => {return e.value}).indexOf(state)].type
                        : this.props.objectType
                            ?   (
                                    this.props.objectType === 'Address' ||
                                    this.props.objectType === 'Documents' ||
                                    this.props.objectType === 'Sort' ||
                                    this.props.objectType === 'DateRanges' ||
                                    this.props.objectType === 'Vaccines'
                                        ? this.props.index
                                        : this.props.objectType
                                )
                            : this.props.data[this.props.data.map((e) => {return e.value}).indexOf(state)].type || null,
                    this.props.objectType
                )
            }
        } else {
            let returnedValue = state;
            if (state && !state.includes("LNG_")) {
                returnedValue = this.props.data.find((e) => e.value === state || e.id === state)
            }
            if (returnedValue && returnedValue.id) {
                returnedValue = returnedValue.id;
            }
            if (returnedValue && returnedValue.value) {
                returnedValue = returnedValue.value;
            }
            this.props.onChange(
                returnedValue,
                this.props.id,
                this.props.objectType
                    ? (this.props.objectType === 'Address' ||
                        this.props.objectType === 'Documents' ||
                        this.props.objectType === 'Sort' ||
                        this.props.objectType === 'DateRanges' ||
                        this.props.objectType === 'Vaccines'
                            ? this.props.index
                            : this.props.objectType)
                    : null,
                this.props.objectType
            )
        }
    }
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    dropdownWrapper: {
        flex: 1
    },
    dropdownWrapperLabel: {
        color: styles.secondaryColor,
        fontFamily: 'Roboto-Regular',
        fontSize: 14
    },
    dropdownWrapperValue: {
        color: styles.textColor,
        fontFamily: 'Roboto-Regular',
        fontSize: 14
    }
});

DropdownInput.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
    isEditMode: PropTypes.bool.isRequired,
    isRequired: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
    skipLabel: PropTypes.bool
};

export default DropdownInput;
