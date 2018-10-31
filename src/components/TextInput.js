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

class TextInput extends PureComponent {

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
    }

    // Please write here all the methods that are not react native lifecycle methods
    editInput = () => {
        return (
            <View style={[{
            },this.props.style]}>
                <TextField
                    label={this.props.isRequired ? this.props.label + ' * ' : this.props.label}
                    value={this.props.value != undefined ? this.props.value : ''}
                    onChangeText={this.handleOnChangeText}
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
                    onPress={() => {console.log("On press textInput")}}
                    keyboardType={this.props.keyboardType ? this.props.keyboardType : 'default'}
                    onSubmitEditing={this.props.onSubmitEditing}
                />
            </View>
        );
    };

    viewInput = () => {
        return (
            <View style={[{},this.props.style]}>
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
    }

    handleOnChangeText = (state) => {
        if (this.props.labelValue) {
            //QuestionCard
            console.log("textInput has this.props.labelValue: ", this.props.data, state);
                this.props.onChange(
                    state,
                    this.props.id
                )
        } else {
            //CardComponent
            this.props.onChange(
                state,
                this.props.id,
                this.props.objectType ? (this.props.objectType === 'Address' || this.props.objectType === 'LabResult' || this.props.objectType === 'Documents' ? this.props.index : this.props.objectType) : null,
                this.props.objectType
            )
        }
    }
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const styles = StyleSheet.create({
    editLabel: {

    },
    viewLabel: {

    }
});


TextInput.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    isEditMode: PropTypes.bool.isRequired,
    isRequired: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
    multiline: PropTypes.bool
};

export default TextInput;
