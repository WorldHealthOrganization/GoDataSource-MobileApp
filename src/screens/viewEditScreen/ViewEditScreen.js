// This will handle rendering
import React, {Component} from 'react';
import {Alert, Animated, InteractionManager, Platform, StyleSheet, View} from 'react-native';
import {PagerScroll, TabBar, TabView} from 'react-native-tab-view';
import ElevatedView from 'react-native-elevated-view';
import Ripple from 'react-native-material-ripple';
import {Icon} from 'react-native-material-ui';
import {LoaderScreen} from 'react-native-ui-lib';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import ViewHOC from './../../components/ViewHOC';
import NavBarCustom from './../../components/NavBarCustom';
import Breadcrumb from './../../components/Breadcrumb';
import {enhanceTabsWithDataHandling} from './withDataHandling';
import {
    calculateDimension,
    computeFullName,
    createDate,
    daysSince,
    extractIdFromPouchId,
    generateId,
    generateTeamId,
    getTranslation,
    updateRequiredFields
} from "../../utils/functions";
import translations from "../../utils/translations";
import config from "../../utils/config";
import constants from './../../utils/constants';
import lodashGet from "lodash/get";
import _ from "lodash";
import {checkArrayAndLength} from "../../utils/typeCheckingFunctions";
import FollowUpsSingleContainer from './../../containers/FollowUpsSingleContainer';
import {Navigation} from "react-native-navigation";
import {fadeInAnimation, fadeOutAnimation} from "../../utils/animations";
import ContactsSingleRelationship from "../../containers/ContactsSingleRelationship";
import styles from "../../styles";
import colors from "../../styles/colors";

class ViewEditScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            interactionComplete: false,
            showAddSingleAnswerModalScreen: false,
            routes: [],
            index: lodashGet(this.props, 'index', 0),
            selectedItemIndexForTextSwitchSelectorForAge: 0, // age/dob - switch tab
            selectedItemIndexForAgeUnitOfMeasureDropDown: this.props.isNew ? 0 : (lodashGet(this.props, 'element.age.years', 0) > 0) ? 0 : 1, //default age dropdown value
            showAddFollowUpScreen: false,
            isDateTimePickerVisible: false
        };
    }

    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            let routes = [];
            switch (lodashGet(this.props, 'elementType', 'followUp')) {
                case 'followUp':
                    routes = config.tabsValuesRoutes.followUpsSingle;
                    break;
                case 'contact':
                    routes = this.props.isNew ? config.tabsValuesRoutes.contactsAdd : config.tabsValuesRoutes.contactsSingle;
                    break;
                case 'case':
                    routes = this.props.isNew ? config.tabsValuesRoutes.casesSingle : config.tabsValuesRoutes.casesSingleViewEdit;
                    break;
            }

            this.setState({
                interactionComplete: true,
                routes
            })
        })
    }

    render() {
        if (!this.state.interactionComplete) {
            return (
                <LoaderScreen
                    overlay={true}
                    loaderColor={styles.primaryColor}
                    backgroundColor={'rgba(255, 255, 255, 0.8)'} />
            )
        }

        return (
            <ViewHOC
                style={style.container}
                showLoader={this && this.state && this.state.loading}
                loaderText={this.props && this.props.syncState ? 'Loading' : getTranslation(translations.loadingScreenMessages.loadingMsg, this.props.translation)}
            >
                <NavBarCustom
                    title={null}
                    customTitle={
                        <View style={style.headerContainer}>
                            <View style={[style.breadcrumbContainer]}>
                                <Breadcrumb
                                    entities={
                                        [
                                            getTranslation(lodashGet(this.props, 'previousScreen', translations.followUpsSingleScreen.title), this.props.translation),
                                            computeFullName(this.props.elementType === 'followUp' ? this.props.additionalData : this.props.element)
                                        ]
                                    }
                                    componentId={this.props.componentId}
                                    onPress={this.handlePressBreadcrumb}
                                />
                            </View>
                            <View style={style.headerButtonSpacing}>
                                <ElevatedView
                                    elevation={0}
                                    style={[
                                        style.headerButton, 
                                        {
                                            width: calculateDimension(30, false, this.props.screenSize),
                                            height: calculateDimension(30, true, this.props.screenSize)
                                        }
                                    ]}
                                >
                                    <Ripple style={style.headerButtonInner} onPress={this.goToHelpScreen}>
                                        <Icon name="help" color={styles.textColor} size={18} />
                                    </Ripple>
                                </ElevatedView>
                            </View>
                            <View>
                                {
                                    this.renderNavBarContent()
                                }
                            </View>
                        </View>
                    }
                    componentId={this.props.componentId}
                    iconName="menu"
                    handlePressNavbarButton={this.handlePressNavbarButton}
                />
                <TabView
                    navigationState={this.state}
                    onIndexChange={this.handleOnIndexChange}
                    animationEnabled={Platform.OS === 'ios'}
                    renderScene={this.handleRenderScene}
                    renderPager={this.handleRenderPager}
                    renderTabBar={this.handleRenderTabBar}
                    useNativeDriver
                />
            </ViewHOC>
        );
    }

    renderNavBarContent = () => {
        let Menu = require('react-native-material-menu').default;
        let MenuItem = require('react-native-material-menu').MenuItem;
        switch (this.props.elementType) {
            case 'followUp':
                return (
                        this.props.role && this.props.role.find((e) => e === config.userPermissions.writeFollowUp) !== undefined ? (
                        <View style={{flex: 1}}>
                            <Menu
                                ref="menuRef"
                                button={
                                    <Ripple onPress={this.showMenu} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                        <Icon name="more-vert" />
                                    </Ripple>
                                }
                            >
                                <MenuItem onPress={this.handleEditContact}>
                                    {getTranslation(translations.followUpsSingleScreen.editContactButton, this.props.translation)}
                                </MenuItem>
                            </Menu>
                        </View>
                    ) : null
                );
            case 'contact':
                let AddFollowUpScreen = require('./../AddFollowUpScreen').default;
                let DateTimePicker = require('react-native-modal-datetime-picker').default;
                return (
                    this.props.role && this.props.role.find((e) => e === config.userPermissions.writeContact) !== undefined ? (
                        <View>
                            <Menu
                                ref="menuRef"
                                button={
                                    <Ripple onPress={this.showMenu}
                                            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                                        <Icon name="more-vert"/>
                                    </Ripple>
                                }
                            >
                                {
                                    !this.props.isNew ? (
                                        <MenuItem onPress={this._showDateTimePicker}>
                                            {getTranslation(translations.contactSingleScreen.deceasedContactLabel, this.props.translation)}
                                        </MenuItem>
                                    ) : null
                                }
                                {
                                    !this.props.isNew ? (
                                        <MenuItem onPress={this.handleOnAddFollowUp}>
                                            {getTranslation(translations.contactsScreen.addFollowupsButton, this.props.translation)}
                                        </MenuItem>
                                    ) : null
                                }
                                <DateTimePicker
                                    isVisible={this.state.isDateTimePickerVisible}
                                    timeZoneOffsetInMinutes={0}
                                    onConfirm={this._handleDatePicked}
                                    onCancel={this._hideDateTimePicker}
                                />
                                <AddFollowUpScreen
                                    showAddFollowUpScreen={this.state.showAddFollowUpScreen}
                                    onCancelPressed={this.handleOnCancelPressed}
                                    onSavePressed={this.handleOnSavePressed}
                                />
                            </Menu>
                        </View>
                    ) : null
                );
                break;
            case 'case':

                break;
            case 'event':
                break;
            default:
                break
        }
    };

    showMenu = () => {
        this.refs.menuRef.show();
    };

    hideMenu = () => {
        this.refs.menuRef.hide();
    };

    handleRenderPager = (props) => {
        return (Platform.OS === 'ios') ? <PagerScroll {...props} swipeEnabled={false} animationEnabled={false} /> :
            <PagerScroll {...props} swipeEnabled={false} animationEnabled={false} />
    };

    // Please write here all the methods that are not react native lifecycle methods
    handlePressNavbarButton = () => {
        Navigation.mergeOptions(this.props.componentId, {
            sideMenu: {
                left: {
                    visible: true,
                },
            },
        });
    };

    //Index change for TabBar
    handleOnIndexChange = _.throttle( (index) => {
        // if (this.state.canChangeScreen) {
        this.setState({
            canChangeScreen: false,
            index
        });
        // }
    },300);
    handleMoveToNextScreenButton = () => {
        let nextIndex = this.state.index + 1;

        this.setState({
            canChangeScreen: true,
        });
        this.handleOnIndexChange(nextIndex)
    };
    handleMoveToPrevieousScreenButton = () => {
        let nextIndex = this.state.index - 1;

        this.setState({
            canChangeScreen: true,
        });

        this.handleOnIndexChange(nextIndex)
    };

    //Generate TabBar
    handleRenderTabBar = (props) => {
        return (
            <TabBar
                {...props}
                indicatorStyle={{
                    backgroundColor: styles.primaryColor,
                    height: 2
                }}
                style={{
                    height: 36,
                    backgroundColor: styles.backgroundColor
                }}
                tabStyle={{
                    width: 'auto',
                    paddingHorizontal: 16,
                    marginHorizontal: 0,
                    textAlign: 'center'
                }}
                activeColor={styles.primaryColor}
                inactiveColor={styles.secondaryColor}
                renderLabel={this.handleRenderLabel(props)}
                scrollEnabled={this.props.elementType !== 'followUp'}
                bounces={this.props.elementType !== 'followUp'}
            />
        )
    };

    //Render label for TabBar
    handleRenderLabel = (props) => ({ route, focused }) => {

        return (
            <Animated.Text style={{
                fontFamily: 'Roboto-Medium',
                fontSize: 12,
                flex: 1,
                alignSelf: 'center',
                color: focused ? colors.primaryColor : this.props.isNew ? colors.secondaryColor : colors.textColor
            }}>
                {getTranslation(route.title, this.props.translation).toUpperCase()}
            </Animated.Text>
        );
    };

    //Render scene
    handleRenderScene = ({ route }) => {
        switch (lodashGet(this.props, 'elementType', 'followUp')) {
            case 'followUp':
                switch (lodashGet(route, 'key', 'personal')) {
                    case 'genInfo':
                        // let FollowUpsSingleContainer = require('./../../containers/FollowUpsSingleContainer').default;
                        return (
                            <FollowUpsSingleContainer
                                isNew={this.props.isNew}
                                isEditMode={this.props.isEditMode}
                                item={this.props.element}
                                contact={this.props.additionalData}
                                activeIndex={this.state.index}
                                numberOfTabs={this.state.routes.length}
                                onPressNextButton={this.onPressNextButton}
                                onPressPreviousButton={this.onPressPreviousButton}
                                onChangeText={this.props.onChangeText}
                                onChangeDate={this.props.onChangeDate}
                                onChangeSwitch={this.props.onChangeSwitch}
                                onChangeDropDown={this.props.onChangeDropDown}
                                onPressEdit={this.props.onPressEdit}
                                onPressCancelEdit={this.props.onPressCancelEdit}
                            />
                        );
                    case 'quest':
                        let FollowUpsSingleQuestionnaireContainer = require('./../../containers/FollowUpsSingleQuestionnaireContainer').default;
                        return (
                            <FollowUpsSingleQuestionnaireContainer
                                item={this.props.element}
                                currentAnswers={this.props.currentAnswers}
                                previousAnswers={this.props.previousAnswers}
                                contact={this.props.additionalData}
                                isNew={this.props.isNew}
                                isEditMode={this.props.isEditMode}
                                activeIndex={this.state.index}
                                numberOfTabs={this.state.routes.length}
                                onChangeTextAnswer={this.props.onChangeTextAnswer}
                                onChangeDateAnswer={this.props.onChangeDateAnswer}
                                onChangeSingleSelection={this.props.onChangeSingleSelection}
                                onChangeMultipleSelection={this.props.onChangeMultipleSelection}
                                onPressSave={this.props.onPressSave}
                                onPressPreviousButton={this.onPressPreviousButton}
                                // onPressMissing={this.prop}
                                onClickAddNewMultiFrequencyAnswer={this.props.onClickAddNewMultiFrequencyAnswer}
                                onChangeAnswerDate={this.props.onChangeAnswerDate}
                                savePreviousAnswers={this.props.savePreviousAnswers}
                                copyAnswerDate={this.props.copyAnswerDate}

                                onPressEdit={this.props.onPressEdit}
                                onPressCancelEdit={this.props.onPressCancelEdit}
                            />
                        );
                }
                break;
            case 'contact':
                switch (lodashGet(route, 'key', 'personal')) {
                    case 'personal':
                        let ContactsSinglePersonal = require('./../../containers/ContactsSinglePersonal').default;
                        return (
                            <ContactsSinglePersonal
                                isNew={this.props.isNew}
                                isEditMode={this.props.isEditMode}
                                contact={this.props.element}
                                numberOfTabs={this.state.routes.length}
                                activeIndex={this.state.index}

                                onChangeText={this.props.onChangeText}
                                onChangeDropDown={this.props.onChangeDropDown}
                                onChangeDate={this.props.onChangeDate}
                                onChangeSwitch={this.props.onChangeSwitch}

                                onPressAddDocument={this.props.onPressAddDocument}
                                onDeletePress={this.props.onPressDeleteDocument}

                                onPressAddVaccine={this.props.onPressAddVaccine}
                                onPressDeleteVaccines={this.props.onPressDeleteVaccine}

                                onPressEdit={this.props.onPressEdit}
                                onPressCancelEdit={this.props.onPressCancelEdit}


                                onChangeTextInputWithDropDown={this.handleOnChangeTextInputWithDropDown}
                                handleMoveToNextScreenButton={this.handleMoveToNextScreenButton}
                                checkRequiredFieldsPersonalInfo={this.checkRequiredFieldsPersonalInfo}
                                onChangeTextSwitchSelector={this.handleOnChangeTextSwitchSelector}
                                selectedItemIndexForTextSwitchSelectorForAge={this.state.selectedItemIndexForTextSwitchSelectorForAge}
                                selectedItemIndexForAgeUnitOfMeasureDropDown={this.state.selectedItemIndexForAgeUnitOfMeasureDropDown}
                                checkAgeMonthsRequirements={this.checkAgeMonthsRequirements}
                                checkAgeYearsRequirements={this.checkAgeYearsRequirements}
                            />
                        );
                    case 'address':
                    let ContactsSingleAddress = require('./../../containers/ContactsSingleAddress').default;
                        return (
                            <ContactsSingleAddress
                                isNew={this.props.isNew}
                                isEditMode={this.props.isEditMode}
                                contact={this.props.element}
                                activeIndex={this.state.index}
                                numberOfTabs={this.state.routes.length}

                                onChangeText={this.props.onChangeText}
                                onChangeDropDown={this.props.onChangeDropDown}
                                onChangeDate={this.props.onChangeDate}
                                onChangeSwitch={this.props.onChangeSwitch}

                                onPressEdit={this.props.onPressEdit}
                                onPressCancelEdit={this.props.onPressCancelEdit}


                                onChangeSectionedDropDown={this.handleOnChangeSectionedDropDown}
                                onDeletePress={this.handleOnDeletePress}
                                onPressCopyAddress={this.handleOnPressCopyAddress}
                                onPressAddAdrress={this.handleOnPressAddAdrress}
                                handleMoveToNextScreenButton={this.handleMoveToNextScreenButton}
                                handleMoveToPrevieousScreenButton={this.handleMoveToPrevieousScreenButton}
                                checkRequiredFieldsAddresses={this.checkRequiredFieldsAddresses}
                                anotherPlaceOfResidenceWasChosen={this.state.anotherPlaceOfResidenceWasChosen}
                                hasPlaceOfResidence={this.state.hasPlaceOfResidence}
                            />
                        );
                    case 'exposures':
                    let ContactsSingleRelationship = require('./../../containers/ContactsSingleRelationship').default;
                        return (
                            <ContactsSingleRelationship
                                preparedFields={this.props.preparedFields}
                                isNew={this.props.isNew}
                                isEditMode={this.props.isEditMode}
                                contact={this.props.element}
                                activeIndex={this.state.index}
                                numberOfTabs={this.state.routes.length}

                                onChangeText={this.props.onChangeText}
                                onChangeDropDown={this.props.onChangeDropDown}
                                onChangeDate={this.props.onChangeDate}
                                onChangeSwitch={this.props.onChangeSwitch}

                                onPressEdit={this.props.onPressEdit}
                                onPressCancelEdit={this.props.onPressCancelEdit}


                                onPressEditExposure={this.handleOnPressEditExposure}
                                onPressDeleteExposure={this.handleOnPressDeleteExposure}
                                addContactFromCasesScreen={this.props.addContactFromCasesScreen}
                                componentId={this.props.componentId}
                                saveExposure={this.handleSaveExposure}
                                handleMoveToPrevieousScreenButton={this.handleMoveToPrevieousScreenButton}
                                handleOnPressSave={this.handleOnPressSave}
                                handleMoveToNextScreenButton={this.handleMoveToNextScreenButton}
                                selectedExposure={this.props.singleCase}
                            />
                        );
                    case 'calendar':
                    let ContactsSingleCalendar = require('./../../containers/ContactsSingleCalendar').default;
                        return (
                            <ContactsSingleCalendar
                                isNew={this.props.isNew}
                                isEditMode={this.props.isEditMode}
                                contact={this.props.element}
                                activeIndex={this.state.index}
                                numberOfTabs={this.state.routes.length}

                                onPressEdit={this.props.onPressEdit}
                                onPressCancelEdit={this.props.onPressCancelEdit}

                                handleOnPressSave={this.handleOnPressSave}
                                handleMoveToPrevieousScreenButton={this.handleMoveToPrevieousScreenButton}
                            />
                        );
                }
                break;
            case 'case':
                switch (lodashGet(route, 'key', 'personal')) {
                    case 'personal':
                        let CaseSinglePersonalContainer = require('./../../containers/CaseSinglePersonalContainer').default;
                        return (
                            <CaseSinglePersonalContainer
                                isNew={this.props.isNew}
                                isEditMode={this.props.isEditMode}
                                case={this.props.element}
                                numberOfTabs={this.state.routes.length}
                                index={this.state.index}

                                onChangeText={this.props.onChangeText}
                                onChangeDropDown={this.props.onChangeDropDown}
                                onChangeDate={this.props.onChangeDate}
                                onChangeSwitch={this.props.onChangeSwitch}

                                onPressAddDocument={this.props.onPressAddDocument}
                                onDeletePress={this.props.onPressDeleteDocument}

                                onPressAddVaccine={this.props.onPressAddVaccine}
                                onPressDeleteVaccines={this.props.onPressDeleteVaccine}

                                onPressEdit={this.props.onPressEdit}
                                onPressCancelEdit={this.props.onPressCancelEdit}


                                onPressSaveEdit={this.onPressSaveEdit}
                                handleMoveToNextScreenButton={this.handleMoveToNextScreenButton}
                                checkRequiredFieldsPersonalInfo={this.checkRequiredFieldsPersonalInfo}
                                onChangeTextSwitchSelector={this.handleOnChangeTextSwitchSelector}
                                selectedItemIndexForTextSwitchSelectorForAge={this.state.selectedItemIndexForTextSwitchSelectorForAge}
                                selectedItemIndexForAgeUnitOfMeasureDropDown={this.state.selectedItemIndexForAgeUnitOfMeasureDropDown}
                                checkAgeMonthsRequirements={this.checkAgeMonthsRequirements}
                                checkAgeYearsRequirements={this.checkAgeYearsRequirements}
                                onChangeextInputWithDropDown={this.handleOnChangeTextInputWithDropDown}
                            />
                        );
                    case 'address':
                        let CaseSingleAddressContainer = require("../../containers/CaseSingleAddressContainer").default;
                        return (
                            <CaseSingleAddressContainer
                                isNew={this.props.isNew}
                                isEditMode={this.props.isEditMode}
                                case={this.props.element}
                                numberOfTabs={this.state.routes.length}
                                index={this.state.index}

                                onChangeText={this.props.onChangeText}
                                onChangeDropDown={this.props.onChangeDropDown}
                                onChangeDate={this.props.onChangeDate}
                                onChangeSwitch={this.props.onChangeSwitch}

                                onPressAddDocument={this.props.onPressAddDocument}
                                onDeletePress={this.props.onPressDeleteDocument}

                                onPressAddVaccine={this.props.onPressAddVaccine}
                                onPressDeleteVaccines={this.props.onPressDeleteVaccine}

                                onPressEdit={this.props.onPressEdit}
                                onPressCancelEdit={this.props.onPressCancelEdit}





                                onPressSaveEdit={this.onPressSaveEdit}
                                onChangeSectionedDropDown={this.handleOnChangeSectionedDropDownAddress}
                                onPressAddAddress={this.handleOnPressAddAddress}
                                handleMoveToNextScreenButton={this.handleMoveToNextScreenButton}
                                handleMoveToPrevieousScreenButton={this.handleMoveToPrevieousScreenButton}
                                checkRequiredFieldsAddresses={this.checkRequiredFieldsAddresses}
                                anotherPlaceOfResidenceWasChosen={this.state.anotherPlaceOfResidenceWasChosen}
                                anotherPlaceOfResidenceChanged={this.anotherPlaceOfResidenceChanged}
                                hasPlaceOfResidence={this.state.hasPlaceOfResidence}
                            />
                        );
                    case 'infection':
                    let CaseSingleInfectionContainer = require("../../containers/CaseSingleInfectionContainer").default;
                        return (
                            <CaseSingleInfectionContainer
                                isNew={this.props.isNew}
                                isEditMode={this.props.isEditMode}
                                case={this.props.element}
                                numberOfTabs={this.state.routes.length}
                                index={this.state.index}

                                onChangeText={this.props.onChangeText}
                                onChangeDropDown={this.props.onChangeDropDown}
                                onChangeDate={this.props.onChangeDate}
                                onChangeSwitch={this.props.onChangeSwitch}

                                onPressAddDocument={this.props.onPressAddDocument}
                                onDeletePress={this.props.onPressDeleteDocument}

                                onPressAddVaccine={this.props.onPressAddVaccine}
                                onPressDeleteVaccines={this.props.onPressDeleteVaccine}

                                onPressEdit={this.props.onPressEdit}
                                onPressCancelEdit={this.props.onPressCancelEdit}




                                onPressSaveEdit={this.onPressSaveEdit}
                                handleMoveToNextScreenButton={this.handleMoveToNextScreenButton}
                                handleMoveToPrevieousScreenButton={this.handleMoveToPrevieousScreenButton}
                                checkRequiredFieldsInfection={this.checkRequiredFieldsInfection}
                                onPressAddDateRange={this.onPressAddDateRange}
                                handleOnPressDeleteDateRange={this.handleOnPressDeleteDateRange}
                                //onPressAddIsolationDates={this.onPressAddIsolationDates}

                                checkIsolationOnsetDates={this.checkIsolationOnsetDates}
                                onChangeSectionedDropDownDateRange={this.onChangeSectionedDropDownDateRange}
                                onChangeSectionedDropDownIsolation={this.onChangeSectionedDropDownIsolation}
                                onChangeSectionedDropDownBurial={this.onChangeSectionedDropDownBurial}
                                checkDateOfOnsetOutcome={this.checkDateOfOnsetOutcome}
                            />
                        );
                    case 'exposures':
                    let CaseSingleRelationshipContainer = require("../../containers/CaseSingleRelationshipContainer").default;
                        return (
                            <CaseSingleRelationshipContainer
                                isNew={this.props.isNew}
                                isEditMode={this.props.isEditMode}
                                case={this.props.element}
                                relations={this.props.element.relations}
                                numberOfTabs={this.state.routes.length}
                                index={this.state.index}

                                onChangeText={this.props.onChangeText}
                                onChangeDropDown={this.props.onChangeDropDown}
                                onChangeDate={this.props.onChangeDate}
                                onChangeSwitch={this.props.onChangeSwitch}

                                onPressAddDocument={this.props.onPressAddDocument}
                                onDeletePress={this.props.onPressDeleteDocument}

                                onPressAddVaccine={this.props.onPressAddVaccine}
                                onPressDeleteVaccines={this.props.onPressDeleteVaccine}

                                onPressEdit={this.props.onPressEdit}
                                onPressCancelEdit={this.props.onPressCancelEdit}



                                onPressSaveEdit={this.onPressSaveEdit}
                                onPressEditExposure={this.handleOnPressEditExposure}
                                onPressDeleteExposure={this.handleOnPressDeleteExposure}
                                componentId={this.props.componentId}
                                saveExposure={this.handleSaveExposure}
                                handleOnPressSave={this.handleOnPressSave}
                                selectedExposure={this.props.singleCase}
                            />
                        );
                    case 'caseInvestigation':
                        let CaseSingleInvestigationContainer = require("../../containers/CaseSingleInvestigationContainer").default;
                        return (
                            <CaseSingleInvestigationContainer
                                isNew={this.props.isNew}
                                isEditMode={this.props.isEditMode}
                                item={this.props.element}
                                numberOfTabs={this.state.routes.length}
                                activeIndex={this.state.index}

                                onChangeText={this.props.onChangeText}
                                onChangeDropDown={this.props.onChangeDropDown}
                                onChangeDate={this.props.onChangeDate}
                                onChangeSwitch={this.props.onChangeSwitch}

                                onPressAddDocument={this.props.onPressAddDocument}
                                onDeletePress={this.props.onPressDeleteDocument}

                                onPressAddVaccine={this.props.onPressAddVaccine}
                                onPressDeleteVaccines={this.props.onPressDeleteVaccine}

                                onPressEdit={this.props.onPressEdit}
                                onPressCancelEdit={this.props.onPressCancelEdit}

                                currentAnswers={this.props.currentAnswers}
                                previousAnswers={this.props.previousAnswers}

                                onChangeTextAnswer={this.props.onChangeTextAnswer}
                                onChangeSingleSelection={this.props.onChangeSingleSelection}
                                onChangeMultipleSelection={this.props.onChangeMultipleSelection}
                                onChangeDateAnswer={this.props.onChangeDateAnswer}
                                onChangeAnswerDate={this.props.onChangeAnswerDate}
                                savePreviousAnswers={this.props.savePreviousAnswers}
                                copyAnswerDate={this.props.handleCopyAnswerDate}
                                onClickAddNewMultiFrequencyAnswer={this.props.onClickAddNewMultiFrequencyAnswer}

                                index={this.state.index}
                                onPressSave={this.handleOnPressSave}
                                onPressSaveEdit={this.onPressSaveEdit}

                                handleMoveToPrevieousScreenButton={this.handleMoveToPrevieousScreenButton}
                            />);
                    default: return null;
                }
            case 'event':
                break;
        }
    };

    // Date picker handlers for deceased contact
    _showDateTimePicker = () => {
        // callGetDerivedStateFromProps = false;
        this.setState({
            isDateTimePickerVisible: true
        });
    };
    _hideDateTimePicker = () => {
        // callGetDerivedStateFromProps = false;
        // this.hideMenu();
        this.setState({
            isDateTimePickerVisible: false
        });
    };
    _handleDatePicked = (date) => {
        this._hideDateTimePicker();

        this.props.onChangeDate(createDate(date), 'dateDeceased');
        this.props.onChangeSwitch(true, 'deceased');

        // this.setState(prevState => ({
        //     contact: Object.assign({}, prevState.contact, { deceased: true, dateDeceased: createDate(date) })
        // }), () => {
        //     this.handleOnPressSave();
        // });
    };

    // Add follow-ups handlers
    handleOnAddFollowUp = () => {
        this.setState({
            showAddFollowUpScreen: !this.state.showAddFollowUpScreen
        })
    };
    handleOnCancelPressed = () => {
        this.setState({
            showAddFollowUpScreen: !this.state.showAddFollowUpScreen
        }, () => this.hideMenu())
    };
    handleOnSavePressed = (date) => {
        // Here contact={label: <name>, value: <contactId>} and date is a regular date
        // extract contact's main address
        // let address = this.state.contact.addresses.find((e) => {return e.type === config.})

        let now = createDate(null);
        date = createDate(date).toISOString();
        let followUp = {
            _id: generateId(),
            statusId: config.followUpStatuses.notPerformed,
            targeted: false,
            date: date,
            fileType: 'followUp.json',
            outbreakId: this.props.outbreakId,
            index: daysSince(_.get(this.props, 'element.followUp.startDate', null), date) + 1,
            teamId: generateTeamId(this.props.element.addresses.slice(), this.props.teams, this.props.locations.slice()),
            personId: extractIdFromPouchId(this.props.element._id, 'person.json')
        };

        followUp = updateRequiredFields(this.props.user.outbreakId, this.props.user._id, followUp, 'create', 'followUp.json');

        this.setState({
            showAddFollowUpScreen: !this.state.showAddFollowUpScreen
        }, () => {
            this.hideMenu();
            Navigation.push(this.props.componentId, {
                component:{
                    name: constants.appScreens.viewEditScreen,
                    options:{
                        animations: {
                            push: fadeInAnimation,
                            pop: fadeOutAnimation
                        }
                    },
                    passProps: {
                        isNew: true,
                        isEditMode: true,
                        element: followUp,
                        elementType: 'followUp',
                        additionalId: this.props.element._id,
                        previousScreen: getTranslation(translations.contactSingleScreen.addContactTitle, this.props.translation),
                        // contact: this.props.element,
                        // item: followUp
                    }
                }
            });
        });
    };

    onPressNextButton = () => {
        let missingFields = this.props.onPressNextButton(this.state.index);
        if (checkArrayAndLength(missingFields)) {
            Alert.alert(
                getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation),
                `${getTranslation(translations.alertMessages.requiredFieldsMissingError, this.props.translation)}.
                \n${getTranslation(translations.alertMessages.missingFields, this.props.translation)}: ${missingFields}`, [
                    {
                        text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                        onPress: () => { console.log("OK pressed") }
                    }
            ])
        } else {
            this.setState(prevState => ({
                index: prevState.index + 1
            }))
        }
    };

    onPressPreviousButton = () => {
        this.setState(prevState => ({
            index: prevState.index - 1
        }))
    };
}

