/**
 * Created by florinpopa on 23/08/2018.
 */
/**
 * Created by florinpopa on 03/08/2018.
 */
import React, {Component} from 'react';
import {StyleSheet, Image, InteractionManager} from 'react-native';
import PropTypes from 'prop-types';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import styles from './../styles';
import {getTranslation, calculateDimension} from './../utils/functions';
import {connect} from "react-redux";
import GeneralListItem from './GeneralListItem';
import {extractIdFromPouchId, getAddress, handleExposedTo} from "../utils/functions";
import config from "../utils/config";
import PersonListItemNameAndAddressComponent from './PersonListItemNameAndAddressComponent';
import PersonListItemExposuresComponent from './PersonListItemExposuresComponent';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';


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
                secondComponent={this.props.type !== 'Case' ? (
                    <PersonListItemExposuresComponent
                        data={secondComponentData}
                        onPressExposureProp={this.props.onPressExposureProp}
                    />) : (null)
                }
                hasActionsBar={true}
                textsArray={this.props.textsArray}
                textsStyleArray={this.props.textsStyleArray}
                onPressArray={this.props.onPressTextsArray}
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
            status: null
        };
        // Get followUp's contact
        let person = type === 'Contact' || type === 'Case' ? itemToRender : this.props.contacts && Array.isArray(this.props.contacts) && this.props.contacts.length > 0 ?  this.props.contacts.find((e) => {return extractIdFromPouchId(e._id, 'person') === itemToRender.personId}) : null;
        // Full name
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
        if (type === 'Contact' && person && person.followUp){
            returnValues.status = person.followUp.status ? getTranslation(person.followUp.status, this.props.translations) : null;
        }

        // console.log(' ~~~~~~~~~', returnValues);
        return returnValues;
    };

    prepareSecondComponentData = (type, itemToRender) => {
        let returnedValues = {};
        let person = type === 'Contact' || type === 'Case' ? itemToRender : this.props.contacts && Array.isArray(this.props.contacts) && this.props.contacts.length > 0 ?  this.props.contacts.find((e) => {return extractIdFromPouchId(e._id, 'person') === itemToRender.personId}) : null;
        // For follow-ups and contact we need to compute exposures
        if (type === 'FollowUp' || type === 'Contact') {
            if (this.props.cases && this.props.events && person && person.relationships && Array.isArray(person.relationships) && person.relationships.length > 0) {
                returnedValues.exposures = handleExposedTo(person, false, this.props.cases, this.props.events);
            }
            if (type === 'FollowUp' && itemToRender.index) {
                returnedValues.followUpDay = itemToRender.index
            }
        }

        return returnedValues;
    };

    onPressMapIcon = () => {
        InteractionManager.runAfterInteractions(() => {
            let person = this.props.type === 'Contact' || this.props.type === 'Case' ? this.props.itemToRender : this.props.contacts && Array.isArray(this.props.contacts) && this.props.contacts.length > 0 ?  this.props.contacts.find((e) => {return extractIdFromPouchId(e._id, 'person') === this.props.itemToRender.personId}) : null;

            if (this.props.onPressMapIconProp !== undefined) {
                this.props.onPressMapIconProp(person)
            }
        })
    };

    handleOnPressName = (type, personId) => {
        InteractionManager.runAfterInteractions(() => {
            this.props.onPressNameProp(type, personId);
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