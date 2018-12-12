/**
 * Created by mobileclarisoft on 23/07/2018.
 */
import React, {Component} from 'react';
import {View, Alert, Text, StyleSheet, Animated, ScrollView, Dimensions, BackHandler} from 'react-native';
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
import {updateRequiredFields, extractIdFromPouchId, navigation, getTranslation} from './../utils/functions';
import moment from 'moment';
import translations from './../utils/translations'

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
            filter: this.props.filter && this.props.filter['CasesScreen'] ? this.props.filter['CasesScreen'] : {
                searchText: ''
            },
            filterFromFilterScreen: this.props.filter && this.props.filter['CasesFilterScreen'] ? this.props.filter['CasesFilterScreen'] : null,
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
                outcomeId: '',
                dob: null,
                age: {
                    years: 0,
                    months: 0
                },
                classification: '',
                dateBecomeCase: null,
                dateOfInfection: null,
                dateOfOutcome: null,
                dateOfOnset: null,
                isDateOfOnsetApproximate: false,
                deceased: false,
                dateDeceased: null,
                addresses: [
                    {
                        typeId: config.userResidenceAddress.userPlaceOfResidence,
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
                        date: new Date()
                    }
                ],
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
            hasPlaceOfResidence: true,
            selectedItemIndexForTextSwitchSelectorForAge: 0, // age/dob - switch tab
            selectedItemIndexForAgeUnitOfMeasureDropDown: this.props.isNew ? 0 : (this.props.case.age && this.props.case.age.years !== undefined && this.props.case.age.years !== null && this.props.case.age.years > 0) ? 0 : 1, //default age dropdown value
        };
        // Bind here methods, or at least don't declare methods in the render method
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        if (!this.props.isNew) {
            let ageClone = {years: 0, months: 0}
            let updateAge = false;
            if (this.props.case.age === null || this.props.case.age === undefined || this.props.case.age.years === undefined || this.props.case.age.years === null || this.props.case.age.months === undefined || this.props.case.age.months === null) {
                updateAge = true
            }

            if (updateAge) {
                this.setState(prevState => ({
                    case: Object.assign({}, prevState.case, {age: ageClone}, {dob: this.props.case.dob !== undefined ? this.props.case.dob : null}),
                }), () => {
                    console.log ('old case with age as string update')
                })
            }
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    // Please add here the react lifecycle methods that you need
    static getDerivedStateFromProps(props, state) {
        // console.log("CaseSingleScreen: ", state, props);
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
            if (state.savePressed || state.deletePressed) {
                props.navigator.pop({
                    animated: true,
                    animationType: 'fade'
                })
            }
        }
        return null;
    }

    handleBackButtonClick() {
        // this.props.navigator.goBack(null);
        if (this.state.isModified === true) {
            Alert.alert("", 'You have unsaved data. Are you sure you want to leave this page and lose all changes?', [
                {
                    text: 'Yes', onPress: () => {
                    this.props.navigator.pop({
                        animated: true,
                        animationType: 'fade'
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
            this.props.navigator.pop({
                animated: true,
                animationType: 'fade'
            })
        }
        return false;
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
                                entities={[getTranslation(translations.caseSingleScreen.title, this.props.translation), this.props.isNew ? getTranslation(translations.caseSingleScreen.addCaseTitle, this.props.translation) : (this.state.case.firstName ? this.state.case.firstName : '' + " " + this.state.case.lastName ? this.state.case.lastName : '')]}
                                navigator={this.props.navigator}
                                onPress={this.handlePressBreadcrumb}
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
                                            <MenuItem onPress={this.handleOnPressDeleteCase}>
                                                {getTranslation(translations.caseSingleScreen.deleteCaseLabel, this.props.translation)}
                                            </MenuItem>
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
    };
    handleMoveToPrevieousScreenButton = () => {
        let nextIndex = this.state.index - 1

        this.setState({
            canChangeScreen: true,
        });

        this.handleOnIndexChange(nextIndex)
    };

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
                {getTranslation(route.title, this.props.translation).toUpperCase()}
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
                        onChangeTextSwitchSelector={this.handleOnChangeTextSwitchSelector}
                        selectedItemIndexForTextSwitchSelectorForAge={this.state.selectedItemIndexForTextSwitchSelectorForAge}
                        selectedItemIndexForAgeUnitOfMeasureDropDown={this.state.selectedItemIndexForAgeUnitOfMeasureDropDown}
                        checkAgeMonthsRequirements={this.checkAgeMonthsRequirements}
                        checkAgeYearsRequirements={this.checkAgeYearsRequirements}
                        onChangeextInputWithDropDown={this.handleOnChangeTextInputWithDropDown}
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
                        checkIsolationOnsetDates={this.checkIsolationOnsetDates}
                    />
                );
            case 'caseInvestigation':
                return <CaseSingleInvestigationContainer
                    item={this.state.case}
                    isEditMode={this.state.isEditMode}
                    onPressEdit={this.onPressEdit}
                    onPressSave={this.handleOnPressSave}
                    onPressSaveEdit={this.onPressSaveEdit}
                    onPressCancelEdit={this.onPressCancelEdit}
                    onChangeTextAnswer={this.onChangeTextAnswer}
                    onChangeSingleSelection={this.onChangeSingleSelection}
                    onChangeMultipleSelection={this.onChangeMultipleSelection}
                    onChangeDateAnswer={this.onChangeDateAnswer}
                    handleMoveToPrevieousScreenButton={this.handleMoveToPrevieousScreenButton}
                    isNew={this.props.isNew}
                />;
            default: return null;
        }
    };

    //Delete case
    handleOnPressDeleteCase = () => {
        Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.caseDeleteConfirmation, this.props.translation), [
            {
                text: getTranslation(translations.alertMessages.yesButtonLabel, this.props.translation),
                onPress: () => {
                    this.setState ({
                        deletePressed: true
                    }, () => {
                        this.handleOnPressSave();
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
    //Save case
    handleOnPressSave = () => {
        if (this.checkRequiredFields()) {
            if (this.checkAgeYearsRequirements()) {
                if (this.checkAgeMonthsRequirements()) {
                    if (this.state.hasPlaceOfResidence === true){
                        if(this.checkIsolationOnsetDates()) {
                            console.log("handleSavePress case", JSON.stringify(this.state.case));
                            this.hideMenu();
                            let ageConfig = this.ageAndDobPrepareForSave();
                            this.setState(prevState => ({
                                case: Object.assign({}, prevState.case, {age: ageConfig.ageClone}, {dob: ageConfig.dobClone}),
                            }), () => {
                                if (this.state.saveFromEditPressed === true) {
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
                                            let caseMatchFitler = this.checkIfCaseMatchFilter()
                                            console.log('caseMatchFitler', caseMatchFitler)
                                            this.props.updateCase(this.props.user.activeOutbreakId, this.state.case._id, this.state.case, this.props.user.token, caseMatchFitler);
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
                                                let caseMatchFitler = this.checkIfCaseMatchFilter()
                                                console.log('caseMatchFitler', caseMatchFitler)
                                                this.props.addCase(this.props.user.activeOutbreakId, this.state.case, this.props.user.token, caseMatchFitler);
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
                                                let caseMatchFitler = this.checkIfCaseMatchFilter()
                                                console.log('caseMatchFitler', caseMatchFitler)
                                                this.props.updateCase(this.props.user.activeOutbreakId, this.state.case._id, this.state.case, this.props.user.token, caseMatchFitler);
                                            })
                                        }
                                    });
                                }
                            })
                        }else{
                            Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), getTranslation(translations.alertMessages.dateOfOnsetError, this.props.translation), [
                                {
                                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                                    onPress: () => {this.hideMenu()}
                                }
                            ])
                        }
                    } else {
                        Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), getTranslation(translations.alertMessages.placeOfResidenceError, this.props.translation), [
                            {
                                text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation), 
                                onPress: () => {this.hideMenu()}
                            }
                        ])
                    }
                } else {
                    Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), getTranslation(translations.alertMessages.monthsValueError, this.props.translation), [
                        {
                            text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation), 
                            onPress: () => {this.hideMenu()}
                        }
                    ])
                }
            } else {
                Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), getTranslation(translations.alertMessages.yearsValueError, this.props.translation), [
                    {
                        text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation), 
                        onPress: () => {this.hideMenu()}
                    }
                ])
            }
        } else {
            Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), getTranslation(translations.alertMessages.requiredFieldsMissingError, this.props.translation), [
                {
                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation), 
                    onPress: () => {this.hideMenu()}
                }
            ])
        }
    };
    //Breadcrumb click
    handlePressBreadcrumb = () => {
        if (this.state.isModified === true) {
            Alert.alert("", 'You have unsaved data. Are you sure you want to leave this page and lose all changes?', [
                {
                    text: 'Yes', onPress: () => {
                    this.props.navigator.pop({
                        animated: true,
                        animationType: 'fade'
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
            this.props.navigator.pop({
                animated: true,
                animationType: 'fade'
            });
        }
    };

    checkIfCaseMatchFilter = () => {
        if (this.props.filter && (this.props.filter['CasesFilterScreen'] || this.props.filter['CasesScreen'])) {
            let caseCopy = [_.cloneDeep(this.state.case)]

            // Take care of search filter
            if (this.state.filter.searchText) {
                caseCopy = caseCopy.filter((e) => {
                    return e && e.firstName && this.state.filter.searchText.toLowerCase().includes(e.firstName.toLowerCase()) ||
                        e && e.lastName && this.state.filter.searchText.toLowerCase().includes(e.lastName.toLowerCase()) ||
                        e && e.firstName && e.firstName.toLowerCase().includes(this.state.filter.searchText.toLowerCase()) ||
                        e && e.lastName && e.lastName.toLowerCase().includes(this.state.filter.searchText.toLowerCase())
                });
            }

            // Take care of gender filter
            if (this.state.filterFromFilterScreen && this.state.filterFromFilterScreen.gender) {
                caseCopy = caseCopy.filter((e) => {return e.gender === this.state.filterFromFilterScreen.gender});
            }
            // Take care of age range filter
            if (this.state.filterFromFilterScreen && this.state.filterFromFilterScreen.age && Array.isArray(this.state.filterFromFilterScreen.age) && this.state.filterFromFilterScreen.age.length === 2 && (this.state.filterFromFilterScreen.age[0] >= 0 || this.state.filterFromFilterScreen.age[1] <= 150)) {
                caseCopy = caseCopy.filter((e) => {
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
                caseCopy = caseCopy.filter((e) => {
                    let addresses = e.addresses.filter((k) => {
                        return k.locationId !== '' && this.state.filterFromFilterScreen.selectedLocations.indexOf(k.locationId) >= 0
                    })
                    return addresses.length > 0
                })
            }
            //Take care of classification filter
            if (this.state.filterFromFilterScreen  && this.state.filterFromFilterScreen.classification && this.state.filterFromFilterScreen.classification.length > 0) {
                caseCopy = caseCopy.filter((e) => {
                    return this.state.filterFromFilterScreen.classification.map((f) => {return f.classification}).indexOf(e.classification) > -1
                })
            }

            if (caseCopy.length > 0) {
                return true
            } else {
                return false
            }
        } else {
            return true
        }
    };

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
                saveFromEditPressed: true,
                selectedItemIndexForTextSwitchSelectorForAge: this.state.case.dob !== null ? 1 : 0,
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
            Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.caseDiscardAllChangesConfirmation, this.props.translation), [
                {
                    text: getTranslation(translations.alertMessages.yesButtonLabel, this.props.translation), 
                    onPress: () => {
                        console.log("onPressCancelEdit case", this.state.case);
                        console.log("onPressCancelEdit caseBeforeEdit", this.state.caseBeforeEdit);
                        console.log("onPressCancelEdit Yes pressed - remove changes");
                        this.setState ({
                            case: _.cloneDeep(this.state.caseBeforeEdit),
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
                selectedItemIndexForTextSwitchSelectorForAge: this.state.case.dob !== null ? 1 : 0,
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
            type: '',
            number: ''
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
        let addresses = [];
        if (this.state && this.state.case && this.state.case.addresses) {
            addresses = _.cloneDeep(this.state.case.addresses);
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
    };
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
    };
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
    };
    checkRequiredFieldsCaseInvestigationQuestionnaire = () => {
        for (let i = 0; i< this.props.caseInvestigationQuestions.length; i++) {
            let questionnaireAnswer = this.state.case.questionnaireAnswers[this.props.caseInvestigationQuestions[i].variable];
            if (this.props.caseInvestigationQuestions[i].required){
                //multiple answer question
                if(Array.isArray(questionnaireAnswer)){
                    //if is empty
                    if(_.isEmpty(questionnaireAnswer))
                        return false;
                }else{
                    //regular question missing answer
                    if(!questionnaireAnswer)
                        return false;
                }
            }
        }

        return true;
    };
    checkRequiredFields = () => {
        return this.checkRequiredFieldsPersonalInfo() && this.checkRequiredFieldsAddresses() && this.checkRequiredFieldsInfection() && this.checkRequiredFieldsCaseInvestigationQuestionnaire()
    };
    checkAgeYearsRequirements = () => {
        if (this.state.selectedItemIndexForAgeUnitOfMeasureDropDown === 0) {
            if (this.state.case.age && this.state.case.age.years !== undefined && this.state.case.age.years !== null) {
                if (this.state.case.age.years < 0 || this.state.case.age.years > 150) {
                    return false
                }
            }
        }
        return true
    };
    checkAgeMonthsRequirements = () => {
        if (this.state.selectedItemIndexForAgeUnitOfMeasureDropDown === 1) {
            if (this.state.case.age && this.state.case.age.months !== undefined && this.state.case.age.months !== null) {
                if (this.state.case.age.months < 0 || this.state.case.age.months > 11) {
                    return false
                }
            }
        }
        return true
    };
    checkIsolationOnsetDates = () => {
        if(this.state.case && this.state.case.dateOfOnset && this.state.case.isolationDates && Array.isArray(this.state.case.isolationDates) && this.state.case.isolationDates.length > 0){
            for (let i=0; i < this.state.case.isolationDates.length; i++) {
                for (let j=0; j<config.caseSingleScreen.isolationDate.fields.length; j++) {
                    if (this.state.case.isolationDates[i][config.caseSingleScreen.isolationDate.fields[j].id]) {
                        if(moment(this.state.case.isolationDates[i][config.caseSingleScreen.isolationDate.fields[j].id]).format('YYYY-MM-DD') < moment(this.state.case.dateOfOnset).format('YYYY-MM-DD')){
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    };
    
    
    // onChangeStuff functions
    onChangeText = (value, id, objectTypeOrIndex, objectType) => {
        // console.log("case onChangeText: ", value, id, objectTypeOrIndex, objectType);
        if(objectTypeOrIndex == 'Case'){
            this.setState(
                (prevState) => ({
                    case: Object.assign({}, prevState.case, {[id]: value}),
                    isModified: true
                }));
        } else {
            if (typeof objectTypeOrIndex === 'phoneNumber' && objectTypeOrIndex >= 0 || typeof objectTypeOrIndex === 'number' && objectTypeOrIndex >= 0) {
                if (objectType && objectType === 'Address') {
                    let addressesClone = _.cloneDeep(this.state.case.addresses);
                    // Check if the lat/lng have changed
                    if (id === 'lng') {
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
                    } else {
                        if (id === 'lat') {
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
                        } else {
                            addressesClone[objectTypeOrIndex][id] = value && value.value ? value.value : value;
                        }
                    }
                    // console.log ('addressesClone', addressesClone);
                    this.setState(prevState => ({
                        case: Object.assign({}, prevState.case, {addresses: addressesClone}),
                        isModified: true
                    }))
                } else if (objectType && objectType === 'Documents') {
                        let documentsClone = _.cloneDeep(this.state.case.documents);
                        documentsClone[objectTypeOrIndex][id] = value && value.value ? value.value : value;
                        console.log ('documentsClone', documentsClone)
                        this.setState(prevState => ({
                            case: Object.assign({}, prevState.case, {documents: documentsClone}),
                            isModified: true
                        }))
                }
            }
        }
    };
    onChangeDate = (value, id, objectTypeOrIndex, objectType) => {
        console.log("case onChangeDate: ", value, id, objectTypeOrIndex, objectType);
        if (id === 'dob') {
            let today = new Date()
            let nrOFYears = this.calcDateDiff(value, today);
            if (nrOFYears !== undefined && nrOFYears !== null) {
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
                    case: Object.assign({}, prevState.case, {age: ageClone}, {dob: value}),
                    selectedItemIndexForAgeUnitOfMeasureDropDown,
                    isModified: true
                }), () => {
                    console.log("handleOnChangeDate dob", id, " ", value, " ", this.state.case);
                })
            }
        } else {
            if(objectTypeOrIndex === 'Case'){
            this.setState((prevState) => ({
                    case: Object.assign({}, prevState.case, {[id]: value}),
                    isModified: true
                })
                , () => {
                    console.log("onChangeDate", id, " ", value, " ", this.state.case);
                })
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
                    Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.caseGetLocationError, this.props.translation), [
                        {
                            text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation), 
                            onPress: () => {console.log("OK pressed")}
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
        if(objectTypeOrIndex === 'Case') {
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
    handleOnChangeTextInputWithDropDown = (value, id, objectType, stateValue) => {
        console.log("handleOnChangeTextInputWithDropDown: ",value, id, objectType, stateValue, this.state.case);

        if (stateValue !== undefined && stateValue !== null){
            if (id === 'age'){
                let ageClone = { years: 0, months: 0 }
                
                if (!isNaN(Number(value)) && !value.includes(".") && !value.includes("-") && !value.includes(",") && !value.includes(" ")) {
                    ageClone.years = Number(value)
                    ageClone.months = Number(value)
                }

                this.setState(prevState => ({
                    case: Object.assign({}, prevState.case, {age: ageClone}, {dob: null}),
                    isModified: true
                }), () => {
                    console.log("handleOnChangeTextInputWithDropDown done", id, " ", value, " ", this.state.case);
                })
            }
        }
    };
    handleOnChangeTextSwitchSelector = (index, stateValue) => {
        if (stateValue === 'selectedItemIndexForAgeUnitOfMeasureDropDown') {
            let ageClone = Object.assign({}, this.state.case.age)
            if (!this.props.isNew) {
                if (ageClone.years === 0 && ageClone.months !== 0) {
                    ageClone.years = ageClone.months
                } else if (ageClone.monthsyears === 0 && ageClone.years !== 0){
                    ageClone.months = ageClone.years
                }
            }
            this.setState(prevState => ({
                [stateValue]: index,
                case: Object.assign({}, prevState.case, {dob: null}, {age: ageClone}),
                isModified: true
            }), () => {
                console.log ('handleOnChangeTextSwitchSelector', stateValue, this.state[stateValue])
            })
        } else {
            this.setState({
                [stateValue]: index,
                isModified: true
            }, () => {
                console.log ('handleOnChangeTextSwitchSelector', stateValue, this.state[stateValue])
            })
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

          console.log ('calcDateDiff', {months: months, years: years})
          return nrOFYears = {
            months: months,
            years: years,
          };
        }
        else {
          return undefined;
        }
    };
    anotherPlaceOfResidenceChanged = () => {
        this.setState({
            anotherPlaceOfResidenceWasChosen: false
        })
    };
    ageAndDobPrepareForSave = () => {
        let dobClone = null
        let ageClone = { years: 0, months: 0 }

        if (this.state.case.dob !== null && this.state.case.dob !== undefined) {
            //get info from date
            dobClone = this.state.case.dob
            let today = new Date()
            let nrOFYears = this.calcDateDiff(dobClone, today);
            if (nrOFYears !== undefined && nrOFYears !== null) {
                //calc age for save
                if (nrOFYears.years === 0 && nrOFYears.months >= 0) {
                    ageClone.months = nrOFYears.months
                } else if (nrOFYears.years > 0) {
                    ageClone.years = nrOFYears.years
                }
            }
        } else if (this.state.selectedItemIndexForAgeUnitOfMeasureDropDown === 0 && this.state.case.dob === null) {
            //years dropdown 
            ageClone.years = this.state.case.age.years
        } else if (this.state.selectedItemIndexForAgeUnitOfMeasureDropDown === 1 && this.state.case.dob === null) {
            //months dropdown 
            ageClone.months = this.state.case.age.months
        }
        
        return {
            ageClone: ageClone,
            dobClone: dobClone
        }
       
    };

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
    onChangeDateAnswer = (value, id) => {
        console.log ('onChangeDateAnswer', value, id)
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
            console.log ('onChangeDateAnswer after setState', this.state.case)
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
        filter: state.app.filters,
        cases: state.cases,
        caseInvestigationQuestions: state.outbreak.caseInvestigationTemplate,
        translation: state.app.translation
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