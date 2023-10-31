/**
 * Created by florinpopa on 05/12/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import DeviceInfo from 'react-native-device-info';
import {Alert, Platform, StyleSheet, Text, View, ScrollView} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Modal from 'react-native-modal';
import {Icon, Button as MaterialButton } from 'react-native-material-ui';
import ViewHOC from './../components/ViewHOC';
import Section from './../components/Section';
import ElevatedView from 'react-native-elevated-view';
import {calculateDimension, createStackFromComponent, getTranslation} from './../utils/functions';
import Button from './../components/Button';
import TextInput from './../components/TextInput';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import lodashGet from 'lodash/get';
import {logoutUser, cleanDataAfterLogout} from './../actions/user';
import {removeErrors} from './../actions/errors';
import {saveActiveDatabase, changeAppRoot, verifyChangesExist, setTimezone} from './../actions/app';
import NavBarCustom from './../components/NavBarCustom';
import config from './../utils/config';
import IntervalPicker from './../components/IntervalPicker';
import translations from './../utils/translations';
import {getInternetCredentials, setInternetCredentials, resetInternetCredentials} from 'react-native-keychain';
import {createDatabase, DATABASE_VERSION} from './../queries/database';
import SwitchInput from "../components/SwitchInput";
import {modalStyle} from './../styles/views';
import {checkArrayAndLength} from "../utils/typeCheckingFunctions";
import DropdownInput from "../components/DropdownInput";
import RNFS from 'react-native-fs';
import RNFetchBlobFS from 'rn-fetch-blob/fs';
import RippleFeedback from 'react-native-material-ripple';
import {Navigation} from "react-native-navigation";
import styles from './../styles';

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
        id: 'userEmail',
        label: 'User email',
        type: 'TextInput',
        value: '',
        isRequired: false,
        isEditMode: true,
        keyboardType: 'email-address'
    },
    {
        id: 'encryptedData',
        label: translations.manualConfigScreen.encryptDataLabel,
        type: 'SwitchInput',
        value: true,
        isRequired: false,
        isEditMode: true,
        activeButtonColor: styles.backgroundColor,
        activeBackgroundColor: styles.primaryColor,
    },
    {
        id: 'chunkSize',
        label: 'Number of records per file',
        type: 'IntervalPicker',
        value: 2500,
        min: 500,
        max: 5000,
        isRequired: false,
        isEditMode: true
    },
    {
        id: 'lastSyncDate',
        label: translations.hubConfigScreen.lastSyncDate,
        type: 'TextInput',
        value: '',
        isRequired: false,
        isEditMode: false
    }
];

class FirstConfigScreen extends Component {


    constructor(props) {
        super(props);
        this.state = {
            showLoading: true,
            databaseId: '',
            name: '',
            url: '',
            clientId: '',
            clientSecret: '',
            userEmail: '',
            encryptedData: true,
            chunkSize: 2500,
            allDatabases: [],
            lastSyncDate: null,
            isModified: false,
            isVisible: false,
            hubReplacement: '',
            databaseToBeDeleted: ''
        };
    }

    // Please add here the react lifecycle methods that you need
    componentDidMount() {
        console.log("Did mount comp")
        let activeDatabaseGlobal = null;
        let lastSyncDateGlobal = null;
        let internetCredentialsGlobal = null;
        let databasesGlobal = null;
        Promise.resolve()
            .then(() => AsyncStorage.getItem('activeDatabase'))
            .then((activeDatabase) => {
                activeDatabaseGlobal = activeDatabase;
                let lastSyncDatePromise = AsyncStorage.getItem(activeDatabase);
                let internetCredentialsPromise = getInternetCredentials(activeDatabase);
                let databasesPromise = AsyncStorage.getItem('databases');

                return Promise.all([lastSyncDatePromise, internetCredentialsPromise, databasesPromise])
            })
            .then(([lastSyncDate, internetCredentials, databases]) => {
                let currentHubConfig = JSON.parse(internetCredentials.username);
                // console.log('Active database credentials: ', JSON.parse(activeDatabaseCredentials.username));
                let databaseId = Platform.OS === 'ios' ? internetCredentials.server : internetCredentials.service;

                // lastSyncDateGlobal = lastSyncDate;
                // internetCredentialsGlobal = internetCredentials;
                databasesGlobal = JSON.parse(databases);
                // databasesGlobal = databasesGlobal ? databasesGlobal.filter((e) => {return e.id !== databaseId}) : [];

                this.setState({
                    databaseId: databaseId,
                    name: currentHubConfig.name,
                    url: currentHubConfig.url,
                    clientId: currentHubConfig.clientId,
                    clientSecret: currentHubConfig.clientSecret,
                    userEmail: currentHubConfig.userEmail,
                    encryptedData: currentHubConfig.encryptedData,
                    chunkSize: currentHubConfig.chunkSize,
                    lastSyncDate: lastSyncDate,
                    showLoading: false,
                    allDatabases: databasesGlobal
                }, () => {
                    this.props.verifyChangesExist();
                })
            })
            .catch((errorGetData) => {
                this.setState({
                    showLoading: false
                }, () => {
                    this.showAlert(getTranslation(translations.hubConfigScreen.getOtherHubsTitle, this.props.translation), getTranslation(JSON.stringify(errorGetData), this.props.translation));
                });
            })
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
                <ViewHOC style={{flex: 1, backgroundColor: styles.backgroundColor}} showLoader={this.state.showLoading} loaderText="Loading...">
                    <NavBarCustom style={style.navbarContainer}
                                  title={getTranslation(translations.hubConfigScreen.label, this.props.translation)}
                                  componentId={this.props.componentId}
                                  iconName="close"
                                  handlePressNavbarButton={this.handlePressNavbarButton}
                    />

                    <ScrollView
                        style={[style.container]}
                        contentContainerStyle={style.contentContainerStyle}
                        keyboardShouldPersistTaps={'always'}
                    >
                        <ElevatedView elevation={5} style={{
                            marginHorizontal,
                            width,
                            marginVertical,
                            minHeight,
                            backgroundColor: styles.backgroundColor,
                            borderRadius: 4,
                            paddingBottom: 16
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
                            alignItems: 'center'
                        }}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    minHeight: calculateDimension(40, true, this.props.screenSize),
                                    justifyContent: 'space-around',
                                    alignItems: 'center',
                                    width: '100%'
                                }}>
                                <Button
                                    title={getTranslation(translations.hubConfigScreen.scanQRButtonLabel, this.props.translation)}
                                    onPress={this.handleOnPressQr}
                                    color={styles.primaryColor}
                                    titleColor={styles.backgroundColor}
                                    height={calculateDimension(35, true, this.props.screenSize)}
                                    width={calculateDimension(164, false, this.props.screenSize)}
                                    style={{
                                        marginVertical: calculateDimension(16, true, this.props.screenSize)
                                    }}
                                    upperCase={false}
                                />
                                <Button
                                    title={getTranslation(translations.hubConfigScreen.saveCurrentHubButtonLabel, this.props.translation)}
                                    onPress={this.handlePressSaveHub}
                                    color={styles.primaryColor}
                                    titleColor={styles.backgroundColor}
                                    height={calculateDimension(35, true, this.props.screenSize)}
                                    width={calculateDimension(164, false, this.props.screenSize)}
                                    style={{
                                        marginVertical: calculateDimension(16, true, this.props.screenSize)
                                    }}
                                    upperCase={false}
                                />
                            </View>
                            <Button
                                title={getTranslation(translations.hubConfigScreen.deleteHubButton, this.props.translation)}
                                onPress={() => {this.handlePressDeleteHub(this.state.databaseId)}}
                                color={styles.dangerColor}
                                titleColor={styles.backgroundColor}
                                height={calculateDimension(35, true, this.props.screenSize)}
                                width={calculateDimension(164, false, this.props.screenSize)}
                                style={{
                                    marginVertical: calculateDimension(16, true, this.props.screenSize)
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
                                backgroundColor: styles.backgroundColor,
                                borderRadius: 4
                            }}
                        >
                            <Section label={getTranslation(translations.hubConfigScreen.connectAnotherComputerLabel, this.props.translation)}/>
                            <View style={{alignItems: 'center', justifyContent: 'center'}}>
                                <Button
                                    title={getTranslation(translations.hubConfigScreen.addHubButtonLabel, this.props.translation)}
                                    onPress={this.handleOnPressAddHub}
                                    color={styles.primaryColor}
                                    titleColor={styles.backgroundColor}
                                    height={calculateDimension(35, true, this.props.screenSize)}
                                    width={calculateDimension(164, false, this.props.screenSize)}
                                    style={{
                                        marginVertical: calculateDimension(16, true, this.props.screenSize)
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
                                backgroundColor: styles.backgroundColor,
                                borderRadius: 4
                            }}
                        >
                            <Section label={getTranslation(translations.hubConfigScreen.otherHubConfigurationsLabel, this.props.translation)}/>
                            <View style={{alignItems: 'center', marginVertical: 16}}>
                                {
                                    this.state && this.state.allDatabases && Array.isArray(this.state.allDatabases) && this.state.allDatabases.filter((e) => {return e.id !== this.state.databaseId}).map((database) => {
                                        return this.renderDatabase(database, width);
                                    })
                                }
                            </View>
                        </ElevatedView>
                    </ScrollView>

                    <Modal animationOutTiming={150} isVisible={this.state.isVisible} onBackdropPress={this.hideModal}>
                        <ElevatedView
                            elevation={4}
                            style={
                                [
                                    modalStyle,
                                    {
                                        // height: this.state.databaseId === this.state.databaseToBeDeleted && checkArrayAndLength(this.state.allDatabases.filter((e) => e.id !== this.state.databaseId)) ? '45%' :'25%',
                                        justifyContent: 'space-between',
                                        margin: 15,
                                        backgroundColor: styles.backgroundColor
                                    }
                                    ]
                            }>
                            <View>
                                <Section
                                    label={getTranslation(translations.hubConfigScreen.deleteHubButton, this.props.translation)}
                                    // containerStyle={{height: 20}}
                                />
                                <Section label={getTranslation(translations.hubConfigScreen.confirmationDeleteHub, this.props.translation)} labelSize={'normal'} containerStyle={{backgroundColor: styles.backgroundColor}}
                                         />
                            </View>

                            {
                                this.state.databaseId === this.state.databaseToBeDeleted && checkArrayAndLength(this.state.allDatabases.filter((e) => e.id !== this.state.databaseId)) ? (
                                    <View style={{marginHorizontal, backgroundColor: styles.backgroundColor}}>
                                        <Section
                                            label={getTranslation(translations.hubConfigScreen.replacementHubsLabel, this.props.translation)}
                                            labelSize={'normal'}
                                            textStyle={{marginLeft: 0}}
                                            containerStyle={{backgroundColor: styles.backgroundColor}}
                                        />
                                        <DropdownInput
                                            id={'hubReplacement'}
                                            label={getTranslation(translations.hubConfigScreen.replacementHubs, this.props.translation)}
                                            value={this.state.hubReplacement}
                                            data={this.state.allDatabases.filter((e) => e.id !== this.state.databaseId).map((e) => ({label: e.name, value: e.id}))}
                                            isEditMode={true}
                                            isRequired={true}
                                            onChange={this.onChangeDropDown}
                                            style={{width: '100%'}}
                                        />
                                    </View>
                                ) : (null)
                            }

                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-around',
                                    alignItems: 'center'
                                }}
                            >
                                <Button
                                    title={"Cancel"}
                                    onPress={this.hideModal}
                                    color={styles.primaryColor}
                                    titleColor={styles.backgroundColor}
                                    height={calculateDimension(25, true, this.props.screenSize)}
                                    width={calculateDimension(125, false, this.props.screenSize)}
                                    style={{
                                        marginVertical: calculateDimension(12.5, true, this.props.screenSize)
                                    }}
                                    upperCase={false}
                                />
                                <Button
                                    title={'Delete'}
                                    disabled={(this.state.databaseToBeDeleted === this.state.databaseId && checkArrayAndLength(this.state.allDatabases.filter((e) => e.id !== this.state.databaseId))) && !this.state.hubReplacement}
                                    onPress={this.onConfirmDelete}
                                    color={styles.dangerColor}
                                    titleColor={styles.backgroundColor}
                                    height={calculateDimension(25, true, this.props.screenSize)}
                                    width={calculateDimension(125, false, this.props.screenSize)}
                                    style={{
                                        marginVertical: calculateDimension(12.5, true, this.props.screenSize)
                                    }}
                                    upperCase={false}
                                />
                            </View>
                        </ElevatedView>
                    </Modal>
                </ViewHOC>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handlePressNavbarButton = () => {
        if (this.state.isModified) {
            Alert.alert('', getTranslation(translations.hubConfigScreen.exitWithoutSavingMessage), [
                {
                    text: 'Yes', onPress: () => {Navigation.dismissModal(this.props.componentId)}
                },
                {
                    text: 'Cancel', onPress: () => {console.log('Cancel pressed')}
                }
            ])
        } else {
            Navigation.dismissModal(this.props.componentId);
        }
    };

    renderItem = (item, index) => {
        let width = calculateDimension(315, false, this.props.screenSize);
        console.log("Render item", this.state[item.id], item.id);
        switch(item.type) {
            case 'TextInput':
                return (
                    <TextInput
                        key={item.id}
                        id={item.id}
                        label={getTranslation(item.label, this.props.translation)}
                        index={index}
                        value={this.state[item.id]}
                        isEditMode={item.isEditMode}
                        isRequired={item.isRequired}
                        onChange={this.onChangeText}
                        multiline={item.multiline}
                        style={{width: width, marginHorizontal: 15}}
                        objectType={item.objectType}
                        keyboardType={item.keyboardType}
                        translation={this.props.translation}
                        hasTooltip={item.hasTooltip}
                        tooltipMessage={item.tooltipMessage}
                        secureTextEntry={item.secureTextEntry}
                    />
                );
            case 'SwitchInput' :
                return (
                    <SwitchInput
                        key={item.id}
                        id={item.id}
                        label={getTranslation(item.label, this.props.translation)}
                        index={index}
                        value={this.state[item.id]}
                        showValue={true}
                        isEditMode={item.isEditMode}
                        isRequired={item.isRequired}
                        onChange={this.onChangeSwitch}
                        activeButtonColor={item.activeButtonColor}
                        activeBackgroundColor={item.activeBackgroundColor}
                        style={{justifyContent: 'space-between', width: width, marginHorizontal: 15}}
                        objectType={item.objectType}
                        translation={this.props.translation}
                    />
                );
            case 'IntervalPicker':
                return (
                    <IntervalPicker
                        key={'chunkSize'}
                        id={'chunkSize'}
                        label={'Number of records per file'}
                        value={[this.state.chunkSize]}
                        min={item.min}
                        max={item.max}
                        step={500}
                        onChange={this.onChangeInterval}
                        style={style.intervalPicker}
                        selectedStyle={styles.primaryColor}
                        unselectedStyle={styles.secondaryColor}
                        sliderLength={calculateDimension(300, false, this.props.screenSize)}
                        markerColor={styles.primaryColor}
                    />
                );
            default:
                return (
                    <Text>No component found</Text>
                )
        }
    };

    onChangeText = (text, id) => {
        this.setState({[id]: text, isModified: true}
        // , () => {
        //     console.log('OnChangeText: ', this.state);
        // }
        )
    };

    onChangeSwitch = (value, itemId) => {
        this.setState({[itemId]: value, isModified: true}
        // , () => {
        //     console.log('onChangeSwitch: ', this.state);
        // }
        )
    };

    onChangeInterval = (value, id) => {
        this.setState({[id]: value ? value[0] : null, isModified: true}
        // , () => {
        //     console.log('onChangeSwitch: ', this.state);
        // }
        )
    };

    onChangeDropDown = (value, id) => {
        console.log("What's the hub replacement?", this.state.hubReplacement, value, id)
        this.setState({
            [id]: value
        })
    };

    onConfirmDelete = () => {
        // 1. Delete databaseToBeDeleted
        // 2. Remove the deleted database from AsyncStorage
        // 3. Remove from keychain
        // 4.
        //      a. If deleting only hub and not having hubReplacement, changeRoot to FirstConfigScreen
        //      b. If deleting only hub and having hubReplacement, make hubReplacement active
        //      c. If deleting inactive hub, refresh list of hubs

        let newDatabases = [];
        this.filesDelete(this.state.databaseToBeDeleted)
            .then((resultsRemove) => {
                newDatabases = this.state.allDatabases.filter((e) => e.id !== this.state.databaseToBeDeleted);
                return AsyncStorage.setItem('databases', JSON.stringify(newDatabases));
            })
            .then(() => getInternetCredentials(this.state.databaseToBeDeleted))
            .then((internetCredentials) => {
                console.log('InternetCredentials for databaseToBeDeleted: ', internetCredentials);
                return resetInternetCredentials(this.state.databaseToBeDeleted);
            })
            .catch((errorResetInternetCredentials) => {
                console.log('errorResetInternetCredentials: ', errorResetInternetCredentials);
                return Promise.reject(errorResetInternetCredentials);
            })
            .then(() => {
                // Here check for cases a., b. and c. from main point 4.
                if (checkArrayAndLength(this.state.allDatabases.filter((e) => e.id !== this.state.databaseToBeDeleted))) {
                    if (this.state.hubReplacement) {
                        this.setState({
                            isVisible: false
                        }, () => {
                            setTimeout(() => {
                                this.activateHub({id: this.state.hubReplacement});
                            }, 300);
                        });
                    } else {
                        this.setState({
                            allDatabases: newDatabases,
                            isVisible: false,
                            hubReplacement: ''
                        })
                    }
                } else {
                    if (this.state.databaseToBeDeleted === this.state.databaseId) {
                        AsyncStorage.removeItem('activeDatabase')
                            .then(() => {
                                this.props.cleanDataAfterLogout();
                                this.props.saveActiveDatabase(null);
                                this.props.changeAppRoot('config');
                            })
                            .catch((errorRemoveItem) => {
                                console.log('errorRemoveActiveDatabase: ', errorRemoveItem);
                                this.props.cleanDataAfterLogout();
                                this.props.saveActiveDatabase(null);
                                this.props.changeAppRoot('config');
                            })
                    }
                }
            })
            .catch((errorRemove) => {
                console.log('ErrorRemove', errorRemove);
                this.showAlert("Alert", `Error while deleting hub: \n${JSON.stringify(errorRemove)}`);
            })
    };

    filesDelete = (hubId) => {
        // hubId is database ID
        let pathToDatabase = `${RNFetchBlobFS.dirs.DocumentDir}/`;

        if (Platform.OS === 'ios') {
            pathToDatabase = `${RNFS?.LibraryDirectoryPath}/NoCloud/`;
        }

        // Read all files from the directory and then filter only the hub's ones
        return RNFetchBlobFS.ls(pathToDatabase)
            .then((allFiles) => allFiles.filter((e) => e.includes(hubId)))
            .then((filteredFiles) => Promise.all(filteredFiles.map((e) => RNFetchBlobFS.unlink(`${pathToDatabase}/${e}`))))
    };

    renderDatabase = (database, width) => {
        console.log('Database: ', database);
        return (
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: width - 30}}>
                <Text>{database.name}</Text>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}
                >
                    <Button
                        color={styles.primaryColor}
                        height={calculateDimension(35, true, this.props.screenSize)}
                        width={calculateDimension(164, false, this.props.screenSize)}
                        title={getTranslation(translations.hubConfigScreen.makeActiveLabel, this.props.translation)}
                        titleColor={styles.backgroundColor}
                        onPress={() => {
                            this.onPressMakeHubActive(database)
                        }}
                    />
                    <RippleFeedback
                        style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginLeft: 15
                        }}
                        hitSlop={{
                            left: 5,
                            top: 10,
                            bottom: 10,
                            right: 10
                        }}
                        onPress={() => {this.handlePressDeleteHub(database.id)}}
                    >
                        <Icon name={'delete'}/>
                    </RippleFeedback>
                </View>
            </View>
        )
    };

    handleOnPressQr = () => {
        console.log("QR code scan");
        Navigation.showModal(createStackFromComponent({
            name: 'QRScanScreen',
            passProps: {
                pushNewScreen: this.pushNewScreen
            }
        }))
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
                previousInternetCredentials.username = JSON.stringify({
                    name: this.state.name,
                    url: this.state.url,
                    clientId: this.state.clientId,
                    clientSecret: this.state.clientSecret,
                    encryptedData: this.state.encryptedData,
                    userEmail: this.state.userEmail,
                    chunkSize: this.state.chunkSize
                });
                setInternetCredentials(server, previousInternetCredentials.username, previousInternetCredentials.password)
                    .then(() => {
                        // Edit the all databases store with the potential new name
                        AsyncStorage.getItem('databases')
                            .then((allDatabases) => {
                                allDatabases = JSON.parse(allDatabases);
                                let index = allDatabases.findIndex(elem => elem.id === this.state.databaseId);
                                if (index !== -1) {
                                    allDatabases[index].name = this.state.name;
                                    AsyncStorage.setItem('databases', JSON.stringify(allDatabases), (errorSetDatabases) => {
                                        if (errorSetDatabases) {
                                            this.showAlert(getTranslation(translations.hubConfigScreen.saveCurrentHubTitle, this.props.translation), getTranslation(translations.hubConfigScreen.saveCurrentHubMessage, this.props.translation));
                                        } else {
                                            this.setState({
                                                allDatabases: allDatabases.filter((e) => {return e.id !== server}),
                                                isModified: false
                                            }, () => {
                                                console.log('Finished updating current credentials');
                                                this.showAlert('', getTranslation(translations.hubConfigScreen.successUpdatingCurrentHubMessage, this.props.translation));
                                            })
                                        }
                                    })
                                }
                            })
                            .catch((errorAllDatabases) => {
                                console.log('Error while setting internet credentials: ', errorAllDatabases);
                                this.showAlert(getTranslation(translations.hubConfigScreen.saveCurrentHubTitle, this.props.translation), getTranslation(translations.hubConfigScreen.saveCurrentHubMessage, this.props.translation));
                            });
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

    handleOnPressAddHub = async () => {
        console.log("Check", this.props.componentId, this.props.stackComponentId);
        try {
            await Navigation.push(this.props.componentId,{
                component:{
                    name: 'FirstConfigScreen',
                    passProps: {
                        allowBack: true,
                        skipEdit: true,
                        isMultipleHub: true
                    }
                }
            })
        } catch (e) {
            console.log("Error seen here",e );
        }
    };

    // database = {id, name}
    onPressMakeHubActive = (database) => {
        Alert.alert('', `Are you sure you want to change the hub to ${database.name}?`, [
            {
                text: 'No', onPress: () => {console.log('Cancel pressed')}
            },
            {
                text: 'Yes', onPress: () => this.activateHub(database)
            }
        ])
    };

    activateHub = (database) => {
        let hubConfig = null;
        getInternetCredentials(database.id)
            .then((internetCredentials) => {
                let server = Platform.OS === 'ios' ? internetCredentials?.server : internetCredentials?.service;
                hubConfig = JSON.parse(internetCredentials.username);
                return createDatabase(server, internetCredentials?.password, true);
            })
            .then(()=>AsyncStorage.getItem(`timezone-${hubConfig.url}`))
            .then(timezone => {
                if (timezone) {
                    this.props.setTimezone(timezone);
                }
            })
            .then(()=> AsyncStorage.setItem('databaseVersioningToken', `${database.id}${DeviceInfo.getVersion()}${DATABASE_VERSION}`))
            .then((newDatabase) => AsyncStorage.setItem('activeDatabase', database.id))
            .then(() => {
                this.props.saveActiveDatabase(database.id);
                Alert.alert("", getTranslation(translations.hubConfigScreen.successMakingHubActiveMessage, this.props.translation), [
                    {
                        text: 'Ok', onPress: () => {this.props.logoutUser();}
                    }
                ]);
            })
            .catch((errorChangeActiveDatabase) => {
                console.log('Error getting internet credentials: ', errorChangeActiveDatabase);
                this.showAlert(getTranslation(translations.hubConfigScreen.setActiveDatabaseTitle, this.props.translation), getTranslation(translations.hubConfigScreen.setActiveDatabaseMessage, this.props.translation));
            });
    };

    // Hub deletion methods
    handlePressDeleteHub = (hubId) => {

        if( this.props.changesExist && this.props.changesExist["status"] === 'Data'){
            this.showAlert(getTranslation(translations.hubConfigScreen.deleteHubButton, this.props.translation), getTranslation(translations.hubConfigScreen.deleteHubSyncDataMessage, this.props.translation));
        } else {
            this.setState({
                isVisible: true,
                databaseToBeDeleted: hubId
            });
        }
    };

    hideModal = () => {
        this.setState({
            isVisible: false,
            hubReplacement: ''
        });
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
        backgroundColor: styles.screenBackgroundColor,
        flex: 1
    },
    navbarContainer: {
        backgroundColor: styles.backgroundColor
    },
    contentContainerStyle: {
        alignItems: 'center'
    },
    textInput: {
        alignSelf: 'center',
        width: '100%'
    },
    welcomeTextContainer: {
        flex: 0.35,
        justifyContent: 'center',
        width: '75%'
    },
    welcomeText: {
        color: styles.backgroundColor,
        fontFamily: 'Roboto-Bold',
        fontSize: 35,
        textAlign: 'left'
    },
    inputsContainer: {
        flex: 0.15,
        justifyContent: 'space-around',
        width: '75%'
    },
    logoContainer: {
        alignItems: 'center',
        flex: 0.5,
        justifyContent: 'center',
        width: '100%'
    },
    logoStyle: {
        height: 34,
        width: 180
    },
    text: {
        color: styles.backgroundColor,
        fontFamily: 'Roboto-Light',
        fontSize: 16
    }
});

function mapStateToProps(state) {
    return {
        screenSize: lodashGet(state, 'app.screenSize', config.designScreenSize),
        changesExist: lodashGet(state, 'app.changesExist', null),
        errors: lodashGet(state, 'errors', null),
        translation: lodashGet(state, 'app.translation', [])
    };
}

function matchDispatchToProps(dispatch) {
    return bindActionCreators({
        logoutUser,
        removeErrors,
        saveActiveDatabase,
        verifyChangesExist,
        changeAppRoot,
        cleanDataAfterLogout,
        setTimezone
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchToProps)(FirstConfigScreen);