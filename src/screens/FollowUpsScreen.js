/**
 * Created by florinpopa on 04/07/2018.
 */
/**
 * Created by florinpopa on 14/06/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, { Component } from 'react';
import { View, Text, StyleSheet, Alert, Animated, NativeModules, BackHandler } from 'react-native';
import { Button, Icon } from 'react-native-material-ui';
import styles from './../styles';
import NavBarCustom from './../components/NavBarCustom';
import CalendarPicker from './../components/CalendarPicker';
import config from './../utils/config';
import Ripple from 'react-native-material-ripple';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import SearchFilterView from './../components/SearchFilterView';
import FollowUpListItem from './../components/FollowUpListItem';
import PersonListItem from './../components/PersonListItem';
import MissedFollowUpListItem from './../components/MissedFollowUpListItem';
import AnimatedListView from './../components/AnimatedListView';
import Breadcrumb from './../components/Breadcrumb';
import Menu, { MenuItem } from 'react-native-material-menu';
import ValuePicker from './../components/ValuePicker';
import { getFollowUpsForOutbreakId, getMissedFollowUpsForOutbreakId, addFollowUp } from './../actions/followUps';
import { getContactsForOutbreakId } from './../actions/contacts';
import { removeErrors } from './../actions/errors';
import { addFilterForScreen, removeFilterForScreen, saveGeneratedFollowUps } from './../actions/app';
import ElevatedView from 'react-native-elevated-view';
import _ from 'lodash';
import AddFollowUpScreen from './AddFollowUpScreen';
// import GenerateFollowUpScreen from './GenerateFollowUpScreen';
import { LoaderScreen, Colors } from 'react-native-ui-lib';
import { calculateDimension, navigation, extractIdFromPouchId, generateId, updateRequiredFields, getTranslation, localSortContactsForFollowUps, objSort } from './../utils/functions';
import ViewHOC from './../components/ViewHOC';
import { Popup } from 'react-native-map-link';
import moment from 'moment';
import translations from './../utils/translations'
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { getItemByIdRequest } from './../queries/cases';
import { pushNewEditScreen } from './../utils/screenTransitionFunctions';
import RNExitApp from 'react-native-exit-app';

const scrollAnim = new Animated.Value(0);
const offsetAnim = new Animated.Value(0);

class FollowUpsScreen extends Component {

    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        let now = new Date();
        this.state = {
            filter: this.props.filter && this.props.filter['FollowUpsScreen'] ? this.props.filter['FollowUpsScreen'] : {
                date: new Date(new Date((now.getUTCMonth() + 1) + '/' + now.getUTCDate() + '/' + now.getUTCFullYear()).getTime() - ((moment().isDST() ? now.getTimezoneOffset() : now.getTimezoneOffset() - 60) * 60 * 1000)),
                searchText: ''
            },
            filterFromFilterScreen: this.props.filter && this.props.filter['FollowUpsFilterScreen'] ? this.props.filter['FollowUpsFilterScreen'] : null,
            followUps: [],
            showAddFollowUpScreen: false,
            showGenerateFollowUpScreen: false,
            refreshing: false,
            loading: true,

            isVisible: false,
            latitude: 0,
            longitude: 0,
            sourceLatitude: 0,
            sourceLongitude: 0,
            error: null,
            generating: false,
            calendarPickerOpen: false,

            followUpsColors: {}
        };
        // Bind here methods, or at least don't declare methods in the render method
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
        this.renderFollowUp = this.renderFollowUp.bind(this);
        this.keyExtractor = this.keyExtractor.bind(this);
        this.renderSeparatorComponent = this.renderSeparatorComponent.bind(this);
        this.calculateTopForDropdown = this.calculateTopForDropdown.bind(this);
        this.listEmptyComponent = this.listEmptyComponent.bind(this);
        this.onSelectValue = this.onSelectValue.bind(this);
        this.handleDayPress = this.handleDayPress.bind(this);
        this.openCalendarModal = this.openCalendarModal.bind(this);
        this.filterContacts = this.filterContacts.bind(this);
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    };

    // Please add here the react lifecycle methods that you need
    static getDerivedStateFromProps(props, state) {
        if (props.errors && props.errors.type && props.errors.message) {
            Alert.alert(props.errors.type, props.errors.message, [
                {
                    text: getTranslation(translations.alertMessages.okButtonLabel, props.translation),
                    onPress: () => {
                        props.removeErrors();
                        state.loading = false;
                    }
                }
            ])
        }

        // console.log('props.contacts', JSON.stringify(props.contacts))
        if (props.contacts) {

            const contactsHasFollowUps = props.contacts.some(e => {
                return e.followUps !== undefined && e.followUps !== null && e.followUps.length > 0
            })

            if (contactsHasFollowUps) {
                let fUps = [];

                let contactsCopy = _.cloneDeep(props.contacts);
                if (state.filter || state.filterFromFilterScreen) {
                    contactsCopy = localSortContactsForFollowUps(contactsCopy, props.filter, state.filter, state.filterFromFilterScreen)
                } else {
                    contactsCopy = objSort(contactsCopy, ['lastName', false])
                }

                for (let i = 0; i < contactsCopy.length; i++) {
                    if (contactsCopy[i].followUps) {
                        fUps = fUps.concat(contactsCopy[i].followUps);
                    }
                }

                state.followUps = fUps;
                if (state.filter && state.filter.performed && state.filter.performed.value && state.filter.performed.value !== 'LNG_FOLLOW_UPS_DROP_DOWN_FILTER_STATUS_LABEL_ALL') {
                    fUps = fUps.filter((e) => { return e.statusId === state.filter.performed.value });
                }

                if (props.followUps && props.followUps.length > 0) {
                    state.followUps = fUps;
                }
                else {
                    state.followUps = []
                }

                state.refreshing = false;
                state.loading = false;
            } else {
                state.followUps = [];
                state.refreshing = false;
                state.loading = false;
            }
        }

        console.log(`Before making it false: state.refreshing - ${state.refreshing},  state.loading - ${state.loading}`);
        return null;
    };

    componentDidMount() {
        console.log('Component Did mount');
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        this.mimeComponentDidMount()
    };

    shouldComponentUpdate(nextProps, nextState) {
        if (!nextProps.user) {
            return false;
        }
        if (!nextProps.contacts) {
            return false;
        }

        return true;
    };

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    };

    handleBackButtonClick() {
        Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.androidBackButtonMsg, this.props.translation), [
            {
                text: getTranslation(translations.alertMessages.yesButtonLabel, this.props.translation), onPress: () => {
                    RNExitApp.exitApp();
                    return true;
                }
            },
            {
                text: getTranslation(translations.alertMessages.cancelButtonLabel, this.props.translation), onPress: () => {
                    return true;
                }
            }
        ])
        return true;
    };

    mimeComponentDidMount = () => {
        let followUpsColors = {};
        let refData = this.props.referenceData.filter((e) => {return e.categoryId === "LNG_REFERENCE_DATA_CONTACT_DAILY_FOLLOW_UP_STATUS_TYPE"})
        for (let i=0; i<refData.length; i++) {
            followUpsColors[refData[i].value] = refData[i].colorCode || styles.buttonGreen
        }
        this.setState({
            loading: true,
            generating: false,
            followUpsColors
        }, () => {
            if (this.props.user && this.props.user.activeOutbreakId) {
                this.props.getFollowUpsForOutbreakId(this.props.user.activeOutbreakId, this.state.filter, this.props.teams, null);
            }
        })
    }

    clampedScroll = Animated.diffClamp(
        Animated.add(
            scrollAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
                extrapolateLeft: 'clamp',
            }),
            offsetAnim,
        ),
        0,
        30,
    );

    handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollAnim } } }],
        { useNativeDriver: true }
    );

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        const navbarTranslate = this.clampedScroll.interpolate({
            inputRange: [0, 30],
            outputRange: [0, -30],
            extrapolate: 'clamp',
        });
        const navbarOpacity = this.clampedScroll.interpolate({
            inputRange: [0, 30],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });

        let filterNumbers = 0;
        if (this.state.filterFromFilterScreen) {
            if (this.state.filterFromFilterScreen.gender && this.state.filterFromFilterScreen.gender !== null && this.state.filterFromFilterScreen.gender !== undefined) {
                ++filterNumbers
            }
            if (this.state.filterFromFilterScreen.age && this.state.filterFromFilterScreen.age.length > 0) {
                ++filterNumbers
            }
            if (this.state.filterFromFilterScreen.selectedLocations && this.state.filterFromFilterScreen.selectedLocations.length > 0) {
                ++filterNumbers
            }
        }
        let filterText = filterNumbers === 0 ? `${getTranslation(translations.generalLabels.filterTitle, this.props.translation)}` : `${getTranslation(translations.generalLabels.filterTitle, this.props.translation)}(${filterNumbers})`

        let followUpTitle = []; followUpTitle[0] = getTranslation(translations.followUpsScreen.followUpsTitle, this.props.translation);
        console.log(`Refreshing: ${this.state.refreshing}   Loading: ${this.state.loading}`);
        return (
            <ViewHOC style={style.container}
                showLoader={(this.props && this.props.syncState && ((this.props.syncState.id === 'sync' && this.props.syncState.status !== null && this.props.syncState.status !== 'Success') && this.props.syncState.status !== 'Error')) || (this && this.state && this.state.loading)}
                loaderText={this.props && this.props.syncState ? 'Loading' : getTranslation(translations.loadingScreenMessages.loadingMsg, this.props.translation)}>
                <NavBarCustom
                    title={null}
                    customTitle={
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <View
                                style={[style.breadcrumbContainer]}>
                                <Breadcrumb
                                    key="followUpsKey"
                                    entities={followUpTitle}
                                    navigator={this.props.navigator}
                                />
                            </View>
                            <View style={{ flex: 0.15, marginRight: 10 }}>
                                <Ripple style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }} onPress={this.handleOnPressQRCode}>
                                    <MaterialCommunityIcons name="qrcode-scan" color={'black'} size={20} />
                                </Ripple>
                            </View>

                            <View style={{ flex: 0.135 /*, marginRight: 10*/ }}>
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
                                    }} onPress={this.goToHelpScreen}>
                                        <Icon name="help" color={'white'} size={15} />
                                    </Ripple>
                                </ElevatedView>
                            </View>
                        </View>
                    }
                    navigator={this.props.navigator || null}
                    iconName="menu"
                    handlePressNavbarButton={this.handlePressNavbarButton}
                >
                    <CalendarPicker
                        width={calculateDimension(124, false, this.props.screenSize)}
                        height={calculateDimension(25, true, this.props.screenSize)}
                        onDayPress={this.handleDayPress}
                        value={this.state.filter.date || new Date().toLocaleString()}
                        pickerOpen={this.state.calendarPickerOpen}
                        openCalendarModal={this.openCalendarModal}
                    />
                    <ValuePicker
                        top={this.calculateTopForDropdown()}
                        onSelectValue={this.onSelectValue}
                        value={this.state.filter.performed && this.state.filter.performed.label ? this.state.filter.performed.label : config.dropDownValues[0].value}
                    />
                    {
                        this.props.role.find((e) => e === config.userPermissions.writeFollowUp) !== undefined ? (
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
                                }} onPress={this.handleOnPressAddFollowUp}>
                                    <Icon name="add" color={'white'} size={15} />
                                </Ripple>
                            </ElevatedView>
                        ) : null
                    }
                </NavBarCustom>
                <View style={style.containerContent}>
                    <AnimatedListView
                        stickyHeaderIndices={[0]}
                        data={this.state.followUps || []}
                        extraData={this.props.contacts}
                        renderItem={this.renderFollowUp}
                        keyExtractor={this.keyExtractor}
                        ListHeaderComponent={
                            <SearchFilterView
                                style={{
                                    transform: [{
                                        translateY: navbarTranslate
                                    }],
                                    opacity: navbarOpacity
                                }}
                                value={this.state.filter.searchText}
                                onPress={this.handlePressFilter}
                                onChangeText={this.handleOnChangeText}
                                onSubmitEditing={this.handleOnSubmitEditing}
                                filterText={filterText}
                            />}
                        ItemSeparatorComponent={this.renderSeparatorComponent}
                        ListEmptyComponent={this.listEmptyComponent}
                        style={[style.listViewStyle]}
                        componentContainerStyle={style.componentContainerStyle}
                        onScroll={this.handleScroll}
                        refreshing={this.state.refreshing}
                        onRefresh={this.handleOnRefresh}
                        getItemLayout={this.getItemLayout}
                    />
                </View>

                <AddFollowUpScreen
                    showAddFollowUpScreen={this.state.showAddFollowUpScreen}
                    onCancelPressed={this.handleOnCancelPressed}
                    onSavePressed={this.handleOnSavePressed}
                />
                <View style={styles.mapContainer}>
                    {
                        this.state.error === null ? (
                            <Popup
                                isVisible={this.state.isVisible}
                                onCancelPressed={() => this.setState({ isVisible: false })}
                                onAppPressed={() => this.setState({ isVisible: false })}
                                onBackButtonPressed={() => this.setState({ isVisible: false })}
                                options={{
                                    latitude: this.state.latitude,
                                    longitude: this.state.longitude,
                                    sourceLatitude: this.state.sourceLatitude,
                                    sourceLongitude: this.state.sourceLongitude,
                                    dialogTitle: getTranslation(translations.alertMessages.mapsPopupMessage, this.props.translation),
                                    cancelText: getTranslation(translations.alertMessages.cancelButtonLabel, this.props.translation),
                                    appsWhiteList: ['google-maps', 'apple-maps', 'waze', 'citymapper', 'uber', 'lyft', 'transit', 'yandex', 'moovit']
                                }}
                            />
                        ) : console.log('this.state.error', this.state.error)
                    }
                </View>
                {/*<GenerateFollowUpScreen*/}
                    {/*showGenerateFollowUpScreen={this.state.showGenerateFollowUpScreen}*/}
                    {/*onCancelPressed={this.handleModalGenerateFollowUps}*/}
                    {/*onOkPressed={this.handleGenerateNewFollowUps}*/}
                {/*/>*/}
            </ViewHOC>

        );
    };

    // Please write here all the methods that are not react native lifecycle methods
    openCalendarModal = () => {
        console.log("You got another thing coming");
        this.setState({
            calendarPickerOpen: !this.state.calendarPickerOpen
        })
    };

    handlePressNavbarButton = () => {
        this.setState({
            calendarPickerOpen: false
        }, () => {
            this.props.navigator.toggleDrawer({
                side: 'left',
                animated: true,
                to: 'open'
            })
        })
    };

    startLoadingScreen = () => {
        console.log('startLoadingScreen: ', this.state.loading);
        this.setState({
            loading: true
        })
    };

    renderFollowUp = ({ item }) => {
        let margins = calculateDimension(16, false, this.props.screenSize);
        return(
            <PersonListItem
                type={'FollowUp'}
                itemToRender={item}
                onPressMapIconProp={this.handleOnPressMap}
                onPressNameProp={this.handleOnPressNameProp}
                onPressExposureProp={this.handleOnPressExposureProp}
                textsArray={[
                    getTranslation(item.statusId, this.props.translation),
                    getTranslation(translations.followUpsScreen.addExposureFollowUpLabel, this.props.translation)
                ]}
                textsStyleArray={[[styles.buttonTextActionsBar, {color: this.state.followUpsColors[item.statusId], marginLeft: margins}], [styles.buttonTextActionsBar, {marginRight: margins}]]}
                onPressTextsArray={[
                    () => {
                        // console.log('Test performance renderFollowUpQuestion');
                        this.handlePressFollowUp(item, this.props.contacts.find((e) => {return extractIdFromPouchId(e._id, 'person') === item.personId}))
                    },
                    () => {
                        // console.log('Test performance renderFollowUpQuestion');
                        this.handleOnPressExposure(item, this.props.contacts.find((e) => {return extractIdFromPouchId(e._id, 'person') === item.personId}))
                    }]}
            />
        )

        // return (<FollowUpListItem
        //     item={item}
        //     onPressFollowUp={this.handlePressFollowUp}
        //     onPressMissing={this.handleOnPressMissing}
        //     onPressExposure={this.handleOnPressExposure}
        //     onPressMap={this.handleOnPressMap}
        //     firstActionText={getTranslation(item.statusId, this.props.translation)}
        // />)
    };

    getItemLayout = (data, index) => ({
        length: calculateDimension(178, true, this.props.screenSize),
        offset: calculateDimension(178, true, this.props.screenSize) * index,
        index
    });

    keyExtractor = (item, index) => {
        item._id;
    };

    renderSeparatorComponent = () => {
        return (
            <View style={style.separatorComponentStyle} />
        )
    };

    handleOnRefresh = () => {
        this.setState({
            refreshing: true
        }, () => {
            this.props.getFollowUpsForOutbreakId(this.props.user.activeOutbreakId, this.state.filter, this.props.teams, null);
        });
    };

    calculateTopForDropdown = () => {
        let dim = calculateDimension(98, true, this.props.screenSize);
        return dim;
    };

    listEmptyComponent = () => {
        return (
            <View style={[style.emptyComponent, { height: calculateDimension((667 - 152), true, this.props.screenSize) }]}>
                <Text style={style.emptyComponentTextView}>
                    {getTranslation(translations.followUpsScreen.noFollowupsMessage, this.props.translation)}
                </Text>
            </View>
        )
    };

    onSelectValue = (value) => {
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, { performed: value })
        }), () => {
            console.log("### filter from onSelectValue: ", this.state.filter);
            if (value && ((value.label && value.label === 'All') || (value.value && value.value === 'LNG_FOLLOW_UPS_DROP_DOWN_FILTER_STATUS_LABEL_ALL'))) {
                this.removeFromFilter({ type: 'performed' });
            } else {
                this.appendToFilter({ type: 'performed', value });
            }
        });
    };

    handleDayPress = (day) => {
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, { date: day })
        }), () => {
            console.log("### filter from handleDayPress: ", this.state.filter);
            this.appendToFilter({ type: 'date', value: day });
        });
    };

    handlePressFollowUp = (item, contact) => {
        console.log("### handlePressFollowUp: ", item);

        let itemClone = Object.assign({}, item);
        if (contact && contact.addresses && Array.isArray(contact.addresses) && contact.addresses.length > 0) {
            let contactPlaceOfResidence = contact.addresses.filter((e) => {
                return e.typeId === config.userResidenceAddress.userPlaceOfResidence
            });
            itemClone.address = contactPlaceOfResidence[0];
        } else {
            itemClone.address = null
        }
        this.props.navigator.push({
            screen: 'FollowUpsSingleScreen',
            // animated: true,
            // animationType: 'fade',
            passProps: {
                isNew: false,
                item: itemClone,
                contact: contact,
                filter: this.state.filter,
                startLoadingScreen: this.startLoadingScreen,
                mimeComponentDidMount: this.mimeComponentDidMount

            }
        })
    };

    handleOnPressMissing = (followUp, contact) => {
        // Alert.alert('Warning', 'Are you sure you want to set this follow-up as missed?', [
        //     {
        //         text: 'No', onPress: () => {console.log("Cancel missing")}
        //     },
        //     {
        //         text: 'Yes', onPress: () => {
        //         let myFollowUp = Object.assign({}, followUp)
        //         let myFollowups = Object.assign([], contact.followUps)
        //
        //         myFollowUp.statusId = config.followUpStatuses.missed
        //         myFollowUp = updateRequiredFields(outbreakId = this.props.user.activeOutbreakId, userId = this.props.user._id, record = Object.assign({}, myFollowUp), action = 'update')
        //
        //         myFollowups[myFollowups.map((e) => {return e._id}).indexOf(myFollowUp._id)] = myFollowUp
        //         let myContact = Object.assign({}, contact, {followUps: myFollowups})
        //
        //         if (this.props && this.props.user && this.props.user.activeOutbreakId) {
        //             this.props.updateFollowUpAndContact(this.props.user.activeOutbreakId, null, myFollowUp._id, myFollowUp, myContact, null);
        //         }
        //     }
        //     }
        // ])
        console.log('Missed button is not here anymore');
    };

    handleOnPressExposure = (followUp, contact) => {
        this.props.navigator.showModal({
            screen: "ExposureScreen",
            animated: true,
            passProps: {
                contact: contact,
                type: 'Contact'
            }
        })
    };

    handleOnPressMap = (contact) => {
        console.log("Handle on press map contact: ", JSON.stringify(contact));

        if (contact && contact.addresses && Array.isArray(contact.addresses) && contact.addresses.length > 0) {
            let contactPlaceOfResidence = contact.addresses.filter((e) => {
                return e.typeId === config.userResidenceAddress.userPlaceOfResidence
            })
            console.log('contactPlaceOfResidence', contactPlaceOfResidence)
            let contactPlaceOfResidenceLatitude = contactPlaceOfResidence[0] && contactPlaceOfResidence[0].geoLocation && contactPlaceOfResidence[0].geoLocation.coordinates && Array.isArray(contactPlaceOfResidence[0].geoLocation.coordinates) && contactPlaceOfResidence[0].geoLocation.coordinates.length === 2 && contactPlaceOfResidence[0].geoLocation.coordinates[1] !== undefined && contactPlaceOfResidence[0].geoLocation.coordinates[1] !== null ? contactPlaceOfResidence[0].geoLocation.coordinates[1] : 0
            let contactPlaceOfResidenceLongitude = contactPlaceOfResidence[0] && contactPlaceOfResidence[0].geoLocation && contactPlaceOfResidence[0].geoLocation.coordinates && Array.isArray(contactPlaceOfResidence[0].geoLocation.coordinates) && contactPlaceOfResidence[0].geoLocation.coordinates.length === 2 && contactPlaceOfResidence[0].geoLocation.coordinates[0] !== undefined && contactPlaceOfResidence[0].geoLocation.coordinates[0] !== null ? contactPlaceOfResidence[0].geoLocation.coordinates[0] : 0
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.setState({
                        latitude: contactPlaceOfResidenceLatitude,
                        longitude: contactPlaceOfResidenceLongitude,
                        sourceLatitude: position.coords.latitude,
                        sourceLongitude: position.coords.longitude,
                        isVisible: true,
                        error: null,
                    });
                },
                (error) => {
                    Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(error.message, this.props.translation), [
                        {
                            text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                            onPress: () => { console.log("OK pressed") }
                        }
                    ])
                },
                {
                    timeout: 5000
                }
            );
        }
    };

    handleOnPressNameProp = (type, personId) => {
        this.props.navigator.push({
            screen: 'ContactsSingleScreen',
            animated: true,
            passProps: {
                contact: this.props.contacts.find((e) => {return e._id === personId}),
                previousScreen: translations.followUpsSingleScreen.title
            }
        })
    };

    handleOnPressExposureProp = (exposureId) => {
        if (exposureId.includes('person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE_'))
        this.props.navigator.push({
            screen: 'CaseSingleScreen',
            animated: true,
            passProps: {
                case: this.props.cases.find((e) => {return e._id === exposureId}),
                previousScreen: translations.followUpsSingleScreen.title
            }
        })
    };

    handlePressFilter = () => {
        this.props.navigator.showModal({
            screen: 'FilterScreen',
            animated: true,
            passProps: {
                activeFilters: this.state.filterFromFilterScreen || null,
                onApplyFilters: this.handleOnApplyFilters,
                screen: 'FollowUpsFilterScreen'
            }
        })
    };

    handleOnChangeText = (text) => {
        console.log("### handleOnChangeText: ", text);
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, { searchText: text })
        }), console.log('### filter after changed text: ', this.state.filter))
    };

    handleOnPressAddFollowUp = () => {
        this.setState({
            showAddFollowUpScreen: !this.state.showAddFollowUpScreen,
        })
    };

    handleOnCancelPressed = () => {
        this.setState({
            showAddFollowUpScreen: !this.state.showAddFollowUpScreen
        })
    };

    handleOnSavePressed = (contact, date) => {
        // Here contact={label: <name>, value: <contactId>} and date is a regular date
        let now = new Date();
        date = new Date(date);
        let followUp = {
            _id: 'followUp.json_' + this.props.user.activeOutbreakId + '_' + date.getTime() + '_' + generateId(),
            statusId: config.followUpStatuses.notPerformed,
            targeted: false,
            date: date,
            fileType: 'followUp.json',
            outbreakId: this.props.user.activeOutbreakId,
            personId: extractIdFromPouchId(contact.id, 'person.json'),
            updatedAt: now.toISOString(),
            updatedBy: extractIdFromPouchId(this.props.user._id, 'user.json'),
            deleted: false,
            deletedAt: null
        };

        this.setState({
            showAddFollowUpScreen: !this.state.showAddFollowUpScreen
        }, () => {
            this.props.addFollowUp(this.props.user.activeOutbreakId, contact.id, followUp, this.state.filter, this.props.teams, this.props.user.token);
        });
    };

    // handleGenerateFollowUps = (date) => {
    //     this.setState({
    //         generating: true,
    //     }, () => {
    //         this.props.generateFollowUp(this.props.user.activeOutbreakId, this.state.filter.date, date, this.props.user.token);
    //         this.hideMenu();
    //     });
    //
    // };
    //
    // handleGenerateNewFollowUps = (date) => {
    //     this.setState({
    //         showGenerateFollowUpScreen: !this.state.showGenerateFollowUpScreen,
    //     }, () => {
    //         this.handleGenerateFollowUps(date);
    //     });
    // };
    //
    // handleModalGenerateFollowUps = () => {
    //     this.hideMenu();
    //     setTimeout(function () {
    //         this.setState({
    //             showGenerateFollowUpScreen: !this.state.showGenerateFollowUpScreen,
    //         }, () => {
    //             console.log("showGenerateFollowUpScreen", this.state.showGenerateFollowUpScreen);
    //         });
    //     }.bind(this), 2000);
    // };

    // Append to the existing filter newProp={name: value}
    appendToFilter = (newProp) => {
        let auxFilter = Object.assign({}, this.state.filter);

        // If the filter exists, check if it has already the wanted props and change them. Otherwise add them
        if (auxFilter) {
            auxFilter[newProp.type] = newProp.value;
        }

        this.setFilter(auxFilter);
    };

    removeFromFilter = (newProp) => {
        let auxFilter = Object.assign({}, this.state.filter);

        if (auxFilter && auxFilter[newProp.type]) {
            delete auxFilter[newProp.type];
        }

        this.setFilter(auxFilter);
    };

    setFilter = (filter) => {
        this.setState({ filter }, () => {
            this.applyFilters();
        });
    };

    applyFilters = () => {
        this.props.addFilterForScreen('FollowUpsScreen', this.state.filter);
        this.setState({
            loading: true
        }, () => {
            this.props.getFollowUpsForOutbreakId(this.props.user.activeOutbreakId, this.state.filter, this.props.teams, null);
        })
    };

    handleOnSubmitEditing = (text) => {
        this.filterContacts();
    };

    handleOnApplyFilters = (filter) => {
        console.log('foolowUpsScreen handleOnApplyFilters', filter)
        this.setState({
            filterFromFilterScreen: filter
        }, () => {
            this.filterContacts();
        })
    };

    onNavigatorEvent = (event) => {
        navigation(event, this.props.navigator);
    };

    // Method to filter the contacts inside the screen
    // Since the date filter on the FollowUps is always active, we can filter the contacts inside the screen
    // This means that on the contacts screen it has to be a filter on the database
    filterContacts = () => {
        let contactsCopy = _.cloneDeep(this.props.contacts);
        contactsCopy = localSortContactsForFollowUps(contactsCopy, this.props.filter, this.state.filter, this.state.filterFromFilterScreen)

        // After filtering the contacts, it's time to get their respective follow-ups to show
        this.getFollowUpsFromContacts(contactsCopy);
    };

    getFollowUpsFromContacts = (contacts) => {
        let followUpsToBeShown = [];
        const { filter } = this.state

        if (contacts && Array.isArray(contacts) && contacts.length > 0) {
            for (let i = 0; i < contacts.length; i++) {
                followUpsToBeShown = followUpsToBeShown.concat(contacts[i].followUps);
            }
        }

        if (filter && filter.performed && filter.performed.value && filter.performed.value !== 'LNG_FOLLOW_UPS_DROP_DOWN_FILTER_STATUS_LABEL_ALL') {
            followUpsToBeShown = followUpsToBeShown.filter((e) => { return e.statusId === filter.performed.value });
        }

        this.setState({
            followUps: followUpsToBeShown
        })
    };

    showMenu = () => {
        this.refs.menuRef.show();
    };

    hideMenu = () => {
        this.refs.menuRef.hide();
    };

    goToHelpScreen = () => {
        let pageAskingHelpFrom = 'followUps'
        this.props.navigator.showModal({
            screen: 'HelpScreen',
            animated: true,
            passProps: {
                pageAskingHelpFrom: pageAskingHelpFrom
            }
        });
    };

    handleOnPressQRCode = () => {
        console.log('handleOnPressQRCode');

        this.props.navigator.showModal({
            screen: 'QRScanScreen',
            animated: true,
            passProps: {
                pushNewScreen: this.pushNewEditScreenLocal
            }
        })
    };

    pushNewEditScreenLocal = (QRCodeInfo) => {
        console.log('pushNewEditScreen QRCodeInfo do with method from another side', QRCodeInfo);

        this.setState({
            loading: true
        }, () => {
            pushNewEditScreen(QRCodeInfo, this.props.navigator, this.props && this.props.user ? this.props.user : null, this.props && this.props.translation ? this.props.translation : null, (error, itemType, record) => {
                this.setState({
                    loading: false
                }, () => {
                    if (error) {
                        if (error === translations.alertMessages.noItemAlert && itemType === 'case' && record) {
                            Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props && this.props.translation ? this.props.translation : null), `${getTranslation(error, this.props && this.props.translation ? this.props.translation : null)}.\n${getTranslation(translations.alertMessages.addMissingPerson, this.props && this.props.translation ? this.props.translation : null)}`, [
                                {
                                    text: getTranslation(translations.alertMessages.cancelButtonLabel, this.props && this.props.translation ? this.props.translation : null),
                                    onPress: () => {
                                        console.log('Cancel pressed');
                                    }
                                },
                                {
                                    text: getTranslation(translations.alertMessages.yesButtonLabel, this.props && this.props.translation ? this.props.translation : null),
                                    onPress: () => {
                                        console.log('Yes pressed');
                                        this.props.navigator.push({
                                            screen: 'CaseSingleScreen',
                                            animated: true,
                                            animationType: 'fade',
                                            passProps: {
                                                case: Object.assign({}, record, {
                                                    outbreakId: this.props.user.activeOutbreakId,
                                                }, config.caseBlueprint),
                                                forceNew: true
                                            }
                                        })
                                    }
                                },
                            ])
                        } else {
                            Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props && this.props.translation ? this.props.translation : null), getTranslation(error, this.props && this.props.translation ? this.props.translation : null), [
                                {
                                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props && this.props.translation ? this.props.translation : null),
                                    onPress: () => {
                                        console.log('Ok pressed');
                                    }
                                }
                            ])
                        }
                    } else {
                        if (itemType && record) {
                            if (itemType === 'case') {
                                this.props.navigator.push({
                                    screen: 'CaseSingleScreen',
                                    animated: true,
                                    animationType: 'fade',
                                    passProps: {
                                        case: record
                                    }
                                })
                            } else if (itemType === 'contact') {
                                this.props.navigator.push({
                                    screen: 'ContactsSingleScreen',
                                    animated: true,
                                    animationType: 'fade',
                                    passProps: {
                                        contact: record
                                    }
                                })
                            }
                        }
                    }
                });
            })
        });

        //     let itemId = null;
        //     let itemType = null;
        //     let outbreakId = null;
        //
        //     if (QRCodeInfo && QRCodeInfo !== undefined && QRCodeInfo.data && QRCodeInfo.data !== undefined){
        //         let parsedData = null;
        //         try {
        //             parsedData =  JSON.parse(QRCodeInfo.data)
        //         } catch(err) {
        //             setTimeout(function(){
        //                 Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props && this.props.translation ? this.props.translation : null), getTranslation(translations.alertMessages.errorOccuredMsg, this.props && this.props.translation ? this.props.translation : null), [
        //                     {
        //                         text: getTranslation(translations.alertMessages.okButtonLabel, this.props && this.props.translation ? this.props.translation : null),
        //                         onPress: () => {console.log('Ok pressed')}
        //                     }
        //                 ])
        //             }, 1000);
        //             return
        //         }
        //         if (parsedData && parsedData !== undefined){
        //             console.log('parsedData', parsedData);
        //
        //             if (parsedData.targetResource && parsedData.targetResource !== undefined) {
        //                 if (parsedData.targetResource === 'case' || parsedData.targetResource === 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE') {
        //                     itemType = 'case';
        //                     if (parsedData.resourceContext && parsedData.resourceContext !== undefined &&
        //                         parsedData.resourceContext.outbreakId && parsedData.resourceContext.outbreakId !== undefined &&
        //                         parsedData.resourceContext.caseId && parsedData.resourceContext.caseId !== undefined) {
        //                         itemId = parsedData.resourceContext.caseId;
        //                         outbreakId = parsedData.resourceContext.outbreakId
        //                     }
        //                 } else if (parsedData.targetResource === 'contact' || parsedData.targetResource === 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT') {
        //                     itemType = 'contact';
        //                     if (parsedData.resourceContext && parsedData.resourceContext !== undefined &&
        //                         parsedData.resourceContext.outbreakId && parsedData.resourceContext.outbreakId !== undefined &&
        //                         parsedData.resourceContext.contactId && parsedData.resourceContext.contactId !== undefined) {
        //                         itemId = parsedData.resourceContext.contactId;
        //                         outbreakId = parsedData.resourceContext.outbreakId;
        //                     }
        //                 }
        //             }
        //         }
        //     }
        //
        //     console.log('pushNewEditScreen', itemId, itemType, outbreakId);
        //     if (itemId && itemType && outbreakId && outbreakId === this.props.user.activeOutbreakId) {
        //         let itemPouchId = null;
        //         if (itemType === 'case') {
        //             itemPouchId = `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE_${outbreakId}_${itemId}`
        //         } else if (itemType === 'contact') {
        //             itemPouchId = `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT_${outbreakId}_${itemId}`
        //         }
        //
        //         if (itemPouchId) {
        //             getItemByIdRequest(outbreakId, itemPouchId, itemType, (error, response) => {
        //                 if (error) {
        //                     console.log("*** getItemByIdRequest error: ", error);
        //                     Alert.alert(getTranslation(translations.alertMessages.alertLabel,  this.props && this.props.translation ? this.props.translation : null), getTranslation(translations.alertMessages.noItemAlert,  this.props && this.props.translation ? this.props.translation : null), [
        //                         {
        //                             text: getTranslation(translations.alertMessages.okButtonLabel,  this.props && this.props.translation ? this.props.translation : null),
        //                             onPress: () => {console.log('Ok pressed')}
        //                         }
        //                     ])
        //                 }
        //                 if (response) {
        //                     console.log("*** getItemByIdRequest response: ", response);
        //                     if (itemType === 'case') {
        //                         this.props.navigator.push({
        //                             screen: 'CaseSingleScreen',
        //                             animated: true,
        //                             animationType: 'fade',
        //                             passProps: {
        //                                 case: response
        //                             }
        //                         })
        //                     } else if (itemType === 'contact') {
        //                         this.props.navigator.push({
        //                             screen: 'ContactsSingleScreen',
        //                             animated: true,
        //                             animationType: 'fade',
        //                             passProps: {
        //                                 contact: response
        //                             }
        //                         })
        //                     }
        //                 }
        //             })
        //         }
        //     } else {
        //         setTimeout(function(){
        //             Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props && this.props.translation ? this.props.translation : null), getTranslation(translations.alertMessages.noItemAlert,  this.props && this.props.translation ? this.props.translation : null), [
        //                 {
        //                     text: getTranslation(translations.alertMessages.okButtonLabel,  this.props && this.props.translation ? this.props.translation : null),
        //                     onPress: () => {console.log('Ok pressed')}
        //                 }
        //             ])
        //         }, 1000)
        //     }
    };
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    mapContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF'
    },
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    containerContent: {
        flex: 1,
        backgroundColor: styles.appBackground,
        paddingBottom: 25
    },
    separatorComponentStyle: {
        height: 8
    },
    listViewStyle: {

    },
    componentContainerStyle: {

    },
    emptyComponent: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyComponentTextView: {
        fontFamily: 'Roboto-Light',
        fontSize: 15,
        color: styles.textEmptyList
    },
    buttonEmptyListText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 16.8,
        color: styles.buttonTextGray
    },
    breadcrumbContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
});

function mapStateToProps(state) {
    return {
        user: state.user,
        teams: state.teams,
        screenSize: state.app.screenSize,
        filter: state.app.filters,
        syncState: state.app.syncState,
        generatedFollowUps: state.app.generatedFollowUps,
        followUps: state.followUps,
        contacts: state.contacts,
        errors: state.errors,
        translation: state.app.translation,
        helpCategory: state.helpCategory,
        helpItem: state.helpItem,
        role: state.role,
        cases: state.cases,
        referenceData: state.referenceData
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        getFollowUpsForOutbreakId,
        getMissedFollowUpsForOutbreakId,
        removeErrors,
        addFilterForScreen,
        getContactsForOutbreakId,
        addFollowUp,
        saveGeneratedFollowUps,
        removeFilterForScreen,
        // generateFollowUp
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(FollowUpsScreen);