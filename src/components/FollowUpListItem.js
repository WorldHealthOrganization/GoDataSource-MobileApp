/**
 * Created by florinpopa on 19/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {TextInput, View, Text, StyleSheet, Platform, Dimensions, Image, InteractionManager} from 'react-native';
import {ListItem, Icon} from 'react-native-material-ui';
import {calculateDimension, handleExposedTo, getAddress, extractIdFromPouchId} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {TextField} from 'react-native-material-textfield';
import Button from './Button';
import styles from './../styles';
import Ripple from 'react-native-material-ripple';
import ElevatedView from 'react-native-elevated-view';

class FollowUpListItem extends PureComponent {

    // This will be a dumb component, so it's best to put as least business logic as possible
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
        // Get contact info from the follow-ups

        let contact = {};

        if (this.props.isContact) {
            contact = this.props.item;
        } else {
            contact = this.props && this.props.contacts && Array.isArray(this.props.contacts) && this.props.contacts.length > 0 ? this.props.contacts[this.props.contacts.map((e) => {
                return extractIdFromPouchId(e._id, 'person')
            }).indexOf(this.props.item.personId)] : null;
        }
        // if (contact) {
            let primaryText = contact ? ((contact.firstName ? contact.firstName : ' ') + (contact.lastName ? (" " + contact.lastName) : ' ')) : '';
            let genderString = '';
            if (contact && contact.gender) {
                genderString = this.getTranslation(contact.gender);
            }
            let secondaryText = contact ? ((genderString ? genderString.charAt(0) : ' ') + (contact.age && contact.age.years ? (", " + contact.age.years) : ' ')) : '';


            let addressText = '';

            let followUpContact = this.props && this.props.contacts && Array.isArray(this.props.contacts) && this.props.contacts.length > 0 ? 
                this.props.contacts[this.props.contacts.map((e) => {return extractIdFromPouchId(e._id, 'person')}).indexOf(this.props.item.personId)] : null;

            if (followUpContact) {
                let contactPlaceOfResidence = followUpContact.addresses.filter((e) => {return e.typeId === config.userResidenceAddress.userPlaceOfResidence})
                if (contactPlaceOfResidence && contactPlaceOfResidence[0]) {
                    addressText = getAddress(contactPlaceOfResidence[0], true);
                }
            }
           
            if (this.props.isContact && contact && contact.addresses && Array.isArray(contact.addresses)) {
                let contactPlaceOfResidence = contact.addresses.filter((e) => {return e.typeId === config.userResidenceAddress.userPlaceOfResidence})
                addressText = getAddress(contactPlaceOfResidence[0], true);
            }

            let relationshipText = '';
            if (this.props && this.props.cases && this.props.events && contact && contact.relationships && Array.isArray(contact.relationships) && contact.relationships.length > 0) {
                relationshipText = handleExposedTo(contact, true, this.props.cases, this.props.events);
            }

        // }
        return (
            <ElevatedView elevation={3} style={[style.container, {
                marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                height: calculateDimension(178, true, this.props.screenSize)
            }]}>
                <View style={[style.firstSectionContainer, {
                    height: calculateDimension(53, true, this.props.screenSize),
                    paddingBottom: calculateDimension(18, true, this.props.screenSize)
                }]}>
                    <ListItem
                        numberOfLines={1}
                        centerElement={
                            <View style={style.centerItemContainer}>
                                <Text style={[style.primaryText, {flex: 3}]} numberOfLines={1}>{primaryText}</Text>
                                <Text style={[style.primaryText, {marginHorizontal: 7}]}>{'\u2022'}</Text>
                                <Text style={[style.secondaryText, {flex: 1}]}>{secondaryText}</Text>
                            </View>
                        }
                        rightElement={
                            <Ripple onPress={this.onPressMapIcon}>
                                <Image source={{uri: 'map_icon'}} style={{width: 31, height: 31}}/>
                            </Ripple>
                                }
                        style={{
                            container: {marginRight: calculateDimension(13, false, this.props.screenSize)},
                            rightElementContainer: {justifyContent: 'center', alignItems: 'center'}
                        }}
                    />
                </View>
                <View style={styles.lineStyle}/>
                <View
                    style={[style.secondSectionContainer, {height: calculateDimension(78.5, true, this.props.screenSize)}]}>
                    <Text
                        style={[style.addressStyle, {
                            marginHorizontal: calculateDimension(14, false, this.props.screenSize),
                            marginVertical: 7.5
                        }]}
                        numberOfLines={2}
                    >{addressText}</Text>
                    <Text
                        style={[style.addressStyle, {
                            marginHorizontal: calculateDimension(14, false, this.props.screenSize),
                            marginVertical: 7.5
                        }]}
                        numberOfLines={2}
                    >{'Exposed to: ' + relationshipText}</Text>
                </View>
                <View style={styles.lineStyle}/>
                <View
                    style={[style.thirdSectionContainer, {marginHorizontal: calculateDimension(14, false, this.props.screenSize)}]}>
                    <Ripple style={[style.rippleStyle]} onPress={this.onPressFollowUp}>
                        <Text style={[style.rippleTextStyle]}>{this.props.firstActionText || 'FOLLOW-UP'}</Text>
                    </Ripple>
                    <Ripple style={[style.rippleStyle]} onPress={this.onPressMissing}>
                        <Text style={[style.rippleTextStyle]}>{this.props.secondActionText || 'MISSING'}</Text>
                    </Ripple>
                    <Ripple style={[style.rippleStyle]} onPress={this.onPressExposure}>
                        <Text style={[style.rippleTextStyle]}>{this.props.thirdActionText || 'ADD EXPOSURE'}</Text>
                    </Ripple>
                </View>
            </ElevatedView>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    onPressFollowUp = () => {
        InteractionManager.runAfterInteractions(() => {
            let contact = this.props && this.props.contacts && Array.isArray(this.props.contacts) && this.props.contacts.length > 0 ? 
                this.props.contacts[this.props.contacts.map((e) => {return extractIdFromPouchId(e._id, 'person')}).indexOf(this.props.item.personId)] : null;

            this.props.onPressFollowUp(this.props.item, contact);
        });
    };

    onPressMissing = () => {
        InteractionManager.runAfterInteractions(() => {

            let contact = this.props && this.props.contacts && Array.isArray(this.props.contacts) && this.props.contacts.length > 0 ? 
                this.props.contacts[this.props.contacts.map((e) => {return extractIdFromPouchId(e._id, 'person')}).indexOf(this.props.item.personId)] : null;

            this.props.onPressMissing(this.props.item, contact);
        })
    };

    onPressExposure = () => {
        InteractionManager.runAfterInteractions(() => {
            let contact = this.props && this.props.contacts && Array.isArray(this.props.contacts) && this.props.contacts.length > 0 ? 
                this.props.contacts[this.props.contacts.map((e) => {return extractIdFromPouchId(e._id, 'person')}).indexOf(this.props.item.personId)] : null;

            this.props.onPressExposure(this.props.item, contact);
        })
    };

    onPressMapIcon = () => {
        InteractionManager.runAfterInteractions(() => {
            let contact = this.props && this.props.contacts && Array.isArray(this.props.contacts) && this.props.contacts.length > 0 ? 
                this.props.contacts[this.props.contacts.map((e) => {return extractIdFromPouchId(e._id, 'person')}).indexOf(this.props.item.personId)] : null;

            if (this.props.onPressMap !== undefined) {
                this.props.onPressMap(this.props.item, contact)
            }
        })
    }

    getTranslation = (value) => {
        let valueToBeReturned = value;
        if (value && typeof value === 'string' && value.includes('LNG')) {
            valueToBeReturned = value && this.props.translation && Array.isArray(this.props.translation) && this.props.translation[this.props.translation.map((e) => {return e && e.token ? e.token : null}).indexOf(value)] ? this.props.translation[this.props.translation.map((e) => {
                return e.token
            }).indexOf(value)].translation : '';
        }
        return valueToBeReturned;
    }
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
        flexDirection: 'row',
        height: '100%',
        alignItems: 'center'
    },
    primaryText: {
        fontFamily: 'Roboto-Medium',
        fontSize: 18,
        color: 'black'
    },
    secondaryText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 13,
        color: 'black'
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        translation: state.app.translation,
        contacts: state.contacts,
        cases: state.cases,
        events: state.events
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(FollowUpListItem);
