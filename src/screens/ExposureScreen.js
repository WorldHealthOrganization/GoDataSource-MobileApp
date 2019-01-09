/**
 * Created by florinpopa on 05/07/2018.
 */
import React, {Component} from 'react';
import {View, Text, StyleSheet, ScrollView, Alert, Keyboard, TouchableWithoutFeedback} from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import Button from './../components/Button';
import {Icon} from 'react-native-material-ui';
import styles from './../styles';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {addExposureForContact, updateExposureForContact} from './../actions/contacts';
import NavBarCustom from './../components/NavBarCustom';
import config from './../utils/config';
import CardComponent from './../components/CardComponent';
import Ripple from 'react-native-material-ripple';
import {removeErrors} from './../actions/errors';
import {calculateDimension, extractIdFromPouchId, updateRequiredFields, getTranslation} from './../utils/functions';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import translations from './../utils/translations'
import ElevatedView from 'react-native-elevated-view';

class ExposureScreen extends Component {

    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
            exposure: this.props.exposure || {
                outbreakId: this.props.user.activeOutbreakId,
                contactDate: new Date(),
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
            },
            savePressed: false,
            isModified: false,
        };
        // Bind here methods, or at least don't declare methods in the render method

    }

    // Please add here the react lifecycle methods that you need
    componentDidMount() {
        let personsArray = [] 
        if (this.props.addContactFromCasesScreen !== null && this.props.addContactFromCasesScreen !== undefined && this.props.caseIdFromCasesScreen !== null && this.props.caseIdFromCasesScreen !== undefined) {
            personsArray = [{
                id: extractIdFromPouchId(this.props.caseIdFromCasesScreen, 'person'),
                type: config.personTypes.cases,
                source: true,
                target: null
            },{
                id: null,
                type: config.personTypes.contacts,
                source: null,
                target: true
            }]
            this.setState(prevState => ({
                exposure: Object.assign({}, prevState.exposure, {persons: personsArray})
            }), () => {
                console.log('After changing state componentDidMount: ', this.state.exposure);
            })
        }
    }

    static getDerivedStateFromProps(props, state) {
        // console.log("FollowUpsSingleScreen: ", state);
        if (props.errors && props.errors.type && props.errors.message) {
            Alert.alert(props.errors.type, props.errors.message, [
                {
                    text: getTranslation(translations.alertMessages.okButtonLabel, props.translation),
                    onPress: () => {
                        state.savePressed = false;
                        props.removeErrors()
                    }
                }
            ])
        } else {
            if (state.savePressed) {
                props.navigator.dismissModal();
            } else {
                // If the save button was not pressed, then we should empty the exposure object in order to add another one
                if (props.exposure) {
                    state.exposure = props.exposure;
                } else {
                    state.exposure = {
                        outbreakId: props.user.activeOutbreakId,
                        contactDate: new Date(),
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
                    };
                }
            }
        }
        return null;
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        console.log('Render from ExposureScreen: ', this.state.exposure, this.props.exposure);

        return (
            <TouchableWithoutFeedback onPress={() => {
                Keyboard.dismiss()
            }} accessible={false}>
                <View style={style.container}>
                    <NavBarCustom style = {style.navbarContainer}
                        customTitle={
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    height: '100%'
                                }}
                            >
                                <Text style={[style.title, {marginLeft: 30}]}>
                                    {this.props.exposure ? getTranslation(translations.exposureScreen.editExposureLabel, this.props.translation) : getTranslation(translations.exposureScreen.addExposureLabel, this.props.translation)}
                                </Text>
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
                                        <Icon name="help" color={'white'} size={15}/>
                                    </Ripple>
                                </ElevatedView> 
                            </View>
                        }
                        title={null}
                        navigator={this.props.navigator}
                        iconName="close"
                        handlePressNavbarButton={this.handlePressNavbarButton}
                    />
                    <View style={style.containContainer}>
                        <View style={{flexDirection: 'row'}}>
                                <Button
                                    title={getTranslation(translations.generalButtons.saveButtonLabel, this.props.translation)}
                                    onPress={this.handleSaveExposure}
                                    color={styles.buttonGreen}
                                    titleColor={'white'}
                                    height={calculateDimension(25, true, this.props.screenSize)}
                                    width={calculateDimension(130, false, this.props.screenSize)}
                                    style={{
                                        marginVertical: calculateDimension(12.5, true, this.props.screenSize),
                                        marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                                    }}/>

                        </View>
                        <KeyboardAwareScrollView
                        style={style.containerScrollView}
                        contentContainerStyle={[style.contentContainerStyle, {paddingBottom: this.props.screenSize.height < 600 ? 70 : 20}]}
                        keyboardShouldPersistTaps={'always'}
                    >
                        <View style={style.container}>
                        {
                            this.renderItemCardComponent(config.addExposureScreen)
                        }
                        </View>
                    </KeyboardAwareScrollView>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        )
    }

    // Please write here all the methods that are not react native lifecycle methods
    renderItemCardComponent = (fields, cardIndex = null) => {
        return (
            <ElevatedView elevation={3} style={[style.containerCardComponent, {
                marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                width: calculateDimension(config.designScreenSize.width - 32, false, this.props.screenSize),
                marginVertical: 4,
                minHeight: calculateDimension(72, true, this.props.screenSize)
            }, style.cardStyle]}>
                <ScrollView scrollEnabled={false} style={{flex: 1}} contentContainerStyle={{flexGrow: 1}}>
                    {
                        fields && fields.map((item, index) => {
                            return this.handleRenderItemCardComponent(item, index, cardIndex);
                        })
                    }
                </ScrollView>
            </ElevatedView>
        );
    }

    handleRenderItemCardComponent = (item, index, cardIndex) => {
        return (
            <View style={[style.subcontainerCardComponent, {flex: 1}]} key={index}>
                {
                    this.handleRenderItemByType(item, cardIndex)
                }
            </View>
        )
    };

    handleRenderItemByType = (item, cardIndex) => {
        let addContactFromCasesScreen = false;
        let value = '';
     
        if (item.type === 'DropdownInput') {
            item.data = this.computeDataForExposure(item);
        }
        value = this.computeExposureValue(item);
        if (this.props.addContactFromCasesScreen && this.props.addContactFromCasesScreen !== undefined && item.id === 'exposure') {
            addContactFromCasesScreen = true
        }

        if (item.type === 'DatePicker' && value === '') {
            value = null
        }
        let isEditModeForDropDownInput = addContactFromCasesScreen ? false : (this.props.screen === 'ExposureScreen' ? item.id === 'exposure' ? true : item.isEditMode : item.isEditMode)

        let dateValidation = this.setDateValidations(item);
        minimumDate = dateValidation.minimumDate;
        maximumDate = dateValidation.maximumDate;

        return (
            <CardComponent
                item={item}
                isEditMode={this.props.isEditMode}
                exposure={this.state.exposure}
                isEditModeForDropDownInput={isEditModeForDropDownInput}
                value={value}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                index={cardIndex}
                
                onChangeDropDown={this.handleOnChangeDropDown}
                onChangeDate={this.handleOnChangeDate}
                onChangeText={this.handleOnChangeText}
                onChangeSwitch={this.handleOnChangeSwitch}
            />
        )
    };

    setDateValidations = (item) => {
        let minimumDate = undefined;
        let maximumDate = undefined;

        if (item.type === 'DatePicker') {
            if (item.id === 'contactDate') {
                maximumDate = new Date()
            }
        }
        
        let dateValidation = {minimumDate, maximumDate}
        return dateValidation
    };

    computeDataForExposure = (item) => {
        let data = [];
        if (item.categoryId) {
            data = this.props.referenceData.filter((e) => {
                return e.active === true && e.categoryId === item.categoryId
            }).map((e) => {
                return {value: getTranslation(e.value, this.props.translation), id: extractIdFromPouchId(e._id, 'referenceData')}
            });
        } else {
            if (item.id === 'exposure') {
                if (this.props.type !== 'Contact') {
                    data = this.props.contacts.map((e) => {return {value: ((e.firstName ? e.firstName + ' ' : '') + (e.lastName ? e.lastName : '')), id: extractIdFromPouchId(e._id, 'person'), type: 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT'}});
                }
                if (this.props.cases && this.props.cases.length > 0){
                    data = this.props.cases.map((e) => {return {value: ((e.firstName ? e.firstName + ' ' : '') + (e.lastName ? e.lastName : '')), id: extractIdFromPouchId(e._id, 'person'), type: 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE'}});
                }
                data = data.concat(this.props.events.map((e) => {return {value: e.name, id: extractIdFromPouchId(e._id, 'person'), type: 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_EVENT'}}));
            } else {
                if (item.id === 'clusterId') {
                    // return _.filter(this.props.referenceData, (o) => {
                    //     return o.categoryId.includes("")
                    // }).map((o) => {return {value: getTranslation(o.value, this.props.translation), id: o.value}})
                }
            }
        }
        return data;
    };

    computeExposureValue = (item) => {
        let value = '';

        value = this.state.exposure[item.id];
        if (item.id === 'exposure') {
            if (this.state.exposure.persons && Array.isArray(this.state.exposure.persons) && this.state.exposure.persons.length > 0) {
                let persons = this.state.exposure.persons.filter((e) => {return e.type !== (this.props.type === 'Contact' ? config.personTypes.contacts : config.personTypes.contacts)});
                value = this.extractNameForExposure(persons[0]);
            }
        }
        return getTranslation(value, this.props.translation);
    };

    extractNameForExposure = (person) => {
        switch (person.type) {
            case config.personTypes.cases:
                return (this.props.cases && Array.isArray(this.props.cases) && this.props.cases.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id) > -1 && this.props.cases[this.props.cases.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].firstName ? (this.props.cases[this.props.cases.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].firstName + ' ') : '') +
                    (this.props.cases && Array.isArray(this.props.cases) && this.props.cases.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id) > -1 && this.props.cases[this.props.cases.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].lastName ? (this.props.cases[this.props.cases.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].lastName) : '');
            case config.personTypes.events:
                return (this.props.events && Array.isArray(this.props.events) && this.props.events.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id) > -1 && this.props.events[this.props.events.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].name ? (this.props.events[this.props.events.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].name) : '');
            case config.personTypes.contacts:
                return (this.props.contacts && Array.isArray(this.props.contacts) && this.props.contacts.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id) > -1 && this.props.contacts[this.props.contacts.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].firstName ? (this.props.contacts[this.props.contacts.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].firstName + ' ') : '') +
                    (this.props.contacts && Array.isArray(this.props.contacts) && this.props.contacts.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id) > -1 && this.props.contacts[this.props.contacts.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].lastName ? (this.props.contacts[this.props.contacts.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].lastName) : '');
            default:
                return ''
        }
    };

    handlePressNavbarButton = () => {
        if (this.state.isModified === true) {
            Alert.alert("", 'You have unsaved data. Are you sure you want to leave this page and lose all changes?', [
                {
                    text: 'Yes', onPress: () => {
                    this.props.navigator.dismissModal();
                }
                },
                {
                    text: 'Cancel', onPress: () => {
                    console.log("onPressCancelEdit No pressed - nothing changes")
                }
                }
            ])
        }else {
            this.props.navigator.dismissModal();
        }
    };

    handleOnChangeDropDown = (value, id, type) => {
        // Check if id is exposure in order to set the persons array
        // console.log("Before changing state: ", value, id, type);
        if (id === 'exposure') {
            // Do the logic here for handling all types of exposures
            // Permitted situations are contact(target)->case/event(source) and case->case
            // For case->case, the case that is the one that was clicked on
            let personsArray = [];
            if (this.props.type === 'Contact') {
                personsArray = [{
                    id: value.value,
                    type: type,
                    source: true,
                    target: null
                },{
                    id: this.props.contact && this.props.contact._id ? extractIdFromPouchId(this.props.contact._id, 'person') : null,
                    type: 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT',
                    source: null,
                    target: true
                }];
            } else {
                // Here add logic for cases/events
                personsArray = [{
                    id: value.value,
                    type: type
                }]
            }

            let source = personsArray && Array.isArray(personsArray) && personsArray.length === 2 ? personsArray[0].source ? personsArray[0].id : personsArray[1].id : null;
            let target = personsArray && Array.isArray(personsArray) && personsArray.length === 2 ? personsArray[0].target ? personsArray[0].id : personsArray[1].id : null;

            this.setState(prevState => ({
                exposure: Object.assign({}, prevState.exposure, {persons: personsArray, source: source, target: target, active: true}),
                isModified: true
            }), () => {
                console.log('After changing state: ', this.state.exposure);
            })
        } else {
            // let source = this.state.exposure.persons && Array.isArray(this.state.exposure.persons) && this.state.exposure.persons.length === 2 ? this.state.exposure.persons[0].source ? this.state.exposure.persons[0].id : this.state.exposure.persons[1].id : null;
            // let target = this.state.exposure.persons && Array.isArray(this.state.exposure.persons) && this.state.exposure.persons.length === 2 ? this.state.exposure.persons[0].target ? this.state.exposure.persons[0].id : this.state.exposure.persons[1].id : null;
            this.setState(prevState => ({
                exposure: Object.assign({}, prevState.exposure, {[id]: value.value}),
                isModified: true
            }), () => {
                console.log('After changing state: ', this.state.exposure);
            })
        }
    };

    handleOnChangeDate = (value, id) => {
        this.setState(prevState => ({
            exposure: Object.assign({}, prevState.exposure, {[id]: value}),
            isModified: true
        }), () => {
            console.log('Exposure after changing date: ', this.state.exposure);
        })
    };

    handleOnChangeText = (value, id) => {
        this.setState(prevState => ({
            exposure: Object.assign({}, prevState.exposure, {[id]: value}),
            isModified: true
        }))
    };

    handleOnChangeSwitch = (value, id) => {
        this.setState(prevState => ({
            exposure: Object.assign({}, prevState.exposure, {[id]: value}),
            isModified: true
        }))
    };

    handleAddAnotherExposure = () => {
        if (this.checkFields()) {
            console.log("Here should save current exposure and reset the fields in order to add another one");
            if (this.props.type === 'Contact') {
                this.props.addExposureForContact(this.props.user.activeOutbreakId, this.props.contact.id, this.state.exposure, this.props.user.token);
            }
        } else {
            Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), getTranslation(translations.alertMessages.requiredFieldsMissingError, this.props.translation), [
                {
                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                    onPress: () => {console.log("Ok pressed")}
                }
            ])
        }
    };

    handleSaveExposure = () => {
        if (this.checkFields()) {
            console.log("Here should save the exposure and dismiss the modal");
            this.setState({
                savePressed: true,
                isModified: false,
            }, () => {
                if (this.props.type === 'Contact') {
                    if (this.props.exposure) {
                        if (!this.props.contact) {
                            this.setState(prevState => ({
                                exposure: Object.assign({}, prevState.exposure, {updatedAt: new Date().toISOString(), updatedBy: this.props.user._id.split('_')[this.props.user._id.split('_').length - 1]})
                            }), () => {
                                this.props.navigator.dismissModal(this.props.saveExposure(this.state.exposure, true));
                            })
                        } else {
                            let exposure = updateRequiredFields(outbreakId = this.props.user.activeOutbreakId, userId = this.props.contact.updatedBy, record = Object.assign({}, this.state.exposure), action = 'update')
                            this.props.navigator.dismissModal(this.props.saveExposure(this.state.exposure, true));
                            this.props.updateExposureForContact(this.props.user.activeOutbreakId, this.props.contact._id, exposure, this.props.user.token);
                        }
                    } else {
                        if (!this.props.contact) {
                            this.setState(prevState => ({
                                exposure: Object.assign({}, prevState.exposure, {updatedAt: new Date().toISOString(), updatedBy: this.props.user._id.split('_')[this.props.user._id.split('_').length - 1]})
                            }), () => {
                              this.props.navigator.dismissModal(this.props.saveExposure(this.state.exposure));
                            })
                        } else {
                            let exposure = updateRequiredFields(outbreakId = this.props.user.activeOutbreakId, userId = this.props.contact.updatedBy, record = Object.assign({}, this.state.exposure), action = 'create', fileType = 'relationship.json')
                            this.props.addExposureForContact(this.props.user.activeOutbreakId, this.props.contact._id, exposure, this.props.user.token, Object.assign({}, this.props.contact));
                        }
                    }
                }
            });
        } else {
            Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), getTranslation(translations.alertMessages.requiredFieldsMissingError, this.props.translation), [
                {
                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                    onPress: () => {console.log("Ok pressed")}
                }
            ])
        }
    };

    checkFields = () => {
        let pass = true;
        for (let i=0; i<config.addExposureScreen.length; i++) {
            if (config.addExposureScreen[i].id === 'exposure') {
                if (this.state.exposure.persons.length === 0) {
                    pass = false;
                }
            } else {
                if (config.addExposureScreen[i].isRequired) {
                    if (!this.state.exposure[config.addExposureScreen[i].id]) {
                        pass = false;
                    }
                }
            }
        }
        return pass;
    }

    goToHelpScreen = () => {
        let pageAskingHelpFrom = null

        if (this.props.exposure) {
            pageAskingHelpFrom = 'exposureEdit'
        } else {
            pageAskingHelpFrom = 'exposureAdd'
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
    },
    navbarContainer: {
        backgroundColor: 'white'
    },
    containContainer: {
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
    innerContainer: {
        flex: 1,
        backgroundColor: styles.screenBackgroundGrey
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    title: {
        fontSize: 17,
        fontFamily: 'Roboto-Medium',
    }
});

function mapStateToProps(state) {
    return {
        user: state.user,
        screenSize: state.app.screenSize,
        errors: state.errors,
        contacts: state.contacts,
        translation: state.app.translation,
        referenceData: state.referenceData,
        cases: state.cases,
        events: state.events,
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        addExposureForContact,
        updateExposureForContact,
        removeErrors
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(ExposureScreen);