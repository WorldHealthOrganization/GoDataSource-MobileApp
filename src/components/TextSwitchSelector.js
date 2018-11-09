/**
 * Created by mobileclarisoft on 16/07/2018.
 */
import React, {PureComponent} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import SwitchSelector from 'react-native-switch-selector';
import config from './../utils/config'

class TextSwitchSelector extends PureComponent {

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

    editInput() {
        return (
            <View style={[{
                width: '100%',
            }, this.props.style]}>
                <SwitchSelector
                    initial={this.props.selectedItem}
                    onPress={(value) => this.onChangeItem(value)}
                    textColor={'black'}
                    selectedColor={'white'}
                    buttonColor={'#3f51b5'}
                    borderColor={'black'}
                    hasPadding
                    fontSize={13}
                    height={30}
                    options={config[this.props.values]}
                />
            </View>
        );
    }

    viewInput() {
        return (
            <View></View>
        );
    }
  
    // Please write here all the methods that are not react native lifecycle methods
    onChangeItem = (selectedValue) => {
        let selectedValueIndex = config[this.props.values].map((e) => {return e.value}).indexOf(selectedValue)
        console.log ('TextSwitchSelector onChangeItem', selectedValueIndex, this.props.selectedItemIndexForTextSwitchSelector)
        this.props.onChange(selectedValueIndex, this.props.selectedItemIndexForTextSwitchSelector)
    }
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({

});

TextSwitchSelector.propTypes = {
    selectedItem: PropTypes.bool.isRequired,
    selectedItemIndexForTextSwitchSelector: PropTypes.bool.isRequired,
    values: PropTypes.bool.isRequired,
    isEditMode: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
    labelStyle: PropTypes.object,
};

export default TextSwitchSelector;
