/**
 * Created by mobileclarisoft on 23/07/2018.
 */
/**
 * Created by florinpopa on 19/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {TextInput, View, Text, StyleSheet,Image, Platform, Dimensions, InteractionManager} from 'react-native';
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
        // console.log('item:', this.props.item);
        let primaryText = this.props.item && ((this.props.item.firstName ? this.props.item.firstName : ' ') + (this.props.item.lastName ? (' ' + this.props.item.lastName) : ' '));
        let genderString = '';
        let ageString = '';
        if (this.props.item && this.props.item.gender) {
            genderString = this.getTranslation(this.props.item.gender);
        }

        if(this.props.item && this.props.item.age){
            ageString = this.props.item.age.years ? this.props.item.age.years + ' y.o. ' : (this.props.item.age.months ? this.props.item.age.months + ' m.o. ' : '');
        }

        let secondaryText = this.props.item && ((genderString ? genderString.charAt(0) : ' ') + (ageString ? (' ' + ageString) : ' '));

        let addressText = ' ';
        let addressArray = []

        if (this.props && this.props.item && this.props.item.addresses && this.props.item.addresses.length > 0) {
            let casePlaceOfResidence = this.props.item.addresses.filter((e) => {return e.typeId === config.userResidenceAddress.userPlaceOfResidence})
            if (casePlaceOfResidence && casePlaceOfResidence[0]) {
                addressArray = [casePlaceOfResidence[0].addressLine1, casePlaceOfResidence[0].addressLine2, casePlaceOfResidence[0].city, casePlaceOfResidence[0].country, casePlaceOfResidence[0].postalCode];
                addressArray = addressArray.filter((e) => {return e});
            }
        }
        addressText = addressArray.join(', ');

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
                                <Text style={[style.secondaryText, {flex: 1.5}]}>{secondaryText}</Text>
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
                </View>
                <View style={styles.lineStyle}/>
                <View
                    style={[style.thirdSectionContainer, {marginHorizontal: calculateDimension(14, false, this.props.screenSize)}]}>
                    {
                        this.props.role.find((e) => e === 'read_case') !== undefined ? (
                            <Ripple style={[style.rippleStyle]} onPress={this.onPressCase}>
                                <Text style={[style.rippleTextStyle]}>VIEW</Text>
                            </Ripple>
                        ) : null
                    }
                    {
                        this.props.role.find((e) => e === 'write_contact') !== undefined ? (
                            <Ripple style={[style.rippleStyle]}  onPress={this.onPressAddContact}>
                                <Text style={[style.rippleTextStyle]}>ADD CONTACT</Text>
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
        cases: state.cases,
        role: state.role,
        contacts: state.contacts,
        events: state.events
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(CaseListItem);
