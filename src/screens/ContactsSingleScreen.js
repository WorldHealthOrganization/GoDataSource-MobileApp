/**
 * Created by florinpopa on 21/08/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import geolocation from '@react-native-community/geolocation';
import {Alert, Animated, BackHandler, Dimensions, Keyboard, Platform, StyleSheet, View} from 'react-native';
import {Icon} from 'react-native-material-ui';
import NavBarCustom from './../components/NavBarCustom';
import ViewHOC from './../components/ViewHOC';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators, compose} from "redux";
import {TabBar, TabView} from 'react-native-tab-view';
import ContactsSingleAddress from './../containers/ContactsSingleAddress';
import ContactsSingleCalendar from './../containers/ContactsSingleCalendar';
import ContactsSingleRelationship from './../containers/ContactsSingleRelationship';
import ContactsSinglePersonal from './../containers/ContactsSinglePersonal';
import ContactsSingleQuestionnaire from './../containers/ContactsSingleQuestionnaire';
import RelationshipScreen from './../screens/RelationshipScreen';
import Breadcrumb from './../components/Breadcrumb';
import Menu, {MenuItem} from 'react-native-material-menu';
import Ripple from 'react-native-material-ripple';
import {addFollowUp, getFollowUpsForContactId, updateFollowUpAndContact} from './../actions/followUps';
import {addContact, checkForNameDuplicated, getExposuresForContact, updateContact} from './../actions/contacts';
import {removeErrors} from './../actions/errors';
import _, {findIndex, sortBy, remove} from 'lodash';
import {
    calculateDimension,
    computeFullName,
    createDate, createStackFromComponent,
    daysSince,
    extractIdFromPouchId,
    getTranslation,
    navigation,
    updateRequiredFields
} from './../utils/functions';
import moment from 'moment/min/moment.min';
import translations from './../utils/translations';
import ElevatedView from 'react-native-elevated-view';
import AddFollowUpScreen from './AddFollowUpScreen';
import {
    checkRequiredQuestions,
    extractAllQuestions,
    generateId,
    generateTeamId, mapAnswers,
    reMapAnswers
} from "../utils/functions";
import constants from "../utils/constants";
import {checkArray, checkArrayAndLength} from "../utils/typeCheckingFunctions";
import PermissionComponent from './../components/PermissionComponent';
import lodashIntersect from 'lodash/intersection';
import {getItemByIdRequest} from './../actions/cases';
import lodashGet from "lodash/get";
import cloneDeep from "lodash/cloneDeep";
import withPinconde from './../components/higherOrderComponents/withPincode';
import {
    validateRequiredFields,
    checkValidEmails,
    formValidator,
    prepareFieldsAndRoutes
} from './../utils/formValidators';
import {Navigation} from "react-native-navigation";
import {fadeInAnimation, fadeOutAnimation} from "../utils/animations";
import {setDisableOutbreakChange} from "../actions/outbreak";
import {getContactRelationForContact} from "../actions/contacts";
import styles from './../styles';
import get from "lodash/get";
import colors from "../styles/colors";

const initialLayout = {
    height: 0,
    width: Dimensions.get('window').width,
};

class ContactsSingleScreen extends Component {

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
                config.tabsValuesRoutes.contactsSingle :
                config.tabsValuesRoutes.contactsSingleWithoutExposures;


        this.preparedFieldsRelationship = prepareFieldsAndRoutes(this.props.outbreak, 'relationships', {relationship: {fields: config.addRelationshipScreen}});
        this.preparedFields = prepareFieldsAndRoutes(this.props.outbreak, 'contacts', Object.assign({}, config.contactsSingleScreen, {
            vaccinesReceived: config.caseSingleScreen.vaccinesReceived,
            document: config.caseSingleScreen.document,
            relationship: {fields: config.addRelationshipScreen}
        }));
        if (this.props.outbreak && !this.props.outbreak[constants.PERMISSIONS_OUTBREAK.allowRegistrationOfCoC]) {
            remove(routes, (route => route.key === 'contacts'))
        }
        if (this.preparedFields.address?.invisible) {
            remove(routes, (route => route.key === 'address'))
        }

        this.state = {
            interactionComplete: false,
            routes: routes,
            index: this.props.index || 0,
            item: this.props.item,
            filter: this.props.filter && this.props.filter['FollowUpsScreen'] ? this.props.filter['FollowUpsScreen'] : {
                searchText: ''
            },
            filterFromFilterScreen: this.props.filter && this.props.filter['ContactsFilterScreen'] ? this.props.filter['ContactsFilterScreen'] : null,
            contact: this.props.isNew ? {
                riskLevel: null,
                riskReason: '',
                outbreakId: this.props.user && this.props.outbreak._id ? this.props.outbreak._id : '',
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
                addresses: this.preparedFields.address?.invisible ?
                    []
                    :
                    [
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
            canChangeScreen: false,
            anotherPlaceOfResidenceWasChosen: false,
            hasPlaceOfResidence: !this.preparedFields.address?.invisible,
            // updateExposure: false,
            isEditMode: true,
            selectedItemIndexForTextSwitchSelectorForAge: 0, // age/dob - switch tab
            selectedItemIndexForAgeUnitOfMeasureDropDown: this.props.isNew ? 0 : (this.props.contact && this.props.contact.age && this.props.contact.age.years !== undefined && this.props.contact.age.years !== null && this.props.contact.age.years > 0) ? 0 : 1, //default age dropdown value
            showAddFollowUpScreen: false,

            //Questionnaire features
            previousAnswers: {},
            currentAnswers: {},
            mappedQuestions: [],

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
            let mappedAnswers = mapAnswers(this.props.caseInvestigationQuestions, this.props.contact.questionnaireAnswers);
            //permissions check
            let isEditMode = _.get(this.props, 'isEditMode', false);
            this.setState({
                isEditMode
            });

            if (this.props.user !== null) {

                let followUpPromise = getFollowUpsForContactId(this.state.contact._id, this.props.outbreak._id, this.props.teams)
                    .then((responseFollowUps) => responseFollowUps.map((e) => e.followUps));
                let exposurePromise = getExposuresForContact(this.state.contact._id);
                let contactPromise = getContactRelationForContact(this.state.contact._id);
                let getContactPromise = null;
                if (this.props.getContact) {
                    getContactPromise = getItemByIdRequest(this.state.contact._id);
                }

                Promise.all([followUpPromise, exposurePromise, contactPromise, getContactPromise])
                    .then(([followUps, exposureRelations, contactRelations, contact]) => {
                        this.setState(prevState => ({
                            loading: !prevState.loading,
                            previousAnswers: mappedAnswers.mappedAnswers,
                            mappedQuestions: mappedAnswers.mappedQuestions,
                            contact: Object.assign({}, this.props.getContact ? contact : prevState.contact, {
                                followUps,
                                relationships: {exposureRelations, contactRelations}
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
                    type: config.personTypes.cases,
                    source: true,
                    target: null
                }, {
                    id: null,
                    type: config.personTypes.contacts,
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
                     loaderText={
                         this.props && this.props.syncState ? 'Loading' : getTranslation(translations.loadingScreenMessages.loadingMsg, this.props.translation)
                     }>
                <NavBarCustom
                    title={null}
                    customTitle={
                        <View style={style.headerContainer}>
                            <View
                                style={[style.breadcrumbContainer]}>
                                <Breadcrumb
                                    entities={[getTranslation(this.props && this.props.previousScreen ? this.props.previousScreen : translations.contactSingleScreen.title, this.props.translation), this.props.isNew ? getTranslation(translations.contactSingleScreen.addContactTitle, this.props.translation) : ((this.state.contact && this.state.contact.firstName ? (this.state.contact.firstName + " ") : '') + (this.state.contact && this.state.contact.lastName ? this.state.contact.lastName : ''))]}
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
                                        <Icon name="help" color={styles.textColor} size={18}/>
                                    </Ripple>
                                </ElevatedView>
                            </View>
                            {
                                !this.props.isNew && this.props.role && checkArrayAndLength(lodashIntersect(this.props.role, [
                                    constants.PERMISSIONS_FOLLOW_UP.followUpAll,
                                    constants.PERMISSIONS_FOLLOW_UP.followUpCreate,
                                    constants.PERMISSIONS_LAB_RESULT.labResultAll,
                                    constants.PERMISSIONS_LAB_RESULT.labResultCreate
                                ])) ? (
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
                                                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                                                    <Icon name="more-vert" color={styles.textColor} size={24}/>
                                                </Ripple>
                                            }
                                            style={{top: 36}}
                                        >
                                            <PermissionComponent
                                                render={() => (
                                                    <MenuItem onPress={this.handleOnPressDelete}>
                                                        {getTranslation(translations.contactsScreen.delete, this.props.translation)}
                                                    </MenuItem>
                                                )}
                                                permissionsList={[
                                                    constants.PERMISSIONS_CONTACT.contactDelete,
                                                    constants.PERMISSIONS_CONTACT.contactAll
                                                ]}
                                            />
                                            <PermissionComponent
                                                render={() => (
                                                    <MenuItem onPress={this.handleOnAddFollowUp}>
                                                        {getTranslation(translations.contactsScreen.addFollowupsButton, this.props.translation)}
                                                    </MenuItem>
                                                )}
                                                permissionsList={[constants.PERMISSIONS_FOLLOW_UP.followUpAll, constants.PERMISSIONS_FOLLOW_UP.followUpCreate]}
                                                alternativeRender={() => (
                                                    <View style={[style.rippleStyle, {width: 60}]}/>
                                                )}
                                            />
                                            {
                                                this.props.outbreak?.isContactLabResultsActive && this.props.contact ?
                                                    <>
                                                        <PermissionComponent
                                                            render={() => (
                                                                <MenuItem onPress={this.handleOnPressAddLabResult}>
                                                                    {getTranslation(translations.labResultsSingleScreen.createLabResult, this.props.translation)}
                                                                </MenuItem>
                                                            )}
                                                            permissionsList={[
                                                                constants.PERMISSIONS_LAB_RESULT.labResultAll,
                                                                constants.PERMISSIONS_LAB_RESULT.labResultCreate
                                                            ]}
                                                        />
                                                        <PermissionComponent
                                                            render={() => (
                                                                <MenuItem
                                                                    onPress={this.handleOnPressShowLabResults}>
                                                                    {getTranslation(translations.labResultsSingleScreen.viewLabResult, this.props.translation)}
                                                                </MenuItem>
                                                            )}
                                                            permissionsList={[
                                                                constants.PERMISSIONS_LAB_RESULT.labResultAll,
                                                                constants.PERMISSIONS_LAB_RESULT.labResultList
                                                            ]}
                                                        />
                                                    </>
                                                    :
                                                    null
                                            }
                                            <AddFollowUpScreen
                                                showAddFollowUpScreen={this.state.showAddFollowUpScreen}
                                                onCancelPressed={this.handleOnCancelPressed}
                                                onSavePressed={this.handleOnSavePressed}
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
                    navigationState={{index: this.state.index, routes: this.state.routes}}
                    onIndexChange={this.handleOnIndexChange}
                    animationEnabled={Platform.OS === 'ios'}
                    renderScene={this.renderScene}
                    renderTabBar={this.handleRenderTabBar}
                    useNativeDriver
                    initialLayout={initialLayout}
                    swipeEnabled={this.props.isNew ? false : true}
                />
            </ViewHOC>
        );
    };


    // Please write here all the methods that are not react native lifecycle methods
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
        date = createDate(date).toISOString();
        let followUp = {
            _id: generateId(),
            statusId: config.followUpStatuses.notPerformed,
            targeted: true,
            date: date,
            fileType: 'followUp.json',
            outbreakId: this.props.outbreak._id,
            index: daysSince(_.get(this.state, 'contact.followUp.startDate', null), date) + 1,
            teamId: _.get(this.state, 'contact.followUpTeamId', null) !== null ? this.state.contact.followUpTeamId : generateTeamId(_.get(this.state, 'contact.addresses', []).slice(), this.props.teams, this.props.locations.slice()),
            personId: extractIdFromPouchId(this.state.contact._id, 'person.json'),
            address: _.get(this.state, 'contact.addresses', null) !== null ? this.state.contact.addresses.find((e) => e.typeId === translations.userResidenceAddress.userPlaceOfResidence) : null
        };

        followUp = updateRequiredFields(this.props.user.outbreakId, this.props.user._id, followUp, 'create', 'followUp.json');

        this.setState({
            showAddFollowUpScreen: !this.state.showAddFollowUpScreen
        }, () => {
            this.hideMenu();
            // addFollowUp(followUp)
            //     .then((resultAddFollowUp) => {
            // console.log('FollowUpAdded');
            // this.props.navigator.showInAppNotification({
            //     screen: 'InAppNotificationScreen',
            //     autoDismissTimerSec: 1,
            //     passProps: {
            //         text: 'Follow-up added'
            //     }
            // })
            Navigation.push(this.props.componentId, {
                component: {
                    name: 'FollowUpsSingleScreen',
                    options: {
                        animations: {
                            push: fadeInAnimation,
                            pop: fadeOutAnimation
                        }
                    },
                    passProps: {
                        isNew: true,
                        isEditMode: true,
                        item: followUp,
                        contact: this.state.contact,
                        previousScreen: getTranslation(translations.contactSingleScreen.addContactTitle, this.props.translation),
                    }
                }
            })
            // })
            // .catch((errorAddFollowUp) => {
            //     console.log('ErrorAddFollowUp: ', errorAddFollowUp);
            // })
        });
    };
    handleOnPressDelete = () => {
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
    handlePressNavbarButton = () => {
        Navigation.mergeOptions(this.props.componentId, {
            sideMenu: {
                left: {
                    visible: true,
                },
            },
        });
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
            console.log("1");
            this.handleOnIndexChange(nextIndex)
        });
    }
    handleMoveToNextScreenButton = () => {
        // Before moving to the next screen do the checks for the current screen
        let missingFields = [];
        let invalidEmails = [];
        let placeOfResidenceError = true;
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
                invalidEmails = this.checkForInvalidEmails();
                placeOfResidenceError = this.checkPlaceOfResidence();
                break;
            case 2:
                missingFields = this.checkFields(constants.RELATIONSHIP_TYPE.contact);
                break;
            case 4:
                missingFields = this.checkFields(constants.RELATIONSHIP_TYPE.exposure);
                break;
            case 3:
                missingFields = this.check;
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
        } else if (!placeOfResidenceError) {
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
            }, () => {
                this.handleOnIndexChange(nextIndex)
            });
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
                scrollEnabled={true}
                bounces={true}
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
                        routeKey={this.state.routes[this.state.index].key}
                        preparedFields={this.preparedFields}
                        contact={this.state.contact}
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
                        type={this.props.type}
                        routeKey={this.state.routes[this.state.index].key}
                        preparedFields={this.preparedFields}
                        contact={this.state.contact}
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
                        preparedFields={this.preparedFieldsRelationship}
                        routeKey={this.state.routes[this.state.index].key}
                        relationshipType={constants.RELATIONSHIP_TYPE.exposure}
                        contact={this.state.contact}
                        activeIndex={this.state.index}
                        onPressEditExposure={this.handleOnPressEditExposure}
                        onPressDeleteExposure={this.handleOnPressDeleteExposure}
                        addContactFromCasesScreen={this.props.addContactFromCasesScreen}
                        componentId={this.props.componentId}
                        saveExposure={this.handleSaveExposure}
                        refreshRelations={this.refreshRelations}
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
            case 'contacts':
                return (
                    <ContactsSingleRelationship
                        preparedFields={this.preparedFieldsRelationship}
                        routeKey={this.state.routes[this.state.index].key}
                        contact={this.state.contact}
                        relationshipType={constants.RELATIONSHIP_TYPE.contact}
                        activeIndex={this.state.index}
                        onPressEditExposure={this.handleOnPressEditExposure}
                        onPressDeleteExposure={this.handleOnPressDeleteExposure}
                        addContactFromCasesScreen={this.props.addContactFromCasesScreen}
                        componentId={this.props.componentId}
                        saveExposure={this.handleSaveExposure}
                        refreshRelations={this.refreshRelations}
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
            case 'investigation':
                return (
                    <ContactsSingleQuestionnaire
                        routeKey={this.state.routes[this.state.index].key}
                        item={this.state.contact}
                        currentAnswers={this.state.currentAnswers}
                        previousAnswers={this.state.previousAnswers}
                        isEditMode={this.state.isEditMode}
                        index={this.state.index}

                        numberOfTabs={this.state.routes.length}
                        onPressEdit={this.onPressEdit}
                        onPressSave={this.handleOnPressSave}
                        onPressSaveEdit={this.handleOnPressSave}
                        onPressCancelEdit={this.onPressCancelEdit}

                        onChangeTextAnswer={this.onChangeAnswer}
                        onChangeSingleSelection={this.onChangeAnswer}
                        onChangeMultipleSelection={this.onChangeAnswer}
                        onChangeDateAnswer={this.onChangeAnswer}
                        handleMoveToPrevieousScreenButton={this.handleMoveToPrevieousScreenButton}
                        isNew={this.props.isNew ? true : this.props.forceNew ? true : false}
                        onClickAddNewMultiFrequencyAnswer={this.onClickAddNewMultiFrequencyAnswer}
                        onChangeAnswerDate={this.onChangeAnswerDate}
                        savePreviousAnswers={this.savePreviousAnswers}
                        copyAnswerDate={this.handleCopyAnswerDate}
                    />
                );
            case 'calendar':
                return (
                    <ContactsSingleCalendar
                        routeKey={this.state.routes[this.state.index].key}
                        contact={this.state.contact}
                        activeIndex={this.state.index}
                        handleOnPressSave={this.handleOnPressSave}
                        onPressPreviousButton={this.handleMoveToPrevieousScreenButton}
                        isEditMode={this.state.isEditMode}
                        numberOfTabs={this.state.routes.length}
                        // onPressPreviousButton={this.handlePreviousPress}
                        onPressNextButton={this.handleMoveToNextScreenButton}
                        onPressSaveEdit={this.handleOnPressSave}
                        onPressEdit={this.onPressEdit}
                        onPressCancelEdit={this.onPressCancelEdit}
                    />
                );
            default:
                return (
                    <ContactsSinglePersonal
                        contact={this.state.contact}
                        activeIndex={this.state.index}
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
                        Navigation.pop(this.props.componentId);
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
    };

    handleSaveExposure = (exposure, isUpdate = false) => {
        this.setState({
            loading: true
        })
    };
    refreshRelations = () => {
        this.setState({
            loading: true
        }, () => {
            const exposurePromise = getExposuresForContact(this.state?.contact?._id);
            const contactsPromise = getContactRelationForContact(this.state?.contact?._id);
            Promise.all([exposurePromise, contactsPromise])
                .then(([exposureRelations, contactRelations]) => {
                    this.setState(prevState => ({
                        loading: false,
                        contact: Object.assign({}, prevState.contact, {
                            relationships: {
                                exposureRelations,
                                contactRelations
                            }
                        })
                    }))
                })
                .catch((errorGetRelations) => {
                    console.log('Error while getting relations: ', errorGetRelations);
                    this.setState({
                        loading: false
                    })
                })
        })
    }

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
        console.log("onChangeDropDown: ", value, id, objectType, type);
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
                type: 'Contact',
                saveExposure: this.handleSaveExposure,
                caseIdFromCasesScreen: this.props.caseIdFromCasesScreen,
                isEditMode: false,
                addContactFromCasesScreen: false,
                refreshRelations: this.refreshRelations
            }
        }))
    };
    handleOnPressDeleteExposure = (relation, index) => {
        if (this.state.contact.relationships.length === 1) {
            Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.contactDeleteLastExposureError, this.props.translation), [
                {
                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                    onPress: () => {
                        console.log("Ok pressed")
                    }
                }
            ])
        } else {
            Alert.alert(getTranslation(translations.alertMessages.warningLabel, this.props.translation), getTranslation(translations.alertMessages.contactDeleteExposureConfirmation, this.props.translation), [
                {
                    text: getTranslation(translations.alertMessages.cancelButtonLabel, this.props.translation),
                    onPress: () => {
                        console.log("Cancel delete")
                    }
                },
                {
                    text: getTranslation(translations.alertMessages.yesButtonLabel, this.props.translation),
                    onPress: () => {
                        let relations = _.cloneDeep(this.state.contact.relationships);
                        console.log('Relations after cloneDeep: ', relations, relation);
                        if (relations && Array.isArray(relations) && relations.map((e) => {
                            return e._id
                        }).indexOf(relation._id) > -1) {
                            relations.splice(relations.map((e) => {
                                return e._id
                            }).indexOf(relation._id), 1);
                            console.log('Relations after splice: ', relations);
                            this.setState(prevState => ({
                                contact: Object.assign({}, prevState.contact, {relationships: relations})
                            }), () => {
                                relation = updateRequiredFields(this.props.outbreak._id, this.props.user._id, Object.assign({}, relation), 'delete');
                                this.props.deleteExposureForContact(this.props.outbreak._id, this.props.contact._id, relation, this.props.user.token, this.props.teams);
                            })
                        }
                    }
                }
            ])
        }
    };

    handleOnPressSave = () => {
        Keyboard.dismiss();
        this.setState({
            loading: true
        }, async () => {
            if (this.state.contact.deleted) {
                this.saveContactAction();
            }
            let functionsArray = [this.checkFields, this.checkRequiredFields, this.checkAgeYearsRequirements, this.checkAgeMonthsRequirements, this.checkPlaceOfResidence, this.checkRequiredFieldsQuestionnaire, this.checkForInvalidEmails];
            let message = null;
            if (this.state.maskError) {
                message = getTranslation(translations.alertMessages.invalidMaskAlert, this.props.translation).replace('{{mask}}', `${this.props.outbreak?.contactIdMask}`);
            }
            for (let i = 0; i < functionsArray.length; i++) {
                let response = await functionsArray[i]();
                if (checkArrayAndLength(response)) {
                    if (i === functionsArray.length - 1) {
                        message = `${getTranslation(translations.alertMessages.invalidEmails, this.props.translation)}: ${response}`;
                    } else {
                        message = `${getTranslation(translations.alertMessages.requiredFieldsMissingError, this.props.translation)}.\n${getTranslation(translations.alertMessages.missingFields, this.props.translation)}: ${response}`;
                    }
                    break;
                } else {
                    if (!response) {
                        switch (i) {
                            case 2:
                                message = translations.alertMessages.yearsValueError;
                                break;
                            case 3:
                                message = translations.alertMessages.monthsValueError;
                                break;
                            case 4:
                                message = translations.alertMessages.placeOfResidenceError;
                                break;
                            default:
                                message = null;
                        }
                        break;
                    }
                }
            }

            if (message) {
                this.setState({
                    loading: false
                }, () => {
                    this.showAlert(translations.alertMessages.validationErrorLabel, message);
                })
            } else {
                const {contact} = this.state;
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
        })
    };

    checkPlaceOfResidence = () => {
        const checkNoAddress = !this.state.contact?.addresses || (checkArray(this.state?.contact?.addresses) && this.state?.contact?.addresses.length === 0);
        const checkIfPlaceOfResidence = checkArrayAndLength(this.state?.contact?.addresses) &&
            this.state?.contact?.addresses.find((e) =>
                e.typeId === translations.userResidenceAddress.userPlaceOfResidence
            );

        return checkNoAddress || checkIfPlaceOfResidence;
    };

    showAlert = (title, message) => {
        Alert.alert(getTranslation(title, this.props.translation), getTranslation(message, this.props.translation), [
            {
                text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                onPress: () => {
                    this.hideMenu()
                }
            }
        ])
    };

    saveContactAction = () => {
        // this.setState({
        //     savePressed: true
        // }, () => {
        this.hideMenu();
        let ageConfig = this.ageAndDobPrepareForSave();

        let contactClone = _.cloneDeep(this.state.contact);
        contactClone = Object.assign({}, contactClone, {age: ageConfig.ageClone}, {dob: ageConfig.dobClone});
        let operation = 'create';
        let promise = null;
        if (!this.props.isNew) {
            if (this.state.deletePressed) {
                operation = 'delete';
            } else {
                operation = 'update';
            }
        }

        contactClone.questionnaireAnswers = reMapAnswers(_.cloneDeep(this.state.previousAnswers));
        contactClone.questionnaireAnswers = this.filterUnasweredQuestions(contactClone.questionnaireAnswers);
        contactClone = updateRequiredFields(this.props.outbreak._id, this.props.user._id, contactClone, operation, 'person.json', 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT');
        if (operation === 'create') {
            promise = addContact(contactClone, _.get(this.props, 'periodOfFollowUp', 1), _.get(this.props, 'user._id'))
        } else {
            promise = updateContact(contactClone);
        }

        promise
            .then((result) => {
                if (_.isFunction(this.props.refresh)) {
                    this.props.refresh();
                }
                Navigation.pop(this.props.componentId)
            })
            .catch((errorAddContact) => {
                console.log(`Error ${operation} contact`, errorAddContact);
            })
        // });
    };

    ageAndDobPrepareForSave = () => {
        let dobClone = null;
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
                if (field.isRequired && !_.get(this.state.contact, field.id, null) &&
                    field.id !== 'visualId') {
                    if (field.id === 'pregnancyStatus' && this.state.contact?.gender === translations.localTranslationTokens.male) {
                    } else {
                        personalInfo.push(getTranslation(this.preparedFields.personal[i].fields[j].label, this.props.translation));
                    }
                    // return false;
                }
            }
        }

        if (checkArrayAndLength(_.get(this.state, 'contact.documents', []))) {
            for (let i = 0; i < _.get(this.state, 'contact.documents.length', 0); i++) {
                for (let j = 0; j < _.get(this.preparedFields, 'document.fields.length', 0); j++) {
                    if (_.get(this.preparedFields, `document.fields[${j}].isRequired`, false) && !_.get(this.state, `contact.documents[${i}][${this.preparedFields.document.fields[j].id}]`, null)) {
                        personalInfo.push(getTranslation(_.get(this.preparedFields, `document.fields[${j}].label`, null), this.props.translation));
                        // return false;
                    }
                }
            }
        }

        if (checkArrayAndLength(_.get(this.state, 'contact.vaccinesReceived', []))) {
            for (let i = 0; i < _.get(this.state, 'contact.vaccinesReceived.length', 0); i++) {
                for (let j = 0; j < _.get(this.preparedFields, 'vaccinesReceived.fields.length', 0); j++) {
                    if (_.get(this.preparedFields, `vaccinesReceived.fields[${j}].isRequired`, false) && !_.get(this.state, `contact.vaccinesReceived[${i}][${this.preparedFields.vaccinesReceived.fields[j].id}]`, null)) {
                        personalInfo.push(getTranslation(_.get(this.preparedFields, `vaccinesReceived.fields[${j}].label`, null), this.props.translation));
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

    checkForInvalidEmails = () => {
        return validateRequiredFields(_.get(this.state, 'contact.addresses', []), config?.addressFields?.fields, (dataToBeValidated, fields, defaultFunction) => {
            if (fields.id === 'emailAddress') {
                return checkValidEmails(dataToBeValidated, fields?.id);
            }

            return null;
        })
    };
    handleOnPressAddLabResult = () => {
        Navigation.push(this.props.componentId, {
            component: {
                name: 'LabResultsSingleScreen',
                passProps: {
                    isNew: true,
                    refresh: this.props.onRefresh,
                    personId: this.props.contact._id,
                    personType: translations.personTypes.contacts
                }
            }
        })
    };
    handleOnPressShowLabResults = () => {
        Navigation.push(this.props.componentId, {
            component: {
                name: constants.appScreens.labResultsScreen,
                passProps: {
                    filtersToAdd: {
                        personId: this.props.contact._id
                    }
                },
                options: {}
            }
        });
    }
    checkFields = (type) => {
        // let pass = true;
        let requiredFields = [];
        // let relationships = _.get(this.state.contact, 'relationships.contactRelations', []);
        // if(type === constants.RELATIONSHIP_TYPE.exposure){
        //     relationships = _.get(this.state.contact, 'relationships.exposureRelations', []);
        // }
        let relationships = _.get(this.state.contact, 'relationships', []);
        if (checkArrayAndLength(relationships)) {
            relationships = relationships.map((e) => _.get(e, 'relationshipData', e));
            const preparedFields = this.preparedFieldsRelationship.relationship.fields;
            for (let i = 0; i < preparedFields.length; i++) {
                if (preparedFields[i].id === 'exposure') {
                    if (relationships[0].persons.length === 0) {
                        requiredFields.push('Person')
                        // pass = false;
                    }
                } else {
                    if (preparedFields[i].isRequired) {
                        if (!relationships[0][preparedFields[i].id]) {
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

    // Questionnaire methods
    onChangeAnswer = (value, id, parentId, index) => {
        let questionnaireAnswers = _.cloneDeep(this.state.previousAnswers);

        if (parentId) {
            if (!questionnaireAnswers[parentId]) {
                questionnaireAnswers[parentId] = [];
            }
            if (lodashGet(questionnaireAnswers, `[${parentId}][0]`, null) !== null) {
                if (!questionnaireAnswers[parentId][0].hasOwnProperty("subAnswers")) {
                    questionnaireAnswers[parentId][0] = Object.assign({}, questionnaireAnswers[parentId][0], {subAnswers: {}});
                }
                if (typeof questionnaireAnswers[parentId][0].subAnswers === "object" && Object.keys(questionnaireAnswers[parentId][0].subAnswers).length === 0) {
                    questionnaireAnswers[parentId][0].subAnswers = {};
                }
                if (!Array.isArray(questionnaireAnswers[parentId][0].subAnswers[id])) {
                    questionnaireAnswers[parentId][0].subAnswers[id] = [];
                }
                questionnaireAnswers[parentId][0].subAnswers[id][0] = value;
            }
        } else {
            if (!questionnaireAnswers[id]) {
                questionnaireAnswers[id] = [];
            }
            questionnaireAnswers[id][0] = value;
        }

        this.setState({
            previousAnswers: questionnaireAnswers,
            isModified: true
        }, () => {
            console.log('onChangeMultipleSelection after setState', this.state.previousAnswers);
        })
    };
    onChangeAnswerDate = (value, questionId, index) => {
        let questionnaireAnswers = _.cloneDeep(this.state.previousAnswers);
        if (checkArrayAndLength(questionnaireAnswers?.[questionId])) {
            if (questionnaireAnswers[questionId][0]) {
                questionnaireAnswers[questionId][0].date = value;
                if (!questionnaireAnswers[questionId][0].hasOwnProperty("subAnswers")) {
                    questionnaireAnswers[questionId][0] = Object.assign({}, questionnaireAnswers[questionId][0], {subAnswers: {}});
                }
                if (checkArrayAndLength(questionnaireAnswers?.[questionId]?.[0]?.subAnswers)) {
                    for (let subQuestionId in questionnaireAnswers[questionId][0].subAnswers) {
                        questionnaireAnswers[questionId][0].subAnswers[subQuestionId].map((e) => {
                            return {value: e.value, date: value};
                        })
                    }
                }
            }
        } else {
            questionnaireAnswers[questionId] = [{date: value, value: null}];
        }
        this.setState({
            previousAnswers: questionnaireAnswers,
            isModified: true
        });
    };

    // used for adding multi-frequency answers
    onClickAddNewMultiFrequencyAnswer = (item) => {
        //add new empty item to question and update previousAnswers
        let previousAnswersClone = _.cloneDeep(this.state.previousAnswers);
        if (previousAnswersClone.hasOwnProperty(item.variable) && item.variable) {
            previousAnswersClone[item.variable].push({date: null, value: null});
        } else {
            previousAnswersClone = Object.assign({}, previousAnswersClone, {
                [item.variable]: [{
                    date: null,
                    value: null
                }]
            });
        }
        this.savePreviousAnswers(previousAnswersClone[item.variable], item.variable);
    };
    savePreviousAnswers = (previousAnswers, previousAnswersId) => {
        this.setState(prevState => ({
            previousAnswers: Object.assign({}, prevState.previousAnswers, {[previousAnswersId]: previousAnswers}),
            isModified: true
        }), () => {
            Navigation.dismissAllModals();
        })
    };
    handleCopyAnswerDate = (value) => {
        let previousAnswersClone = _.cloneDeep(this.state.previousAnswers);
        let sortedQuestions = sortBy(cloneDeep(this.props.questions), ['order', 'variable']);
        sortedQuestions = extractAllQuestions(sortedQuestions, previousAnswersClone, 0);

        for (let question of sortedQuestions) {
            if (question.variable && question.answerType !== "LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_MARKUP") {
                if (previousAnswersClone[question.variable]) {
                    previousAnswersClone[question.variable] = previousAnswersClone[question.variable].map((e) => {
                        return Object.assign(e, {date: e.date || createDate(value).toISOString()})
                    })
                } else {
                    previousAnswersClone[question.variable] = [{
                        date: createDate(value).toISOString(),
                        value: null
                    }]
                }
            }
        }
        this.setState({
            previousAnswers: previousAnswersClone,
            isModified: true
        });
    };
    checkAnswerDatesQuestionnaire = () => {
        let previousAnswersClone = _.cloneDeep(this.state.previousAnswers);
        let sortedQuestions = sortBy(cloneDeep(this.props.caseInvestigationQuestions), ['order', 'variable']);
        sortedQuestions = extractAllQuestions(sortedQuestions, this.state.previousAnswers, 0);
        let canSave = true;
        //questions exist
        if (Array.isArray(sortedQuestions) && sortedQuestions.length > 0) {
            for (let i = 0; i < sortedQuestions.length; i++) {
                //verify only multianswer questions and if they were answered
                if (sortedQuestions[i].multiAnswer && previousAnswersClone.hasOwnProperty(sortedQuestions[i].variable)) {
                    //current answers
                    let answerValues = previousAnswersClone[sortedQuestions[i].variable];
                    //validate all the answers of the question
                    if (Array.isArray(answerValues) && answerValues.length > 0) {
                        for (let q = 0; q < answerValues.length; q++) {
                            // if it has value then it must have date
                            if (answerValues[q].value !== null && answerValues[q].date === null) {
                                canSave = false;
                            }
                        }
                    }
                }
            }
        }
        return canSave;
    };
    filterUnasweredQuestions = (previousAnswersClone) => {
        // let previousAnswersClone = _.cloneDeep(this.state.previousAnswers);
        let sortedQuestions = sortBy(cloneDeep(this.props.caseInvestigationQuestions), ['order', 'variable']);
        sortedQuestions = extractAllQuestions(sortedQuestions, this.state.previousAnswers, 0);
        if (Array.isArray(sortedQuestions) && sortedQuestions.length > 0) {
            for (let i = 0; i < sortedQuestions.length; i++) {
                //verify only multianswer questions and if they were answered
                if (sortedQuestions[i].multiAnswer && previousAnswersClone.hasOwnProperty(sortedQuestions[i].variable)) {
                    //current answers
                    let answerValues = previousAnswersClone[sortedQuestions[i].variable];
                    let answerValuesClone = [];
                    //validate all the answers of the question
                    if (Array.isArray(answerValues) && answerValues.length > 0) {
                        answerValuesClone = answerValues.filter((answer) => {
                            return answer.value !== null;
                        });
                    }
                    if (answerValuesClone.length > 0) {
                        //update answer list
                        previousAnswersClone[sortedQuestions[i].variable] = answerValuesClone;
                    } else {
                        //remove key
                        delete previousAnswersClone[sortedQuestions[i].variable];
                    }
                }
            }
        }
        return previousAnswersClone;
    };
    checkRequiredFieldsQuestionnaire = () => {
        let sortedQuestions = sortBy(cloneDeep(this.props.caseInvestigationQuestions), ['order', 'variable']);
        sortedQuestions = extractAllQuestions(sortedQuestions, this.state.previousAnswers, 0);

        return checkRequiredQuestions(sortedQuestions, this.state.previousAnswers).map(e => getTranslation(e, this.props.translation));
    };
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flex: 1,
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
        questions: get(state, 'outbreak.contactInvestigationTemplate', null),
        periodOfFollowUp: _.get(state, 'outbreak.periodOfFollowUp', 1),
        caseInvestigationQuestions: _.get(state, 'outbreak.contactInvestigationTemplate', null),
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

export default compose(
    withPinconde(),
    connect(mapStateToProps, matchDispatchProps)
)(ContactsSingleScreen);
