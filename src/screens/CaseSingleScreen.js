/**
 * Created by mobileclarisoft on 23/07/2018.
 */
import React, {Component} from 'react';
import {View, Alert, Text, StyleSheet, Animated, ScrollView, Dimensions} from 'react-native';
import {TabBar, TabView, SceneMap} from 'react-native-tab-view';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import NavBarCustom from './../components/NavBarCustom';
import Breadcrumb from './../components/Breadcrumb';
import Menu, {MenuItem} from 'react-native-material-menu';
import Ripple from 'react-native-material-ripple';
import styles from './../styles';
import config from './../utils/config';
import _ from 'lodash';

// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
// import {Button} from 'react-native-material-ui';
import CaseSinglePersonalContainer from './../containers/CaseSinglePersonalContainer';
import CaseSingleAddressContainer from './../containers/CaseSingleAddressContainer';
import CaseSingleInfectionContainer from './../containers/CaseSingleInfectionContainer';
import CaseSingleInvestigationContainer from '../containers/CaseSingleInvestigationContainer';
import {Icon} from 'react-native-material-ui';
import {removeErrors} from './../actions/errors';
import {addCase, updateCase} from './../actions/cases';
import {updateRequiredFields, extractIdFromPouchId} from './../utils/functions';

const initialLayout = {
    height: 0,
    width: Dimensions.get('window').width,
};

