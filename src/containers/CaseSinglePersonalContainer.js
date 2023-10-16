/**
 * Created by mobileclarisoft on 10/09/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import {calculateDimension, createDate, getTranslation} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import CardComponent from './../components/CardComponent';
import Button from './../components/Button';
import ElevatedView from 'react-native-elevated-view';
import translations from './../utils/translations'
import _ from 'lodash';
import TopContainerButtons from "../components/TopContainerButtons";
import PermissionComponent from './../components/PermissionComponent';
import constants from "./../utils/constants";
import {checkArray} from "../utils/typeCheckingFunctions";
import styles from './../styles';

class CaseSinglePersonalContainer extends Component {

    // This will be a container, so put as less business logic here as possible
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    // Please add here the react lifecycle methods that you need
    shouldComponentUpdate(nextProps, nextState) {
        let should = false;
        if (nextProps.isEditMode !== this.props.isEditMode || nextProps.routeKey === 'personal') {
            should = true;
        }
        return should;
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
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
                            this.props.preparedFields.personal.map((item, index) => {
                                if (!item.invisible) {
                                    return this.handleRenderItem(item, index)
                                }
                                return null;
                            })
                        }
                        {
                            this.props.preparedFields?.document?.invisible ?
                                null
                                :
                                <>
                                    <View style={style.container}>
                                        {
                                            this.props.case && this.props.case.documents && this.props.case.documents.map((item, index) => {
                                                return this.handleRenderItemForDocumentsList(item, index)
                                            })
                                        }
                                    </View>
                                    {
                                        this.props.isEditMode ? (
                                            <View style={{ alignSelf: 'flex-start', marginHorizontal: calculateDimension(16, false, this.props.screenSize) }}>
                                                <Button
                                                    title={!_.get(this.props, 'case.documents', null) || checkArray(this.props.case.documents) && this.props.case.documents.length === 0 ? getTranslation(translations.caseSingleScreen.oneDocumentText, this.props.translation) : getTranslation(translations.caseSingleScreen.moreDocumentsText, this.props.translation)}
                                                    onPress={this.props.onPressAddDocument}
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
                    </ScrollView>
                </View>
            </View >
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (item, index) => {
        let fields = item.fields.map((field) => {
            field.isEditMode = this.props.isEditMode;
            return field;
        });
        return this.renderItemCardComponent(fields, index)
    };

    handleRenderItemForDocumentsList = (item, index) => {
            let fields = this.props.preparedFields.document.fields.map((field) => {
                field.isEditMode = this.props.isEditMode;
                return field;
            });
            return this.renderItemCardComponent(fields, index);
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
                            return this.handleRenderItemCardComponent(item, index, cardIndex);
                        })
                    }
                </ScrollView>
            </ElevatedView>
        );
    };

    handleRenderItemCardComponent = (item, index, cardIndex) => {
        if(!item.invisible){
            return (
                <View style={[style.subcontainerCardComponent, { flex: 1 }]} key={index}>
                    {
                        this.handleRenderItemByType(item, cardIndex)
                    }
                </View>
            )
        }
        return null;
    };

    handleRenderItemByType = (item, cardIndex) => {
        let value = '';
        let isEditModeForDropDownInput = true;
        let minimumDate = undefined;
        let maximumDate = undefined;


        if(item.id === 'pregnancyStatus' && (this.props.case?.gender === translations.localTranslationTokens.male )) {
            return;
        }

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
        if (item.type === 'DatePicker' && value === '') {
            value = null
        }

        if (this.props.selectedItemIndexForTextSwitchSelectorForAge !== null && this.props.selectedItemIndexForTextSwitchSelectorForAge !== undefined && item.objectType === 'Case' && item.dependsOn !== undefined && item.dependsOn !== null) {
            let itemIndexInConfigTextSwitchSelectorValues = config[item.dependsOn].map((e) => { return e.value }).indexOf(item.id);
            if (itemIndexInConfigTextSwitchSelectorValues > -1) {
                if (itemIndexInConfigTextSwitchSelectorValues !== this.props.selectedItemIndexForTextSwitchSelectorForAge) {
                    return
                }
            }
        }

        let dateValidation = this.setDateValidations(item);
        minimumDate = dateValidation.minimumDate;
        maximumDate = dateValidation.maximumDate;

        return (
            <CardComponent
                item={item}
                isEditMode={this.props.isEditMode}
                isEditModeForDropDownInput={this.props.isEditMode}
                selectedItemIndexForAgeUnitOfMeasureDropDown={this.props.selectedItemIndexForAgeUnitOfMeasureDropDown}
                onChangeextInputWithDropDown={this.props.onChangeextInputWithDropDown}
                value={value}
                selectedItemIndexForTextSwitchSelectorForAge={this.props.selectedItemIndexForTextSwitchSelectorForAge}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                index={cardIndex}
                onChangeText={this.props.onChangeText}
                onChangeDate={this.props.onChangeDate}
                onChangeSwitch={this.props.onChangeSwitch}
                onChangeDropDown={this.props.onChangeDropDown}
                onChangeTextSwitchSelector={this.props.onChangeTextSwitchSelector}
                onDeletePress={this.props.onDeletePress}
                onFocus={this.handleOnFocus}
                onBlur={this.handleOnBlur}
                permissionsList={item.permissionsList}
                mask={this.props.outbreak?.caseIdMask}
            />
        )
    };

    setDateValidations = (item) => {
        let minimumDate = undefined;
        let maximumDate = undefined;

        if (item.type === 'DatePicker') {
            if (item.id === 'dob' || item.id === 'dateOfReporting') {
                maximumDate = createDate(null);
            }
        }

        let dateValidation = { minimumDate, maximumDate };
        return dateValidation
    };

    computeDataForCasesSingleScreenDropdownInput = (item) => {
        if (item.categoryId) {
            return _.filter(this.props.referenceData, (o) => {
                return (o.active === true && o.categoryId === item.categoryId) && (
                    o.isSystemWide ||
                    !this.props.outbreak?.allowedRefDataItems ||
                    !this.props.outbreak.allowedRefDataItems[o.categoryId] ||
                    this.props.outbreak.allowedRefDataItems[o.categoryId][o.value]
                );
            })
                .sort((a, b) => { return a.order - b.order; })
                .map((o) => { return { value: getTranslation(o.value, this.props.translation), id: o.value } })
        }
    };

    computeValueForCasesSingleScreen = (item, index) => {
        if (index !== null || index >= 0) {
            if (item.objectType === 'Documents') {
                return this.props.case && this.props.case.documents && Array.isArray(this.props.case.documents) && this.props.case.documents.length > 0 && this.props.case.documents[index][item.id] !== undefined ?
                    getTranslation(this.props.case.documents[index][item.id], this.props.translation) : '';
            }
        }
        if (item.id === 'age') {
            if (this.props.case && this.props.case[item.id] !== null && this.props.case[item.id] !== undefined) {
                return this.props.case[item.id]
            }
        } else {
            return getTranslation(_.get(this.props, `case[${item.id}]`, ' '), this.props.translation);
        }
    };

    handleNextButton = () => {
        let missingFields = this.props.checkRequiredFieldsPersonalInfo();
        if (missingFields && Array.isArray(missingFields) && missingFields.length === 0) {
            if (this.props.checkAgeYearsRequirements()) {
                if (this.props.checkAgeMonthsRequirements()) {
                    this.props.onPressNextButton()
                } else {
                    Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), getTranslation(translations.alertMessages.monthsValueError, this.props.translation), [
                        {
                            text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                            onPress: () => { console.log("OK pressed") }
                        }
                    ])
                }
            } else {
                Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), getTranslation(translations.alertMessages.yearsValueError, this.props.translation), [
                    {
                        text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                        onPress: () => { console.log("OK pressed") }
                    }
                ])
            }
        } else {
            Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), `${getTranslation(translations.alertMessages.requiredFieldsMissingError, this.props.translation)}.\n${getTranslation(translations.alertMessages.missingFields, this.props.translation)}: ${missingFields}`, [
                {
                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                    onPress: () => { console.log("OK pressed") }
                }
            ])
        }
    };

    handleOnFocus = (event) => {
        // this.scrollToInput(findNodeHandle(event.target))
    };

    handleOnBlur = (event) => {
        // this.scrollCasesSinglePersonal.props.scrollToPosition(0, 0, false)
        // this.scrollToInput(findNodeHandle(event.target))
    };

    scrollToInput(reactNode) {
        // Add a 'scroll' ref to your ScrollView
        // this.scrollCasesSinglePersonal.props.scrollToFocusedInput(reactNode)
    }
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    containerCardComponent: {
        backgroundColor: styles.backgroundColor,
        borderRadius: 4,
        paddingTop: 8
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
        referenceData: _.get(state, 'referenceData', []),
        translation: _.get(state, 'app.translation'),
        outbreak: _.get(state, 'outbreak', null)
    };
}

export default connect(mapStateToProps)(CaseSinglePersonalContainer);
