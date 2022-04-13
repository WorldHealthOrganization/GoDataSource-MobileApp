/**
 * Created by florinpopa on 14/06/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {InteractionManager, StyleSheet, View} from 'react-native';
import {Icon, ListItem} from 'react-native-material-ui';
import styles from './../styles';
import {connect} from "react-redux";
import ElevatedView from 'react-native-elevated-view';
import Ripple from 'react-native-material-ripple';
import {calculateDimension} from './../utils/functions';
import PermissionComponent from './../components/PermissionComponent';
import constants, {PERMISSIONS_CONTACT_OF_CONTACT} from './../utils/constants';
import {sideMenuKeys} from "../utils/config";

class NavigationDrawerListItem extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
    }

    // Please add here the react lifecycle methods that you need

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        let permissionElement = [];
        let permissionAddButton = [];

        switch(this.props.itemKey) {
            case sideMenuKeys[0]:
                permissionElement = [
                    constants.PERMISSIONS_FOLLOW_UP.followUpAll,
                    constants.PERMISSIONS_FOLLOW_UP.followUpList
                ];
                break;
            case sideMenuKeys[1]:
                permissionElement = [
                    constants.PERMISSIONS_CONTACT.contactAll,
                    constants.PERMISSIONS_CONTACT.contactList
                ];
                break;
            case sideMenuKeys[2]:
                permissionElement = [
                    PERMISSIONS_CONTACT_OF_CONTACT.contactsOfContactsAll,
                    PERMISSIONS_CONTACT_OF_CONTACT.contactsOfContactsList
                ];
                break;
            case sideMenuKeys[3]:
                permissionElement = [
                    constants.PERMISSIONS_CASE.caseAll,
                    constants.PERMISSIONS_CASE.caseList
                ];
                break;
            case sideMenuKeys[4]:
                permissionElement = [
                    constants.PERMISSIONS_LAB_RESULT.labResultAll,
                    constants.PERMISSIONS_LAB_RESULT.labResultList
                ];
                break;
            case sideMenuKeys[5]:
                permissionElement = [
                    constants.PERMISSIONS_EVENT.eventAll,
                    constants.PERMISSIONS_EVENT.eventList
                ];
                break;
            case 'users':
                permissionElement = [
                    constants.PERMISSIONS_USER.userAll,
                    constants.PERMISSIONS_USER.userListForFilters
                ];
                break;
            default:
                permissionElement = [];
        }

       if (this.props.addButton && this.props.itemKey === sideMenuKeys[3]) {
            permissionAddButton = [
                constants.PERMISSIONS_CASE.caseAll,
                constants.PERMISSIONS_CASE.caseCreate
            ]
       }

        if (this.props.addButton && this.props.itemKey === sideMenuKeys[4]) {
            permissionAddButton = [
                constants.PERMISSIONS_LAB_RESULT.labResultAll,
                constants.PERMISSIONS_LAB_RESULT.labResultCreate
            ]
        }

        return (
            <PermissionComponent
                render={() => (
                    <View style={[style.container]}>
                        <View style={{flex: this.props.addButton ? 0.8 : 1}}>
                            <ListItem
                                numberOfLines={1}
                                leftElement={<Icon name={this.props.name} color={this.props.isSelected ? styles.buttonGreen : styles.navigationDrawerItemText} />}
                                centerElement={this.props.label}
                                hideChevron={false}
                                onPress={this.onPress}
                                style={{
                                    container: {
                                        backgroundColor: this.props.isSelected ? styles.backgroundGreen : 'white',
                                        marginTop: this.props.isSelected ? 7.5 : 0,
                                        marginLeft: this.props.isSelected ? 7.5 : 0,
                                        marginBottom: this.props.isSelected ? 7.5 : 0,
                                        marginRight: this.props.isSelected ? (this.props.addButton ? 0 : 7.5) : 0
                                    },
                                    primaryText: {fontFamily: 'Roboto-Medium', fontSize: 15, color: this.props.isSelected ? styles.buttonGreen : styles.navigationDrawerItemText}
                                }}
                            />
                        </View>
                        {
                            this.props && this.props.addButton ?
                                (
                                    <PermissionComponent
                                        render={() => (
                                            <View style={{
                                                flex: 0.2,
                                                justifyContent: 'center',
                                                backgroundColor: this.props.isSelected ? styles.backgroundGreen : 'white',
                                                marginTop: this.props.isSelected ? 7.5 : 0,
                                                marginBottom: this.props.isSelected ? 7.5 : 0,
                                                marginRight: this.props.isSelected ? 7.5 : 0,
                                            }}>
                                                <ElevatedView
                                                    elevation={3}
                                                    style={{
                                                        backgroundColor: styles.buttonGreen,
                                                        width: calculateDimension(33, false, this.props.screenSize),
                                                        height: calculateDimension(25, true, this.props.screenSize),
                                                        borderRadius: 4
                                                    }}
                                                >
                                                    <Ripple style={{
                                                        flex: 1,
                                                        justifyContent: 'center',
                                                        alignItems: 'center'
                                                    }} onPress={this.props.handleOnPressAdd}>
                                                        <Icon name="add" color={'white'} size={15}/>
                                                    </Ripple>
                                                </ElevatedView>
                                            </View>
                                        )}
                                        permissionsList={permissionAddButton}
                                    />
                                ) : (<View/>)
                        }
                    </View>
                )}
                permissionsList={permissionElement}
            />
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    onPress = () => {
        InteractionManager.runAfterInteractions(() => {
            this.props.onPress();
        })
    }
}

NavigationDrawerListItem.defaultProps = {
    name: 'update',
    label: 'Follow-ups',
    onPress: () => {console.log("Default onPress")},
    handleOnPressAdd: () => {console.log("Default onPressAdd")},
    isSelected: false,
    addButton: false,
};

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row'
    }
});

function mapStateToProps(state) {
    return {
        user: state.user,
        screenSize: state.app.screenSize
    };
}
export default connect(mapStateToProps)(NavigationDrawerListItem);
