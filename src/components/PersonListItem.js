/**
 * Created by florinpopa on 23/08/2018.
 */
/**
 * Created by florinpopa on 03/08/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import moment from 'moment-timezone';
import {InteractionManager, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import {calculateDimension, getTranslation} from './../utils/functions';
import {connect} from "react-redux";
import GeneralListItem from './GeneralListItem';
import {getAddress, handleExposedTo} from "../utils/functions";
import config from "../utils/config";
import PersonListItemNameAndAddressComponent from './PersonListItemNameAndAddressComponent';
import PersonListItemExposuresComponent from './PersonListItemExposuresComponent';
import PermissionComponent from './PermissionComponent';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';
import constants from './../utils/constants';
import translations from "../utils/translations";
import {checkArrayAndLength} from "../utils/typeCheckingFunctions";
import styles from './../styles';

class PersonListItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            firstComponentData: null,
            secondComponentData: null
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!isEqual(nextProps.itemToRender, this.props.itemToRender)) {
            return true;
        }
        return false;
    }

    render() {
        let firstComponentData = this.prepareFirstComponentData(this.props.type, this.props.itemToRender);
        let secondComponentData = this.prepareSecondComponentData(this.props.type, this.props.itemToRender);

        return (
            <GeneralListItem
                containerStyle={{
                    marginHorizontal: calculateDimension(16, false, this.props.screenSize)
                }}
                firstComponent={
                    <PersonListItemNameAndAddressComponent
                        type={this.props.type}
                        titleColor={this.props.titleColor}
                        firstComponentRenderData={firstComponentData}
                        onPressMapIcon={this.props.onPressMapIconProp ? this.onPressMapIcon : null}
                        onPressName={this.props.onPressNameProp}
                    />
                }
                secondComponent={this.props.type !== 'Case' && this.props.type !== 'Event' && this.props.type !== 'User' && this.props.type !== 'LabResult' ? (
                    <PermissionComponent
                        render={() => (
                            <PersonListItemExposuresComponent
                                data={secondComponentData}
                                onPressExposureProp={this.props.onPressExposureProp}
                            />
                        )}
                        permissionsList={[
                            constants.PERMISSIONS_CONTACT.contactAll,
                            constants.PERMISSIONS_CONTACT.contactListRelationshipContacts,
                            constants.PERMISSIONS_CONTACT.contactListRelationshipExposures
                        ]}
                    />) : (null)
                }
                hasActionsBar={true}
                textsArray={this.props.textsArray}
                textsStyleArray={this.props.textsStyleArray}
                onPressArray={this.props.onPressTextsArray}
                arrayPermissions={this.props.arrayPermissions}
                onPermissionDisable={this.props.onPermissionDisable}
                outbreakPermissions={this.props.outbreakPermissions}
                secondaryOutbreakPermissions={this.props.secondaryOutbreakPermissions}
                hasSecondaryActionsBar={this.props.secondaryTextsArray?.length}
                secondaryTextsArray={this.props.secondaryTextsArray}
                secondaryTextsStyleArray={this.props.secondaryTextsStyleArray}
                secondaryOnPressArray={this.props.secondaryOnPressTextsArray}
                secondaryArrayPermissions={this.props.secondaryArrayPermissions}
            />
        )
    }

    // The method returns an Array of values needed for the first component {fullName, gender, age, visualId, addressString, primaryColor}
    prepareFirstComponentData = (type, itemToRender) => {
        let returnValues = {
            fullName: '',
            id: '',
            gender: '',
            age: '',
            visualId: '',
            addressString: '',
            primaryColor: styles.textColor,
            status: null,
            institutionName: '',
            telephoneNumbers: '',
            emails: '',
            //Lab Result
            classification: '',
            dateSampleTaken: '',
            dateOfResult: '',
            labName: '',
            result: '',
            labResultStatus: '',
            //Event
            name: '',
            date: '',
            description: ''
        };
        // the new implementation
        let person = get(itemToRender, 'mainData', null);

        // Get followUp's contact
        // let person = type === 'Contact' || type === 'Case' ? itemToRender : this.props.contacts && Array.isArray(this.props.contacts) && this.props.contacts.length > 0 ?  this.props.contacts.find((e) => {return extractIdFromPouchId(e._id, 'person') === itemToRender.personId}) : null;
        returnValues.fullName = person ? ((person.firstName ? person.firstName : ' ') + (person.lastName ? (" " + person.lastName) : ' ')) : '';
        // Gender
        let genderString = '';
        if (person && person.gender) {
            genderString = getTranslation(person.gender, this.props.translation);
        }
        returnValues.gender = person && genderString ? genderString.charAt(0) : '';
        // Age
        if (person && person.age !== undefined && person.age !== null) {
            if (person.age.years !== undefined || person.age.months !== undefined) {
                if (person.age.years !== 0 && person.age.years !== null && person.age.years !== undefined) {
                    returnValues.age = person.age.years.toString() + getTranslation(config.localTranslationTokens.years, this.props.translation).charAt(0).toLowerCase()
                } else if (person.age.months !== 0 && person.age.months !== null && person.age.months !== undefined) {
                    returnValues.age = person.age.months.toString() + getTranslation(config.localTranslationTokens.months, this.props.translation).charAt(0).toLowerCase()
                }
            }
        }
        // Address
        if (type !== 'LabResult' && person && person.addresses && Array.isArray(person.addresses) && person.addresses.length > 0) {
            let personPlaceOfResidence = person.addresses.find((e) => {return e.typeId === config.userResidenceAddress.userPlaceOfResidence});
            if (personPlaceOfResidence) {
                returnValues.addressString = getAddress(personPlaceOfResidence, true, this.props.locations);
                if(personPlaceOfResidence.phoneNumber){
                    // !IMPORTANT - this gets replaced if there's a person telephone number to show!
                    returnValues.telephoneNumbers = personPlaceOfResidence.phoneNumber;
                }
            }
        }
        if(person?.address){
            let personPlaceOfResidence = person.address;
            if (personPlaceOfResidence) {
                returnValues.addressString = getAddress(personPlaceOfResidence, true, this.props.locations);
                if(personPlaceOfResidence.phoneNumber){
                    // !IMPORTANT - this gets replaced if there's a person telephone number to show!
                    returnValues.telephoneNumbers = personPlaceOfResidence.phoneNumber;
                }
            }
        }
        // Emails
        if (checkArrayAndLength(person?.addresses) && type !== 'LabResult') {
            returnValues.emails = person?.addresses.filter((e) => e.emailAddress).map((e) => e?.emailAddress).join(', ')
        } else if (person?.address) {
            returnValues.emails = person.address.emailAddress
        }
        // Visual Id
        if (person && person.visualId) {
            returnValues.visualId = person.visualId;
        }
        // Id
        if (person && person._id) {
            returnValues.id = person._id;
        }
        // Followup final status
        if (type !== 'Case' && type !== 'LabResult' && person && person.followUp){
            returnValues.status = person.followUp.status ? getTranslation(person.followUp.status, this.props.translation) : null;
        }
        // User institution and phone number
        if (person &&  person.hasOwnProperty('institutionName')){
            returnValues.institutionName =  getTranslation(person.institutionName, this.props.translation);
        }
        // Replaces address telephone number
        if (person &&  person.hasOwnProperty('telephoneNumbers')){
            returnValues.telephoneNumbers = person.telephoneNumbers[translations.usersScreen.primaryPhone];
        }
        //Classification
        if (type === 'LabResult' && person && person.classification){
            returnValues.classification = person.classification ? getTranslation(person.classification, this.props.translation) : null;
        }
        if (type === 'LabResult'){
            const labResultData =  get(itemToRender, 'labResultData', null);
            returnValues.result = labResultData.result ? getTranslation(labResultData.result, this.props.translation) : null;
            returnValues.dateSampleTaken = labResultData.dateSampleTaken ? moment(labResultData.dateSampleTaken).format('YYYY-MM-DD') : undefined;
            returnValues.dateOfResult = labResultData.dateOfResult ? moment(labResultData.dateOfResult).format('YYYY-MM-DD') : undefined;
            returnValues.labName = labResultData.labName;
            returnValues.labResultStatus = labResultData.status ? getTranslation(labResultData.status, this.props.translation) : null;
        }
        if (type === 'Event') {
            const eventData =  get(itemToRender, 'mainData', null);
            returnValues.name = eventData.name;
            returnValues.fullName = eventData.name;
            returnValues.description = eventData.description;
            returnValues.date = eventData.date ? moment(eventData.date).format('YYYY-MM-DD') : undefined
        }
        return returnValues;
    };

    prepareSecondComponentData = (type, itemToRender) => {
        let returnedValues = {};
        let exposures = get(itemToRender, 'exposureData', null);
        // For follow-ups and contact we need to compute exposures
        if (type === 'FollowUp' || type === 'Contact' || type === 'ContactOfContact') {
            returnedValues.exposures = handleExposedTo(exposures, false);
            if (type === 'FollowUp') {
                returnedValues.followUpDay = get(itemToRender, 'followUpData.index', null);
            }
        }
        if(type === 'LabResult') {

        }

        return returnedValues;
    };

    onPressMapIcon = () => {
        InteractionManager.runAfterInteractions(() => {
            if (this.props.onPressMapIconProp) {
                this.props.onPressMapIconProp()
            }
        })
    };
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        backgroundColor: styles.backgroundColor,
        borderRadius: 4
    },
    firstSectionContainer: {
        justifyContent: 'space-between',
    },
    addressStyle: {
        color: styles.textColor,
        fontFamily: 'Roboto-Light',
        fontSize: 14
    },
    secondSectionContainer: {
        justifyContent: 'center'
    },
    thirdSectionContainer: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    rippleStyle: {
        height: '100%',
        justifyContent: 'center'
    },
    rippleTextStyle: {
        color: styles.primaryColor,
        fontFamily: 'Roboto-Medium',
        fontSize: 14
    },
    centerItemContainer: {
        height: '100%',
        justifyContent: 'center'
    },
    primaryText: {
        color: styles.textColor,
        fontFamily: 'Roboto-Medium',
        fontSize: 16
    },
    secondaryText: {
        color: styles.secondaryColor,
        fontFamily: 'Roboto-Regular',
        fontSize: 14
    },
    exposedToTextStyle: {
        color: styles.textColor,
        fontFamily: 'Roboto-Medium',
        fontSize: 14
    }
});

PersonListItem.propTypes = {
    type: PropTypes.string.isRequired
};

PersonListItem.defaultProps = {
    type: 'FollowUp'
};

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        translation: state.app.translation,
        cases: state.exposure,
        contacts: state.contacts,
        events: state.events,
        referenceData: state.referenceData,
        locations: get(state, `locations.locationsList`, [])
    };
}

export default connect(mapStateToProps)(PersonListItem);