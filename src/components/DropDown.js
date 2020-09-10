/**
 * Created by florinpopa on 25/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Icon} from 'react-native-material-ui';
import Ripple from 'react-native-material-ripple';
import styles from './../styles';
import {connect} from "react-redux";
import Modal from 'react-native-modal';
import ElevatedView from "react-native-elevated-view";
import SelectMultiple from 'react-native-select-multiple';
import translations from './../utils/translations'
import {getTranslation, getTooltip} from './../utils/functions';
import TooltipComponent from './TooltipComponent'

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
    componentDidUpdate(prevProps) {
        if (this.props.value && this.props.value !== prevProps.value) {
            this.setState({
                selectedItems: this.props.value
            })
        }
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        if(this.props.isEditMode){
            return this.editInput();
        } else {
            return this.viewInput();
        }
    };

    editInput = () => {
        let tooltip = getTooltip(translations.dropDownLabels.selectedAnswersLabel, this.props.translation);
        return (
            <View style={[{flexDirection: 'row'}, this.props.style]}>
                <Ripple style={{
                        flex: 1,
                        marginTop: 25,
                        marginBottom: 14,
                        alignSelf: 'center',
                    }} onPress={this.handleOnPress}
                >
                    <View style={style.innerTextContainer}>
                        <Text style={style.labelStyle}>
                            {this.state.selectedItems.length === 0 ? this.props.isRequired === false ? getTranslation(translations.dropDownLabels.selectedAnswersLabel, this.props.translation) : getTranslation(translations.dropDownLabels.selectedAnswersLabel, this.props.translation) + '*' : (getTranslation(translations.dropDownLabels.selectedLabel, this.props.translation) + ' ' + this.state.selectedItems.length + ' ' + getTranslation(translations.dropDownLabels.answersLabel, this.props.translation))}</Text>
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
                        onBackdropPress={() => this.setState({ showDropdown: false }, () => {
                            this.props.onChange(this.state.selectedItems, this.props.id);
                        })}
                    >
                        <ElevatedView elevation={3} style={[{backgroundColor: 'white'}]}>
                            <Ripple 
                                style={style.navbarContainer}
                                onPress={() => this.setState({ showDropdown: false },()=> {
                                    this.props.onChange(this.state.selectedItems, this.props.id);
                                })}
                                hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
                            >
                                <Icon name="close"/>
                            </Ripple>
                            <SelectMultiple
                                items={this.props.data !== undefined && this.props.data !== null ? this.props.data : []}
                                selectedItems={this.state.selectedItems}
                                onSelectionsChange={this.handleOnselectionChange}
                            />
                        </ElevatedView>
                    </Modal>
                </Ripple>
                {
                    tooltip.hasTooltip === true ? (
                        <TooltipComponent
                            tooltipMessage={tooltip.tooltipMessage}
                        />
                    ) : null
                }
            </View>
        )
    };

    viewInput = () => {
        let tooltip = getTooltip(translations.dropDownLabels.selectedAnswersLabel, this.props.translation);
        return (
            <View style={[{flexDirection: 'row'}, this.props.style]}>
                {
                    this.props.value.length > 0 ? (
                        <Text style={style.labelStyle}>
                            {this.state.selectedItems.map((e, index) => {return getTranslation(e.label, this.props.translation) + (index === (this.state.selectedItems.length - 1) ? '' : ', ')})}
                        </Text>
                    ) : (null)
                }
                {
                    tooltip.hasTooltip === true ? (
                        <TooltipComponent
                            tooltipMessage={tooltip.tooltipMessage}
                            style = {{
                                flex: 0,
                                marginTop: 0,
                                marginBottom: 0
                            }}
                        />
                    ) : null
                }
            </View>
        )
    };

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
            // this.props.onChange(selections, this.props.id);
        })
    };
}

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
    navbarContainer: {
        paddingRight: 10, 
        paddingTop: 10, 
        paddingBottom: 0, 
        margin: 0, 
        flexDirection: 'row', 
        justifyContent: 'flex-end'
    },
    labelStyle: {
        flex: 1,
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
        screenSize: state.app.screenSize,
        translation: state.app.translation
    };
}

export default connect(mapStateToProps)(DropDown);
