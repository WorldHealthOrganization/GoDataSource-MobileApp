/**
 * Created by florinpopa on 21/08/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, { Component } from 'react';
import { View, StyleSheet, Dimensions, Animated, Alert, Platform, BackHandler } from 'react-native';
import { Icon } from 'react-native-material-ui';
import styles from './../styles';
import NavBarCustom from './../components/NavBarCustom';
import ViewHOC from './../components/ViewHOC';
import config from './../utils/config';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { TabBar, TabView, PagerScroll, PagerAndroid, SceneMap } from 'react-native-tab-view';
import ContactsSingleAddress from './../containers/ContactsSingleAddress';
import ContactsSingleCalendar from './../containers/ContactsSingleCalendar';
import ContactsSingleExposures from './../containers/ContactsSingleExposures';
import ContactsSinglePersonal from './../containers/ContactsSinglePersonal';
import ExposureScreen from './../screens/ExposureScreen';
import { getContactsNameForDuplicateCheckRequest, checkForNameDuplicatesRequest } from './../queries/contacts'
import Breadcrumb from './../components/Breadcrumb';
import Menu, { MenuItem } from 'react-native-material-menu';
import Ripple from 'react-native-material-ripple';
import { updateFollowUpAndContact, deleteFollowUp, addFollowUp } from './../actions/followUps';
import { updateContact, deleteExposureForContact, addContact } from './../actions/contacts';
import { removeErrors } from './../actions/errors';
import DateTimePicker from 'react-native-modal-datetime-picker';
import _ from 'lodash';
import { calculateDimension, extractIdFromPouchId, updateRequiredFields, navigation, getTranslation, createDate, daysSince } from './../utils/functions';
import { getFollowUpsForContactRequest } from './../queries/followUps'
import moment from 'moment'
import translations from './../utils/translations'
import ElevatedView from 'react-native-elevated-view';
import AddFollowUpScreen from './AddFollowUpScreen';
import {generateId} from "../utils/functions";

const initialLayout = {
    height: 0,
    width: Dimensions.get('window').width,
};

// let callGetDerivedStateFromProps = true;

class ContactsSingleScreen extends Component {

    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
            interactionComplete: false,
            routes: this.props.isNew ? config.tabsValuesRoutes.contactsAdd : config.tabsValuesRoutes.contactsSingle,
            index: 0,
            item: this.props.item,
            filter: this.props.filter && this.props.filter['FollowUpsScreen'] ? this.props.filter['FollowUpsScreen'] : {
                searchText: ''
            },
            filterFromFilterScreen: this.props.filter && this.props.filter['ContactsFilterScreen'] ? this.props.filter['ContactsFilterScreen'] : null,
            contact: this.props.isNew ? {
                riskLevel: null,
                riskReason: '',
                outbreakId: this.props.user && this.props.user.activeOutbreakId ? this.props.user.activeOutbreakId : '',
                firstName: '',
                middleName: '',
                lastName: '',
                gender: '',
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
                        outbreakId: this.props.user.activeOutbreakId ? this.props.user.activeOutbreakId : '',
                        contactDate: createDate(null),
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
                addresses: [
                    {
                        typeId: config.userResidenceAddress.userPlaceOfResidence,
                        country: '',
                        city: '',
                        addressLine1: '',
                        addressLine2: '',
                        postalCode: '',
                        locationId: '',
                        phoneNumber: '',
                        geoLocation: {
                            coordinates: [0, 0],
                            type: 'Point'
                        },
                        date: createDate(null)
                    }
                ],
            } : Object.assign({}, this.props.contact),
            savePressed: false,
            deletePressed: false,
            loading: false,
            isModified: false,
            isDateTimePickerVisible: false,
            canChangeScreen: false,
            anotherPlaceOfResidenceWasChosen: false,
            hasPlaceOfResidence: true,
            updateExposure: false,
            isEditMode: true,
            selectedItemIndexForTextSwitchSelectorForAge: 0, // age/dob - switch tab
            selectedItemIndexForAgeUnitOfMeasureDropDown: this.props.isNew ? 0 : (this.props.contact && this.props.contact.age && this.props.contact.age.years !== undefined && this.props.contact.age.years !== null && this.props.contact.age.years > 0) ? 0 : 1, //default age dropdown value
            showAddFollowUpScreen: false
        };
        // Bind here methods, or at least don't declare methods in the render method
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    };

    // Please add here the react lifecycle methods that you need
    componentDidUpdate(prevProps) {
        if (this.state.savePressed || this.state.deletePressed) {
            if (this.props.handleUpdateContactFromFollowUp !== undefined && this.props.handleUpdateContactFromFollowUp !== null) {
                const { contact } = this.state;
                this.props.handleUpdateContactFromFollowUp(contact)
            }
            this.props.navigator.pop();
        }

        if ((this.props.isNew === false || this.props.isNew === undefined) && this.state.updateExposure === true){
            let updatedContact = this.props.contacts[this.props.contacts.map((e) => {return e._id}).indexOf(this.state.contact._id)];
            if (updatedContact !== undefined && updatedContact !== null) {
                this.setState(prevState => ({
                    contact: Object.assign({}, this.state.contact, {relationships: updatedContact.relationships}),
                    updateExposure: false
                }));
            }
        }

        if (this.state.loading === true) {
            this.setState({
                loading: false
            })
        }
    }


    // static getDerivedStateFromProps(props, state) {
    //     if (callGetDerivedStateFromProps === true){
    //         console.log("getDerivedStateFromProps - ContactsSingleScreen");
    //         if (props.errors && props.errors.type && props.errors.message) {
    //             Alert.alert(props.errors.type, props.errors.message, [
    //                 {
    //                     text: getTranslation(translations.alertMessages.okButtonLabel, props.translation),
    //                     onPress: () => {
    //                         state.savePressed = false;
    //                         props.removeErrors()
    //                     }
    //                 }
    //             ])
    //         } else {
    //             if (state.savePressed || state.deletePressed) {
    //                 if (props.handleUpdateContactFromFollowUp !== undefined && props.handleUpdateContactFromFollowUp !== null) {
    //                     const { contact } = state
    //                     props.handleUpdateContactFromFollowUp(contact)
    //                 }
    //                 props.navigator.pop()
    //             }
    //             // if (props.contacts && props.contact !== props.contacts[props.contacts.map((e) => {return e.id}).indexOf(props.contact.id)]) {
    //             //     props.contact = props.contacts[props.contacts.map((e) => {return e.id}).indexOf(props.contact.id)];
    //             // }
    //         }
    //
    //         if ((props.isNew === false || props.isNew === undefined) && state.updateExposure === true){
    //             let updatedContact = props.contacts[props.contacts.map((e) => {return e._id}).indexOf(state.contact._id)]
    //             if (updatedContact !== undefined && updatedContact !== null) {
    //                 state.contact.relationships = updatedContact.relationships
    //                 state.updateExposure = false
    //             }
    //         }
    //
    //         if (state.loading === true) {
    //             state.loading = false
    //         }
    //     } else {
    //         callGetDerivedStateFromProps = true
    //     }
    //
    //     return null;
    // };

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        if (!this.props.isNew) {
            let ageClone = { years: 0, months: 0 };
            let updateAge = false;
            if (!this.props.contact || this.props.contact.age === null || this.props.contact.age === undefined || (this.props.contact.age.years === undefined && this.props.contact.age.months === undefined)) {
                updateAge = true
            }
            if (updateAge) {
                // callGetDerivedStateFromProps = false;
                this.setState(prevState => ({
                    contact: Object.assign({}, prevState.contact, { age: ageClone }, { dob: this.props.contact.dob !== undefined ? this.props.contact.dob : null }),
                }), () => {
                    console.log('old contact with age as string update')
                })
            }

            //permissions check
            let isEditMode = true
            if (this.props.role && this.props.role.find((e) => e === config.userPermissions.writeContact) !== undefined) {
                isEditMode = true
            } else if (this.props.role && this.props.role.find((e) => e === config.userPermissions.writeContact) === undefined && this.props.role.find((e) => e === config.userPermissions.readContact) !== undefined) {
                isEditMode = false
            }
            // callGetDerivedStateFromProps = false;
            this.setState({
                isEditMode
            })

            if (this.props.user !== null) {
                getFollowUpsForContactRequest(this.props.user.activeOutbreakId, [extractIdFromPouchId(this.state.contact._id, 'person')], this.state.contact.followUp, this.props.teams, (errorFollowUp, responseFollowUp) => {
                    if (errorFollowUp) {
                        console.log('getFollowUpsForContactRequest error: ', errorFollowUp)
                    }
                    if (responseFollowUp) {
                        // console.log ('getFollowUpsForContactRequest response: ', JSON.stringify(responseFollowUp))
                        if (responseFollowUp.length > 0) {
                            let myContact = Object.assign({}, this.state.contact)
                            myContact.followUps = responseFollowUp;
                            // callGetDerivedStateFromProps = false;
                            this.setState({
                                contact: myContact
                            }, () => {
                                console.log("After adding the followUps: ");
                            })
                        }
                    }
                })
            }
        } else if (this.props.isNew === true) {
            let personsArray = []
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
                }]

                let relationshipsClone = _.cloneDeep(this.state.contact.relationships)
                relationshipsClone[0].persons = personsArray
                // callGetDerivedStateFromProps = false;
                this.setState(prevState => ({
                    contact: Object.assign({}, prevState.contact, { relationships: relationshipsClone })
                }), () => {
                    console.log('After changing state componentDidMount: ', this.state.contact);
                })
            }
        }
    };

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    };

    handleBackButtonClick() {
        // this.props.navigator.goBack(null);
        if (this.state.isModified === true) {
            Alert.alert("", 'You have unsaved data. Are you sure you want to leave this page and lose all changes?', [
                {
                    text: 'Yes', onPress: () => {
                        this.props.navigator.pop(
                            //     {
                            //     animated: true,
                            //     animationType: 'fade'
                            // }
                        )
                    }
                },
                {
                    text: 'Cancel', onPress: () => {
                        console.log("onPressCancelEdit No pressed - nothing changes")
                    }
                }
            ])
        } else {
            this.props.navigator.pop(
                //     {
                //     animated: true,
                //     animationType: 'fade'
                // }
            )
        }
        return true;
    };

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        // console.log("### contact from render ContactSingleScreen: ", this.state.contact);

        if (this.props.errors && this.props.errors.type && this.props.errors.message) {
            Alert.alert(this.props.errors.type, this.props.errors.message, [
                {
                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                    onPress: () => {
                        this.setState({
                            savePressed: false
                        }, () => {
                            this.props.removeErrors();
                        });
                    }
                }
            ])
        }

        return (
            <ViewHOC style={style.container}
                showLoader={this && this.state && this.state.loading}
                loaderText={this.props && this.props.syncState ? 'Loading' : getTranslation(translations.loadingScreenMessages.loadingMsg, this.props.translation)}>
                <NavBarCustom
                    title={null}
                    customTitle={
                        <View
                            style={[style.breadcrumbContainer]}>
                            <Breadcrumb
                                entities={[getTranslation(this.props && this.props.previousScreen ? this.props.previousScreen : translations.contactSingleScreen.title, this.props.translation), this.props.isNew ? getTranslation(translations.contactSingleScreen.addContactTitle, this.props.translation) : ((this.props.contact && this.props.contact.firstName ? (this.props.contact.firstName + " ") : '') + (this.props.contact && this.props.contact.lastName ? this.props.contact.lastName : ''))]}
                                navigator={this.props.navigator}
                                onPress={this.handlePressBreadcrumb}
                            />
                            <View style={{ flexDirection: 'row', marginRight: calculateDimension(16, false, this.props.screenSize) }}>
                                <ElevatedView
                                    elevation={3}
                                    style={{
                                        backgroundColor: styles.buttonGreen,
                                        width: calculateDimension(33, false, this.props.screenSize),
                                        height: calculateDimension(25, true, this.props.screenSize),
                                        borderRadius: 4
                                    }}
                                >
                                    <Ripple style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }} onPress={this.goToHelpScreen}>
                                        <Icon name="help" color={'white'} size={15} />
                                    </Ripple>
                                </ElevatedView>
                                {
                                    this.props.role && this.props.role.find((e) => e === config.userPermissions.writeContact) !== undefined ? (
                                        <View>
                                            <Menu
                                                ref="menuRef"
                                                button={
                                                    <Ripple onPress={this.showMenu} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                                        <Icon name="more-vert" />
                                                    </Ripple>
                                                }
                                            >
                                                {
                                                    !this.props.isNew ? (
                                                        <MenuItem onPress={this.handleOnPressDeceased}>
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
                                                {/*{*/}
                                                    {/*!this.props.isNew && !this.state.contact.deleted ? (*/}
                                                        {/*<MenuItem onPress={this.handleOnPressDeleteContact}>*/}
                                                            {/*{getTranslation(translations.contactSingleScreen.deleteContactLabel, this.props.translation)}*/}
                                                        {/*</MenuItem>*/}
                                                    {/*) : null*/}
                                                {/*}*/}
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
                                }
                            </View>
                        </View>
                    }
                    navigator={this.props.navigator}
                    iconName="menu"
                    handlePressNavbarButton={this.handlePressNavbarButton}
                />
                <TabView
                    navigationState={this.state}
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
        return (Platform.OS === 'ios') ? <PagerScroll {...props} swipeEnabled={false} animationEnabled={false} /> :
            <PagerScroll {...props} swipeEnabled={false} animationEnabled={false} />
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
        })
    };

    handleOnSavePressed = (date) => {
        // Here contact={label: <name>, value: <contactId>} and date is a regular date
        let now = createDate(null);
        date = createDate(date);
        let followUp = {
            _id: 'followUp.json_' + this.props.user.activeOutbreakId + '_' + date.getTime() + '_' + generateId(),
            statusId: config.followUpStatuses.notPerformed,
            targeted: false,
            date: date,
            fileType: 'followUp.json',
            outbreakId: this.props.user.activeOutbreakId,
            index: daysSince(_.get(this.state, 'contact.followUp.startDate', null), now) + 1,
            personId: extractIdFromPouchId(this.state.contact._id, 'person.json')
        };

        followUp = updateRequiredFields(this.props.user.outbreakId, this.props.user._id, followUp, 'create', 'followUp.json');

        this.setState({
            showAddFollowUpScreen: !this.state.showAddFollowUpScreen
        }, () => {
            this.props.addFollowUp(this.props.user.activeOutbreakId, this.state.contact._id, followUp, this.state.filter, this.props.teams, this.props.user.token);
        });
    };

    handlePressNavbarButton = () => {
        this.props.navigator.toggleDrawer({
            side: 'left',
            animated: true,
            to: 'open'
        })
    };

    handleOnIndexChange = (index) => {
        if (this.props.isNew) {
            if (this.state.canChangeScreen) {
                // callGetDerivedStateFromProps = false;
                this.setState({
                    canChangeScreen: false,
                    index
                });
            }
        } else {
            // callGetDerivedStateFromProps = false;
            this.setState({
                index
            });
        }
    };

    handleMoveToNextScreenButton = () => {
        let nextIndex = this.state.index + 1;

        // callGetDerivedStateFromProps = false;
        this.setState({
            canChangeScreen: true,
        });
        this.handleOnIndexChange(nextIndex)
    };

    handleMoveToPrevieousScreenButton = () => {
        let nextIndex = this.state.index - 1
        // callGetDerivedStateFromProps = false;
        this.setState({
            canChangeScreen: true,
        });

        this.handleOnIndexChange(nextIndex)
    };

    handleRenderTabBar = (props) => {
        return (
            <TabBar
                {...props}
                indicatorStyle={{
                    backgroundColor: styles.buttonGreen,
                    height: 2
                }}
                style={{
                    height: 41,
                    backgroundColor: 'white'
                }}
                renderLabel={this.handleRenderLabel(props)}
                scrollEnabled={true}
                bounces={true}
            />
        )
    };

    handleRenderLabel = (props) => ({ route, index }) => {
        const inputRange = props.navigationState.routes.map((x, i) => i);

        const outputRange = inputRange.map(
            inputIndex => (inputIndex === index ? styles.colorLabelActiveTab : styles.colorLabelInactiveTab)
        );
        const color = props.position.interpolate({
            inputRange,
            outputRange: outputRange,
        });

        return (
            <Animated.Text style={{
                fontFamily: 'Roboto-Medium',
                fontSize: 12,
                color: color,
                flex: 1,
                alignSelf: 'center'
            }}>
                {getTranslation(route.title, this.props.translation).toUpperCase()}
            </Animated.Text>
        );
    };

    renderScene = ({ route }) => {
        switch (route.key) {
            case 'personal':
                return (
                    <ContactsSinglePersonal
                        contact={this.state.contact}
                        activeIndex={this.state.index}
                        onChangeText={this.handleOnChangeText}
                        onChangeDropDown={this.handleOnChangeDropDown}
                        onChangeDate={this.handleOnChangeDate}
                        onChangeSwitch={this.handleOnChangeSwitch}
                        onChangeextInputWithDropDown={this.handleOnChangeTextInputWithDropDown}
                        handleMoveToNextScreenButton={this.handleMoveToNextScreenButton}
                        checkRequiredFieldsPersonalInfo={this.checkRequiredFieldsPersonalInfo}
                        isNew={this.props.isNew}
                        onChangeTextSwitchSelector={this.handleOnChangeTextSwitchSelector}
                        selectedItemIndexForTextSwitchSelectorForAge={this.state.selectedItemIndexForTextSwitchSelectorForAge}
                        selectedItemIndexForAgeUnitOfMeasureDropDown={this.state.selectedItemIndexForAgeUnitOfMeasureDropDown}
                        checkAgeMonthsRequirements={this.checkAgeMonthsRequirements}
                        checkAgeYearsRequirements={this.checkAgeYearsRequirements}
                        isEditMode={this.state.isEditMode}
                    />
                );
            case 'address':
                return (
                    <ContactsSingleAddress
                        contact={this.state.contact}
                        activeIndex={this.state.index}
                        onChangeText={this.handleOnChangeText}
                        onChangeDropDown={this.handleOnChangeDropDown}
                        onChangeDate={this.handleOnChangeDate}
                        onChangeSwitch={this.handleOnChangeSwitch}
                        onChangeSectionedDropDown={this.handleOnChangeSectionedDropDown}
                        onDeletePress={this.handleOnDeletePress}
                        onPressCopyAddress={this.handleOnPressCopyAddress}
                        onPressAddAdrress={this.handleOnPressAddAdrress}
                        handleMoveToNextScreenButton={this.handleMoveToNextScreenButton}
                        handleMoveToPrevieousScreenButton={this.handleMoveToPrevieousScreenButton}
                        checkRequiredFieldsAddresses={this.checkRequiredFieldsAddresses}
                        isNew={this.props.isNew}
                        anotherPlaceOfResidenceWasChosen={this.state.anotherPlaceOfResidenceWasChosen}
                        hasPlaceOfResidence={this.state.hasPlaceOfResidence}
                        isEditMode={this.state.isEditMode}
                    />
                );
            case 'exposures':
                return (
                    <ContactsSingleExposures
                        contact={this.state.contact}
                        activeIndex={this.state.index}
                        onPressEditExposure={this.handleOnPressEditExposure}
                        onPressDeleteExposure={this.handleOnPressDeleteExposure}
                        addContactFromCasesScreen={this.props.addContactFromCasesScreen}
                        navigator={this.props.navigator}
                        saveExposure={this.handleSaveExposure}
                        handleMoveToPrevieousScreenButton={this.handleMoveToPrevieousScreenButton}
                        isNew={this.props.isNew}
                        handleOnPressSave={this.handleOnPressSave}
                        isEditMode={this.state.isEditMode}
                        onChangeText={this.handleOnChangeText}
                        onChangeDropDown={this.handleOnChangeDropDown}
                        onChangeDate={this.handleOnChangeDate}
                        onChangeSwitch={this.handleOnChangeSwitch}
                        handleMoveToNextScreenButton={this.handleMoveToNextScreenButton}
                    />
                );
            case 'calendar':
                return (
                    <ContactsSingleCalendar
                        contact={this.state.contact}
                        activeIndex={this.state.index}
                        handleOnPressSave={this.handleOnPressSave}
                        handleMoveToPrevieousScreenButton={this.handleMoveToPrevieousScreenButton}
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
                        this.props.navigator.pop(
                            //     {
                            //     animated: true,
                            //     animationType: 'fade'
                            // }
                        )
                    }
                },
                {
                    text: 'Cancel', onPress: () => {
                        console.log("onPressCancelEdit No pressed - nothing changes")
                    }
                }
            ])
        } else {
            this.props.navigator.pop(
                //     {
                //     animated: true,
                //     animationType: 'fade'
                // }
            );
        }
    };

    handleSaveExposure = (exposure, isUpdate = false) => {
        // callGetDerivedStateFromProps = false;
        this.setState({
            loading: true,
            updateExposure: true
        }, () => {
            console.log('exposure', JSON.stringify(exposure))
            // if (isUpdate === true){
            //     let relationships = _.cloneDeep(this.state.contact.relationships);
            //     if (relationships.map((e) => {return e._id}).indexOf(exposure._id) > -1){
            //         relationships[relationships.map((e) => {return e._id}).indexOf(exposure._id)] = exposure;
            //     }
            //     this.setState(prevState => ({
            //         contact: Object.assign({}, prevState.contact, {relationships})
            //     }), () => {
            //         console.log("After updating the exposure: ", this.state.contact);
            //     })
            // } else {
            //     let relationships = []
            //     relationships.push(exposure);
            //     this.setState(prevState => ({
            //         contact: Object.assign({}, prevState.contact, {relationships})
            //     }), () => {
            //         console.log("After adding the exposure: ", this.state.contact);
            //     })
            // }
        })
    };

    handleOnChangeTextInputWithDropDown = (value, id, objectType, stateValue) => {
        console.log("handleOnChangeTextInputWithDropDown: ", value, id, objectType, stateValue, this.state.contact);

        if (stateValue !== undefined && stateValue !== null) {
            if (id === 'age') {
                let ageClone = { years: 0, months: 0 };

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
                // callGetDerivedStateFromProps = false;
                this.setState(prevState => ({
                    contact: Object.assign({}, prevState.contact, { age: ageClone }, { dob: null }),
                    isModified: true
                }), () => {
                    console.log("handleOnChangeTextInputWithDropDown done", id, " ", value, " ", this.state.contact);
                })
            }
        }
    };

    handleOnChangeText = (value, id, objectType) => {
        console.log("onChangeText: ", value, id, objectType);
        //Change TextInput
        if (objectType === 'FollowUp') {
            // callGetDerivedStateFromProps = false;
            this.setState(
                (prevState) => ({
                    item: Object.assign({}, prevState.item, { [id]: value }),
                    isModified: true
                }))
        } else {
            if (objectType === 'Contact') {
                // callGetDerivedStateFromProps = false;
                this.setState(
                    (prevState) => ({
                        contact: Object.assign({}, prevState.contact, { [id]: value }),
                        isModified: true
                    }))
            } else if (objectType === 'Exposure' && this.props.isNew === true) {
                let relationshipsClone = _.cloneDeep(this.state.contact.relationships);
                relationshipsClone[0][id] = value && value.value ? value.value : value;
                // callGetDerivedStateFromProps = false;
                this.setState(prevState => ({
                    contact: Object.assign({}, prevState.contact, { relationships: relationshipsClone }),
                    isModified: true
                }))
            } else if (typeof objectType === 'phoneNumber' && objectType >= 0 || typeof objectType === 'number' && objectType >= 0) {
                let addressesClone = _.cloneDeep(this.state.contact.addresses);
                if (id === 'lng') {
                    if (!addressesClone[objectType].geoLocation) {
                        addressesClone[objectType].geoLocation = {};
                        addressesClone[objectType].geoLocation.type = 'Point';
                        if (!addressesClone[objectType].geoLocation.coordinates) {
                            addressesClone[objectType].geoLocation.coordinates = [];
                        }
                    }
                    if (!addressesClone[objectType].geoLocation.coordinates) {
                        addressesClone[objectType].geoLocation.coordinates = [];
                    }
                    if (!addressesClone[objectType].geoLocation.type) {
                        addressesClone[objectType].geoLocation.type = 'Point';
                    }
                    addressesClone[objectType].geoLocation.coordinates[0] = value && value.value ? value.value : parseFloat(value);
                } else if (id === 'lat') {
                    if (!addressesClone[objectType].geoLocation) {
                        addressesClone[objectType].geoLocation = {};
                        addressesClone[objectType].geoLocation.type = 'Point';
                        if (!addressesClone[objectType].geoLocation.coordinates) {
                            addressesClone[objectType].geoLocation.coordinates = [];
                        }
                    }
                    if (!addressesClone[objectType].geoLocation.coordinates) {
                        addressesClone[objectType].geoLocation.coordinates = [];
                    }
                    if (!addressesClone[objectType].geoLocation.type) {
                        addressesClone[objectType].geoLocation.type = 'Point';
                    }
                    addressesClone[objectType].geoLocation.coordinates[1] = value && value.value ? value.value : parseFloat(value);
                } else {
                    addressesClone[objectType][id] = value && value.value ? value.value : value;
                }
                // callGetDerivedStateFromProps = false;
                this.setState(prevState => ({
                    contact: Object.assign({}, prevState.contact, { addresses: addressesClone }),
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
            // callGetDerivedStateFromProps = false;
            this.setState(prevState => ({
                [stateValue]: index,
                contact: Object.assign({}, prevState.contact, { dob: null }, { age: ageClone }),
                isModified: true
            }), () => {
                console.log('handleOnChangeTextSwitchSelector', stateValue, this.state[stateValue])
            })
        } else {
            // callGetDerivedStateFromProps = false;
            this.setState({
                [stateValue]: index,
                isModified: true
            }, () => {
                console.log('handleOnChangeTextSwitchSelector', stateValue, this.state[stateValue])
            })
        }
    };

    handleOnChangeDate = (value, id, objectType) => {
        console.log("onChangeDate: ", value, id, objectType);

        if (objectType === 'FollowUp') {
            // callGetDerivedStateFromProps = false;
            this.setState(
                (prevState) => ({
                    item: Object.assign({}, prevState.item, { [id]: value }),
                    isModified: true
                })
                , () => {
                    console.log("onChangeDate", id, " ", value, " ", this.state.item);
                }
            )
        } else {
            if (id === 'dob') {
                let today = createDate(null);
                let nrOFYears = this.calcDateDiff(value, today);
                if (nrOFYears !== undefined && nrOFYears !== null) {
                    let ageClone = { years: 0, months: 0 }
                    let selectedItemIndexForAgeUnitOfMeasureDropDown = 0

                    if (nrOFYears.years === 0 && nrOFYears.months >= 0) {
                        ageClone.months = nrOFYears.months
                        ageClone.years = nrOFYears.months
                        selectedItemIndexForAgeUnitOfMeasureDropDown = 1
                    } else {
                        if (nrOFYears.years > 0) {
                            ageClone.months = nrOFYears.years
                            ageClone.years = nrOFYears.years
                            selectedItemIndexForAgeUnitOfMeasureDropDown = 0
                        }
                    }
                    console.log('ageClone', ageClone)
                    // callGetDerivedStateFromProps = false;
                    this.setState(prevState => ({
                        contact: Object.assign({}, prevState.contact, { age: ageClone }, { dob: value }),
                        selectedItemIndexForAgeUnitOfMeasureDropDown,
                        isModified: true
                    }), () => {
                        console.log("handleOnChangeDate dob", id, " ", value, " ", this.state.contact);
                    })
                }
            } else {
                if (objectType === 'Contact') {
                    // callGetDerivedStateFromProps = false;
                    this.setState(
                        (prevState) => ({
                            contact: Object.assign({}, prevState.contact, { [id]: value }),
                            isModified: true
                        })
                        , () => {
                            console.log("onChangeDate", id, " ", value, " ", this.state.contact);
                        }
                    )
                } else if (objectType === 'Exposure' && this.props.isNew === true) {
                    let relationshipsClone = _.cloneDeep(this.state.contact.relationships);
                    relationshipsClone[0][id] = value && value.value ? value.value : value;
                    // callGetDerivedStateFromProps = false;
                    this.setState(prevState => ({
                        contact: Object.assign({}, prevState.contact, { relationships: relationshipsClone }),
                        isModified: true
                    }))
                } else if (typeof objectType === 'phoneNumber' && objectType >= 0 || typeof objectType === 'number' && objectType >= 0) {
                    let addressesClone = _.cloneDeep(this.state.contact.addresses);
                    addressesClone[objectType][id] = value && value.value ? value.value : value;
                    console.log ('addressesClone', addressesClone)
                    // callGetDerivedStateFromProps = false;
                    this.setState(prevState => ({
                        contact: Object.assign({}, prevState.contact, { addresses: addressesClone }),
                        isModified: true
                    }), () => {
                        console.log("handleOnChangeDate", id, " ", value, " ", this.state.contact);
                    })
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


            console.log('calcDateDiff', { months: months, years: years })
            return nrOFYears = {
                months: months,
                years: years,
            };
        }
        else {
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
                                contact: Object.assign({}, prevState.contact, { addresses: addressesClone }),
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
                            navigator.geolocation.getCurrentPosition((position) => {
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
                                            contact: Object.assign({}, prevState.contact, { addresses: addressesClone }),
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
                                            onPress: () => { console.log("OK pressed") }
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
                                    contact: Object.assign({}, prevState.contact, { addresses: addressesClone }),
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
                // callGetDerivedStateFromProps = false;
                this.setState(
                    (prevState) => ({
                        item: Object.assign({}, prevState.item, { [id]: value }),
                        isModified: true
                    }), () => {
                        console.log("onChangeSwitch", id, " ", value, " ", this.state.item);
                    }
                )
            } else {
                if (objectType === 'Contact') {
                    // callGetDerivedStateFromProps = false;
                    this.setState(
                        (prevState) => ({
                            contact: Object.assign({}, prevState.contact, { [id]: value }),
                            isModified: true
                        }), () => {
                            console.log("onChangeSwitch", id, " ", value, " ", this.state.contact);
                        }
                    )
                } else if (objectType === 'Exposure' && this.props.isNew === true) {
                    let relationshipsClone = _.cloneDeep(this.state.contact.relationships);
                    relationshipsClone[0][id] = value && value.value ? value.value : value;
                    // callGetDerivedStateFromProps = false;
                    this.setState(prevState => ({
                        contact: Object.assign({}, prevState.contact, { relationships: relationshipsClone }),
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

                // callGetDerivedStateFromProps = false;
                this.setState(
                    (prevState) => ({
                        item: Object.assign({}, prevState.item, { [id]: address[0] }),
                        isModified: true
                    }), () => {
                        console.log("onChangeDropDown", id, " ", value, " ", this.state.item);
                    }
                )
            } else {
                // callGetDerivedStateFromProps = false;
                this.setState(
                    (prevState) => ({
                        item: Object.assign({}, prevState.item, { [id]: value }),
                        isModified: true
                    }), () => {
                        console.log("onChangeDropDown", id, " ", value, " ", this.state.item);
                    }
                )
            }
        } else if (objectType === 'Contact') {
            // callGetDerivedStateFromProps = false;
            this.setState(
                (prevState) => ({
                    contact: Object.assign({}, prevState.contact, { [id]: value && value.value !== undefined ? value.value : value }),
                    isModified: true
                }), () => {
                    console.log("onChangeDropDown", id, " ", value, " ", this.state.contact);
                }
            )
        } else if (type && type === 'Exposure' && this.props.isNew === true) {
            let relationshipsClone = _.cloneDeep(this.state.contact.relationships);
            relationshipsClone[0][id] = value && value.value !== undefined  ? value.value : value;
            // callGetDerivedStateFromProps = false;
            this.setState(prevState => ({
                contact: Object.assign({}, prevState.contact, { relationships: relationshipsClone }),
                isModified: true
            }), () => {
                console.log('After changing state handleOnChangeDropDown: ', this.state.contact);
            })
        } else if (typeof objectType === 'number' && objectType >= 0) {
            if (type && type === 'Address') {
                let addressesClone = _.cloneDeep(this.state.contact.addresses);

                let anotherPlaceOfResidenceWasChosen = false;
                if (value && value.value !== undefined) {
                    if (value.value === config.userResidenceAddress.userPlaceOfResidence) {
                        addressesClone.forEach(element => {
                            if (element[id] === value.value) {
                                element[id] = config.userResidenceAddress.userOtherResidence
                                anotherPlaceOfResidenceWasChosen = true
                            }
                        });
                    }
                }

                addressesClone[objectType][id] = value && value.value !== undefined ? value.value : value;
                let hasPlaceOfResidence = false;
                let contactPlaceOfResidence = addressesClone.filter((e) => { return e.typeId === config.userResidenceAddress.userPlaceOfResidence });
                if (contactPlaceOfResidence && contactPlaceOfResidence.length > 0) {
                    hasPlaceOfResidence = true
                }
                // callGetDerivedStateFromProps = false;
                this.setState(prevState => ({
                    contact: Object.assign({}, prevState.contact, { addresses: addressesClone }),
                    isModified: true,
                    anotherPlaceOfResidenceWasChosen,
                    hasPlaceOfResidence
                }), () => {
                    console.log("onChangeDropDown", id, " ", value, " ", this.state.contact);
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
            if (selectedItems['0'].geoLocation && selectedItems['0'].geoLocation.coordinates && Array.isArray(selectedItems['0'].geoLocation.coordinates)) {
                if (selectedItems['0'].geoLocation.coordinates[0] !== 0 || selectedItems['0'].geoLocation.coordinates[1] !== 0) {
                    setTimeout(() => {
                        Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.replaceCurrentCoordinates, this.props.translation), [
                            {
                                text: getTranslation(translations.alertMessages.cancelButtonLabel, this.props.translation), onPress: () => { console.log('Cancel pressed') }
                            },
                            {
                                text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation), onPress: () => {
                                    addresses[index].geoLocation = selectedItems['0'].geoLocation;
                                    console.log('Addresses biatch: ', addresses);
                                    // callGetDerivedStateFromProps = false;
                                    this.setState(prevState => ({
                                        contact: Object.assign({}, prevState.contact, { addresses }),
                                        isModified: true
                                    }))
                                }
                            }
                        ])
                    }, 200);
                }
            } else {
                console.log('Addresses biatch: ', addresses);
                // callGetDerivedStateFromProps = false;
                this.setState(prevState => ({
                    contact: Object.assign({}, prevState.contact, { addresses }),
                    isModified: true
                }))
            }
        }
    };

    onChangeTextAnswer = (value, id) => {
        let itemClone = _.cloneDeep(this.state.item);
        let questionnaireAnswers = itemClone && itemClone.questionnaireAnswers ? itemClone.questionnaireAnswers : null;
        if (!itemClone.questionnaireAnswers) {
            itemClone.questionnaireAnswers = {};
            questionnaireAnswers = itemClone.questionnaireAnswers;
        }
        questionnaireAnswers[id] = value;
        // callGetDerivedStateFromProps = false;
        this.setState(prevState => ({
            item: Object.assign({}, prevState.item, { questionnaireAnswers: questionnaireAnswers }),
            isModified: true
        }))
    };

    onChangeSingleSelection = (value, id) => {
        let itemClone = _.cloneDeep(this.state.item);
        let questionnaireAnswers = itemClone && itemClone.questionnaireAnswers ? itemClone.questionnaireAnswers : null;
        if (!itemClone.questionnaireAnswers) {
            itemClone.questionnaireAnswers = {};
            questionnaireAnswers = itemClone.questionnaireAnswers;
        }
        questionnaireAnswers[id] = value.value;
        // callGetDerivedStateFromProps = false;
        this.setState(prevState => ({
            item: Object.assign({}, prevState.item, { questionnaireAnswers: questionnaireAnswers }),
            isModified: true
        }))
    };

    onChangeMultipleSelection = (selections, id) => {
        let itemClone = Object.assign({}, this.state.item);
        let questionnaireAnswers = itemClone && itemClone.questionnaireAnswers ? itemClone.questionnaireAnswers : null;
        if (!itemClone.questionnaireAnswers) {
            itemClone.questionnaireAnswers = {};
            questionnaireAnswers = itemClone.questionnaireAnswers;
        }
        questionnaireAnswers[id] = selections.map((e) => {return e.value});
        // callGetDerivedStateFromProps = false;
        this.setState(prevState => ({
            item: Object.assign({}, prevState.item, { questionnaireAnswers: questionnaireAnswers }),
            isModified: true
        }))
    };

    handleOnPressEditExposure = (relation, index) => {
        console.log('handleOnPressEditExposure: ', relation, index);
        this.props.navigator.showModal({
            screen: 'ExposureScreen',
            animated: true,
            passProps: {
                exposure: relation,
                contact: this.props.isNew ? null : this.props.contact,
                type: 'Contact',
                saveExposure: this.handleSaveExposure,
                caseIdFromCasesScreen: this.props.caseIdFromCasesScreen
            }
        })
    };

    handleOnPressDeleteExposure = (relation, index) => {
        if (this.state.contact.relationships.length === 1) {
            Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.contactDeleteLastExposureError, this.props.translation), [
                {
                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                    onPress: () => { console.log("Ok pressed") }
                }
            ])
        } else {
            Alert.alert(getTranslation(translations.alertMessages.warningLabel, this.props.translation), getTranslation(translations.alertMessages.contactDeleteExposureConfirmation, this.props.translation), [
                {
                    text: getTranslation(translations.alertMessages.cancelButtonLabel, this.props.translation),
                    onPress: () => { console.log("Cancel delete") }
                },
                {
                    text: getTranslation(translations.alertMessages.yesButtonLabel, this.props.translation),
                    onPress: () => {
                        let relations = _.cloneDeep(this.state.contact.relationships);
                        console.log('Relations after cloneDeep: ', relations, relation);
                        if (relations && Array.isArray(relations) && relations.map((e) => { return e._id }).indexOf(relation._id) > -1) {
                            relations.splice(relations.map((e) => { return e._id }).indexOf(relation._id), 1);
                            console.log('Relations after splice: ', relations);
                            // callGetDerivedStateFromProps = false;
                            this.setState(prevState => ({
                                contact: Object.assign({}, prevState.contact, { relationships: relations })
                            }), () => {
                                relation = updateRequiredFields(this.props.user.activeOutbreakId, this.props.user._id, Object.assign({}, relation), 'delete');
                                this.props.deleteExposureForContact(this.props.user.activeOutbreakId, this.props.contact._id, relation, this.props.user.token, this.props.teams);
                            })
                        }
                    }
                }
            ])
        }
    };

    handleOnPressSave = () => {
        this.setState({
            loading: true
        }, () => {
            let relationshipsMissingFields = this.checkFields();
            if (relationshipsMissingFields && Array.isArray(relationshipsMissingFields) && relationshipsMissingFields.length === 0) {
                let missingFields = this.checkRequiredFields();
                if (missingFields && Array.isArray(missingFields) && missingFields.length === 0) {
                    if (this.checkAgeYearsRequirements()) {
                        if (this.checkAgeMonthsRequirements()) {
                            if (this.state.contact.addresses === undefined || this.state.contact.addresses === null || this.state.contact.addresses.length === 0 ||
                                (this.state.contact.addresses.length > 0 && this.state.hasPlaceOfResidence === true)) {
                                const { contact } = this.state
                                checkForNameDuplicatesRequest(this.props.isNew ? null : contact._id, contact.firstName, contact.lastName, this.props.user.activeOutbreakId, (error, response) => {
                                    if (error) {
                                        console.log('getContactsNameForDuplicateCheckRequest error: ', error);
                                        this.setState({
                                            loading: false
                                        }, () => {
                                            Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), getTranslation(translations.alertMessages.checkForDuplicatesRequestError, this.props.translation), [
                                                {
                                                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                                                    onPress: () => { this.hideMenu() }
                                                }
                                            ])
                                        })
                                    }
                                    if (response) {
                                        console.log('getContactsNameForDuplicateCheckRequest response: ', response);
                                        if (response.length === 0) {
                                            this.saveContactAction()
                                        } else {
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
                                                    onPress: () => { this.saveContactAction() }
                                                }
                                            ])
                                        }
                                    }
                                });
                            } else {
                                this.setState({ loading: false }, () => {
                                    Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), getTranslation(translations.alertMessages.placeOfResidenceError, this.props.translation), [
                                        {
                                            text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                                            onPress: () => { this.hideMenu() }
                                        }
                                    ])
                                })
                            }
                        } else {
                            this.setState({ loading: false }, () => {
                                Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), getTranslation(translations.alertMessages.monthsValueError, this.props.translation), [
                                    {
                                        text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                                        onPress: () => { console.log("OK pressed") }
                                    }
                                ])
                            })
                        }
                    } else {
                        this.setState({ loading: false }, () => {
                            Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), getTranslation(translations.alertMessages.yearsValueError, this.props.translation), [
                                {
                                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                                    onPress: () => { console.log("OK pressed") }
                                }
                            ])
                        })
                    }
                } else {
                    this.setState({ loading: false }, () => {
                        Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), `${getTranslation(translations.alertMessages.requiredFieldsMissingError, this.props.translation)}.\n${getTranslation(translations.alertMessages.missingFields, this.props.translation)}: ${missingFields}`, [
                            {
                                text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                                onPress: () => { this.hideMenu() }
                            }
                        ])
                    })
                }
            } else {
                this.setState({ loading: false }, () => {
                    Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), `${getTranslation(translations.alertMessages.requiredFieldsMissingError, this.props.translation)}.\n${getTranslation(translations.alertMessages.missingFields, this.props.translation)}: ${relationshipsMissingFields}`, [
                        {
                            text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                            onPress: () => { this.hideMenu() }
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
            this.hideMenu()
            let ageConfig = this.ageAndDobPrepareForSave()
            this.setState(prevState => ({
                contact: Object.assign({}, prevState.contact, { age: ageConfig.ageClone }, { dob: ageConfig.dobClone }),
            }), () => {
                console.log("ageAndDobPrepareForSave done", this.state.contact);
                if (this.props.isNew) {
                    let contactWithRequiredFields = updateRequiredFields(outbreakId = this.props.user.activeOutbreakId, userId = this.props.user._id, record = Object.assign({}, this.state.contact), action = 'create', fileType = 'person.json', type = 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT')
                    this.setState(prevState => ({
                        contact: Object.assign({}, prevState.contact, contactWithRequiredFields),
                    }), () => {
                        let contactClone = _.cloneDeep(this.state.contact)
                        let contactMatchFilter = this.checkIfContactMatchFilter()
                        console.log('contactMatchFilter', contactMatchFilter)
                        this.props.addContact(this.props.user.activeOutbreakId, contactClone, null, this.props.user.token, contactMatchFilter);
                    })
                } else {
                    let contactWithRequiredFields = null;
                    if (this.state.deletePressed === true) {
                        contactWithRequiredFields = updateRequiredFields(outbreakId = this.props.user.activeOutbreakId, userId = this.props.user._id, record = Object.assign({}, this.state.contact), action = 'delete', fileType = 'person.json', type = 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT')
                    } else {
                        contactWithRequiredFields = updateRequiredFields(outbreakId = this.props.user.activeOutbreakId, userId = this.props.user._id, record = Object.assign({}, this.state.contact), action = 'update', fileType = 'person.json', type = 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT')
                    }

                    this.setState(prevState => ({
                        contact: Object.assign({}, prevState.contact, contactWithRequiredFields),
                    }), () => {
                        let contactClone = _.cloneDeep(this.state.contact)
                        let contactMatchFilter = this.checkIfContactMatchFilter()
                        console.log('contactMatchFilter', contactMatchFilter)
                        this.props.updateContact(this.props.user.activeOutbreakId, contactClone._id, contactClone, this.props.user.token, null, contactMatchFilter, this.props.teams);
                    })
                }
            })
        });
    }

    ageAndDobPrepareForSave = () => {
        let dobClone = null
        let ageClone = { years: 0, months: 0 }

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

    handleOnPressDeceased = () => {
        console.log("### show date time picker: ");
        this._showDateTimePicker();
    };

    checkRequiredFieldsPersonalInfo = () => {
        let personalInfo = [];
        for (let i = 0; i < config.contactsSingleScreen.personal.length; i++) {
            for (let j = 0; j < config.contactsSingleScreen.personal[i].fields.length; j++) {
                if (config.contactsSingleScreen.personal[i].fields[j].isRequired && !this.state.contact[config.contactsSingleScreen.personal[i].fields[j].id]) {
                    personalInfo.push(getTranslation(config.contactsSingleScreen.personal[i].fields[j].label, this.props.translation));
                    // return false;
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
                for (let j = 0; j < config.contactsSingleScreen.address.fields.length; j++) {
                    if (config.contactsSingleScreen.address.fields[j].isRequired && !this.state.contact.addresses[i][config.contactsSingleScreen.address.fields[j].id]) {
                        addresses.push(getTranslation(config.contactsSingleScreen.address.fields[j].label, this.props.translation));
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
        for (let i = 0; i < config.addExposureScreen.length; i++) {
            if (config.addExposureScreen[i].id === 'exposure') {
                if (this.state.contact.relationships[0].persons.length === 0) {
                    requiredFields.push('Person')
                    // pass = false;
                }
            } else {
                if (config.addExposureScreen[i].isRequired) {
                    if (!this.state.contact.relationships[0][config.addExposureScreen[i].id]) {
                        requiredFields.push(getTranslation(config.addExposureScreen[i].label, this.props.translation));
                        // pass = false;
                    }
                }
            }
        }
        return requiredFields;
        // return pass;
    }

    checkRequiredFieldsRelationships = () => {
        if (!this.state.contact || !this.state.contact.relationships || !Array.isArray(this.state.contact.relationships) || this.state.contact.relationships.length < 1) {
            return false;
        }
        return true
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

    checkRelationships = () => {
        if (this.state && this.state.contact) {
            if (!this.state.contact.relationships || !Array.isArray(this.state.contact.relationships) || this.state.contact.relationships.length === 0) {
                return false;
            }
        }
        return true;
    };

    checkIfContactMatchFilter = () => {
        if (this.props.filter && (this.props.filter['ContactsFilterScreen'] || this.props.filter['FollowUpsScreen'])) {
            let contactCopy = [_.cloneDeep(this.state.contact)]

            // Take care of search filter
            if (this.state.filter.searchText) {
                contactCopy = contactCopy.filter((e) => {
                    return e && e.firstName && this.state.filter.searchText.toLowerCase().includes(e.firstName.toLowerCase()) ||
                        e && e.lastName && this.state.filter.searchText.toLowerCase().includes(e.lastName.toLowerCase()) ||
                        e && e.firstName && e.firstName.toLowerCase().includes(this.state.filter.searchText.toLowerCase()) ||
                        e && e.lastName && e.lastName.toLowerCase().includes(this.state.filter.searchText.toLowerCase())
                });
            }

            // Take care of gender filter
            if (this.state.filterFromFilterScreen && this.state.filterFromFilterScreen.gender) {
                contactCopy = contactCopy.filter((e) => { return e.gender === this.state.filterFromFilterScreen.gender });
            }
            // Take care of age range filter
            if (this.state.filterFromFilterScreen && this.state.filterFromFilterScreen.age && Array.isArray(this.state.filterFromFilterScreen.age) && this.state.filterFromFilterScreen.age.length === 2 && (this.state.filterFromFilterScreen.age[0] >= 0 || this.state.filterFromFilterScreen.age[1] <= 150)) {
                contactCopy = contactCopy.filter((e) => {
                    if (e.age && e.age.years !== null && e.age.years !== undefined && e.age.months !== null && e.age.months !== undefined) {
                        if (e.age.years > 0 && e.age.months === 0) {
                            return e.age.years >= this.state.filterFromFilterScreen.age[0] && e.age.years <= this.state.filterFromFilterScreen.age[1]
                        } else if (e.age.years === 0 && e.age.months > 0) {
                            return e.age.months >= this.state.filterFromFilterScreen.age[0] && e.age.months <= this.state.filterFromFilterScreen.age[1]
                        } else if (e.age.years === 0 && e.age.months === 0) {
                            return e.age.years >= this.state.filterFromFilterScreen.age[0] && e.age.years <= this.state.filterFromFilterScreen.age[1]
                        }
                    }
                });
            }
            // Take care of locations filter
            if (this.state.filterFromFilterScreen && this.state.filterFromFilterScreen.selectedLocations && this.state.filterFromFilterScreen.selectedLocations.length > 0) {
                contactCopy = contactCopy.filter((e) => {
                    let addresses = e.addresses.filter((k) => {
                        return k.locationId !== '' && this.state.filterFromFilterScreen.selectedLocations.indexOf(k.locationId) >= 0
                    })
                    return addresses.length > 0
                })
            }
            if (contactCopy.length > 0) {
                return true
            } else {
                return false
            }
        } else {
            return true
        }
    };

    showMenu = () => {
        this.refs.menuRef.show();
    };

    hideMenu = () => {
        // this.refs['menuRef'].hide();
        this.refs.menuRef.hide();
    };

    _showDateTimePicker = () => {
        // callGetDerivedStateFromProps = false;
        this.setState({ isDateTimePickerVisible: true });
    };

    _hideDateTimePicker = () => {
        // callGetDerivedStateFromProps = false;
        this.setState({ isDateTimePickerVisible: false });
    };

    _handleDatePicked = (date) => {
        console.log("Date selected: ", date);
        this._hideDateTimePicker();

        // callGetDerivedStateFromProps = false;
        this.setState(prevState => ({
            contact: Object.assign({}, prevState.contact, { deceased: true, dateDeceased: createDate(date) })
        }), () => {
            this.handleOnPressSave();
        });
    };

    handleOnPressDeleteContact = () => {
        // callGetDerivedStateFromProps = false;
        this.setState ({
            deletePressed: true
        }, () => {
            this.handleOnPressSave();
        })
    };

    handleOnDeletePress = (index) => {
        // console.log("DeletePressed: ", index);

        Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.deleteAddress, this.props.translation), [
            {
                text: getTranslation(translations.generalLabels.noAnswer, this.props.translation), onPress: () => { console.log('Cancel pressed') }
            },
            {
                text: getTranslation(translations.generalLabels.yesAnswer, this.props.translation), onPress: () => {
                    let contactAddressesClone = _.cloneDeep(this.state.contact.addresses);
                    contactAddressesClone.splice(index, 1);

                    let hasPlaceOfResidence = false
                    let contactPlaceOfResidence = contactAddressesClone.find((e) => { return e.typeId === config.userResidenceAddress.userPlaceOfResidence })
                    if (contactPlaceOfResidence !== undefined) {
                        hasPlaceOfResidence = true
                    }
                    // callGetDerivedStateFromProps = false;
                    this.setState(prevState => ({
                        contact: Object.assign({}, prevState.contact, { addresses: contactAddressesClone }),
                        hasPlaceOfResidence
                    }), () => {
                        console.log("After deleting the address: ", this.state.contact);
                    })
                }
            }
        ]);
    };

    handleOnPressCopyAddress = (index) => {
        Alert.alert(
            getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.copyAddress, this.props.translation), [
                {
                    text: getTranslation(translations.generalLabels.noAnswer, this.props.translation), onPress: () => { console.log('Cancel pressed') }
                },
                {
                    text: getTranslation(translations.generalLabels.yesAnswer, this.props.translation), onPress: () => {
                        let contactsCopy = _.cloneDeep(this.state.contact);
                        _.set(contactsCopy, `addresses[${index}]`, this.props.caseAddress);
                        this.setState({
                            contact: contactsCopy
                        })
                    }
                }
            ]
        );
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
            geoLocation: {
                coordinates: [0, 0],
                type: 'Point'
            },
            date: createDate(null)
        });
        // callGetDerivedStateFromProps = false;
        this.setState(prevState => ({
            contact: Object.assign({}, prevState.contact, { addresses })
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

        this.props.navigator.showModal({
            screen: 'HelpScreen',
            animated: true,
            passProps: {
                pageAskingHelpFrom: pageAskingHelpFrom
            }
        });
    }
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    breadcrumbContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
});

function mapStateToProps(state) {
    return {
        teams: state.teams,
        user: state.user,
        role: state.role,
        screenSize: state.app.screenSize,
        followUps: state.followUps,
        errors: state.errors,
        contacts: state.contacts,
        filter: state.app.filters,
        translation: state.app.translation
    };
};

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        updateFollowUpAndContact,
        deleteFollowUp,
        updateContact,
        addContact,
        deleteExposureForContact,
        removeErrors,
        addFollowUp
    }, dispatch);
};

export default connect(mapStateToProps, matchDispatchProps)(ContactsSingleScreen);