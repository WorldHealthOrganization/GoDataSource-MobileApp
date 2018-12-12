/**
 * Created by mobileclarisoft on 11/12/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {View, Text, StyleSheet, Alert, Animated, NativeModules, BackHandler} from 'react-native';
import {Button, Icon} from 'react-native-material-ui';
import styles from './../styles';
import NavBarCustom from './../components/NavBarCustom';
import config from './../utils/config';
import Ripple from 'react-native-material-ripple';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import SearchFilterView from './../components/SearchFilterView';
import HelpListItem from './../components/HelpListItem';
import AnimatedListView from './../components/AnimatedListView';
import Breadcrumb from './../components/Breadcrumb';
import Menu, {MenuItem} from 'react-native-material-menu';
import ValuePicker from './../components/ValuePicker';
import {getFollowUpsForOutbreakId, getMissedFollowUpsForOutbreakId, updateFollowUpAndContact, addFollowUp, generateFollowUp} from './../actions/followUps';
import {getContactsForOutbreakId} from './../actions/contacts';
import {removeErrors} from './../actions/errors';
import {addFilterForScreen, removeFilterForScreen, saveGeneratedFollowUps} from './../actions/app';
import ElevatedView from 'react-native-elevated-view';
import _ from 'lodash';
import {LoaderScreen, Colors} from 'react-native-ui-lib';
import {calculateDimension, navigation, extractIdFromPouchId, generateId, updateRequiredFields, getTranslation, localSortContactsForFollowUps, objSort} from './../utils/functions';
import ViewHOC from './../components/ViewHOC';
import { Popup } from 'react-native-map-link';
import moment from 'moment';
import translations from './../utils/translations'

const scrollAnim = new Animated.Value(0);
const offsetAnim = new Animated.Value(0);

class HelpScreen extends Component {

    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        let now = new Date();
        this.state = {
            filter: this.props.filter && this.props.filter['HelpScreen'] ? this.props.filter['HelpScreen'] : {searchText: ''},
            filterFromFilterScreen: this.props.filter && this.props.filter['HelpFilterScreen'] ? this.props.filter['HelpFilterScreen'] : null,
            helpItems: [],
            refreshing: false,
            loading: false,
            isVisible: false,
            latitude: 0,
            longitude: 0,
            sourceLatitude: 0,
            sourceLongitude: 0,
            error: null,
            calendarPickerOpen: false
        };
        // Bind here methods, or at least don't declare methods in the render method
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
        this.renderHelp = this.renderHelp.bind(this);
        this.keyExtractor = this.keyExtractor.bind(this);
        this.renderSeparatorComponent = this.renderSeparatorComponent.bind(this);
        this.listEmptyComponent = this.listEmptyComponent.bind(this);
        this.onSelectValue = this.onSelectValue.bind(this);
        this.filterContacts = this.filterContacts.bind(this);
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }

    // Please add here the react lifecycle methods that you need
    static getDerivedStateFromProps(props, state) {
        console.log ('getDerivedStateFromProps');
        if (props.errors && props.errors.type && props.errors.message) {
            Alert.alert(props.errors.type, props.errors.message, [
                {
                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                    onPress: () => {
                        props.removeErrors();
                        state.loading = false;
                    }
                }
            ])
        }

        if(props.helpCategory){
            state.helpItems = props.helpItem;
        }
        return null;
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    };

    shouldComponentUpdate(nextProps, nextState) {
        if (!nextProps.helpItem) {
            return false;
        }

        return true;
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick() {
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
        let helpTitle = []; helpTitle[1] = getTranslation(translations.helpScreen.helpTitle, this.props.translation);
        return (
            <ViewHOC style={style.container}
                     showLoader={(this.props && this.props.syncState && (this.props.syncState !== 'Finished processing' && this.props.syncState !== 'Error')) || (this && this.state && this.state.loading)}
                     loaderText={this.props && this.props.syncState ? this.props.syncState : getTranslation(translations.loadingScreenMessages.loadingMsg, this.props.translation)}>
                <NavBarCustom
                    title={helpTitle[1]}
                    navigator={this.props.navigator || null}
                    iconName="menu"
                    handlePressNavbarButton={this.handlePressNavbarButton}
                >

                </NavBarCustom>
                <View style={style.containerContent}>
                    <AnimatedListView
                        stickyHeaderIndices={[0]}
                        data={this.state.helpItems || []}
                        renderItem={this.renderHelp}
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
                                filterText={
                                    (this.state.filterFromFilterScreen && Object.keys(this.state.filterFromFilterScreen).length > 0)
                                        ? (getTranslation(translations.generalLabels.filterTitle, this.props.translation) + ' (' + Object.keys(this.state.filterFromFilterScreen).length + ')')
                                        : getTranslation(translations.generalLabels.filterTitle, this.props.translation)}
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
            </ViewHOC>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
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

    renderHelp = ({item}) => {
        return (<HelpListItem
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
            this.props.getFollowUpsForOutbreakId(this.props.user.activeOutbreakId, this.state.filter, null);
        });
    };

    listEmptyComponent = () => {
        return (
            <View style={[style.emptyComponent, {height: calculateDimension((667 - 152), true, this.props.screenSize)}]}>
                <Text style={style.emptyComponentTextView}>
                    {getTranslation(translations.followUpsScreen.noFollowupsMessage, this.props.translation)}
                </Text>
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
                isNew: false,
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
        console.log("Handle on press map followUp: ", JSON.stringify(followUp));
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
                    this.setState({error: error.message})
                },
            );

            // this.props.navigator.showModal({
            //     screen: 'MapScreen',
            //     animated: true
            // })
        }
    };

    handlePressFilter = () => {
        this.props.navigator.showModal({
            screen: 'HelpFilterScreen',
            animated: true,
            passProps: {
                activeFilters: this.state.filterFromFilterScreen || null,
                onApplyFilters: this.handleOnApplyFilters,
                screen: 'HelpFilterScreen'
            }
        })
    };

    handleOnChangeText = (text) => {
        console.log("### handleOnChangeText: ", text);
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, {searchText: text})
        }), console.log('### filter after changed text: ', this.state.filter))
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
        contactsCopy = localSortContactsForFollowUps(contactsCopy, this.props.filter, this.state.filter, this.state.filterFromFilterScreen)

        // After filtering the contacts, it's time to get their respective follow-ups to show
        this.getFollowUpsFromContacts(contactsCopy);
    };

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

    getTranslation = (value) => {
        let valueToBeReturned = value;
        if (value && typeof value === 'string' && value.includes('LNG')) {
            valueToBeReturned = value && this.props.translation && Array.isArray(this.props.translation) && this.props.translation[this.props.translation.map((e) => {return e && e.token ? e.token : null}).indexOf(value)] ? this.props.translation[this.props.translation.map((e) => {
                return e.token
            }).indexOf(value)].translation : '';
        }
        return valueToBeReturned;
    };

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
        translation: state.app.translation,
        helpCategory: state.helpCategory,
        helpItem: state.helpItem,
        role: state.role
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
        saveGeneratedFollowUps,
        removeFilterForScreen,
        generateFollowUp
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(HelpScreen);