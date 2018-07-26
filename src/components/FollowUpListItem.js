/**
 * Created by florinpopa on 19/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {TextInput, View, Text, StyleSheet, Platform, Dimensions, Image} from 'react-native';
import {ListItem, Icon} from 'react-native-material-ui';
import {calculateDimension} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {TextField} from 'react-native-material-textfield';
import Button from './Button';
import styles from './../styles';
import Ripple from 'react-native-material-ripple';
import ElevatedView from 'react-native-elevated-view';

class FollowUpListItem extends PureComponent {

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
        // Get contact info from the follow-ups

        let contact = this.props && this.props.contacts && Array.isArray(this.props.contacts) && this.props.contacts.length > 0 ? this.props.contacts[this.props.contacts.map((e) => {return e.id}).indexOf(this.props.item.personId)] : null;
        let primaryText = contact && ((contact.firstName ? contact.firstName : ' ') + (contact.lastName ? (" " + contact.lastName) : ' '));
        let secondaryText = contact && ((contact.gender ? contact.gender.charAt(0) : ' ') + (contact.age ? (", " + contact.age) : ' '));

        let addressText = ' ';
        let addressArray = [];

        if (this.props && this.props.item && this.props.item.address) {
            addressArray = [this.props.item.address.addressLine1, this.props.item.address.addressLine2, this.props.item.address.city, this.props.item.address.country, this.props.item.address.postalCode];
            addressArray = addressArray.filter((e) => {return e});
        }

        addressText = addressArray.join(', ');

        let relationshipText = this.handleExposedTo(contact);

        return (
            <ElevatedView elevation={3} style={[style.container, {
                marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                height: calculateDimension(178, true, this.props.screenSize)
            }]}>
                <Ripple onPress={this.onPressFollowUp}>
                    <View style={[style.firstSectionContainer, {
                        height: calculateDimension(53, true, this.props.screenSize),
                        paddingBottom: calculateDimension(18, true, this.props.screenSize)
                    }]}>
                        <ListItem
                            numberOfLines={1}
                            centerElement={
                                <View style={style.centerItemContainer}>
                                    <Text style={style.primaryText}>{primaryText}</Text>
                                    <Text style={[style.primaryText, {marginHorizontal: 7}]}>{'\u2022'}</Text>
                                    <Text style={style.secondaryText}>{secondaryText}</Text>
                                </View>
                            }
                            rightElement={<Image source={{uri: 'map_icon'}} style={{width: 31, height: 31}}/>}
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
                            }]}>{addressText}</Text>
                        <Text
                            style={[style.addressStyle, {
                                marginHorizontal: calculateDimension(14, false, this.props.screenSize),
                                marginVertical: 7.5
                            }]}>{'Exposed to: ' + relationshipText}</Text>
                    </View>
                    <View style={styles.lineStyle}/>
                </Ripple>
                <View
                    style={[style.thirdSectionContainer, {marginHorizontal: calculateDimension(14, false, this.props.screenSize)}]}>
                    <Ripple style={[style.rippleStyle]}>
                        <Text style={[style.rippleTextStyle]}>FOLLOW-UP</Text>
                    </Ripple>
                    <Ripple style={[style.rippleStyle]}>
                        <Text style={[style.rippleTextStyle]}>MISSING</Text>
                    </Ripple>
                    <Ripple style={[style.rippleStyle]}>
                        <Text style={[style.rippleTextStyle]}>ADD EXPOSURE</Text>
                    </Ripple>
                </View>
            </ElevatedView>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleExposedTo = (contact) => {
        if (!contact || !contact.relationships || !Array.isArray(contact.relationships) || contact.relationships.length === 0) {
            return ' ';
        }

        let relationshipText = '';
        let relationshipArray = [];

        let relationships = contact.relationships;

        for (let i=0; i<relationships.length; i++) {
            // Get only the persons that the contact has been exposed to
            let persons = relationships[i].persons.filter((e) => {return e.id !== contact.id});
            for (let j=0; j<persons.length; j++) {
                if (persons[j].type === 'case' && this.props && this.props.cases && Array.isArray(this.props.cases)) {
                    let auxCase = this.props.cases[this.props.cases.map((e) => {return e.id}).indexOf(persons[j].id)];
                    relationshipArray.push((auxCase.firstName || '') + " " + (auxCase.lastName || ''));
                } else {
                    if (this.props && this.props.events && Array.isArray(this.props.events)) {
                        let auxEvent = this.props.events[this.props.events.map((e) => {
                            return e.id
                        }).indexOf(persons[j].id)];
                        if (auxEvent && auxEvent.name) {
                            relationshipArray.push(auxEvent.name);
                        }
                    }
                }
            }
        }

        return relationshipArray.join(", ");
    };

    onPressFollowUp = () => {
        let contact = this.props && this.props.contacts && Array.isArray(this.props.contacts) && this.props.contacts.length > 0 ? this.props.contacts[this.props.contacts.map((e) => {return e.id}).indexOf(this.props.item.personId)] : null;

        this.props.onPressFollowUp({followUp: this.props.item, contact: contact});
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
