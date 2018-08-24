/**
 * Created by florinpopa on 06/08/2018.
 */
import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import {Icon} from 'react-native-material-ui';
import {calculateDimension} from './../utils/functions';
import config from './../utils/config';
import Ripple from 'react-native-material-ripple';
import stylesGlobal from './../styles';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import SectionedMultiSelect from 'react-native-sectioned-multi-select';

class DropDownSectioned extends Component {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    // Please add here the react lifecycle methods that you need
    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.value !== this.props.value) {
            return true;
        } else {
            return false;
        }
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        console.log("### Render DropDownSectioned");

        return (
            <View style={[this.props.style, {flex: 1, alignSelf: 'center'}]}>
                <SectionedMultiSelect
                    items={this.props.data}
                    uniqueKey='id'
                    subKey='children'
                    selectText='Choose one or more locations'
                    showDropDowns={true}
                    readOnlyHeadings={true}
                    onSelectedItemsChange={this.onSelectedItemsChange}
                    selectedItems={this.props.value}
                    showCancelButton={true}
                    selectChildren={false}
                    showChips={false}
                    modalAnimationType="slide"
                    searchPlaceholderText="Search regions"
                    selectToggleIconComponent={(<Icon name="arrow-drop-down"/>)}
                    dropDownToggleIconDownComponent={(<Icon name="arrow-drop-down"/>)}
                    dropDownToggleIconUpComponent={(<Icon name="arrow-drop-up"/>)}
                    confirmFontFamily={'Roboto-Medium'}
                    searchTextFontFamily={'Roboo-Regular'}
                    itemFontFamily={'Roboto-Medium'}
                    subItemFontFamily={'Roboto-Regular'}
                    styles={{
                        button: {backgroundColor: stylesGlobal.buttonGreen},
                        cancelButton: {backgroundColor: stylesGlobal.missedRedColor},
                        selectToggle: {borderBottomColor: stylesGlobal.textFieldUnderline, borderBottomWidth: 1}
                    }}
                    single={this.props.single}
                />
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods;

    onSelectedItemsChange = (selectedItems) => {
        this.props.onChange(selectedItems, this.props.index);
    };
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
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

export default connect(mapStateToProps, matchDispatchProps)(DropDownSectioned);
