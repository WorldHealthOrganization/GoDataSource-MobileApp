import React, {Component} from 'react';
import {Alert} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import lodashSet from 'lodash/set';
import config from '../../utils/config';
import {getContactById, getExposuresForContact} from '../../actions/contacts';
import {getFollowUpById, getFollowUpsForContactId} from '../../actions/followUps';
import {getItemByIdRequest, getRelationsForCase} from '../../actions/cases';
import translations from "../../utils/translations";
import {calcDateDiff, createDate, getLocationAccurate, getTranslation} from "./../../utils/functions";
import lodashCloneDeep from "lodash/cloneDeep";
import {checkArray, checkArrayAndLength, checkInteger, checkObject} from './../../utils/typeCheckingFunctions';
import {extractAllQuestions, extractIdFromPouchId} from "../../utils/functions";
import _, {sortBy} from "lodash";
import {Navigation} from "react-native-navigation";
import cloneDeep from "lodash/cloneDeep";

export function enhanceTabsWithDataHandling() {
    return function withEditHandling(WrappedComponent) {
        class ViewEditScreenContainer extends Component {

            constructor(props) {
                super(props);
                this.state = {
                    // interactionsComplete: false,
                    loading: true,

                    nonEditableElement: {},
                    editableElement: {},
                    additionalElement: {},
                    isEditMode: lodashGet(this.props, 'isEditMode', false),
                    isModified: false,

                    currentAnswers: {},
                    previousAnswers: {},

                    isDateTimePickerVisible: false,

                    selectedItemIndexForAgeUnitOfMeasureDropDown: 0
                };
            }

            componentDidMount() {
                this.computeAdditionalDataMethod()
                    .then((arrayOfData) => {
                        this.computeDataFromArray(arrayOfData);
                    })
            }

            render() {
                return (
                    <WrappedComponent
                        elementType={this.props.elementType}
                        element={this.state.editableElement}
                        additionalData={this.state.additionalElement}
                        isEditMode={this.state.isEditMode}
                        previousAnswers={this.state.previousAnswers}
                        currentAnswers={this.state.currentAnswers}

                        onChangeText={this.onChangeText}
                        onChangeDate={this.onChangeDate}
                        onChangeSwitch={this.onChangeSwitch}
                        onChangeDropDown={this.onChangeDropDown}

                        onPressAddDocument={this.onPressAddDocument}
                        onPressDeleteDocument={this.onPressDeleteDocument}

                        onPressAddAddress={this.onPressAddAddress}
                        onPressDeleteAddress={this.onPressDeleteAddress}
                        onChangeSectionedDropDownAddress={this.onChangeSectionedDropDownAddress}

                        onPressAddDateRange={this.onPressAddDateRange}
                        onPressDeleteDateRange={this.onPressDeleteDateRange}

                        onPressAddVaccine={this.onPressAddVaccine}
                        onPressDeleteVaccine={this.onPressDeleteVaccine}

                        onChangeTextAnswer={this.onChangeTextAnswer}
                        onChangeDateAnswer={this.onChangeDateAnswer}
                        onChangeSingleSelection={this.onChangeSingleSelection}
                        onChangeMultipleSelection={this.onChangeMultipleSelection}
                        onChangeAnswerDate={this.onChangeAnswerDate}

                        onPressNextButton={this.onPressNextButton}

                        onClickAddNewMultiFrequencyAnswer={this.onClickAddNewMultiFrequencyAnswer}
                        savePreviousAnswers={this.savePreviousAnswers}
                        copyAnswerDate={this.copyAnswerDate}

                        onPressSave={() => {console.log("Default method")}}
                        onPressEdit={this.onPressEdit}
                        onPressCancelEdit={this.onPressCancelEdit}

                        {...this.props}
                    />
                );
            }

            // Methods for preparing data
            computeAdditionalDataMethod = () => {
                let arrayOfPromises = [];

                switch (this.props.elementType) {
                    case 'followUp':
                        if (this.props.isNew && this.props.element) {
                            arrayOfPromises.push(
                                Promise.resolve(
                                    this.props.element
                                )
                            );
                        } else {
                            arrayOfPromises.push(
                                getFollowUpById(
                                    lodashGet(this.props, 'elementId', null),
                                    lodashGet(this.props, 'outbreakId', null)
                                )
                            );
                        }
                        arrayOfPromises.push(
                            getContactById(
                                lodashGet(this.props, 'outbreakId', null),
                                lodashGet(this.props, 'additionalId', null)
                            )
                        );
                        break;
                    case 'contact':
                        if (this.props.addContactFromCasesScreen) {
                            return Promise.resolve({});
                        } else {
                            arrayOfPromises.push(
                                getItemByIdRequest(
                                    lodashGet(this.props, 'elementId', null)
                                )
                            );
                            arrayOfPromises.push(
                                getFollowUpsForContactId(
                                    lodashGet(this.props, 'elementId', null),
                                    lodashGet(this.props, 'outbreakId', null),
                                    lodashGet(this.props, 'teams', null)
                                )
                                    .then((result) => result.map((e) => e.followUps))
                            );
                            arrayOfPromises.push(
                                getExposuresForContact(
                                    lodashGet(this.props, 'elementId', null),
                                    lodashGet(this.props, 'outbreakId', null)
                                )
                            );
                        }
                        break;
                    case 'case':
                        arrayOfPromises.push(
                            getItemByIdRequest(
                                lodashGet(this.props, 'elementId', null)
                            )
                        );
                        arrayOfPromises.push(
                            getRelationsForCase(
                                lodashGet(this.props, 'elementId', null)
                            )
                        );
                        break;
                    case 'event':
                        arrayOfPromises.push(Promise.resolve());
                        break;
                    default:
                        arrayOfPromises.push(Promise.resolve());
                }

                return Promise.all(arrayOfPromises);
            };
            computeDataFromArray = (arrayOfData) => {
                let editableElement = {};
                let additionalElement = {};
                switch (lodashGet(this.props, 'elementType', null)) {
                    // arrayOfData = [followUpData, contactData]
                    case 'followUp':
                        editableElement = lodashGet(arrayOfData, '[0]', {});
                        additionalElement = lodashGet(arrayOfData, '[1]', {});
                        break;
                    // arrayOfData = [contactData, followUpsData, exposureData]
                    case 'contact':
                        editableElement = Object.assign({},
                            lodashGet(arrayOfData, '[0]', {}),
                            {
                                followUps: lodashGet(arrayOfData, '[1]', []),
                                relationships: lodashGet(arrayOfData, '[2]', [])
                            }
                            );
                        break;
                    // arrayOfData = [caseData, contactsData]
                    case 'case':
                        // console.log('TEst: ', arrayOfData);
                        editableElement = Object.assign({},
                            lodashGet(arrayOfData, '[0]', {}),
                            {
                                relations: lodashGet(arrayOfData, '[1]', [])
                            }
                            );
                        break;
                    // arrayOfData = []
                    case 'event':
                        break;
                    default:
                        break;
                }

                this.setState(prevState => ({
                    editableElement: editableElement,
                    additionalElement: additionalElement
                }), () => {
                    console.log('EditableElement: ', this.state.editableElement, this.state.additionalElement);
                });
            };

            // Methods for updating regular properties
            onChangeText = (value, id, objectTypeOrIndex, objectType) => {
                this.updateProps(value, id, objectTypeOrIndex, objectType);
            };
            onChangeDate = (value, id, objectTypeOrIndex, objectType) => {
                this.updateProps(value, id, objectTypeOrIndex, objectType);
            };
            onChangeSwitch = (value, id, objectTypeOrIndex, objectType) => {
                // override the default behaviour for the switches that also get the location
                if (id === 'fillLocation') {
                    getLocationAccurate()
                        .then((position) => {
                            if (value) {
                                this.generalUpdate({[id]: {geoLocation: position}});
                            } else {
                                this.generalUpdate({[id]: {geoLocation: {lat: null, lng: null}}});
                            }
                        })
                        .catch((errorFillLocation) => {
                            Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(error.message, this.props.translation), [
                                {
                                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                                    onPress: () => { console.log("OK pressed") }
                                }
                            ])
                        })
                } else if ((id === 'geoLocationAccurate' && checkInteger(objectTypeOrIndex) && objectTypeOrIndex >= 0)) {
                    let addressesClone = lodashGet(this.state, 'editableElement.addresses');
                    lodashSet(addressesClone, `[${objectTypeOrIndex}].geoLocationAccurate`, value);
                    Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.replaceCurrentCoordinates, this.props.translation), [
                        {
                            text: getTranslation(translations.generalLabels.noAnswer, this.props.translation), onPress: () => {
                                // let addressesClone = lodashGet(this.state, 'editableElement.addresses', []);
                                // lodashSet(addressesClone, `[${objectTypeOrIndex}].geoLocationAccurate`, value);
                                this.generalUpdate({addresses: addressesClone});
                            }
                        },
                        {
                            text: getTranslation(translations.generalLabels.yesAnswer, this.props.translation), onPress: () => {
                                // console.log("Get position for cases: ", position);
                                // let addressesClone = _.cloneDeep(this.state.case.addresses);
                                // console.log('addressesClone: ', addressesClone);
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

                                if (value) {
                                    getLocationAccurate()
                                        .then((position) => {
                                            addressesClone[objectTypeOrIndex].geoLocation.coordinates = [value ? position.lng : '', value ? position.lat : ''];
                                            this.generalUpdate({addresses: addressesClone});
                                        })
                                        .catch((errorGetLocation) => {
                                            Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(error.message, this.props.translation), [
                                                {
                                                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                                                    onPress: () => {
                                                        addressesClone[objectTypeOrIndex].geoLocation.coordinates = [null, null];
                                                        this.generalUpdate({addresses: addressesClone});
                                                    }
                                                }
                                            ])
                                        })
                                } else {
                                    addressesClone[objectTypeOrIndex].geoLocation.coordinates = [null, null];
                                    this.generalUpdate({addresses: addressesClone});
                                }
                            }
                        }]
                    );
                } else {
                    this.updateProps(value, id, objectTypeOrIndex, objectType);
                }

            };
            onChangeDropDown = (value, id, objectTypeOrIndex, objectType) => {
                this.updateProps(value, id, objectTypeOrIndex, objectType);
            };
            // This method encapsulates all the updates to different element props
            // Any specific updates needed in the method for a component will be done there and then
            // this method will be used to manage update
            updateProps = (value, id, objectTypeOrIndex, objectType) => {
                let updatedId = id;
                let updatedValue = lodashGet(value, 'value', value);
                let auxValue = lodashGet(value, 'value', value);
                let updatedObject = {};

                // This is used to update elements of the first exposure when you add a new contact
                if (objectTypeOrIndex === 'Exposure' && this.props.isNew) {
                    updatedId = 'relationships';
                    updatedValue = lodashGet(this.state, 'editableElement.relationships', {});
                    lodashSet(updatedValue, `[0][${id}]`, auxValue);
                }

                if (id === 'followUp.status') {
                    updatedId = 'followUp';
                    updatedValue = lodashGet(this.state, 'editableElement.followUp', {});
                    lodashSet(updatedValue, 'status', auxValue);
                }

                if (id === 'dob') {
                    let nrOFYears = calcDateDiff(value, createDate(null));
                    if (nrOFYears !== undefined && nrOFYears !== null) {
                        let ageClone = {years: 0, months: 0};
                        let selectedItemIndexForAgeUnitOfMeasureDropDown = 0;

                        if (nrOFYears.years === 0 && nrOFYears.months >= 0) {
                            ageClone.months = nrOFYears.months;
                            ageClone.years = nrOFYears.months;
                            selectedItemIndexForAgeUnitOfMeasureDropDown = 1;
                        } else {
                            if (nrOFYears.years > 0) {
                                ageClone.months = nrOFYears.years;
                                ageClone.years = nrOFYears.years;
                                selectedItemIndexForAgeUnitOfMeasureDropDown = 0;
                            }
                        }

                        updatedObject['age'] = ageClone;
                    }
                }

                // This block is used for updating arrays of objects properties like address and documents
                if (checkInteger(objectTypeOrIndex) && objectTypeOrIndex >= 0 && objectType) {
                    if (objectType === 'Address') {
                        updatedId = 'addresses';
                    }
                    if (objectType === 'Documents') {
                        updatedId = 'documents';
                        updatedValue = lodashGet(this.state, 'editableElement.documents', {});
                        lodashSet(updatedValue, `[${objectTypeOrIndex}][${id}]`, lodashGet(value, 'value', auxValue));
                    }
                }

                updatedObject[updatedId] = updatedValue;
                this.generalUpdate(updatedObject);
            };
            generalUpdate = (idValuePairsObject) => {
                this.setState((prevState) => ({
                    isModified: true,
                    editableElement: Object.assign({}, prevState.editableElement, idValuePairsObject)
                }))
            };

            // Address functions
            onPressAddAddress = () => {
                let addresses = [];
                if (checkArrayAndLength(lodashGet(this.state, 'editableElement.addresses', null))) {
                    addresses = lodashGet(this.state, 'editableElement.addresses');
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

                this.generalUpdate({addresses: addresses});
            };
            onPressDeleteAddress = (index) => {
                // console.log("DeletePressed: ", index);
                Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.deleteAddress, this.state.translation), [
                    {
                        text: getTranslation(translations.generalLabels.noAnswer, this.props.translation), onPress: () => { console.log('Cancel pressed') }
                    },
                    {
                        text: getTranslation(translations.generalLabels.yesAnswer, this.props.translation), onPress: () => {
                            let addressesClone = lodashGet(this.state, 'editableElement.addresses', []);
                            addressesClone.splice(index, 1);

                            let hasPlaceOfResidence = false;
                            let caselaceOfResidence = addressesClone.find((e) => { return e.typeId === config.userResidenceAddress.userPlaceOfResidence });
                            if (caselaceOfResidence !== undefined) {
                                hasPlaceOfResidence = true
                            }

                            this.setState(prevState => ({
                                hasPlaceOfResidence
                            }), () => {
                                this.generalUpdate({addresses: addressesClone});
                            })
                        }
                    }
                ]);
            };
            onChangeSectionedDropDownAddress = (selectedItems, index) => {
                // Here selectedItems is always an array with just one value and should pe mapped to the locationId field from the address from index
                if (checkArrayAndLength(selectedItems)) {
                    let addresses = lodashGet(this.state, 'editableElement.addresses', []);
                    lodashSet(addresses, `[${index}].locationId`, extractIdFromPouchId(selectedItems['0']._id, 'location'));
                    if (checkArray(lodashGet(selectedItems, `[0].geoLocation.coordinates`, null))) {
                        if (lodashGet(selectedItems, `[0].geoLocation.coordinates[0]`) !== '' || lodashGet(selectedItems, `[0].geoLocation.coordinates[1]`) !== '') {
                            setTimeout(() => {
                                Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.replaceCurrentCoordinates, this.props.translation), [
                                    {
                                        text: getTranslation(translations.alertMessages.cancelButtonLabel, this.props.translation), onPress: () => {
                                            this.generalUpdate({addresses: addresses});
                                        }
                                    },
                                    {
                                        text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation), onPress: () => {
                                            lodashSet(addresses, `[${index}].geoLocation`, selectedItems['0'].geoLocation);
                                            this.generalUpdate({addresses: addresses});
                                        }
                                    }
                                ])
                            }, 200);
                        }
                    } else {
                        this.generalUpdate({addresses: addresses});
                    }
                }
            };

            // dateRanges functions
            onPressAddDateRange = () => {
                let dateRanges = lodashGet(this.state, 'editableElement.dateRanges');
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

                this.generalUpdate({dateRanges: dateRanges});
            };
            onPressDeleteDateRange = (index) => {
                Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.deleteDateRange, this.state.translation), [
                    {
                        text: getTranslation(translations.generalLabels.noAnswer, this.props.translation), onPress: () => { console.log('Cancel pressed') }
                    },
                    {
                        text: getTranslation(translations.generalLabels.yesAnswer, this.props.translation), onPress: () => {
                            // console.log("DeletePressed: ", index);
                            let dateRanges = lodashGet(this.state, 'editableElement.dateRanges', []);
                            dateRanges.splice(index, 1);
                            this.generalUpdate({dateRanges: dateRanges});
                        }
                    }
                ]);
            };
            onChangeSectionedDropDownDateRange = (selectedItems, index) => {
                // Here selectedItems is always an array with just one value and should pe mapped to the locationId field from the address from index
                let dateRanges = lodashGet(this.state, 'editableElement.dateRanges', []);
                lodashSet(dateRanges, `[${index}].locationId`, extractIdFromPouchId(selectedItems['0']._id, 'location'));
                this.generalUpdate({dateRanges: dateRanges});
            };

            // vaccinesReceived functions
            onPressAddVaccine = () => {
                let vaccinesReceived = lodashGet(this.state, 'editableElement.vaccinesReceived', []);
                if (!checkArray(vaccinesReceived)) {
                    vaccinesReceived = [];
                }

                vaccinesReceived.push({
                    id: null,
                    vaccine: null,
                    date: null,
                    status: null
                });

                this.generalUpdate({vaccinesReceived: vaccinesReceived})
            };
            onPressDeleteVaccine = (index) => {
                let vaccinesReceived = lodashGet(this.state, 'editableElement.vaccinesReceived', []);
                vaccinesReceived.splice(index, 1);
                this.generalUpdate({vaccinesReceived: vaccinesReceived})
            };

            // Burrial section
            onChangeSectionedDropDownBurial = (selectedItems, index) => {
                // Here selectedItems is always an array with just one value and should pe mapped to the locationId field from the address from index
                let burialLocationId = lodashGet(this.state, 'editableElement.burialLocationId', null);
                burialLocationId = extractIdFromPouchId(selectedItems['0']._id, 'location');
                this.generalUpdate({burialLocationId: burialLocationId})
            };

            // Documents functions
            onPressAddDocument = () => {
                let documents = lodashGet(this.state, 'editableElement.documents', []);

                documents.push({
                    type: '',
                    number: ''
                });

                this.generalUpdate({documents: documents})
            };
            onPressDeleteDocument = (index) => {
                // console.log("DeletePressed: ", index);
                Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.deleteDocument, this.state.translation), [
                    {
                        text: getTranslation(translations.generalLabels.noAnswer, this.props.translation), onPress: () => { console.log('Cancel pressed') }
                    },
                    {
                        text: getTranslation(translations.generalLabels.yesAnswer, this.props.translation), onPress: () => {
                            let documentsClone = lodashGet(this.state, 'editableElement.documents', []);
                            documentsClone.splice(index, 1);
                            this.generalUpdate({documents: documentsClone})
                        }
                    }
                ]);
            };

            anotherPlaceOfResidenceChanged = () => {
                this.setState({
                    anotherPlaceOfResidenceWasChosen: false
                })
            };
            ageAndDobPrepareForSave = () => {
                let dobClone = null;
                let ageClone = { years: 0, months: 0 };

                if (lodashGet(this.state, 'editableElement.dob', null) !== null) {
                    //get info from date
                    dobClone = lodashGet(this.state, 'editableElement.dob', null);
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
                } else if (this.state.selectedItemIndexForAgeUnitOfMeasureDropDown === 0 && this.state.editableElement.dob === null) {
                    //years dropdown
                    ageClone.years = lodashGet(this.state, 'editableElement.age.years', null);
                } else if (this.state.selectedItemIndexForAgeUnitOfMeasureDropDown === 1 && this.state.editableElement.dob === null) {
                    //months dropdown
                    ageClone.months = lodashGet(this.state, 'editableElement.age.months', null);
                }

                return {
                    ageClone: ageClone,
                    dobClone: dobClone
                }

            };

            onPressEdit = () => {
                this.setState({
                    isEditMode: true,
                    isModified: false,
                    nonEditableElement: lodashCloneDeep(this.state.editableElement)
                })
            };
            onPressCancelEdit = () => {
                if (this.state.isModified === true) {
                    Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.caseDiscardAllChangesConfirmation, this.props.translation), [
                        {
                            text: getTranslation(translations.alertMessages.yesButtonLabel, this.props.translation),
                            onPress: () => {
                                this.setState({
                                    editableElement: lodashCloneDeep(this.state.nonEditableElement),
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
                        selectedItemIndexForTextSwitchSelectorForAge: this.state.editableElement.dob !== null ? 1 : 0,
                        isEditMode: false,
                    }, () => {
                        console.log("onPressCancelEdit");
                    })
                }
            };
            onPressNext = () => {

            };

            //labData Questionnaire onChange... functions
            onChangeTextAnswer = (value, id, parentId, index) => {
               this.onChangeAnswerGeneral(value, id, parentId, index);
            };
            onChangeSingleSelection = (value, id, parentId, index) => {

                this.onChangeAnswerGeneral(value, id, parentId, index);
            };
            onChangeMultipleSelection = (value, id, parentId, index) => {
                this.onChangeAnswerGeneral(value, id, parentId, index);

            };
            onChangeDateAnswer = (value, id, parentId, index) => {
                this.onChangeAnswerGeneral(value, id, parentId, index);

            };
            onChangeAnswerDate = (value, questionId, index) => {
                let questionnaireAnswers = _.cloneDeep(this.state.previousAnswers);
                if (questionnaireAnswers && questionnaireAnswers[questionId] && Array.isArray(questionnaireAnswers[questionId]) && questionnaireAnswers[questionId].length) {
                    if (questionnaireAnswers[questionId][0]) {
                        questionnaireAnswers[questionId][0].date = value;
                        if(!questionnaireAnswers[questionId][0].hasOwnProperty("subAnswers")){
                            questionnaireAnswers[questionId][0] = Object.assign({}, questionnaireAnswers[questionId][0],{ subAnswers: {}});
                        }
                        if (questionnaireAnswers[questionId][0].subAnswers && typeof questionnaireAnswers[questionId][0].subAnswers === "object" && Object.keys(questionnaireAnswers[questionId][0].subAnswers).length > 0) {
                            for (let subQuestionId in questionnaireAnswers[questionId][0].subAnswers) {
                                questionnaireAnswers[questionId][0].subAnswers[subQuestionId].map((e) => {
                                    return { value: e.value, date: value };
                                })
                            }
                        }
                    }
                }else{
                    questionnaireAnswers[questionId]= [{date: value, value: null}];
                }
                this.setState({
                    previousAnswers: questionnaireAnswers,
                    isModified: true
                }, () => {
                    // console.log('~~~~~~~~~ onChangeAnswerDate', this.state.previousAnswers);
                });
            };
            onChangeAnswerGeneral = (value, id, parentId, index) => {
                let questionnaireAnswers = _.cloneDeep(this.state.previousAnswers);

                if (parentId) {
                    if (!questionnaireAnswers[parentId]) {
                        questionnaireAnswers[parentId] = [];
                    }
                    if (questionnaireAnswers[parentId] && Array.isArray(questionnaireAnswers[parentId]) && questionnaireAnswers[parentId].length > 0 && questionnaireAnswers[parentId][0]) {
                        if(!questionnaireAnswers[parentId][0].hasOwnProperty("subAnswers")){
                            questionnaireAnswers[parentId][0] = Object.assign({}, questionnaireAnswers[parentId][0],{ subAnswers: {}});
                        }
                        if (typeof questionnaireAnswers[parentId][0].subAnswers === "object" && Object.keys(questionnaireAnswers[parentId][0].subAnswers).length === 0) {
                            questionnaireAnswers[parentId][0].subAnswers = {};
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
                }
                // , () => {
                //     console.log ('onChangeMultipleSelection after setState', this.state.previousAnswers);
                // }
                )
            };


            // used for adding multi-frequency answers
            onClickAddNewMultiFrequencyAnswer = (item) => {
                //add new empty item to question and update previousAnswers
                let previousAnswersClone = _.cloneDeep(this.state.previousAnswers);
                if(previousAnswersClone.hasOwnProperty(item.variable) && item.variable){
                    previousAnswersClone[item.variable].push({date: null, value: null});
                } else {
                    previousAnswersClone = Object.assign({}, previousAnswersClone, { [item.variable]: [{date: null, value: null}] });
                }
                this.savePreviousAnswers(previousAnswersClone[item.variable], item.variable);
            };
            savePreviousAnswers = (previousAnswers, previousAnswersId) => {
                this.setState(prevState => ({
                    previousAnswers: Object.assign({}, prevState.previousAnswers, { [previousAnswersId]: previousAnswers }),
                    isModified: true
                }), () => {
                    Navigation.dismissAllModals();
                })
            };
            copyAnswerDate = (value) => {
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
                let sortedQuestions = sortBy(cloneDeep(this.props.caseInvestigationQuestions), ['order', 'variable']);
                sortedQuestions = extractAllQuestions(sortedQuestions, this.state.previousAnswers, 0);
                let canSave = true;
                //questions exist
                if( Array.isArray(sortedQuestions) && sortedQuestions.length > 0){
                    for(let i=0; i < sortedQuestions.length; i++){
                        //verify only multianswer questions and if they were answered
                        if(sortedQuestions[i].multiAnswer && previousAnswersClone.hasOwnProperty(sortedQuestions[i].variable)){
                            //current answers
                            let answerValues = previousAnswersClone[sortedQuestions[i].variable];
                            //validate all the answers of the question
                            if( Array.isArray(answerValues) && answerValues.length > 0){
                                for( let q=0; q < answerValues.length; q++){
                                    // if it has value then it must have date
                                    if(answerValues[q].value !== null && answerValues[q].date === null){
                                        canSave = false;
                                    }
                                }
                            }
                        }
                    }
                }
                return canSave;
            };
            filterUnasweredQuestions = () => {
                let previousAnswersClone = _.cloneDeep(this.state.previousAnswers);
                let sortedQuestions = sortBy(cloneDeep(this.props.caseInvestigationQuestions), ['order', 'variable']);
                sortedQuestions = extractAllQuestions(sortedQuestions, this.state.previousAnswers, 0);
                if( Array.isArray(sortedQuestions) && sortedQuestions.length > 0) {
                    for (let i = 0; i < sortedQuestions.length; i++) {
                        //verify only multianswer questions and if they were answered
                        if (sortedQuestions[i].multiAnswer && previousAnswersClone.hasOwnProperty(sortedQuestions[i].variable)) {
                            //current answers
                            let answerValues = previousAnswersClone[sortedQuestions[i].variable];
                            let answerValuesClone = [];
                            //validate all the answers of the question
                            if( Array.isArray(answerValues) && answerValues.length > 0){
                                answerValuesClone = answerValues.filter((answer)=>{
                                    return answer.value !== null;
                                });
                            }
                            if(answerValuesClone.length > 0){
                                //update answer list
                                previousAnswersClone[sortedQuestions[i].variable] = answerValuesClone;
                            }else{
                                //remove key
                                delete previousAnswersClone[sortedQuestions[i].variable];
                            }
                        }
                    }
                }
                return previousAnswersClone;
            };

            onPressNextButton = (tabIndex) => {
                switch(this.props.elementType) {
                    case 'followUp':
                        return this.checkFollowUpDetailsPage();
                    case 'contact':
                        switch(tabIndex) {
                            case 0:
                                return this.checkContactPersonalPage();
                            case 1:
                                return this.checkAddresses();
                            case 2:
                                break;
                            case 3:
                                break;
                            default:
                                break;
                        }
                        break;
                    case 'case':
                        switch (tabIndex) {
                            case 0:
                                break;
                            case 1:
                                break;
                            case 2:
                                break;
                            case 3:
                                break;
                            default:
                                break;
                        }
                }
            };

            // Value checking methods
            //
            checkRequiredFieldsGeneral = (screens, subArray) => {
                let missingFields = [];
                let dataToBeChecked = lodashGet(this.state, 'editableElement', null);

                if (subArray) {
                    dataToBeChecked = lodashGet(this.state, `editableElement[${subArray}]`, null);
                }

                if (!dataToBeChecked) {
                    return [];
                }

                if(checkObject(screens)) {
                    if (checkArray(dataToBeChecked)) {
                        for (let i = 0; i < dataToBeChecked.length; i++) {
                            for (let j = 0; j < screens.fields.length; j++) {
                                if (screens.fields[j].isRequired && !dataToBeChecked[i][screens.fields[j].id]) {
                                    missingFields.push(getTranslation(screens.fields[j].label, this.props.translation));
                                }
                            }
                        }
                    }
                } else {
                    if (checkArrayAndLength(screens)) {
                        for (let i = 0; i < screens.length; i++) {
                            for (let j = 0; j < screens[i].fields.length; j++) {
                                if (screens[i].fields[j].isRequired && !this.state.editableElement[screens[i].fields[j].id]) {
                                    missingFields.push(getTranslation(screens[i].fields[j].label, this.props.translation));
                                }
                            }
                        }
                    }
                }

                return missingFields;
            };
            checkFollowUpDetailsPage = () => {
                let checkRequiredFields = [];
                if (this.state.editableElement.statusId === config.followUpStatuses.notPerformed || this.state.editableElement.statusId === translations.generalLabels.noneLabel) {
                    checkRequiredFields.push(getTranslation(_.get(config, 'followUpsSingleScreen.fields[1].label', 'Status'), this.props.translation));
                }
                return checkRequiredFields;
            };
            checkContactPersonalPage = () => {
                let personalInfo = [];

                // Check personal info
                personalInfo = personalInfo.concat(this.checkRequiredFieldsGeneral(config.contactsSingleScreen.personal), null);

                // Check documents
                personalInfo = personalInfo.concat(this.checkRequiredFieldsGeneral(config.caseSingleScreen.document.fields), 'documents');

                // for (let i = 0; i < config.contactsSingleScreen.personal.length; i++) {
                //     for (let j = 0; j < config.contactsSingleScreen.personal[i].fields.length; j++) {
                //         if (config.contactsSingleScreen.personal[i].fields[j].isRequired && !this.state.editableElement[config.contactsSingleScreen.personal[i].fields[j].id]) {
                //             personalInfo.push(getTranslation(config.contactsSingleScreen.personal[i].fields[j].label, this.props.translation));
                //         }
                //     }
                // }

                return personalInfo;
            };
            checkDocuments = () => {
                let missingFields = [];
                if (checkArrayAndLength(_.get(this.state , 'editableElement.documents', []))) {
                    for (let i = 0; i < _.get(this.state, 'editableElement.documents.length', 0); i++) {
                        for (let j = 0; j < _.get(config, 'caseSingleScreen.document.fields.length', 0); j++) {
                            if (_.get(config, `caseSingleScreen.document.fields[${j}].isRequired`, false) && !_.get(this.state, `editableElement.documents[${i}][${config.caseSingleScreen.document.fields[j].id}]`, null)) {
                                missingFields.push(getTranslation(_.get(config, `caseSingleScreen.document.fields[${j}].label`, null), this.props.translation));
                            }
                        }
                    }
                }
                return missingFields;
            };
            checkVaccinesReceived = () => {
                let missingFields = [];
                if (checkArrayAndLength(_.get(this.state , 'editableElement.vaccinesReceived', []))) {
                    for (let i = 0; i < _.get(this.state, 'editableElement.vaccinesReceived.length', 0); i++) {
                        for (let j = 0; j < _.get(config, 'caseSingleScreen.vaccinesReceived.fields.length', 0); j++) {
                            if (_.get(config, `caseSingleScreen.vaccinesReceived.fields[${j}].isRequired`, false) && !_.get(this.state, `editableElement.vaccinesReceived[${i}][${config.caseSingleScreen.vaccinesReceived.fields[j].id}]`, null)) {
                                missingFields.push(getTranslation(_.get(config, `caseSingleScreen.vaccinesReceived.fields[${j}].label`, null), this.props.translation));
                            }
                        }
                    }
                }
                return missingFields;
            };
            checkDateRanges = () => {
                if (this.state.case && this.state.case.dateRanges && Array.isArray(this.state.case.dateRanges) && this.state.case.dateRanges.length > 0) {
                    for (let i = 0; i < this.state.case.dateRanges.length; i++) {
                        for (let j = 0; j < config.caseSingleScreen.dateRanges.fields.length; j++) {
                            if (config.caseSingleScreen.dateRanges.fields[j].isRequired && !this.state.case.dateRanges[i][config.caseSingleScreen.dateRanges.fields[j].id]) {
                                requiredFields.push(getTranslation(config.caseSingleScreen.dateRanges.fields[j].label, this.props.translation));
                                // return false;
                            }
                        }
                    }
                }
            };
            checkAddresses = () => {
                // let requiredFields = [];
                return this.checkRequiredFieldsGeneral(config.caseSingleScreen.address.fields, 'addresses');


                // if (checkArrayAndLength(this.state, 'editableElement.addresses', null)) {
                //     for (let i = 0; i < this.state.editableElement.addresses.length; i++) {
                //         for (let j = 0; j < config.caseSingleScreen.address.fields.length; j++) {
                //             if (config.caseSingleScreen.address.fields[j].isRequired && !this.state.editableElement.addresses[i][config.caseSingleScreen.address.fields[j].id]) {
                //                 requiredFields.push(getTranslation(config.caseSingleScreen.address.fields[j].label, this.props.translation));
                //             }
                //         }
                //     }
                // } else {
                //     return requiredFields;
                // }
                // return requiredFields;
            };

            checkQuestionnaires = () => {

            }
        }

        ViewEditScreenContainer.propTypes = {
            elementType: PropTypes.oneOf(['followUp', 'contact', 'case', 'event']).isRequired,
            elementId: PropTypes.string.isRequired,
            additionalId: function (props, propName, componentName) {
                if (lodashGet(props, 'elementType', null) === 'followUp') {
                    if (lodashGet(props, `[${propName}]`, null) === null) {
                        return new Error(`No additional id sent to component: ${componentName}`);
                    }
                }
            },
            previousScreen: PropTypes.string.isRequired,
            refresh: PropTypes.func,
            isNew: PropTypes.bool,
            item: PropTypes.object,
        };

        ViewEditScreenContainer.defaultProps = {
            refresh: () => {console.log('ViewEditScreen default onRefresh method')},
            isNew: false,
            item: {}
        };

        return ViewEditScreenContainer;
    }
}