/**
 * Created by florinpopa on 03/07/2018.
 */
import React, {Component} from 'react';
import {Text, View, Platform, Image, StyleSheet, Alert} from 'react-native';
import NavigationDrawerListItem from './../components/NavigationDrawerListItem';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {logoutUser} from './../actions/user';
import {sendDatabaseToServer, getTranslationsAsync, changeAppRoot} from './../actions/app';
import styles from './../styles';
import {ListItem, Icon} from 'react-native-material-ui';
import DropdownInput from './../components/DropdownInput';
import {updateUser} from './../actions/user';
import {updateRequiredFields, calculateDimension, getTranslation} from './../utils/functions';
import translations from './../utils/translations'

// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box

class NavigationDrawer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedScreen: 0
        };
        // Bind here methods, or at least don't declare methods in the render method
        this.handlePressOnListItem = this.handlePressOnListItem.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
    }

    // Please add here the react lifecycle methods that you need

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <View style={style.container}>
                <View
                    style={{
                        flex: 0.2,
                        marginTop: Platform.OS === 'ios' ? this.props.screenSize.height === 812 ? 44 : 20 : 0,
                        justifyContent: 'space-around'
                    }}>
                        <ListItem
                            numberOfLines={2}
                            leftElement={<Icon name="account-circle" size={40} color={styles.buttonGreen}/>}
                            centerElement={{
                                primaryText: (this.props.user && this.props.user.firstName ? (this.props.user.firstName + ' ') : '') + (this.props.user && this.props.user.lastName ? this.props.user.lastName : ''),
                                secondaryText: this.props.user && this.props.user.email ? this.props.user.email : ''
                            }}
                            style={{
                                // container: {height: '75%'},
                                primaryText: {fontFamily: 'Roboto-Medium', fontSize: 18},
                                secondaryText: {fontFamily: 'Roboto-Regular', fontSize: 12},
                                centerElementContainer: {height: '100%', justifyContent: 'center'}
                            }}
                        />
                    {
                        this.props && this.props.outbreak && this.props.outbreak.name ? (
                            <View style={{marginHorizontal: 16}}>
                                <Text style={{fontFamily: 'Roboto-Medium', fontSize: 15, color: styles.navigationDrawerItemText}} numberOfLines={1}>{getTranslation(translations.navigationDrawer.activeOutbreak, this.props.translation)}</Text>
                                <Text style={{fontFamily: 'Roboto-Medium', fontSize: 15, color: styles.navigationDrawerItemText}} numberOfLines={1}>{this.props.outbreak.name}</Text>
                            </View>
                        ) : (null)
                    }
                    <View style={styles.lineStyle} />
                </View>
                <View style={{flex: 0.8}}>
                    {
                        
                        config.sideMenuItems.map((item, index) => {
                            let addButton = false
                            if (item.addButton && item.addButton === true){
                                let findPermission = undefined
                                if (item.key === 'followups') {
                                    findPermission = this.props.role.find((e) => e === config.userPermissions.writeFollowUp )
                                } else if (item.key === 'contacts') {
                                    findPermission = this.props.role.find((e) => e === config.userPermissions.writeContact )
                                } else if (item.key === 'cases') {
                                    findPermission = this.props.role.find((e) => e === config.userPermissions.writeCase)
                                }
                                if (findPermission !== undefined) {
                                    addButton = true
                                }
                            }

                            return (
                                <NavigationDrawerListItem
                                    key={index}
                                    label={getTranslation(item.label, this.props.translation)} 
                                    name={item.name}
                                    onPress={() => this.handlePressOnListItem(index)}
                                    handleOnPressAdd={() => this.handleOnPressAdd(item.key, index)}
                                    isSelected={index === this.state.selectedScreen}
                                    addButton={addButton}
                                />
                            )
                        })
                    }
                    <View style={styles.lineStyle} />
                    <NavigationDrawerListItem label={getTranslation(translations.navigationDrawer.syncHubManually, this.props.translation)} name={'cached'} onPress={this.handleOnPressSync} />
                    <NavigationDrawerListItem label={getTranslation(translations.navigationDrawer.changeHubConfig, this.props.translation)} name={'settings'} onPress={this.handleOnPressChangeHubConfig} />
                    <View style={styles.lineStyle} />
                    <View style={{justifyContent: 'center', alignItems: 'center'}}>
                        <DropdownInput
                            id="test"
                            label={getTranslation(translations.navigationDrawer.languagesLabel, this.props.translation)}
                            value={this.props.availableLanguages && this.props.user && this.props.user.languageId && this.props.availableLanguages[this.props.availableLanguages.map((e) => {return e.value}).indexOf(this.props.user.languageId)] ? this.props.availableLanguages[this.props.availableLanguages.map((e) => {return e.value}).indexOf(this.props.user.languageId)].label : null}
                            data={this.props.availableLanguages}
                            isEditMode={true}
                            isRequired={false}
                            onChange={this.handleOnChangeLanguage}
                            style={{width: '90%'}}
                            translation={this.props.translation}
                        />
                    </View>
                    <NavigationDrawerListItem label={getTranslation(translations.navigationDrawer.logoutLabel, this.props.translation)} name="power-settings-new" onPress={this.handleLogout} />
                </View>
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handlePressOnListItem = (index) => {
        this.setState({
            selectedScreen: index
            }, () => {
                this.props.navigator.toggleDrawer({
                    side: 'left',
                    animated: true,
                    to: 'missing'
                });
                this.props.navigator.handleDeepLink({
                    link: 'Navigate/' + index
                })
            });
       
    };

    handleOnPressAdd = (key, index) => {
        console.log('handleOnPressAdd', key, index);
        this.setState({
            selectedScreen: index
        }, () => {
            this.props.navigator.toggleDrawer({
                side: 'left',
                animated: true,
                to: 'missing'
            });
            switch(key) {
                case 'contacts':
                    this.props.navigator.handleDeepLink({
                        link: 'Navigate/' + index + '-add'
                    });
                    break;
                case 'cases':
                    this.props.navigator.handleDeepLink({
                        link: 'Navigate/' + index + '-add'
                    });
                    break;
                default:
                    console.log('Add something from drawer');
                    break;
            }
        });

    };

    handleOnPressSync = () => {
        this.props.navigator.toggleDrawer({
            side: 'left',
            animated: true,
            to: 'missing'
        });

        // let arrayOfTexts = [{text: 'Get Data', status: 'OK'}, {text: 'Be cool', status: 'Ceva'}];
        //
        // let text = '';
        // for (let i=0; i<arrayOfTexts.length; i++) {
        //     text += arrayOfTexts[i].text + '\n' + 'Status: ' + arrayOfTexts[i].status + '\n';
        // }
        // Alert.alert("Alert", text, [
        //     {
        //         text: 'Ok', onPress: () => {console.log('Ok pressed')}
        //     }
        // ])

        this.props.sendDatabaseToServer();
    };

    handleOnPressChangeHubConfig = () => {
        this.props.changeAppRoot('config');
    };

    handleOnChangeLanguage = (value, label) => {
        let user = Object.assign({}, this.props.user);
        user.languageId = value;
        this.props.getTranslationsAsync(value);

        user = updateRequiredFields(user.activeOutbreakId, user._id, user, 'update');

        this.props.updateUser(user);
    };

    handleLogout = () => {
        this.props.logoutUser();
    };
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: 'white'
    },
    textInput: {
        borderColor: 'red',
        borderWidth: 1,
        borderRadius: 20,
        flex: 1
    }
});

function mapStateToProps(state) {
    return {
        user: state.user,
        role: state.role,
        screenSize: state.app.screenSize,
        availableLanguages: state.app.availableLanguages,
        outbreak: state.outbreak,
        translation: state.app.translation
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        logoutUser,
        sendDatabaseToServer,
        updateUser,
        getTranslationsAsync,
        changeAppRoot
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(NavigationDrawer);