/**
 * Created by florinpopa on 04/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {Text, View} from 'react-native';
import PropTypes from 'prop-types';
import {getTooltip, getTranslation} from './../utils/functions';
import {TextField} from 'react-native-material-textfield';
import TooltipComponent from './TooltipComponent';
import lodashGet from 'lodash/get';

class TextInput extends Component {
    constructor(props) {
        super(props);
        this.value = lodashGet(this.props, 'value', ' ');
        this.state = {
            value: lodashGet(this.props, 'value', ' ')
        };

        // If there are any bugs with saving data, please change the delay accordingly
    }

    // Please add here the react lifecycle methods that you need
    componentDidMount() {
        // console.log('CDM TextInput: ', this.props.label, this.props.value);
        this.value = lodashGet(this.props, 'value', ' ');
        this.setState({
            value: lodashGet(this.props, 'value', ' ')
        })
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.isEditMode !== this.props.isEditMode || prevProps.value !== this.props.value) {
            this.value = lodashGet(this.props, 'value', ' ');
            this.setState({
                value: lodashGet(this.props, 'value', ' ')
            })
        }
    }

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
        let tooltip = getTooltip(this.props.label, this.props.translation);
        let value = lodashGet(this.state, 'value', ' ');
        if(value || value === 0){
            value = value.toString()
        } else {
            value = '';
        }
        return (
            <View style={[{flexDirection: 'row'},this.props.style]}>
                <View style={{flex: 1}}> 
                    <TextField
                        label={this.props.isRequired ? getTranslation(this.props.label, this.props.translation) + ' * ' : getTranslation(this.props.label, this.props.translation)}
                        value={value ? value.toString() : ''}
                        onChangeText={this.handleOnChangeText}
                        onBlur={this.handleSubmitEditing}
                        textColor='rgb(0,0,0)'
                        fontSize={15}
                        labelFontSize={15}
                        // labelHeight={30}
                        labelTextStyle={{
                            fontFamily: 'Roboto',
                            textAlign: 'left'
                        }}
                        tintColor='rgb(77,176,160)'
                        multiline={this.props.multiline !== undefined ? this.props.multiline : false}
                        onPress={() => {console.log("On press textInput")}}
                        keyboardType={this.props.keyboardType ? this.props.keyboardType : 'default'}
                        secureTextEntry={this.props.secureTextEntry}
                        onFocus={this.props.onFocus}
                    />
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

    viewInput = () => {
        let localValue = this.extractAgeForViewInput();
        let tooltip = getTooltip(this.props.label, this.props.translation);
        return (
            <View style={[{flexDirection: 'row', marginTop: 7},this.props.style]}>
                <View style={{flex: 1}}>
                    {
                        this.props.skipLabel ? (null) : (
                            <Text style={{
                                fontFamily: 'Roboto-Regular',
                                fontSize: 15,
                                textAlign: 'left',
                                color: 'rgb(0,0,0)',
                                marginBottom: 2,
                            }}>
                                {getTranslation(this.props.label, this.props.translation)}
                            </Text>
                        )
                    }
                    <Text style={{
                        fontFamily: 'Roboto-Light',
                        fontSize: 15,
                        textAlign: 'left',
                        color: 'rgb(60,60,60)',
                    }}>
                        {localValue}
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

    extractAgeForViewInput = () => {
        let localValue = typeof this.props.value === 'number' ? this.props.value : '';
        if (this.props.value && this.props.value != undefined) {
            if (typeof this.props.value === 'string') {
                localValue = this.props.value
            } else {
                if (this.props.value.years && this.props.value.years !== 0) {
                    localValue = this.props.value.years + ' years'
                }
                if (this.props.value.months && this.props.value.months !== 0) {
                    localValue = this.props.value.months + ' months'
                }
            }
        }
        return localValue
    };

    handleOnChangeText = (state) => {
        this.value = state;
    };

    handleSubmitEditing = () => {
        console.log("Handle submit editing", this.value);
        if (this.props.labelValue) {
            //QuestionCard
            console.log("textInput has this.props.labelValue: ", this.props.data, this.value);
            this.props.onChange(
                this.value,
                this.props.id
            )
        } else {
            //CardComponent
            this.props.onChange(
                this.value,
                this.props.id,
                this.props.objectType ? (this.props.objectType === 'Address' || this.props.objectType === 'LabResult' || this.props.objectType === 'Documents' || this.props.objectType === 'DateRanges' ? this.props.index : this.props.objectType) : null,
                this.props.objectType
            )
        }
        if ( this.props.onSubmitEditing !== undefined) {
            this.props.onSubmitEditing();
        }
    };
}

TextInput.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    isEditMode: PropTypes.bool.isRequired,
    isRequired: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
    multiline: PropTypes.bool,
    skipLabel: PropTypes.bool
};

export default TextInput;
