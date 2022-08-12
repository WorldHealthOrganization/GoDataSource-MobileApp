/**
 * Created by mobileclarisoft on 16/07/2018.
 */
import React, {PureComponent} from 'react';
import {View, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import SwitchSelector from 'react-native-switch-selector';
import config from './../utils/config'
import {getTranslation} from './../utils/functions';
import styles from './../styles';

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

        let options = config[this.props.values].map((e) => {
            return {label: getTranslation(e.label, this.props.translation), value: e.value}
        })

        return (
            <View style={[{width: '100%'}, this.props.style]}>
                <SwitchSelector
                    initial={this.props.selectedItem}
                    onPress={(value) => this.onChangeItem(value)}
                    textColor={styles.textColor}
                    selectedColor={styles.backgroundColor}
                    buttonColor={styles.primaryColor}
                    borderColor={'transparent'}
                    fontSize={14}
                    height={30}
                    options={options}
                    borderRadius={4}
                    style={style.switchSelectorStyle}
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

const style = StyleSheet.create({
    switchSelectorStyle: {
        borderWidth: 1,
        borderColor: styles.secondaryColor,
        borderRadius: 4,
        padding: 2
    }
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
