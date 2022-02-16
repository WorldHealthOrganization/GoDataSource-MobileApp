/**
 * Created by florinpopa on 03/07/2018.
 */
import React, {Component} from 'react';
import {Platform, ScrollView, StyleSheet, Text, View, Linking} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import NavigationDrawerListItem from './../components/NavigationDrawerListItem';
import config, {sideMenuKeys} from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {computeOutbreakSwitch, logoutUser, updateUser} from './../actions/user';
import {changeAppRoot, getTranslationsAsync, saveSelectedScreen, sendDatabaseToServer} from './../actions/app';
import styles from './../styles';
import {Icon, ListItem} from 'react-native-material-ui';
import DropdownInput from './../components/DropdownInput';
import {
    createStackFromComponent,
    getTranslation,
    mapSideMenuKeysToScreenName,
    updateRequiredFields
} from './../utils/functions';
import translations from './../utils/translations';
import VersionNumber from 'react-native-version-number';
import PermissionComponent from './../components/PermissionComponent';
import constants from "../utils/constants";
import lodashGet from 'lodash/get';
import isNumber from 'lodash/isNumber';
import LanguageComponent from "../components/LanguageComponent";
import {Navigation} from "react-native-navigation";
import {Dropdown} from "react-native-material-dropdown";
import {getAllOutbreaks} from "../queries/outbreak";
import {storeOutbreak} from "../actions/outbreak";

// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box

