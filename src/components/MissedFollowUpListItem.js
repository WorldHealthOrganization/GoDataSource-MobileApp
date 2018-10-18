/**
 * Created by florinpopa on 19/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {TextInput, View, Text, StyleSheet, Platform, Dimensions, Image} from 'react-native';
import {ListItem, Icon} from 'react-native-material-ui';
import {calculateDimension, extractIdFromPouchId} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {TextField} from 'react-native-material-textfield';
import Button from './Button';
import styles from './../styles';
import Ripple from 'react-native-material-ripple';
import ElevatedView from 'react-native-elevated-view';
import Ionicons from 'react-native-vector-icons/Ionicons';

class MissedFollowUpListItem extends PureComponent {

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

        let contact = this.props && this.props.contacts && Array.isArray(this.props.contacts) && this.props.contacts.length > 0 ? this.props.contacts[this.props.contacts.map((e) => {return extractIdFromPouchId(e._id, 'person')}).indexOf(this.props.item.personId)] : null;
        let primaryText = contact && ((contact.firstName ? contact.firstName : ' ') + (contact.lastName ? (" " + contact.lastName) : ' '));

        let currentFollowUpIndex = contact && contact.followUps && Array.isArray(contact.followUps) && contact.followUps.length > 0 ? contact.followUps.map((e) => {return e.personId}).indexOf(this.props.item.personId) : 0;
        let lastFollowUp = '';
        let nextFollowUp = '';

        if (contact && contact.followUps !== undefined) {
            // Get last follow-up date and next follow-up date
            if (contact.followUps && Array.isArray(contact.followUps) && contact.followUps.length === 2) {
                currentFollowUpIndex === 0 ? contact.followUps[1].date ? nextFollowUp = contact.followUps[1].date : ' ' : contact.followUps[0].date ? lastFollowUp = contact.followUps[0].date : ' ';
            } else {
                lastFollowUp = contact && contact.followUps && Array.isArray(contact.followUps) && currentFollowUpIndex === 0 ? " " : contact.followUps[currentFollowUpIndex - 1] ? contact.followUps[currentFollowUpIndex - 1].date : '' ;
                nextFollowUp = contact && contact.followUps && Array.isArray(contact.followUps) && currentFollowUpIndex === (contact.followUps.length - 1) ? " " : contact.followUps[currentFollowUpIndex + 1] ? contact.followUps[currentFollowUpIndex + 1].date : ''
            }
        }


        return (
            <ElevatedView elevation={3} style={[style.container, {
                marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                height: calculateDimension(157, true, this.props.screenSize)
            }]}>
                <View style={[style.firstSectionContainer, {
                    height: calculateDimension(53, true, this.props.screenSize),
                    paddingBottom: calculateDimension(18, true, this.props.screenSize)
                }]}>
                    <ListItem
                        numberOfLines={1}
                        centerElement={
                            <View style={style.centerItemContainer}>
                                <Text style={style.primaryText}>{primaryText}</Text>
                            </View>
                        }
                        rightElement={
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Ionicons name="ios-close-circle-outline" color={styles.missedRedColor} size={13}/>
                                <Text style={style.missedTextStyle}>Missed</Text>
                            </View>
                        }
                        style={{
                            container: {marginRight: calculateDimension(13, false, this.props.screenSize)},
                            rightElementContainer: {justifyContent: 'center', alignItems: 'center'}
                        }}
                    />
                </View>
                <View style={styles.lineStyle}/>
                <View
                    style={[style.secondSectionContainer, {
                        height: calculateDimension(52, true, this.props.screenSize),
                        marginHorizontal: calculateDimension(14, false, this.props.screenSize)
                    }]}>
                    <Text style={style.followUpPrefix}>Last follow-up: </Text>
                    <Text style={style.followUpSuffix}>{lastFollowUp}</Text>
                </View>
                <View style={styles.lineStyle}/>
                <View
                    style={[style.thirdSectionContainer, {marginHorizontal: calculateDimension(14, false, this.props.screenSize)}]}>
                    <Text style={style.followUpPrefix}>Next follow-up: </Text>
                    <Text style={style.followUpSuffix}>{nextFollowUp}</Text>
                </View>
            </ElevatedView>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    onPressFollowUp = () => {
        let contact = this.props && this.props.contacts && Array.isArray(this.props.contacts) && this.props.contacts.length > 0 ? this.props.contacts[this.props.contacts.map((e) => {return e.id}).indexOf(this.props.item.personId)] : null;

        this.props.onPressFollowUp(Object.assign({}, this.props.item, contact));
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
        flexDirection: 'row',
        alignItems: 'center'
    },
    thirdSectionContainer: {
        flex: 1,
        flexDirection: 'row',
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
    },
    missedTextStyle: {
        fontFamily: 'Roboto-Medium',
        fontSize: 12,
        color: styles.missedRedColor,
        marginLeft: 4.5
    },
    followUpPrefix: {
        fontFamily: 'Roboto-Light',
        fontSize: 12.5,
        color: styles.navigationDrawerItemText
    },
    followUpSuffix: {
        fontFamily: 'Roboto-Medium',
        fontSize: 12.5,
        color: styles.navigationDrawerItemText
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        contacts: state.contacts
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(MissedFollowUpListItem);
/**
 * Created by florinpopa on 23/07/2018.
 */
