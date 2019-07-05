/**
 * Created by florinpopa on 28/08/2018.
 */
/**
 * Created by florinpopa on 14/06/2018.
 */
import React, {PureComponent} from 'react';
import {View, Text, StyleSheet, Platform, Image, Alert} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import {Button, Icon} from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import styles from './../styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { loginUser } from './../actions/user';
import { removeErrors } from './../actions/errors';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import url from './../utils/url';
import {storeHubConfiguration} from './../actions/app';
import Ripple from 'react-native-material-ripple';
import {getTranslation, generateId} from './../utils/functions';
import translations from './../utils/translations';
import SwitchInput from './../components/SwitchInput';
import {getInternetCredentials, setInternetCredentials} from 'react-native-keychain';
import {setSyncState, changeAppRoot} from './../actions/app';
import ModalSyncStatus from './../components/ModalSyncStatus';

class ManualConfigScreen extends PureComponent {

    static navigatorStyle = {
        navBarHidden: true,
    };

    constructor(props) {
        super(props);
        this.state = {
            name: '',
            url: '',
            clientId: '',
            clientSecret: '',
            encryptedData: true,
            hasAlert: false,
            syncState: [
                {id: 'testApi', name: 'Test API', status: '...'},
                {id: 'downloadDatabase', name: 'Download database', status: '...'},
                {id: 'unzipFile', name: 'Unzip', status: '...'},
                {id: 'sync', name: 'Sync', status: '...'}
            ],
            showModal: false,
            showCloseModalButton: false,
            allUrls: []
        };
        // Bind here methods, or at least don't declare methods in the render method
        this.nameRef = this.updateRef.bind(this, 'name');
        this.urlRef = this.updateRef.bind(this, 'url');
        this.clientIDRef = this.updateRef.bind(this, 'clientId');
        this.clientSecretRef = this.updateRef.bind(this, 'clientSecret');
    }

    // Please add here the react lifecycle methods that you need
    componentDidMount = async () => {
        // Get all hubs urls for the check
        // To get them, first get all databases names and ids from AsyncStorage, then for each url, get its internet credentials and map them to an array of urls

                try {
                    let allDatabases = await AsyncStorage.getItem('databases');
                    if (allDatabases) {
                        allDatabases = JSON.parse(allDatabases);
                        allDatabases = allDatabases.map((e) => {
                            return e.id;
                        });
                        let allUrls = [];
                        for (let i=0; i<allDatabases.length; i++) {
                            try {
                                let internetCredentials = await getInternetCredentials(allDatabases[i]);
                                if (internetCredentials) {
                                    internetCredentials = JSON.parse(internetCredentials.username);
                                    allUrls.push(internetCredentials.url);
                                } else {
                                    console.log(`Internet credentials not found for ${allDatabases[i]}`);
                                }
                            } catch(errorGetInternetCredentials) {
                                console.log('Error while getting internet credentials: ', errorGetInternetCredentials);
                            }
                        }

                        // console.log('All URLs: ', this.props.QRCodeInfo);

                        if (this.props && this.props.QRCodeInfo && this.props.QRCodeInfo.data) {
                            //TO DO map this.props.QRCodeInfo info to props
                            console.log('Here have the QRCodeInfo: ', JSON.parse(this.props.QRCodeInfo.data));
                            let QRCodeData = JSON.parse(this.props.QRCodeInfo.data);
                            this.setState({
                                url: QRCodeData.url || '',
                                clientId: QRCodeData.clientId || '',
                                clientSecret: QRCodeData.clientSecret || '',
                                allUrls
                            })
                        } else {
                            if (this.props && this.props.activeDatabase && !this.props.isNewHub) {
                                try{
                                    let activeDatabaseCredentials = await getInternetCredentials(this.props.activeDatabase);
                                    if (activeDatabaseCredentials) {
                                        activeDatabaseCredentials = JSON.parse(activeDatabaseCredentials.username);
                                        this.setState({
                                            name: activeDatabaseCredentials.name,
                                            url: activeDatabaseCredentials.url,
                                            clientId: activeDatabaseCredentials.clientId,
                                            clientSecret: activeDatabaseCredentials.clientSecret,
                                            encryptedData: activeDatabaseCredentials.encryptedData,
                                            allUrls: allUrls
                                        })
                                    } else {
                                        console.log("No active database found");
                                        this.setState({
                                            allUrls
                                        })
                                    }
                                } catch (errorGetInternetCredentialsActiveDatabase) {
                                    console.log("errorGetInternetCredentialsActiveDatabase: ", errorGetInternetCredentialsActiveDatabase);
                                    this.setState({
                                        allUrls
                                    })
                                }
                            } else {
                                this.setState({
                                    allUrls
                                })
                            }
                        }
                    } else {
                        console.log('No database found');
                        if (this.props && this.props.QRCodeInfo && this.props.QRCodeInfo.data) {
                            //TO DO map this.props.QRCodeInfo info to props
                            console.log('Here have the QRCodeInfo: ', JSON.parse(this.props.QRCodeInfo.data));
                            let QRCodeData = JSON.parse(this.props.QRCodeInfo.data);
                            this.setState({
                                url: QRCodeData.url || '',
                                clientId: QRCodeData.clientId || '',
                                clientSecret: QRCodeData.clientSecret || ''
                            })
                        }
                    }
                } catch (errorGetAllDatabases) {
                    console.log('Error get all databases: ', errorGetAllDatabases);
                    if (this.props && this.props.QRCodeInfo && this.props.QRCodeInfo.data) {
                        //TO DO map this.props.QRCodeInfo info to props
                        console.log('Here have the QRCodeInfo: ', JSON.parse(this.props.QRCodeInfo.data));
                        let QRCodeData = JSON.parse(this.props.QRCodeInfo.data);
                        this.setState({
                            url: QRCodeData.url || '',
                            clientId: QRCodeData.clientId || '',
                            clientSecret: QRCodeData.clientSecret || ''
                        })
                    }
                }
    };

