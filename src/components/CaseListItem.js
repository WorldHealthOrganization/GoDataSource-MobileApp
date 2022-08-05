/**
 * Created by mobileclarisoft on 23/07/2018.
 */
/**
 * Created by florinpopa on 19/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import { View, Text, StyleSheet,Image, InteractionManager} from 'react-native';
import {ListItem, Icon} from 'react-native-material-ui';
import {calculateDimension, getTranslation} from './../utils/functions';
import config from './../utils/config';
import {connect} from 'react-redux';
import Ripple from 'react-native-material-ripple';
import ElevatedView from 'react-native-elevated-view';
import translations from './../utils/translations'
import {getAddress} from './../utils/functions';
import get from 'lodash/get';
import styles from './../styles';

class CaseListItem extends Component {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    // Please add here the react lifecycle methods that you need


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        const { item, translation, screenSize, role } = this.props;
        let primaryText = item && ((item.firstName ? item.firstName : ' ') + (item.lastName ? (' ' + item.lastName) : ' '));
        let genderString = '';
        if (item && item.gender) {
            genderString = getTranslation(item.gender, translation);
        }
        let secondaryTextGender = item && genderString ? genderString.charAt(0) : '';


        let secondaryTextAge = '';
        if (item && item.age !== undefined && item.age !== null) {
            if (item.age.years !== undefined || item.age.months !== undefined) {
                if (item.age.years !== 0 && item.age.years !== null) {
                    // console.log('Here will be an error years: ', item.age);
                    secondaryTextAge = item.age.years.toString() + getTranslation(config.localTranslationTokens.years, translation).charAt(0).toLowerCase()
                } else if (item.age.months !== undefined && item.age.months !== 0 && item.age.months !== null) {
                    // console.log('Here will be an error months: ', item.age);
                    secondaryTextAge = item.age.months.toString() + getTranslation(config.localTranslationTokens.months, translation).charAt(0).toLowerCase()
                }
            }
        }
        let secondaryText = secondaryTextGender + ((secondaryTextGender.trim().length > 0 && secondaryTextAge.trim().length > 0 ) ? ', ' : '') + secondaryTextAge;

        let addressText = ' ';
        if (item && item.addresses && item.addresses.length > 0) {
            let casePlaceOfResidence = item.addresses.find((e) => {return e.typeId === config.userResidenceAddress.userPlaceOfResidence});
            if (casePlaceOfResidence) {
                addressText = getAddress(casePlaceOfResidence, true, this.props.locations);
            }
        }

        return (
            <ElevatedView elevation={5} style={[style.container, {
                marginHorizontal: calculateDimension(16, false, screenSize),
                height: calculateDimension(178, true, screenSize)
            }]}>
                <View style={[style.firstSectionContainer, {
                    height: calculateDimension(53, true, screenSize),
                    paddingBottom: calculateDimension(18, true, screenSize)
                }]}>
                    <ListItem
                        numberOfLines={1}
                        centerElement={
                            <View style={style.centerItemContainer}>
                                <Text style={[style.primaryText, {flex: 3}]} numberOfLines={1}>{primaryText}</Text>
                                <Text style={[style.primaryText, {marginHorizontal: 7}]}>{'\u2022'}</Text>
                                <Text style={[style.secondaryText, {flex: 1.5}]}>{secondaryText}</Text>
                            </View>
                        }
                        rightElement={
                            <Ripple onPress={this.onPressMapIcon}>
                                <Image source={{uri: 'map_icon'}} style={style.mapIconStyle} />
                            </Ripple>
                        }
                        style={{
                            container: {marginRight: calculateDimension(13, false, screenSize)},
                            rightElementContainer: {justifyContent: 'center', alignItems: 'center'}
                        }}
                    />
                </View>
                <View style={styles.lineStyle}/>
                <View
                    style={[style.secondSectionContainer, {height: calculateDimension(78.5, true, screenSize)}]}>
                    <Text
                        style={[style.addressStyle, {
                            marginHorizontal: calculateDimension(14, false, screenSize),
                            marginVertical: 7.5
                        }]}
                        numberOfLines={2}
                    >{addressText}</Text>
                </View>
                <View style={styles.lineStyle}/>
                <View
                    style={[style.thirdSectionContainer, {marginHorizontal: calculateDimension(14, false, screenSize)}]}>
                    {
                        role.find((e) => e === config.userPermissions.readCase) !== undefined ? (
                            <Ripple style={[style.rippleStyle]} onPress={this.onPressCase}>
                                <Text style={[style.rippleTextStyle]}>
                                    {getTranslation(translations.casesScreen.viewButtonLabel, translation).toUpperCase()}
                                </Text>
                            </Ripple>
                        ) : null
                    }
                    {
                        role.find((e) => e === config.userPermissions.writeContact) !== undefined ? (
                            <Ripple style={[style.rippleStyle]}  onPress={this.onPressAddContact}>
                                <Text style={[style.rippleTextStyle]}>
                                    {getTranslation(translations.casesScreen.addContactButtonLabel, translation).toUpperCase()}
                                </Text>
                            </Ripple>
                        ) : null
                    }
                </View>
            </ElevatedView>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    onPressCase = () => {
        InteractionManager.runAfterInteractions(() => {
            let contact = this.props && this.props.contacts && Array.isArray(this.props.contacts) && this.props.contacts.length > 0 ? this.props.contacts[this.props.contacts.map((e) => {return e.id}).indexOf(this.props.item.personId)] : null;

            console.log('### onPressCase: ', this.props.item, contact, Object.assign({}, this.props.item, contact));

            this.props.onPressCase(this.props.item, contact);
        });
    };

    onPressAddContact = () => {
        InteractionManager.runAfterInteractions(() => {
            let contact = this.props && this.props.contacts && Array.isArray(this.props.contacts) && this.props.contacts.length > 0 ? this.props.contacts[this.props.contacts.map((e) => {return e.id}).indexOf(this.props.item.personId)] : null;

            console.log('### onPressAddContact: ', this.props.item, contact, Object.assign({}, this.props.item, contact));

            this.props.onPressAddContact(this.props.item, contact);
        });
    };

    onPressMapIcon = () => {
        InteractionManager.runAfterInteractions(() => {
            let contact = this.props && this.props.contacts && Array.isArray(this.props.contacts) && this.props.contacts.length > 0 ? this.props.contacts[this.props.contacts.map((e) => {return e.id}).indexOf(this.props.item.personId)] : null;

            console.log('### onPressMapIcon: ', this.props.item, contact, Object.assign({}, this.props.item, contact));

            if (this.props.onPressMap !== undefined) {
                this.props.onPressMap(this.props.item, contact)
            }
        });
    }
}


// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        backgroundColor: styles.backgroundColor,
        borderRadius: 2
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
        alignItems: 'center',
        flexDirection: 'row',
        height: '100%'
    },
    mapIconStyle: {
        height: 31,
        width: 31
    },
    primaryText: {
        color: styles.textColor,
        fontFamily: 'Roboto-Medium',
        fontSize: 18
    },
    secondaryText: {
        color: styles.textColor,
        fontFamily: 'Roboto-Regular',
        fontSize: 14
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        translation: state.app.translation,
        cases: state.cases,
        role: state.role,
        contacts: state.contacts,
        events: state.events,
        locations: get(state, `locations.locationsList`, [])
    };
}

export default connect(mapStateToProps)(CaseListItem);
