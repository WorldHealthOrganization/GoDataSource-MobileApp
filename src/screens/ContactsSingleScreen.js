/**
 * Created by florinpopa on 21/08/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {View, StyleSheet, Dimensions, Animated, Alert, Platform} from 'react-native';
import {Icon} from 'react-native-material-ui';
import styles from './../styles';
import NavBarCustom from './../components/NavBarCustom';
import {calculateDimension} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {getFollowUpsForOutbreakId, getMissedFollowUpsForOutbreakId} from './../actions/followUps';
import {TabBar, TabView, PagerScroll, PagerAndroid, SceneMap} from 'react-native-tab-view';
import ContactsSingleAddress from './../containers/ContactsSingleAddress';
import ContactsSingleCalendar from './../containers/ContactsSingleCalendar';
import ContactsSingleExposures from './../containers/ContactsSingleExposures';
import ContactsSinglePersonal from './../containers/ContactsSinglePersonal';
import ExposureScreen from './../screens/ExposureScreen';
import Breadcrumb from './../components/Breadcrumb';
import Menu, {MenuItem} from 'react-native-material-menu';
import Ripple from 'react-native-material-ripple';
import {addFollowUp, updateFollowUpAndContact, deleteFollowUp} from './../actions/followUps';
import {updateContact, deleteExposureForContact, addContact} from './../actions/contacts';
import {removeErrors} from './../actions/errors';
import DateTimePicker from 'react-native-modal-datetime-picker';
import _ from 'lodash';
import {extractIdFromPouchId, updateRequiredFields, navigation} from './../utils/functions';
import {getFollowUpsForContactRequest} from './../queries/followUps'
import ios from 'rn-fetch-blob/ios';
import moment from 'moment'

const initialLayout = {
    height: 0,
    width: Dimensions.get('window').width,
};

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
                riskLevel: '',
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
                dateOfReporting: new Date(),
                isDateOfReportingApproximate: false,
                relationships: [],
                addresses: [],
            } : Object.assign({}, this.props.contact),
            savePressed: false,
            deletePressed: false,
            isDateTimePickerVisible: false,
            canChangeScreen: false,
            anotherPlaceOfResidenceWasChosen: false,
            hasPlaceOfResidence: this.props.isNew ? false : true,
            selectedItemIndexForTextSwitchSelectorForAge: 0, // age/dob - switch tab
            selectedItemIndexForAgeUnitOfMeasureDropDown: this.props.isNew ? 0 : (this.props.contact.age && this.props.contact.age.years !== undefined && this.props.contact.age.years !== null && this.props.contact.age.years > 0) ? 0 : 1, //default age dropdown value
        };
        // Bind here methods, or at least don't declare methods in the render method
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    // PersonalRoute = () => (
    //     <ContactsSinglePersonal
    //         contact={this.state.contact}
    //         activeIndex={this.state.index}
    //         onChangeText={this.handleOnChangeText}
    //         onChangeDropDown={this.handleOnChangeDropDown}
    //         onChangeDate={this.handleOnChangeDate}
    //         onChangeSwitch={this.handleOnChangeSwitch}
    //     />
    // );
    // AddressRoute = () => (
    //     <ContactsSingleAddress
    //         contact={this.state.contact}
    //         activeIndex={this.state.index}
    //         onChangeText={this.handleOnChangeText}
    //         onChangeDropDown={this.handleOnChangeDropDown}
    //         onChangeDate={this.handleOnChangeDate}
    //         onChangeSwitch={this.handleOnChangeSwitch}
    //         onChangeSectionedDropDown={this.handleOnChangeSectionedDropDown}
    //         onDeletePress={this.handleOnDeletePress}
    //         onPressAddAdrress={this.handleOnPressAddAdrress}
    //     />
    // );
    // ExposureRoute = () => (
    //     <ContactsSingleExposures
    //         contact={this.state.contact}
    //         activeIndex={this.state.index}
    //     />
    // );
    // CalendarRoute = () => (
    //     <ContactsSingleCalendar
    //         contact={this.state.contact}
    //         activeIndex={this.state.index}
    //     />
    // );

    // Please add here the react lifecycle methods that you need
    static getDerivedStateFromProps(props, state) {
        // console.log("FollowUpsSingleScreen: ", state);
        if (props.errors && props.errors.type && props.errors.message) {
            Alert.alert(props.errors.type, props.errors.message, [
                {
                    text: 'Ok', onPress: () => {
                    state.savePressed = false;
                    props.removeErrors()
                }
                }
            ])
        } else {
            if (state.savePressed || state.deletePressed) {
                props.navigator.pop({
                    animated: true,
                    animationType: 'fade'
                })
            }
            // if (props.contacts && props.contact !== props.contacts[props.contacts.map((e) => {return e.id}).indexOf(props.contact.id)]) {
            //     props.contact = props.contacts[props.contacts.map((e) => {return e.id}).indexOf(props.contact.id)];
            // }
        }
        return null;
    }

    componentDidMount() {
        if (!this.props.isNew) {
            let ageClone = {years: 0, months: 0}
            let updateAge = false;
            if (this.props.contact.age === null || this.props.contact.age === undefined || this.props.contact.age.years === undefined || this.props.contact.age.years === null || this.props.contact.age.months === undefined || this.props.contact.age.months === null) {
                updateAge = true
            }
            if (updateAge) {
                this.setState(prevState => ({
                    contact: Object.assign({}, prevState.contact, {age: ageClone}, {dob: this.props.contact.dob !== undefined ? this.props.contact.dob : null}),
                }), () => {
                    console.log ('old contact with age as string update')
                })
            }

            getFollowUpsForContactRequest(this.props.user.activeOutbreakId, [extractIdFromPouchId(this.state.contact._id, 'person')], this.state.contact.followUp, (errorFollowUp, responseFollowUp) => {
                if (errorFollowUp) {
                    console.log ('getFollowUpsForContactRequest error: ', errorFollowUp)
                }
                if (responseFollowUp) {
                    console.log ('getFollowUpsForContactRequest response: ', JSON.stringify(responseFollowUp))
                    if (responseFollowUp.length > 0) {
                        let myContact = Object.assign({}, this.state.contact)
                        myContact.followUps = responseFollowUp
                        this.setState({
                            contact: myContact
                        }, () => {
                            console.log("After adding the followUps: ");
                        })
                    }
                }
            })
        }
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        // console.log("### contact from render ContactSingleScreen: ", this.state.contact);
        return (
            <View style={style.container}>
                <NavBarCustom
                    title={null}
                    customTitle={
                        <View
                            style={[style.breadcrumbContainer]}>
                            <Breadcrumb
                                entities={['Contacts', this.props.isNew ? "Add Contact" : ((this.props.contact && this.props.contact.firstName ? (this.props.contact.firstName + " ") : '') + (this.props.contact && this.props.contact.lastName ? this.props.contact.lastName : ''))]}
                                navigator={this.props.navigator}
                            />
                            <View>
                                <Menu
                                    ref="menuRef"
                                    button={
                                        <Ripple onPress={this.showMenu} hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
                                            <Icon name="more-vert"/>
                                        </Ripple>
                                    }
                                >
                                    {
                                        !this.props.isNew ? (
                                            <MenuItem onPress={this.handleOnPressDeceased}>Deceased</MenuItem>
                                        ) : null
                                    }
                                    {
                                        !this.props.isNew && !this.state.contact.deleted ? (
                                            <MenuItem onPress={this.handleOnPressDeleteContact}>Delete</MenuItem>
                                        ) : null
                                    }

                                    <DateTimePicker
                                        isVisible={this.state.isDateTimePickerVisible}
                                        onConfirm={this._handleDatePicked}
                                        onCancel={this._hideDateTimePicker}
                                    />
                                </Menu>
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
                    // renderPager={this.handleRenderPager}
                    useNativeDriver
                    initialLayout={initialLayout}
                    swipeEnabled = { this.props.isNew ? false : true}
                />
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
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
                this.setState({
                    canChangeScreen: false,
                    index
                });
            }
        } else {
            this.setState({
                index
            });
        }
    };

    handleMoveToNextScreenButton = () => {
        let nextIndex = this.state.index + 1

        this.setState({
            canChangeScreen: true,
        });
        this.handleOnIndexChange(nextIndex)
    }

    handleMoveToPrevieousScreenButton = () => {
        let nextIndex = this.state.index - 1

        this.setState({
            canChangeScreen: true,
        });

        this.handleOnIndexChange(nextIndex)
    }

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
            />
        )
    };

    handleRenderLabel = (props) => ({route, index}) => {
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
                {route.title}
            </Animated.Text>
        );
    };

    renderScene = ({route}) => {
        switch(route.key) {
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
                        onPressAddAdrress={this.handleOnPressAddAdrress}
                        handleMoveToNextScreenButton={this.handleMoveToNextScreenButton}
                        handleMoveToPrevieousScreenButton={this.handleMoveToPrevieousScreenButton}
                        checkRequiredFieldsAddresses={this.checkRequiredFieldsAddresses}
                        isNew={this.props.isNew}
                        anotherPlaceOfResidenceWasChosen={this.state.anotherPlaceOfResidenceWasChosen}
                        anotherPlaceOfResidenceChanged={this.anotherPlaceOfResidenceChanged}
                        hasPlaceOfResidence={this.state.hasPlaceOfResidence}
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
                        caseIdFromCasesScreen={this.props.caseIdFromCasesScreen}
                        navigator={this.props.navigator}
                        saveExposure={this.handleSaveExposure}
                        handleMoveToPrevieousScreenButton={this.handleMoveToPrevieousScreenButton}
                        isNew={this.props.isNew}
                        handleOnPressSave={this.handleOnPressSave}
                    />
                );
            case 'calendar':
                return (
                    <ContactsSingleCalendar
                        contact={this.state.contact}
                        activeIndex={this.state.index}
                    />
                );
            default:
                return (
                    <ContactsSinglePersonal
                        contact={this.state.contact}
                        onChangeText={this.handleOnChangeText}
                        onChangeDropDown={this.handleOnChangeDropDown}
                        onChangeDate={this.handleOnChangeDate}
                        onChangeSwitch={this.handleOnChangeSwitch}
                    />
                );
        }
    };

    handleSaveExposure = (exposure, isUpdate = false) => {
        console.log ('exposure', JSON.stringify(exposure))
        if (isUpdate === true){
            let relationships = _.cloneDeep(this.state.contact.relationships);
            if (relationships.map((e) => {return e._id}).indexOf(exposure._id) > -1){
                relationships[relationships.map((e) => {return e._id}).indexOf(exposure._id)] = exposure;
            }
            this.setState(prevState => ({
                contact: Object.assign({}, prevState.contact, {relationships})
            }), () => {
                console.log("After updating the exposure: ", this.state.contact);
            })
        } else {
            let relationships = []
            relationships.push(exposure);
            this.setState(prevState => ({
                contact: Object.assign({}, prevState.contact, {relationships})
            }), () => {
                console.log("After adding the exposure: ", this.state.contact);
            })
        }
    };

    handleOnChangeTextInputWithDropDown = (value, id, objectType, stateValue) => {
        console.log("handleOnChangeTextInputWithDropDown: ",value, id, objectType, stateValue, this.state.contact);

        if (stateValue !== undefined && stateValue !== null){
            if (id === 'age'){
                let ageClone = {years: 0, months: 0}

                if (!isNaN(Number(value)) && !value.includes(".") && !value.includes("-") && !value.includes(",") && !value.includes(" ")) {
                    ageClone.years = Number(value)
                    ageClone.months = Number(value)
                }

                this.setState(prevState => ({
                    contact: Object.assign({}, prevState.contact, {age: ageClone}, {dob: null}),
                }), () => {
                    console.log("handleOnChangeTextInputWithDropDown done", id, " ", value, " ", this.state.contact);
                })
            }
        }
    }

    handleOnChangeText = (value, id, objectType) => {
        console.log("onChangeText: ",value, id, objectType);
        //Change TextInput
        if (objectType === 'FollowUp') {
            this.setState(
                (prevState) => ({
                    item: Object.assign({}, prevState.item, {[id]: value})
                }), () => {
                    console.log("onChangeText", id, " ", value, " ", this.state.item);
                }
            )
        } else {
            if (objectType === 'Contact') {
                this.setState(
                    (prevState) => ({
                        contact: Object.assign({}, prevState.contact, {[id]: value})
                    }), () => {
                        console.log("onChangeText", id, " ", value, " ", this.state.contact);
                    }
                )
            } else {
                if (typeof objectType === 'phoneNumber' && objectType >= 0 || typeof objectType === 'number' && objectType >= 0) {
                    // Change address drop down
                    let addressesClone = _.cloneDeep(this.state.contact.addresses);
                    addressesClone[objectType][id] = value && value.value ? value.value : value;
                    console.log ('addressesClone', addressesClone)
                    this.setState(prevState => ({
                        contact: Object.assign({}, prevState.contact, {addresses: addressesClone})
                    }), () => {
                        console.log("onChangeText", id, " ", value, " ", this.state.contact);
                    })
                }
            }
        }
    };

    handleOnChangeTextSwitchSelector = (index, stateValue) => {
        if (stateValue === 'selectedItemIndexForAgeUnitOfMeasureDropDown') {
            let ageClone = Object.assign({}, this.state.contact.age)
            if (!this.props.isNew) {
                if (ageClone.years === 0 && ageClone.months !== 0) {
                    ageClone.years = ageClone.months
                } else if (ageClone.monthsyears === 0 && ageClone.years !== 0){
                    ageClone.months = ageClone.years
                }
            }
            this.setState(prevState => ({
                [stateValue]: index,
                contact: Object.assign({}, prevState.contact, {dob: null}, {age: ageClone}),

            }), () => {
                console.log ('handleOnChangeTextSwitchSelector', stateValue, this.state[stateValue])
            })
        } else {
            this.setState({
                [stateValue]: index,
            }, () => {
                console.log ('handleOnChangeTextSwitchSelector', stateValue, this.state[stateValue])
            })
        }
    }

    handleOnChangeDate = (value, id, objectType) => {
        console.log("onChangeDate: ", value, id, objectType);

        if (objectType === 'FollowUp') {
            this.setState(
                (prevState) => ({
                    item: Object.assign({}, prevState.item, {[id]: value})
                })
                , () => {
                    console.log("onChangeDate", id, " ", value, " ", this.state.item);
                }
            )
        } else {
            if (id === 'dob') {
                let today = new Date()
                let nrOFYears = this.calcDateDiff(today, value);
                let ageClone = {years: 0, months: 0}
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
                this.setState(prevState => ({
                    contact: Object.assign({}, prevState.contact, {age: ageClone}, {dob: value}),
                    selectedItemIndexForAgeUnitOfMeasureDropDown
                }), () => {
                    console.log("handleOnChangeDate dob", id, " ", value, " ", this.state.contact);
                })
            } else {
                if (objectType === 'Contact') {
                    this.setState(
                        (prevState) => ({
                            contact: Object.assign({}, prevState.contact, {[id]: value})
                        })
                        , () => {
                            console.log("onChangeDate", id, " ", value, " ", this.state.contact);
                        }
                    )
                } else {
                    if (typeof objectType === 'phoneNumber' && objectType >= 0 || typeof objectType === 'number' && objectType >= 0) {
                        // Change address date
                        let addressesClone = _.cloneDeep(this.state.contact.addresses);
                        addressesClone[objectType][id] = value && value.value ? value.value : value;
                        console.log ('addressesClone', addressesClone)
                        this.setState(prevState => ({
                            contact: Object.assign({}, prevState.contact, {addresses: addressesClone})
                        }), () => {
                            console.log("handleOnChangeDate", id, " ", value, " ", this.state.contact);
                        })
                    }
                }
            }
        }
    };

    calcDateDiff(today, dob) {
        let diff = Math.floor(today.getTime() - dob.getTime());
        let day = 1000 * 60 * 60 * 24;

        let days = Math.floor(diff/day);
        let months = Math.floor(days/31);
        let years = Math.floor(months/12);

        let nrOFYears = {
            months: months,
            years: years
        }
        return nrOFYears
    }

    handleOnChangeSwitch = (value, id, objectType) => {
        // console.log("onChangeSwitch: ", value, id, this.state.item);
        if (id === 'fillGeoLocation') {
            navigator.geolocation.getCurrentPosition((position) => {
                    this.setState(
                        (prevState) => ({
                            item: Object.assign({}, prevState.item, {[id]: value ? {lat: position.coords.latitude, lng: position.coords.longitude} : null })
                        }), () => {
                            console.log("onChangeSwitch", id, " ", value, " ", this.state.item);
                        }
                    )
                },
                (error) => {
                    Alert.alert("Alert", 'There was an issue with getting your location', [
                        {
                            text: 'Ok', onPress: () => {console.log("OK pressed")}
                        }
                    ])
                },
                {
                    enableHighAccuracy: true, timeout: 20000, maximumAge: 1000
                }
            )
        } else {
            if (objectType === 'FollowUp') {
                this.setState(
                    (prevState) => ({
                        item: Object.assign({}, prevState.item, {[id]: value})
                    }), () => {
                        console.log("onChangeSwitch", id, " ", value, " ", this.state.item);
                    }
                )
            } else {
                if (objectType === 'Contact') {
                    this.setState(
                        (prevState) => ({
                            contact: Object.assign({}, prevState.contact, {[id]: value})
                        }), () => {
                            console.log("onChangeSwitch", id, " ", value, " ", this.state.contact);
                        }
                    )
                }
            }
        }

    };

    handleOnChangeDropDown = (value, id, objectType) => {
        console.log("onChangeDropDown: ", value, id, objectType, this.state.contact);
        if (objectType === 'FollowUp' || id === 'address') {
            if (id === 'address') {
                if (!this.state.item[id]) {
                    this.state.item[id] = {};
                }

                let address = this.state.contact && this.state.contact.addresses && Array.isArray(this.state.contact.addresses) && this.state.contact.addresses.length > 0 ?
                    this.state.contact.addresses.filter((e) => { return value.includes(e.addressLine1 || '') && value.includes(e.addressLine2 || '') && value.includes(e.city || '') && value.includes(e.country || '') && value.includes(e.postalCode || '');
                    }) : [];

                this.setState(
                    (prevState) => ({
                        item: Object.assign({}, prevState.item, {[id]: address[0]})
                    }), () => {
                        console.log("onChangeDropDown", id, " ", value, " ", this.state.item);
                    }
                )
            } else {
                this.setState(
                    (prevState) => ({
                        item: Object.assign({}, prevState.item, {[id]: value})
                    }), () => {
                        console.log("onChangeDropDown", id, " ", value, " ", this.state.item);
                    }
                )
            }

        } else {
            if (objectType === 'Contact') {
                this.setState(
                    (prevState) => ({
                        contact: Object.assign({}, prevState.contact, {[id]: value && value.value ? value.value : value})
                    }), () => {
                        console.log("onChangeDropDown", id, " ", value, " ", this.state.contact);
                    }
                )
            } else {
                if (typeof objectType === 'number' && objectType >= 0) {
                    // Change address drop down
                    let addressesClone = _.cloneDeep(this.state.contact.addresses);

                    let anotherPlaceOfResidenceWasChosen = false
                    if (value && value.value){
                        if(value.value === config.userResidenceAddress.userPlaceOfResidence){
                            addressesClone.forEach(element => {
                                if (element[id] === value.value){
                                    element[id] = config.userResidenceAddress.userOtherResidence
                                    anotherPlaceOfResidenceWasChosen = true
                                }
                            });
                        }
                    }

                    addressesClone[objectType][id] = value && value.value ? value.value : value;
                    let hasPlaceOfResidence = false
                    let contactPlaceOfResidence = addressesClone.filter((e) => {return e.typeId === config.userResidenceAddress.userPlaceOfResidence})
                    if (contactPlaceOfResidence && contactPlaceOfResidence.length > 0) {
                        hasPlaceOfResidence = true
                    }

                    this.setState(prevState => ({
                        contact: Object.assign({}, prevState.contact, {addresses: addressesClone}),
                        anotherPlaceOfResidenceWasChosen,
                        hasPlaceOfResidence
                    }), () => {
                        console.log("onChangeDropDown", id, " ", value, " ", this.state.contact);
                    })
                }
            }
        }
    };

    anotherPlaceOfResidenceChanged = () => {
        this.setState({
            anotherPlaceOfResidenceWasChosen: false
        })
    }

    handleOnChangeSectionedDropDown = (selectedItems, index) => {
        console.log ('handleOnChangeSectionedDropDown', selectedItems, index)
        // Here selectedItems is always an array with just one value and should pe mapped to the locationId field from the address from index
        let addresses = _.cloneDeep(this.state.contact.addresses);
        addresses[index].locationId = extractIdFromPouchId(selectedItems['0'], 'location');
        this.setState(prevState => ({
            contact: Object.assign({}, prevState.contact, {addresses})
        }))
    };

    onChangeTextAnswer = (value, id) => {
        let itemClone = _.cloneDeep(this.state.item);
        let questionnaireAnswers = itemClone && itemClone.questionnaireAnswers ? itemClone.questionnaireAnswers : null;
        if (!itemClone.questionnaireAnswers) {
            itemClone.questionnaireAnswers = {};
            questionnaireAnswers = itemClone.questionnaireAnswers;
        }
        questionnaireAnswers[id] = value;
        this.setState(prevState => ({
            item: Object.assign({}, prevState.item, {questionnaireAnswers: questionnaireAnswers})
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
        this.setState(prevState => ({
            item: Object.assign({}, prevState.item, {questionnaireAnswers: questionnaireAnswers})
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
        this.setState(prevState => ({
            item: Object.assign({}, prevState.item, {questionnaireAnswers: questionnaireAnswers})
        }))
    };

    handleOnPressEditExposure = (relation, index) => {
        console.log('handleOnPressEditExposure: ', relation, index);
        this.props.navigator.showModal({
            screen: 'ExposureScreen',
            animated: true,
            passProps: {
                exposure: relation,
                contact: this.props.isNew ? null: this.props.contact,
                type: 'Contact',
                saveExposure: this.handleSaveExposure,
                addContactFromCasesScreen: this.props.addContactFromCasesScreen,
                caseIdFromCasesScreen: this.props.caseIdFromCasesScreen
            }
        })
    };

    handleOnPressDeleteExposure = (relation, index) => {
        if (this.state.contact.relationships.length === 1) {
            Alert.alert('Alert', "Cannot delete a contact's last exposure to a case or event", [
                {
                    text: 'Ok', onPress: () => {console.log("Ok pressed")}
                }
            ])
        } else {
            Alert.alert('Warning', 'Are you sure you want to delete the exposure?', [
                {
                    text: 'No', onPress: () => {console.log("Cancel delete")}
                },
                {
                    text: 'Yes', onPress: () => {
                    let relations = _.cloneDeep(this.state.contact.relationships);
                    if (relations && Array.isArray(relations) && relations.map((e) => {return e.id}).indexOf(relation.id) > -1) {
                        relations.splice(relations.map((e) => {return e.id}).indexOf(relation.id), 1);

                        this.setState(prevState => ({
                            contact: Object.assign({}, prevState.contact, {relationships: relations})
                        }), () => {
                            this.props.deleteExposureForContact(this.props.user.activeOutbreakId, this.props.contact.id, relation, this.props.user.token);
                        })
                    }
                }
                }
            ])
        }
    };

    handleOnPressSave = () => {
        // Check the required fields and then update the contact
        if (this.checkRequiredFields()) {
            if (this.checkAgeYearsRequirements()) {
                if (this.checkAgeMonthsRequirements()) {
                    if (this.state.hasPlaceOfResidence === true){
                        this.setState({
                            savePressed: true
                        }, () => {
                            this.hideMenu()
                            let ageConfig = this.ageAndDobPrepareForSave()
                            this.setState(prevState => ({
                                contact: Object.assign({}, prevState.contact, {age: ageConfig.ageClone}, {dob: ageConfig.dobClone}),
                            }), () => {
                                console.log("ageAndDobPrepareForSave done", this.state.contact);
                                if (this.props.isNew) {
                                    let contactWithRequiredFields = updateRequiredFields(outbreakId = this.props.user.activeOutbreakId, userId = this.props.user._id, record = Object.assign({}, this.state.contact), action = 'create', fileType = 'person.json', type = 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT')
                                    this.setState(prevState => ({
                                        contact: Object.assign({}, prevState.contact, contactWithRequiredFields)
                                    }), () => {
                                        let contactClone = _.cloneDeep(this.state.contact)
                                        let contactMatchFilter = this.checkIfContactMatchFilter()
                                        console.log('contactMatchFilter', contactMatchFilter)
                                        this.props.addContact(this.props.user.activeOutbreakId, contactClone, null, this.props.user.token, contactMatchFilter);
                                    })
                                } else {
                                    let contactWithRequiredFields = null;
                                    if (this.state.deletePressed === true) {
                                        contactWithRequiredFields = updateRequiredFields(outbreakId = this.props.user.activeOutbreakId, userId = this.props.user._id, record = Object.assign({}, this.state.contact), action = 'delete')
                                    } else {
                                        contactWithRequiredFields = updateRequiredFields(outbreakId = this.props.user.activeOutbreakId, userId = this.props.user._id, record = Object.assign({}, this.state.contact), action = 'update')
                                    }
                                    
                                    this.setState(prevState => ({
                                        contact: Object.assign({}, prevState.contact, contactWithRequiredFields)
                                    }), () => {
                                        let contactClone = _.cloneDeep(this.state.contact)
                                        let contactMatchFilter = this.checkIfContactMatchFilter()
                                        console.log('contactMatchFilter', contactMatchFilter)
                                        this.props.updateContact(this.props.user.activeOutbreakId, contactClone._id, contactClone, this.props.user.token, null, contactMatchFilter);
                                    })
                                }
                            })
                        });
                    } else {
                        Alert.alert("Validation error", 'Please add the place of residence address', [
                            {
                                text: 'Ok', onPress: () => {this.hideMenu()}
                            }
                        ])
                    }
                } else {
                    Alert.alert("Alert", 'Number of months must be between 0 and 11', [
                        {
                            text: 'Ok', onPress: () => {console.log("OK pressed")}
                        }
                    ])
                }
            } else {
            Alert.alert("Alert", 'Number of years must be between 0 and 150', [
                {
                    text: 'Ok', onPress: () => {console.log("OK pressed")}
                }
            ])
            }
        } else {
            Alert.alert("Validation error", 'Some of the required fields are missing. Please make sure you have completed them', [
                {
                    text: 'Ok', onPress: () => {this.hideMenu()}
                }
            ])
        }
    };

    ageAndDobPrepareForSave = () => {
        let dobClone = null
        let ageClone = { years: 0, months: 0 }

        if (this.state.contact.dob !== null) {
            //get info from date
            dobClone = this.state.contact.dob
            let today = new Date()
            let nrOFYears = this.calcDateDiff(today, dobClone);

            //calc age for save
            if (nrOFYears.years === 0 && nrOFYears.months >= 0) {
                ageClone.months = nrOFYears.months
            } else if (nrOFYears.years > 0) {
                ageClone.years = nrOFYears.years
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
       
    }

    handleOnPressDeceased = () => {
        console.log("### show date time picker: ");
        this._showDateTimePicker();
    };

    checkRequiredFieldsPersonalInfo = () => {
        for(let i=0; i<config.contactsSingleScreen.personal.length; i++) {
            for (let j=0; j<config.contactsSingleScreen.personal[i].fields.length; j++) {
                if (config.contactsSingleScreen.personal[i].fields[j].isRequired && !this.state.contact[config.contactsSingleScreen.personal[i].fields[j].id]) {
                    return false;
                }
            }
        }
        return true
    };

    checkRequiredFieldsAddresses = () => {
        if (this.state.contact && this.state.contact.addresses && Array.isArray(this.state.contact.addresses) && this.state.contact.addresses.length > 0) {
            for (let i=0; i < this.state.contact.addresses.length; i++) {
                for (let j=0; j<config.contactsSingleScreen.address.fields.length; j++) {
                    if (config.contactsSingleScreen.address.fields[j].isRequired && !this.state.contact.addresses[i][config.contactsSingleScreen.address.fields[j].id]) {
                        return false;
                    }
                }
            }
        } else {
            return false;
        }
        return true
    };

    checkRequiredFieldsRelationships = () => {
        if (!this.state.contact || !this.state.contact.relationships || !Array.isArray(this.state.contact.relationships) || this.state.contact.relationships.length < 1) {
            return false;
        }

        return true
    }

    checkAgeYearsRequirements = () => {
        if (this.state.selectedItemIndexForAgeUnitOfMeasureDropDown === 0) {
            if (this.state.contact.age && this.state.contact.age.years !== undefined && this.state.contact.age.years !== null) {
                if (this.state.contact.age.years < 0 || this.state.contact.age.years > 150) {
                    return false
                }
            }
        }
        return true
    }

    checkAgeMonthsRequirements = () => {
        if (this.state.selectedItemIndexForAgeUnitOfMeasureDropDown === 1) {
            if (this.state.contact.age && this.state.contact.age.years !== undefined && this.state.contact.age.years !== null) {
                if (this.state.contact.age.months < 0 || this.state.contact.age.months > 11) {
                    return false
                }
            }
        }
        return true
    }

    checkRequiredFields = () => {
        return this.checkRequiredFieldsPersonalInfo() && this.checkRequiredFieldsAddresses() && this.checkRequiredFieldsRelationships()
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
                contactCopy = contactCopy.filter((e) => {return e.gender === this.state.filterFromFilterScreen.gender});
            }
            // Take care of age range filter
            if (this.state.filterFromFilterScreen && this.state.filterFromFilterScreen.age && Array.isArray(this.state.filterFromFilterScreen.age) && this.state.filterFromFilterScreen.age.length === 2 && (this.state.filterFromFilterScreen.age[0] >= 0 || this.state.filterFromFilterScreen.age[1] <= 150)) {
                contactCopy = contactCopy.filter((e) => {
                    if (e.age && e.age.years !== null && e.age.years !== undefined && e.age.months !== null && e.age.months !== undefined) {
                        if (e.age.years > 0 && e.age.months === 0) {
                            return e.age.years >= this.state.filterFromFilterScreen.age[0] && e.age.years <= this.state.filterFromFilterScreen.age[1]
                        } else if (e.age.years === 0 && e.age.months > 0){
                            return e.age.months >= this.state.filterFromFilterScreen.age[0] && e.age.months <= this.state.filterFromFilterScreen.age[1]
                        } else if (e.age.years === 0 && e.age.months === 0) {
                            return e.age.years >= this.state.filterFromFilterScreen.age[0] && e.age.years <= this.state.filterFromFilterScreen.age[1]
                        }
                    }
                });
            }
            // Take care of locations filter
            if (this.state.filterFromFilterScreen  && this.state.filterFromFilterScreen.selectedLocations && this.state.filterFromFilterScreen.selectedLocations.length > 0) {
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
    }

    showMenu = () => {
        this.refs.menuRef.show();
    };

    hideMenu = () => {
        // this.refs['menuRef'].hide();
        this.refs.menuRef.hide();
    };

    _showDateTimePicker = () => {
        this.setState({ isDateTimePickerVisible: true });
    };

    _hideDateTimePicker = () => {
        this.setState({ isDateTimePickerVisible: false });
    };

    _handleDatePicked = (date) => {
        console.log("Date selected: ", date);
        this._hideDateTimePicker();

        this.setState(prevState => ({
            contact: Object.assign({}, prevState.contact, {deceased: true, dateDeceased: date})
        }), () => {
            this.handleOnPressSave();
        });
    };

    handleOnPressDeleteContact = () => {
        this.setState ({
            deletePressed: true
        }, () => {
            this.handleOnPressSave();
        })
    }

    handleOnDeletePress = (index) => {
        console.log("DeletePressed: ", index);
        let contactAddressesClone = _.cloneDeep(this.state.contact.addresses);
        contactAddressesClone.splice(index, 1);
        this.setState(prevState => ({
            contact: Object.assign({}, prevState.contact, {addresses: contactAddressesClone})
        }), () => {
            console.log("After deleting the address: ", this.state.contact);
        })
    };

    handleOnPressAddAdrress = () => {
        let addresses = _.cloneDeep(this.state.contact.addresses);

        addresses.push({
            typeId: '',
            country: '',
            city: '',
            addressLine1: '',
            addressLine2: '',
            postalCode: '',
            locationId: '',
            geoLocation: {
                lat: 0,
                lng: 0
            },
            date: new Date()
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
        user: state.user,
        screenSize: state.app.screenSize,
        followUps: state.followUps,
        outbreak: state.outbreak,
        errors: state.errors,
        contacts: state.contacts,
        filter: state.app.filters,
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        getFollowUpsForOutbreakId,
        getMissedFollowUpsForOutbreakId,
        addFollowUp,
        updateFollowUpAndContact,
        deleteFollowUp,
        updateContact,
        addContact,
        deleteExposureForContact,
        removeErrors
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(ContactsSingleScreen);