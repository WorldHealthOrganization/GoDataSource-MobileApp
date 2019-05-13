/**
 * Created by florinpopa on 23/08/2018.
 */
/**
 * Created by florinpopa on 03/08/2018.
 */
import React, {PureComponent} from 'react';
import {View, Text, StyleSheet, Image, InteractionManager} from 'react-native';
import PropTypes from 'prop-types';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import styles from './../styles';
import {ListItem} from 'react-native-material-ui';
import ElevatedView from 'react-native-elevated-view';
import ActionsBar from './ActionsBar';
import translations from './../utils/translations'
import {getTranslation, calculateDimension} from './../utils/functions';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import GeneralListItem from './GeneralListItem';
import Ripple from 'react-native-material-ripple';
import {extractIdFromPouchId, getAddress, handleExposedTo} from "../utils/functions";
import config from "../utils/config";

PersonListItem = ({type, itemToRender, titleColor, screenSize, translations, cases, events, contacts, locations, onPressMapIconProp, onPressNameProp, onPressExposureProp, textsArray, textsStyleArray, onPressTextsArray}) => {
    let firstComponentData = prepareFirstComponentData(type, itemToRender, translations, cases, contacts, locations);
    let secondComponentData = prepareSecondComponentData(type, itemToRender, translations, cases, events, contacts)
    return (
        <GeneralListItem
            containerStyle={{
                marginHorizontal: calculateDimension(16, false, screenSize)
            }}
            firstComponent={
                <FirstComponent
                    type={type}
                    titleColor={titleColor}
                    firstComponentRenderData={firstComponentData}
                    onPressMapIcon={() => {onPressMapIcon(type, onPressMapIconProp, itemToRender, contacts)}}
                    onPressNameProp={onPressNameProp}
                    screenSize={screenSize}
                    translation={translations}
                />
            }
            secondComponent={type !== 'Case' ? (
                <SecondComponent
                    data={secondComponentData}
                    translation={translations}
                    screenSize={screenSize}
                    onPressExposureProp={onPressExposureProp}
                />) : (null)
            }
            hasActionsBar={true}
            textsArray={textsArray}
            textsStyleArray={textsStyleArray}
            onPressArray={onPressTextsArray}
        />
    )
};


FirstComponent = ({type, firstComponentRenderData, titleColor, onPressMapIcon, onPressNameProp, screenSize, translation}) => (
    <View>
        <View style={{
            flexDirection: 'row',
            marginHorizontal: calculateDimension(16, false, screenSize),
            justifyContent: 'space-between',
            marginVertical: 5
        }}>
            <View style={{flex: 1}}>
                <Ripple onPress={() => handleOnPressName(firstComponentRenderData.type, onPressNameProp, firstComponentRenderData.id)}>
                    <Text style={[style.primaryText, {marginVertical: 5, flex: 3, color: titleColor || 'black'}]}
                          numberOfLines={1}>{firstComponentRenderData.fullName}</Text>
                </Ripple>
                <View style={{flexDirection: 'row'}}>
                    <Text
                        style={[style.secondaryText, {marginHorizontal: 7, display: !firstComponentRenderData.gender && !firstComponentRenderData.age ? 'none' : 'flex'}]}
                        numberOfLines={1}
                    >{'\u2022 ' + firstComponentRenderData.gender + ' ' + firstComponentRenderData.age}</Text>
                    <Text
                        style={[style.secondaryText, {marginHorizontal: 7, display: firstComponentRenderData.visualId ? 'flex' : 'none'}]}
                        numberOfLines={1}
                    >{'\u2022 ' + ' ID: ' + firstComponentRenderData.visualId}</Text>
                </View>
                <Text style={[style.secondaryText, {
                    flex: 1,
                    marginHorizontal: 7,
                    display: firstComponentRenderData.addressString ? 'flex' : 'none'
                }]}>{'\u2022 ' + getTranslation(translations.addressFieldLabels.address, translation) + ": " + firstComponentRenderData.addressString}</Text>
            </View>
            <Ripple style={{width: 35, height: 35}} onPress={onPressMapIcon}>
                <Image source={{uri: 'map_icon'}} style={{width: 35, height: 35}}/>
            </Ripple>
        </View>
        {
            type !== 'Case' ? (
                <View style={styles.lineStyle} />
            ) : (null)
        }
    </View>
);

