/**
 * Created by florinpopa on 21/08/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import geolocation from '@react-native-community/geolocation';
import {Alert, Animated, BackHandler, Dimensions, Keyboard, Platform, StyleSheet, View, Text} from 'react-native';
import {Icon} from 'react-native-material-ui';
import NavBarCustom from './../components/NavBarCustom';
import ViewHOC from './../components/ViewHOC';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {PagerScroll, TabBar, TabView} from 'react-native-tab-view';
import ContactsSingleAddress from './../containers/ContactsSingleAddress';
import ContactsSingleRelationship from './../containers/ContactsSingleRelationship';
import ContactsSinglePersonal from './../containers/ContactsSinglePersonal';
import RelationshipScreen from './../screens/RelationshipScreen';
import Breadcrumb from './../components/Breadcrumb';
import Ripple from 'react-native-material-ripple';
import {addFollowUp, updateFollowUpAndContact} from './../actions/followUps';
import {addContact, checkForNameDuplicated, getExposuresForContact, updateContact} from './../actions/contacts';
import {removeErrors} from './../actions/errors';
import _, {findIndex, remove} from 'lodash';
import {
    calculateDimension,
    computeFullName,
    createDate, createStackFromComponent,
    extractIdFromPouchId,
    getTranslation,
    navigation,
    updateRequiredFields
} from './../utils/functions';
import moment from 'moment/min/moment.min';
import translations from './../utils/translations';
import ElevatedView from 'react-native-elevated-view';
import constants, {PERMISSIONS_CONTACT_OF_CONTACT} from "../utils/constants";
import {checkArrayAndLength} from "../utils/typeCheckingFunctions";
import lodashIntersect from 'lodash/intersection';
import {addContactOfContact, updateContactOfContact} from './../actions/contactsOfContacts';
import contactsOfContactsScreen from "../utils/translations";
import {checkValidEmails, prepareFields, prepareFieldsAndRoutes} from './../utils/formValidators';
import {validateRequiredFields} from "../utils/formValidators";
import {Navigation} from "react-native-navigation";
import {setDisableOutbreakChange} from "../actions/outbreak";
import Menu, {MenuItem} from "react-native-material-menu";
import PermissionComponent from "../components/PermissionComponent";
import styles from './../styles';
import colors from "../styles/colors";

const initialLayout = {
    height: 0,
    width: Dimensions.get('window').width,
};

class ContactsOfContactsSingleScreen extends Component {

    constructor(props) {
        super(props);

        // Process what the tab contents will be based on
        let routes = this.props.isNew ?
            config.tabsValuesRoutes.contactsAdd :
            checkArrayAndLength(lodashIntersect(
                this.props.role,
                [
                    constants.PERMISSIONS_CONTACT.contactAll,
                    constants.PERMISSIONS_CONTACT.contactListRelationshipExposures,
                    constants.PERMISSIONS_CONTACT.contactListRelationshipContacts
                ]
            )) ?
                config.tabsValuesRoutes.contactsOfContactsSingle :
                config.tabsValuesRoutes.contactsOfContactsSingleWithoutExposures;

        routes = routes.filter((e) => e.key !== 'investigation');
        this.preparedFields = prepareFieldsAndRoutes(this.props.outbreak, 'contacts-of-contacts',  Object.assign({}, config.contactsSingleScreen, {personal: config.contactsOfContactsPersonal, vaccinesReceived: config.caseSingleScreen.vaccinesReceived, document: config.caseSingleScreen.document, relationship: {fields: config.addRelationshipScreen}}));
        if (this.preparedFields.address?.invisible){
            remove(routes, (route => route.key === 'address'))
        }
        this.preparedFieldsRelationship = prepareFieldsAndRoutes(this.props.outbreak, 'relationships', {relationship: {fields: config.addRelationshipScreen}})
        this.state = {
            interactionComplete: false,
            routes: routes,
            index: _.get(this.props, 'index', 0),
            item: this.props.item,
            contact: this.props.isNew ? {
                riskLevel: null,
                riskReason: '',
                outbreakId: this.props.outbreak && this.props.outbreak._id ? this.props.outbreak._id : '',
                firstName: '',
                middleName: '',
                lastName: '',
                gender: '',
                pregnancyStatus: '',
                occupation: '',
                dob: null,
                age: {
                    years: 0,
                    months: 0
                },
                dateOfReporting: createDate(null),
                isDateOfReportingApproximate: false,
                relationships: [
                    {
                        outbreakId: this.props.outbreak._id ? this.props.outbreak._id : '',
                        contactDate: createDate(null),
                        dateOfFirstContact: createDate(null),
                        contactDateEstimated: false,
                        certaintyLevelId: '',
                        exposureTypeId: '',
                        exposureFrequencyId: '',
                        exposureDurationId: '',
                        socialRelationshipTypeId: '',
                        socialRelationshipDetail: '',
                        clusterId: '',
                        comment: '',
                        persons: []
                    }
                ],
                addresses: this.preparedFields.address?.invisible ? [] : [
                    {
                        typeId: config.userResidenceAddress.userPlaceOfResidence,
                        country: '',
                        city: '',
                        addressLine1: '',
                        addressLine2: '',
                        postalCode: '',
                        locationId: '',
                        phoneNumber: '',
                        date: createDate(null)
                    }
                ]
            } : Object.assign({}, this.props.contact),
            contactBeforeEdit: {},
            savePressed: false,
            deletePressed: false,
            loading: !this.props.isNew,
            isModified: false,
            isDateTimePickerVisible: false,
            canChangeScreen: false,
            anotherPlaceOfResidenceWasChosen: false,
            hasPlaceOfResidence: !this.preparedFields.address?.invisible,
            updateExposure: false,
            isEditMode: true,
            selectedItemIndexForTextSwitchSelectorForAge: 0, // age/dob - switch tab
            selectedItemIndexForAgeUnitOfMeasureDropDown: this.props.isNew ? 0 : (this.props.contact && this.props.contact.age && this.props.contact.age.years !== undefined && this.props.contact.age.years !== null && this.props.contact.age.years > 0) ? 0 : 1, //default age dropdown value
            showAddFollowUpScreen: false,
            maskError: false
        };
        // Bind here methods, or at least don't declare methods in the render method
        // this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    };

    // Please add here the react lifecycle methods that you need
    componentDidMount() {
        const listener = {
            componentDidAppear: () => {
                this.props.setDisableOutbreakChange(true);
            }
        };
        // Register the listener to all events related to our component
        this.navigationListener = Navigation.events().registerComponentListener(listener, this.props.componentId);
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        if (!this.props.isNew) {
            let ageClone = {years: 0, months: 0};
            let updateAge = false;
            if (!this.props.contact || this.props.contact.age === null || this.props.contact.age === undefined || (this.props.contact.age.years === undefined && this.props.contact.age.months === undefined)) {
                updateAge = true
            }
            if (updateAge) {
                this.setState(prevState => ({
                    contact: Object.assign({}, prevState.contact, {age: ageClone}, {dob: this.props.contact.dob !== undefined ? this.props.contact.dob : null}),
                }), () => {
                    console.log('old contact with age as string update')
                })
            }

            //permissions check
            let isEditMode = _.get(this.props, 'isEditMode', false);
            this.setState({
                isEditMode
            });

            if (this.props.user !== null) {

                getExposuresForContact(this.state.contact._id, this.props.outbreak._id)
                    .then((relationshipsAndExposures) => {
                        this.setState(prevState => ({
                            loading: !prevState.loading,
                            contact: Object.assign({}, prevState.contact, {
                                relationships: {exposureRelations: relationshipsAndExposures}
                            })
                        }))
                    })
                    .catch((errorGetFollowUpsAndRelationships) => {
                        console.log('ErrorGetStuff: ', errorGetFollowUpsAndRelationships);
                    })
            }
        } else if (this.props.isNew === true) {
            let personsArray = [];
            if (this.props.addContactFromCasesScreen !== null && this.props.addContactFromCasesScreen !== undefined && this.props.caseIdFromCasesScreen !== null && this.props.caseIdFromCasesScreen !== undefined) {
                personsArray = [{
                    id: extractIdFromPouchId(this.props.caseIdFromCasesScreen, 'person'),
                    type: config.personTypes.contacts,
                    source: true,
                    target: null
                }, {
                    id: null,
                    type: config.personTypes.contactsOfContacts,
                    source: null,
                    target: true
                }];

                let relationshipsClone = _.cloneDeep(this.state.contact.relationships);
                relationshipsClone[0].persons = personsArray;
                this.setState(prevState => ({
                    contact: Object.assign({}, prevState.contact, {relationships: relationshipsClone})
                }), () => {
                    console.log('After changing state componentDidMount: ', this.state.contact);
                })
            }
        }
    };

    componentWillUnmount() {
        this.navigationListener.remove();
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    };

    handleBackButtonClick() {
        // this.props.navigator.goBack(null);
        if (this.state.isModified === true) {
            Alert.alert("", 'You have unsaved data. Are you sure you want to leave this page and lose all changes?', [
                {
                    text: 'Yes', onPress: () => {
                        Navigation.pop(this.props.componentId)
                    }
                },
                {
                    text: 'Cancel', onPress: () => {
                        console.log("onPressCancelEdit No pressed - nothing changes")
                    }
                }
            ])
        } else {
            Navigation.pop(this.props.componentId);
        }
        return true;
    };

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <ViewHOC style={style.container}
                     showLoader={this.state.loading}
                     loaderText={this.props && this.props.syncState ? 'Loading' : getTranslation(translations.loadingScreenMessages.loadingMsg, this.props.translation)}>
                <NavBarCustom
                    title={null}
                    customTitle={
                        <View style={style.headerContainer}>
                            <View
                                style={[style.breadcrumbContainer]}>
                                <Breadcrumb
                                    entities={[getTranslation(this.props && this.props.previousScreen ? this.props.previousScreen : contactsOfContactsScreen.contactsTitle, this.props.translation), this.props.isNew ? getTranslation(translations.contactSingleScreen.addContactTitle, this.props.translation) : ((this.props.contact && this.props.contact.firstName ? (this.props.contact.firstName + " ") : '') + (this.props.contact && this.props.contact.lastName ? this.props.contact.lastName : ''))]}
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
                            {
                                (checkArrayAndLength(_.intersection(
                                    _.get(this.props, 'role', []),
                                    [
                                        constants.PERMISSIONS_CONTACT.contactDeleteContactOfContact,
                                        constants.PERMISSIONS_CONTACT.contactAll
                                    ]
                                )) && this.props.contact && !this.props.isNew) ? (
                                    <View>
                                        <Menu
                                            ref="menuRef"
                                            button={
                                                <Ripple
                                                    style={[
                                                        style.moreMenuButton,
                                                        {
                                                            width: calculateDimension(30, false, this.props.screenSize),
                                                            height: calculateDimension(30, true, this.props.screenSize)
                                                        }
                                                    ]}
                                                    onPress={this.showMenu}
                                                    hitSlop={{left: 10, right: 10, top: 10, bottom: 10}}>
                                                    <Icon name="more-vert" color={styles.textColor} size={24} />
                                                </Ripple>
                                            }
                                            style={{top: 36}}
                                        >
                                            <PermissionComponent
                                                render={() => (
                                                    <MenuItem onPress={this.handleOnPressDelete}>
                                                        {getTranslation(translations.contactsOfContactsScreen.deleteCoC, this.props.translation)}
                                                    </MenuItem>
                                                )}
                                                permissionsList={[
                                                    constants.PERMISSIONS_CONTACT.contactDeleteContactOfContact,
                                                    constants.PERMISSIONS_CONTACT.contactAll
                                                ]}
                                            />
                                        </Menu>
                                    </View>
                                ) : null
                            }
                        </View>
                    }
                    componentId={this.props.componentId}
                    iconName="menu"
                    handlePressNavbarButton={this.handlePressNavbarButton}
                />
                <TabView
                    navigationState={this.state}
                    animationEnabled={Platform.OS === 'ios'}
                    onIndexChange={this.handleOnIndexChange}
                    renderScene={this.renderScene}
                    renderTabBar={this.handleRenderTabBar}
                    renderPager={this.handleRenderPager}
                    useNativeDriver
                    initialLayout={initialLayout}
                    swipeEnabled={this.props.isNew ? false : true}
                />
            </ViewHOC>
        );
    };

    handleRenderPager = (props) => {
        return (Platform.OS === 'ios') ? <PagerScroll {...props} swipeEnabled={false} animationEnabled={false}/> :
            <PagerScroll {...props} swipeEnabled={false} animationEnabled={false}/>
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

    handleOnPressDelete = () => {
        // console.log("### handleOnPressDelete");
        Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.areYouSureDelete, this.props.translation), [
            {
                text: getTranslation(translations.alertMessages.yesButtonLabel, this.props.translation),
                onPress: () => {
                    this.hideMenu();
                    this.setState({
                        deletePressed: true
                    }, () => {
                        // console.log("### existing filters: ", this.props.filter);
                        // this.props.deleteLabResult(this.props.outbreak.id, this.state.contact.id, this.state.item.id, this.props.filter, this.props.user.token);
                        this.setState(prevState => ({
                            contact: Object.assign({}, prevState.contact, {
                                deleted: true,
                                deletedAt: createDate().toISOString()
                            })
                        }), () => {
                            this.handleOnPressSave();
                        })
                    })
                }
            },
            {
                text: getTranslation(translations.alertMessages.cancelButtonLabel, this.props.translation),
                onPress: () => {
                    this.hideMenu();
                }
            }
        ])
    };

    handleOnIndexChange = _.throttle((index) => {
        // if (this.state.canChangeScreen) {
        this.setState({
            canChangeScreen: false,
            index
        });
        // }
    }, 300);
    handleMoveToScreen = (nextIndex) => {
        this.setState({
            canChangeScreen: true,
        }, () => {
            this.handleOnIndexChange(nextIndex)
        });
    }
    handleMoveToNextScreenButton = () => {
        // Before moving to the next screen do the checks for the current screen
        let missingFields = [];
        let invalidEmails = [];
        let placeOfResidenceError = null;
        switch (this.state.index) {
            case 0:
                missingFields = this.checkRequiredFieldsPersonalInfo();
                if (!this.checkAgeYearsRequirements()) {
                    missingFields.push(getTranslation(translations.alertMessages.yearsValueError, this.props.translation));
                }
                if (!this.checkAgeMonthsRequirements()) {
                    missingFields.push(getTranslation(translations.alertMessages.monthsValueError, this.props.translation));
                }
                break;
            case 1:
                missingFields = this.checkRequiredFieldsAddresses();
                invalidEmails = validateRequiredFields(_.get(this.state, 'contact.addresses', []), this.preparedFields.address?.fields, (dataToBeValidated, fields, defaultFunction) => {
                    if (fields.id === 'emailAddress') {
                        return checkValidEmails(dataToBeValidated, fields?.id);
                    }

                    return null;
                });
                placeOfResidenceError = this.checkPlaceOfResidence();
                break;
            case 2:
                missingFields = this.checkFields();
                break;
            default:
                break;
        }

        if (checkArrayAndLength(missingFields)) {
            Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), `${getTranslation(translations.alertMessages.requiredFieldsMissingError, this.props.translation)}.\n${getTranslation(translations.alertMessages.missingFields, this.props.translation)}: ${missingFields}`, [
                {
                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                    onPress: () => {
                        this.hideMenu()
                    }
                }
            ])
        } else if (checkArrayAndLength(invalidEmails)) {
            Alert.alert(
                getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation),
                `${getTranslation(translations.alertMessages.invalidEmails, this.props.translation)}: ${invalidEmails}`,
                [
                    {
                        text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                        onPress: () => {
                            this.hideMenu()
                        }
                    }
                ]
            );
        } else if (placeOfResidenceError) {
            Alert.alert(
                getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation),
                getTranslation(translations.alertMessages.placeOfResidenceError, this.props.translation),
                [
                    {
                        text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                        onPress: () => {
                            this.hideMenu()
                        }
                    }
                ]
            )
        } else {
            let nextIndex = this.state.index + 1;

            this.setState({
                canChangeScreen: true,
            });
            this.handleOnIndexChange(nextIndex)
        }
    };

    handleMoveToPrevieousScreenButton = () => {
        let nextIndex = this.state.index - 1;
        this.setState({
            canChangeScreen: true,
        }, () => {
            this.handleOnIndexChange(nextIndex)
        });

    };


    handleRenderTabBar = (props) => {
        return (
            <TabBar
                {...props}
                indicatorStyle={{
                    backgroundColor: styles.primaryColor,
                    height: 2,

                    color: 'red'
                }}
                style={{
                    height: 36,
                    backgroundColor: styles.backgroundColor,

                    color: 'red'
                }}
                tabStyle={{
                    width: 'auto',
                    paddingHorizontal: 34,
                    marginHorizontal: 0,
                    textAlign: 'center',

                    color: 'red'
                }}
                labelStyle={{
                    color: 'red'
                }}
                onTabPress={({route, preventDefault}) => {
                    preventDefault();
                    if (this.props.isNew) {
                        return;
                    }
                    const index = findIndex(this.state.routes, predicate => predicate.key === route.key);
                    if (index !== -1) {
                        this.handleMoveToScreen(index);
                    }
                }}
                pressOpacity={this.props.isNew ? 0 : undefined}
                pressColor={this.props.isNew ? 'transparent' : undefined}
                activeColor={styles.primaryColor}
                inactiveColor={styles.secondaryColor}
                renderLabel={this.handleRenderLabel(props)}
            />
        )
    };

    handleRenderLabel = (props) => ({route, focused}) => {

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

    renderScene = ({route}) => {
        switch (route.key) {
            case 'personal':
                return (
                    <ContactsSinglePersonal
                        type={translations.personTypes.contactsOfContacts}
                        preparedFields={this.preparedFields}
                        contact={this.state.contact}
                        routeKey={this.state.routes[this.state.index].key}
                        activeIndex={this.state.index}
                        onChangeText={this.handleOnChangeText}
                        onChangeDropDown={this.handleOnChangeDropDown}
                        onChangeDate={this.handleOnChangeDate}
                        onChangeSwitch={this.handleOnChangeSwitch}
                        onPressAddDocument={this.onPressAddDocument}
                        onDeletePress={this.handleOnPressDeleteDocument}
                        onPressAddVaccine={this.onPressAddVaccine}
                        onPressDeleteVaccines={this.handleOnPressDeleteVaccines}
                        onChangeTextInputWithDropDown={this.handleOnChangeTextInputWithDropDown}
                        handleMoveToNextScreenButton={this.handleMoveToNextScreenButton}
                        checkRequiredFieldsPersonalInfo={this.checkRequiredFieldsPersonalInfo}
                        isNew={this.props.isNew}
                        onChangeTextSwitchSelector={this.handleOnChangeTextSwitchSelector}
                        selectedItemIndexForTextSwitchSelectorForAge={this.state.selectedItemIndexForTextSwitchSelectorForAge}
                        selectedItemIndexForAgeUnitOfMeasureDropDown={this.state.selectedItemIndexForAgeUnitOfMeasureDropDown}
                        checkAgeMonthsRequirements={this.checkAgeMonthsRequirements}
                        checkAgeYearsRequirements={this.checkAgeYearsRequirements}
                        isEditMode={this.state.isEditMode}
                        numberOfTabs={this.state.routes.length}
                        onPressPreviousButton={this.handlePreviousPress}
                        onPressNextButton={this.handleMoveToNextScreenButton}
                        onPressSaveEdit={this.handleOnPressSave}
                        onPressEdit={this.onPressEdit}
                        onPressCancelEdit={this.onPressCancelEdit}
                    />
                );
            case 'address':
                return (
                    <ContactsSingleAddress
                        type={translations.personTypes.contactsOfContacts}
                        preparedFields={this.preparedFields}
                        contact={this.state.contact}
                        routeKey={this.state.routes[this.state.index].key}
                        activeIndex={this.state.index}
                        onChangeText={this.handleOnChangeText}
                        onChangeDropDown={this.handleOnChangeDropDown}
                        onChangeDate={this.handleOnChangeDate}
                        onChangeSwitch={this.handleOnChangeSwitch}
                        onChangeSectionedDropDown={this.handleOnChangeSectionedDropDown}
                        onDeletePress={this.handleOnDeletePress}
                        onPressCopyAddress={this.handleOnPressCopyAddress}
                        canCopyAddress={!!this.props.caseAddress}
                        onPressAddAdrress={this.handleOnPressAddAdrress}
                        handleMoveToNextScreenButton={this.handleMoveToNextScreenButton}
                        onPressPreviousButton={this.handleMoveToPrevieousScreenButton}
                        checkRequiredFieldsAddresses={this.checkRequiredFieldsAddresses}
                        isNew={this.props.isNew}
                        anotherPlaceOfResidenceWasChosen={this.state.anotherPlaceOfResidenceWasChosen}
                        hasPlaceOfResidence={this.state.hasPlaceOfResidence}
                        isEditMode={this.state.isEditMode}
                        numberOfTabs={this.state.routes.length}
                        // onPressPreviousButton={this.handlePreviousPress}
                        onPressNextButton={this.handleMoveToNextScreenButton}
                        onPressSaveEdit={this.handleOnPressSave}
                        onPressEdit={this.onPressEdit}
                        onPressCancelEdit={this.onPressCancelEdit}
                    />
                );
            case 'exposures':
                return (
                    <ContactsSingleRelationship
                        type={translations.personTypes.contactsOfContacts}
                        preparedFields={this.preparedFieldsRelationship}
                        relationshipType={constants.RELATIONSHIP_TYPE.exposure}
                        refreshRelations={this.refreshRelations}
                        contact={this.state.contact}
                        routeKey={this.state.routes[this.state.index].key}
                        activeIndex={this.state.index}
                        onPressEditExposure={this.handleOnPressEditExposure}
                        onPressDeleteExposure={this.handleOnPressDeleteExposure}
                        addContactFromCasesScreen={this.props.addContactFromCasesScreen}
                        componentId={this.props.componentId}
                        saveExposure={this.handleSaveExposure}
                        onPressPreviousButton={this.handleMoveToPrevieousScreenButton}
                        isNew={this.props.isNew}
                        handleOnPressSave={this.handleOnPressSave}
                        isEditMode={this.state.isEditMode}
                        onChangeText={this.handleOnChangeText}
                        onChangeDropDown={this.handleOnChangeDropDown}
                        onChangeDate={this.handleOnChangeDate}
                        onChangeSwitch={this.handleOnChangeSwitch}
                        handleMoveToNextScreenButton={this.handleMoveToNextScreenButton}
                        selectedExposure={this.props.singleCase}
                        numberOfTabs={this.state.routes.length}
                        // onPressPreviousButton={this.handlePreviousPress}
                        onPressNextButton={this.handleMoveToNextScreenButton}
                        onPressSaveEdit={this.handleOnPressSave}
                        onPressEdit={this.onPressEdit}
                        onPressCancelEdit={this.onPressCancelEdit}
                    />
                );
            //Default? Why not 'personal'????
            default:
                return (
                    <ContactsSinglePersonal
                        contact={this.state.contact}
                        activeIndex={this.state.index}
                        routeKey={route.key}
                        onChangeText={this.handleOnChangeText}
                        onChangeDropDown={this.handleOnChangeDropDown}
                        onChangeDate={this.handleOnChangeDate}
                        onChangeSwitch={this.handleOnChangeSwitch}
                    />
                );
        }
    };

    handlePressBreadcrumb = () => {
        if (this.state.isModified === true) {
            Alert.alert("", 'You have unsaved data. Are you sure you want to leave this page and lose all changes?', [
                {
                    text: 'Yes', onPress: () => {
                        Navigation.pop(this.props.componentId)
                    }
                },
                {
                    text: 'Cancel', onPress: () => {
                        console.log("onPressCancelEdit No pressed - nothing changes")
                    }
                }
            ])
        } else {
            Navigation.pop(this.props.componentId)
        }
    };

    handleSaveExposure = (exposure, isUpdate = false) => {
        this.setState({
            loading: true,
            updateExposure: true
        })
    };

    // documents functions
    onPressAddDocument = () => {
        let documents = _.cloneDeep(this.state.contact.documents);

        if (!checkArrayAndLength(documents)) {
            documents = [];
        }

        documents.push({
            type: '',
            number: ''
        });

        this.setState(prevState => ({
            contact: Object.assign({}, prevState.contact, {documents}),
            isModified: true
        }), () => {
            // console.log("### after updating the data: ", this.state.contact);
        })
    };
    handleOnPressDeleteDocument = (index) => {
        // console.log("DeletePressed: ", index);
        Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.deleteDocument, this.state.translation), [
            {
                text: getTranslation(translations.generalLabels.noAnswer, this.props.translation), onPress: () => {
                    console.log('Cancel pressed')
                }
            },
            {
                text: getTranslation(translations.generalLabels.yesAnswer, this.props.translation), onPress: () => {
                    let contactDocumentsClone = _.cloneDeep(this.state.contact.documents);
                    contactDocumentsClone.splice(index, 1);
                    this.setState(prevState => ({
                        contact: Object.assign({}, prevState.contact, {documents: contactDocumentsClone}),
                        isModified: true
                    }), () => {
                        // console.log("After deleting the document: ", this.state.contact);
                    })
                }
            }
        ]);
    };

    // vaccinesReceived functions
    onPressAddVaccine = () => {
        let vaccinesReceived = _.cloneDeep(this.state.contact.vaccinesReceived);
        if (!vaccinesReceived) {
            vaccinesReceived = [];
        }

        vaccinesReceived.push({
            id: null,
            vaccine: null,
            date: null,
            status: null
        });

        this.setState(prevState => ({
            contact: Object.assign({}, prevState.contact, {vaccinesReceived: vaccinesReceived}),
            isModified: true
        }), () => {
            // console.log("### after updating the data: ", this.state.contact);
        })
    };
    handleOnPressDeleteVaccines = (index) => {
        Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.deleteVaccine, this.state.translation), [
            {
                text: getTranslation(translations.generalLabels.noAnswer, this.props.translation), onPress: () => {
                    console.log('Cancel pressed')
                }
            },
            {
                text: getTranslation(translations.generalLabels.yesAnswer, this.props.translation), onPress: () => {
                    let vaccinesReceived = _.cloneDeep(this.state.contact.vaccinesReceived);
                    vaccinesReceived.splice(index, 1);
                    this.setState(prevState => ({
                        contact: Object.assign({}, prevState.contact, {vaccinesReceived: vaccinesReceived}),
                        isModified: true
                    }), () => {
                        // console.log("After deleting the Vaccines: ", this.state.contact);
                    })
                }
            }
        ]);
    };

    // Contact changes handlers
    handleOnChangeTextInputWithDropDown = (value, id, objectType, stateValue) => {
        // console.log("handleOnChangeTextInputWithDropDown: ", value, id, objectType, stateValue, this.state.contact);

        if (stateValue !== undefined && stateValue !== null) {
            if (id === 'age') {
                let ageClone = {years: 0, months: 0};

                // Do replacing for value
                // Replace first and last chars if it is ,
                value = value.replace(/^,|,$/g, '');
                // Replace the first , with .
                value = value.replace(/,/, '.');
                // Replace all the remaining , with empty string
                value = value.replace(/,/g, '');

                if (!isNaN(Number(value)) && !value.includes("-") && !value.includes(" ")) {
                    ageClone.years = Number(value);
                    ageClone.months = Number(value);
                }
                this.setState(prevState => ({
                        contact: Object.assign({}, prevState.contact, {age: ageClone, dob: null}),
                        isModified: true
                    })
                    , () => {
                        console.log("handleOnChangeTextInputWithDropDown done", id, " ", value, " ", this.state.contact);
                    }
                )
            }
        }
    };
    handleOnChangeText = (value, id, objectTypeOrIndex, objectType, maskError) => {
        console.log("onChangeText: ", value, id, objectTypeOrIndex);
        if (objectTypeOrIndex === 'Contact') {
            this.setState(
                (prevState) => ({
                    contact: Object.assign({}, prevState.contact, {[id]: value}),
                    maskError,
                    isModified: true
                }))
        } else if (objectTypeOrIndex === 'Exposure' && this.props.isNew === true) {
            let relationshipsClone = _.cloneDeep(this.state.contact.relationships);
            relationshipsClone[0][id] = value && value.value ? value.value : value;
            this.setState(prevState => ({
                contact: Object.assign({}, prevState.contact, {relationships: relationshipsClone}),
                maskError,
                isModified: true
            }))
        } else if (typeof objectTypeOrIndex === 'phoneNumber' && objectTypeOrIndex >= 0 || typeof objectTypeOrIndex === 'number' && objectTypeOrIndex >= 0) {
            if (objectType && objectType === 'Address') {
                let addressesClone = _.cloneDeep(this.state.contact.addresses);
                if (id === 'lng') {
                    if (value === '' || value.value === '') {
                        delete addressesClone[objectTypeOrIndex].geoLocation;
                    } else {
                        if (!addressesClone[objectTypeOrIndex].geoLocation) {
                            addressesClone[objectTypeOrIndex].geoLocation = {};
                            addressesClone[objectTypeOrIndex].geoLocation.type = 'Point';
                            if (!addressesClone[objectTypeOrIndex].geoLocation.coordinates) {
                                addressesClone[objectTypeOrIndex].geoLocation.coordinates = [];
                            }
                        }
                        if (!addressesClone[objectTypeOrIndex].geoLocation.coordinates) {
                            addressesClone[objectTypeOrIndex].geoLocation.coordinates = [];
                        }
                        if (!addressesClone[objectTypeOrIndex].geoLocation.type) {
                            addressesClone[objectTypeOrIndex].geoLocation.type = 'Point';
                        }
                        addressesClone[objectTypeOrIndex].geoLocation.coordinates[0] = value && value.value ? value.value : parseFloat(value);
                    }
                } else if (id === 'lat') {
                    if (value === '' || value.value === '') {
                        delete addressesClone[objectTypeOrIndex].geoLocation;
                    } else {
                        if (!addressesClone[objectTypeOrIndex].geoLocation) {
                            addressesClone[objectTypeOrIndex].geoLocation = {};
                            addressesClone[objectTypeOrIndex].geoLocation.type = 'Point';
                            if (!addressesClone[objectTypeOrIndex].geoLocation.coordinates) {
                                addressesClone[objectTypeOrIndex].geoLocation.coordinates = [];
                            }
                        }
                        if (!addressesClone[objectTypeOrIndex].geoLocation.coordinates) {
                            addressesClone[objectTypeOrIndex].geoLocation.coordinates = [];
                        }
                        if (!addressesClone[objectTypeOrIndex].geoLocation.type) {
                            addressesClone[objectTypeOrIndex].geoLocation.type = 'Point';
                        }
                        addressesClone[objectTypeOrIndex].geoLocation.coordinates[1] = value && value.value ? value.value : parseFloat(value);
                    }
                } else {
                    addressesClone[objectTypeOrIndex][id] = value && value.value ? value.value : value;
                }
                this.setState(prevState => ({
                    contact: Object.assign({}, prevState.contact, {addresses: addressesClone}),
                    maskError,
                    isModified: true
                }))
            } else if (objectType && objectType === 'Documents') {
                let documentsClone = _.cloneDeep(this.state.contact.documents);
                documentsClone[objectTypeOrIndex][id] = value && value.value ? value.value : value;
                console.log('documentsClone', documentsClone);
                this.setState(prevState => ({
                    contact: Object.assign({}, prevState.contact, {documents: documentsClone}),
                    maskError,
                    isModified: true
                }))
            }
        }
    };
    handleOnChangeTextSwitchSelector = (index, stateValue) => {
        if (stateValue === 'selectedItemIndexForAgeUnitOfMeasureDropDown') {
            let ageClone = Object.assign({}, this.state.contact.age);
            if (!this.props.isNew) {
                if (ageClone.years === 0 && ageClone.months !== 0) {
                    ageClone.years = ageClone.months
                } else if (ageClone.months === 0 && ageClone.years !== 0) {
                    ageClone.months = ageClone.years
                }
            }
            this.setState(prevState => ({
                [stateValue]: index,
                contact: Object.assign({}, prevState.contact, {dob: null}, {age: ageClone}),
                isModified: true
            }), () => {
                console.log('handleOnChangeTextSwitchSelector', stateValue, this.state[stateValue])
            })
        } else {
            this.setState({
                [stateValue]: index,
                isModified: true
            }, () => {
                console.log('handleOnChangeTextSwitchSelector', stateValue, this.state[stateValue])
            })
        }
    };
    handleOnChangeDate = (value, id, objectTypeOrIndex, objectType) => {
        console.log("onChangeDate: ", value, id, objectType);
        if (id === 'dob') {
            if (!value) {
                this.setState(prevState => ({
                    case: Object.assign({}, prevState.case, {age: null}, {dob: value}),
                    selectedItemIndexForAgeUnitOfMeasureDropDown: 0,
                    isModified: true
                }), () => {
                    // console.log("handleOnChangeDate dob", id, " ", value, " ", this.state.case);
                })
                return;
            }
            let today = createDate(null);
            let nrOFYears = this.calcDateDiff(value, today);
            if (nrOFYears !== undefined && nrOFYears !== null) {
                let ageClone = {years: 0, months: 0};
                let selectedItemIndexForAgeUnitOfMeasureDropDown = 0

                if (nrOFYears.years === 0 && nrOFYears.months >= 0) {
                    ageClone.months = nrOFYears.months;
                    ageClone.years = nrOFYears.months;
                    selectedItemIndexForAgeUnitOfMeasureDropDown = 1
                } else {
                    if (nrOFYears.years > 0) {
                        ageClone.months = nrOFYears.years;
                        ageClone.years = nrOFYears.years;
                        selectedItemIndexForAgeUnitOfMeasureDropDown = 0
                    }
                }
                console.log('ageClone', ageClone);
                this.setState(prevState => ({
                    contact: Object.assign({}, prevState.contact, {age: ageClone}, {dob: value}),
                    selectedItemIndexForAgeUnitOfMeasureDropDown,
                    isModified: true
                }), () => {
                    console.log("handleOnChangeDate dob", id, " ", value, " ", this.state.contact);
                })
            }
        } else {
            if (objectTypeOrIndex === 'Contact') {
                this.setState(
                    (prevState) => ({
                        contact: Object.assign({}, prevState.contact, {[id]: value}),
                        isModified: true
                    })
                    , () => {
                        console.log("onChangeDate", id, " ", value, " ", this.state.contact);
                    }
                )
            } else if (objectTypeOrIndex === 'Exposure' && this.props.isNew === true) {
                let relationshipsClone = _.cloneDeep(this.state.contact.relationships);
                relationshipsClone[0][id] = value && value.value ? value.value : value;
                this.setState(prevState => ({
                    contact: Object.assign({}, prevState.contact, {relationships: relationshipsClone}),
                    isModified: true
                }))
            } else if (typeof objectTypeOrIndex === 'phoneNumber' && objectTypeOrIndex >= 0 || typeof objectTypeOrIndex === 'number' && objectTypeOrIndex >= 0) {
                if (objectType && objectType === 'Address') {
                    let addressesClone = _.cloneDeep(this.state.contact.addresses);
                    addressesClone[objectTypeOrIndex][id] = value && value.value ? value.value : value;
                    console.log('addressesClone', addressesClone);
                    this.setState(prevState => ({
                        contact: Object.assign({}, prevState.contact, {addresses: addressesClone}),
                        isModified: true
                    }), () => {
                        console.log("handleOnChangeDate", id, " ", value, " ", this.state.contact);
                    })
                } else if (objectType === 'Vaccines') {
                    let vaccinesClone = _.cloneDeep(this.state.contact.vaccinesReceived);
                    vaccinesClone[objectTypeOrIndex][id] = value && value.value !== undefined ? value.value : value;
                    console.log('vaccinesClone', vaccinesClone);
                    this.setState(prevState => ({
                        contact: Object.assign({}, prevState.contact, {vaccinesReceived: vaccinesClone}),
                        isModified: true
                    }))
                } else if (objectType === 'Documents') {
                    let documentsClone = _.cloneDeep(this.state.contact.documents);
                    documentsClone[objectTypeOrIndex][id] = value && value.value !== undefined ? value.value : value;
                    console.log('vaccinesClone', documentsClone);
                    this.setState(prevState => ({
                        contact: Object.assign({}, prevState.contact, {documents: documentsClone}),
                        isModified: true
                    }))
                }
            }
        }
    };
    calcDateDiff = (startdate, enddate) => {
        //define moments for the startdate and enddate
        var startdateMoment = moment(startdate);
        var enddateMoment = moment(enddate);

        if (startdateMoment.isValid() === true && enddateMoment.isValid() === true) {
            //getting the difference in years
            var years = enddateMoment.diff(startdateMoment, 'years');

            //moment returns the total months between the two dates, subtracting the years
            var months = enddateMoment.diff(startdateMoment, 'months') - (years * 12);

            //to calculate the days, first get the previous month and then subtract it
            startdateMoment.add(years, 'years').add(months, 'months');
            var days = enddateMoment.diff(startdateMoment, 'days')


            console.log('calcDateDiff', {months: months, years: years})
            return nrOFYears = {
                months: months,
                years: years,
            };
        } else {
            return undefined;
        }
    };
    handleOnChangeSwitch = (value, id, objectTypeOrIndex, objectType) => {
        // console.log("onChangeSwitch: ", value, id, this.state.item);
        if (id === 'geoLocationAccurate' && typeof objectTypeOrIndex === 'number' && objectTypeOrIndex >= 0 && objectType === 'Address') {
            Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.replaceCurrentCoordinates, this.props.translation), [
                {
                    text: getTranslation(translations.generalLabels.noAnswer, this.props.translation), onPress: () => {
                        let addressesClone = _.cloneDeep(this.state.contact.addresses);
                        addressesClone[objectTypeOrIndex].geoLocationAccurate = value;
                        this.setState(
                            (prevState) => ({
                                contact: Object.assign({}, prevState.contact, {addresses: addressesClone}),
                                isModified: true
                            })
                            // , () => {
                            //     console.log("onChangeSwitch", id, " ", value, " ", this.state.contact);
                            // }
                        )
                    }
                },
                {
                    text: getTranslation(translations.generalLabels.yesAnswer, this.props.translation), onPress: () => {
                        if (value) {
                            geolocation.getCurrentPosition((position) => {
                                    let addressesClone = _.cloneDeep(this.state.contact.addresses);
                                    console.log('addressesClone: ', addressesClone);
                                    if (!addressesClone[objectTypeOrIndex].geoLocation) {
                                        addressesClone[objectTypeOrIndex].geoLocation = {};
                                        addressesClone[objectTypeOrIndex].geoLocation.type = 'Point';
                                        addressesClone[objectTypeOrIndex].geoLocation.coordinates = [];
                                    }
                                    if (!addressesClone[objectTypeOrIndex].geoLocation.type) {
                                        addressesClone[objectTypeOrIndex].geoLocation.type = 'Point';
                                    }
                                    if (!addressesClone[objectTypeOrIndex].geoLocation.coordinates) {
                                        addressesClone[objectTypeOrIndex].geoLocation.coordinates = [];
                                    }
                                    addressesClone[objectTypeOrIndex].geoLocation.coordinates = [value ? position.coords.longitude : null, value ? position.coords.latitude : null];
                                    addressesClone[objectTypeOrIndex].geoLocationAccurate = value;
                                    this.setState(
                                        (prevState) => ({
                                            contact: Object.assign({}, prevState.contact, {addresses: addressesClone}),
                                            isModified: true
                                        })
                                        // , () => {
                                        //     console.log("onChangeSwitch", id, " ", value, " ", this.state.contact);
                                        // }
                                    )
                                },
                                (error) => {
                                    Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(error.message, this.props.translation), [
                                        {
                                            text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                                            onPress: () => {
                                                console.log("OK pressed")
                                            }
                                        }
                                    ])
                                },
                                {
                                    timeout: 5000
                                }
                            )
                        } else {
                            let addressesClone = _.cloneDeep(this.state.contact.addresses);
                            console.log('addressesClone: ', addressesClone);
                            if (!addressesClone[objectTypeOrIndex].geoLocation) {
                                addressesClone[objectTypeOrIndex].geoLocation = {};
                                addressesClone[objectTypeOrIndex].geoLocation.type = 'Point';
                                addressesClone[objectTypeOrIndex].geoLocation.coordinates = [];
                            }
                            if (!addressesClone[objectTypeOrIndex].geoLocation.type) {
                                addressesClone[objectTypeOrIndex].geoLocation.type = 'Point';
                            }
                            if (!addressesClone[objectTypeOrIndex].geoLocation.coordinates) {
                                addressesClone[objectTypeOrIndex].geoLocation.coordinates = [];
                            }
                            addressesClone[objectTypeOrIndex].geoLocation.coordinates = [null, null];
                            addressesClone[objectTypeOrIndex].geoLocationAccurate = value;
                            this.setState(
                                (prevState) => ({
                                    contact: Object.assign({}, prevState.contact, {addresses: addressesClone}),
                                    isModified: true
                                }), () => {
                                    console.log("onChangeSwitch", id, " ", value, " ", this.state.contact);
                                }
                            )
                        }
                    }
                }
            ])
        } else {
            if (objectType === 'FollowUp') {
                this.setState(
                    (prevState) => ({
                        item: Object.assign({}, prevState.item, {[id]: value}),
                        isModified: true
                    }), () => {
                        console.log("onChangeSwitch", id, " ", value, " ", this.state.item);
                    }
                )
            } else {
                if (objectType === 'Contact') {
                    this.setState(
                        (prevState) => ({
                            contact: Object.assign({}, prevState.contact, {[id]: value}),
                            isModified: true
                        }), () => {
                            console.log("onChangeSwitch", id, " ", value, " ", this.state.contact);
                        }
                    )
                } else if (objectType === 'Exposure' && this.props.isNew === true) {
                    let relationshipsClone = _.cloneDeep(this.state.contact.relationships);
                    relationshipsClone[0][id] = value && value.value ? value.value : value;
                    this.setState(prevState => ({
                        contact: Object.assign({}, prevState.contact, {relationships: relationshipsClone}),
                        isModified: true
                    }))
                }
            }
        }

    };
    handleOnChangeDropDown = (value, id, objectType, type) => {
        console.log("onChangeDropDown: ", value, id, objectType, this.state.contact);
        if (objectType === 'FollowUp' || id === 'address') {
            if (id === 'address') {
                if (!this.state.item[id]) {
                    this.state.item[id] = {};
                }

                let address = this.state.contact && this.state.contact.addresses && Array.isArray(this.state.contact.addresses) && this.state.contact.addresses.length > 0 ?
                    this.state.contact.addresses.filter((e) => {
                        return value.includes(e.addressLine1 || '') && value.includes(e.addressLine2 || '') && value.includes(e.city || '') && value.includes(e.country || '') && value.includes(e.postalCode || '');
                    }) : [];

                this.setState(
                    (prevState) => ({
                        item: Object.assign({}, prevState.item, {[id]: address[0]}),
                        isModified: true
                    }), () => {
                        console.log("onChangeDropDown", id, " ", value, " ", this.state.item);
                    }
                )
            } else {
                this.setState(
                    (prevState) => ({
                        item: Object.assign({}, prevState.item, {[id]: value}),
                        isModified: true
                    }), () => {
                        console.log("onChangeDropDown", id, " ", value, " ", this.state.item);
                    }
                )
            }
        } else if (objectType === 'Contact') {
            let newContact = this.state.contact;

            if (id === 'followUp.status') {
                let newFollowUp = Object.assign({}, this.state.contact.followUp, {status: value && value.value !== undefined ? value.value : value});
                newContact = Object.assign({}, this.state.contact, {followUp: newFollowUp});
            } else {
                newContact = Object.assign({}, this.state.contact, {[id]: value && value.value !== undefined ? value.value : value});
            }
            this.setState(
                (prevState) => ({
                    contact: newContact,
                    isModified: true
                }), () => {
                    console.log("onChangeDropDown", id, " ", value, " ", this.state.contact);
                }
            );
        } else if (type && type === 'Exposure' && this.props.isNew === true) {
            let relationshipsClone = _.cloneDeep(this.state.contact.relationships);
            relationshipsClone[0][id] = value && value.value !== undefined ? value.value : value;
            this.setState(prevState => ({
                contact: Object.assign({}, prevState.contact, {relationships: relationshipsClone}),
                isModified: true
            }), () => {
                console.log('After changing state handleOnChangeDropDown: ', this.state.contact);
            })
        } else if (typeof objectType === 'number' && objectType >= 0) {
            if (type && type === 'Address') {
                let addressesClone = _.cloneDeep(this.state.contact.addresses);

                let anotherPlaceOfResidenceWasChosen = false;

                addressesClone[objectType][id] = value && value.value !== undefined ? value.value : value;
                let hasPlaceOfResidence = false;
                let contactPlaceOfResidence = addressesClone.filter((e) => {
                    return e.typeId === config.userResidenceAddress.userPlaceOfResidence
                });
                if (contactPlaceOfResidence && contactPlaceOfResidence.length > 0) {
                    hasPlaceOfResidence = true
                }
                this.setState(prevState => ({
                    contact: Object.assign({}, prevState.contact, {addresses: addressesClone}),
                    isModified: true,
                    anotherPlaceOfResidenceWasChosen,
                    hasPlaceOfResidence
                }), () => {
                    console.log("onChangeDropDown", id, " ", value, " ", this.state.contact);
                })
            } else if (type === 'Vaccines') {
                let vaccinesClone = _.cloneDeep(this.state.contact.vaccinesReceived);
                vaccinesClone[objectType][id] = value && value.value !== undefined ? value.value : value;
                console.log('vaccinesClone', vaccinesClone);
                this.setState(prevState => ({
                    contact: Object.assign({}, prevState.contact, {vaccinesReceived: vaccinesClone}),
                    isModified: true
                }), () => {
                    // console.log("onChangeDropDown", id, " ", value, " ", this.state.case);
                })
            } else if (type === 'Documents') {
                let documentsClone = _.cloneDeep(this.state.contact.documents);
                documentsClone[objectType][id] = value && value.value !== undefined ? value.value : value;
                console.log('vaccinesClone', documentsClone);
                this.setState(prevState => ({
                    contact: Object.assign({}, prevState.contact, {documents: documentsClone}),
                    isModified: true
                }), () => {
                    // console.log("onChangeDropDown", id, " ", value, " ", this.state.case);
                })
            }
        }
    };
    handleOnChangeSectionedDropDown = (selectedItems, index) => {
        console.log('handleOnChangeSectionedDropDown', selectedItems, index);
        // Here selectedItems is always an array with just one value and should pe mapped to the locationId field from the address from index
        if (selectedItems && Array.isArray(selectedItems) && selectedItems.length > 0) {
            let addresses = _.cloneDeep(this.state.contact.addresses);
            addresses[index].locationId = extractIdFromPouchId(selectedItems['0']._id, 'location');
            const visibleGeoLocationField = this.preparedFields.address?.fields?.find(x => x.fieldId === 'geoLocation' && !x.invisible);
            if (visibleGeoLocationField && selectedItems['0'].geoLocation && selectedItems['0'].geoLocation.coordinates && Array.isArray(selectedItems['0'].geoLocation.coordinates)) {
                if (selectedItems['0'].geoLocation.coordinates[0] !== '' || selectedItems['0'].geoLocation.coordinates[1] !== '') {
                    setTimeout(() => {
                        Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.replaceCurrentCoordinates, this.props.translation), [
                            {
                                text: getTranslation(translations.alertMessages.cancelButtonLabel, this.props.translation),
                                onPress: () => {
                                    console.log('Cancel pressed');
                                    this.setState(prevState => ({
                                        contact: Object.assign({}, prevState.contact, {addresses}),
                                        isModified: true
                                    }))
                                }
                            },
                            {
                                text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                                onPress: () => {
                                    addresses[index].geoLocation = selectedItems['0'].geoLocation;
                                    this.setState(prevState => ({
                                        contact: Object.assign({}, prevState.contact, {addresses}),
                                        isModified: true
                                    }))
                                }
                            }
                        ])
                    }, 200);
                }
            } else {
                console.log('Addresses biatch: ', addresses);
                this.setState(prevState => ({
                    contact: Object.assign({}, prevState.contact, {addresses}),
                    isModified: true
                }))
            }
        }
    };

    // Exposures handlers
    handleOnPressEditExposure = (relation, index) => {
        // console.log('handleOnPressEditExposure: ', relation, index);
        _.set(relation, 'caseData.fullName', computeFullName(_.get(relation, 'caseData', null)));
        Navigation.showModal(createStackFromComponent({
            name: 'RelationshipScreen',
            passProps: {
                exposure: _.get(relation, 'relationshipData', null),
                selectedExposure: _.get(relation, 'caseData', null),
                contact: this.props.isNew ? null : this.props.contact,
                type: 'ContactOfContact',
                saveExposure: this.handleSaveExposure,
                caseIdFromCasesScreen: this.props.caseIdFromCasesScreen,
                isEditMode: false,
                addContactFromCasesScreen: false,
                refreshRelations: this.refreshRelations
            }
        }))
    };
    refreshRelations = (exposure) => {
        this.setState({
            loading: true
        }, () => {
            getExposuresForContact(this.state.contact._id, this.props.outbreak._id)
                .then((updatedRelations) => {
                    this.setState(prevState => ({
                        loading: false,
                        contact: Object.assign({}, prevState.contact, {relationships: {exposureRelations: updatedRelations}})
                    }))
                })
                .catch((errorUpdateExposure) => {
                    console.log('ErrorUpdateExposure', errorUpdateExposure);
                    this.setState({
                        loading: false
                    });
                })
        })
    };

    handleOnPressSave = () => {
        Keyboard.dismiss();
        this.setState({
            loading: true
        }, () => {
            if (this.state.contact.deleted) {
                return this.saveContactAction();
            }
            if (this.state.maskError) {
                this.setState({loading: false}, () => {
                    Alert.alert(getTranslation(translations.alertMessages.invalidMaskAlert, this.props.translation).replace('{{mask}}', `${this.props.outbreak?.contactIdMask}`),
                        getTranslation(translations.alertMessages.yearsValueError, this.props.translation), [
                            {
                                text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                                onPress: () => {
                                    console.log("OK pressed")
                                }
                            }
                        ])
                })
                return;
            }
            let relationshipsMissingFields = this.checkFields();
            let invalidEmails = validateRequiredFields(_.get(this.state, 'contact.addresses', []), this.preparedFields?.address?.fields, (dataToBeValidated, fields, defaultFunction) => {
                if (fields.id === 'emailAddress') {
                    return checkValidEmails(dataToBeValidated, fields?.id);
                }

                return null;
            });
            if (relationshipsMissingFields && Array.isArray(relationshipsMissingFields) && relationshipsMissingFields.length === 0) {
                let missingFields = this.checkRequiredFields();
                if (missingFields && Array.isArray(missingFields) && missingFields.length === 0) {
                    if (this.checkAgeYearsRequirements()) {
                        if (this.checkAgeMonthsRequirements()) {
                            if (this.state.contact.addresses === undefined || this.state.contact.addresses === null || this.state.contact.addresses.length === 0 ||
                                (this.state.contact.addresses.length > 0 && this.state.hasPlaceOfResidence === true)) {
                                const {contact} = this.state;
                                if (checkArrayAndLength(invalidEmails)) {
                                    Alert.alert(
                                        getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation),
                                        `${getTranslation(translations.alertMessages.invalidEmails, this.props.translation)}: ${invalidEmails}`,
                                        [
                                            {
                                                text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                                                onPress: () => {
                                                    this.setState({
                                                        loading: false
                                                    }, () => {
                                                        this.hideMenu()
                                                    })
                                                }
                                            }
                                        ]
                                    );
                                } else {
                                    checkForNameDuplicated(this.props.isNew ? null : contact._id, contact.firstName, contact.lastName, this.props.outbreak._id)
                                        .then((isDuplicate) => {
                                            if (isDuplicate) {
                                                Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), getTranslation(translations.alertMessages.contactDuplicateNameError, this.props.translation), [
                                                    {
                                                        text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                                                        onPress: () => {
                                                            this.setState({
                                                                loading: false
                                                            }, () => {
                                                                this.hideMenu()
                                                            })
                                                        }
                                                    },
                                                    {
                                                        text: getTranslation(translations.alertMessages.saveAnywayLabel, this.props.translation),
                                                        onPress: () => {
                                                            this.saveContactAction()
                                                        }
                                                    }
                                                ])
                                            } else {
                                                this.saveContactAction();
                                            }
                                        })
                                        .catch((errorIsDuplicate) => {
                                            this.saveContactAction();
                                        });
                                }

                            } else {
                                this.setState({loading: false}, () => {
                                    Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), getTranslation(translations.alertMessages.placeOfResidenceError, this.props.translation), [
                                        {
                                            text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                                            onPress: () => {
                                                this.hideMenu()
                                            }
                                        }
                                    ])
                                })
                            }
                        } else {
                            this.setState({loading: false}, () => {
                                Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), getTranslation(translations.alertMessages.monthsValueError, this.props.translation), [
                                    {
                                        text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                                        onPress: () => {
                                            console.log("OK pressed")
                                        }
                                    }
                                ])
                            })
                        }
                    } else {
                        this.setState({loading: false}, () => {
                            Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), getTranslation(translations.alertMessages.yearsValueError, this.props.translation), [
                                {
                                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                                    onPress: () => {
                                        console.log("OK pressed")
                                    }
                                }
                            ])
                        })
                    }
                } else {
                    this.setState({loading: false}, () => {
                        Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), `${getTranslation(translations.alertMessages.requiredFieldsMissingError, this.props.translation)}.\n${getTranslation(translations.alertMessages.missingFields, this.props.translation)}: ${missingFields}`, [
                            {
                                text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                                onPress: () => {
                                    this.hideMenu()
                                }
                            }
                        ])
                    })
                }
            } else {
                this.setState({loading: false}, () => {
                    Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), `${getTranslation(translations.alertMessages.requiredFieldsMissingError, this.props.translation)}.\n${getTranslation(translations.alertMessages.missingFields, this.props.translation)}: ${relationshipsMissingFields}`, [
                        {
                            text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                            onPress: () => {
                                this.hideMenu()
                            }
                        }
                    ])
                })
            }
        })
    };

    saveContactAction = () => {
        this.setState({
            savePressed: true
        }, () => {
            this.hideMenu();
            let ageConfig = this.ageAndDobPrepareForSave();
            this.setState(prevState => ({
                contact: Object.assign({}, prevState.contact, {age: ageConfig.ageClone}, {dob: ageConfig.dobClone}),
            }), () => {
                console.log("ageAndDobPrepareForSave done", this.state.contact);
                if (this.props.isNew) {
                    let contactWithRequiredFields = updateRequiredFields(outbreakId = this.props.outbreak._id, userId = this.props.user._id, record = Object.assign({}, this.state.contact), action = 'create', fileType = 'person.json', config.personTypes.contactsOfContacts);
                    this.setState(prevState => ({
                        contact: Object.assign({}, prevState.contact, contactWithRequiredFields),
                    }), () => {
                        let contactClone = _.cloneDeep(this.state.contact);
                        // let contactMatchFilter = this.checkIfContactMatchFilter();
                        // console.log('contactMatchFilter', contactMatchFilter)
                        addContactOfContact(contactClone, _.get(this.props, 'user._id'))
                            .then((result) => {
                                if (_.isFunction(this.props.refresh)) {
                                    this.props.refresh();
                                }
                                Navigation.pop(this.props.componentId)
                            })
                            .catch((errorAddContact) => {
                                console.log('errorUpdateCase', errorAddContact);
                            })
                    })
                } else {
                    let contactWithRequiredFields = null;
                    if (this.state.deletePressed === true) {
                        contactWithRequiredFields = updateRequiredFields(outbreakId = this.props.outbreak._id, userId = this.props.user._id, record = Object.assign({}, this.state.contact), action = 'delete', fileType = 'person.json', config.personTypes.contactsOfContacts)
                    } else {
                        contactWithRequiredFields = updateRequiredFields(outbreakId = this.props.outbreak._id, userId = this.props.user._id, record = Object.assign({}, this.state.contact), action = 'update', fileType = 'person.json', config.personTypes.contactsOfContacts)
                    }

                    this.setState(prevState => ({
                        contact: Object.assign({}, prevState.contact, contactWithRequiredFields),
                    }), () => {
                        let contactClone = _.cloneDeep(this.state.contact);
                        updateContactOfContact(contactClone)
                            .then((result) => {
                                if (_.isFunction(this.props.refresh)) {
                                    this.props.refresh();
                                }
                                Navigation.pop(this.props.componentId)
                            })
                            .catch((errorUpdateContact) => {
                                console.log('errorUpdateCase', errorUpdateContact);
                            })
                    })
                }
            })
        });
    }

    ageAndDobPrepareForSave = () => {
        let dobClone = null
        let ageClone = {years: 0, months: 0}

        if (this.state.contact.dob !== null && this.state.contact.dob !== undefined) {
            //get info from date
            dobClone = this.state.contact.dob;
            let today = createDate(null);
            let nrOFYears = this.calcDateDiff(dobClone, today);
            if (nrOFYears !== undefined && nrOFYears !== null) {
                //calc age for save
                if (nrOFYears.years === 0 && nrOFYears.months >= 0) {
                    ageClone.months = nrOFYears.months
                } else if (nrOFYears.years > 0) {
                    ageClone.years = nrOFYears.years
                }
            }
        } else if (this.state.selectedItemIndexForAgeUnitOfMeasureDropDown === 0 && this.state.contact.dob === null) {
            //years dropdown
            ageClone.years = (this.state.contact.age && this.state.contact.age.years !== undefined && this.state.contact.age.years !== null) ? this.state.contact.age.years : 0
        } else if (this.state.selectedItemIndexForAgeUnitOfMeasureDropDown === 1 && this.state.contact.dob === null) {
            //months dropdown
            ageClone.months = (this.state.contact.age && this.state.contact.age.months !== undefined && this.state.contact.age.months !== null) ? this.state.contact.age.months : 0
        }
        return {
            ageClone: ageClone,
            dobClone: dobClone
        }

    };

    checkRequiredFieldsPersonalInfo = () => {
        let personalInfo = [];
        for (let i = 0; i < this.preparedFields.personal.length; i++) {
            for (let j = 0; j < this.preparedFields.personal[i].fields.length; j++) {
                const field = this.preparedFields.personal[i].fields[j];
                if (field.isRequired && !this.state.contact[field.id] &&
                    !(field.id === 'pregnancyStatus' && (this.state.contact?.gender === translations.localTranslationTokens.male)) &&
                    field.id !== 'visualId') {
                    personalInfo.push(getTranslation(this.preparedFields.personal[i].fields[j].label, this.props.translation));
                    // return false;
                }
            }
        }

        if (checkArrayAndLength(_.get(this.state, 'contact.documents', []))) {
            for (let i = 0; i < _.get(this.state, 'contact.documents.length', 0); i++) {
                for (let j = 0; j < _.get(this, 'preparedFields.document.fields.length', 0); j++) {
                    if (_.get(this, `preparedFields.document.fields[${j}].isRequired`, false) && !_.get(this.state, `contact.documents[${i}][${this.preparedFields.document.fields[j].id}]`, null)) {
                        personalInfo.push(getTranslation(_.get(this, `preparedFields.document.fields[${j}].label`, null), this.props.translation));
                        // return false;
                    }
                }
            }
        }

        if (checkArrayAndLength(_.get(this.state, 'contact.vaccinesReceived', []))) {
            for (let i = 0; i < _.get(this.state, 'contact.vaccinesReceived.length', 0); i++) {
                for (let j = 0; j < _.get(this, 'preparedFields.vaccinesReceived.fields.length', 0); j++) {
                    if (_.get(this, `preparedFields.vaccinesReceived.fields[${j}].isRequired`, false) && !_.get(this.state, `contact.vaccinesReceived[${i}][${this.preparedFields.vaccinesReceived.fields[j].id}]`, null)) {
                        personalInfo.push(getTranslation(_.get(this, `preparedFields.vaccinesReceived.fields[${j}].label`, null), this.props.translation));
                        // return false;
                    }
                }
            }
        }

        return personalInfo;
        // return true;
    };
    checkRequiredFieldsAddresses = () => {
        let addresses = [];
        if (this.state.contact && this.state.contact.addresses && Array.isArray(this.state.contact.addresses) && this.state.contact.addresses.length > 0) {
            for (let i = 0; i < this.state.contact.addresses.length; i++) {
                for (let j = 0; j < this.preparedFields.address.fields.length; j++) {
                    if (this.preparedFields.address.fields[j].isRequired && !this.state.contact.addresses[i][this.preparedFields.address.fields[j].id]) {
                        addresses.push(getTranslation(this.preparedFields.address.fields[j].label, this.props.translation));
                        // return false;
                    }
                }
            }
        } else {
            return addresses
            // return false;
        }
        return addresses;
        // return true;
    };
    checkFields = () => {
        // let pass = true;
        let requiredFields = [];
        let exposureRelationships = _.get(this.state.contact, 'relationships', []);
        if (checkArrayAndLength(exposureRelationships)) {
            exposureRelationships = exposureRelationships.map((e) => _.get(e, 'relationshipData', e));
            const preparedFields = this.preparedFieldsRelationship.relationship.fields;
            for (let i = 0; i < preparedFields.length; i++) {
                if (preparedFields[i].id === 'exposure') {
                    if (exposureRelationships[0].persons.length === 0) {
                        requiredFields.push('Person')
                        // pass = false;
                    }
                } else {
                    if (preparedFields[i].isRequired) {
                        if (!exposureRelationships[0][preparedFields[i].id]) {
                            requiredFields.push(getTranslation(preparedFields[i].label, this.props.translation));
                            // pass = false;
                        }
                    }
                }
            }
        }
        return requiredFields;
        // return pass;
    };
    checkAgeYearsRequirements = () => {
        if (this.state.selectedItemIndexForAgeUnitOfMeasureDropDown === 0) {
            if (this.state.contact.age && this.state.contact.age.years !== undefined && this.state.contact.age.years !== null) {
                if (this.state.contact.age.years < 0 || this.state.contact.age.years > 150) {
                    return false
                }
            }
        }
        return true
    };
    checkAgeMonthsRequirements = () => {
        if (this.state.selectedItemIndexForAgeUnitOfMeasureDropDown === 1) {
            if (this.state.contact.age && this.state.contact.age.years !== undefined && this.state.contact.age.years !== null) {
                if (this.state.contact.age.months < 0 || this.state.contact.age.months > 11) {
                    return false
                }
            }
        }
        return true
    };
    checkRequiredFields = () => {
        let requiredFields = [];
        return requiredFields.concat(this.checkRequiredFieldsPersonalInfo(), this.checkRequiredFieldsAddresses());
        // return this.checkRequiredFieldsPersonalInfo() && this.checkRequiredFieldsAddresses() && this.checkRequiredFieldsRelationships()
    };
    checkPlaceOfResidence = () => {
        return checkArrayAndLength(this.state?.contact?.addresses) &&
            !this.state?.contact?.addresses.find((e) =>
                e.typeId === translations.userResidenceAddress.userPlaceOfResidence
            );
    };

    showMenu = () => {
        if (this.refs.menuRef) {
            this.refs.menuRef.show();
        }
    };

    hideMenu = () => {
        // this.refs['menuRef'].hide();
        if (this.refs.menuRef) {
            this.refs.menuRef.hide();
        }
    };

    _showDateTimePicker = () => {
        this.setState({isDateTimePickerVisible: true});
    };

    _hideDateTimePicker = () => {
        this.setState({isDateTimePickerVisible: false});
    };

    _handleDatePicked = (date) => {
        console.log("Date selected: ", date);
        this._hideDateTimePicker();

        this.setState(prevState => ({
            contact: Object.assign({}, prevState.contact, {deceased: true, dateDeceased: createDate(date)})
        }), () => {
            this.handleOnPressSave();
        });
    };

    handleOnPressDeleteContact = () => {
        this.setState({
            deletePressed: true
        }, () => {
            this.handleOnPressSave();
        })
    };

    handleOnDeletePress = (index) => {

        Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.deleteAddress, this.props.translation), [
            {
                text: getTranslation(translations.generalLabels.noAnswer, this.props.translation), onPress: () => {
                    console.log('Cancel pressed')
                }
            },
            {
                text: getTranslation(translations.generalLabels.yesAnswer, this.props.translation), onPress: () => {
                    let contactAddressesClone = _.cloneDeep(this.state.contact.addresses);
                    contactAddressesClone.splice(index, 1);

                    let hasPlaceOfResidence = false
                    let contactPlaceOfResidence = contactAddressesClone.find((e) => {
                        return e.typeId === config.userResidenceAddress.userPlaceOfResidence
                    })
                    if (contactPlaceOfResidence !== undefined) {
                        hasPlaceOfResidence = true
                    }
                    this.setState(prevState => ({
                        contact: Object.assign({}, prevState.contact, {addresses: contactAddressesClone}),
                        hasPlaceOfResidence
                    }), () => {
                        console.log("After deleting the address: ", this.state.contact);
                    })
                }
            }
        ]);
    };

    handleOnPressCopyAddress = (index) => {
        if (this.props.caseAddress) {
            Alert.alert(
                getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.copyAddress, this.props.translation), [
                    {
                        text: getTranslation(translations.generalLabels.noAnswer, this.props.translation),
                        onPress: () => {
                            console.log('Cancel pressed')
                        }
                    },
                    {
                        text: getTranslation(translations.generalLabels.yesAnswer, this.props.translation),
                        onPress: () => {
                            let contactsCopy = _.cloneDeep(this.state.contact);
                            _.set(contactsCopy, `addresses[${index}]`, this.props.caseAddress);
                            this.setState({
                                contact: contactsCopy
                            })
                        }
                    }
                ]
            );
        }
    };

    handleOnPressAddAdrress = () => {
        let addresses = [];
        if (this.state && this.state.contact && this.state.contact.addresses) {
            addresses = _.cloneDeep(this.state.contact.addresses);
        }

        addresses.push({
            typeId: '',
            country: '',
            city: '',
            addressLine1: '',
            addressLine2: '',
            postalCode: '',
            locationId: '',
            // geoLocation: {
            //     coordinates: ['', ''],
            //     type: 'Point'
            // },
            date: createDate(null)
        });
        this.setState(prevState => ({
            contact: Object.assign({}, prevState.contact, {addresses})
        }), () => {
            console.log("### after updating the data: ", this.state.contact);
        })
    };

    onNavigatorEvent = (event) => {
        navigation(event, this.props.navigator);
    };

    goToHelpScreen = () => {
        let pageAskingHelpFrom = null
        if (this.props.isNew !== null && this.props.isNew !== undefined && this.props.isNew === true) {
            pageAskingHelpFrom = 'contactsSingleScreenAdd'
        } else {
            if (this.state.isEditMode === true) {
                pageAskingHelpFrom = 'contactsSingleScreenEdit'
            } else if (this.state.isEditMode === false) {
                pageAskingHelpFrom = 'contactsSingleScreenView'
            }
        }

        Navigation.showModal(createStackFromComponent({
            name: 'HelpScreen',
            passProps: {
                pageAskingHelpFrom: pageAskingHelpFrom
            }
        }));
    };

    onPressEdit = () => {
        this.setState({
            isEditMode: true,
            isModified: false,
            contactBeforeEdit: _.cloneDeep(this.state.contact)
        })
    };
    onPressCancelEdit = () => {
        if (this.state.isModified === true) {
            Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.caseDiscardAllChangesConfirmation, this.props.translation), [
                {
                    text: getTranslation(translations.alertMessages.yesButtonLabel, this.props.translation),
                    onPress: () => {
                        this.setState({
                            contact: _.cloneDeep(this.state.contactBeforeEdit),
                            isModified: false,
                            isEditMode: false
                        })
                    }
                },
                {
                    text: getTranslation(translations.alertMessages.cancelButtonLabel, this.props.translation),
                    onPress: () => {
                        console.log("onPressCancelEdit No pressed - nothing changes")
                    }
                }
            ])
        } else {
            //there are no changes
            this.setState({
                isEditMode: false
            })
        }
    };
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
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
        teams: _.get(state, 'teams', []),
        user: _.get(state, 'user', null),
        outbreak: _.get(state, 'outbreak', null),
        role: _.get(state, 'role', []),
        screenSize: _.get(state, 'app.screenSize', config.designScreenSize),
        filter: _.get(state, 'app.filters', null),
        translation: _.get(state, 'app.translation', []),
        locations: _.get(state, 'locations.locations', []),
        periodOfFollowUp: _.get(state, 'outbreak.periodOfFollowUp', 1)
    };
};

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        updateFollowUpAndContact,
        updateContact,
        addContact,
        removeErrors,
        addFollowUp,
        setDisableOutbreakChange
    }, dispatch);
};

export default connect(mapStateToProps, matchDispatchProps)(ContactsOfContactsSingleScreen);
