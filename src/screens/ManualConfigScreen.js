/**
 * Created by florinpopa on 28/08/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {Alert, Image, Platform, StyleSheet, Text, View} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {Button, Icon} from 'react-native-material-ui';
import {TextField} from 'react-native-material-textfield';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {loginUser} from './../actions/user';
import {removeErrors} from './../actions/errors';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import url from './../utils/url';
import {changeAppRoot, setSyncState, storeHubConfigurationNew} from './../actions/app';
import Ripple from 'react-native-material-ripple';
import ElevatedView from 'react-native-elevated-view';
import Modal from 'react-native-modal';
import {calculateDimension, generateId, getTranslation} from './../utils/functions';
import translations from './../utils/translations';
import SwitchInput from './../components/SwitchInput';
import {getInternetCredentials} from 'react-native-keychain';
import ModalSyncStatus from './../components/ModalSyncStatus';
import VersionNumber from 'react-native-version-number';
import IntervalPicker from './../components/IntervalPicker';
import constants from './../utils/constants';
import config from './../utils/config';
import lodashGet from 'lodash/get';
import {getAvailableLanguages} from './../requests/languages';
import base64 from 'base-64';
import DropdownInput from './../components/DropdownInput';
import appConfig from './../../app.config';
import LocalButton from './../components/Button';
import {Navigation} from "react-native-navigation";
import {fadeInAnimation, fadeOutAnimation} from "../utils/animations";
import styles from './../styles';

class ManualConfigScreen extends PureComponent {
    nameRef = React.createRef();
    urlRef = React.createRef();
    clientIdRef = React.createRef();
    clientSecretRef = React.createRef();
    userEmailRef = React.createRef();

    constructor(props) {
        super(props);
        this.state = {
            name: appConfig.env === 'development' ? config.whocdCredentials.name : '',
            url: appConfig.env === 'development' ? config.whocdCredentials.hubUrl : '',
            clientId: appConfig.env === 'development' ? config.whocdCredentials.clientId : '',
            clientSecret: appConfig.env === 'development' ? config.whocdCredentials.clientSecret : '',
            userEmail: appConfig.env === 'development' ? config.whocdCredentials.userEmail : '',
            encryptedData: appConfig.env === 'development' ? config.whocdCredentials.encryptedConnection : true,
            chunkSize: appConfig.env === 'development' ? config.whocdCredentials.numberOfData : 2500,
            hasAlert: false,
            syncState: [
                {id: 'testApi', name: 'Test API', status: '...'},
                {id: 'downloadDatabase', name: 'Download database', status: '...'},
                {id: 'unzipFile', name: 'Unzip', status: '...'},
                {id: 'sync', name: 'Sync', status: '...'}
            ],
            showModal: false,
            showCloseModalButton: false,
            allUrls: [],
            showLanguagesModal: false,
            selectedLanguage: 'None',
            availableLanguages: []
        };
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

                if (this.props && this.props.QRCodeInfo && this.props.QRCodeInfo.data) {
                    this.parseQRCodeProp();
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
                                    userEmail: activeDatabaseCredentials.userEmail,
                                    encryptedData: activeDatabaseCredentials.encryptedData,
                                    allUrls: allUrls
                                }, ()=>{
                                    this.nameRef.current.setValue(this.state.name);
                                    this.urlRef.current.setValue(this.state.url);
                                    this.clientIdRef.current.setValue(this.state.clientId);
                                    this.clientSecretRef.current.setValue(this.state.clientSecret);
                                    this.userEmailRef.current.setValue(this.state.userEmail);
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
                this.parseQRCodeProp();
            }
        } catch (errorGetAllDatabases) {
            console.log('Error get all databases: ', errorGetAllDatabases);
            this.parseQRCodeProp();
        }
    };
    
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.QRCodeInfo?.data !== prevProps.QRCodeInfo?.data){
            this.parseQRCodeProp();
        }
    }

    componentWillUnmount() {
        this.props.setSyncState(null);
        syncStateGlobal = [
            {id: 'testApi', name: 'Test API', status: '...'},
            {id: 'downloadDatabase', name: 'Download database', status: '...'},
            {id: 'unzipFile', name: 'Unzip', status: '...'},
            {id: 'sync', name: 'Sync', status: '...'}
        ];
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        if (this.props.syncState === 'Finished' && this.props.showModal === false && this.props.showCloseModalButton === false) {
            if (this.props.isMultipleHub) {
                // console.log('TestQRCode go to login app root');
                this.props.changeAppRoot('login');
            } else {
                // console.log('TestQRCode go to login without app root');
                Navigation.push(this.props.componentId,{
                    component:{
                        name: 'LoginScreen',
                        options:{
                            animations:{
                                push: fadeInAnimation,
                                pop: fadeOutAnimation
                            }
                        }
                    }
                })
            }
        }
        return (
            <View style={[style.container, {paddingTop: Platform.OS === 'ios' ? this.props.screenSize.height >= 812 ? 44 : 20 : 0}]}>
                <View style={style.topSectionContainer}>
                    <View style={style.topSection}>
                        <Ripple style={[style.topNavLinks, {left: -4}]} onPress={this.handleOnPressBack}>
                            <Icon name="arrow-back" style={style.topNavLinksIcon} />
                            <Text style={[style.topNavLinksText, {marginLeft: 4}]}>New hub</Text>
                        </Ripple>

                        {
                            this.props && this.props.activeDatabase && !this.props.allowBack ? (
                                <Ripple style={[style.topNavLinks, {right: -4}]} onPress={this.handleOnPressForward}>
                                    <Text style={[style.topNavLinksText, {marginRight: 4}]}>Login</Text>
                                    <Icon name="arrow-forward" style={style.topNavLinksIcon} />
                                </Ripple>
                            ) : (null)
                        }
                    </View>
                    <View style={style.welcomeTextContainer}>
                        <Text style={[style.welcomeText]}>
                            {getTranslation(translations.manualConfigScreen.title, null)}
                        </Text>
                    </View>
                </View>
                <KeyboardAwareScrollView
                    contentContainerStyle={style.contentContainerStyle}
                    keyboardShouldPersistTaps={'always'}
                >
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
                            tintColor={styles.primaryColor}
                            baseColor={styles.secondaryColor}
                            textColor={styles.textColor}
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
                            tintColor={styles.primaryColor}
                            baseColor={styles.secondaryColor}
                            textColor={styles.textColor}
                        />
                        <TextField
                            ref={this.clientIdRef}
                            value={this.state.clientId}
                            autoCorrect={false}
                            lineWidth={1}
                            enablesReturnKeyAutomatically={true}
                            containerStyle={style.textInput}
                            onChangeText={this.handleTextChange}
                            label={getTranslation(translations.manualConfigScreen.clientIdLabel, null)}
                            autoCapitalize={'none'}
                            tintColor={styles.primaryColor}
                            baseColor={styles.secondaryColor}
                            textColor={styles.textColor}
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
                            tintColor={styles.primaryColor}
                            baseColor={styles.secondaryColor}
                            textColor={styles.textColor}
                        />
                        <TextField
                            ref={this.userEmailRef}
                            value={this.state.userEmail}
                            autoCorrect={false}
                            lineWidth={1}
                            enablesReturnKeyAutomatically={true}
                            keyboardType={'email-address'}
                            containerStyle={style.textInput}
                            onChangeText={this.handleTextChange}
                            label={getTranslation(translations.manualConfigScreen.userEmailLabel, null)}
                            autoCapitalize={'none'}
                            tintColor={styles.primaryColor}
                            baseColor={styles.secondaryColor}
                            textColor={styles.textColor}
                        />
                        <SwitchInput
                            id="encryptedData"
                            label={'Encrypted connection'}
                            value={this.state.encryptedData}
                            showValue={true}
                            isEditMode={true}
                            isRequired={false}
                            onChange={this.handleCheck}
                            activeButtonColor={styles.primaryColor}
                            activeBackgroundColor={styles.backgroundColor}
                            style={style.switchInput}
                            labelStyle={style.switchInputLabel}
                            hasTooltip={true}
                            tooltipsMessage={'Encrypted connection is more secure but the sync will take more time'}
                        />
                        <IntervalPicker
                            id={'chunkSize'}
                            label={'Number of records per file'}
                            value={[this.state.chunkSize]}
                            min={500}
                            max={5000}
                            step={500}
                            style={style.intervalPicker}
                            selectedStyle={styles.primaryColor}
                            unselectedStyle={styles.secondaryColor}
                            sliderLength={calculateDimension(260, false, this.props.screenSize)}
                            onChange={this.onChangeInterval}
                            markerColor={styles.primaryColor}
                            hasTooltip={true}
                            tooltipsMessage={constants.CHUNK_SIZE_TOOLTIP}
                        />
                        {
                            this.props && this.props.activeDatabase && !this.props.isNewHub ? (
                                <Button upperCase={false} onPress={() => {
                                    this.checkFields('editCurrentConfiguration')
                                }} text={'Edit current configuration'} style={styles.secondaryButton}/>
                            ) : (null)
                        }
                        <Button upperCase={false} onPress={() => {
                            this.checkFields('saveHubConfiguration', true)
                        }} text={getTranslation(translations.manualConfigScreen.saveHubConfigButton, null)}
                                style={styles.primaryButton}/>
                    </View>
                    {
                        Platform.OS === 'ios' && this.props && this.props.screenSize.height < 600 && this.props.activeDatabase ? (null) : (
                            <View style={style.logoContainer}>
                                <Image source={{uri: 'logo_app'}} style={style.logoStyle}/>
                                <Text style={style.version}>
                                    {`Version: ${VersionNumber.appVersion} - build ${VersionNumber.buildVersion}`}
                                </Text>
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

                    <Modal
                        isVisible={this.state.showLanguagesModal}
                        onBackdropPress={this.hideModal}
                        key={'languageSelect'}
                        animationOutTiming={150}
                    >
                            <ElevatedView elevation={4} style={style.modalStyle}>
                                <Text style={style.titleText} key={'languageSelectTtitle'}>
                                    Available HUB language
                                </Text>
                                <Text style={style.subText} key={'languageSelectSubText'}>
                                    Please select the language that you want to use. If you click continue without selecting a language the app will download all languages, resulting in potential long sync time.
                                </Text>
                                <DropdownInput
                                    id={'languages'}
                                    label={'Select language'}
                                    value={this.state.selectedLanguage}
                                    data={this.state.availableLanguages}
                                    isEditMode={true}
                                    isRequired={false}
                                    onChange={this.selectLanguage}
                                    screenSize={this.props.screenSize}
                                />
                                <LocalButton
                                    id={'languageSelectContinueSync'}
                                    title={'Continue sync'}
                                    onPress={this.continueSync}
                                    color={styles.primaryColor}
                                    titleColor={styles.backgroundColor}
                                    height={calculateDimension(35, true, this.props.screenSize)}
                                    width={calculateDimension(166, false, this.props.screenSize)} />
                            </ElevatedView>
                    </Modal>

                </KeyboardAwareScrollView>
            </View>
        );
    }
    
    parseQRCodeProp = () =>{
        if (this.props && this.props.QRCodeInfo && this.props.QRCodeInfo.data) {
            console.log("Parse QR code data", this.props.QRCodeInfo.data);
            //TODO map this.props.QRCodeInfo info to props
            // console.log('Here have the QRCodeInfo: ', JSON.parse(this.props.QRCodeInfo.data));
            // console.log('TestQRCode has qr code data');
            let QRCodeData = JSON.parse(this.props.QRCodeInfo.data);
            this.setState({
                url: QRCodeData.url || '',
                clientId: QRCodeData.clientId || '',
                clientSecret: QRCodeData.clientSecret || ''
            }, ()=>{
                this.urlRef.current.setValue(this.state.url);
                this.clientIdRef.current.setValue(this.state.clientId);
                this.clientSecretRef.current.setValue(this.state.clientSecret);
            })
        }
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleOnPressBack = () => {
        if (this.props && this.props.allowBack) {
            Navigation.pop(this.props.componentId);
        } else {
            Navigation.setStackRoot(this.props.componentId,{
                component:{
                    name: 'FirstConfigScreen',
                    passProps: {
                        allowBack: this.props.allowBack,
                        skipEdit: this.props.skipEdit,
                        isMultipleHub: this.props.isMultipleHub
                    }
                }
            });
        }
    };

    handleOnPressForward = () => {
        Navigation.push(this.props.componentId,{
            component:{
                name: 'LoginScreen',
                passProps: {
                    allowBack: this.props.allowBack,
                    skipEdit: this.props.skipEdit,
                    isMultipleHub: this.props.isMultipleHub
                }
            }
        })
    };

    checkFields = (nextFunction, validateUrl) => {
        if (!this.state.name || !this.state.url || !this.state.clientId || !this.state.clientSecret || !this.state.userEmail) {
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
                // Test if correct email
                let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if (!re.test(this.state.userEmail)) {
                    Alert.alert(getTranslation(translations.alertMessages.invalidEmail, this.props && this.props.translation ? this.props.translation : null), getTranslation(translations.alertMessages.emailValidationError, this.props && this.props.translation ? this.props.translation : null), [
                        {
                            text: getTranslation(translations.alertMessages.okButtonLabel, this.props && this.props.translation ? this.props.translation : null),
                            onPress: () => {console.log('Ok pressed')}
                        }
                    ])
                } else {
                    this.continueTo(nextFunction);
                }
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
        // console.log("Edit current hub config");
        getInternetCredentials(this.props.activeDatabase)
            .then((previousInternetCredentials) => {
                console.log("Previous internet credentials: ", previousInternetCredentials);
                let server = Platform.OS === 'ios' ? previousInternetCredentials.server : previousInternetCredentials.service;
                let username = {
                    name: this.state.name,
                    url: this.state.url,
                    clientId: this.state.clientId,
                    clientSecret: this.state.clientSecret,
                    userEmail: this.state.userEmail,
                    encryptedData: this.state.encryptedData,
                    chunkSize: this.state.chunkSize
                };
                this.props.storeHubConfigurationNew({
                    url: server,
                    clientId: JSON.stringify(username),
                    clientSecret: previousInternetCredentials.password
                })
            })
            .catch((errorPreviousInternetCredentials) => {
                // console.log('Error while getting internet credentials: ', errorPreviousInternetCredentials);
                this.showAlert(getTranslation(translations.hubConfigScreen.saveCurrentHubTitle, this.props.translation), getTranslation(translations.hubConfigScreen.saveCurrentHubMessage, this.props.translation));
            })
    };

    saveHubConfiguration = () => {
        // First generate an id and a password for the hub
        // TODO Investigate if language request can be done here. If the request fails, continue with taking all the languages
        getAvailableLanguages(`${this.state.url}/languages`, 'Basic ' + base64.encode(`${this.state.clientId}:${this.state.clientSecret}`))
            .then((availableLanguages) => {
                this.setState(prevState => ({
                    availableLanguages: availableLanguages,
                    showLanguagesModal: true
                }));
            })
            .catch((errorAvailableLanguages) => {
                console.log("Error while getting available languages: ", errorAvailableLanguages);

                let hubId = generateId();
                hubId = hubId.replace(/\/|\.|\:|\-/g, '');
                let hubPassword = generateId();
                hubPassword = hubPassword.replace(/\/|\.|\:|\-/g, '');
                let clientIdObject = {
                    name: this.state.name,
                    url: this.state.url,
                    clientId: this.state.clientId,
                    clientSecret: this.state.clientSecret,
                    userEmail: this.state.userEmail,
                    encryptedData: this.state.encryptedData,
                    chunkSize: this.state.chunkSize,
                    language: []
                };
                if (clientIdObject.url.includes('https')) {
                    clientIdObject.encryptedData = false;
                }
                this.props.storeHubConfigurationNew({
                    url: hubId,
                    clientId: JSON.stringify(clientIdObject),
                    clientSecret: hubPassword
                });
            });
    };

    selectLanguage = (value) => {
        this.setState({
            selectedLanguage: value
        })
    };

    hideModal = () => {
        this.setState({
            selectedLanguage: 'None',
            showLanguagesModal: false,
            availableLanguages: []
        })
    };

    continueSync = () => {
        let clientIdObject = {
            name: this.state.name,
            url: this.state.url,
            clientId: this.state.clientId,
            clientSecret: this.state.clientSecret,
            userEmail: this.state.userEmail,
            encryptedData: this.state.encryptedData,
            chunkSize: this.state.chunkSize,
            language: [this.state.selectedLanguage]
        };
        if (clientIdObject.url.includes('https')) {
            clientIdObject.encryptedData = false;
        }
        this.setState({
            showLanguagesModal: false,
            selectedLanguage: 'None',
            availableLanguages: []
        }, () => {
            let hubId = generateId();
            hubId = hubId.replace(/\/|\.|\:|\-/g, '');
            let hubPassword = generateId();
            hubPassword = hubPassword.replace(/\/|\.|\:|\-/g, '');

            setTimeout(() => {
                this.props.storeHubConfigurationNew({
                    url: hubId,
                    clientId: JSON.stringify(clientIdObject),
                    clientSecret: hubPassword
                });
            }, 300)
        });
    };

    handleTextChange = (text) => {
        ['name', 'url', 'clientId', 'clientSecret', 'userEmail']
            .map((name) => ({ name, ref: this[`${name}Ref`] }))
            .forEach(({ name, ref }) => {
                if (ref.current && ref.current.isFocused()) {
                    this.setState({ [name]: text });
                }
            });
    };

    onChangeInterval = (value, id) => {
        this.setState(prevState => ({
            [id]: value ? value[0] : null
        }))
    };

    handleCheck = (check) => {
        this.setState({
            encryptedData: check
        }, () => {
            // console.log('State: ', this.state);
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
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        backgroundColor: styles.backgroundColor,
        flex: 1
    },
    contentContainerStyle: {
        alignItems: 'center',
        flexGrow: 1,
        justifyContent: 'space-around',
        paddingHorizontal: 24
    },
    topSectionContainer: {
        paddingTop: 16,
        width: '100%'
    },
    topSection: {
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        width: '100%'
    },
    topNavLinks: {
        alignItems: 'center',
        flexDirection: 'row'
    },
    topNavLinksIcon: {
        color: styles.secondaryColor,
        fontSize: 18
    },
    topNavLinksText: {
        color: styles.primaryAltColor,
        fontFamily: 'Roboto-Medium',
        fontSize: 16
    },
    welcomeTextContainer: {
        alignSelf: 'center',
        marginTop: 16,
        paddingHorizontal: 24,
        width: '100%'
    },
    welcomeText: {
        color: styles.textColor,
        fontFamily: 'Roboto-Bold',
        fontSize: 25,
        textAlign: 'left'
    },
    inputsContainer: {
        flex: 0.15,
        justifyContent: 'space-around',
        width: '100%'
    },
    textInput: {
        alignSelf: 'center',
        width: '100%'
    },
    switchInput: {
        marginVertical: 16,
        width: '100%'
    },
    switchInputLabel: {
        color: styles.textColor,
        fontFamily: 'Roboto-Medium',
        fontSize: 16
    },
    intervalPicker: {
        backgroundColor: styles.separatorColor,
        width: '100%'
    },
    logoContainer: {
        alignItems: 'center',
        flex: 0.5,
        flexDirection: 'column',
        justifyContent: 'space-around',
        width: '100%'
    },
    logoStyle: {
        height: 30,
        width: 159
    },
    version: {
        color: styles.secondaryColor,
        fontFamily: 'Roboto-Light',
        fontSize: 12,
        textAlign: 'center'
    },
    modalStyle: {
        alignItems: 'center',
        backgroundColor: styles.backgroundColor,
        borderRadius: 4,
        justifyContent: 'center',
        marginHorizontal: 16,
        padding: 16
    },
    titleText: {
        color: styles.textColor,
        fontFamily: 'Roboto-Medium',
        fontSize: 18,
        marginBottom: 16
    },
    subText: {
        color: styles.textColor,
        fontFamily: 'Roboto-Light',
        fontSize: 16,
        marginBottom: 16
    }
});

function mapStateToProps(state) {
    const aux = handleChangingSyncStateManualConfigScreen(state.app.syncState);
    // console.log('UpdateRn: ', aux);
    const {showModal, showCloseModalButton} = aux;

    let syncState = aux.syncState;
    if (Array.isArray(aux.syncState)) {
        syncState = Object.assign([], aux.syncState);
    } else {
        syncState = aux.syncState;
    }

    return {
        screenSize: lodashGet(state, 'app.screenSize', config.designScreenSize),
        // errors: state.errors,
        syncState: syncState,
        showModal: showModal,
        showCloseModalButton: showCloseModalButton,
        activeDatabase: lodashGet(state, 'app.activeDatabase', null)
    };
}

let syncStateGlobal = [
        {id: 'testApi', name: 'Test API', status: '...'},
        {id: 'downloadDatabase', name: 'Download database', status: '...'},
        {id: 'unzipFile', name: 'Unzip', status: '...'},
        {id: 'sync', name: 'Sync', status: '...'}
        ];

handleChangingSyncStateManualConfigScreen = (syncState) => {
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

    // console.log('UpdateRn: ', returnedValue);
    return returnedValue;
};

function matchDispatchToProps(dispatch) {
    return bindActionCreators({
        loginUser,
        removeErrors,
        storeHubConfigurationNew,
        setSyncState,
        changeAppRoot
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchToProps)(ManualConfigScreen);