ViewEditScreen.propTypes = {
    elementType: PropTypes.oneOf(['followUp', 'contact', 'case', 'event']).isRequired,
    element: PropTypes.object.isRequired,
    additionalData: PropTypes.object,
    index: PropTypes.number,
    isNew: PropTypes.bool,
    refresh: PropTypes.func,

    // methods for editing data -> required
    onChangeText: PropTypes.func.isRequired,
    onChangeDate: PropTypes.func.isRequired,
    onChangeSwitch: PropTypes.func.isRequired,
    onChangeDropDown: PropTypes.func.isRequired,

    // Methods for questionnaires -> required
    onChangeTextAnswer: PropTypes.func.isRequired,
    onChangeDateAnswer: PropTypes.func.isRequired,
    onChangeSingleSelection: PropTypes.func.isRequired,
    onChangeMultipleSelection: PropTypes.func.isRequired,
    onChangeAnswerDate: PropTypes.func.isRequired,
    onClickAddNewMultiFrequencyAnswer: PropTypes.func.isRequired,
    savePreviousAnswers: PropTypes.func.isRequired,
    copyAnswerDate: PropTypes.func.isRequired,

    onPressNextButton: PropTypes.func,

    previousAnswers: PropTypes.object,
    currentAnswers: PropTypes.object,

    //
    onPressSave: PropTypes.func.isRequired,

};

