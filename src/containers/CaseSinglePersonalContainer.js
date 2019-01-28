/**
 * Created by mobileclarisoft on 10/09/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {View, Text, StyleSheet, Alert, ScrollView, TouchableWithoutFeedback, Keyboard} from 'react-native';
import {calculateDimension, getTranslation} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import styles from './../styles';
import CardComponent from './../components/CardComponent';
import Ripple from 'react-native-material-ripple';
import Button from './../components/Button';
import ElevatedView from 'react-native-elevated-view';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import translations from './../utils/translations'
import _ from 'lodash';

class CaseSinglePersonalContainer extends PureComponent {

    // This will be a container, so put as less business logic here as possible
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    // Please add here the react lifecycle methods that you need

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <TouchableWithoutFeedback onPress={() => {
                Keyboard.dismiss()
            }} accessible={false}>
                <View style={style.container}>
                    <View style={{flexDirection: 'row'}}>
                        {
                            this.props.isNew ? (
                                <Button
                                    title={getTranslation(translations.generalButtons.nextButtonLabel, this.props.translation)}
                                    onPress={this.handleNextButton}
                                    color={styles.buttonGreen}
                                    titleColor={'white'}
                                    height={calculateDimension(25, true, this.props.screenSize)}
                                    width={calculateDimension(130, false, this.props.screenSize)}
                                    style={{
                                        marginVertical: calculateDimension(12.5, true, this.props.screenSize),
                                        marginRight: 10,
                                    }}/>) : (
                                this.props.isEditMode ? (
                                    <View style={{flexDirection: 'row'}}>
                                        <Button
                                            title={getTranslation(translations.generalButtons.saveButtonLabel, this.props.translation)}
                                            onPress={this.props.onPressSaveEdit}
                                            color={styles.buttonGreen}
                                            titleColor={'white'}
                                            height={calculateDimension(25, true, this.props.screenSize)}
                                            width={calculateDimension(166, false, this.props.screenSize)}
                                            style={{
                                                marginVertical: calculateDimension(12.5, true, this.props.screenSize),
                                                marginRight: 10,
                                        }}/>
                                        <Button
                                            title={getTranslation(translations.generalButtons.cancelButtonLabel, this.props.translation)}
                                            onPress={this.props.onPressCancelEdit}
                                            color={styles.buttonGreen}
                                            titleColor={'white'}
                                            height={calculateDimension(25, true, this.props.screenSize)}
                                            width={calculateDimension(166, false, this.props.screenSize)}
                                            style={{
                                                marginVertical: calculateDimension(12.5, true, this.props.screenSize),
                                                marginRight: 10,
                                        }}/>
                                    </View>) : (
                                        this.props.role.find((e) => e === config.userPermissions.writeCase) !== undefined ? (
                                            <Button
                                                title={getTranslation(translations.generalButtons.editButtonLabel, this.props.translation)}
                                                onPress={this.props.onPressEdit}
                                                color={styles.buttonGreen}
                                                titleColor={'white'}
                                                height={calculateDimension(25, true, this.props.screenSize)}
                                                width={calculateDimension(166, false, this.props.screenSize)}
                                                style={{
                                                    marginVertical: calculateDimension(12.5, true, this.props.screenSize),
                                                    marginRight: 10,
                                            }}/>
                                        ) : null
                                    ))
                        }
                    </View>
                    <KeyboardAwareScrollView
                        style={style.containerScrollView}
                        contentContainerStyle={[style.contentContainerStyle, {paddingBottom: this.props.screenSize.height < 600 ? 70 : 20}]}
                        keyboardShouldPersistTaps={'always'}
                    >
                        {
                            config.caseSingleScreen.personal.map((item) => {
                                return this.handleRenderItem(item)
                            })
                        }
                         <View style={style.container}>
                            {
                                this.props.case && this.props.case.documents && this.props.case.documents.map((item, index) => {
                                    return this.handleRenderItemForDocumentsList(item, index)
                                })
                            }
                        </View>
                        {
                            this.props.isEditMode ? (
                                <View style={{alignSelf: 'flex-start', marginHorizontal: calculateDimension(16, false, this.props.screenSize), marginVertical: 20}}>
                                    <Ripple
                                        style={{
                                            height: 25,
                                            justifyContent: 'center'
                                        }}
                                        onPress={this.props.onPressAddDocument}
                                    >
                                        <Text style={{fontFamily: 'Roboto-Medium', fontSize: 12, color: styles.buttonGreen}}>
                                            {this.props.case.documents && this.props.case.documents.length === 0 ? getTranslation(translations.caseSingleScreen.oneDocumentText, this.props.translation) : getTranslation(translations.caseSingleScreen.moreDocumentsText, this.props.translation)}
                                        </Text>
                                    </Ripple>
                                </View>) : null
                        }
                    </KeyboardAwareScrollView>
                </View>
            </TouchableWithoutFeedback>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (item) => {
        let fields = item.fields.map((field) => {
            return Object.assign({},field, {isEditMode: this.props.isEditMode})
        });
        return this.renderItemCardComponent(fields)
    }

    handleRenderItemForDocumentsList = (item, index) => {
        let fields = config.caseSingleScreen.document.fields.map((field) => {
            return Object.assign({},field, {isEditMode: this.props.isEditMode})
        });
        return this.renderItemCardComponent(fields, index)
    }

    renderItemCardComponent = (fields, cardIndex = null) => {
        return (
            <ElevatedView elevation={3} style={[style.containerCardComponent, {
                marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                width: calculateDimension(config.designScreenSize.width - 32, false, this.props.screenSize),
                marginVertical: 4,
                minHeight: calculateDimension(72, true, this.props.screenSize)
            }, style.cardStyle]}>
                <ScrollView scrollEnabled={false} style={{flex: 1}} contentContainerStyle={{flexGrow: 1}}>
                    {
                        fields && fields.map((item, index) => {
                            return this.handleRenderItemCardComponent(item, index, cardIndex);
                        })
                    }
                </ScrollView>
            </ElevatedView>
        );
    }

    handleRenderItemCardComponent = (item, index, cardIndex) => {
        return (
            <View style={[style.subcontainerCardComponent, {flex: 1}]} key={index}>
                {
                    this.handleRenderItemByType(item, cardIndex)
                }
            </View>
        )
    };

    handleRenderItemByType = (item, cardIndex) => {
        let value = '';
        let isEditModeForDropDownInput = true
        let minimumDate = undefined;
        let maximumDate = undefined;

        if (item.type === 'DropdownInput') {
            item.data = this.computeDataForCasesSingleScreenDropdownInput(item);
        } else if (item.type === 'ActionsBar') {
            item.onPressArray = [this.props.onDeletePress]
        }

        if (item.type === 'SwitchInput' && this.props.case[item.id] !== undefined) {
            value = this.props.case[item.id]
        } else {
            value = this.computeValueForCasesSingleScreen(item, cardIndex);
        }
        
        if (this.props.selectedItemIndexForTextSwitchSelectorForAge !== null && this.props.selectedItemIndexForTextSwitchSelectorForAge !== undefined && item.objectType === 'Case' && item.dependsOn !== undefined && item.dependsOn !== null){
            let itemIndexInConfigTextSwitchSelectorValues = config[item.dependsOn].map((e) => {return e.value}).indexOf(item.id)
            if (itemIndexInConfigTextSwitchSelectorValues > -1) {
                if (itemIndexInConfigTextSwitchSelectorValues != this.props.selectedItemIndexForTextSwitchSelectorForAge) {
                    return
                }
            }
        }
        if (item.type === 'DatePicker' && value === '') {
            value = null
        }

        let dateValidation = this.setDateValidations(item);
        minimumDate = dateValidation.minimumDate;
        maximumDate = dateValidation.maximumDate;

        return (
            <CardComponent
                item={item}
                isEditMode={this.props.isEditMode}
                isEditModeForDropDownInput={this.props.isEditMode}
                case={this.props.case}
                selectedItemIndexForAgeUnitOfMeasureDropDown={this.props.selectedItemIndexForAgeUnitOfMeasureDropDown}
                onChangeextInputWithDropDown={this.props.onChangeextInputWithDropDown}
                value={value}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                index={cardIndex}
                
                onChangeText={this.props.onChangeText}
                onChangeDate={this.props.onChangeDate}
                onChangeSwitch={this.props.onChangeSwitch}
                onChangeDropDown={this.props.onChangeDropDown}
                onChangeTextSwitchSelector={this.props.onChangeTextSwitchSelector}
                onDeletePress={this.props.onDeletePress}
            />
        )
    };

    setDateValidations = (item) => {
        let minimumDate = undefined;
        let maximumDate = undefined;

        if (item.type === 'DatePicker') {
            if (item.id === 'dob' || item.id === 'dateOfReporting') {
                maximumDate = new Date()
            }
        }
        
        let dateValidation = {minimumDate, maximumDate}
        return dateValidation
    }

    computeDataForCasesSingleScreenDropdownInput = (item) => {
        if (item.id === 'riskLevel') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId.includes("RISK_LEVEL")
            }).map((o) => {return {value: getTranslation(o.value, this.props.translation), id: o.value}})
        }
        if (item.id === 'gender') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_GENDER'
            }).map((o) => {return {label: getTranslation(o.value, this.props.translation), value: o.value}})
        }
        if (item.id === 'occupation') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_OCCUPATION'
            }).map((o) => {return {value: getTranslation(o.value, this.props.translation), id: o.value}})
        }
        if (item.id === 'type') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_DOCUMENT_TYPE'
            }).map((o) => {return {label: getTranslation(o.value, this.props.translation), value: o.value}})
        }
    };

    computeValueForCasesSingleScreen = (item, index) => {
        if (index !== null || index >= 0) {
            if (item.objectType === 'Documents') {
                return this.props.case && this.props.case.documents && Array.isArray(this.props.case.documents) && this.props.case.documents.length > 0 && this.props.case.documents[index][item.id] !== undefined ?
                    getTranslation(this.props.case.documents[index][item.id], this.props.translation) : '';
            }
        }
        return this.props.case && this.props.case[item.id] ? getTranslation(this.props.case[item.id], this.props.translation) : '';
    };

    handleNextButton = () => {
        let missingFields = this.props.checkRequiredFieldsPersonalInfo();
        if (missingFields && Array.isArray(missingFields) && missingFields.length === 0) {
            if (this.props.checkAgeYearsRequirements()) {
                if (this.props.checkAgeMonthsRequirements()){
                    this.props.handleMoveToNextScreenButton()
                } else {
                    Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), getTranslation(translations.alertMessages.monthsValueError, this.props.translation), [
                        {
                            text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation), 
                            onPress: () => {console.log("OK pressed")}
                        }
                    ])
                }
            } else {
                Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), getTranslation(translations.alertMessages.yearsValueError, this.props.translation), [
                    {
                        text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation), 
                        onPress: () => {console.log("OK pressed")}
                    }
                ])
            }
        } else {
            Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), `${getTranslation(translations.alertMessages.requiredFieldsMissingError, this.props.translation)}.\n${getTranslation(translations.alertMessages.missingFields, this.props.translation)}: ${missingFields}`, [
                {
                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation), 
                    onPress: () => {console.log("OK pressed")}
                }
            ])
        }
    }
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    containerCardComponent: {
        backgroundColor: 'white',
        borderRadius: 2
    },
    subcontainerCardComponent: {
        alignItems: 'center',
        flex: 1
    },
    container: {
        flex: 1,
        backgroundColor: styles.screenBackgroundGrey,
        alignItems: 'center',
    },
    cardStyle: {
        marginVertical: 4,
        flex: 1
    },
    containerScrollView: {
        flex: 1,
        backgroundColor: styles.screenBackgroundGrey
    },
    contentContainerStyle: {
        alignItems: 'center'
    },
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        role: state.role,
        referenceData: state.referenceData,
        translation: state.app.translation,
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(CaseSinglePersonalContainer);
