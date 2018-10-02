/**
 * Created by florinpopa on 25/07/2018.
 */
import React, {PureComponent} from 'react';
import {View, Text, StyleSheet} from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import {Icon} from 'react-native-material-ui';
import {calculateDimension} from './../utils/functions';
import config from './../utils/config';
import Ripple from 'react-native-material-ripple';
import styles from './../styles';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import Modal from 'react-native-modal';
import ElevatedView from "react-native-elevated-view";
import SelectMultiple from 'react-native-select-multiple';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';

class DropDown extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            selectedItems: this.props.value,
            showDropdown: this.props.showDropdown
        };
    }

    // Please add here the react lifecycle methods that you need


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {

        if (!this.props.isEditMode) {
            return (
                <View style={[this.props.style]}>
                    <Text style={style.labelStyle}>{this.state.selectedItems.map((e, index) => {return e.label + (index === (this.state.selectedItems.length - 1) ? '' : ', ')})}</Text>
                </View>
            )
        }

        return (
            <Ripple style={[this.props.style, {flex: 1, marginTop: 25, marginBottom: 14, alignSelf: 'center'}]} onPress={this.handleOnPress}>
                <View style={style.innerTextContainer}>
                    <Text style={style.labelStyle}>{this.state.selectedItems.length === 0 ? 'Select answer(s)' : ("Slected " + this.state.selectedItems.length + ' answer(s)')}</Text>
                    <Icon name="arrow-drop-down"/>
                </View>
                <View style={[{height: 1, backgroundColor: styles.textFieldUnderline, marginTop: 14}]} />
                <Modal
                    isVisible={this.state.showDropdown}
                    style={[this.props.dropDownStyle, {
                        position: 'absolute',
                        top: this.props.screenSize.height / 4,
                        height: this.props.screenSize.height / 2,
                        backgroundColor: 'transparent'
                    }]}
                    onBackdropPress={() => this.setState({ showDropdown: false })}
                >
                    <ElevatedView elevation={3} style={[{backgroundColor: 'white'}]}>
                                <SelectMultiple
                                    items={this.props.data}
                                    selectedItems={this.state.selectedItems}
                                    onSelectionsChange={this.handleOnselectionChange}
                                />
                    </ElevatedView>
                </Modal>
            </Ripple>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleOnPress = () => {
        this.setState({
            showDropdown: !this.state.showDropdown
        })
    };

    onSelectedItemsChange = (selectedItems) => {
        console.log("Selected items SectionedMultiSelect: ", selectedItems);
    };

    handleOnselectionChange = (selections, item) => {
        this.setState({
            selectedItems: selections
        }, () => {
            this.props.onChange(selections, this.props.id);
        })
    }
}

DropDown.defaultProps = {
    label: 'DropDownLabel',
    value: 'Test',
    data: [],
    isEditMode: true,
    isRequired: true,
};

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 2
    },
    dropdownStyle: {
        marginHorizontal: 14
    },
    labelStyle: {
        fontFamily: 'Roboto-Light',
        fontSize: 15,
        color: styles.navigationDrawerItemText
    },
    innerTextContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(DropDown);
