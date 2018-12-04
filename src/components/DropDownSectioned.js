/**
 * Created by florinpopa on 06/08/2018.
 */
import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import {Icon} from 'react-native-material-ui';
import config from './../utils/config';
import Ripple from 'react-native-material-ripple';
import stylesGlobal from './../styles';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import translations from './../utils/translations'
import {getTranslation} from './../utils/functions';

class DropDownSectioned extends Component {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {
        };
    }

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
        return (
            <View style={[this.props.style, {flex: 1, alignSelf: 'center'}]}>
              <Text style={{
                    fontFamily: 'Roboto',
                    fontSize: 12.5,
                    textAlign: 'left',
                    color: 'rgba(0,0,0,0.38)',
                }}>
                    {this.props.isRequired ? getTranslation(this.props.label, this.props.translation) + ' * ' : getTranslation(this.props.label, this.props.translation)}
                </Text>
                <SectionedMultiSelect
                    items={this.props.data}
                    uniqueKey='_id'
                    subKey='children'
                    selectText= {this.props.value !== "" ? this.props.value : this.props.single === true ? getTranslation(translations.dropDownSectionedLabels.chooseOneLocation, this.props.translation) : getTranslation(translations.dropDownSectionedLabels.chooseMoreLocations, this.props.translation)}
                    showDropDowns={true}
                    readOnlyHeadings={true}
                    onSelectedItemsChange={this.onSelectedItemsChange}
                    selectedItems={this.props.sectionedSelectedItems !== null && this.props.sectionedSelectedItems !== undefined ? this.props.sectionedSelectedItems : [] }
                    showCancelButton={true}
                    selectChildren={false}
                    showChips={false}
                    modalAnimationType="slide"
                    searchPlaceholderText={getTranslation(translations.dropDownSectionedLabels.searchPlaceholderText, this.props.translation)}
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
                    noItemsComponent={(
                        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                            <Text style={{fontFamily: 'Roboto-Medium', fontSize: 15}}>
                                {getTranslation(translations.dropDownSectionedLabels.noLocationsMessage, this.props.translation)}
                            </Text>
                        </View>
                    )}
                />
            </View>
        );
    }

    viewInput = () => {
        return (
            <View style={[{flex: 1, alignSelf: 'center'}, this.props.style]}>
                <Text style={{
                    fontFamily: 'Roboto-Regular',
                    fontSize: 15,
                    lineHeight: 30,
                    textAlign: 'left',
                    color: 'rgb(0,0,0)',
                    marginBottom: 7.5
                }}>
                    {getTranslation(this.props.label, this.props.translation)}
                </Text>
                <Text style={{
                    fontFamily: 'Roboto-Light',
                    fontSize: 12.5,
                    textAlign: 'left',
                    color: 'rgb(60,60,60)',
                }}>
                    {this.props.value}
                </Text>
            </View>
        );
    };
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
        screenSize: state.app.screenSize,
        translation: state.app.translation,
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(DropDownSectioned);
