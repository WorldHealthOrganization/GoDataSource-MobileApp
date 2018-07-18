/**
 * Created by mobileclarisoft on 16/07/2018.
 */
import React, {PureComponent} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import { Dropdown } from 'react-native-material-dropdown';

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
        if(this.props.isEditMode){
            return this.editInput();
        }else{
            return this.viewInput();
        }
    }

    // Please write here all the methods that are not react native lifecycle methods
    editInput() {
        return (
            <View style={[{
                // width: '100%'
            }, this.props.style]}>
                <Dropdown
                   label={this.props.label}
                   data={this.props.data}
                   value={this.props.value}
                   fontSize={15}
                   labelFontSize={12.5}
                   // baseColor={}
                   // textColor={}
                   selectedItemColor={'rgb(255,60,56)'}
                   onChangeText={ (state) => this.props.onChange(state, this.props.id)}
                />
            </View>
        );
    }

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
    }

}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({

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
};

export default DropdownInput;