    // static getDerivedStateFromProps(props, state) {
    //     // if (props.errors && props.errors.type && props.errors.message && !state.hasAlert) {
    //     //     state.hasAlert = true;
    //     //     Alert.alert(props.errors.type, props.errors.message, [
    //     //         {
    //     //             text: getTranslation(translations.alertMessages.okButtonLabel, props.translation),
    //     //             onPress: () => {
    //     //                 state.hasAlert = false;
    //     //                 props.removeErrors();
    //     //             }
    //     //         }
    //     //     ])
    //     // }
    //     if (props.syncState) {
    //         // props.navigator.push({
    //         //     screen: 'LoginScreen',
    //         //     animationType: 'fade',
    //         //     animated: true
    //         // })
    //         if (props.syncState.id === 'testApi' && props.syncState.status === 'In progress') {
    //             state.showModal = true;
    //         }
    //         let itemToBeChanged = state.syncState.find((e) => {return e.id === props.syncState.id});
    //         if (itemToBeChanged) {
    //             itemToBeChanged.name = props.syncState.name ? props.syncState.name : itemToBeChanged.name;
    //             itemToBeChanged.error = props.syncState.error || null;
    //             itemToBeChanged.status = props.syncState.status || '...';
    //
    //             let index = state.syncState.map((e) => {return e.id}).indexOf(props.syncState.id);
    //             state.syncState[index] = itemToBeChanged;
    //             if (itemToBeChanged.status === 'Error' || (index === state.syncState.length - 1 && itemToBeChanged.status === 'Success')) {
    //                 state.showCloseModalButton = true;
    //             }
    //         }
    //     }
    //     return null;
    // }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        if (this.props.syncState === 'Finished' && this.props.showModal === false && this.props.showCloseModalButton === false) {
            if (this.props.isMultipleHub) {
                this.props.changeAppRoot('login');
            } else {
                this.props.navigator.push({
                    screen: 'LoginScreen',
                    animated: true,
                    animationType: 'fade'
                })
            }
        }
        return (
            <KeyboardAwareScrollView
                style={[style.container, {paddingTop: Platform.OS === 'ios' ? this.props.screenSize.height === 812 ? 44 : 20 : 0}]}
                contentContainerStyle={style.contentContainerStyle}
                keyboardShouldPersistTaps={'always'}
            >

                <View style={{width: '100%', flexDirection: 'row', flex: 0.35}}>
                    <Ripple
                        style={{flexDirection: 'row', alignItems: 'center', position: "absolute", top: 20, left: 20}}
                        onPress={this.handleOnPressBack}>
                        <Icon name="arrow-back"/>
                        <Text style={{fontFamily: 'Roboto-Medium', fontSize: 18, color: 'white'}}>New hub</Text>
                    </Ripple>

                    {
                        this.props && this.props.activeDatabase && !this.props.allowBack ? (
                            <Ripple style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                position: "absolute",
                                top: 20,
                                right: 20
                            }} onPress={this.handleOnPressForward}>
                                <Text style={{fontFamily: 'Roboto-Medium', fontSize: 18, color: 'white'}}>Login</Text>
                                <Icon name="arrow-forward"/>
                            </Ripple>
                        ) : (null)
                    }
                </View>
                <View style={[style.welcomeTextContainer, {flex: Platform.OS === 'ios' && this.props.screenSize.height <= 600 ? 0.05 : 0.35}]}>
                    <Text style={style.welcomeText}>
                        {getTranslation(translations.manualConfigScreen.title, null)}
                    </Text>
                </View>
                <View style={style.inputsContainer}>
                    <TextField
                        ref={this.nameRef}
                        value={this.state.name}
                        autoCorrect={false}
                        lineWidth={1}
                        enablesReturnKeyAutomatically={true}
                        containerStyle={style.textInput}
                        onChangeText={this.handleTextChange}
                        label={getTranslation(translations.manualConfigScreen.nameLabel, this.props.translation)}
                        autoCapitalize={'none'}
                        tintColor={styles.colorTint}
                        baseColor={styles.colorBase}
                        textColor={styles.colorWhite}
                    />
                    <TextField
                        ref={this.urlRef}
                        value={this.state.url}
                        autoCorrect={false}
                        lineWidth={1}
                        enablesReturnKeyAutomatically={true}
                        containerStyle={style.textInput}
                        onChangeText={this.handleTextChange}
                        label={getTranslation(translations.manualConfigScreen.hubUrlLabel, null)}
                        autoCapitalize={'none'}
                        tintColor={styles.colorTint}
                        baseColor={styles.colorBase}
                        textColor={styles.colorWhite}
                    />
                    <TextField
                        ref={this.clientIDRef}
                        value={this.state.clientId}
                        autoCorrect={false}
                        lineWidth={1}
                        enablesReturnKeyAutomatically={true}
                        containerStyle={style.textInput}
                        onChangeText={this.handleTextChange}
                        label={getTranslation(translations.manualConfigScreen.clientIdLabel, null)}
                        autoCapitalize={'none'}
                        tintColor={styles.colorTint}
                        baseColor={styles.colorBase}
                        textColor={styles.colorWhite}
                    />
                    <TextField
                        ref={this.clientSecretRef}
                        value={this.state.clientSecret}
                        autoCorrect={false}
                        lineWidth={1}
                        enablesReturnKeyAutomatically={true}
                        containerStyle={style.textInput}
                        onChangeText={this.handleTextChange}
                        label={getTranslation(translations.manualConfigScreen.clientSecretPass, null)}
                        secureTextEntry={true}
                        autoCapitalize={'none'}
                        tintColor={styles.colorTint}
                        baseColor={styles.colorBase}
                        textColor={styles.colorWhite}
                    />
                    <SwitchInput
                        id="encryptedData"
                        label={'Encrypted connection'}
                        value={this.state.encryptedData}
                        showValue={true}
                        isEditMode={true}
                        isRequired={false}
                        onChange={this.handleCheck}
                        activeButtonColor={'green'}
                        activeBackgroundColor={'white'}
                        style={{width: '100%'}}
                        labelStyle={{fontFamily: 'Roboto-Medium', fontSize: 18, color: 'white'}}
                        hasTooltip={true}
                        tooltipsMessage={'Encrypted connection is more secure but the sync will take more time'}
                    />
                    {
                        this.props && this.props.activeDatabase && !this.props.isNewHub ? (
                            <Button upperCase={false} onPress={() => {this.checkFields('editCurrentConfiguration')}} text={'Edit current configuration'} style={styles.buttonLogin} />
                        ) : (null)
                    }
                    <Button upperCase={false} onPress={() => {this.checkFields('saveHubConfiguration', true)}} text={getTranslation(translations.manualConfigScreen.saveHubConfigButton, null)} style={styles.buttonLogin} />
                </View>
                {
                    Platform.OS === 'ios' && this.props && this.props.screenSize.height < 600 && this.props.activeDatabase ? (null) : (
                        <View style={style.logoContainer}>
                            <Image source={{uri: 'logo_app'}} style={style.logoStyle} />
                        </View>
                    )
                }

                <ModalSyncStatus
                    showModal={this.props.showModal}
                    syncState={this.props.syncState}
                    showCloseModalButton={this.props.showCloseModalButton}
                    screenSize={this.props.screenSize}
                    closeModal={this.closeModal}
                />

            </KeyboardAwareScrollView>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleOnPressBack = () => {
        if (this.props && this.props.allowBack) {
            this.props.navigator.pop();
        } else {
            this.props.navigator.resetTo({
                screen: 'FirstConfigScreen',
                passProps: {
                    allowBack: this.props.allowBack,
                    skipEdit: this.props.skipEdit,
                    isMultipleHub: this.props.isMultipleHub
                }
                // animationType: 'fade',
                // animated: true
            });
        }
    };

    handleOnPressForward = () => {
        this.props.navigator.push({
            screen: 'LoginScreen',
            passProps: {
                allowBack: this.props.allowBack,
                skipEdit: this.props.skipEdit,
                isMultipleHub: this.props.isMultipleHub
            }
            // animationType: 'fade',
            // animated: true
        })
    };

    updateRef(name, ref) {
        this[name] = ref;
    }

    checkFields = (nextFunction, validateUrl) => {
        if (!this.state.name || !this.state.url || !this.state.clientId || !this.state.clientSecret) {
            Alert.alert("Alert", "Please make sure you have completed all the fields before moving forward", [
                {
                    text: 'Ok', onPress: () => {console.log('Ok pressed')}
                }
            ])
        } else {
            if (this.state.allUrls.indexOf(this.state.url) > -1 && validateUrl) {
                Alert.alert('Alert', "The hub URL that you entered already exists. Are you sure you want to continue?", [
                    {
                        text: 'No', onPress: () => {console.log('No pressed')}
                    },
                    {
                        text: 'Yes', onPress: () => {
                            this.continueTo(nextFunction);
                    }
                    }
                ])
            } else {
                this.continueTo(nextFunction);
            }
        }
    };

    continueTo = (nextFunction) => {
        switch (nextFunction) {
            case 'editCurrentConfiguration':
                this.editCurrentConfiguration();
                break;
            case 'saveHubConfiguration':
                this.saveHubConfiguration();
                break;
            default:
                this.saveHubConfiguration();
                break;
        }
    };

    // Editing the hub involves the following
    // Change clientId from internet credentials
    // Change database name from allDatabases store
    // Will not do syncing since the user can do it manually
    editCurrentConfiguration = () => {
        console.log("Edit current hub config");
        getInternetCredentials(this.props.activeDatabase)
            .then((previousInternetCredentials) => {
                console.log("Previous internet credentials: ", previousInternetCredentials);
                let server = Platform.OS === 'ios' ? previousInternetCredentials.server : previousInternetCredentials.service;
                let username = {
                    name: this.state.name,
                    url: this.state.url,
                    clientId: this.state.clientId,
                    clientSecret: this.state.clientSecret,
                    encryptedData: this.state.encryptedData
                };
                this.props.storeHubConfiguration({
                    url: server,
                    clientId: JSON.stringify(username),
                    clientSecret: previousInternetCredentials.password
                })
            })
            .catch((errorPreviousInternetCredentials) => {
                console.log('Error while getting internet credentials: ', errorPreviousInternetCredentials);
                this.showAlert(getTranslation(translations.hubConfigScreen.saveCurrentHubTitle, this.props.translation), getTranslation(translations.hubConfigScreen.saveCurrentHubMessage, this.props.translation));
            })
    };

    saveHubConfiguration = () => {
        // First generate an id and a password for the hub
        let hubId = generateId();
        hubId = hubId.replace(/\/|\.|\:|\-/g, '');
        let hubPassword = generateId();
        hubPassword = hubPassword.replace(/\/|\.|\:|\-/g, '');
        let clientIdObject = {
            name: this.state.name,
            url: this.state.url,
            clientId: this.state.clientId,
            clientSecret: this.state.clientSecret,
            encryptedData: this.state.encryptedData
        };
        this.props.storeHubConfiguration({
            url: hubId,
            clientId: JSON.stringify(clientIdObject),
            clientSecret: hubPassword
        });
    };

    handleTextChange = (text) => {
        ['name', 'url', 'clientId', 'clientSecret'].map((name) => ({ name, ref: this[name] }))
            .forEach(({ name, ref }) => {
                if (ref.isFocused()) {
                    this.setState({ [name]: text });
                }
            });
    };

    handleCheck = (check) => {
        this.setState({
            encryptedData: check
        }, () => {
            console.log('State: ', this.state);
        })
    };

    closeModal = () => {
        if (this.props.syncState[this.props.syncState.length - 1].status === 'Success') {
            // this.resetModalProps(() => {
            //     if (this.props.isMultipleHub) {
            //         this.props.changeAppRoot('login');
            //     } else {
            //         this.props.navigator.push({
            //             screen: 'LoginScreen',
            //             animated: true,
            //             animationType: 'fade'
            //         })
            //     }
            // })
            this.props.setSyncState('Finished')
        } else {
            // this.resetModalProps(() => {
            //     console.log('reset props')
            // })
            this.props.setSyncState('Reset');
        }
    };

    // resetModalProps = (callback) => {
    //     this.setState({
    //         syncState: [
    //             {id: 'testApi', name: 'Test API', status: '...'},
    //             {id: 'downloadDatabase', name: 'Download database', status: '...'},
    //             {id: 'unzipFile', name: 'Unzip', status: '...'},
    //             {id: 'sync', name: 'Sync', status: '...'}
    //         ],
    //         showModal: false,
    //         showCloseModalButton: false
    //     }, () => {
    //         console.log('New state: ', this.state.syncState);
    //         this.props.setSyncState({id: 'sync', status: null});
    //         callback();
    //     })
    // }
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#55b5a6'
    },
    contentContainerStyle: {
        justifyContent: 'space-around',
        alignItems: 'center',
        flexGrow: 1
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
        fontSize: 25,
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
    }
});

