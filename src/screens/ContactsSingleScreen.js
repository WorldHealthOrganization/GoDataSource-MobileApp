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
import {extractIdFromPouchId, updateRequiredFields} from './../utils/functions';

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
            deleteContactButtonPressed: false,
            contact: this.props.isNew ? {
                riskLevel: '',
                riskReason: '',
                outbreakId: this.props.user && this.props.user.activeOutbreakId ? this.props.user.activeOutbreakId : '',
                firstName: '',
                middleName: '',
                lastName: '',
                gender: '',
                occupation: '',
                dob: new Date(),
                dateOfReporting: new Date(),
                isDateOfReportingApproximate: false,
                relationships: [],
                addresses: [],
            } : Object.assign({}, this.props.contact),
            savePressed: false,
            deletePressed: false,
            isDateTimePickerVisible: false,
            canChangeScreen: false,
            saveContactAtFirstNextButtonPress: true,
        };
        // Bind here methods, or at least don't declare methods in the render method
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
                                    <MenuItem onPress={this.handleOnPressSave}>Save</MenuItem>
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

    handleMoveToNextScreenButton = (AdressesNextButtonPressed = false) => {
        let nextIndex = this.state.index + 1

        // if (this.state.saveContactAtFirstNextButtonPress === true && AdressesNextButtonPressed === true) {
        //     this.props.addContact(this.props.user.activeOutbreakId, this.state.contact, this.props.user.token);
        //     this.setState({
        //         saveContactAtFirstNextButtonPress: false,
        //     });
        // } else if (this.state.saveContactAtFirstNextButtonPress === false && AdressesNextButtonPressed === true){
        //     this.props.updateContact(this.props.user.activeOutbreakId, this.state.contact.id, this.state.contact, this.props.user.token);
        // }

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
                        handleMoveToNextScreenButton={this.handleMoveToNextScreenButton}
                        checkRequiredFieldsPersonalInfo={this.checkRequiredFieldsPersonalInfo}
                        isNew={this.props.isNew}
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
                    />
                );
            case 'exposures':
                return (
                    <ContactsSingleExposures
                        contact={this.state.contact}
                        activeIndex={this.state.index}
                        onPressEditExposure={this.handleOnPressEditExposure}
                        onPressDeleteExposure={this.handleOnPressDeleteExposure}
                        navigator={this.props.navigator}
                        saveExposure={this.handleSaveExposure}
                        handleMoveToPrevieousScreenButton={this.handleMoveToPrevieousScreenButton}
                        isNew={this.props.isNew}
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
        if (isUpdate === false){
            let relationships = _.cloneDeep(this.state.contact.relationships);
            relationships.push(exposure);
            this.setState(prevState => ({
                contact: Object.assign({}, prevState.contact, {relationships})
            }), () => {
                console.log("After adding the exposure: ", this.state.contact);
            })
        } else {
            relationships = []
            relationships.push(exposure);
            this.setState(prevState => ({
                contact: Object.assign({}, prevState.contact, {relationships})
            }), () => {
                console.log("After updating the exposure: ", this.state.contact);
            })
        }
    };

    handleOnChangeText = (value, id, objectType) => {
        console.log("onChangeText: ", objectType);
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
                        console.log("onChangeDropDown", id, " ", value, " ", this.state.contact);
                    })
                }
            }
        }
    };

    handleOnChangeDate = (value, id, objectType) => {
        console.log("onChangeDate: ", value, id);

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
            if (objectType === 'Contact') {
                this.setState(
                    (prevState) => ({
                        contact: Object.assign({}, prevState.contact, {[id]: value})
                    })
                    , () => {
                        console.log("onChangeDate", id, " ", value, " ", this.state.contact);
                    }
                )
            }
        }
    };

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

                let address = this.state.contact && this.state.contact.addresses &&
                Array.isArray(this.state.contact.addresses) && this.state.contact.addresses.length > 0 ? this.state.contact.addresses.filter((e) => {
                    return value.includes(e.addressLine1 || '') && value.includes(e.addressLine2 || '') && value.includes(e.city || '') && value.includes(e.country || '') && value.includes(e.postalCode || '');
                })
                    : [];

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
                    addressesClone[objectType][id] = value && value.value ? value.value : value;
                    this.setState(prevState => ({
                        contact: Object.assign({}, prevState.contact, {addresses: addressesClone})
                    }), () => {
                        console.log("onChangeDropDown", id, " ", value, " ", this.state.contact);
                    })
                }
            }
        }
    };

    handleOnChangeSectionedDropDown = (selectedItems, index) => {
        // Here selectedItems is always an array with just one value and should pe mapped to the locationId field from the address from index
        let addresses = _.cloneDeep(this.state.contact.addresses);
        addresses[index].locationId = selectedItems;
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
                contact: this.state.isNew ? this.props.contact : null,
                type: 'Contact',
                saveExposure: this.props.isNew ? this.handleSaveExposure : null,
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
            this.setState({
                savePressed: true
            }, () => {
                if (this.props.isNew) {
                    let contactWithRequiredFields = updateRequiredFields(outbreakId = this.props.user.activeOutbreakId, userId = this.props.user._id, record = Object.assign({}, this.state.contact), action = 'create', fileType = 'person.json', type = 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT')
                    this.setState(prevState => ({
                        contact: Object.assign({}, prevState.contact, contactWithRequiredFields)
                    }), () => {
                        this.props.addContact(this.props.user.activeOutbreakId, this.state.contact, this.props.user.token);
                    })
                } else {
                    let contactWithRequiredFields = null
                    if (this.state.deleteContactButtonPressed === true) {
                        contactWithRequiredFields = updateRequiredFields(outbreakId = this.props.user.activeOutbreakId, userId = this.props.user._id, record = Object.assign({}, this.state.contact), action = 'delete')
                    } else {
                        contactWithRequiredFields = updateRequiredFields(outbreakId = this.props.user.activeOutbreakId, userId = this.props.user._id, record = Object.assign({}, this.state.contact), action = 'update')
                    }

                    this.setState(prevState => ({
                    contact: Object.assign({}, prevState.contact, contactWithRequiredFields)
                    }), () => {
                        this.props.updateContact(this.props.user.activeOutbreakId, this.state.contact._id, this.state.contact, this.props.user.token);
                    })
                }
            });
        } else {
            Alert.alert("Validation error", 'Some of the required fields are missing. Please make sure you have completed them', [
                {
                    text: 'Ok', onPress: () => {console.log("Ok pressed")}
                }
            ])
        }
    };

    handleOnPressDeceased = () => {
        console.log("### show date time picker: ");
        this._showDateTimePicker();
    }

    checkRequiredFieldsPersonalInfo = () => {
        for(let i=0; i<config.contactsSingleScreen.personal.length; i++) {
            for (let j=0; j<config.contactsSingleScreen.personal[i].fields.length; j++) {
                if (config.contactsSingleScreen.personal[i].fields[j].isRequired && !this.state.contact[config.contactsSingleScreen.personal[i].fields[j].id]) {
                    return false;
                }
            }
        }
        return true
    }

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
    }

    checkRequiredFields = () => {
        console.log ('checkRequiredFields')

        // First check the personal info
        for(let i=0; i<config.contactsSingleScreen.personal.length; i++) {
            for (let j=0; j<config.contactsSingleScreen.personal[i].fields.length; j++) {
                if (config.contactsSingleScreen.personal[i].fields[j].isRequired && !this.state.contact[config.contactsSingleScreen.personal[i].fields[j].id]) {
                    return false;
                }
            }
        }

        // Check for every address that it has all the required fields completed
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

        if (!this.state.contact || !this.state.contact.relationships || !Array.isArray(this.state.contact.relationships) || this.state.contact.relationships.length < 1) {
            return false;
        }

        return true;
    };

    showMenu = () => {
        this.refs.menuRef.show();
    };

    hideMenu = () => {
        this.refs['menuRef'].hide();
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
            deleteContactButtonPressed: true
        })
        this.hideMenu()
        this.handleOnPressSave();
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
        contacts: state.contacts
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