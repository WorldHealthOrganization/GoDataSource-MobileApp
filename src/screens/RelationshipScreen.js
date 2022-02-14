/**
 * Created by florinpopa on 05/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import constants from "./../utils/constants";
import Button from './../components/Button';
import {Icon} from 'react-native-material-ui';
import styles from './../styles';
import ViewHOC from './../components/ViewHOC';
import {connect} from "react-redux";
import {bindActionCreators, compose} from "redux";
import {addExposureForContact, updateExposureForContact} from './../actions/contacts';
import {addExposureForContactOfContact, updateExposureForContactOfContact} from './../actions/contactsOfContacts';
import NavBarCustom from './../components/NavBarCustom';
import config from './../utils/config';
import Ripple from 'react-native-material-ripple';
import {removeErrors} from './../actions/errors';
import {
    calculateDimension,
    createStackFromComponent,
    extractIdFromPouchId,
    getTranslation,
    updateRequiredFields
} from './../utils/functions';
import translations from './../utils/translations'
import ElevatedView from 'react-native-elevated-view';
import RelationshipContainer from '../containers/RelationshipContainer';
import get from 'lodash/get';
import {insertOrUpdateExposure} from "../actions/exposure";
import withPincode from './../components/higherOrderComponents/withPincode';
import {Navigation} from "react-native-navigation";
import _ from "lodash";

class RelationshipScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            exposure: this.props.exposure || {
                outbreakId: this.props.outbreak._id,
                contactDate: new Date(),
                dateOfFirstContact: new Date(),
                contactDateEstimated: false,
                certaintyLevelId: '',
                exposureTypeId: '',
                exposureFrequencyId: '',
                exposureDurationId: '',
                socialRelationshipTypeId: '',
                socialRelationshipDetail: '',
                clusterId: '',
                comment: '',
                persons: [],
                loading: false
            },
            savePressed: false,
            isModified: false,
            selectedExposure: this.props.selectedExposure
        };
    }

    // Please add here the react lifecycle methods that you need
    componentDidUpdate(prevProps) {
        if (this.state.savePressed) {
            Navigation.dismissModal(this.props.componentId);
        }
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <ViewHOC style={style.viewHocContainer}
                showLoader={this && this.state && this.state.loading}
                loaderText={this.props && this.props.syncState ? 'Loading' : getTranslation(translations.loadingScreenMessages.loadingMsg, this.props.translation)}>
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
                                        {this.renderTitle()}
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
                            componentId={this.props.componentId}
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
                            <RelationshipContainer
                                exposure={this.state.exposure}
                                person={this.props.type === 'Case' ? this.props.case : this.props.contact}
                                fromRelationshipScreen={true}
                                type={this.props.type}
                                isEditMode={this.props.isEditMode}
                                onChangeText={this.handleOnChangeData}
                                onChangeDropDown={this.handleOnChangeDropDown}
                                onChangeDate={this.handleOnChangeData}
                                onChangeSwitch={this.handleOnChangeData}
                                onSelectExposure={this.handleOnSelectExposure}
                                relationshipType={this.props.relationshipType}
                                selectedExposure={this.state.selectedExposure}
                                addContactFromCasesScreen={this.props.addContactFromCasesScreen}
                            />
                        </View>
                    </View>
            </ViewHOC>
        )
    }

    // Please write here all the methods that are not react native lifecycle methods
    handlePressNavbarButton = () => {
        if (this.state.isModified === true) {
            Alert.alert("", 'You have unsaved data. Are you sure you want to leave this page and lose all changes?', [
                {
                    text: 'Yes', onPress: () => {
                        Navigation.dismissModal(this.props.componentId);
                    }
                },
                {
                    text: 'Cancel', onPress: () => {
                        console.log("onPressCancelEdit No pressed - nothing changes")
                    }
                }
            ])
        } else {
            Navigation.dismissModal(this.props.componentId);
        }
    };

    renderTitle = () =>{
        if (this.props.relationshipType  === constants.RELATIONSHIP_TYPE.exposure){
            return this.props.exposure ? getTranslation(translations.exposureScreen.editExposureLabel, this.props.translation) : getTranslation(translations.exposureScreen.addExposureLabel, this.props.translation)
        } else {
            return this.props.exposure ? getTranslation(translations.exposureScreen.editContactLabel, this.props.translation) : getTranslation(translations.exposureScreen.addContactLabel, this.props.translation)
        }
    }
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
            } else if (this.props.type === 'ContactOfContact') {
                personsArray = [{
                    id: value.value,
                    type: type,
                    source: true,
                    target: null
                },{
                    id: this.props.contact && this.props.contact._id ? extractIdFromPouchId(this.props.contact._id, 'person') : null,
                    type: translations.personTypes.contactsOfContacts,
                    source: null,
                    target: true
                }];
            }else {
                // Here add logic for cases/events
                personsArray = [{
                    id: value.value,
                    type: type
                }]
            }

            // let source = personsArray && Array.isArray(personsArray) && personsArray.length === 2 ? personsArray[0].source ? personsArray[0].id : personsArray[1].id : null;
            // let target = personsArray && Array.isArray(personsArray) && personsArray.length === 2 ? personsArray[0].target ? personsArray[0].id : personsArray[1].id : null;

            this.setState(prevState => ({
                exposure: Object.assign({}, prevState.exposure, {persons: personsArray}),
                isModified: true
            }), () => {
                console.log('After changing state if: ', this.state.exposure);
            })
        } else {
            // let source = this.state.exposure.persons && Array.isArray(this.state.exposure.persons) && this.state.exposure.persons.length === 2 ? this.state.exposure.persons[0].source ? this.state.exposure.persons[0].id : this.state.exposure.persons[1].id : null;
            // let target = this.state.exposure.persons && Array.isArray(this.state.exposure.persons) && this.state.exposure.persons.length === 2 ? this.state.exposure.persons[0].target ? this.state.exposure.persons[0].id : this.state.exposure.persons[1].id : null;
            this.setState(prevState => ({
                exposure: Object.assign({}, prevState.exposure, {[id]: value.value}),
                isModified: true
            }), () => {
                console.log('After changing state else: ', this.state.exposure);
            })
        }
    };

    handleOnChangeData = (value, id) => {
        this.setState(prevState => ({
            exposure: Object.assign({}, prevState.exposure, {[id]: value}),
            isModified: true
        }), () => {
            console.log('Exposure after changing date: ', this.state.exposure);
        })
    };

    handleOnSelectExposure = (selectedExposure) => {
        console.log('OnSelectExposure: ', selectedExposure);
        let personsArray = [];
        const relationshipSource = this.props.relationshipType === constants.RELATIONSHIP_TYPE.exposure ? true : null;
        const personSource = this.props.relationshipType === constants.RELATIONSHIP_TYPE.exposure ? null : true;

        const relationshipTarget = this.props.relationshipType === constants.RELATIONSHIP_TYPE.exposure ? null : true;
        const personTarget = this.props.relationshipType === constants.RELATIONSHIP_TYPE.exposure ? true : null;
        if (this.props.type === 'Contact') {
            personsArray = [{
                id: get(selectedExposure, '_id', null),
                type: get(selectedExposure, 'type', null),
                source: relationshipSource,
                target: relationshipTarget
            },{
                id: get(this.props, 'contact._id', null),
                type: get(this.props, 'contact.type', null),
                source: personSource,
                target: personTarget
            }];
        } else if (this.props.type === 'ContactOfContact') {
            personsArray = [{
                id: get(selectedExposure, '_id', null),
                type: get(selectedExposure, 'type', null),
                source: relationshipSource,
                target: relationshipTarget
            },{
                id: get(this.props, 'contact._id', null),
                type: get(this.props, 'contact.type', null),
                source: personSource,
                target: personTarget
            }];
        }else {
            // Here add logic for cases. Events are not yet handled. This needs refactoring
            personsArray = [{
                id: get(selectedExposure, '_id', null),
                type: get(selectedExposure, 'type', null),
                source: relationshipSource,
                target: relationshipTarget
            },{
                id: get(this.props, 'case._id', null),
                type: get(this.props, 'case.type', null),
                source: personSource,
                target: personTarget
            }];
        }

        this.setState(prevState => ({
            exposure: Object.assign({}, prevState.exposure, {persons: personsArray, active: true}),
            isModified: true,
            selectedExposure: selectedExposure
        }), () => {
            console.log('After changing state if: ', this.state.exposure);
        })
    };

    handleSaveExposure = () => {
        let missingFields = this.checkFields();
        if (missingFields && Array.isArray(missingFields) && missingFields.length === 0) {
            this.setState({
                // savePressed: true,
                isModified: false,
            }, () => {
                if (this.props.type === 'Contact' || this.props.type === 'ContactOfContact') {
                    let operation = this.props.exposure ? 'update' : 'create';
                    let exposure = updateRequiredFields(get(this.props, 'outbreak._id', null), get(this.props, 'user._id', null), Object.assign({}, this.state.exposure), operation, 'relationship');


                    if (this.props.exposure) {
                        if (!this.props.contact) {
                            this.setState(prevState => ({
                                exposure: Object.assign({}, prevState.exposure, {updatedAt: new Date().toISOString(), updatedBy: this.props.user._id.split('_')[this.props.user._id.split('_').length - 1]})
                            }), async () => {
                                await Navigation.dismissModal(this.props.componentId);
                                this.props.saveExposure(this.state.exposure, true);
                            })
                        } else {
                            let exposure = updateRequiredFields(get(this.props, 'outbreakId', null), get(this.props, 'user._id', null), this.state.exposure, 'update');
                            let promise = null;
                            if (this.props.type === 'Contact') {
                                promise = updateExposureForContact(exposure, this.props.contact, get(this.props, 'periodOfFollowUp', null), get(this.props, 'user._id', null))
                            } else {
                                promise = updateExposureForContactOfContact(exposure, get(this.props, 'user._id', null))
                            }
                            Promise.all([promise])
                                .then((result) => {
                                    this.props.refreshRelations();
                                    Navigation.dismissModal(this.props.componentId);
                                })
                        }
                    } else {
                        if (!this.props.contact) {
                            this.setState(prevState => ({
                                exposure: Object.assign({}, prevState.exposure, {updatedAt: new Date().toISOString(), updatedBy: this.props.user._id.split('_')[this.props.user._id.split('_').length - 1]})
                            }), async () => {
                              await Navigation.dismissModal(this.props.componentId);
                                this.props.saveExposure(this.state.exposure);
                            })
                        } else {
                            // let exposure = updateRequiredFields(outbreakId = this.props.outbreak._id, userId = this.props.user._id.split('_')[this.props.user._id.split('_').length - 1], record = Object.assign({}, this.state.exposure), action = 'create', fileType = 'relationship.json')
                            let promise = null;
                            if (this.props.type === 'Contact') {
                                promise = addExposureForContact(exposure, this.props.contact, this.props.periodOfFollowUp, get(this.props, 'user._id', null));
                            } else {
                                promise = addExposureForContactOfContact(exposure, get(this.props, 'user._id', null));
                            }
                            Promise.all([promise])
                                .then((result) => {
                                    console.log('Successful at adding exposures');
                                    this.props.refreshRelations();
                                    Navigation.dismissModal(this.props.componentId);
                                })
                                .catch((errorAddExposure) => {
                                    console.log("ErrorInsertUpdateExposure contact: ",errorAddExposure)
                                })
                        }
                    }
                } else {
                    let operation = this.props.exposure ? 'update' : 'create';
                    let exposure = updateRequiredFields(get(this.props, 'outbreak._id', null), get(this.props, 'user._id', null), Object.assign({}, this.state.exposure), operation, 'relationship');
                    insertOrUpdateExposure(exposure)
                        .then((resultInsertUpdateExposure) => {
                            this.props.refreshRelations();
                            Navigation.dismissModal(this.props.componentId);
                        })
                        .catch((errorInsertUpdateExposure) => {
                            console.log('ErrorInsertUpdateExposure: ', errorInsertUpdateExposure);
                        })
                }
            });
        } else {
            Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), `${getTranslation(translations.alertMessages.requiredFieldsMissingError, this.props.translation)}.\n${getTranslation(translations.alertMessages.missingFields, this.props.translation)}: ${missingFields}`, [
                {
                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                    onPress: () => {console.log("Ok pressed")}
                }
            ])
        }
    };

    checkFields = () => {
        // let pass = true;
        let requiredFields = [];
        for (let i=0; i<config.addRelationshipScreen.length; i++) {
            if (config.addRelationshipScreen[i].id === 'exposure') {
                if (this.state.exposure.persons.length === 0) {
                    requiredFields.push('Person')
                    // pass = false;
                }
            } else {
                if (config.addRelationshipScreen[i].isRequired) {
                    if (!this.state.exposure[config.addRelationshipScreen[i].id]) {
                        requiredFields.push(getTranslation(config.addRelationshipScreen[i].label, this.props.translation));
                        // pass = false;
                    }
                }
            }
        }
        return requiredFields;
        // return pass;
    };

    goToHelpScreen = () => {
        let pageAskingHelpFrom = null;

        if (this.props.exposure) {
            pageAskingHelpFrom = 'exposureEdit'
        } else {
            pageAskingHelpFrom = 'exposureAdd'
        }

        Navigation.showModal(createStackFromComponent({
            name: 'HelpScreen',
            passProps: {
                pageAskingHelpFrom: pageAskingHelpFrom
            }
        }));
    };
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
    },
    viewHocContainer: {
        flex: 1,
        backgroundColor: 'white',
    }
});

function mapStateToProps(state) {
    return {
        user: get(state, 'user', null),
        outbreak: get(state, 'outbreak', null),
        screenSize: get(state, 'app.screenSize', config.designScreenSize),
        translation: get(state, 'app.translation', []),
        periodOfFollowUp: get(state, 'outbreak.periodOfFollowup', null),
        outbreakId: get(state, 'outbreak._id', null)
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        addExposureForContact,
        updateExposureForContact,
        removeErrors
    }, dispatch);
}

export default compose(
    withPincode(),
    connect(mapStateToProps, matchDispatchProps)
)(RelationshipScreen);