/**
 * Created by mobileclarisoft on 10/09/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, { Component } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, findNodeHandle } from 'react-native';
import { calculateDimension, getTranslation, extractIdFromPouchId, createDate } from './../utils/functions';
import config from './../utils/config';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import styles from './../styles';
import Ripple from 'react-native-material-ripple';
import CardComponent from './../components/CardComponent';
import Button from './../components/Button';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import translations from './../utils/translations'
import ElevatedView from 'react-native-elevated-view';
import _ from 'lodash';
import moment from 'moment';
import get from "lodash/get";

class CaseSingleInfectionContainer extends Component {

    // This will be a container, so put as less business logic here as possible
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    // Please add here the react lifecycle methods that you need
    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.isEditMode !== this.props.isEditMode || nextProps.index === 2) {
            return true;
        }
        return false;
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        // console.log('CaseSingleContainer render Infection');
        return (
            <View style={{ flex: 1 }}>
                <View style={style.container}>
                    <View style={{ flexDirection: 'row' }}>
                        {
                            this.props.isNew ? (
                                <View style={{ flexDirection: 'row' }}>
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
                                        }} />
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
                                        }} />
                                </View>) : (
                                    this.props.isEditMode ? (
                                        <View style={{ flexDirection: 'row' }}>
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
                                                }} />
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
                                                }} />
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
                                                    }} />
                                            ) : null
                                        ))
                        }
                    </View>
                    {/* <KeyboardAwareScrollView
                        style={style.containerScrollView}
                        contentContainerStyle={[style.contentContainerStyle, {paddingBottom: this.props.screenSize.height < 600 ? 70 : 20}]}
                        keyboardShouldPersistTaps={'always'}
                        extraHeight={20 + 81 + 50 + 70}
                        innerRef={ref => {
                            this.scrollCasesSingleInfection = ref
                        }}
                    > */}
                    <ScrollView
                        style={style.containerScrollView}
                        contentContainerStyle={[style.contentContainerStyle, { paddingBottom: this.props.screenSize.height < 600 ? 70 : 20 }]}
                    >
                        {
                            config.caseSingleScreen.infection.map((item, index) => {
                                return this.handleRenderItem(item, index)
                            })
                        }
                        <View style={style.container}>
                            {
                                this.props.case && this.props.case.dateRanges && this.props.case.dateRanges.map((item, index) => {
                                    return this.handleRenderItemForDateRangesList(item, index)
                                })
                            }
                        </View>
                        {
                            this.props.isEditMode ? (
                                <View style={{ alignSelf: 'flex-start', marginHorizontal: calculateDimension(16, false, this.props.screenSize), marginVertical: 20 }}>
                                    <Ripple
                                        style={{
                                            height: 25,
                                            justifyContent: 'center'
                                        }}
                                        onPress={this.props.onPressAddDateRange}
                                    >
                                        <Text style={{ fontFamily: 'Roboto-Medium', fontSize: 12, color: styles.buttonGreen }}>
                                            {this.props.case.dateRanges && this.props.case.dateRanges.length === 0 ? getTranslation(translations.caseSingleScreen.oneDateRangeText, this.props.translation) : getTranslation(translations.caseSingleScreen.moreDateRangeText, this.props.translation)}
                                        </Text>
                                    </Ripple>
                                </View>
                            ) : null
                        }
                        {/*<View style={style.container}>*/}
                        {/*{*/}
                        {/*this.props.case && this.props.case.isolationDates && this.props.case.isolationDates.map((item, index) => {*/}
                        {/*return this.handleRenderItemForIsolationDatesList(item, index)*/}
                        {/*})*/}
                        {/*}*/}
                        {/*</View>*/}
                        {/*{*/}
                        {/*this.props.isEditMode ? (*/}
                        {/*<View style={{alignSelf: 'flex-start', marginHorizontal: calculateDimension(16, false, this.props.screenSize), marginVertical: 20}}>*/}
                        {/*<Ripple*/}
                        {/*style={{*/}
                        {/*height: 25,*/}
                        {/*justifyContent: 'center'*/}
                        {/*}}*/}
                        {/*onPress={this.props.onPressAddIsolationDates}*/}
                        {/*>*/}
                        {/*<Text style={{fontFamily: 'Roboto-Medium', fontSize: 12, color: styles.buttonGreen}}>*/}
                        {/*{this.props.case.isolationDates && this.props.case.isolationDates.length === 0 ? getTranslation(translations.caseSingleScreen.oneIsolationDateText, this.props.translation) : getTranslation(translations.caseSingleScreen.moreIsolationDatesText, this.props.translation)}*/}
                        {/*</Text>*/}
                        {/*</Ripple>*/}
                        {/*</View>*/}
                        {/*) : null*/}
                        {/*}*/}
                    </ScrollView>
                    {/* </KeyboardAwareScrollView> */}
                </View>
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (item) => {
        let fields = item.fields.map((field) => {
            return Object.assign({}, field, { isEditMode: this.props.isEditMode })
        });

        if (this.props.case.outcomeId !== config.caseFieldsForHardCodeCheck.outcomeIdDeceasedValue) {
            fields = fields.filter((field) => {
                return field.id !== 'safeBurial' && field.id !== 'dateOfBurial'
            });
        }

        return this.renderItemCardComponent(fields)
    };

    handleRenderItemForDateRangesList = (item, index) => {
        let fields = config.caseSingleScreen.dateRanges.fields.map((field) => {
            return Object.assign({}, field, { isEditMode: this.props.isEditMode })
        });
        if (this.props && this.props.case && this.props.case.dateRanges && Array.isArray(this.props.case.dateRanges) && this.props.case.dateRanges[index] && this.props.case.dateRanges[index].typeId === config.dateRangeTypes.hospitalization) {
            fields[3].label = translations.caseSingleScreen.dateRangeHospitalName;
        }
        if (this.props && this.props.case && this.props.case.dateRanges && Array.isArray(this.props.case.dateRanges) && this.props.case.dateRanges[index] && (this.props.case.dateRanges[index].typeId !== config.dateRangeTypes.hospitalization && this.props.case.dateRanges[index].typeId !== config.dateRangeTypes.isolation)) {
            fields.splice(3, 1);
        }
        return this.renderItemCardComponent(fields, index)
    };

    handleRenderItemForIsolationDatesList = (item, index) => {
        let fields = config.caseSingleScreen.isolationDate.fields.map((field) => {
            return Object.assign({}, field, { isEditMode: this.props.isEditMode })
        });

        return this.renderItemCardComponent(fields, index)
    };

    renderItemCardComponent = (fields, cardIndex = null) => {
        return (
            <ElevatedView elevation={3} style={[style.containerCardComponent, {
                marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                width: calculateDimension(config.designScreenSize.width - 32, false, this.props.screenSize),
                marginVertical: 4,
                minHeight: calculateDimension(72, true, this.props.screenSize)
            }, style.cardStyle]}>
                <ScrollView scrollEnabled={false} style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
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
            <View style={[style.subcontainerCardComponent, { flex: 1 }]} key={index}>
                {
                    this.handleRenderItemByType(item, cardIndex)
                }
            </View>
        )
    };

    handleRenderItemByType = (item, cardIndex) => {
        let value = '';
        let isEditModeForDropDownInput = true;
        let minimumDate = undefined;
        let maximumDate = undefined;

        if (item.type === 'DropdownInput') {
            item.data = this.computeDataForCasesSingleScreenDropdownInput(item);
        } else if (item.type === 'ActionsBar') {
            if (item.objectType !== null && item.objectType !== undefined && item.objectType === 'DateRanges') {
                item.onPressArray = [this.props.handleOnPressDeleteDateRange]
            }
            // else if (item.objectType !== null && item.objectType !== undefined && item.objectType === 'IsolationDates') {
            //     item.onPressArray = [this.props.handleOnPressDeleteIsolationDates]
            // }
        }

        if (item.type === 'DatePicker' && this.props.case[item.id] !== undefined) {
            value = this.props.case[item.id]
        } else if (item.type === 'DropDownSectioned') {
            if (item.objectType === 'DateRanges') {
                for (let i = 0; i < this.props.locations.length; i++) {
                    let myLocationName = this.getLocationNameById(this.props.locations[i], this.props.case.dateRanges[cardIndex][item.id]);
                    if (myLocationName !== null) {
                        value = myLocationName;
                        break
                    }
                }
            }
            // else if (item.objectType === 'IsolationDates') {
            //     for (let i = 0; i < this.props.locations.length; i++) {
            //         let myLocationName = this.getLocationNameById(this.props.locations[i], this.props.case.isolationDates[cardIndex][item.id])
            //         if (myLocationName !== null){
            //             value = myLocationName;
            //             break
            //         }
            //     }
            // }
        } else if (item.type === 'SwitchInput' && this.props.case[item.id] !== undefined) {
            value = this.props.case[item.id]
        } else {
            value = this.computeValueForCasesSingleScreen(item, cardIndex);
        }

        if (item.type === 'DatePicker' && value === '') {
            value = null
        }

        let dateValidation = this.setDateValidations(item, cardIndex);
        minimumDate = dateValidation.minimumDate;
        maximumDate = dateValidation.maximumDate;

        return (
            <CardComponent
                item={item}
                isEditMode={this.props.isEditMode}
                isEditModeForDropDownInput={this.props.isEditMode}
                case={this.props.case}
                value={value}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                index={cardIndex}

                onChangeText={this.props.onChangeText}
                onChangeDate={this.props.onChangeDate}
                onChangeSwitch={this.props.onChangeSwitch}
                onChangeDropDown={this.props.onChangeDropDown}
                onChangeTextSwitchSelector={this.props.onChangeTextSwitchSelector}
                onDeletePress={item.objectType !== null && item.objectType !== undefined && item.objectType === 'DateRanges' ?
                    this.props.handleOnPressDeleteDateRange :
                    item.objectType !== null && item.objectType !== undefined && item.objectType === 'IsolationDates' ?
                        this.props.handleOnPressDeleteIsolationDates :
                        null}
                onChangeSectionedDropDown={item.objectType !== null && item.objectType !== undefined && item.objectType === 'DateRanges' ?
                    this.props.onChangeSectionedDropDownDateRange :
                    item.objectType !== null && item.objectType !== undefined && item.objectType === 'IsolationDates' ?
                        this.props.onChangeSectionedDropDownIsolation :
                        null}
                onFocus={this.handleOnFocus}
                onBlur={this.handleOnBlur}
            />
        )
    };

    setDateValidations = (item, cardIndex) => {
        let minimumDate = undefined;
        let maximumDate = undefined;

        if (item.type === 'DatePicker') {
            if (item.id === 'dateBecomeCase' || item.id === 'dateOfOutcome' || item.id === 'dateOfBurial' || item.id === 'dateOfOnset') {
                maximumDate = createDate(null);
            } else if (item.id === 'dateOfInfection') {
                if (this.props.case && this.props.case !== undefined && this.props.case.dateOfOnset && this.props.case.dateOfOnset !== undefined && this.props.case.dateOfOnset !== '') {
                    maximumDate = createDate(this.props.case.dateOfOnset);
                } else {
                    maximumDate = createDate(null);
                }
            } else if (item.id === 'dateDeceased') {
                maximumDate = createDate(null);
                let hasDateOfOnset = false
                let hasDateOfReporting = false;
                let hasDateOfInfection = false;

                if (this.props.case && this.props.case !== undefined && this.props.case.dateOfOnset && this.props.case.dateOfOnset !== undefined && this.props.case.dateOfOnset !== '') {
                    hasDateOfOnset = true
                }
                if (this.props.case && this.props.case !== undefined && this.props.case.dateOfReporting && this.props.case.dateOfReporting !== undefined && this.props.case.dateOfReporting !== '') {
                    hasDateOfReporting = true
                }
                if (this.props.case && this.props.case !== undefined && this.props.case.dateOfInfection && this.props.case.dateOfInfection !== undefined && this.props.case.dateOfInfection !== '') {
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
            } else if (item.objectType === 'DateRanges') {
                if (this.props.case && this.props.case.dateRanges && Array.isArray(this.props.case.dateRanges) && this.props.case.dateRanges.length > 0 && this.props.case.dateRanges[cardIndex]) {
                    if (this.props.case.dateRanges[cardIndex].startDate !== null && item.id !== 'startDate') {
                        minimumDate = this.props.case.dateRanges[cardIndex].startDate
                    }
                    if (this.props.case.dateRanges[cardIndex].endDate !== null && item.id !== 'endDate') {
                        maximumDate = this.props.case.dateRanges[cardIndex].endDate
                    }
                }
            }
            // else if (item.objectType === 'IsolationDates'){
            //     if (this.props.case && this.props.case.isolationDates && Array.isArray(this.props.case.isolationDates) && this.props.case.isolationDates.length > 0 && this.props.case.isolationDates[cardIndex]) {
            //         if (this.props.case.isolationDates[cardIndex].startDate !== null && item.id !== 'startDate') {
            //             minimumDate = this.props.case.isolationDates[cardIndex].startDate
            //         }
            //         if (this.props.case.isolationDates[cardIndex].endDate !== null && item.id !== 'endDate') {
            //             maximumDate = this.props.case.isolationDates[cardIndex].endDate
            //         }
            //     }
            // }
        }

        let dateValidation = { minimumDate, maximumDate };
        return dateValidation;
    };

    getLocationNameById = (element, locationId) => {
        if (extractIdFromPouchId(element._id, 'location') === locationId) {
            return element.name;
        } else {
            if (element.children && element.children.length > 0) {
                let i;
                let result = null;

                for (i = 0; result === null && i < element.children.length; i++) {
                    result = this.getLocationNameById(element.children[i], locationId);
                }
                return result;
            }
        }
        return null;
    };

    computeDataForCasesSingleScreenDropdownInput = (item) => {
        if (item.id === 'typeId' && item.objectType === 'DateRanges') {
            return _.filter(this.props.referenceData, (o) => { return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_PERSON_DATE_TYPE' })
                .sort((a, b) => { return a.order - b.order; })
                .map((o) => { return { value: getTranslation(o.value, this.props.translation), id: o.value } })
        }
        if (item.id === 'riskLevel') {
            return _.filter(this.props.referenceData, (o) => { return o.active === true && o.categoryId.includes("RISK_LEVEL") })
                .sort((a, b) => { return a.order - b.order; })
                .map((o) => { return { value: getTranslation(o.value, this.props.translation), id: o.value } })
        }
        if (item.id === 'gender') {
            return _.filter(this.props.referenceData, (o) => { return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_GENDER' })
                .sort((a, b) => { return a.order - b.order; })
                .map((o) => { return { label: getTranslation(o.value, this.props.translation), value: o.value } })
        }
        if (item.id === 'typeId') {
            return _.filter(this.props.referenceData, (o) => { return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_ADDRESS_TYPE' })
                .sort((a, b) => { return a.order - b.order; })
                .map((o) => { return { value: getTranslation(o.value, this.props.translation), id: o.value } })
        }
        if (item.id === 'classification') {
            return _.filter(this.props.referenceData, (o) => { return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_CASE_CLASSIFICATION' })
                .sort((a, b) => { return a.order - b.order; })
                .map((o) => { return { label: getTranslation(o.value, this.props.translation), value: o.value } })
        }
        if (item.id === 'outcomeId') {
            return _.filter(this.props.referenceData, (o) => { return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_OUTCOME' })
                .sort((a, b) => { return a.order - b.order; })
                .map((o) => { return { label: getTranslation(o.value, this.props.translation), value: o.value } })
        }
        if (item.id === 'type') {
            return _.filter(this.props.referenceData, (o) => { return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_DOCUMENT_TYPE' })
                .sort((a, b) => { return a.order - b.order; })
                .map((o) => { return { label: getTranslation(o.value, this.props.translation), value: o.value } })
        }
        if (item.id === 'occupation') {
            return _.filter(this.props.referenceData, (o) => { return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_OCCUPATION' })
                .sort((a, b) => { return a.order - b.order; })
                .map((o) => { return { value: getTranslation(o.value, this.props.translation), id: o.value } })
        }
    };

    computeValueForCasesSingleScreen = (item, index) => {
        if (index !== null || index >= 0) {
            if (item.objectType === 'DateRanges') {
                return this.props.case && this.props.case.dateRanges && Array.isArray(this.props.case.dateRanges) && this.props.case.dateRanges.length > 0 && this.props.case.dateRanges[index][item.id] !== undefined ?
                    getTranslation(this.props.case.dateRanges[index][item.id], this.props.translation) : '';
            }
        }
        return this.props.case && this.props.case[item.id] ? getTranslation(this.props.case[item.id], this.props.translation) : '';
    };

    handleNextButton = () => {
        let missingFields = this.props.checkRequiredFieldsInfection();
        if (missingFields && Array.isArray(missingFields) && missingFields.length === 0) {
            if (this.props.checkDateOfOnsetOutcome()) {
                if (this.props.checkIsolationOnsetDates()) {
                    this.props.handleMoveToNextScreenButton(true);
                } else {
                    Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), getTranslation(translations.alertMessages.dateOfOnsetError, this.props.translation), [
                        {
                            text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                            onPress: () => { console.log("OK pressed") }
                        }
                    ])
                }
            } else {
                Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), getTranslation(translations.alertMessages.dateOfOutcomeError, this.props.translation), [
                    {
                        text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                        onPress: () => { console.log("OK pressed") }
                    }
                ])
            }
        } else {
            Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), `${getTranslation(translations.alertMessages.requiredFieldsMissingError, this.props.translation)}.\n${getTranslation(translations.alertMessages.missingFields, this.props.translation)}: ${missingFields}`, [
                {
                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                    onPress: () => { console.log("OK pressed") }
                }
            ])
        }
    };

    handleBackButton = () => {
        this.props.handleMoveToPrevieousScreenButton()
    };

    handleOnFocus = (event) => {
        // this.scrollToInput(findNodeHandle(event.target))
    };

    handleOnBlur = (event) => {
        // this.scrollCasesSingleInfection.props.scrollToPosition(0, 0, false)
        // this.scrollToInput(findNodeHandle(event.target))
    }

    scrollToInput(reactNode) {
        // Add a 'scroll' ref to your ScrollView
        // this.scrollCasesSingleInfection.props.scrollToFocusedInput(reactNode)
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
        locations: _.get(state, `locations.locations`, []),
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(CaseSingleInfectionContainer);
