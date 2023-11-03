/**
 * Created by mobileclarisoft on 10/09/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import {calculateDimension, createDate, extractIdFromPouchId, getTranslation} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import Button from './../components/Button';
import CardComponent from './../components/CardComponent';
import translations from './../utils/translations'
import ElevatedView from 'react-native-elevated-view';
import _ from 'lodash';
import TopContainerButtons from "../components/TopContainerButtons";
import PermissionComponent from './../components/PermissionComponent';
import constants from "./../utils/constants";
import styles from './../styles';
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
        if (nextProps.isEditMode !== this.props.isEditMode || nextProps.routeKey === 'infection') {
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
                    <PermissionComponent
                        render={() => (
                            <TopContainerButtons
                                isNew={this.props.isNew}
                                isEditMode={this.props.isEditMode}
                                index={this.props.index}
                                numberOfTabs={this.props.numberOfTabs}
                                onPressEdit={this.props.onPressEdit}
                                onPressSaveEdit={this.props.onPressSaveEdit}
                                onPressCancelEdit={this.props.onPressCancelEdit}
                                onPressNextButton={this.handleNextButton}
                                onPressPreviousButton={this.handleBackButton}
                            />
                        )}
                        permissionsList={[
                            constants.PERMISSIONS_CASE.caseAll,
                            constants.PERMISSIONS_CASE.caseCreate,
                            constants.PERMISSIONS_CASE.caseModify
                        ]}
                    />

                    <ScrollView
                        style={style.containerScrollView}
                        contentContainerStyle={[style.contentContainerStyle, { paddingBottom: this.props.screenSize.height < 600 ? 70 : 20 }]}
                    >
                        {
                            this.props.preparedFields.infection.map((item, index) => {
                                if (item.invisible){
                                    return null;
                                }
                                return this.handleRenderItem(item, index)
                            })
                        }
                        {
                            this.props.preparedFields.vaccinesReceived.invisible ?
                                null
                                :
                                <>
                                    <View style={style.container}>
                                        {
                                            this.props.case && this.props.case.vaccinesReceived && this.props.case.vaccinesReceived.map((item, index) => {
                                                return this.handleRenderItemForVaccinesList(item, index)
                                            })
                                        }
                                    </View>
                                    {
                                        this.props.isEditMode ? (
                                            <View style={{ alignSelf: 'flex-start', marginHorizontal: calculateDimension(16, false, this.props.screenSize) }}>
                                                <Button
                                                    title={this.props.case.vaccinesReceived && this.props.case.vaccinesReceived.length === 0 ? getTranslation('Add vaccine', this.props.translation) : getTranslation('Add another vaccine', this.props.translation)}
                                                    onPress={this.props.onPressAddVaccine}
                                                    color={styles.backgroundColor}
                                                    titleColor={styles.textColor}
                                                    height={calculateDimension(35, true, this.props.screenSize)}
                                                    width={'100%'}
                                                    style={{marginVertical: calculateDimension(8, true, this.props.screenSize)}}
                                                />
                                            </View>) : null
                                    }
                                </>
                        }
                        {
                            this.props.preparedFields.dateRanges.invisible ?
                                null
                                :
                                <>
                                    <View style={style.container}>
                                        {
                                            this.props.case && this.props.case.dateRanges && this.props.case.dateRanges.map((item, index) => {
                                                return this.handleRenderItemForDateRangesList(item, index)
                                            })
                                        }
                                    </View>
                                    {
                                        this.props.isEditMode ? (
                                            <View style={{ alignSelf: 'flex-start', marginHorizontal: calculateDimension(16, false, this.props.screenSize) }}>
                                                <Button
                                                    title={this.props.case.dateRanges && this.props.case.dateRanges.length === 0 ? getTranslation(translations.caseSingleScreen.oneDateRangeText, this.props.translation) : getTranslation(translations.caseSingleScreen.moreDateRangeText, this.props.translation)}
                                                    onPress={this.props.onPressAddDateRange}
                                                    color={styles.backgroundColor}
                                                    titleColor={styles.textColor}
                                                    height={calculateDimension(35, true, this.props.screenSize)}
                                                    width={'100%'}
                                                    style={{marginVertical: calculateDimension(8, true, this.props.screenSize)}}
                                                />
                                            </View>
                                        ) : null
                                    }
                                </>
                        }
                    </ScrollView>
                </View>
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (item, index) => {
        let fields = item.fields.map((field) => {
            return Object.assign({}, field, { isEditMode: this.props.isEditMode })
        });

        if (this.props.case.outcomeId !== config.caseFieldsForHardCodeCheck.outcomeIdDeceasedValue) {
            fields = fields.filter((field) => {
                return field.id !== 'safeBurial' && field.id !== 'dateOfBurial' && field.id !== 'burialLocationId' && field.id !== 'burialPlaceName'
            });
        }

        return this.renderItemCardComponent(fields, index)
    };

    handleRenderItemForDateRangesList = (item, index) => {
        let fields = this.props.preparedFields.dateRanges.fields.map((field) => {
            return Object.assign({}, field, { isEditMode: this.props.isEditMode })
        });
        // if (this.props && this.props.case && this.props.case.dateRanges && Array.isArray(this.props.case.dateRanges) && this.props.case.dateRanges[index] && this.props.case.dateRanges[index].typeId === config.dateRangeTypes.hospitalization) {
        //     fields[3].label = translations.caseSingleScreen.dateRangeHospitalName;
        // } else {
            fields[3].label = translations.caseSingleScreen.dateRangeCenterName;
        // }
        if (this.props && this.props.case && this.props.case.dateRanges && Array.isArray(this.props.case.dateRanges) && this.props.case.dateRanges[index]
            && (this.props.case.dateRanges[index].typeId !== config.dateRangeTypes.hospitalization && this.props.case.dateRanges[index].typeId !== config.dateRangeTypes.isolation)
        ) {
            // fields.splice(3, 1);
        }
        return this.renderItemCardComponent(fields, index)
    };

    handleRenderItemForVaccinesList = (item, index) => {
        let fields = this.props.preparedFields.vaccinesReceived.fields.map((field) => {
            return Object.assign({}, field, { isEditMode: field.id === 'visualId' ? false : this.props.isEditMode })
        });
        return this.renderItemCardComponent(fields, index)
    };

    renderItemCardComponent = (fields, cardIndex = null) => {
        return (
            <ElevatedView elevation={5} key={cardIndex} style={[style.containerCardComponent, {
                marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                width: calculateDimension(config.designScreenSize.width - 32, false, this.props.screenSize),
                marginVertical: 6,
                minHeight: calculateDimension(72, true, this.props.screenSize)
            }, style.cardStyle]}>
                <ScrollView scrollEnabled={false} style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
                    {
                        fields && fields.map((item, index) => {
                            if(!item.invisible){
                                return this.handleRenderItemCardComponent(item, index, cardIndex);
                            }
                            return null;
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
            else if (item.objectType !== null && item.objectType !== undefined && item.objectType === 'Vaccines') {
                item.onPressArray = [this.props.onPressDeleteVaccines]
            }
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

            if(item.objectType === 'Case'){
                for (let i = 0; i < this.props.locations.length; i++) {
                    let myLocationName = this.getLocationNameById(this.props.locations[i], this.props.case[item.id]);
                    if (myLocationName !== null) {
                        value = myLocationName;
                        break
                    }
                }
            }
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

        // Check if date of onset is required
        if (item.id === 'dateOfOnset' && _.get(this.props, 'isDateOfOnsetRequired', null) === false) {
            item.isRequired = false;
        }

        return (
            <CardComponent
                item={item}
                isEditMode={this.props.isEditMode}
                isEditModeForDropDownInput={this.props.isEditMode}
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
                onChangeSectionedDropDown={
                    item.objectType !== null && item.objectType !== undefined && item.objectType === 'DateRanges' ?
                        this.props.onChangeSectionedDropDownDateRange :
                        (item.objectType !== null && item.objectType !== undefined && item.objectType === 'IsolationDates' ?
                            this.props.onChangeSectionedDropDownIsolation :
                            (item.objectType !== null && item.objectType !== undefined && item.objectType === 'Case' ?
                                this.props.onChangeSectionedDropDownBurial : null
                            )
                        )
                }
                onFocus={this.handleOnFocus}
                onBlur={this.handleOnBlur}
                permissionsList={item.permissionsList}
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
                let hasDateOfOnset = false;
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
                    maximumDate = new Date();
                    if (this.props.case.dateRanges[cardIndex].startDate !== null && item.id !== 'startDate') {
                        minimumDate = this.props.case.dateRanges[cardIndex].startDate;
                    }
                    if (this.props.case.dateRanges[cardIndex].endDate !== null && item.id !== 'endDate') {
                        maximumDate = this.props.case.dateRanges[cardIndex].endDate
                    }
                }
            }
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
        if (item.categoryId) {
            let returnedValue = _.filter(this.props.referenceData, (o) => {
                return (o.active === true && o.categoryId === item.categoryId) && (
                    o.isSystemWide ||
                    !this.props.outbreak?.allowedRefDataItems ||
                    !this.props.outbreak.allowedRefDataItems[o.categoryId] ||
                    this.props.outbreak.allowedRefDataItems[o.categoryId][o.value]
                );
            })
                .sort((a, b) => { return a.order - b.order; });
            returnedValue = _.map(returnedValue, (o) => {
                return { value: getTranslation(o.value, this.props.translation), id: o.value }
            });
                //.filter((o) => {return o.value !== ''});
            return returnedValue;
                // .map()
        } else {
            return [];
        }
    };

    computeValueForCasesSingleScreen = (item, index) => {
        if (index !== null || index >= 0) {
            if (item.objectType === 'DateRanges') {
                return this.props.case && this.props.case.dateRanges && Array.isArray(this.props.case.dateRanges) && this.props.case.dateRanges.length > 0 && this.props.case.dateRanges[index][item.id] !== undefined ?
                    getTranslation(this.props.case.dateRanges[index][item.id], this.props.translation) : '';
            }
            if (item.objectType === 'Vaccines') {
                return this.props.case && this.props.case.vaccinesReceived && Array.isArray(this.props.case.vaccinesReceived) && this.props.case.vaccinesReceived.length > 0 && this.props.case.vaccinesReceived[index][item.id] !== undefined ?
                    getTranslation(this.props.case.vaccinesReceived[index][item.id], this.props.translation) : '';
            }
        }
        return this.props.case && this.props.case[item.id] ? getTranslation(this.props.case[item.id], this.props.translation) : '';
    };

    handleNextButton = () => {
        let missingFields = this.props.checkRequiredFieldsInfection();
        if (missingFields && Array.isArray(missingFields) && missingFields.length === 0) {
            if (this.props.checkDateOfOnsetOutcome()) {
                if (this.props.checkIsolationOnsetDates()) {
                    this.props.onPressNextButton(true);
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
    };
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    containerCardComponent: {
        backgroundColor: styles.backgroundColor,
        borderRadius: 4
    },
    subcontainerCardComponent: {
        alignItems: 'center',
        flex: 1
    },
    container: {
        alignItems: 'center',
        backgroundColor: styles.screenBackgroundColor,
        flex: 1
    },
    cardStyle: {
        flex: 1,
        marginVertical: 6
    },
    containerScrollView: {
        backgroundColor: styles.screenBackgroundColor,
        flex: 1
    },
    contentContainerStyle: {
        alignItems: 'center'
    },
});

function mapStateToProps(state) {
    return {
        screenSize: _.get(state, 'app.screenSize', config.designScreenSize),
        role: _.get(state, 'role', []),
        translation: _.get(state, 'app.translation', []),
        referenceData: _.get(state, 'referenceData', []),
        locations: _.get(state, `locations.locations`, []),
        outbreak: _.get(state, 'outbreak', null),
        isDateOfOnsetRequired: _.get(state, 'outbreak.isDateOfOnsetRequired', null)
    };
}

export default connect(mapStateToProps)(CaseSingleInfectionContainer);
