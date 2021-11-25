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
import lodashDebounce from 'lodash/debounce';
import Ripple from "react-native-material-ripple";
import translations from "../utils/translations";

class TextInput extends Component {
    fieldRef = React.createRef();

    constructor(props) {
        super(props);
        this.state = {
            value: lodashGet(this.props, 'value', ' '),
            maskError: false
        };

        this.handleSubmitEditingDB = lodashDebounce(this.handleSubmitEditing, 300);

        // If there are any bugs with saving data, please change the delay accordingly
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        let nextPropsValue = lodashGet(nextProps, 'value', ' ');
        let answer = !(nextPropsValue !== this.props.value && this.state.value === nextPropsValue)
        return answer;
    }

    // Please add here the react lifecycle methods that you need
    componentDidMount() {
        this.setState({
            value: lodashGet(this.props, 'value', ' ')
        })
    }

    componentDidUpdate(prevProps, prevState) {
        let propsValue = lodashGet(this.props, 'value', ' ');
        if (prevProps.isEditMode !== this.props.isEditMode || prevProps.value !== propsValue) {
            if(this.state.value !== propsValue && this.fieldRef.current){
                console.log("What's the ref", this.fieldRef.current);
                this.fieldRef.current.setValue(propsValue);
                this.setState({
                    value: propsValue
                })
            }
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
                        textColor='rgb(0,0,0)'
                        fontSize={15}
                        error={this.state.maskError ? getTranslation(translations.contactSingleScreen.contactIdMaskError, this.props.translation).replace('{{mask}}', this.props.outbreakMask) : null}
                        labelFontSize={15}
                        // labelHeight={30}
                        labelTextStyle={{
                            fontFamily: 'Roboto',
                            textAlign: 'left'
                        }}
                        ref={this.fieldRef}
                        tintColor='rgb(77,176,160)'
                        multiline={this.props.multiline !== undefined ? this.props.multiline : false}
                        keyboardType={this.props.keyboardType ? this.props.keyboardType : 'default'}
                        formatText={this.formatForNumeric}
                        secureTextEntry={this.props.secureTextEntry}
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
                    <Ripple disabled={!this.props.onClickAction} onPress={()=>{this.props.onClickAction(localValue)}}>
                        <Text style={{
                            fontFamily: 'Roboto-Light',
                            fontSize: 15,
                            textAlign: 'left',
                            color: 'rgb(60,60,60)',
                        }}>
                            {localValue}
                        </Text>
                    </Ripple>
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

    formatForNumeric = (text) => {
        if(this.props.keyboardType === 'numeric'){
            return Number.isNaN(parseFloat(text)) ? text : parseFloat(text).toString();
        }
        return text;
    }
    handleOnChangeText = (value) => {
        let maskError = false;
        if(this.props.mask){
            maskError = !this.props.mask.test(value);
        }
        this.setState({
            maskError,
            value
        }, ()=>{
            this.handleSubmitEditingDB();
        })
    };

    handleSubmitEditing = () => {
        if(!this.props.isEditMode || this.props.value === this.state.value){
            return;
        }
        if (this.props.labelValue) {
            //QuestionCard
            this.props.onChange(
                this.state.value,
                this.props.id
            )
        } else {
            //CardComponent
            this.props.onChange(
                this.state.value,
                this.props.id,
                this.props.objectType ? (this.props.objectType === 'Address' || this.props.objectType === 'Documents' || this.props.objectType === 'DateRanges' ? this.props.index : this.props.objectType) : null,
                this.props.objectType,
                this.state.maskError
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
    skipLabel: PropTypes.bool,
    onClickAction: PropTypes.func
};

export default TextInput;
