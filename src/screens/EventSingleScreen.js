/**
 * Created by mobileclarisoft on 23/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import geolocation from '@react-native-community/geolocation';
import {Alert, Animated, BackHandler, Dimensions, Keyboard, Platform, StyleSheet, View} from 'react-native';
import {PagerAndroid, PagerPan, PagerScroll, TabBar, TabView} from 'react-native-tab-view';
import {connect} from "react-redux";
import {bindActionCreators, compose} from "redux";
import NavBarCustom from './../components/NavBarCustom';
import Breadcrumb from './../components/Breadcrumb';
import Ripple from 'react-native-material-ripple';
import config, {sideMenuKeys} from './../utils/config';
import _, {sortBy, findIndex, remove} from 'lodash';
import EventSinglePersonalContainer from './../containers/EventSinglePersonalContainer';
import EventSingleAddressContainer from './../containers/EventSingleAddressContainer';
import {Icon} from 'react-native-material-ui';
import {
    addEvent,
    getEventAndRelationshipsById,
    getRelationsContactForEvent, getRelationsExposureForEvent,
    updateEvent
} from './../actions/events';
import {saveSelectedScreen} from "../actions/app";
import {
    calculateDimension,
    checkRequiredQuestions,
    computeFullName,
    createDate, createStackFromComponent,
    extractAllQuestions,
    extractIdFromPouchId,
    getTranslation,
    mapAnswers,
    reMapAnswers,
    updateRequiredFields
} from './../utils/functions';
import moment from 'moment/min/moment.min';
import translations from './../utils/translations'
import ElevatedView from 'react-native-elevated-view';
import ViewHOC from './../components/ViewHOC';
import cloneDeep from "lodash/cloneDeep";
import lodashIntersect from "lodash/intersection";
import lodashGet from 'lodash/get';
import constants from "../utils/constants";
import {checkArrayAndLength} from "../utils/typeCheckingFunctions";
import withPincode from './../components/higherOrderComponents/withPincode';
import {checkValidEmails, prepareFieldsAndRoutes, validateRequiredFields} from './../utils/formValidators';
import {Navigation} from "react-native-navigation";
import {fadeInAnimation, fadeOutAnimation} from "../utils/animations";
import Menu, {MenuItem} from "react-native-material-menu";
import PermissionComponent from "../components/PermissionComponent";
import {setDisableOutbreakChange} from "../actions/outbreak";
import EventSingleRelationshipContainer from "../containers/EventSingleRelationshipContainer";
import styles from './../styles';
import colors from "../styles/colors";
import EventSingleInvestigationContainer from "../containers/EventSingleInvestigationContainer";

const initialLayout = {
    height: 0,
    width: Dimensions.get('window').width,
};

class EventSingleScreen extends Component {

    constructor(props) {
        super(props);

        // Process what the tab contents will be based on
        let routes = this.props.isNew ?
            config.tabsValuesRoutes.eventsSingle :
            checkArrayAndLength(lodashIntersect(
                this.props.role,
                [
                    constants.PERMISSIONS_EVENT.eventAll
                ]
            )) ?
                config.tabsValuesRoutes.eventsSingleViewEdit :
                config.tabsValuesRoutes.eventsSingle;

        this.preparedFields = prepareFieldsAndRoutes(this.props.outbreak, 'events', config.eventSingleScreen);
        if (this.preparedFields.address?.invisible){
            remove(routes, (route => route.key === 'address'))
        }

        this.state = {
            interactionComplete: false,
            deletePressed: false,
            savePressed: false,
            saveFromEditPressed: false,
            routes: routes,
            index: _.get(this.props, 'index', 0),
            event: this.props.isNew && !this.props.forceNew ? {
                outbreakId: this.props.outbreak._id,
                description:'',
                responsibleUserId: null,
                date: null,
                dateOfReporting: null,
                isDateOfReportingApproximate: false,
                name: '',
                address: {
                        typeId: config.userResidenceAddress.userPlaceOfResidence,
                        country: '',
                        city: '',
                        addressLine1: '',
                        addressLine2: '',
                        postalCode: '',
                        locationId: '',
                        phoneNumber: '',
                        // geoLocation: {
                        //     coordinates: ['', ''],
                        //     type: 'Point'
                        // },
                        date: createDate(null)
                    },
                questionnaireAnswers: {},

            } : Object.assign({}, this.props.event),
            isEditMode: this.props.isNew ? true : this.props.forceNew ? true : false,
            isDateTimePickerVisible: false,
            isModified: false,
            canChangeScreen: false,
            eventBeforeEdit: {},
            anotherPlaceOfResidenceWasChosen: false,
            hasPlaceOfResidence: true,
            selectedItemIndexForTextSwitchSelectorForAge: 0, // age/dob - switch tab
            selectedItemIndexForAgeUnitOfMeasureDropDown: this.props.isNew ? 0 : (this.props.event && this.props.event.age && this.props.event.age.years !== undefined && this.props.event.age.years !== null && this.props.event.age.years > 0) ? 0 : 1, //default age dropdown value,
            currentAnswers: {},
            previousAnswers: {},
            mappedQuestions: [],
            loading: true,

            // used for adding new multi-frequency answers
            showAddSingleAnswerModalScreen: false,
            newItem: null,
            maskError: false,


            relations: []
        };
        // Bind here methods, or at least don't declare methods in the render method
        // this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
        this.screenEventListener = Navigation.events().registerComponentDidDisappearListener(this.onNavigatorEvent.bind(this))
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }

    componentDidMount() {
        const listener = {
            componentDidAppear: () => {
                this.props.setDisableOutbreakChange(true);
            }
        };
        // Register the listener to all events related to our component
        this.navigationListener = Navigation.events().registerComponentListener(listener, this.props.componentId);
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        if (!this.props.isNew && this.props.event) {
            getEventAndRelationshipsById(this.props.event._id)
                .then((eventAndRelations) => {
                    let eventData = _.get(eventAndRelations, 'eventData', null);
                    let relationsContact = _.get(eventAndRelations, 'relationshipContactData', []);
                    let relationsExposure = _.get(eventAndRelations, 'relationshipExposureData', []);

                    if (eventData !== null) {
                        if(!eventData.address && eventData.addresses) {
                            eventData.address = eventData.addresses[0];
                        }
                        let mappedAnswers = mapAnswers(this.props.eventInvestigationQuestions, eventData.questionnaireAnswers);
                        let ageClone = {years: 0, months: 0};
                        let updateAge = false;
                        if (_.get(eventData, 'age.years', null) !== null || _.get(eventData, 'age.months', null) !== null) {
                            updateAge = true;
                        }
                        eventData = Object.assign({}, eventData, {age: updateAge ? eventData.age : ageClone}, {dob: eventData.dob !== undefined ? eventData.dob : null});

                        this.setState({
                            previousAnswers: mappedAnswers.mappedAnswers,
                            mappedQuestions: mappedAnswers.mappedQuestions,
                            event: eventData,
                            relations: {relationsContact, relationsExposure},
                            loading: false
                        })
                    } else {
                        this.setState({
                            event: null
                        })
                    }
                })
                .catch((errorEventAndRelations) => {
                    console.log(errorEventAndRelations);
                })
        } else {
            this.setState({
                loading: false
            })
        }

    }

    componentWillUnmount() {
        this.navigationListener.remove();
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        this.screenEventListener.remove();
    }

    handleBackButtonClick() {
        if (this.state.isModified === true) {
            Alert.alert("", 'You have unsaved data. Are you sure you want to leave this page and lose all changes?', [
                {
                    text: 'Yes', onPress: () => {
                        if (this.props.isAddFromNavigation) {
                            Navigation.setStackRoot(this.props.componentId, {
                                component: {
                                    name: 'EventsScreen',
                                    options: {
                                        animations: {
                                            push: fadeInAnimation,
                                            pop: fadeOutAnimation
                                        }
                                    }
                                }

                            })
                        } else {
                            Navigation.pop(this.props.componentId)
                        }
                    }
                },
                {
                    text: 'Cancel', onPress: () => {
                        console.log("onPressCancelEdit No pressed - nothing changes")
                    }
                }
            ])
        } else {
            if (this.props.isAddFromNavigation) {
                Navigation.setStackRoot(this.props.componentId, {
                    component: {
                        name: 'EventsScreen',
                        options: {
                            animations: {
                                push: fadeInAnimation,
                                pop: fadeOutAnimation
                            }
                        }
                    }
                })
            } else {
                Navigation.pop(this.props.componentId)
            }
        }
        return true;
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <ViewHOC style={style.container}
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
                                            getTranslation(translations.eventSingleScreen.title, this.props.translation),
                                            this.props.isNew ? getTranslation(translations.eventSingleScreen.addEventTitle, this.props.translation) : (computeFullName(_.get(this.state, 'event', null)))
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
                            {
                                (checkArrayAndLength(_.intersection(
                                    _.get(this.props, 'role', []),
                                    [
                                        constants.PERMISSIONS_LAB_RESULT.labResultAll,
                                        constants.PERMISSIONS_LAB_RESULT.labResultCreate,
                                        constants.PERMISSIONS_LAB_RESULT.labResultList,
                                        constants.PERMISSIONS_EVENT.eventDelete,
                                        constants.PERMISSIONS_EVENT.eventAll
                                    ]
                                )) && this.props.event && !this.props.isNew) ? (
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
                                                        {getTranslation(translations.eventSingleScreen.deleteEvent, this.props.translation)}
                                                    </MenuItem>
                                                )}
                                                permissionsList={[
                                                    constants.PERMISSIONS_EVENT.eventDelete,
                                                    constants.PERMISSIONS_EVENT.eventAll
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
                    navigationState={{
                        index: this.state.index,
                        routes: this.state.routes
                    }}
                    animationEnabled={Platform.OS === 'ios'}
                    onIndexChange={this.handleOnIndexChange}
                    renderScene={this.handleRenderScene}
                    renderTabBar={this.handleRenderTabBar}
                    renderPager={this._renderPager}
                    initialLayout={initialLayout}
                    swipeEnabled={this.props.isNew ? false : true}
                />
            </ViewHOC>
        );
    }

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
                            event: Object.assign({}, prevState.event, {
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

    //Index change for TabBar
    handleOnIndexChange = _.throttle((index) => {
        console.log("Can state change", index, this.state.canChangeScreen);
        // if (this.state.canChangeScreen) {
        this.setState({
            canChangeScreen: false,
            index
        });
        // }
    }, 800);
    handleMoveToScreen = (nextIndex) => {
        this.setState({
            canChangeScreen: true,
        }, () => {
            console.log("On index change 1");
            this.handleOnIndexChange(nextIndex)
        });
    }

    handleMoveToNextScreenButton = () => {
        let nextIndex = this.state.index + 1;

        this.setState({
            canChangeScreen: true,
        }, () => {
            this.handleOnIndexChange(nextIndex)
        });
    };
    handleMoveToPrevieousScreenButton = () => {
        let nextIndex = this.state.index - 1;

        this.setState({
            canChangeScreen: true,
        });

        console.log("On index change 3");
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
                    paddingHorizontal: 20,
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

    _renderPager = (props) => {
        switch (Platform.OS) {
            case 'ios':
                return (
                    <PagerScroll
                        {...props}
                        animationEnabled={false}
                        swipeEnabled={false}
                    />
                );
            case 'android':
                return (
                    <PagerAndroid
                        {...props}
                        animationEnabled={false}
                        swipeEnabled={false}
                    />
                );
            default:
                return (
                    <PagerPan
                        {...props}
                        swipeEnabled={false}
                    />
                );
        }
    };

    //Render label for TabBar
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

    //Render scene
    handleRenderScene = ({route}) => {
        switch (route.key) {
            case 'details':
                return (
                    <EventSinglePersonalContainer
                        eventStateControl={this.state.event.isDateOfReportingApproximate}
                        preparedFields={this.preparedFields}
                        routeKey={this.state.routes[this.state.index].key}
                        event={this.state.event}
                        isEditMode={this.state.isEditMode}
                        indexx={this.state.index}
                        numberOfTabs={this.state.routes.length}
                        onPressEdit={this.onPressEdit}
                        onPressSaveEdit={this.onPressSaveEdit}
                        onPressCancelEdit={this.onPressCancelEdit}
                        onChangeText={this.onChangeText}
                        onChangeDate={this.onChangeDate}
                        onChangeSwitch={this.onChangeSwitch}
                        onChangeDropDown={this.onChangeDropDown}
                        onPressNextButton={this.handleMoveToNextScreenButton}
                        checkRequiredFieldsPersonalInfo={this.checkRequiredFieldsPersonalInfo}
                        isNew={this.props.isNew ? true : this.props.forceNew ? true : false}
                        onPressAddDocument={this.onPressAddDocument}
                        onDeletePress={this.handleOnPressDeleteDocument}
                        onChangeTextSwitchSelector={this.handleOnChangeTextSwitchSelector}
                        selectedItemIndexForTextSwitchSelectorForAge={this.state.selectedItemIndexForTextSwitchSelectorForAge}
                        selectedItemIndexForAgeUnitOfMeasureDropDown={this.state.selectedItemIndexForAgeUnitOfMeasureDropDown}
                        checkAgeMonthsRequirements={this.checkAgeMonthsRequirements}
                        onChangeextInputWithDropDown={this.handleOnChangeTextInputWithDropDown}
                    />
                );
                break;
            case 'address':
                return (
                    <EventSingleAddressContainer
                        routeKey={this.state.routes[this.state.index].key}
                        preparedFields={this.preparedFields}
                        event={this.state.event}
                        isEditMode={this.state.isEditMode}
                        index={this.state.index}
                        onPressEdit={this.onPressEdit}
                        onPressSave={this.handleOnPressSave}
                        onPressSaveEdit={this.onPressSaveEdit}
                        numberOfTabs={this.state.routes.length}
                        onPressCancelEdit={this.onPressCancelEdit}
                        onChangeText={this.onChangeText}
                        onChangeDropDown={this.onChangeDropDown}
                        onChangeDate={this.onChangeDate}
                        onChangeSwitch={this.onChangeSwitch}
                        onChangeSectionedDropDown={this.handleOnChangeSectionedDropDownAddress}
                        onDeletePress={this.handleOnPressDeleteAddress}
                        onPressAddAddress={this.handleOnPressAddAddress}
                        onPressNextButton={this.handleMoveToNextScreenButton}
                        handleMoveToPrevieousScreenButton={this.handleMoveToPrevieousScreenButton}
                        checkRequiredFieldsAddress={this.checkRequiredFieldsAddress}
                        isNew={this.props.isNew ? true : this.props.forceNew ? true : false}
                        anotherPlaceOfResidenceWasChosen={this.state.anotherPlaceOfResidenceWasChosen}
                        anotherPlaceOfResidenceChanged={this.anotherPlaceOfResidenceChanged}
                        hasPlaceOfResidence={this.state.hasPlaceOfResidence}
                    />
                );
                break;
            case 'exposures':
                return (
                    <EventSingleRelationshipContainer
                        routeKey={this.state.routes[this.state.index].key}
                        relationshipType={constants.RELATIONSHIP_TYPE.exposure}
                        event={this.state.event}
                        relations={this.state.relations?.relationsExposure}
                        index={this.state.index}
                        numberOfTabs={this.state.routes.length}
                        onPressEdit={this.onPressEdit}
                        onPressSaveEdit={this.onPressSaveEdit}
                        onPressCancelEdit={this.onPressCancelEdit}
                        onPressEditExposure={this.handleOnPressEditExposure}
                        onPressDeleteExposure={this.handleOnPressDeleteExposure}
                        componentId={this.props.componentId}
                        saveExposure={this.handleSaveExposure}
                        isNew={this.props.isNew}
                        handleOnPressSave={this.handleOnPressSave}
                        isEditMode={this.state.isEditMode}
                        selectedExposure={this.props.singleCase}
                        refreshRelations={this.refreshRelations}
                    />
                );
            case 'contacts':
                return (
                    <EventSingleRelationshipContainer
                        routeKey={this.state.routes[this.state.index].key}
                        relationshipType={constants.RELATIONSHIP_TYPE.contact}
                        event={this.state.event}
                        relations={this.state.relations?.relationsContact}
                        index={this.state.index}
                        numberOfTabs={this.state.routes.length}
                        onPressEdit={this.onPressEdit}
                        onPressSaveEdit={this.onPressSaveEdit}
                        onPressCancelEdit={this.onPressCancelEdit}
                        onPressEditExposure={this.handleOnPressEditExposure}
                        onPressDeleteExposure={this.handleOnPressDeleteExposure}
                        componentId={this.props.componentId}
                        saveExposure={this.handleSaveExposure}
                        isNew={this.props.isNew}
                        handleOnPressSave={this.handleOnPressSave}
                        isEditMode={this.state.isEditMode}
                        selectedExposure={this.props.singleCase}
                        refreshRelations={this.refreshRelations}
                    />
                );
                break;
            case 'eventInvestigation':
                return (
                  <EventSingleInvestigationContainer
                    routeKey={this.state.routes[this.state.index].key}
                    item={this.state.event}
                    currentAnswers={this.state.currentAnswers}
                    previousAnswers={this.state.previousAnswers}
                    isEditMode={this.state.isEditMode}
                    index={this.state.index}
                    numberOfTabs={this.state.routes.length}
                    onPressEdit={this.onPressEdit}
                    onPressSave={this.handleOnPressSave}
                    onPressSaveEdit={this.onPressSaveEdit}
                    onPressCancelEdit={this.onPressCancelEdit}
                    onChangeTextAnswer={this.onChangeTextAnswer}
                    onChangeSingleSelection={this.onChangeSingleSelection}
                    onChangeMultipleSelection={this.onChangeMultipleSelection}
                    onChangeDateAnswer={this.onChangeDateAnswer}
                    handleMoveToPrevieousScreenButton={this.handleMoveToPrevieousScreenButton}
                    isNew={this.props.isNew ? true : this.props.forceNew ? true : false}
                    onClickAddNewMultiFrequencyAnswer={this.onClickAddNewMultiFrequencyAnswer}
                    onChangeAnswerDate={this.onChangeAnswerDate}
                    savePreviousAnswers={this.savePreviousAnswers}
                    copyAnswerDate={this.handleCopyAnswerDate}
                  />
                );
            default:
                return null;
        }
    };

    //Save event
    handleOnPressSave = () => {
        if (this.state.event.deleted) {
            this.saveEventAction();
        }
        if (this.state.maskError) {
            Alert.alert(
                getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation),
                getTranslation(translations.alertMessages.invalidMaskAlert, this.props.translation).replace('{{mask}}', this.props.outbreak?.eventIdMask), [
                    {
                        text: 'Ok', onPress: () => {
                            console.log('Invalid emails')
                        }
                    }
                ])
            return;
        }
        let missingFields = this.checkRequiredFields().map((e) => getTranslation(e, this.props.translation));
        let invalidEmails = validateRequiredFields(_.get(this.state, 'event.address', {}), config?.addressFields?.fields, (dataToBeValidated, fields, defaultFunction) => {
            if (fields.id === 'emailAddress') {
                return checkValidEmails(dataToBeValidated, fields?.id);
            }

            return null;
        });
        let placeOfResidenceError = this.state?.event?.address &&
            !this.state?.event?.address.typeId === translations.userResidenceAddress.userPlaceOfResidence;
        // console.log('InvalidEmails: ', invalidEmails);
        if (missingFields && Array.isArray(missingFields) && missingFields.length === 0) {
                    if (!placeOfResidenceError) {
                        if (checkArrayAndLength(invalidEmails)) {
                            Alert.alert(
                                getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation),
                                `${getTranslation(translations.alertMessages.invalidEmails, this.props.translation)}: ${invalidEmails.join(', ')}`, [
                                    {
                                        text: 'Ok', onPress: () => {
                                            console.log('Invalid emails')
                                        }
                                    }
                                ])
                        } else {
                            if (this.checkAnswerDatesQuestionnaire()) {
                                this.saveEventAction()
                            } else {
                                this.setState({loading: false}, () => {
                                    Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), getTranslation(translations.alertMessages.answerDateMissingError, this.props.translation), [
                                        {
                                            text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                                            onPress: () => {
                                                this.hideMenu()
                                            }
                                        }
                                    ])
                                })
                            }
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
    };
    saveEventAction = () => {
        this.hideMenu();
        let eventClone = _.cloneDeep(this.state.event);
        // Remap the previous answers
        // let questionnaireAnswers = reMapAnswers(_.cloneDeep(this.state.previousAnswers));
        // questionnaireAnswers = this.filterUnasweredQuestions();
        eventClone.questionnaireAnswers = reMapAnswers(_.cloneDeep(this.state.previousAnswers));
        eventClone.questionnaireAnswers = this.filterUnasweredQuestions(eventClone.questionnaireAnswers);
        this.setState(prevState => ({
            event: Object.assign({}, prevState.event, eventClone),
        }), () => {
            if (this.state.saveFromEditPressed === true) {
                //update event and remain on view screen
                this.setState({
                    saveFromEditPressed: false,
                    isEditMode: false,
                    isModified: false,
                    eventBeforeEdit: {}
                }, () => {
                    let eventWithRequiredFields = updateRequiredFields(this.props.outbreak._id, this.props.user._id, Object.assign({}, this.state.event), 'update');
                    this.setState(prevState => ({
                        event: Object.assign({}, prevState.event, eventWithRequiredFields)
                    }), () => {
                        updateEvent(this.state.event)
                            .then((result) => {
                                if (_.isFunction(this.props.refresh)) {
                                    this.props.refresh();
                                }
                                Navigation.pop(this.props.componentId)
                            })
                            .catch((errorUpdateEvent) => {
                            })
                    })
                });
            } else {
                //global save pressed
                this.setState({
                    savePressed: true
                }, () => {
                    if (this.props.isNew || this.props.forceNew) {
                        let eventWithRequiredFields = updateRequiredFields(this.props.outbreak._id, this.props.user._id, Object.assign({}, this.state.event), 'create', 'person.json', 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_EVENT');
                        this.setState(prevState => ({
                            event: Object.assign({}, prevState.event, eventWithRequiredFields)
                        }), () => {
                            addEvent(this.state.event)
                                .then((result) => {
                                    if (_.isFunction(this.props.refresh)) {
                                        this.props.refresh();
                                    }
                                    if (this.props.isAddFromNavigation) {
                                        Navigation.setStackRoot(this.props.componentId, {
                                            component: {
                                                name: 'EventsScreen',
                                                options: {
                                                    animations: {
                                                        push: fadeInAnimation,
                                                        pop: fadeOutAnimation
                                                    }
                                                }
                                            }
                                        })
                                    } else {
                                        Navigation.pop(this.props.componentId)
                                    }
                                })
                                .catch((errorUpdateEvent) => {
                                    console.log('errorUpdateEvent', errorUpdateEvent);
                                })
                        })
                    } else {
                        let eventWithRequiredFields = null;
                        if (this.state.deletePressed === true) {
                            eventWithRequiredFields = updateRequiredFields(this.props.outbreak._id, this.props.user._id, Object.assign({}, this.state.event), 'delete', 'person.json', 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_EVENT')
                        } else {
                            eventWithRequiredFields = updateRequiredFields(this.props.outbreak._id, this.props.user._id, Object.assign({}, this.state.event), 'update', 'person.json', 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_EVENT')
                        }
                        this.setState(prevState => ({
                            event: Object.assign({}, prevState.event, eventWithRequiredFields)
                        }), () => {
                            updateEvent(this.state.event)
                                .then((result) => {
                                    if (_.isFunction(this.props.refresh)) {
                                        this.props.refresh();
                                    }
                                    if (this.props.isAddFromNavigation) {
                                        Navigation.setStackRoot(this.props.componentId, {
                                            component: {
                                                name: 'EventsScreen',
                                                options: {
                                                    animations: {
                                                        push: fadeInAnimation,
                                                        pop: fadeOutAnimation
                                                    }
                                                }
                                            }
                                        })
                                    } else {
                                        Navigation.pop(this.props.componentId)
                                    }
                                })
                                .catch((errorUpdateEvent) => {
                                    console.log('errorUpdateEvent', errorUpdateEvent);
                                })
                        })
                    }
                });
            }
        })
    };
    //Breadcrumb click
    handlePressBreadcrumb = () => {
        if (this.state.isModified === true) {
            Alert.alert("", 'You have unsaved data. Are you sure you want to leave this page and lose all changes?', [
                {
                    text: 'Yes', onPress: () => {
                        if (this.props.selectedScreen !== sideMenuKeys[5]) {
                            this.props.saveSelectedScreen(sideMenuKeys[5]);
                        }
                        Navigation.setStackRoot(this.props.componentId, {
                            component: {
                                name: 'EventsScreen',
                                options: {
                                    animations: {
                                        push: fadeInAnimation,
                                        pop: fadeOutAnimation
                                    }
                                }
                            }
                        })
                    }
                },
                {
                    text: 'Cancel', onPress: () => {
                        console.log("onPressCancelEdit No pressed - nothing changes")
                    }
                }
            ])
        } else {
            if (this.props.selectedScreen !== sideMenuKeys[5]) {
                this.props.saveSelectedScreen(sideMenuKeys[5]);
            }
            Navigation.setStackRoot(this.props.componentId, {
                component: {
                    name: 'EventsScreen',
                    options: {
                        animations: {
                            push: fadeInAnimation,
                            pop: fadeOutAnimation
                        }
                    }
                }
            })
        }
    };

    //View event actions edit/saveEdit/cancelEdit
    onPressEdit = () => {
        this.setState({
            isEditMode: true,
            isModified: false,
            eventBeforeEdit: _.cloneDeep(this.state.event)
        })
    };
    onPressSaveEdit = () => {
        Keyboard.dismiss();
        if (this.state.isModified) {
            this.setState({
                saveFromEditPressed: true,
                selectedItemIndexForTextSwitchSelectorForAge: this.state.event.dob !== null ? 1 : 0,
            }, () => {
                this.handleOnPressSave();
            })
        } else {
            this.setState({
                isEditMode: false,
                selectedItemIndexForTextSwitchSelectorForAge: this.state.event.dob !== null ? 1 : 0,
            }, () => {
                this.setState({loading: false})
            })
        }
    };
    onPressCancelEdit = () => {
        if (this.state.isModified === true) {
            Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.eventDiscardAllChangesConfirmation, this.props.translation), [
                {
                    text: getTranslation(translations.alertMessages.yesButtonLabel, this.props.translation),
                    onPress: () => {
                        this.setState({
                            event: _.cloneDeep(this.state.eventBeforeEdit),
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
                selectedItemIndexForTextSwitchSelectorForAge: this.state.event.dob !== null ? 1 : 0,
                isEditMode: false,
            }, () => {
                console.log("onPressCancelEdit");
            })
        }
    };


    // Exposures handlers
    handleSaveExposure = (exposure, isUpdate = false) => {
        this.setState({
            loading: true,
            updateExposure: true
        })
    };
    handleOnPressEditExposure = (relation, index) => {
        _.set(relation || {}, 'contactData.fullName', computeFullName(_.get(relation, 'contactData', null)));
        Navigation.showModal(createStackFromComponent({
            name: 'RelationshipScreen',
            passProps: {
                exposure: _.get(relation, 'relationshipData', null),
                selectedExposure: _.get(relation, 'contactData', null),
                contact: this.props.isNew ? null : this.props.contact,
                type: 'Event',
                saveExposure: this.handleSaveExposure,
                eventIdFromEventsScreen: this.props.eventIdFromEventsScreen,
                isEditMode: false,
                addContactFromEventsScreen: false,
                refreshRelations: this.refreshRelations
            }
        }))
    };
    refreshRelations = (exposure) => {
        this.setState({
            loading: true
        }, async () => {
            try {
                let updatedContacts = await getRelationsContactForEvent(_.get(this.state, 'event._id', null));
                let updatedExposures = await getRelationsExposureForEvent(_.get(this.state, 'event._id', null));
                this.setState({
                    loading: false,
                    relations: {relationsContact: updatedContacts, relationsExposure: updatedExposures}
                })
            } catch (errorUpdateExposure) {
                console.log('ErrorUpdateExposure', errorUpdateExposure);
            }
        })
    };



    handleOnChangeSectionedDropDownAddress = (selectedItems, index) => {
        // Here selectedItems is always an array with just one value and should pe mapped to the locationId field from the address from index
        if (selectedItems && Array.isArray(selectedItems) && selectedItems.length > 0) {
            let address = _.cloneDeep(this.state.event.address);
            address.locationId = extractIdFromPouchId(selectedItems['0']._id, 'location');
            const visibleGeoLocationField = this.preparedFields.address?.fields?.find(x => x.fieldId === 'geoLocation' && !x.invisible);
            if (visibleGeoLocationField && selectedItems['0'].geoLocation && selectedItems['0'].geoLocation.coordinates && Array.isArray(selectedItems['0'].geoLocation.coordinates)) {
                if (selectedItems['0'].geoLocation.coordinates[0] !== '' || selectedItems['0'].geoLocation.coordinates[1] !== '') {
                    setTimeout(() => {
                        Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.replaceCurrentCoordinates, this.props.translation), [
                            {
                                text: getTranslation(translations.alertMessages.cancelButtonLabel, this.props.translation),
                                onPress: () => {
                                    this.setState(prevState => ({
                                        event: Object.assign({}, prevState.event, {address}),
                                        isModified: true
                                    }))
                                }
                            },
                            {
                                text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                                onPress: () => {
                                    address.geoLocation = selectedItems['0'].geoLocation;
                                    this.setState(prevState => ({
                                        event: Object.assign({}, prevState.event, {address}),
                                        isModified: true
                                    }))
                                }
                            }
                        ])
                    }, 200);
                }
            } else {
                this.setState(prevState => ({
                    event: Object.assign({}, prevState.event, {address}),
                    isModified: true
                }))
            }
        }
    };


    // dateRanges functions
    onPressAddDateRange = () => {
        let dateRanges = _.cloneDeep(this.state.event.dateRanges);
        if (!dateRanges || !Array.isArray(dateRanges)) {
            dateRanges = [];
        }

        dateRanges.push({
            typeId: null,
            startDate: null,
            endDate: null,
            centerName: null,
            locationId: null,
            comments: null
        });

        this.setState(prevState => ({
            event: Object.assign({}, prevState.event, {dateRanges}),
            isModified: true
        }), () => {
            // console.log("### after updating the data: ", this.state.event);
        })
    };
    handleOnPressDeleteDateRange = (index) => {
        Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.deleteDateRange, this.state.translation), [
            {
                text: getTranslation(translations.generalLabels.noAnswer, this.props.translation), onPress: () => {
                    console.log('Cancel pressed')
                }
            },
            {
                text: getTranslation(translations.generalLabels.yesAnswer, this.props.translation), onPress: () => {
                    let eventDateRangesClone = _.cloneDeep(this.state.event.dateRanges);
                    eventDateRangesClone.splice(index, 1);
                    this.setState(prevState => ({
                        event: Object.assign({}, prevState.event, {dateRanges: eventDateRangesClone}),
                        isModified: true
                    }), () => {
                        // console.log("After deleting the dateRange: ", this.state.event);
                    })
                }
            }
        ]);
    };
    onChangeSectionedDropDownDateRange = (selectedItems, index) => {
        // Here selectedItems is always an array with just one value and should pe mapped to the locationId field from the address from index
        if (checkArrayAndLength(selectedItems)) {
            let dateRanges = _.cloneDeep(this.state.event.dateRanges);
            dateRanges[index].locationId = extractIdFromPouchId(selectedItems['0']._id, 'location');
            this.setState(prevState => ({
                event: Object.assign({}, prevState.event, {dateRanges}),
                isModified: true
            }))
        }
    };


    // vaccinesReceived functions
    onPressAddVaccine = () => {
        let vaccinesReceived = _.cloneDeep(this.state.event.vaccinesReceived);
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
            event: Object.assign({}, prevState.event, {vaccinesReceived: vaccinesReceived}),
            isModified: true
        }), () => {
            // console.log("### after updating the data: ", this.state.event);
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
                    let eventVaccinesReceived = _.cloneDeep(this.state.event.vaccinesReceived);
                    eventVaccinesReceived.splice(index, 1);
                    this.setState(prevState => ({
                        event: Object.assign({}, prevState.event, {vaccinesReceived: eventVaccinesReceived}),
                        isModified: true
                    }), () => {
                        console.log("After deleting the Vaccines: ", this.state.event);
                    })
                }
            }
        ]);
    };
    onChangeSectionedDropDownIsolation = (selectedItems, index) => {
        // Here selectedItems is always an array with just one value and should pe mapped to the locationId field from the address from index
        let isolationDates = _.cloneDeep(this.state.event.isolationDates);
        isolationDates[index].locationId = extractIdFromPouchId(selectedItems['0']._id, 'location');
        this.setState(prevState => ({
            event: Object.assign({}, prevState.event, {isolationDates}),
            isModified: true
        }))
    };

    onChangeSectionedDropDownBurial = (selectedItems, index) => {
        // Here selectedItems is always an array with just one value and should pe mapped to the locationId field from the address from index
        let burialLocationId = _.cloneDeep(this.state.event.burialLocationId);
        burialLocationId = extractIdFromPouchId(selectedItems['0']._id, 'location');
        this.setState(prevState => ({
            event: Object.assign({}, prevState.event, {burialLocationId: burialLocationId}),
            isModified: true
        }))
    };


    // show/hide Menu
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


    // Check required fields functions
    checkRequiredFieldsPersonalInfo = () => {
        //personal info
        let requiredFields = [];
        for (let i = 0; i < this.preparedFields.details.length; i++) {
            for (let j = 0; j < this.preparedFields.details[i].fields.length; j++) {
                const field = this.preparedFields.details[i].fields[j];
                if (field.isRequired && !this.state.event[field.id] && field.id !== 'visualId') {
                    requiredFields.push(getTranslation(this.preparedFields.details[i].fields[j].label, this.props.translation));
                    // return false;
                }
            }
        }

        return requiredFields;
        // return true;
    };
    checkRequiredFieldsAddress = () => {
        let requiredFields = [];
        if (this.state.event && this.state.event.address) {
                for (let j = 0; j < this.preparedFields.address.fields.length; j++) {
                    if (this.preparedFields.address.fields[j].isRequired && !this.state.event.address[this.preparedFields.address.fields[j].id]) {
                        requiredFields.push(getTranslation(this.preparedFields.address.fields[j].label, this.props.translation));
                        // return false;
                    }
                }
        } else {
            return requiredFields;
            // return false;
        }
        return requiredFields;
        // return true;
    };
    checkRequiredFieldsEventInvestigationQuestionnaire = () => {
        let sortedQuestions = sortBy(cloneDeep(this.props.eventInvestigationQuestions), ['order', 'variable']);
        sortedQuestions = extractAllQuestions(sortedQuestions, this.state.previousAnswers, 0);

        let unAnsweredQuestions = checkRequiredQuestions(sortedQuestions, this.state.previousAnswers);

        return unAnsweredQuestions;
    };
    checkRequiredFields = () => {
        let requiredFields = [];
        if (this.state.event?.deleted) {
            return [];
        }
        return requiredFields.concat(this.checkRequiredFieldsPersonalInfo(), this.checkRequiredFieldsAddress(), this.checkRequiredFieldsEventInvestigationQuestionnaire());
        // return this.checkRequiredFieldsPersonalInfo() && this.checkRequiredFieldsAddress() && this.checkRequiredFieldsInfection() && this.checkRequiredFieldsEventInvestigationQuestionnaire()
    };

    // onChangeStuff functions
    onChangeText = (value, id, objectTypeOrIndex, objectType, maskError) => {
        if (objectTypeOrIndex === 'Event') {
            this.setState(
                (prevState) => ({
                    event: Object.assign({}, prevState.event, {[id]: value}),
                    maskError,
                    isModified: true
                }));
        } else {
            if (typeof objectTypeOrIndex === 'phoneNumber' && objectTypeOrIndex >= 0 || typeof objectTypeOrIndex === 'number' && objectTypeOrIndex >= 0) {
                if (objectType && objectType === 'Address') {
                    let addressClone = _.cloneDeep(this.state.event.address);
                    if(!addressClone) addressClone = {};
                    // Check if the lat/lng have changed
                    if (id === 'lng') {
                        if (value === '' || value.value === '') {
                            delete addressClone.geoLocation;
                        } else {
                            if (!addressClone.geoLocation) {
                                addressClone.geoLocation = {};
                                addressClone.geoLocation.type = 'Point';
                                if (!addressClone.geoLocation.coordinates) {
                                    addressClone.geoLocation.coordinates = [];
                                }
                            }
                            if (!addressClone.geoLocation.coordinates) {
                                addressClone.geoLocation.coordinates = [];
                            }
                            if (!addressClone.geoLocation.type) {
                                addressClone.geoLocation.type = 'Point';
                            }
                            addressClone.geoLocation.coordinates[0] = value && value.value ? value.value : parseFloat(value);
                        }
                    } else {
                        if (id === 'lat') {
                            if (value === '' || value.value === '') {
                                delete addressClone.geoLocation;
                            } else {
                                if (!addressClone.geoLocation) {
                                    addressClone.geoLocation = {};
                                    addressClone.geoLocation.type = 'Point';
                                    if (!addressClone.geoLocation.coordinates) {
                                        addressClone.geoLocation.coordinates = [];
                                    }
                                }
                                if (!addressClone.geoLocation.coordinates) {
                                    addressClone.geoLocation.coordinates = [];
                                }
                                if (!addressClone.geoLocation.type) {
                                    addressClone.geoLocation.type = 'Point';
                                }
                                addressClone.geoLocation.coordinates[1] = value && value.value ? value.value : parseFloat(value);
                            }
                        } else {
                            addressClone[id] = value && value.value ? value.value : value;
                        }
                    }
                    this.setState(prevState => ({
                        event: Object.assign({}, prevState.event, {address: addressClone}),
                        maskError,
                        isModified: true
                    }))
                } else if (objectType && objectType === 'Documents') {
                    let documentsClone = _.cloneDeep(this.state.event.documents);
                    documentsClone[objectTypeOrIndex][id] = value && value.value ? value.value : value;
                    this.setState(prevState => ({
                        event: Object.assign({}, prevState.event, {documents: documentsClone}),
                        maskError,
                        isModified: true
                    }))
                } else {
                    if (objectType && objectType === 'DateRanges') {
                        let dateRangesClone = _.cloneDeep(this.state.event.dateRanges);
                        dateRangesClone[objectTypeOrIndex][id] = value && value.value ? value.value : value;
                        this.setState(prevState => ({
                            event: Object.assign({}, prevState.event, {dateRanges: dateRangesClone}),
                            maskError,
                            isModified: true
                        }))
                    }
                }
            }
        }
    };
    onChangeDate = (value, id, objectTypeOrIndex, objectType) => {
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
                let selectedItemIndexForAgeUnitOfMeasureDropDown = 0;

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
                this.setState(prevState => ({
                    event: Object.assign({}, prevState.event, {age: ageClone}, {dob: value}),
                    selectedItemIndexForAgeUnitOfMeasureDropDown,
                    isModified: true
                }), () => {
                    // console.log("handleOnChangeDate dob", id, " ", value, " ", this.state.event);
                })
            }
        } else {
            if (objectTypeOrIndex === 'Event') {
                this.setState((prevState) => ({
                        event: Object.assign({}, prevState.event, {[id]: value}),
                        isModified: true
                    })
                    , () => {
                        // console.log("onChangeDate", id, " ", value, " ", this.state.event);
                    })
            } else {
                if (typeof objectTypeOrIndex === 'phoneNumber' && objectTypeOrIndex >= 0 || typeof objectTypeOrIndex === 'number' && objectTypeOrIndex >= 0) {
                    if (objectType && objectType === 'DateRanges') {
                        let dateRangesClone = _.cloneDeep(this.state.event.dateRanges);
                        dateRangesClone[objectTypeOrIndex][id] = value && value.value ? value.value : value;
                        this.setState(prevState => ({
                            event: Object.assign({}, prevState.event, {dateRanges: dateRangesClone}),
                            isModified: true
                        }), () => {
                            // console.log("onChangeDate dateRanges", id, " ", value, " ", this.state.event);
                        })
                    } else if (objectType && objectType === 'Address') {
                        let addressClone = _.cloneDeep(this.state.event.address);
                        if(!addressClone) addressClone = {};
                        addressClone[id] = value && value.value ? value.value : value;
                        this.setState(prevState => ({
                            event: Object.assign({}, prevState.event, {address: addressClone}),
                            isModified: true
                        }), () => {
                            // console.log("onChangeDate addressClone", id, " ", value, " ", this.state.event);
                        })
                    } else if (objectType === 'Vaccines') {
                        let vaccinesClone = _.cloneDeep(this.state.event.vaccinesReceived);
                        vaccinesClone[objectTypeOrIndex][id] = value && value.value !== undefined ? value.value : value;
                        this.setState(prevState => ({
                            event: Object.assign({}, prevState.event, {vaccinesReceived: vaccinesClone}),
                            isModified: true
                        }), () => {
                            // console.log("onChangeDropDown", id, " ", value, " ", this.state.event);
                        })
                    }
                }
            }
        }
    };
    onChangeSwitch = (value, id, objectTypeOrIndex, objectType) => {
        if (id === 'geoLocationAccurate' && typeof objectTypeOrIndex === 'number' && objectTypeOrIndex >= 0 && objectType === 'Address') {
            Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.replaceCurrentCoordinates, this.props.translation), [
                {
                    text: getTranslation(translations.generalLabels.noAnswer, this.props.translation), onPress: () => {
                        let addressClone = _.cloneDeep(this.state.event.address);
                        if(!addressClone) addressClone = {};
                        addressClone.geoLocationAccurate = value;
                        this.setState(
                            (prevState) => ({
                                event: Object.assign({}, prevState.event, {address: addressClone}),
                                isModified: true
                            }), () => {
                                // console.log("onChangeSwitch", id, " ", value, " ", this.state.event);
                            }
                        )
                    }
                },
                {
                    text: getTranslation(translations.generalLabels.yesAnswer, this.props.translation), onPress: () => {
                        if (value) {
                            let addressClone = _.cloneDeep(this.state.event.address);
                            if(!addressClone) addressClone = {};
                            addressClone.geoLocationAccurate = value;
                            this.setState(
                                (prevState) => ({
                                    event: Object.assign({}, prevState.event, {address: addressClone}),
                                    isModified: true
                                }), () => {
                                    geolocation.getCurrentPosition((position) => {
                                            let addressClone = _.cloneDeep(this.state.event.address);
                                            if(!addressClone) addressClone = {};
                                            if (!addressClone.geoLocation) {
                                                addressClone.geoLocation = {};
                                                addressClone.geoLocation.type = 'Point';
                                                addressClone.geoLocation.coordinates = [];
                                            }
                                            if (!addressClone.geoLocation.type) {
                                                addressClone.geoLocation.type = 'Point';
                                            }
                                            if (!addressClone.geoLocation.coordinates) {
                                                addressClone.geoLocation.coordinates = [];
                                            }
                                            addressClone.geoLocation.coordinates = [value ? position.coords.longitude : 0, value ? position.coords.latitude : 0];
                                            addressClone.geoLocationAccurate = value;
                                            this.setState(
                                                (prevState) => ({
                                                    event: Object.assign({}, prevState.event, {address: addressClone}),
                                                    isModified: true
                                                })
                                            )
                                        },
                                        (error) => {
                                            Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(error.message, this.props.translation), [
                                                {
                                                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                                                    onPress: () => {
                                                        let addressClone = _.cloneDeep(this.state.event.address);
                                                        if(!addressClone) addressClone = {};
                                                        if (!addressClone.geoLocation) {
                                                            addressClone.geoLocation = {};
                                                            addressClone.geoLocation.type = 'Point';
                                                            addressClone.geoLocation.coordinates = [];
                                                        }
                                                        if (!addressClone.geoLocation.type) {
                                                            addressClone.geoLocation.type = 'Point';
                                                        }
                                                        if (!addressClone.geoLocation.coordinates) {
                                                            addressClone.geoLocation.coordinates = [];
                                                        }
                                                        addressClone.geoLocation.coordinates = [null, null];
                                                        addressClone.geoLocationAccurate = false;
                                                        this.setState(
                                                            (prevState) => ({
                                                                event: Object.assign({}, prevState.event, {address: addressClone}),
                                                                isModified: true
                                                            })
                                                        )
                                                    }
                                                }
                                            ])
                                        },
                                        {
                                            timeout: 5000
                                        }
                                    )
                                }
                            )
                        } else {
                            let addressClone = _.cloneDeep(this.state.event.address);
                            if(!addressClone) addressClone = {};
                            if (!addressClone.geoLocation) {
                                addressClone.geoLocation = {};
                                addressClone.geoLocation.type = 'Point';
                                addressClone.geoLocation.coordinates = [];
                            }
                            if (!addressClone.geoLocation.type) {
                                addressClone.geoLocation.type = 'Point';
                            }
                            if (!addressClone.geoLocation.coordinates) {
                                addressClone.geoLocation.coordinates = [];
                            }
                            addressClone.geoLocation.coordinates = [null, null];
                            addressClone.geoLocationAccurate = value;
                            this.setState(
                                (prevState) => ({
                                    event: Object.assign({}, prevState.event, {address: addressClone}),
                                    isModified: true
                                })
                            )
                        }
                    }
                }]
            );
        } else {
            if (objectType === 'Event') {
                this.setState((prevState) => ({
                        event: Object.assign({}, prevState.event, {[id]: value}),
                        isModified: true
                    }), ()=>{
                    }
                )
            }
        }
    };
    onChangeDropDown = (value, id, objectTypeOrIndex, objectType) => {
        if (objectTypeOrIndex === 'Event') {
            this.setState(
                (prevState) => ({
                    event: Object.assign({}, prevState.event, {[id]: value && value.value !== undefined ? value.value : value}),
                    isModified: true
                }), () => {
                    // console.log("onChangeDropDown", id, " ", value, " ", this.state.event);
                }
            )
        } else {
            if (typeof objectTypeOrIndex === 'number' && objectTypeOrIndex >= 0) {
                if (objectType === 'Address') {
                    let addressClone = _.cloneDeep(this.state.event.address);
                    if(!addressClone) addressClone = {};

                    let anotherPlaceOfResidenceWasChosen = false;
                    if (value && value.value !== undefined) {
                        if (value.value === config.userResidenceAddress.userPlaceOfResidence) {
                                if (addressClone[id] === value.value) {
                                    addressClone[id] = config.userResidenceAddress.userOtherResidence;
                                    anotherPlaceOfResidenceWasChosen = true
                                }
                        }
                    }

                    addressClone[id] = value && value.value !== undefined ? value.value : value;
                    let hasPlaceOfResidence = false;
                    let eventPlaceOfResidence = addressClone.typeId === config.userResidenceAddress.userPlaceOfResidence ? addressClone : null;
                    if (eventPlaceOfResidence && eventPlaceOfResidence.length > 0) {
                        hasPlaceOfResidence = true
                    }

                    this.setState(prevState => ({
                        event: Object.assign({}, prevState.event, {address: addressClone}),
                        isModified: true,
                        anotherPlaceOfResidenceWasChosen,
                        hasPlaceOfResidence
                    }), () => {
                        // console.log("onChangeDropDown", id, " ", value, " ", this.state.event);
                    })
                } else if (objectType === 'Documents') {
                    let documentsClone = _.cloneDeep(this.state.event.documents);
                    documentsClone[objectTypeOrIndex][id] = value && value.value !== undefined ? value.value : value;
                    this.setState(prevState => ({
                        event: Object.assign({}, prevState.event, {documents: documentsClone}),
                        isModified: true
                    }), () => {
                        // console.log("onChangeDropDown", id, " ", value, " ", this.state.event);
                    })
                } else if (objectType === 'DateRanges') {
                    let dateRangesClone = _.cloneDeep(this.state.event.dateRanges);
                    dateRangesClone[objectTypeOrIndex][id] = value && value.value !== undefined ? value.value : value;
                    this.setState(prevState => ({
                        event: Object.assign({}, prevState.event, {dateRanges: dateRangesClone}),
                        isModified: true
                    }), () => {
                        // console.log("onChangeDropDown", id, " ", value, " ", this.state.event);
                    })
                } else if (objectType === 'Vaccines') {
                    let vaccinesClone = _.cloneDeep(this.state.event.vaccinesReceived);
                    vaccinesClone[objectTypeOrIndex][id] = value && value.value !== undefined ? value.value : value;
                    this.setState(prevState => ({
                        event: Object.assign({}, prevState.event, {vaccinesReceived: vaccinesClone}),
                        isModified: true
                    }), () => {
                        // console.log("onChangeDropDown", id, " ", value, " ", this.state.event);
                    })
                }
            }
        }
    };
    handleOnChangeTextInputWithDropDown = (value, id, objectType, stateValue) => {
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
                    ageClone.months = Number(value)
                }

                this.setState(prevState => ({
                    event: Object.assign({}, prevState.event, {age: ageClone}, {dob: null}),
                    isModified: true
                }), () => {
                    // console.log("handleOnChangeTextInputWithDropDown done", id, " ", value, " ", this.state.event);
                })
            }
        }
    };
    handleOnChangeTextSwitchSelector = (index, stateValue) => {
        if (stateValue === 'selectedItemIndexForAgeUnitOfMeasureDropDown') {
            let ageClone = Object.assign({}, this.state.event.age);
            if (!this.props.isNew) {
                if (ageClone.years === 0 && ageClone.months !== 0) {
                    ageClone.years = ageClone.months
                } else if (ageClone.months === 0 && ageClone.years !== 0) {
                    ageClone.months = ageClone.years
                }
            }
            this.setState(prevState => ({
                [stateValue]: index,
                event: Object.assign({}, prevState.event, {dob: null}, {age: ageClone}),
                isModified: true
            }), () => {
                // console.log ('handleOnChangeTextSwitchSelector', stateValue, this.state[stateValue])
            })
        } else {
            this.setState({
                [stateValue]: index,
                isModified: true
            }, () => {
                // console.log ('handleOnChangeTextSwitchSelector', stateValue, this.state[stateValue])
            })
        }
    };

    calcDateDiff = (startdate, enddate) => {
        //define moments for the startdate and enddate
        let startdateMoment = moment(startdate);
        let enddateMoment = moment(enddate);

        if (startdateMoment.isValid() === true && enddateMoment.isValid() === true) {
            //getting the difference in years
            let years = enddateMoment.diff(startdateMoment, 'years');

            //moment returns the total months between the two dates, subtracting the years
            let months = enddateMoment.diff(startdateMoment, 'months') - (years * 12);

            //to calculate the days, first get the previous month and then subtract it
            startdateMoment.add(years, 'years').add(months, 'months');
            let days = enddateMoment.diff(startdateMoment, 'days');

            return nrOFYears = {
                months: months,
                years: years,
            };
        } else {
            return undefined;
        }
    };
    anotherPlaceOfResidenceChanged = () => {
        this.setState({
            anotherPlaceOfResidenceWasChosen: false
        })
    };
    ageAndDobPrepareForSave = () => {
        let dobClone = null;
        let ageClone = {years: 0, months: 0};

        if (this.state.event.dob !== null && this.state.event.dob !== undefined) {
            //get info from date
            dobClone = this.state.event.dob;
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
        } else if (this.state.selectedItemIndexForAgeUnitOfMeasureDropDown === 0 && this.state.event.dob === null) {
            //years dropdown
            ageClone.years = this.state.event.age.years
        } else if (this.state.selectedItemIndexForAgeUnitOfMeasureDropDown === 1 && this.state.event.dob === null) {
            //months dropdown
            ageClone.months = this.state.event.age.months
        }

        return {
            ageClone: ageClone,
            dobClone: dobClone
        }

    };

    //labData Questionnaire onChange... functions
    onChangeTextAnswer = (value, id, parentId, index) => {
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
        })
    };
    onChangeSingleSelection = (value, id, parentId, index) => {
        let questionnaireAnswers = _.cloneDeep(this.state.previousAnswers);

        if (parentId) {
            if (!questionnaireAnswers[parentId]) {
                questionnaireAnswers[parentId] = [];
            }
            if (questionnaireAnswers[parentId] && Array.isArray(questionnaireAnswers[parentId]) && questionnaireAnswers[parentId].length > 0 && questionnaireAnswers[parentId][0]) {
                if (!questionnaireAnswers[parentId][0].hasOwnProperty("subAnswers")) {
                    questionnaireAnswers[parentId][0] = Object.assign({}, questionnaireAnswers[parentId][0], {subAnswers: {}});
                }
                if (typeof questionnaireAnswers[parentId][0].subAnswers === "object" && Object.keys(questionnaireAnswers[parentId][0].subAnswers).length === 0) {
                    questionnaireAnswers[parentId][0].subAnswers = {};
                }
                if (!questionnaireAnswers[parentId][0].subAnswers[id]) {
                    questionnaireAnswers[parentId][0].subAnswers[id] = [];
                }
                if (lodashGet(value, 'subAnswers', null) !== null) {
                    questionnaireAnswers[parentId][0].subAnswers = Object.assign({}, questionnaireAnswers[parentId][0].subAnswers, value.subAnswers);
                    delete value.subAnswers;
                }
                questionnaireAnswers[parentId][0].subAnswers[id][0] = value;
            }
        } else {
            if (!questionnaireAnswers[id]) {
                questionnaireAnswers[id] = [];
            }
            questionnaireAnswers[id][0] = value;
        }
        this.setState(prevState => ({
                previousAnswers: questionnaireAnswers,
                isModified: true
            })
        )
    };
    onChangeMultipleSelection = (value, id, parentId, index) => {
        let questionnaireAnswers = _.cloneDeep(this.state.previousAnswers);

        if (parentId) {
            if (!questionnaireAnswers[parentId]) {
                questionnaireAnswers[parentId] = [];
            }
            if (questionnaireAnswers[parentId] && Array.isArray(questionnaireAnswers[parentId]) && questionnaireAnswers[parentId].length > 0 && questionnaireAnswers[parentId][0]) {
                if (!questionnaireAnswers[parentId][0].hasOwnProperty("subAnswers")) {
                    questionnaireAnswers[parentId][0] = Object.assign({}, questionnaireAnswers[parentId][0], {subAnswers: {}});
                }
                if (typeof questionnaireAnswers[parentId][0].subAnswers === "object" && Object.keys(questionnaireAnswers[parentId][0].subAnswers).length === 0) {
                    questionnaireAnswers[parentId][0].subAnswers = {};
                }
                if (!questionnaireAnswers[parentId][0].subAnswers[id]) {
                    questionnaireAnswers[parentId][0].subAnswers[id] = [];
                }
                if (lodashGet(value, 'subAnswers', null) !== null) {
                    questionnaireAnswers[parentId][0].subAnswers = Object.assign({}, questionnaireAnswers[parentId][0].subAnswers, value.subAnswers);
                    delete value.subAnswers;
                }
                questionnaireAnswers[parentId][0].subAnswers[id][0] = value;
            }
        } else {
            if (!questionnaireAnswers[id]) {
                questionnaireAnswers[id] = [];
            }
            questionnaireAnswers[id][0] = value;
        }
        this.setState(prevState => ({
                previousAnswers: questionnaireAnswers,
                isModified: true
            })
        )
    };
    onChangeDateAnswer = (value, id, parentId, index) => {
        let questionnaireAnswers = _.cloneDeep(this.state.previousAnswers);

        if (parentId) {
            if (!questionnaireAnswers[parentId]) {
                questionnaireAnswers[parentId] = [];
            }
            if (questionnaireAnswers[parentId] && Array.isArray(questionnaireAnswers[parentId]) && questionnaireAnswers[parentId].length > 0 && questionnaireAnswers[parentId][0]) {
                if (!questionnaireAnswers[parentId][0].hasOwnProperty("subAnswers")) {
                    questionnaireAnswers[parentId][0] = Object.assign({}, questionnaireAnswers[parentId][0], {subAnswers: {}});
                }
                if (typeof questionnaireAnswers[parentId][0].subAnswers === "object" && Object.keys(questionnaireAnswers[parentId][0].subAnswers).length === 0) {
                    questionnaireAnswers[parentId][0].subAnswers = {};
                }
                if (!questionnaireAnswers[parentId][0].subAnswers[id]) {
                    questionnaireAnswers[parentId][0].subAnswers[id] = [];
                }
                questionnaireAnswers[parentId][0].subAnswers[id][0] = value;
            }
        } else {
            if (!questionnaireAnswers[id]) {
                questionnaireAnswers[id] = [];
            }
            questionnaireAnswers[id][index] = value;
        }
        this.setState({
            previousAnswers: questionnaireAnswers,
            isModified: true
        }, () => {
            // console.log ('onChangeDateAnswer after setState', this.state.previousAnswers);
        })
    };
    onChangeAnswerDate = (value, questionId, index) => {
        let questionnaireAnswers = _.cloneDeep(this.state.previousAnswers);
        if (questionnaireAnswers && questionnaireAnswers[questionId] && Array.isArray(questionnaireAnswers[questionId]) && questionnaireAnswers[questionId].length) {
            if (questionnaireAnswers[questionId][0]) {
                questionnaireAnswers[questionId][0].date = value;
                if (!questionnaireAnswers[questionId][0].hasOwnProperty("subAnswers")) {
                    questionnaireAnswers[questionId][0] = Object.assign({}, questionnaireAnswers[questionId][0], {subAnswers: {}});
                }
                if (questionnaireAnswers[questionId][0].subAnswers && typeof questionnaireAnswers[questionId][0].subAnswers === "object" && Object.keys(questionnaireAnswers[questionId][0].subAnswers).length > 0) {
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
        }, () => {
            // console.log('~~~~~~~~~ onChangeAnswerDate', this.state.previousAnswers);
        });
    };

    onNavigatorEvent = (componentId, componentName) => {
        // if (_.isFunction(this.props.refresh)) {
        //     this.props.refresh();
        // }
        // navigation(event, this.props.navigator);
    };
    goToHelpScreen = () => {
        let pageAskingHelpFrom = null;
        if (this.props.isNew !== null && this.props.isNew !== undefined && this.props.isNew === true) {
            pageAskingHelpFrom = 'eventsSingleScreenAdd'
        } else {
            if (this.state.isEditMode === true) {
                pageAskingHelpFrom = 'eventsSingleScreenEdit'
            } else if (this.state.isEditMode === false) {
                pageAskingHelpFrom = 'eventsSingleScreenView'
            }
        }

        Navigation.showModal(createStackFromComponent({
            name: 'HelpScreen',
            passProps: {
                pageAskingHelpFrom: pageAskingHelpFrom
            }
        }));
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

        for (let question of sortedQuestions){
            if (question.variable && question.answerType !== "LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_MARKUP"){
                if (previousAnswersClone[question.variable]){
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
        let sortedQuestions = sortBy(cloneDeep(this.props.eventInvestigationQuestions), ['order', 'variable']);
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
        let sortedQuestions = sortBy(cloneDeep(this.props.eventInvestigationQuestions), ['order', 'variable']);
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
        user: lodashGet(state, 'user', {activeOutbreakId: null}),
        outbreak: lodashGet(state, 'outbreak', {_id: null}),
        screenSize: lodashGet(state, 'app.screenSize', config.designScreenSize),
        selectedScreen: lodashGet(state, 'app.selectedScreen', 0),
        eventInvestigationQuestions: lodashGet(state, 'outbreak.eventInvestigationTemplate', null),
        translation: lodashGet(state, 'app.translation', []),
        role: lodashGet(state, 'role', []),
        isDateOfOnsetRequired: _.get(state, 'outbreak.isDateOfOnsetRequired', null)
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        saveSelectedScreen,
        setDisableOutbreakChange
    }, dispatch);
}

export default compose(
    withPincode(),
    connect(mapStateToProps, matchDispatchProps)
)(EventSingleScreen);
