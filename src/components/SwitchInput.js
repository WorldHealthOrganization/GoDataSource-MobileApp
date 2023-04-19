/**
 * Created by mobileclarisoft on 16/07/2018.
 */
import React, {PureComponent} from 'react';
import {Text, View, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import translations from './../utils/translations'
import {getTooltip, getTranslation} from './../utils/functions';
import TooltipComponent from './TooltipComponent';
import {Switch} from 'react-native-ui-lib';
import {isFunction} from './../utils/typeCheckingFunctions';
import styles from './../styles';

class SwitchInput extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
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
    };

    editInput = () => {
        // console.log('Render switchInput stuff: ', this.props.value);
        let tooltip = getTooltip(this.props.label, this.props.translation, this.props.tooltipsMessage, this.props.tooltipsMessage);
        return (
            <View style={[style.switchInput, this.props.style]}>
                <Text style={[style.switchInputLabel, this.props.labelStyle]}>
                    {getTranslation(this.props.label, this.props.translation)}
                </Text>
                <Switch
                    value={this.props.value}
                    // onColor={this.props.activeButtonColor}
                    // onTintColor={this.props.activeBackgroundColor}
                    onColor={styles.primaryColor}
                    onTintColor={styles.backgroundColor}
                    onValueChange={(state) => {
                        // console.log("Value of the SwitchInput changed to: ", state);
                        if (isFunction(this.props.onChange)) {
                            this.props.onChange(
                                state,
                                this.props.id,
                                this.props.objectType ? (this.props.objectType === 'Address' ? this.props.index : this.props.objectType) : null,
                                this.props.objectType
                            )
                        }
                    }}
                    height={18}
                    width={36}
                    thumbSize={14}
                    offColor={styles.secondaryColor}
                    onActivate={() => {console.log('OnActivate SwitchInput');}}
                    onDeactivate={() => {console.log('OnDeactivate SwitchInput');}}
                />
                {
                    tooltip.hasTooltip === true ? (
                        <TooltipComponent
                            tooltipMessage={tooltip.tooltipMessage}
                            style = {{
                                flex: 0,
                                marginTop: 0,
                                marginBottom: 0,
                                marginLeft: 8
                            }}
                        />
                    ) : null
                }
            </View>
        );
    };

    viewInput = () => {
        let tooltip = getTooltip(this.props.label, this.props.translation)
        return (
            <View style={[style.switchInput, this.props.style]}>
                <Text style={style.switchInputLabel}>
                    {getTranslation(this.props.label, this.props.translation)}
                </Text>
                {
                    this.props.showValue ? (
                        <Text style={style.switchInputValue}>
                            {this.props.value !== true ? getTranslation(translations.generalLabels.noAnswer, this.props.translation) : getTranslation(translations.generalLabels.yesAnswer, this.props.translation)}
                        </Text>
                    ) : null
                }
                {
                    tooltip.hasTooltip === true ? (
                        <TooltipComponent
                            tooltipMessage={tooltip.tooltipMessage}
                            style = {{
                                flex: 0,
                                marginTop: 0,
                                marginBottom: 0,
                                marginLeft: 8
                            }}
                        />
                    ) : null
                }
            </View>
        )
    };

    // Please write here all the methods that are not react native lifecycle methods
}

const style = StyleSheet.create({
    switchInput: {
        flexDirection: 'row',
        marginVertical: 8
    },
    switchInputLabel: {
        color: styles.secondaryColor,
        flex: 1,
        fontFamily: 'Roboto-Regular',
        fontSize: 14
    },
    switchInputValue: {
        color: styles.textColor,
        fontFamily: 'Roboto-Regular',
        fontSize: 14
    }
});

SwitchInput.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.bool.isRequired,
    showValue: PropTypes.bool.isRequired,
    isEditMode: PropTypes.bool.isRequired,
    isRequired: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    activeButtonColor: PropTypes.string.isRequired,
    activeBackgroundColor: PropTypes.string.isRequired,
    style: PropTypes.object,
    labelStyle: PropTypes.object,
};

export default SwitchInput;