class NavigationDrawer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedScreen: this.props.selectedScreen,
            outbreaks: []
        };
        // Bind here methods, or at least don't declare methods in the render method
        this.handlePressOnListItem = this.handlePressOnListItem.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
    }

    componentWillMount() {
        console.log("Get all outbreaks");
        getAllOutbreaks((error, result)=>{
            if(!error){
                result.map(outbreak => {
                    if(outbreak._id.includes("outbreak.json_")){
                    outbreak._id = outbreak._id.substring(14, outbreak._id.length);
                    return outbreak;
                }})
                this.setState({
                    outbreaks: result
                })
            }
        });
    }

    // Please add here the react lifecycle methods that you need
    componentDidUpdate(prevProps) {
        if (prevProps.selectedScreen !== this.props.selectedScreen) {
            this.setState({
                selectedScreen: this.props.selectedScreen
            })
        }
    }
    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <View style={style.container}>
                <View
                    style={{
                        flex: 0.4,
                        marginTop: Platform.OS === 'ios' ? (this.props.screenSize.height === 812 ? 44 : 20) : 0,
                        justifyContent: 'space-around'
                    }}>
                        <ListItem
                            numberOfLines={2}
                            leftElement={<Icon name="account-circle" size={38} color={styles.buttonGreen}/>}
                            centerElement={{
                                primaryText: (this.props.user && this.props.user.firstName ? (this.props.user.firstName + ' ') : ' ') + (this.props.user && this.props.user.lastName ? this.props.user.lastName : ' '),
                                secondaryText: this.props.user && this.props.user.email ? this.props.user.email : ' '
                            }}
                            style={{
                                primaryText: {fontFamily: 'Roboto-Medium', fontSize: 18},
                                secondaryText: {fontFamily: 'Roboto-Regular', fontSize: 12},
                                centerElementContainer: {height: '100%', justifyContent: 'center'}
                            }}
                        />
                    {
                        this.props && this.props.outbreak && this.props.outbreak.name ? (
                            <View style={{marginHorizontal: 16}}>
                                <Text style={{fontFamily: 'Roboto-Medium', fontSize: 15, color: styles.navigationDrawerItemText, marginBottom: -15}} numberOfLines={1}>{getTranslation(translations.navigationDrawer.activeOutbreak, this.props.translation)}</Text>
                                <Dropdown
                                    useNativeDriver={true}
                                    value={this.props.outbreak?._id}
                                    labelExtractor={element => element.name}
                                    valueExtractor={element => element._id}
                                    containerStyle={{
                                        margin:0, padding:0
                                    }}
                                    disabled={!!this.props.outbreak?.disableOutbreakChange}
                                    data={this.state.outbreaks}
                                    onChangeText={(value,index,data)=>{
                                        // computeCommonData()
                                        // this.props.storeOutbreak(data[index]);
                                        AsyncStorage.setItem("outbreakId",value);
                                        this.props.computeOutbreakSwitch(this.props.user, value);
                                    }}
                                    />
                            </View>
                        ) : (null)
                    }
                    <View style={styles.lineStyle} />
                </View>

                <ScrollView scrollEnabled={true} style={{flex: 0.9}} contentContainerStyle={{flexGrow: 1}}>
                    {
                        Object.keys(config.sideMenuItems).map((item, index) => {
                            let addButton = false;

                            if (item === sideMenuKeys[3]) {
                                addButton = true;
                            }

                            if(item === 'contactsOfContacts' && !(this.props.outbreak && this.props.outbreak[constants.PERMISSIONS_OUTBREAK.allowRegistrationOfCoC])) {
                                return (<></>);
                            }

                            return (
                                <NavigationDrawerListItem
                                    key={index}
                                    itemKey={item}
                                    label={getTranslation(config.sideMenuItems[item].label, this.props.translation)}
                                    name={config.sideMenuItems[item].name}
                                    onPress={() => this.handlePressOnListItem(item)}
                                    handleOnPressAdd={() => this.handleOnPressAdd(item, index)}
                                    isSelected={item === this.state.selectedScreen}
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
                        <PermissionComponent
                            render={() => (
                                <LanguageComponent
                                    style={{width: '90%'}}
                                    componentId={this.props.componentId}
                                />

                                //<DropdownInput
                                  //  id="test"
                                    //label={getTranslation(translations.navigationDrawer.languagesLabel, this.props.translation)}
                                    //value={this.props.availableLanguages && this.props.user && this.props.user.languageId && this.props.availableLanguages[this.props.availableLanguages.map((e) => {return e.value}).indexOf(this.props.user.languageId)] ? this.props.availableLanguages[this.props.availableLanguages.map((e) => {return e.value}).indexOf(this.props.user.languageId)].label : null}
                                    // data={this.props.availableLanguages}
                                    // isEditMode={true}
                                    // isRequired={false}
                                    // onChange={this.handleOnChangeLanguage}
                                    // style={{width: '90%'}}
                                    // translation={this.props.translation}
                                    // screenSize={this.props.screenSize}
                                // />
                            )}
                            permissionsList={[
                                constants.PERMISSIONS_USER.userAll,
                                constants.PERMISSIONS_USER.userModifyOwnAccount
                            ]}
                        />
                    </View>
                    <NavigationDrawerListItem
                        label={getTranslation(translations.navigationDrawer.usersLabel, this.props.translation)}
                        name={'contact-phone'}
                        key={sideMenuKeys[5]}
                        onPress={() => this.handlePressOnListItem(sideMenuKeys[5])}
                        isSelected={sideMenuKeys[5] === this.state.selectedScreen}
                        addButton={false}
                        itemKey={sideMenuKeys[5]}
                    />

                    <NavigationDrawerListItem
                        key={sideMenuKeys[6]}
                        label={getTranslation(translations.navigationDrawer.helpLabel, this.props.translation)}
                        name={sideMenuKeys[6]}
                        onPress={() => this.handlePressOnListItem(sideMenuKeys[6])}
                        isSelected={sideMenuKeys[6] === this.state.selectedScreen}
                    />
                    <NavigationDrawerListItem
                        key={'community'}
                        label={getTranslation(translations.navigationDrawer.community, this.props.translation)}
                        name="open-in-browser"
                        onPress={this.handleCommunity}
                    />
                    <NavigationDrawerListItem label={getTranslation(translations.navigationDrawer.logoutLabel, this.props.translation)} name="power-settings-new" onPress={this.handleLogout} />
                    <Text
                        style={{
                            color: styles.navigationDrawerItemText,
                            fontFamily: 'Roboto-Medium',
                            fontSize: 14,
                            // marginTop: 10,
                            marginHorizontal: 16
                        }}
                    >
                        {`Version: ${VersionNumber.appVersion} - build ${VersionNumber.buildVersion}`}
                    </Text>
                </ScrollView>
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handlePressOnListItem = (index) => {
        this.props.saveSelectedScreen(index);
        this.setState({
            selectedScreen: index
            }, () => {
            Navigation.setStackRoot('CenterStack', {
                component: {
                    name: mapSideMenuKeysToScreenName(index).screenToSwitchTo,
                    options: {
                        sideMenu: {
                            left: {
                                visible: false
                            }
                        }
                    }
                }
            });
            });
       
    };

    handleCommunity = async () => {
        await Linking.openURL('https://community-godata.who.int/');
    };

    handleOnPressAdd = (key, index) => {
        console.log('handleOnPressAdd', key, index);
        this.props.saveSelectedScreen(key);
        this.setState({
            selectedScreen: key
        }, () => {
            switch(key) {
                case 'contacts':
                case 'cases':
                    console.log("Here");
                    Navigation.push('CenterStack', {
                        component: {
                            name: mapSideMenuKeysToScreenName(`${key}-add`).screenToSwitchTo,
                            options: {
                                sideMenu: {
                                    left: {
                                        visible: false
                                    }
                                }
                            },
                            passProps: {
                                isNew: true,
                                isAddFromNavigation: true,
                                refresh: () => {console.log('Default refresh')}
                            }
                        }
                    });
                    break;
                default:
                    console.log('Add something from drawer');
                    break;
            }
        });

    };

    handleOnPressSync = () => {
        Navigation.mergeOptions(this.props.componentId, {
            sideMenu: {
                left: {
                    visible: false,
                },
            },
        });
        this.props.sendDatabaseToServer();
    };

    handleOnPressChangeHubConfig = () => {
        console.log("Pressed it");
        Navigation.mergeOptions(this.props.componentId, {
            sideMenu: {
                left: {
                    visible: false,
                },
            },
        });
        Navigation.showModal(createStackFromComponent({
            name: 'HubConfigScreen',
            passProps: {
                stackComponentId: this.props.componentId
            }
        }))
    };

    handleOnChangeLanguage = (value, label) => {
        let user = Object.assign({}, this.props.user);
        user.languageId = value;
        this.props.getTranslationsAsync(value, user?.activeOutbreakId);

        user = updateRequiredFields(this.props.outbreak._id, user._id, user, 'update');

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
        user: lodashGet(state, 'user', null),
        role: lodashGet(state, 'role', []),
        screenSize: lodashGet(state, 'app.screenSize', config.designScreenSize),
        selectedScreen: lodashGet(state, 'app.selectedScreen', 0),
        availableLanguages: lodashGet(state, 'app.availableLanguages', []),
        outbreak: lodashGet(state, 'outbreak', {name: 'No outbreak', disableOutbreakChange: false}),
        translation: lodashGet(state, 'app.translation', [])
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        logoutUser,
        sendDatabaseToServer,
        updateUser,
        getTranslationsAsync,
        changeAppRoot,
        saveSelectedScreen,
        storeOutbreak,
        computeOutbreakSwitch,
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(NavigationDrawer);