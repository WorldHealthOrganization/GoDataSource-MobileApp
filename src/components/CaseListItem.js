/**
 * Created by mobileclarisoft on 23/07/2018.
 */
/**
 * Created by florinpopa on 19/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {TextInput, View, Text, StyleSheet, Platform, Dimensions, InteractionManager} from 'react-native';
import {ListItem, Icon} from 'react-native-material-ui';
import {calculateDimension} from './../utils/functions';
import config from './../utils/config';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {TextField} from 'react-native-material-textfield';
import Button from './Button';
import styles from './../styles';
import Ripple from 'react-native-material-ripple';
import ElevatedView from 'react-native-elevated-view';

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
        // Get caseItem info from the cases

        let primaryText = this.props.item && ((this.props.item.firstName ? this.props.item.firstName : ' ') + (this.props.item.lastName ? (' ' + this.props.item.lastName) : ' '));
        let secondaryText = this.props.item && ((this.props.item.gender ? this.props.item.gender : ' ') + (this.props.item.age ? (' ' + this.props.item.age + ' y.o.') : ' '));

        let addressText = ' ';
        let addressArray = []

        if (this.props && this.props.item && this.props.item.addresses && this.props.item.addresses.length > 0) {
            addressArray = [this.props.item.addresses[0].addressLine1, this.props.item.addresses[0].addressLine2, this.props.item.addresses[0].city, this.props.item.addresses[0].country, this.props.item.addresses[0].postalCode];
            addressArray = addressArray.filter((e) => {return e});
        }

        addressText = addressArray.join(', ');

        return (
            <ElevatedView elevation={3} style={[style.container, {
                marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                height: calculateDimension(203, true, this.props.screenSize)
            }]}>
                <View style={[style.firstSectionContainer, {
                    height: calculateDimension(75, true, this.props.screenSize),
                    paddingBottom: calculateDimension(18, true, this.props.screenSize)
                }]}>
                    <ListItem
                        numberOfLines={2}
                        centerElement={{
                            primaryText,
                            secondaryText
                        }}
                        rightElement={<Icon name='location-on' size={32} color={styles.buttonGreen}/>}
                        style={{
                            container: {},
                            primaryText: {fontFamily: 'Roboto-Medium', fontSize: 18, color: 'black'},
                            secondaryText: {fontFamily: 'Roboto-Regular', fontSize: 13, color: 'black'},
                            centerElementContainer: {height: '100%', justifyContent: 'center'}
                        }}
                    />
                </View>
                <View style={styles.lineStyle}/>
                <View style={[style.secondSectionContainer, {height: calculateDimension(70, true, this.props.screenSize)}]}>
                    <Text
                        style={[style.addressStyle, {marginHorizontal: calculateDimension(14, false, this.props.screenSize)}]}>{addressText}</Text>
                </View>
                <View style={styles.lineStyle}/>
                <View
                    style={[style.thirdSectionContainer, {marginHorizontal: calculateDimension(14, false, this.props.screenSize)}]}>
                    <Ripple style={[style.rippleStyle]} onPress={this.onPressCase}>
                        <Text style={[style.rippleTextStyle]}>VIEW</Text>
                    </Ripple>
                    <Ripple style={[style.rippleStyle]}  onPress={this.onPressAddContact}>
                        <Text style={[style.rippleTextStyle]}>ADD CONTACT</Text>
                    </Ripple>
                    <Ripple style={[style.rippleStyle]}>
                        <Text style={[style.rippleTextStyle]}>ACTION 3</Text>
                    </Ripple>
                </View>
            </ElevatedView>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    onPressCase = () => {
        InteractionManager.runAfterInteractions(() => {
            let contact = this.props && this.props.contacts && Array.isArray(this.props.contacts) && this.props.contacts.length > 0 ? this.props.contacts[this.props.contacts.map((e) => {return e.id}).indexOf(this.props.item.personId)] : null;

            console.log('### onPressCases: ', this.props.item, contact, Object.assign({}, this.props.item, contact));

            this.props.onPressCase(this.props.item, contact);
        });
    };

    onPressAddContact = () => {
        InteractionManager.runAfterInteractions(() => {
            let contact = this.props && this.props.contacts && Array.isArray(this.props.contacts) && this.props.contacts.length > 0 ? this.props.contacts[this.props.contacts.map((e) => {return e.id}).indexOf(this.props.item.personId)] : null;

            console.log('### onPressCases: ', this.props.item, contact, Object.assign({}, this.props.item, contact));

            this.props.onPressAddContact(this.props.item, contact);
        });
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
        justifyContent: 'space-between'
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
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        cases: state.cases,
        contacts: state.contacts,
        events: state.events
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(CaseListItem);