// The method returns an Array of values needed for the first component {fullName, gender, age, visualId, addressString, primaryColor}
prepareFirstComponentData = (type, itemToRender, translation, cases, contacts, locations) => {
    let returnValues = {
        fullName: '',
        id: '',
        gender: '',
        age: '',
        visualId: '',
        addressString: '',
        primaryColor: 'black'
    };
        // Get followUp's contact
        let person = type === 'Contact' || type === 'Case' ? itemToRender : contacts && Array.isArray(contacts) && contacts.length > 0 ?  contacts.find((e) => {return extractIdFromPouchId(e._id, 'person') === itemToRender.personId}) : null;
        returnValues.fullName = person ? ((person.firstName ? person.firstName : ' ') + (person.lastName ? (" " + person.lastName) : ' ')) : '';
        let genderString = '';
        if (person && person.gender) {
            genderString = getTranslation(person.gender, translation);
        }

        returnValues.gender = person && genderString ? genderString.charAt(0) : '';
        if (person && person.age !== undefined && person.age !== null) {
            if (person.age.years !== undefined || person.age.months !== undefined) {
                if (person.age.years !== 0 && person.age.years !== null) {
                    returnValues.age = person.age.years.toString() + getTranslation(config.localTranslationTokens.years, translation).charAt(0).toLowerCase()
                } else if (person.age.months !== 0 && person.age.months !== null) {
                    returnValues.age = person.age.months.toString() + getTranslation(config.localTranslationTokens.months, translation).charAt(0).toLowerCase()
                }
            }
        }

        if (person && person.addresses && Array.isArray(person.addresses) && person.addresses.length > 0) {
            let personPlaceOfResidence = person.addresses.find((e) => {return e.typeId === config.userResidenceAddress.userPlaceOfResidence});
            if (personPlaceOfResidence) {
                returnValues.addressString = getAddress(personPlaceOfResidence, true, locations);
            }
        }

        if (person && person.visualId) {
            returnValues.visualId = person.visualId;
        }

        if (person && person._id) {
            returnValues.id = person._id;
        }

    return returnValues;
};

onPressMapIcon = (type, onPressMapIcon, itemToRender, contacts) => {
    InteractionManager.runAfterInteractions(() => {
        let person = type === 'Contact' || type === 'Case' ? itemToRender : contacts && Array.isArray(contacts) && contacts.length > 0 ?  contacts.find((e) => {return extractIdFromPouchId(e._id, 'person') === itemToRender.personId}) : null;

        if (onPressMapIcon !== undefined) {
            onPressMapIcon(person)
        }
    })
};

handleOnPressName = (type, onPressNameProp, personId) => {
    InteractionManager.runAfterInteractions(() => {
        onPressNameProp(type, personId);
    })
};

SecondComponent = ({data, translation, screenSize, onPressExposureProp}) => (
    <View style={{
        marginHorizontal: calculateDimension(16, false, screenSize),
        justifyContent: 'space-between',
        marginVertical: 5
    }}>
        {
            data && data.followUpDay ? (
                <View>
                    <Text style={[style.secondaryText, {marginVertical: 5, marginHorizontal: 7}]} numberOfLines={1}>{'Day of follow-up: ' + data.followUpDay}</Text>
                </View>
            ) : (null)
        }
        {
            data && data.exposures && Array.isArray(data.exposures) && data.exposures.length > 0 ? (
                <View>
                    <Text style={style.exposedToTextStyle}>{getTranslation(translations.followUpsScreen.exposedToMessage, translation) + ":"}</Text>
                    {
                        data.exposures.map((exposure, index) => {
                            return renderExposures(exposure, onPressExposureProp);
                        })
                    }
                </View>
            ) : (null)
        }
    </View>
);

// Second component is needed
prepareSecondComponentData = (type, itemToRender, translation, cases, events, contacts) => {
    let returnedValues = {};
    let person = type === 'Contact' || type === 'Case' ? itemToRender : contacts && Array.isArray(contacts) && contacts.length > 0 ?  contacts.find((e) => {return extractIdFromPouchId(e._id, 'person') === itemToRender.personId}) : null;
    // For follow-ups and contact we need to compute exposures
    if (type === 'FollowUp' || type === 'Contact') {
        if (cases && events && person && person.relationships && Array.isArray(person.relationships) && person.relationships.length > 0) {
            returnedValues.exposures = handleExposedTo(person, false, cases, events);
        }
        if (type === 'FollowUp' && itemToRender.index) {
            returnedValues.followUpDay = itemToRender.index
        }
    }

    return returnedValues;
};

renderExposures = (exposure, onPressExposureProp) => {
    return(
        <Ripple onPress={() => onPressExposureProp(exposure.id)}>
            <Text style={[style.secondaryText, {marginVertical: 5, marginHorizontal: 7}]} numberOfLines={1}>{`\u2022 ${exposure.fullName} ${exposure.visualId ? `(${exposure.visualId})` : ''}`}</Text>
        </Ripple>
    )
};

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
        cases: state.cases,
        contacts: state.contacts,
        events: state.events,
        referenceData: state.referenceData,
        locations: state.locations.locationsList
    };
}

export default connect(mapStateToProps)(PersonListItem);