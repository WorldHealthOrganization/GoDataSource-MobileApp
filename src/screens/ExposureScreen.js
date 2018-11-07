/**
 * Created by florinpopa on 05/07/2018.
 */
import React, {Component} from 'react';
import {View, Text, StyleSheet, ScrollView, Alert} from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import Button from './../components/Button';
import { TextField } from 'react-native-material-textfield';
import styles from './../styles';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {addExposureForContact, updateExposureForContact} from './../actions/contacts';
import NavBarCustom from './../components/NavBarCustom';
import config from './../utils/config';
import CardComponent from './../components/CardComponent';
import Ripple from 'react-native-material-ripple';
import {removeErrors} from './../actions/errors';
import {calculateDimension, extractIdFromPouchId, updateRequiredFields} from './../utils/functions';

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
                clusterId: '',
                comment: '',
                persons: []
            },
            savePressed: false
        };
        // Bind here methods, or at least don't declare methods in the render method

    }

    // Please add here the react lifecycle methods that you need
    componentDidMount() {
        let personsArray = [] 
        if (this.props.addContactFromCasesScreen !== null && this.props.addContactFromCasesScreen !== undefined && this.props.caseIdFromCasesScreen !== null && this.props.caseIdFromCasesScreen !== undefined) {
            personsArray = [{
                id: extractIdFromPouchId(this.props.caseIdFromCasesScreen, 'person'),
                type: 'case',
                source: true,
                target: null
            },{
                id: null,
                type: 'contact',
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
                    text: 'Ok', onPress: () => {
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
            <View style={[style.container]}>
                <NavBarCustom
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
                            <Text style={[style.title, {marginLeft: 30}]}>Add exposure</Text>
                            <Ripple
                                hitSlop={{
                                    top: 20,
                                    bottom: 20,
                                    left: 20,
                                    right: 20
                                }}
                                style={{
                                    height: '100%',
                                    justifyContent: 'center'
                                }}
                                onPress={this.handleSaveExposure}
                            >
                                <Text style={[style.title, {marginHorizontal: 10}]}>Save</Text>
                            </Ripple>
                        </View>
                    }
                    title={null}
                    navigator={this.props.navigator}
                    iconName="close"
                    handlePressNavbarButton={this.handlePressNavbarButton}
                />
                <ScrollView style={style.innerContainer}>
                    <CardComponent
                        screen={'ExposureScreen'}
                        item={config.addExposureScreen}
                        type={this.props.type}
                        exposure={this.state.exposure}
                        addContactFromCasesScreen={this.props.addContactFromCasesScreen}
                        onChangeDropDown={this.handleOnChangeDropDown}
                        onChangeDate={this.handleOnChangeDate}
                        onChangeText={this.handleOnChangeText}
                        onChangeSwitch={this.handleOnChangeSwitch}
                    />
                    {/*<View style={[style.buttonContainer, {*/}
                        {/*marginHorizontal: calculateDimension(16, false, this.props.screenSize),*/}
                        {/*width: calculateDimension(config.designScreenSize.width - 32, false, this.props.screenSize),*/}
                    {/*}]}>*/}
                        {/*<Button*/}
                            {/*title="Add Another Exposure"*/}
                            {/*color="white"*/}
                            {/*onPress={this.handleAddAnotherExposure}*/}
                            {/*height={25}*/}
                            {/*width={'100%'}*/}
                        {/*/>*/}
                    {/*</View>*/}
                </ScrollView>
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handlePressNavbarButton = () => {
        this.props.navigator.dismissModal();
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
                exposure: Object.assign({}, prevState.exposure, {persons: personsArray, source: source, target: target, active: true})
            }), () => {
                console.log('After changing state: ', this.state.exposure);
            })
        } else {
            // let source = this.state.exposure.persons && Array.isArray(this.state.exposure.persons) && this.state.exposure.persons.length === 2 ? this.state.exposure.persons[0].source ? this.state.exposure.persons[0].id : this.state.exposure.persons[1].id : null;
            // let target = this.state.exposure.persons && Array.isArray(this.state.exposure.persons) && this.state.exposure.persons.length === 2 ? this.state.exposure.persons[0].target ? this.state.exposure.persons[0].id : this.state.exposure.persons[1].id : null;
            this.setState(prevState => ({
                exposure: Object.assign({}, prevState.exposure, {[id]: value.value})
            }), () => {
                console.log('After changing state: ', this.state.exposure);
            })
        }
    };

    handleOnChangeDate = (value, id) => {
        this.setState(prevState => ({
            exposure: Object.assign({}, prevState.exposure, {[id]: value})
        }), () => {
            console.log('Exposure after changing date: ', this.state.exposure);
        })
    };

    handleOnChangeText = (value, id) => {
        this.setState(prevState => ({
            exposure: Object.assign({}, prevState.exposure, {[id]: value})
        }))
    };

    handleOnChangeSwitch = (value, id) => {
        this.setState(prevState => ({
            exposure: Object.assign({}, prevState.exposure, {[id]: value})
        }))
    };

    handleAddAnotherExposure = () => {
        if (this.checkFields()) {
            console.log("Here should save current exposure and reset the fields in order to add another one");
            if (this.props.type === 'Contact') {
                this.props.addExposureForContact(this.props.user.activeOutbreakId, this.props.contact.id, this.state.exposure, this.props.user.token);
            }
        } else {
            Alert.alert("Missing fields error", "Please make sure you have completed all the required fields", [
                {
                    text: 'Ok', onPress: () => {console.log("Ok pressed")}
                }
            ])
        }
    };

    handleSaveExposure = () => {
        if (this.checkFields()) {
            console.log("Here should save the exposure and dismiss the modal");
            this.setState({
                savePressed: true
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
            Alert.alert("Missing fields error", "Please make sure you have completed all the required fields", [
                {
                    text: 'Ok', onPress: () => {console.log("Ok pressed")}
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
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
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
        contacts: state.contacts
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