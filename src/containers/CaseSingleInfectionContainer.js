/**
 * Created by mobileclarisoft on 10/09/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {TextInput, View, Text, StyleSheet, FlatList, Alert, ScrollView, TouchableWithoutFeedback, Keyboard} from 'react-native';
import {calculateDimension, getTranslation} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import styles from './../styles';
import Ripple from 'react-native-material-ripple';
import CardComponent from './../components/CardComponent';
import Button from './../components/Button';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import translations from './../utils/translations'
import ElevatedView from 'react-native-elevated-view';
import _ from 'lodash';

class CaseSingleInfectionContainer extends PureComponent {

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
                                <View style={{flexDirection: 'row'}}>
                                    <Button
                                        title={getTranslation(translations.generalButtons.backButtonLabel, this.props.translation)}
                                        onPress={this.handleBackButton}
                                        color={styles.buttonGreen}
                                        titleColor={'white'}
                                        height={calculateDimension(25, true, this.props.screenSize)}
                                        width={calculateDimension(130, false, this.props.screenSize)}
                                        style={{
                                            marginVertical: calculateDimension(12.5, true, this.props.screenSize),
                                            marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                                        }}/>
                                    <Button
                                        title={getTranslation(translations.generalButtons.nextButtonLabel, this.props.translation)}
                                        onPress={this.handleNextButton}
                                        color={styles.buttonGreen}
                                        titleColor={'white'}
                                        height={calculateDimension(25, true, this.props.screenSize)}
                                        width={calculateDimension(130, false, this.props.screenSize)}
                                        style={{
                                            marginVertical: calculateDimension(12.5, true, this.props.screenSize),
                                            marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                                        }}/>
                                </View>) : (
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
                            config.caseSingleScreen.infection.map((item, index) => {
                                return this.handleRenderItem(item, index)
                            })
                        }
                        <View style={style.container}>
                            {
                                this.props.case && this.props.case.hospitalizationDates && this.props.case.hospitalizationDates.map((item, index) => {
                                    return this.handleRenderItemForHospitalizationDatesList(item, index)
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
                                        onPress={this.props.onPressAddHospitalizationDate}
                                    >
                                        <Text style={{fontFamily: 'Roboto-Medium', fontSize: 12, color: styles.buttonGreen}}>
                                            {this.props.case.hospitalizationDates && this.props.case.hospitalizationDates.length === 0 ? getTranslation(translations.caseSingleScreen.oneHospitalizationDateText, this.props.translation) : getTranslation(translations.caseSingleScreen.moreHospitalizationDatesText, this.props.translation)}
                                        </Text>
                                    </Ripple>
                                </View>
                            ) : null
                        }
                        <View style={style.container}>
                            {
                                this.props.case && this.props.case.isolationDates && this.props.case.isolationDates.map((item, index) => {
                                    return this.handleRenderItemForIsolationDatesList(item, index)
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
                                        onPress={this.props.onPressAddIsolationDates}
                                    >
                                        <Text style={{fontFamily: 'Roboto-Medium', fontSize: 12, color: styles.buttonGreen}}>
                                            {this.props.case.isolationDates && this.props.case.isolationDates.length === 0 ? getTranslation(translations.caseSingleScreen.oneIsolationDateText, this.props.translation) : getTranslation(translations.caseSingleScreen.moreIsolationDatesText, this.props.translation)}
                                        </Text>
                                    </Ripple>
                                </View>
                            ) : null
                        }
                    </KeyboardAwareScrollView>
                </View>
            </TouchableWithoutFeedback>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (item) => {
        let fields = item.fields.map( (field) => {
            return Object.assign({},field, {isEditMode: this.props.isEditMode})
        });

        if (this.props.case.deceased === false) {
            fields = fields.filter((field) => {
                return field.id !== 'dateDeceased' && field.id !== 'safeBurial'
            });
        }

        return this.rederItemCardComponent(fields)
    };

    handleRenderItemForHospitalizationDatesList = (item, index) => {
        let fields = config.caseSingleScreen.hospitalizationDate.fields.map((field) => {
            return Object.assign({},field, {isEditMode: this.props.isEditMode})
        });
        return this.rederItemCardComponent(fields, index)
    };

    handleRenderItemForIsolationDatesList = (item, index) => {
        let fields = config.caseSingleScreen.isolationDate.fields.map((field) => {
            return Object.assign({},field, {isEditMode: this.props.isEditMode})
        });

        return this.rederItemCardComponent(fields, index)
    };

    rederItemCardComponent = (fields, cardIndex = null) => {
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
    };

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
            if (item.objectType !== null && item.objectType !== undefined && item.objectType === 'HospitalizationDates') { 
                item.onPressArray = [this.props.handleOnPressDeleteHospitalizationDates]
            } else if (item.objectType !== null && item.objectType !== undefined && item.objectType === 'IsolationDates') {
                item.onPressArray = [this.props.handleOnPressDeleteIsolationDates]
            }
        }

        if (item.type === 'DatePicker' && this.props.case[item.id] !== undefined) {
            value = this.props.case[item.id]
        } else if (item.type === 'SwitchInput' && this.props.case[item.id] !== undefined) {
            value = this.props.case[item.id]
        } else {
            value = this.computeValueForCasesSingleScreen(item, cardIndex);
        }
        
        if (item.type === 'DatePicker' && value === '') {
            value = null
        }
        isEditModeForDropDownInput = this.props.isEditMode

        let dateValidation = this.setDateValidations(item, cardIndex);
        minimumDate = dateValidation.minimumDate;
        maximumDate = dateValidation.maximumDate;

        return (
            <CardComponent
                item={item}
                isEditMode={this.props.isEditMode}
                case={this.props.case}
                value={value}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                isEditModeForDropDownInput={isEditModeForDropDownInput}
                index={cardIndex}
                
                onChangeText={this.props.onChangeText}
                onChangeDate={this.props.onChangeDate}
                onChangeSwitch={this.props.onChangeSwitch}
                onChangeDropDown={this.props.onChangeDropDown}
                onChangeTextSwitchSelector={this.props.onChangeTextSwitchSelector}
                onDeletePress={item.objectType !== null && item.objectType !== undefined && item.objectType === 'HospitalizationDates' ? 
                                this.props.handleOnPressDeleteHospitalizationDates : 
                                item.objectType !== null && item.objectType !== undefined && item.objectType === 'IsolationDates' ? 
                                this.props.handleOnPressDeleteIsolationDates : 
                                null}
            />
        )
    };

    setDateValidations = (item, cardIndex) => {
        let minimumDate = undefined;
        let maximumDate = undefined;

        if (item.type === 'DatePicker') {
            if (item.id === 'dateBecomeCase' || item.id === 'dateOfOutcome' ) {
                maximumDate = new Date()
            } else if (item.id === 'dateOfOnset') {
                if (this.props.case && this.props.case !== undefined && this.props.case.deceased !== null && this.props.case.deceased !== undefined && this.props.case.deceased === true && this.props.case.dateDeceased && this.props.case.dateDeceased !== undefined && this.props.case.dateDeceased !== ''){
                    maximumDate = new Date(this.props.case.dateDeceased);
                } else {
                    maximumDate = new Date();
                }
            } else if (item.id === 'dateOfInfection') {
                let hasDeceasedDate = false;
                let hasDateOfOnset = false;
                if (this.props.case && this.props.case !== undefined && this.props.case.deceased !== null && this.props.case.deceased !== undefined && this.props.case.deceased === true && this.props.case.dateDeceased && this.props.case.dateDeceased !== undefined && this.props.case.dateDeceased !== ''){
                    hasDeceasedDate = true
                }
                if (this.props.case && this.props.case !== undefined && this.props.case.dateOfOnset && this.props.case.dateOfOnset !== undefined && this.props.case.dateOfOnset !== ''){
                    hasDateOfOnset = true
                }

                if (hasDeceasedDate === true && hasDateOfOnset === false) {
                    maximumDate = new Date(this.props.case.dateDeceased);
                } else if (hasDeceasedDate === false && hasDateOfOnset === true) {
                    maximumDate = new Date(this.props.case.dateOfOnset);
                } else if (hasDeceasedDate === true && hasDateOfOnset === true) {
                    maximumDate = _.min([this.props.case.dateOfOnset, this.props.case.dateDeceased])
                } else {
                    maximumDate = new Date()
                }
            } else if (item.id === 'dateDeceased') {
                maximumDate = new Date()
                let hasDateOfOnset = false   
                let hasDateOfReporting = false
                let hasDateOfInfection = false

                if (this.props.case && this.props.case !== undefined && this.props.case.dateOfOnset && this.props.case.dateOfOnset !== undefined && this.props.case.dateOfOnset !== ''){
                    hasDateOfOnset = true
                }
                if (this.props.case && this.props.case !== undefined && this.props.case.dateOfReporting && this.props.case.dateOfReporting !== undefined && this.props.case.dateOfReporting !== ''){
                    hasDateOfReporting = true
                }
                if (this.props.case && this.props.case !== undefined && this.props.case.dateOfInfection && this.props.case.dateOfInfection !== undefined && this.props.case.dateOfInfection !== ''){
                    hasDateOfInfection = true
                }

                if (hasDateOfOnset === false && hasDateOfReporting === false && hasDateOfInfection === true) {
                    minimumDate = this.props.case.dateOfInfection
                } else if (hasDateOfOnset === false && hasDateOfReporting === true && hasDateOfInfection === false) {
                    minimumDate = this.props.case.dateOfReporting
                } else if (hasDateOfOnset === true && hasDateOfReporting === false && hasDateOfInfection === false) {
                    minimumDate = this.props.case.dateOfOnset
                } else if (hasDateOfOnset === false && hasDateOfReporting === true && hasDateOfInfection === true) {
                    minimumDate = _.max([this.props.case.dateOfReporting, this.props.case.dateOfInfection])
                } else if (hasDateOfOnset === true && hasDateOfReporting === false && hasDateOfInfection === true) {
                    minimumDate = _.max([this.props.case.dateOfOnset, this.props.case.dateOfInfection])
                } else if (hasDateOfOnset === true && hasDateOfReporting === true && hasDateOfInfection === false) {
                    minimumDate = _.max([this.props.case.dateOfOnset, this.props.case.dateOfReporting])
                } else if (hasDateOfOnset === true && hasDateOfReporting === true && hasDateOfInfection === true) {
                    minimumDate = _.max([this.props.case.dateOfOnset, this.props.case.dateOfReporting, this.props.case.dateOfInfection])
                }
            } else if (item.objectType === 'HospitalizationDates'){
                if (this.props.case && this.props.case.hospitalizationDates && Array.isArray(this.props.case.hospitalizationDates) && this.props.case.hospitalizationDates.length > 0 && this.props.case.hospitalizationDates[cardIndex]) {
                    if (this.props.case.hospitalizationDates[cardIndex].startDate !== null && item.id !== 'startDate') {
                        minimumDate = this.props.case.hospitalizationDates[cardIndex].startDate
                    }
                    if (this.props.case.hospitalizationDates[cardIndex].endDate !== null && item.id !== 'endDate') {
                        maximumDate = this.props.case.hospitalizationDates[cardIndex].endDate
                    }
                }
            } else if (item.objectType === 'IsolationDates'){
                if (this.props.case && this.props.case.isolationDates && Array.isArray(this.props.case.isolationDates) && this.props.case.isolationDates.length > 0 && this.props.case.isolationDates[cardIndex]) {
                    if (this.props.case.isolationDates[cardIndex].startDate !== null && item.id !== 'startDate') {
                        minimumDate = this.props.case.isolationDates[cardIndex].startDate
                    }
                    if (this.props.case.isolationDates[cardIndex].endDate !== null && item.id !== 'endDate') {
                        maximumDate = this.props.case.isolationDates[cardIndex].endDate
                    }
                }
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
        if (item.id === 'typeId') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_ADDRESS_TYPE'
            }).map((o) => {return {value: getTranslation(o.value, this.props.translation), id: o.value}})
        }
        if (item.id === 'classification') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_CASE_CLASSIFICATION'
            }).map((o) => {return {label: getTranslation(o.value, this.props.translation), value: o.value}})
        }
        if (item.id === 'outcomeId') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_OUTCOME'
            }).map((o) => {return {label: getTranslation(o.value, this.props.translation), value: o.value}})
        }
        if (item.id === 'type') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_DOCUMENT_TYPE'
            }).map((o) => {return {label: getTranslation(o.value, this.props.translation), value: o.value}})
        }
        if (item.id === 'occupation') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_OCCUPATION'
            }).map((o) => {return {value: getTranslation(o.value, this.props.translation), id: o.value}})
        }
    };

    computeValueForCasesSingleScreen = (item, index) => {
        if (index !== null || index >= 0) {
            if (item.objectType === 'HospitalizationDates') {
                return this.props.case && this.props.case.hospitalizationDates && Array.isArray(this.props.case.hospitalizationDates) && this.props.case.hospitalizationDates.length > 0 && this.props.case.hospitalizationDates[index][item.id] !== undefined ?
                    getTranslation(this.props.case.hospitalizationDates[index][item.id], this.props.translation) : '';
            } else if (item.objectType === 'IsolationDates') {
                return this.props.case && this.props.case.isolationDates && Array.isArray(this.props.case.isolationDates) && this.props.case.isolationDates.length > 0 && this.props.case.isolationDates[index][item.id] !== undefined ?
                    getTranslation(this.props.case.isolationDates[index][item.id], this.props.translation) : '';
            }
        }
        return this.props.case && this.props.case[item.id] ? getTranslation(this.props.case[item.id], this.props.translation) : '';
    };

    handleNextButton = () => {
        if (this.props.checkRequiredFieldsInfection()) {
            if (this.props.checkIsolationOnsetDates()) {
                this.props.handleMoveToNextScreenButton(true);
            } else {
                Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), getTranslation(translations.alertMessages.dateOfOnsetError, this.props.translation), [
                    {
                        text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                        onPress: () => {console.log("OK pressed")}
                    }
                ])
            }
        } else {
            Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.requiredFieldsMissingError, this.props.translation), [
                {
                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation), 
                    onPress: () => {console.log("OK pressed")}
                }
            ])
        }
    };

    handleBackButton = () => {
        this.props.handleMoveToPrevieousScreenButton()
    };
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
        translation: state.app.translation,
        referenceData: state.referenceData,
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(CaseSingleInfectionContainer);