class CaseSingleScreen extends Component {

    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
            interactionComplete: false,
            deletePressed: false,
            savePressed: false,
            saveFromEditPressed: false,
            routes: config.tabsValuesRoutes.casesSingle,
            index: 0,
            case: this.props.isNew ? {
                outbreakId: this.props.user.activeOutbreakId,
                riskLevel: '',
                dateOfReporting: null,
                isDateOfReportingApproximate: false,
                transferRefused: false,
                riskReason: '',
                firstName: '',
                middleName: '',
                lastName: '',
                gender: '',
                phoneNumber: '',
                occupation: '',
                age: '',
                outcome: '',
                classification: '',
                dateBecomeCase: null,
                dateOfInfection: null,
                dateOfOutcome: null,
                dateOfOnset: null,
                isDateOfOnsetApproximate: false,
                deceased: false,
                dateDeceased: null,
                addresses: [],
                documents: [],
                hospitalizationDates: [],
                isolationDates: [],
                questionnaireAnswers: {}
            } : Object.assign({}, this.props.case),
            isEditMode: this.props.isNew ? true : false,
            isDateTimePickerVisible: false,
            isModified: false,
            canChangeScreen: false,
            caseBeforeEdit: {},
            anotherPlaceOfResidenceWasChosen: false,
            hasPlaceOfResidence: this.props.isNew ? false : true
        };
        // Bind here methods, or at least don't declare methods in the render method
    }

    // Please add here the react lifecycle methods that you need
    static getDerivedStateFromProps(props, state) {
        // console.log("CaseSingleScreen: ", state, props);
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
        }
        return null;
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <View style={style.container}>
                <NavBarCustom
                    title={null}
                    customTitle={
                        <View
                            style={[style.breadcrumbContainer]}>
                            <Breadcrumb
                                entities={['Cases', this.props.isNew ? "Add Case" : (this.state.case.firstName ? this.state.case.firstName : '' + " " + this.state.case.lastName ? this.state.case.lastName : '')]}
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
                                            <MenuItem onPress={this.handleOnPressDeleteCase}>Delete case</MenuItem>
                                        ) : null
                                    }
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
                    renderScene={this.handleRenderScene}
                    renderTabBar={this.handleRenderTabBar}
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

    //Index change for TabBar
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

    //Generate TabBar
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

    //Render label for TabBar
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

    //Render scene
    handleRenderScene = ({route}) => {
        switch(route.key) {
            case 'personal':
                return (
                    <CaseSinglePersonalContainer
                        case={this.state.case}
                        isEditMode={this.state.isEditMode}
                        onPressEdit={this.onPressEdit}
                        onPressSaveEdit={this.onPressSaveEdit}
                        onPressCancelEdit={this.onPressCancelEdit}
                        onPressSave={this.handleSavePress}
                        onChangeText={this.onChangeText}
                        onChangeDate={this.onChangeDate}
                        onChangeSwitch={this.onChangeSwitch}
                        onChangeDropDown={this.onChangeDropDown}
                        handleMoveToNextScreenButton={this.handleMoveToNextScreenButton}
                        checkRequiredFieldsPersonalInfo={this.checkRequiredFieldsPersonalInfo}
                        isNew={this.props.isNew}
                        onPressAddDocument={this.onPressAddDocument}
                        onDeletePress={this.handleOnPressDeleteDocument}
                    />
                );
            case 'address':
                return (
                    <CaseSingleAddressContainer
                        case={this.state.case}
                        isEditMode={this.state.isEditMode}
                        onPressEdit={this.onPressEdit}
                        onPressSaveEdit={this.onPressSaveEdit}
                        onPressCancelEdit={this.onPressCancelEdit}
                        onChangeText={this.onChangeText}
                        onChangeDropDown={this.onChangeDropDown}
                        onChangeDate={this.onChangeDate}
                        onChangeSwitch={this.onChangeSwitch}
                        onChangeSectionedDropDown={this.handleOnChangeSectionedDropDownAddress}
                        onDeletePress={this.handleOnPressDeleteAddress}
                        onPressAddAddress={this.handleOnPressAddAddress}
                        handleMoveToNextScreenButton={this.handleMoveToNextScreenButton}
                        handleMoveToPrevieousScreenButton={this.handleMoveToPrevieousScreenButton}
                        checkRequiredFieldsAddresses={this.checkRequiredFieldsAddresses}
                        isNew={this.props.isNew}
                        anotherPlaceOfResidenceWasChosen={this.state.anotherPlaceOfResidenceWasChosen}
                        anotherPlaceOfResidenceChanged={this.anotherPlaceOfResidenceChanged}
                        hasPlaceOfResidence={this.state.hasPlaceOfResidence}
                    />
                );
            case 'infection':
                return (
                    <CaseSingleInfectionContainer
                        case={this.state.case}
                        isEditMode={this.state.isEditMode}
                        onPressEdit={this.onPressEdit}
                        onPressSaveEdit={this.onPressSaveEdit}
                        onPressCancelEdit={this.onPressCancelEdit}
                        onChangeText={this.onChangeText}
                        onChangeDropDown={this.onChangeDropDown}
                        onChangeDate={this.onChangeDate}
                        onChangeSwitch={this.onChangeSwitch}
                        handleMoveToNextScreenButton={this.handleMoveToNextScreenButton}
                        handleMoveToPrevieousScreenButton={this.handleMoveToPrevieousScreenButton}
                        checkRequiredFieldsInfection={this.checkRequiredFieldsInfection}
                        isNew={this.props.isNew}
                        onPressAddHospitalizationDate={this.onPressAddHospitalizationDate}
                        handleOnPressDeleteHospitalizationDates={this.handleOnPressDeleteHospitalizationDates}
                        onPressAddIsolationDates={this.onPressAddIsolationDates}
                        handleOnPressDeleteIsolationDates={this.handleOnPressDeleteIsolationDates}
                    />
                );
            case 'caseInvestigation':
                return <CaseSingleInvestigationContainer
                    case={this.state.case}
                    isEditMode={this.state.isEditMode}
                    onPressEdit={this.onPressEdit}
                    onPressSaveEdit={this.onPressSaveEdit}
                    onPressCancelEdit={this.onPressCancelEdit}
                    onChangeTextAnswer={this.onChangeTextAnswer}
                    onChangeSingleSelection={this.onChangeSingleSelection}
                    onChangeMultipleSelection={this.onChangeMultipleSelection}
                    handleMoveToPrevieousScreenButton={this.handleMoveToPrevieousScreenButton}
                    isNew={this.props.isNew}
                />;
            default: return null;
        }
    };

   
    //Delete case
    handleOnPressDeleteCase = () => {
        Alert.alert("Alert", 'Are you sure you want to delete this case?', [
            {
                text: 'Yes', onPress: () => {
                    this.setState ({
                        deletePressed: true
                    }, () => {
                        this.handleOnPressSave();
                    })
                }
            },
            {
                text: 'No', onPress: () => {
                    this.hideMenu();
                }
            }
        ])
    };
    //Save case
    handleOnPressSave = () => {
        if (this.checkRequiredFields()) {
            if (this.state.hasPlaceOfResidence === true){
                console.log("handleSavePress case", JSON.stringify(this.state.case));
                this.hideMenu()
                
                if (this.state.saveFromEditPressed === true){
                    //update case and remain on view screen
                    this.setState({
                        saveFromEditPressed: false,
                        isEditMode: false,
                        isModified: false,
                        caseBeforeEdit: {}
                    }, () => {
                        let caseWithRequiredFields = updateRequiredFields(outbreakId = this.props.user.activeOutbreakId, userId = this.props.user._id, record = Object.assign({}, this.state.case), action = 'update')
                        this.setState(prevState => ({
                            case: Object.assign({}, prevState.case, caseWithRequiredFields)
                            }), () => {
                                this.props.updateCase(this.props.user.activeOutbreakId, this.state.case._id, this.state.case, this.props.user.token);
                            })
                    });
                } else {
                    //global save pressed
                    this.setState({
                        savePressed: true
                    }, () => {
                        if (this.props.isNew) {
                            let caseWithRequiredFields = updateRequiredFields(outbreakId = this.props.user.activeOutbreakId, userId = this.props.user._id, record = Object.assign({}, this.state.case), action = 'create', fileType = 'person.json', type = 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE')
                            this.setState(prevState => ({
                                case: Object.assign({}, prevState.case, caseWithRequiredFields)
                            }), () => {
                                this.props.addCase(this.props.user.activeOutbreakId, this.state.case, this.props.user.token);
                            })
                        } else {
                            let caseWithRequiredFields = null
                            if (this.state.deletePressed === true) {
                                caseWithRequiredFields = updateRequiredFields(outbreakId = this.props.user.activeOutbreakId, userId = this.props.user._id, record = Object.assign({}, this.state.case), action = 'delete')
                            } else {
                                caseWithRequiredFields = updateRequiredFields(outbreakId = this.props.user.activeOutbreakId, userId = this.props.user._id, record = Object.assign({}, this.state.case), action = 'update')
                            }
        
                            this.setState(prevState => ({
                                case: Object.assign({}, prevState.case, caseWithRequiredFields)
                                }), () => {
                                    this.props.updateCase(this.props.user.activeOutbreakId, this.state.case._id, this.state.case, this.props.user.token);
                                })
                        }
                    });
                }
            } else {
                Alert.alert("Validation error", 'Please add the place of residence address', [
                    {
                        text: 'Ok', onPress: () => {this.hideMenu()}
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
    }


    //View case actions edit/saveEdit/cancelEdit
    onPressEdit = () => {
        this.setState({
                isEditMode: true,
                isModified: false,
                caseBeforeEdit: _.cloneDeep(this.state.case)
        }, () => {
            console.log("handleEditPress", this.state.isEditMode);
            console.log("handleEditPress", this.state.caseBeforeEdit);
        })
    };
    onPressSaveEdit = () => {
        console.log("onPressSaveEdit");
        if (this.state.isModified) {
            this.setState({
                saveFromEditPressed: true
            }, () => {
                console.log("onPressSaveEdit with changes");
                this.handleOnPressSave()
            })
        } else {
            this.setState({
                isEditMode: false
            }, () => {
                console.log("onPressSaveEdit without changes");
            })
        }
    };
    onPressCancelEdit = () => {
        if (this.state.isModified === true) {
            Alert.alert("Alert", 'Are you sure you want to discard all changes ?', [
                {
                    text: 'Yes', onPress: () => {
                        console.log("onPressCancelEdit case", this.state.case);
                        console.log("onPressCancelEdit caseBeforeEdit", this.state.caseBeforeEdit);
                        console.log("onPressCancelEdit Yes pressed - remove changes")
                        this.setState ({
                            case: _.cloneDeep(this.state.caseBeforeEdit),
                            isModified: false,
                            isEditMode: false
                        })
                    }
                },
                {
                    text: 'No', onPress: () => {
                        console.log("onPressCancelEdit No pressed - nothing changes")
                    }
                }
            ])
        } else {
            //there are no changes
            this.setState({
                isEditMode: false,
            }, () => {
                console.log("onPressCancelEdit");
            })
        }
    };


    // Documents functions
    onPressAddDocument = () => {
        let documents = _.cloneDeep(this.state.case.documents);

        documents.push({
            documentType: '',
            documentNumber: ''
        });

        this.setState(prevState => ({
            case: Object.assign({}, prevState.case, {documents}),
            isModified: true
        }), () => {
            console.log("### after updating the data: ", this.state.case);
        })
    };
    handleOnPressDeleteDocument = (index) => {
        console.log("DeletePressed: ", index);
        let caseDocumentsClone = _.cloneDeep(this.state.case.documents);
        caseDocumentsClone.splice(index, 1);
        this.setState(prevState => ({
            case: Object.assign({}, prevState.case, {documents: caseDocumentsClone}),
            isModified: true
        }), () => {
            console.log("After deleting the document: ", this.state.case);
        })
    };


    // Address functions
    handleOnPressAddAddress = () => {
        let addresses = _.cloneDeep(this.state.case.addresses);

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
            case: Object.assign({}, prevState.case, {addresses}),
            isModified: true
        }), () => {
            console.log("### after updating the data: ", this.state.case);
        })
    };
    handleOnPressDeleteAddress = (index) => {
        console.log("DeletePressed: ", index);
        let caseAddressesClone = _.cloneDeep(this.state.case.addresses);
        caseAddressesClone.splice(index, 1);
        this.setState(prevState => ({
            case: Object.assign({}, prevState.case, {addresses: caseAddressesClone}),
            isModified: true
        }), () => {
            console.log("After deleting the address: ", this.state.case);
        })
    };
    handleOnChangeSectionedDropDownAddress = (selectedItems, index) => {
        // Here selectedItems is always an array with just one value and should pe mapped to the locationId field from the address from index
        let addresses = _.cloneDeep(this.state.case.addresses);
        addresses[index].locationId = extractIdFromPouchId(selectedItems['0'], 'location');
        this.setState(prevState => ({
            case: Object.assign({}, prevState.case, {addresses})
        }))
    };


    //hospitalizationDates functions
    onPressAddHospitalizationDate = () => {
        let hospitalizationDates = _.cloneDeep(this.state.case.hospitalizationDates);

        hospitalizationDates.push({
            startDate: null,
            endDate: null
        });

        this.setState(prevState => ({
            case: Object.assign({}, prevState.case, {hospitalizationDates}),
            isModified: true
        }), () => {
            console.log("### after updating the data: ", this.state.case);
        })
    };
    handleOnPressDeleteHospitalizationDates = (index) => {
        console.log("DeletePressed: ", index);
        let caseHospitalizationDatesClone = _.cloneDeep(this.state.case.hospitalizationDates);
        caseHospitalizationDatesClone.splice(index, 1);
        this.setState(prevState => ({
            case: Object.assign({}, prevState.case, {hospitalizationDates: caseHospitalizationDatesClone}),
            isModified: true
        }), () => {
            console.log("After deleting the hospitalizationDates: ", this.state.case);
        })
    };


    //isolationDates functions
    onPressAddIsolationDates = () => {
        let isolationDates = _.cloneDeep(this.state.case.isolationDates);

        isolationDates.push({
            startDate: null,
            endDate: null
        });

        this.setState(prevState => ({
            case: Object.assign({}, prevState.case, {isolationDates}),
            isModified: true
        }), () => {
            console.log("### after updating the data: ", this.state.case);
        })
    };
    handleOnPressDeleteIsolationDates = (index) => {
        console.log("DeletePressed: ", index);
        let caseIsolationDatesClone = _.cloneDeep(this.state.case.isolationDates);
        caseIsolationDatesClone.splice(index, 1);
        this.setState(prevState => ({
            case: Object.assign({}, prevState.case, {isolationDates: caseIsolationDatesClone}),
            isModified: true
        }), () => {
            console.log("After deleting the isolationDates: ", this.state.case);
        })
    };


    // show/hide Menu
    showMenu = () => {
        this.refs.menuRef.show();
    };
    hideMenu = () => {
        this.refs.menuRef.hide();
    };


    // Check required fields functions
    checkRequiredFieldsPersonalInfo = () => {
        //personal info
        for(let i=0; i<config.caseSingleScreen.personal.length; i++) {
            for (let j=0; j<config.caseSingleScreen.personal[i].fields.length; j++) {
                if (config.caseSingleScreen.personal[i].fields[j].isRequired && !this.state.case[config.caseSingleScreen.personal[i].fields[j].id]) {
                    return false;
                }
            }
        }

        //documents
        if (this.state.case && this.state.case.documents && Array.isArray(this.state.case.documents) && this.state.case.documents.length > 0) {
            for (let i=0; i < this.state.case.documents.length; i++) {
                for (let j=0; j<config.caseSingleScreen.document.fields.length; j++) {
                    if (config.caseSingleScreen.document.fields[j].isRequired && !this.state.case.documents[i][config.caseSingleScreen.document.fields[j].id]) {
                        return false;
                    }
                }
            }
        }
        return true
    }
    checkRequiredFieldsAddresses = () => {
        if (this.state.case && this.state.case.addresses && Array.isArray(this.state.case.addresses) && this.state.case.addresses.length > 0) {
            for (let i=0; i < this.state.case.addresses.length; i++) {
                for (let j=0; j<config.caseSingleScreen.address.fields.length; j++) {
                    if (config.caseSingleScreen.address.fields[j].isRequired && !this.state.case.addresses[i][config.caseSingleScreen.address.fields[j].id]) {
                        return false;
                    }
                }
            }
        } else {
            return false;
        }
        return true
    }
    checkRequiredFieldsInfection = () => {
        //infection general info
        for(let i=0; i<config.caseSingleScreen.infection.length; i++) {
            for (let j=0; j<config.caseSingleScreen.infection[i].fields.length; j++) {
                if (config.caseSingleScreen.infection[i].fields[j].isRequired && !this.state.case[config.caseSingleScreen.infection[i].fields[j].id]) {
                    return false;
                }
            }
        }

        //hospitalization dates
        if (this.state.case && this.state.case.hospitalizationDates && Array.isArray(this.state.case.hospitalizationDates) && this.state.case.hospitalizationDates.length > 0) {
            for (let i=0; i < this.state.case.hospitalizationDates.length; i++) {
                for (let j=0; j<config.caseSingleScreen.hospitalizationDate.fields.length; j++) {
                    if (config.caseSingleScreen.hospitalizationDate.fields[j].isRequired && !this.state.case.hospitalizationDates[i][config.caseSingleScreen.hospitalizationDate.fields[j].id]) {
                        return false;
                    }
                }
            }
        }
        
        // isolation Date
        if (this.state.case && this.state.case.isolationDates && Array.isArray(this.state.case.isolationDates) && this.state.case.isolationDates.length > 0) {
            for (let i=0; i < this.state.case.isolationDates.length; i++) {
                for (let j=0; j<config.caseSingleScreen.isolationDate.fields.length; j++) {
                    if (config.caseSingleScreen.isolationDate.fields[j].isRequired && !this.state.case.isolationDates[i][config.caseSingleScreen.isolationDate.fields[j].id]) {
                        return false;
                    }
                }
            }
        }
        return true
    }
    checkRequiredFieldsCaseInvestigationQuestionnaire = () => {
        for (let i = 0; i< this.props.caseInvestigationQuestions.length; i++) {
            let questionnaireAnswer = this.state.case.questionnaireAnswers[this.props.caseInvestigationQuestions[i].variable]
            if (this.props.caseInvestigationQuestions[i].required && !questionnaireAnswer) {
                return false
            }
        }
        return true
    }
    checkRequiredFields = () => {
        return this.checkRequiredFieldsPersonalInfo() && this.checkRequiredFieldsAddresses() && this.checkRequiredFieldsInfection() && this.checkRequiredFieldsCaseInvestigationQuestionnaire()
    }

    
    // onChangeStuff functions
    onChangeText = (value, id, objectTypeOrIndex, objectType) => {
        console.log("case onChangeText: ", value, id, objectTypeOrIndex, objectType);
        if(objectTypeOrIndex == 'Case'){
            this.setState(
                (prevState) => ({
                    case: Object.assign({}, prevState.case, {[id]: value}),
                    isModified: true
                }), () => {
                    console.log("onChangeText", id, " ", value, " ", this.state.case);
                }
            );
        } else {
            if (typeof objectTypeOrIndex === 'phoneNumber' && objectTypeOrIndex >= 0 || typeof objectTypeOrIndex === 'number' && objectTypeOrIndex >= 0) {
                if (objectType && objectType === 'Address') {
                    let addressesClone = _.cloneDeep(this.state.case.addresses);
                    addressesClone[objectTypeOrIndex][id] = value && value.value ? value.value : value;
                    console.log ('addressesClone', addressesClone)
                    this.setState(prevState => ({
                        case: Object.assign({}, prevState.case, {addresses: addressesClone}),
                        isModified: true
                    }), () => {
                        console.log("onChangeText", id, " ", value, " ", this.state.case);
                    })
                } else if (objectType && objectType === 'Documents') {
                        let documentsClone = _.cloneDeep(this.state.case.documents);
                        documentsClone[objectTypeOrIndex][id] = value && value.value ? value.value : value;
                        console.log ('documentsClone', documentsClone)
                        this.setState(prevState => ({
                            case: Object.assign({}, prevState.case, {documents: documentsClone}),
                            isModified: true
                        }), () => {
                            console.log("onChangeText", id, " ", value, " ", this.state.case);
                        })
                }
            }
        }
    };
    onChangeDate = (value, id, objectTypeOrIndex, objectType) => {
        console.log("case onChangeDate: ", value, id, objectTypeOrIndex, objectType);
        if(objectTypeOrIndex == 'Case'){
            this.setState((prevState) => ({
                    case: Object.assign({}, prevState.case, {[id]: value}),
                    isModified: true
                })
                , () => {
                    console.log("onChangeDate", id, " ", value, " ", this.state.case);
                }
            );
        } else {
            if (typeof objectTypeOrIndex === 'phoneNumber' && objectTypeOrIndex >= 0 || typeof objectTypeOrIndex === 'number' && objectTypeOrIndex >= 0) {
                if (objectType && objectType === 'HospitalizationDates') {
                    let hospitalizationDatesClone = _.cloneDeep(this.state.case.hospitalizationDates);
                    hospitalizationDatesClone[objectTypeOrIndex][id] = value && value.value ? value.value : value;
                    console.log ('hospitalizationDatesClone', hospitalizationDatesClone)
                    this.setState(prevState => ({
                        case: Object.assign({}, prevState.case, {hospitalizationDates: hospitalizationDatesClone}),
                        isModified: true
                    }), () => {
                        console.log("onChangeDate HospitalizationDates", id, " ", value, " ", this.state.case);
                    })
                } else if (objectType && objectType === 'IsolationDates') {
                        let isolationDatesClone = _.cloneDeep(this.state.case.isolationDates);
                        isolationDatesClone[objectTypeOrIndex][id] = value && value.value ? value.value : value;
                        console.log ('isolationDatesClone', isolationDatesClone)
                        this.setState(prevState => ({
                            case: Object.assign({}, prevState.case, {isolationDates: isolationDatesClone}),
                            isModified: true
                        }), () => {
                            console.log("onChangeDate IsolationDates", id, " ", value, " ", this.state.case);
                        })
                } else if (objectType && objectType === 'Address') {
                    let addressesClone = _.cloneDeep(this.state.case.addresses);
                    addressesClone[objectTypeOrIndex][id] = value && value.value ? value.value : value;
                    console.log ('addressesClone', addressesClone)
                    this.setState(prevState => ({
                        case: Object.assign({}, prevState.case, {addresses: addressesClone}),
                        isModified: true
                    }), () => {
                        console.log("onChangeDate addressesClone", id, " ", value, " ", this.state.case);
                    })
                }
            }
        }
    };
    onChangeSwitch = (value, id, objectType) => {
        if (id === 'fillGeoLocation') {
            navigator.geolocation.getCurrentPosition((position) => {
                    this.setState(
                        (prevState) => ({
                            item: Object.assign({}, prevState.item, {[id]: value ? {lat: position.coords.latitude, lng: position.coords.longitude} : null }),
                            isModified: true
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
            if(objectType == 'Case') {
                this.setState( (prevState) => ({
                        case: Object.assign({}, prevState.case, {[id]: value}),
                        isModified: true
                    }), () => {
                            console.log("onChangeSwitch", id, " ", value, " ", this.state.case);
                    }
                )
            }
        }
    };
    onChangeDropDown = (value, id, objectTypeOrIndex, objectType) => {
        console.log("case onChangeDropDown: ", value, id, objectTypeOrIndex, this.state.case);
        if(objectTypeOrIndex == 'Case') {
            this.setState(
                (prevState) => ({
                    case: Object.assign({}, prevState.case, {[id]: value && value.value ? value.value : value}),
                    isModified: true
                }), () => {
                    console.log("onChangeDropDown", id, " ", value, " ", this.state.case);
                }
            )
        } else {
            if (typeof objectTypeOrIndex === 'number' && objectTypeOrIndex >= 0) {
                if (objectType === 'Address') {
                    let addressesClone = _.cloneDeep(this.state.case.addresses);

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

                    addressesClone[objectTypeOrIndex][id] = value && value.value ? value.value : value;
                    let hasPlaceOfResidence = false
                    let casePlaceOfResidence = addressesClone.filter((e) => {return e.typeId === config.userResidenceAddress.userPlaceOfResidence})
                    if (casePlaceOfResidence && casePlaceOfResidence.length > 0) {
                        hasPlaceOfResidence = true
                    }

                    console.log ('addressesClone', addressesClone, hasPlaceOfResidence)
                    this.setState(prevState => ({
                        case: Object.assign({}, prevState.case, {addresses: addressesClone}),
                        isModified: true,
                        anotherPlaceOfResidenceWasChosen,
                        hasPlaceOfResidence
                    }), () => {
                        console.log("onChangeDropDown", id, " ", value, " ", this.state.case);
                    })
                } else if (objectType === 'Documents') {
                        let documentsClone = _.cloneDeep(this.state.case.documents);
                        documentsClone[objectTypeOrIndex][id] = value && value.value ? value.value : value;
                        console.log ('documentsClone', documentsClone)
                        this.setState(prevState => ({
                            case: Object.assign({}, prevState.case, {documents: documentsClone}),
                            isModified: true
                        }), () => {
                            console.log("onChangeDropDown", id, " ", value, " ", this.state.case);
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

    //labData Questionnaire onChange... functions
    onChangeTextAnswer = (value, id) => {
        console.log ('onChangeTextAnswer', value, id)
        let itemClone = _.cloneDeep(this.state.case);
        let questionnaireAnswers = itemClone && itemClone.questionnaireAnswers ? itemClone.questionnaireAnswers : null;
        if (!itemClone.questionnaireAnswers) {
            itemClone.questionnaireAnswers = {};
            questionnaireAnswers = itemClone.questionnaireAnswers;
        }
        questionnaireAnswers[id] = value;
        this.setState(prevState => ({
            case: Object.assign({}, prevState.case, {questionnaireAnswers: questionnaireAnswers}),
            isModified: true
            }), () => {
                console.log ('onChangeMultipleSelection after setState', this.state.case)
            })
    };
    onChangeSingleSelection = (value, id) => {
        console.log ('onChangeSingleSelection', value, id)
        let itemClone = _.cloneDeep(this.state.case);
        let questionnaireAnswers = itemClone && itemClone.questionnaireAnswers ? itemClone.questionnaireAnswers : null;
        if (!itemClone.questionnaireAnswers) {
            itemClone.questionnaireAnswers = {};
            questionnaireAnswers = itemClone.questionnaireAnswers;
        }
        questionnaireAnswers[id] = value.value;
        this.setState(prevState => ({
            case: Object.assign({}, prevState.case, {questionnaireAnswers: questionnaireAnswers}),
            isModified: true
            }), () => {
                console.log ('onChangeMultipleSelection after setState', this.state.case)
            })
    };
    onChangeMultipleSelection = (selections, id) => {
        console.log ('onChangeMultipleSelection', selections, id)
        let itemClone = _.cloneDeep(this.state.case);
        let questionnaireAnswers = itemClone && itemClone.questionnaireAnswers ? itemClone.questionnaireAnswers : null;
        if (!itemClone.questionnaireAnswers) {
            itemClone.questionnaireAnswers = {};
            questionnaireAnswers = itemClone.questionnaireAnswers;
        }
        questionnaireAnswers[id] = selections.map((e) => {return e.value});
        this.setState(prevState => ({
            case: Object.assign({}, prevState.case, {questionnaireAnswers: questionnaireAnswers}),
            isModified: true
            }), () => {
                console.log ('onChangeMultipleSelection after setState', this.state.case)
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
        justifyContent: 'flex-start'
    },
    containerContent: {
        flex: 1,
        backgroundColor: 'rgba(217, 217, 217, 0.5)'
    },
    separatorComponentStyle: {
        height: 8
    }
});

function mapStateToProps(state) {
    return {
        user: state.user,
        screenSize: state.app.screenSize,
        outbreak: state.outbreak,
        errors: state.errors,
        cases: state.cases,
        caseInvestigationQuestions: state.outbreak.caseInvestigationTemplate
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        addCase,
        updateCase,
        removeErrors
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(CaseSingleScreen);