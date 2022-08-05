/**
 * Created by florinpopa on 25/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Icon} from 'react-native-material-ui';
import Ripple from 'react-native-material-ripple';
import {connect} from "react-redux";
import Modal from 'react-native-modal';
import ElevatedView from "react-native-elevated-view";
import SelectMultiple from 'react-native-select-multiple';
import translations from './../utils/translations'
import {getTranslation, getTooltip} from './../utils/functions';
import TooltipComponent from './TooltipComponent';
import styles from './../styles';

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
                <Ripple style={style.dropdownContainer} onPress={this.handleOnPress}>
                    <View style={style.dropdownInnerText}>
                        <Text style={style.dropdownLabel}>
                            {this.state.selectedItems.length === 0 ? this.props.isRequired === false ? getTranslation(translations.dropDownLabels.selectedAnswersLabel, this.props.translation) : getTranslation(translations.dropDownLabels.selectedAnswersLabel, this.props.translation) + ' *' : (getTranslation(translations.dropDownLabels.selectedLabel, this.props.translation) + ' ' + this.state.selectedItems.length + ' ' + getTranslation(translations.dropDownLabels.answersLabel, this.props.translation))}</Text>
                        <Icon name="arrow-drop-down" />
                    </View>
                    <View style={styles.lineStyle} />
                    <Modal
                        isVisible={this.state.showDropdown}
                        style={[this.props.dropDownStyle, {
                            top: this.props.screenSize.height / 4,
                            maxHeight: this.props.screenSize.height / 2
                        }]}
                        onBackdropPress={() => this.setState({ showDropdown: false }, () => {
                            this.props.onChange(this.state.selectedItems, this.props.id);
                        })}
                    >
                        <ElevatedView elevation={5} style={style.dropdownModal}>
                            <Ripple 
                                style={style.dropdownModalTopHeader}
                                onPress={() => this.setState({ showDropdown: false },()=> {
                                    this.props.onChange(this.state.selectedItems, this.props.id);
                                })}
                                hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
                            >
                                <Icon name="close" />
                            </Ripple>
                            <View style={styles.lineStyle} />
                            <SelectMultiple
                                items={this.props.data !== undefined && this.props.data !== null ? this.props.data : []}
                                selectedItems={this.state.selectedItems}
                                onSelectionsChange={this.handleOnselectionChange}
                                style={{borderRadius: 4}}
                                rowStyle={{borderBottomColor: styles.separatorColor, borderRadius: 4, paddingVertical: 8, paddingHorizontal: 8}}
                                labelStyle={{color: styles.textColor}}
                                selectedLabelStyle={{color: styles.primaryColor}}
                            />
                        </ElevatedView>
                    </Modal>
                </Ripple>
                {
                    tooltip.hasTooltip === true ? (
                        <TooltipComponent tooltipMessage={tooltip.tooltipMessage} />
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
                        <Text style={style.dropdownLabel}>
                            {this.state.selectedItems.map((e, index) => {return getTranslation(e.label, this.props.translation) + (index === (this.state.selectedItems.length - 1) ? '' : ', ')})}
                        </Text>
                    ) : (null)
                }
                {
                    tooltip.hasTooltip === true ? (
                        <TooltipComponent
                            tooltipMessage={tooltip.tooltipMessage}
                            style={{flex: 0, marginTop: 0, marginBottom: 0}}
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
        backgroundColor: styles.backgroundColor,
        borderRadius: 4
    },
    dropdownContainer: {
        alignSelf: 'center',
        flex: 1,
        marginVertical: 8
    },
    dropdownInnerText: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    dropdownLabel: {
        color: styles.secondaryColor,
        flex: 1,
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
    },
    dropdownModal: {
        backgroundColor: styles.backgroundColor,
        borderRadius: 4
    },
    dropdownModalTopHeader: {
        backgroundColor: styles.backgroundColorRgb,
        flexDirection: 'row', 
        justifyContent: 'flex-end',
        padding: 8
    },
    dropdownStyle: {
        backgroundColor: styles.backgroundColor,
        borderRadius: 4,
        marginHorizontal: 16,
        position: 'absolute'
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        translation: state.app.translation
    };
}

export default connect(mapStateToProps)(DropDown);
