/**
 * Created by florinpopa on 05/12/2018.
 */
/**
 * Created by florinpopa on 14/06/2018.
 */
import React, {Component} from 'react';
import {View, Text, StyleSheet, Platform, Image, Alert, AsyncStorage} from 'react-native';
import ViewHOC from './../components/ViewHOC';
import Section from './../components/Section';
import ElevatedView from 'react-native-elevated-view';
import {calculateDimension, getTranslation} from './../utils/functions';
import Button from './../components/Button';
import TextInput from './../components/TextInput';
import styles from './../styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { logoutUser } from './../actions/user';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import { removeErrors } from './../actions/errors';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import NavBarCustom from './../components/NavBarCustom';
import config from './../utils/config';
import Ripple from 'react-native-material-ripple';
import translations from './../utils/translations';
import {setInternetCredentials, getInternetCredentials} from 'react-native-keychain';
import {createDatabase} from './../queries/database';


let textFieldsStructure = [
    {
        id: 'name',
        label: translations.hubConfigScreen.hubNameLabel,
        type: 'TextInput',
        value: '',
        isRequired: false,
        isEditMode: true,
    },
    {
        id: 'url',
        label: translations.hubConfigScreen.hubUrlLabel,
        type: 'TextInput',
        value: '',
        isRequired: false,
        isEditMode: true,
    },
    {
        id: 'clientId',
        label: translations.hubConfigScreen.hubClientIdLabel,
        type: 'TextInput',
        value: '',
        isRequired: false,
        isEditMode: true,
    },
    {
        id: 'clientSecret',
        label: translations.hubConfigScreen.hubClientSecretLabel,
        type: 'TextInput',
        value: '',
        isRequired: false,
        isEditMode: true,
        secureTextEntry: true
    },
    {
        id: 'lastSyncDate',
        label: translations.hubConfigScreen.lastSyncDate,
        type: 'TextInput',
        value: '',
        isRequired: false,
        isEditMode: false
    },
];

