/**
 * Created by florinpopa on 04/07/2018.
 */
/**
 * Created by florinpopa on 14/06/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {View, Text, StyleSheet, Alert, Animated, NativeModules, BackHandler} from 'react-native';
import {Button, Icon} from 'react-native-material-ui';
import styles from './../styles';
import NavBarCustom from './../components/NavBarCustom';
import CalendarPicker from './../components/CalendarPicker';
import {calculateDimension} from './../utils/functions';
import config from './../utils/config';
import Ripple from 'react-native-material-ripple';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import SearchFilterView from './../components/SearchFilterView';
import FollowUpListItem from './../components/FollowUpListItem';
import MissedFollowUpListItem from './../components/MissedFollowUpListItem';
import AnimatedListView from './../components/AnimatedListView';
import Breadcrumb from './../components/Breadcrumb';
import Menu, {MenuItem} from 'react-native-material-menu';
import ValuePicker from './../components/ValuePicker';
import {getFollowUpsForOutbreakId, getMissedFollowUpsForOutbreakId, updateFollowUpAndContact, addFollowUp, generateFollowUp} from './../actions/followUps';
import {getContactsForOutbreakId} from './../actions/contacts';
import {removeErrors} from './../actions/errors';
import {addFilterForScreen, removeFilterForScreen} from './../actions/app';
import ElevatedView from 'react-native-elevated-view';
import _ from 'lodash';
import AddFollowUpScreen from './AddFollowUpScreen';
import {LoaderScreen, Colors} from 'react-native-ui-lib';
import {navigation, extractIdFromPouchId, generateId, updateRequiredFields} from './../utils/functions';
import ViewHOC from './../components/ViewHOC';
import { Popup } from 'react-native-map-link';

const scrollAnim = new Animated.Value(0);
const offsetAnim = new Animated.Value(0);

class FollowUpsScreen extends Component {

    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
            // filter: this.props.filter && this.props.filter['FollowUpsScreen'] ? this.props.filter['FollowUpsScreen'] : null,
            filter: this.props.filter && this.props.filter['FollowUpsScreen'] ? this.props.filter['FollowUpsScreen'] : {
                date: new Date(),
                searchText: ''
            },
            filterFromFilterScreen: this.props.filter && this.props.filter['FollowUpsFilterScreen'] ? this.props.filter['FollowUpsFilterScreen'] : null,
            followUps: [],
            showAddFollowUpScreen: false,
            refreshing: false,
            loading: true,

            isVisible: false,
            latitude: 0,
            longitude: 0,
            sourceLatitude: 0,
            sourceLongitude: 0,
            error: null,
            generating: false,
            calendarPickerOpen: false
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
        this.myFunct =  this.myFunct.bind(this)
    }

    // Please add here the react lifecycle methods that you need
    static getDerivedStateFromProps(props, state) {
        console.log ('getDerivedStateFromProps')
        if (props.errors && props.errors.type && props.errors.message) {
            Alert.alert(props.errors.type, props.errors.message, [
                {
                    text: 'Ok', onPress: () => {
                    props.removeErrors();
                    state.loading = false;
                }
                }
            ])
        }

        // console.log('props.contacts', JSON.stringify(props.contacts))
        if (props.contacts) {
            let prevFollowUps = state.followUps || [];
            let fUps = [];

            let contactsCopy = _.cloneDeep(props.contacts);
            if (props.filter && (props.filter['FollowUpsFilterScreen'] || props.filter['FollowUpsScreen'])) {
                // Take care of search filter
                if (state.filter.searchText) {
                    contactsCopy = contactsCopy.filter((e) => {
                        return  e && e.firstName && state.filter.searchText.toLowerCase().includes(e.firstName.toLowerCase()) ||
                            e && e.lastName && state.filter.searchText.toLowerCase().includes(e.lastName.toLowerCase()) ||
                            e && e.firstName && e.firstName.toLowerCase().includes(state.filter.searchText.toLowerCase()) ||
                            e && e.lastName && e.lastName.toLowerCase().includes(state.filter.searchText.toLowerCase())
                    });
                }
                // Take care of gender filter
                if (state.filterFromFilterScreen && state.filterFromFilterScreen.gender) {
                    contactsCopy = contactsCopy.filter((e) => {return e.gender === state.filterFromFilterScreen.gender});
                }
                // Take care of age range filter
                if (state.filterFromFilterScreen && state.filterFromFilterScreen.age && Array.isArray(state.filterFromFilterScreen.age) && state.filterFromFilterScreen.age.length === 2 && (state.filterFromFilterScreen.age[0] >= 0 || state.filterFromFilterScreen.age[1] <= 150)) {
                    contactsCopy = contactsCopy.filter((e) => {
                        if (e.age && e.age.years !== null && e.age.years !== undefined && e.age.months !== null && e.age.months !== undefined) {
                            if (e.age.years > 0 && e.age.months === 0) {
                                return e.age.years >= state.filterFromFilterScreen.age[0] && e.age.years <= state.filterFromFilterScreen.age[1]
                            } else if (e.age.years === 0 && e.age.months > 0){
                                return e.age.months >= state.filterFromFilterScreen.age[0] && e.age.months <= state.filterFromFilterScreen.age[1]
                            } else if (e.age.years === 0 && e.age.months === 0) {
                                return e.age.years >= state.filterFromFilterScreen.age[0] && e.age.years <= state.filterFromFilterScreen.age[1]
                            }
                        }
                    });
                }
                // Take care of locations filter
                if (state.filterFromFilterScreen  && state.filterFromFilterScreen.selectedLocations && state.filterFromFilterScreen.selectedLocations.length > 0) {
                    contactsCopy = contactsCopy.filter((e) => {
                        let addresses = e.addresses.filter((k) => {
                            return k.locationId !== '' && state.filterFromFilterScreen.selectedLocations.indexOf(k.locationId) >= 0
                        })
                        return addresses.length > 0
                    })
                }
            }

            for (let i=0; i < contactsCopy.length; i++) {
                if (contactsCopy[i].followUps) {
                    fUps = fUps.concat(contactsCopy[i].followUps);
                }
            }

            state.followUps = fUps;
            // Now filter the followUps by type (All/To do/Missed)
            // let oneDay = 24 * 60 * 60 * 1000;
            if (state.filter && state.filter.performed && state.filter.performed.value && state.filter.performed.value !== 'All') {
                fUps = fUps.filter((e) => {return e.statusId === state.filter.performed.value});
            }


            //if we'e generating follow-ups
            if(state.generating) {
                //and we received generated follow-ups
                if(props.followUps.length) {
                    //if we had previous generated follow-ups get difference
                    if (prevFollowUps.length) {
                        let number = parseInt(props.followUps.length - prevFollowUps.length);
                        props.navigator.showInAppNotification({
                            screen: "InAppNotificationScreen",
                            passProps: {
                                number: number
                            },
                            autoDismissTimerSec: 1
                        });
                    } else {
                        //no previous follow-ups just display number of generated
                        let number = parseInt(props.followUps.length);
                        props.navigator.showInAppNotification({
                            screen: "InAppNotificationScreen",
                            passProps: {
                                number: number
                            },
                            autoDismissTimerSec: 1
                        });
                    }

                    //reset generating status
                    state.generating = false;
                }
            }

            if (props.followUps && props.followUps.length > 0) {
                state.followUps = fUps;
            }
            else {
                state.followUps = []
            }
            state.refreshing = false;
            state.loading = false;
        }
        return null;
    }

    componentDidMount() {
        this.setState({
            loading: true,
            generating: false,
        }, () => {
            this.props.getFollowUpsForOutbreakId(this.props.user.activeOutbreakId, this.state.filter, null);
        })
    };

    shouldComponentUpdate(nextProps, nextState) {
        if (!nextProps.user) {
            return false;
        }
        if (!nextProps.contacts) {
            return false;
        }

        return true;
    }
    
    clampedScroll= Animated.diffClamp(
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
        [{nativeEvent: {contentOffset: {y: scrollAnim}}}],
        {useNativeDriver: true}
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
        let followUpTitle = []; followUpTitle[1] = 'Follow-ups';
        return (
            <ViewHOC style={style.container}
                     showLoader={(this.props && this.props.syncState && (this.props.syncState !== 'Finished processing' && this.props.syncState !== 'Error')) || (this && this.state && this.state.loading)}
                     loaderText={this.props && this.props.syncState ? this.props.syncState : 'Loading...'}>
                <NavBarCustom
                    title={null}
                    customTitle={
                        <View
                            style={[style.breadcrumbContainer]}>
                            <Breadcrumb
                                entities={followUpTitle}
                                navigator={this.props.navigator || null}
                            />
                            <View>
                                <Menu
                                    ref="menuRef"
                                    button={
                                        <Ripple onPress={this.showMenu} hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
                                            <Icon name="more-vert"/>
                                        </Ripple>
                                    }
                                >
                                    <MenuItem onPress={this.handleGenerateFollowUps}>Generate for current day</MenuItem>
                                </Menu>
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
                            <Icon name="add" color={'white'} size={15}/>
                        </Ripple>
                    </ElevatedView>
                </NavBarCustom>
                <View style={style.containerContent}>
                    <AnimatedListView
                        stickyHeaderIndices={[0]}
                        data={this.state.followUps || []}
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
                                filterText={(this.state.filterFromFilterScreen && Object.keys(this.state.filterFromFilterScreen).length > 0) ? ("Filter (" + Object.keys(this.state.filterFromFilterScreen).length + ')') : 'Filter'}
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
                                    dialogTitle: 'Select the maps application that you would like to use',
                                    cancelText: 'Cancel',
                                    appsWhiteList: ['google-maps', 'apple-maps', 'waze']
                                    //other possibilities: citymapper, uber, lyft, transit, yandex, moovit
                                }}
                            />
                        ) : console.log('this.state.error', this.state.error)
                    }
                </View>
            </ViewHOC>
        );
    }

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
        this.setState({
            loading: true
        })
    };

    renderFollowUp = ({item}) => {
        return (<FollowUpListItem
            item={item}
            onPressFollowUp={this.handlePressFollowUp}
            onPressMissing={this.handleOnPressMissing}
            onPressExposure={this.handleOnPressExposure}
            onPressMap={this.handleOnPressMap}
            firstActionText={this.getTranslation(item.statusId)}
        />)
    };

    getItemLayout = (data, index) => ({
        length: calculateDimension(178, true, this.props.screenSize),
        offset: calculateDimension(178, true, this.props.screenSize) * index,
        index
    });

    keyExtractor = (item, index) => {
        item._id;
    }

    renderSeparatorComponent = () => {
        return (
            <View style={style.separatorComponentStyle} />
        )
    };

    handleOnRefresh = () => {
        this.setState({
            refreshing: true
        }, () => {
            this.props.getFollowUpsForOutbreakId(this.props.user.activeOutbreakId, this.state.filter, null);
        });
    };

    calculateTopForDropdown = () => {
        let dim = calculateDimension(98, true, this.props.screenSize);
        return dim;
    };

    listEmptyComponent = () => {
        return (
            <View style={[style.emptyComponent, {height: calculateDimension((667 - 152), true, this.props.screenSize)}]}>
                <Text style={style.emptyComponentTextView}>There are no follow-ups to display</Text>
                <Button
                    raised
                    upperCase={false}
                    text="Generate for 1 day"
                    color="blue"
                    titleColor="red"
                    onPress={this.handleGenerateFollowUps}
                    style={{
                        text: style.buttonEmptyListText,
                        container: {width: calculateDimension(230, false, this.props.screenSize), height: calculateDimension(35, true, this.props.screenSize)}
                    }}
                />
            </View>
        )
    };

    onSelectValue = (value) => {
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, {performed: value})
        }), () => {
            console.log("### filter from onSelectValue: ", this.state.filter);
            if (value === 'All') {
                this.removeFromFilter({type: 'performed'});
            } else {
                this.appendToFilter({type: 'performed', value});
            }
        });
    };

    handleDayPress = (day) => {
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, {date: day})
        }), () => {
            console.log("### filter from handleDayPress: ", this.state.filter);
            this.appendToFilter({type: 'date', value: day});
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
        }
        this.props.navigator.push({
            screen: 'FollowUpsSingleScreen',
            animated: true,
            animationType: 'fade',
            passProps: {
                item: itemClone,
                contact: contact,
                filter: this.state.filter,
                startLoadingScreen: this.startLoadingScreen
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

    handleOnPressMap = (followUp, contact) => {

        if (contact && contact.addresses && Array.isArray(contact.addresses) && contact.addresses.length > 0) {
            let contactPlaceOfResidence = contact.addresses.filter((e) => {
                return e.typeId === config.userResidenceAddress.userPlaceOfResidence
            })
            console.log('contactPlaceOfResidence', contactPlaceOfResidence)

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.setState({
                        latitude: contactPlaceOfResidence[0].geoLocation && contactPlaceOfResidence[0].geoLocation.lat ? contactPlaceOfResidence[0].geoLocation.lat : 0,
                        longitude: contactPlaceOfResidence[0].geoLocation && contactPlaceOfResidence[0].geoLocation.lng ? contactPlaceOfResidence[0].geoLocation.lng : 0,
                        sourceLatitude: position.coords.latitude,
                        sourceLongitude: position.coords.longitude,
                        isVisible: true,
                        error: null,
                    });
                },
                (error) => {
                    this.setState({error: error.message})
                },
            );

            // this.props.navigator.showModal({
            //     screen: 'MapScreen',
            //     animated: true
            // })
        }
    }

    handlePressFilter = () => {
        this.props.navigator.showModal({
            screen: 'FollowUpsFilterScreen',
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
            filter: Object.assign({}, prevState.filter, {searchText: text})
        }), console.log('### filter after changed text: ', this.state.filter))
    };

    handleOnPressAddFollowUp = () => {
        // let FilterClone = {
        //     date: new Date(),
        //     searchText: ''
        // }
        this.setState({
            showAddFollowUpScreen: !this.state.showAddFollowUpScreen,
            // filterFromFilterScreen: null,
            // filter: FilterClone
        })
        // , () => {
        //     this.props.removeFilterForScreen('FollowUpsFilterScreen');
        //     this.filterContacts();
        // })
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
            _id: 'followUp.json_false_' + this.props.user.activeOutbreakId + '_' + date.getTime() + '_' + generateId(),
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
            this.props.addFollowUp(this.props.user.activeOutbreakId, contact.id, followUp, this.state.filter, this.props.user.token);
        });
    };

    handleGenerateFollowUps = () => {
        this.setState({
            generating: true,
        }, () => {
            this.props.generateFollowUp(this.props.user.activeOutbreakId, this.state.filter.date, this.props.user.token);
            this.hideMenu();
        });

    };

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
        this.setState({filter}, () => {
            // After setting the filter, we want to apply it
            this.applyFilters();
        });
    };

    applyFilters = () => {
        // let filter = {};
        //
        // filter.where = {};
        // filter.where.and = [];
        //
        // let oneDay = 24 * 60 * 60 * 1000;
        //
        // if (this.state.filter.date) {
        //     filter.where.and.push({date: {gt: new Date(this.state.filter.date.getTime() - oneDay)}});
        //     filter.where.and.push({date: {lt: new Date(this.state.filter.date.getTime() + oneDay)}});
        // }
        // else {
        //     let now = new Date();
        //
        //     filter.where.and.push({date: {gt: new Date(now.getTime() - oneDay)}});
        //     filter.where.and.push({date: {lt: new Date(now.getTime() + oneDay)}});
        // }

        this.props.addFilterForScreen('FollowUpsScreen', this.state.filter);
        //
        // if (this.state.filter.performed === 'Missed') {
        //     this.props.getMissedFollowUpsForOutbreakId(this.props.user.activeOutbreakId, filter, this.props.user.token);
        // } else {
        //     this.props.getFollowUpsForOutbreakId(this.props.user.activeOutbreakId, filter, this.props.user.token);
        // }

        // let defaultFilter = Object.assign({}, config.defaultFilterForContacts);

        // Check if there is an active search
        // if (this.state.filter.searchText) {
        //     if (!defaultFilter.where || Object.keys(defaultFilter.where).length === 0) {
        //         defaultFilter.where = {}
        //     }
        //     if (!defaultFilter.where.or || defaultFilter.where.or.length === 0) {
        //         defaultFilter.where.or = [];
        //     }
        //     defaultFilter.where.or.push({firstName: {like: this.state.filter.searchText, options: 'i'}});
        //     defaultFilter.where.or.push({lastName: {like: this.state.filter.searchText, options: 'i'}});
        // }

        //Check if there are active filters
        // if (this.state.filterFromFilterScreen) {
        //     defaultFilter.where = this.state.filterFromFilterScreen.where;
        //     if (this.state.filter.searchText) {
        //         if (!defaultFilter.where || Object.keys(defaultFilter.where).length === 0) {
        //             defaultFilter.where = {}
        //         }
        //         if (!defaultFilter.where.or || defaultFilter.where.or.length === 0) {
        //             defaultFilter.where.or = [];
        //         }
        //         defaultFilter.where.or.push({firstName: {like: this.state.filter.searchText, options: 'i'}});
        //         defaultFilter.where.or.push({lastName: {like: this.state.filter.searchText, options: 'i'}});
        //     }
        // }
        this.setState({
            loading: true
        }, () => {
            this.props.getFollowUpsForOutbreakId(this.props.user.activeOutbreakId, this.state.filter, null);
        })
    };

    handleOnSubmitEditing = (text) => {
        // this.props.addFilterForScreen("FollowUpsScreen", this.state.filter);
        // let existingFilter = this.state.filterFromFilterScreen ? Object.assign({}, this.state.filterFromFilterScreen) : Object.assign({}, config.defaultFilterForContacts);
        //
        // if (!existingFilter.where || Object.keys(existingFilter.where).length === 0) {
        //     existingFilter.where = {};
        // }
        // if (!existingFilter.where.or || existingFilter.where.or.length === 0) {
        //     existingFilter.where.or = [];
        // }
        // existingFilter.where.or.push({firstName: {like: this.state.filter.searchText, options: 'i'}});
        // existingFilter.where.or.push({lastName: {like: this.state.filter.searchText, options: 'i'}});
        //
        // this.props.getContactsForOutbreakId(this.props.user.activeOutbreakId, existingFilter, this.props.user.token);

        // Filter contacts by firstName and lastName
        this.filterContacts();
    };

    handleOnApplyFilters = (filter) => {
        console.log ('foolowUpsScreen handleOnApplyFilters', filter)
        this.setState({
            filterFromFilterScreen: filter
        }, () => {
            // if (this.state.filter.searchText) {
            //
            //     if (!filter.where.or || filter.where.or.length === 0) {
            //         filter.where.or = [];
            //     }
            //     filter.where.or.push({firstName: {like: this.state.filter.searchText, options: 'i'}});
            //     filter.where.or.push({lastName: {like: this.state.filter.searchText, options: 'i'}});
            // }
            // this.props.getContactsForOutbreakId(this.props.user.activeOutbreakId, filter, this.props.user.token);

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

        // Take care of search filter
        if (this.state.filter.searchText) {
            contactsCopy = contactsCopy.filter((e) => {
                return  e && e.firstName && this.state.filter.searchText.toLowerCase().includes(e.firstName.toLowerCase()) ||
                    e && e.lastName && this.state.filter.searchText.toLowerCase().includes(e.lastName.toLowerCase()) ||
                    e && e.firstName && e.firstName.toLowerCase().includes(this.state.filter.searchText.toLowerCase()) ||
                    e && e.lastName && e.lastName.toLowerCase().includes(this.state.filter.searchText.toLowerCase())
            });
        }

        // Take care of gender filter
        if (this.state.filterFromFilterScreen && this.state.filterFromFilterScreen.gender) {
            contactsCopy = contactsCopy.filter((e) => {return e.gender === this.state.filterFromFilterScreen.gender});
        }

        // Take care of age range filter
        if (this.state.filterFromFilterScreen && this.state.filterFromFilterScreen.age && Array.isArray(this.state.filterFromFilterScreen.age) && this.state.filterFromFilterScreen.age.length === 2 && (this.state.filterFromFilterScreen.age[0] >= 0 || this.state.filterFromFilterScreen.age[1] <= 150)) {
            contactsCopy = contactsCopy.filter((e) => {
                if (e.age && e.age.years !== null && e.age.years !== undefined && e.age.months !== null && e.age.months !== undefined) {
                    if (e.age.years > 0 && e.age.months === 0) {
                        return e.age.years >= this.state.filterFromFilterScreen.age[0] && e.age.years <= this.state.filterFromFilterScreen.age[1]
                    } else if (e.age.years === 0 && e.age.months > 0){
                        return e.age.months >= this.state.filterFromFilterScreen.age[0] && e.age.months <= this.state.filterFromFilterScreen.age[1]
                    } else if (e.age.years === 0 && e.age.months === 0) {
                        return e.age.years >= this.state.filterFromFilterScreen.age[0] && e.age.years <= this.state.filterFromFilterScreen.age[1]
                    }
                }
            });
        }

        // Take care of locations filter
        if (this.state.filterFromFilterScreen  && this.state.filterFromFilterScreen.selectedLocations && this.state.filterFromFilterScreen.selectedLocations.length > 0) {
            contactsCopy = contactsCopy.filter((e) => {
                let addresses = e.addresses.filter((k) => {
                    return k.locationId !== '' && this.state.filterFromFilterScreen.selectedLocations.indexOf(k.locationId) >= 0
                })
                return addresses.length > 0
            })
        }

        // After filtering the contacts, it's time to get their respective follow-ups to show
        this.getFollowUpsFromContacts(contactsCopy);
    };

    myFunct = () => {
        console.log ('ajunge aici si nu crapa !! ')
    }

    getFollowUpsFromContacts = (contacts) => {
        let followUpsToBeShown = [];

        if (contacts && Array.isArray(contacts) && contacts.length > 0) {
            for (let i=0; i<contacts.length; i++) {
                followUpsToBeShown = followUpsToBeShown.concat(contacts[i].followUps);
            }
        }

        this.setState({
            followUps: followUpsToBeShown
        })
    };

    filterFollowUps = () => {
        let followUps = [];
        let oneDay = 24 * 60 * 60 * 1000;
        if (this.state.followUps !== 'All') {
            if (this.state.filter.performed === 'Missed') {
                followUps = Object.assign({}, this.state.followUps);

                followUps = followUps.filter((e) => {
                    return (!e.performed && (new Date(e.date).getTime() - oneDay) < new Date().getTime()) || (e.performed && e.lostToFollowUp)
                })
            } else {
                if (this.state.filter.performed === 'To do') {
                    followUps = Object.assign({}, this.state.followUps);

                    followUps = followUps.filter((e) => {
                        return !e.performed && !e.lostToFollowUp
                    })
                }
            }

            this.setState({followUps});
        }
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

    showMenu = () => {
        this.refs.menuRef.show();
    };

    hideMenu = () => {
        this.refs.menuRef.hide();
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
        backgroundColor: styles.appBackground
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
        screenSize: state.app.screenSize,
        filter: state.app.filters,
        syncState: state.app.syncState,
        followUps: state.followUps,
        contacts: state.contacts,
        errors: state.errors,
        translation: state.app.translation
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        getFollowUpsForOutbreakId,
        getMissedFollowUpsForOutbreakId,
        removeErrors,
        addFilterForScreen,
        getContactsForOutbreakId,
        updateFollowUpAndContact,
        addFollowUp,
        removeFilterForScreen,
        generateFollowUp
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(FollowUpsScreen);