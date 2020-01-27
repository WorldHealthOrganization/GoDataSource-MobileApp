/**
 * Created by florinpopa on 06/08/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Icon} from 'react-native-material-ui';
import stylesGlobal from './../styles';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import SectionedMultiSelect from './SectionedMultiSelect';
import translations from './../utils/translations'
import {getTranslation, getTooltip} from './../utils/functions';
import TooltipComponent from './TooltipComponent'

class DropDownSectioned extends Component {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {
            selectedItems: this.props.single === false ? ((this.props.sectionedSelectedItems !== null && this.props.sectionedSelectedItems !== undefined) ? this.props.sectionedSelectedItems : []) : []
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
        let tooltip = getTooltip(this.props.label, this.props.translation);
        return (
            <View style={[this.props.style, {flexDirection: 'row'}]}>
                <View style = {{flex: 1}}>
                    <Text style={{
                        fontFamily: 'Roboto',
                        fontSize: 12.5,
                        textAlign: 'left',
                        color: 'rgba(0,0,0,0.38)'
                    }}>
                        {this.props.isRequired ? getTranslation(this.props.label, this.props.translation) + ' * ' : getTranslation(this.props.label, this.props.translation)}
                    </Text>
                    <SectionedMultiSelect
                        items={this.props.userData}
                        allItems={this.props.data}
                        showUnderline={true}
                        underlineColor={stylesGlobal.textFieldUnderline}
                        selectToggleIconComponent={(<Icon name="check" size={18} />)}
                        dropDownToggleIconDownComponent={(<Icon name="arrow-drop-down" size={18} />)}
                        dropDownToggleIconUpComponent={(<Icon name="arrow-drop-up" size={18} />)}
                        uniqueKey={'_id'}
                        subKey={'children'}
                        single={this.props.single}
                        selectedItems={this.props.value}
                        onSelectedItemsChange={this.onSelectedItemsChange}
                        selectText={this.props.value !== "" ? Array.isArray(this.props.value) && this.props.value.length > 1 ? getTranslation(translations.dropDownSectionedLabels.selected, this.props.translation) : Array.isArray(this.props.value) && this.props.value.length < 1 ? getTranslation(translations.dropDownSectionedLabels.noneSelected, this.props.translation) : this.props.value : this.props.single === true ? getTranslation(translations.dropDownSectionedLabels.chooseOneLocation, this.props.translation) : getTranslation(translations.dropDownSectionedLabels.chooseMoreLocations, this.props.translation)}
                        searchPlaceholderText={getTranslation(translations.dropDownSectionedLabels.searchPlaceholderText, this.props.translation)}
                    />
                </View>
                {
                    tooltip.hasTooltip === true ? (
                        <TooltipComponent
                            tooltipMessage={tooltip.tooltipMessage}
                            style = {{
                                flex: 0,
                                marginTop: 7,
                                marginBottom: 0
                            }}
                        />
                    ) : null
                }
            </View>
        );
    }

    viewInput = () => {
        let tooltip = getTooltip(this.props.label, this.props.translation);
        return (
            <View style={[{flexDirection: 'row', alignSelf: 'center'}, this.props.style]}>
                <View style = {{flex: 1}}>
                    <Text style={{
                        fontFamily: 'Roboto-Regular',
                        fontSize: 15,
                        textAlign: 'left',
                        color: 'rgb(0,0,0)',
                        marginBottom: 2,
                        marginTop: 2,
                    }}>
                        {getTranslation(this.props.label, this.props.translation)}
                    </Text>
                    <Text style={{
                        fontFamily: 'Roboto-Light',
                        fontSize: 15,
                        textAlign: 'left',
                        color: 'rgb(60,60,60)',
                    }}>
                        {this.props.value}
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

    onCancelHandler = () => {
        if (this.props.single === false) {
        let selectedItems = this.props.sectionedSelectedItems !== null && this.props.sectionedSelectedItems !== undefined ? this.props.sectionedSelectedItems : [];
            this.setState({
                selectedItems
            }, () => {
                this.props.onChange(selectedItems, this.props.index);
            })
        }
    };

    onConfirmHandler = () => {
        if (this.props.single === false) {
            this.props.onChange(this.state.selectedItems, this.props.index);
        }
    };

    onSelectedItemsChange = (selectedItems) => {
        console.log('DropDownSectioned onSelectItemsChange: ', selectedItems);
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