function mapStateToProps(state) {
    const aux = handleChangingSyncState(state.app.syncState);
    const {showModal, showCloseModalButton} = aux;

    let syncState = aux.syncState;
    if (Array.isArray(aux.syncState)) {
        syncState = Object.assign([], aux.syncState);
    } else {
        syncState = aux.syncState;
    }

    return {
        screenSize: state.app.screenSize,
        // errors: state.errors,
        syncState: syncState,
        showModal: showModal,
        showCloseModalButton: showCloseModalButton,
        activeDatabase: state.app.activeDatabase
    };
}

let syncStateGlobal = [
        {id: 'testApi', name: 'Test API', status: '...'},
        {id: 'downloadDatabase', name: 'Download database', status: '...'},
        {id: 'unzipFile', name: 'Unzip', status: '...'},
        {id: 'sync', name: 'Sync', status: '...'}
        ];

handleChangingSyncState = (syncState) => {
    let returnedValue = {
        showModal: !!(syncState && syncState.id && (syncState.status || syncState.name)),
        syncState: syncStateGlobal,
        showCloseModalButton: false
    };

    if (!syncState || syncState === 'Finished' || syncState === 'Reset') {
        returnedValue = {
            showModal: false,
            syncState: syncState === 'Finished' ? syncState : [
                {id: 'testApi', name: 'Test API', status: '...'},
                {id: 'downloadDatabase', name: 'Download database', status: '...'},
                {id: 'unzipFile', name: 'Unzip', status: '...'},
                {id: 'sync', name: 'Sync', status: '...'}
            ],
            showCloseModalButton: false
        }
    } else {
        let itemToBeChanged = returnedValue.syncState.find((e) => {return e.id === syncState.id});
        if (itemToBeChanged) {
            itemToBeChanged.name = syncState.name ? syncState.name : itemToBeChanged.name;
            itemToBeChanged.error = syncState.error || null;
            itemToBeChanged.status = syncState.status || '...';

            let index = syncStateGlobal.findIndex((e) => e.id === syncState.id);
            syncStateGlobal[index] = itemToBeChanged;
            if (itemToBeChanged.status === 'Error' || (index === syncStateGlobal.length - 1 && itemToBeChanged.status === 'Success')) {
                returnedValue.showCloseModalButton = true;
            }
        }
    }

    return returnedValue;
};

function matchDispatchToProps(dispatch) {
    return bindActionCreators({
        loginUser,
        removeErrors,
        storeHubConfiguration,
        setSyncState,
        changeAppRoot
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchToProps)(ManualConfigScreen);