ViewEditScreen.defaultProps = {
    additionalData: {},
    index: 0,
    isNew: false,
    refresh: () => {console.log("ViewEditScreenView default refresh")},

    onPressNextButton: () => {console.log('ViewEditScreen default onPressNextButton')},

    previousAnswers: {},
    currentAnswers: {}
};

const style = StyleSheet.create({
    container: {
        flex: 1
    },
    headerContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: 16
    },
    breadcrumbContainer: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },
    headerButtonSpacing: {
        marginRight: 8
    },
    headerButton: {
        backgroundColor: styles.disabledColor,
        borderRadius: 4
    },
    headerButtonInner: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center'
    },
    moreMenuButton: {
        alignItems: 'center',
        backgroundColor: styles.disabledColor,
        borderRadius: 4,
        justifyContent: 'center'
    }
});

function mapStateToProps(state) {
    return {
        user: lodashGet(state, 'user', {}),
        outbreakId: lodashGet(state, 'outbreak._id', null),
        screenSize: lodashGet(state, 'app.screenSize', config.designScreenSize),
        caseInvestigationTemplate: lodashGet(state, 'outbreak.caseInvestigationTemplate', null),
        contactFollowUpTemplate: lodashGet(state, 'outbreak.contactFollowUpTemplate', null),
        translation: lodashGet(state, 'app.translation', null),
        teams: lodashGet(state, 'teams', null),
        role: lodashGet(state, 'role', []),
        locations: lodashGet(state, 'locations.locations', [])
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({

    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(enhanceTabsWithDataHandling()(ViewEditScreen));
