/**
 * Created by florinpopa on 23/08/2018.
 */
/**
 * Created by florinpopa on 03/08/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {InteractionManager, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import styles from './../styles';
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
                        onPressMapIcon={this.onPressMapIcon}
                        onPressName={this.props.onPressNameProp}
                    />
                }
                secondComponent={this.props.type !== 'Case' && this.props.type !== 'User' ? (
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
            primaryColor: 'black',
            status: null,
            institutionName: '',
            telephoneNumbers: '',
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
        if (person && person.addresses && Array.isArray(person.addresses) && person.addresses.length > 0) {
            let personPlaceOfResidence = person.addresses.find((e) => {return e.typeId === config.userResidenceAddress.userPlaceOfResidence});
            if (personPlaceOfResidence) {
                returnValues.addressString = getAddress(personPlaceOfResidence, true, this.props.locations);
            }
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
        if (type !== 'Case' && person && person.followUp){
            returnValues.status = person.followUp.status ? getTranslation(person.followUp.status, this.props.translation) : null;
        }
        // User institution and phone number
        if (person &&  person.hasOwnProperty('institutionName')){
            returnValues.institutionName =  getTranslation(person.institutionName, this.props.translation);
        }
        if (person &&  person.hasOwnProperty('telephoneNumbers')){
            returnValues.telephoneNumbers = person.telephoneNumbers[translations.usersScreen.primaryPhone];
        }
        return returnValues;
    };

    prepareSecondComponentData = (type, itemToRender) => {
        let returnedValues = {};
        let exposures = get(itemToRender, 'exposureData', null);
        // For follow-ups and contact we need to compute exposures
        if (type === 'FollowUp' || type === 'Contact') {
            returnedValues.exposures = handleExposedTo(exposures, false);
            if (type === 'FollowUp') {
                returnedValues.followUpDay = get(itemToRender, 'followUpData.index', null);
            }
        }

        return returnedValues;
    };

    onPressMapIcon = () => {
        InteractionManager.runAfterInteractions(() => {
            if (this.props.onPressMapIconProp !== undefined) {
                this.props.onPressMapIconProp()
            }
        })
    };
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 2
    },
    firstSectionContainer: {
        justifyContent: 'space-between',
    },
    addressStyle: {
        fontFamily: 'Roboto-Light',
        fontSize: 12,
        color: styles.navigationDrawerItemText
    },
    secondSectionContainer: {
        justifyContent: 'center'
    },
    thirdSectionContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    rippleStyle: {
        height: '100%',
        justifyContent: 'center'
    },
    rippleTextStyle: {
        fontFamily: 'Roboto-Medium',
        fontSize: 12,
        color: styles.buttonGreen
    },
    centerItemContainer: {
        height: '100%',
        justifyContent: 'center'
    },
    primaryText: {
        fontFamily: 'Roboto-Medium',
        fontSize: 18,
        color: 'black'
    },
    secondaryText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        color: styles.buttonTextGray
    },
    exposedToTextStyle: {
        fontFamily: 'Roboto-Medium',
        fontSize: 15,
        color: 'black'
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