class FirstConfigScreen extends Component {

    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
            showLoading: true,
            databaseId: '',
            name: '',
            url: '',
            clientId: '',
            clientSecret: '',
            allDatabases: [],
            lastSyncDate: null,
            isModified: false
        };
    }

    // Please add here the react lifecycle methods that you need
    componentDidMount() {
        // get active database's id
        AsyncStorage.getItem('activeDatabase')
            .then((activeDatabase) => {
                // console.log('Active database: ', activeDatabase);
                // Get last sync date
                AsyncStorage.getItem(activeDatabase)
                    .then((lastSyncDate) => {
                        // For the active database get all credentials
                        lastSyncDate = new Date(lastSyncDate).toUTCString();
                        getInternetCredentials(activeDatabase)
                            .then((activeDatabaseCredentials) => {
                                let currentHubConfig = JSON.parse(activeDatabaseCredentials.username);
                                // console.log('Active database credentials: ', JSON.parse(activeDatabaseCredentials.username));
                                let databaseId = Platform.OS === 'ios' ? activeDatabaseCredentials.server : activeDatabaseCredentials.service;
                                // console.log('State before: ', this.state);
                                this.setState({
                                    databaseId: databaseId,
                                    name: currentHubConfig.name,
                                    url: currentHubConfig.url,
                                    clientId: currentHubConfig.clientId,
                                    clientSecret: currentHubConfig.clientSecret,
                                    lastSyncDate: lastSyncDate
                                }, () => {
                                    // console.log('State after: ', this.state);
                                    AsyncStorage.getItem('databases')
                                        .then((databases) => {
                                            // console.log('All databases: ', databases);
                                            let allDatabases = JSON.parse(databases);
                                            allDatabases = allDatabases.filter((e) => {return e.id !== databaseId});
                                            this.setState({
                                                showLoading: false,
                                                allDatabases: allDatabases
                                            })
                                        })
                                        .catch((errorDatabases) => {
                                            console.log("Error getting all databases: ", errorDatabases);
                                            this.showAlert(getTranslation(translations.hubConfigScreen.getOtherHubsTitle, this.props.translation), getTranslation(translations.hubConfigScreen.getOtherHubsMessage, this.props.translation));
                                        })
                                });
                            })
                            .catch((errorActiveDatabaseCredentials) => {
                                console.log('Error active database credentials: ', errorActiveDatabaseCredentials);
                                this.showAlert(getTranslation(translations.hubConfigScreen.getCurrentHubTitle, this.props.translation), getTranslation(translations.hubConfigScreen.getCurrentHubMessage, this.props.translation));
                            })
                    })
                    .catch((errorLastSyncDate) => {
                        console.log('Error while getting last sync date: ', errorLastSyncDate);
                        this.showAlert(getTranslation(translations.hubConfigScreen.getCurrentHubLastSyncDateTitle, this.props.translation), getTranslation(translations.hubConfigScreen.getCurrentHubLastSyncDateMessage, this.props.translation));

                    })
            })
            .catch((errorActiveDatabase) => {
                console.log("Error while getting active database: ", errorActiveDatabase);
                this.showAlert(getTranslation(translations.hubConfigScreen.getCurrentHubTitle, this.props.translation), getTranslation(translations.hubConfigScreen.getCurrentHubMessage, this.props.translation));
            });
    }

    static getDerivedStateFromProps(props, state) {
       return null;
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        let marginHorizontal = calculateDimension(16, false, this.props.screenSize);
        let width = calculateDimension(config.designScreenSize.width - 32, false, this.props.screenSize);
        let marginVertical = 4;
        let minHeight = calculateDimension(72, true, this.props.screenSize);

        return (
                <ViewHOC style={{flex: 1}} showLoader={this.state.showLoading} loaderText="Loading...">
                    <NavBarCustom style = {style.navbarContainer}
                                  title={getTranslation(translations.hubConfigScreen.label, this.props.translation)}
                                  navigator={this.props.navigator}
                                  iconName="close"
                                  handlePressNavbarButton={this.handlePressNavbarButton}
                    />

                    <KeyboardAwareScrollView
                        style={[style.container, {marginVertical: 10}]}
                        contentContainerStyle={style.contentContainerStyle}
                        keyboardShouldPersistTaps={'always'}
                    >
                        <ElevatedView elevation={5} style={{
                            marginHorizontal,
                            width,
                            marginVertical,
                            minHeight,
                            backgroundColor: 'white',
                            borderRadius: 2,
                            paddingVertical: 5
                        }}>
                            <Section label={getTranslation(translations.hubConfigScreen.currentHubConfigurationLabel, this.props.translation)}/>
                            {
                                textFieldsStructure.map((item, index) => {
                                    return this.renderItem(item, index)
                                })
                            }
                        </ElevatedView>

                        <View style={{
                            width,
                            marginHorizontal,
                            flexDirection: 'row',
                            minHeight: calculateDimension(40, true, this.props.screenSize),
                            justifyContent: 'space-around',
                            alignItems: 'center',
                            paddingVertical: 5
                        }}>
                            <Button
                                title={getTranslation(translations.hubConfigScreen.scanQRButtonLabel, this.props.translation)}
                                onPress={this.handleOnPressQr}
                                color={styles.buttonGreen}
                                titleColor={'white'}
                                height={calculateDimension(25, true, this.props.screenSize)}
                                width={calculateDimension(165, false, this.props.screenSize)}
                                style={{
                                    marginVertical: calculateDimension(12.5, true, this.props.screenSize),

                                }}
                                upperCase={false}
                            />
                            <Button
                                title={getTranslation(translations.hubConfigScreen.saveCurrentHubButtonLabel, this.props.translation)}
                                onPress={this.handlePressSaveHub}
                                color={styles.buttonGreen}
                                titleColor={'white'}
                                height={calculateDimension(25, true, this.props.screenSize)}
                                width={calculateDimension(165, false, this.props.screenSize)}
                                style={{
                                    marginVertical: calculateDimension(12.5, true, this.props.screenSize)
                                }}
                                upperCase={false}
                            />
                        </View>

                        <ElevatedView
                            elevation={5}
                            style={{
                                marginHorizontal,
                                width,
                                marginVertical,
                                minHeight,
                                backgroundColor: 'white',
                                borderRadius: 2,
                                paddingVertical: 5
                            }}
                        >
                            <Section label={getTranslation(translations.hubConfigScreen.connectAnotherComputerLabel, this.props.translation)}/>
                            <View style={{alignItems: 'center', justifyContent: 'center'}}>
                                <Button
                                    title={getTranslation(translations.hubConfigScreen.addHubButtonLabel, this.props.translation)}
                                    onPress={this.handleOnPressAddHub}
                                    color={styles.buttonGreen}
                                    titleColor={'white'}
                                    height={calculateDimension(25, true, this.props.screenSize)}
                                    width={calculateDimension(165, false, this.props.screenSize)}
                                    style={{
                                        marginVertical: calculateDimension(12.5, true, this.props.screenSize)
                                    }}
                                    upperCase={false}
                                />
                            </View>
                        </ElevatedView>

                        <ElevatedView
                            elevation={5}
                            style={{
                                marginHorizontal,
                                width,
                                marginVertical,
                                minHeight,
                                backgroundColor: 'white',
                                borderRadius: 2,
                                paddingVertical: 5
                            }}
                        >
                            <Section label={getTranslation(translations.hubConfigScreen.otherHubConfigurationsLabel, this.props.translation)}/>
                            <View style={{alignItems: 'center', marginVertical: 10}}>
                                {
                                    this.state && this.state.allDatabases && Array.isArray(this.state.allDatabases) && this.state.allDatabases.map((database) => {
                                        return this.renderDatabase(database, width);
                                    })
                                }
                            </View>
                        </ElevatedView>
                    </KeyboardAwareScrollView>
                </ViewHOC>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handlePressNavbarButton = () => {
        if (this.state.isModified) {
            Alert.alert('', getTranslation(translations.hubConfigScreen.exitWithoutSavingMessage), [
                {
                    text: 'Yes', onPress: () => {this.props.navigator.dismissModal()}
                },
                {
                    text: 'Cancel', onPress: () => {console.log('Cancel pressed')}
                }
            ])
        } else {
            this.props.navigator.dismissModal();
        }
    };

    renderItem = (item, index) => {
        switch(item.type) {
            case 'TextInput':
                return (
                    <TextInput
                        id={item.id}
                        label={getTranslation(item.label, this.props.translation)}
                        index={this.props.index}
                        value={this.state[item.id]}
                        isEditMode={item.isEditMode}
                        isRequired={item.isRequired}
                        onChange={this.onChangeText}
                        multiline={item.multiline}
                        style={{width: 315, marginHorizontal: 15}}
                        objectType={item.objectType}
                        keyboardType={item.keyboardType}
                        translation={this.props.translation}
                        hasTooltip={item.hasTooltip}
                        tooltipMessage={item.tooltipMessage}
                        secureTextEntry={item.secureTextEntry}
                    />
                )
        }
    };

    onChangeText = (text, id) => {
        this.setState({[id]: text, isModified: true}, () => {
            console.log('OnChangeText: ', this.state);
        })
    };

    renderDatabase = (database, width) => {
        console.log('Database: ', database);
        return (
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: width - 30}}>
                <Text>{database.name}</Text>
                <Ripple onPress={() => (this.onPressMakeHubActive(database))}>
                    <Text>{getTranslation(translations.hubConfigScreen.makeActiveLabel, this.props.translation)}</Text>
                </Ripple>
            </View>
        )
    };

    handleOnPressQr = () => {
        this.props.navigator.showModal({
            screen: 'QRScanScreen',
            animated: true,
            passProps: {
                pushNewScreen: this.pushNewScreen
            }
        })
    };

    pushNewScreen = (QRCodeInfo) => {
        this.setState({
            url: QRCodeInfo.url,
            clientId: QRCodeInfo.clientId,
            clientSecret: QRCodeInfo.clientSecret,
            isModified: true
        })
    };

    // Editing the hub involves the following
    // Change clientId from internet credentials
    // Change database name from allDatabases store
    // Will not do syncing since the user can do it manually
    handlePressSaveHub = () => {
        getInternetCredentials(this.state.databaseId)
            .then((previousInternetCredentials) => {
                console.log("Previous internet credentials: ", previousInternetCredentials);
                let server = Platform.OS === 'ios' ? previousInternetCredentials.server : previousInternetCredentials.service;
                previousInternetCredentials.username = JSON.stringify({name: this.state.name, url: this.state.url, clientId: this.state.clientId, clientSecret: this.state.clientSecret});
                setInternetCredentials(server, previousInternetCredentials.username, previousInternetCredentials.password)
                    .then(() => {
                        // Edit the all databases store with the potential new name
                        let allDatabases = this.state.allDatabases.slice();
                        let index = allDatabases.findIndex(elem => elem.id === this.state.databaseId);
                        if (index !== -1) {
                            allDatabases[index].name = this.state.name;
                            AsyncStorage.setItem('allDatabases', JSON.stringify(allDatabases), (errorSetDatabases) => {
                                if (errorSetDatabases) {
                                    this.showAlert(getTranslation(translations.hubConfigScreen.saveCurrentHubTitle, this.props.translation), getTranslation(translations.hubConfigScreen.saveCurrentHubMessage, this.props.translation));
                                } else {
                                    this.setState({
                                        allDatabases
                                    }, () => {
                                        console.log('Finished updating current credentials');
                                        this.showAlert('', getTranslation(translations.hubConfigScreen.successUpdatingCurrentHubMessage, this.props.translation));
                                    })
                                }
                            })
                        }
                    })
                    .catch((errorSetInternetCredentials) => {
                        console.log('Error while setting internet credentials: ', errorSetInternetCredentials);
                        this.showAlert(getTranslation(translations.hubConfigScreen.saveCurrentHubTitle, this.props.translation), getTranslation(translations.hubConfigScreen.saveCurrentHubMessage, this.props.translation));
                    })
            })
            .catch((errorPreviousInternetCredentials) => {
                console.log('Error while getting internet credentials: ', errorPreviousInternetCredentials);
                this.showAlert(getTranslation(translations.hubConfigScreen.saveCurrentHubTitle, this.props.translation), getTranslation(translations.hubConfigScreen.saveCurrentHubMessage, this.props.translation));
            })
    };

    handleOnPressAddHub = () => {
        this.props.navigator.push({
            screen: 'FirstConfigScreen'
        })
    };

    // database = {id, name}
    onPressMakeHubActive = (database) => {
        // change active database and logout user
        getInternetCredentials(database.id)
            .then((internetCredentials) => {
                let server = Platform.OS === 'ios' ? internetCredentials.server : internetCredentials.service;
                createDatabase(server, internetCredentials.password, true)
                    .then((newDatabase) => {
                        AsyncStorage.setItem('activeDatabase', database.id)
                            .then(() => {
                                Alert.alert("", getTranslation(translations.hubConfigScreen.successMakingHubActiveMessage, this.props.translation), [
                                    {
                                        text: 'Ok', onPress: () => {this.props.logoutUser();}
                                    }
                                ]);
                            })
                            .catch((errorMakeActive) => {
                                console.log('Error make active database: ', errorMakeActive);
                                this.showAlert(getTranslation(translations.hubConfigScreen.setActiveDatabaseTitle, this.props.translation), getTranslation(translations.hubConfigScreen.setActiveDatabaseMessage, this.props.translation));
                            })
                    })
                    .catch((errorNewDatabase) => {
                        console.log('Error creating new Database: ', errorNewDatabase);
                        this.showAlert(getTranslation(translations.hubConfigScreen.setActiveDatabaseTitle, this.props.translation), getTranslation(translations.hubConfigScreen.setActiveDatabaseMessage, this.props.translation));
                    })
            })
            .catch((errorGettingInternetCredentials) => {
                console.log('Error getting internet credentials: ', errorGettingInternetCredentials)
                this.showAlert(getTranslation(translations.hubConfigScreen.setActiveDatabaseTitle, this.props.translation), getTranslation(translations.hubConfigScreen.setActiveDatabaseMessage, this.props.translation));
            })
    };

    showAlert = (alertTitle, alertText) => {
        Alert.alert(alertTitle, alertText, [
            {
                text: 'Ok', onPress: () => {console.log('Ok pressed')}
            }
        ])
    };
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF'
    },
    navbarContainer: {
        backgroundColor: 'white'
    },
    contentContainerStyle: {
        alignItems: 'center'
    },
    textInput: {
        width: '100%',
        alignSelf: 'center'
    },
    welcomeTextContainer: {
        flex: 0.35,
        width: '75%',
        justifyContent: 'center'
    },
    welcomeText: {
        fontFamily: 'Roboto-Bold',
        fontSize: 35,
        color: 'white',
        textAlign: 'left'
    },
    inputsContainer: {
        flex: 0.15,
        width: '75%',
        justifyContent: 'space-around',
    },
    logoContainer: {
        flex: 0.5,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    logoStyle: {
        width: 180,
        height: 34
    },
    text: {
        fontFamily: 'Roboto-Light',
        fontSize: 16,
        color: 'white'
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        errors: state.errors,
        translation: state.app.translation
    };
}

function matchDispatchToProps(dispatch) {
    return bindActionCreators({
        logoutUser,
        removeErrors
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchToProps)(FirstConfigScreen);