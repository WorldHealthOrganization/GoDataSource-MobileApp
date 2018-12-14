/**
 * Created by florinpopa on 18/07/2018.
 */
import React, {Component} from 'react';
import {View, StyleSheet, Animated, Text, BackHandler, Alert} from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import styles from './../styles';
import NavBarCustom from './../components/NavBarCustom';
import ElevatedView from 'react-native-elevated-view';
import Ripple from 'react-native-material-ripple';
import {calculateDimension, getTranslation, navigation} from './../utils/functions';
import FollowUpListItem from './../components/FollowUpListItem';
import SearchFilterView from './../components/SearchFilterView';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import AnimatedListView from './../components/AnimatedListView';
import {getContactsForOutbreakId} from './../actions/contacts';
import {addFilterForScreen, removeFilterForScreen} from './../actions/app';
import ViewHOC from './../components/ViewHOC';
import config from './../utils/config';
import { Popup } from 'react-native-map-link';
import translations from './../utils/translations'
import {getItemByIdRequest} from './../queries/cases'
import Breadcrumb from './../components/Breadcrumb';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const scrollAnim = new Animated.Value(0);
const offsetAnim = new Animated.Value(0);

class ContactsScreen extends Component {
    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
            contacts: [],
            filter: this.props.filter && this.props.filter['FollowUpsScreen'] ? this.props.filter['FollowUpsScreen'] : {
                date: new Date(),
                searchText: ''
            },
            filterFromFilterScreen: this.props.filter && this.props.filter['ContactsFilterScreen'] ? this.props.filter['ContactsFilterScreen'] : null,
            loading: true,

            isVisible: false,
            latitude: 0,
            longitude: 0,
            sourceLatitude: 0,
            sourceLongitude: 0,
            error: null,
            refreshing: false
        };
        // Bind here methods, or at least don't declare methods in the render method
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }

    // Please add here the react lifecycle methods that you need
    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        this.setState({
            loading: true
        }, () => {
            if (this.props && this.props.user && this.props.user.activeOutbreakId) {
                if (this.props.filter && (this.props.filter['ContactsFilterScreen'] || this.props.filter['FollowUpsScreen'])) {
                    this.filterContacts();
                } else {
                    this.props.getContactsForOutbreakId(this.props.user.activeOutbreakId, null, null);
                }
            }
        })
    }

    static getDerivedStateFromProps(props, state) {
        state.loading = false;
        state.refreshing = false
        return null;
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick() {
        // this.props.navigator.goBack(null);
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

        let filterNumbers = 0
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
            if (this.state.filterFromFilterScreen.classification && this.state.filterFromFilterScreen.classification.length > 0) {
                ++filterNumbers
            }
        }
        let filterText = filterNumbers === 0 ? `${getTranslation(translations.generalLabels.filterTitle, this.props.translation)}` : `${getTranslation(translations.generalLabels.filterTitle, this.props.translation)}(${filterNumbers})`

        let contactTitle = []; contactTitle[0] = getTranslation(translations.contactsScreen.contactsTitle, this.props.translation);

        return (
            <ViewHOC style={style.container}
                     showLoader={(this.props && this.props.syncState && (this.props.syncState !== 'Finished processing' && this.props.syncState !== 'Error')) || (this && this.state && this.state.loading)}
                     loaderText={this.props && this.props.syncState ? this.props.syncState : getTranslation(translations.loadingScreenMessages.loadingMsg, this.props.translation)}>
                <NavBarCustom
                    title={null}
                    customTitle={
                        <View style={{flex: 1, flexDirection: 'row'}}>
                            <View
                                style={[style.breadcrumbContainer]}>
                                <Breadcrumb
                                    key="contactKey"
                                    entities={contactTitle}
                                    navigator={this.props.navigator}
                                />
                            </View>
                            <View style={{flex: 0.1, marginRight: 10}}>
                                <Ripple style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }} onPress={this.handleOnPressQRCode}>
                                    <MaterialCommunityIcons name="qrcode-scan" color={'black'} size={20}/>
                                </Ripple>
                            </View>
                           
                            {/* {
                                this.props.role.find((e) => e === config.userPermissions.writeContact) !== undefined ? (
                                    <View style={{flex: 0.1}}>
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
                                            }} onPress={this.handleOnPressAddContact}>
                                                <Icon name="add" color={'white'} size={15}/>
                                            </Ripple>
                                        </ElevatedView>
                                    </View>
                                ) : null
                            } */}
                        </View>
                    }
                    navigator={this.props.navigator}
                    iconName="menu"
                    handlePressNavbarButton={this.handlePressNavbarButton}
                >
                </NavBarCustom>

                <View style={style.containerContent}>
                    <AnimatedListView
                        stickyHeaderIndices={[0]}
                        data={this.props.contacts || []}
                        renderItem={this.renderContact}
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
                        // ListEmptyComponent={this.listEmptyComponent}
                        style={[style.listViewStyle]}
                        componentContainerStyle={style.componentContainerStyle}
                        onScroll={this.handleScroll}
                        getItemLayout={this.getItemLayout}
                        refreshing={this.state.refreshing}
                        onRefresh={this.handleOnRefresh}
                    />
                </View>

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
    handleOnPressAddContact = () => {
        this.props.navigator.push({
            screen: 'ContactsSingleScreen',
            animated: true,
            animationType: 'fade',
            passProps: {
                isNew: true
            }
        })
    };

      //Refresh list of cases
    handleOnRefresh = () => {
        this.setState({
            refreshing: true
        }, () => {
            this.filterContacts();
        });
    };

    keyExtractor = (item, index) => item._id;

    renderContact = (item) => {
        // console.log("### item: ", item);
        let riskLevelReferenceData = this.props.referenceData.filter((o) => {
            return o.categoryId.includes("RISK_LEVEL")
        })
        return (
            <FollowUpListItem
                item={item.item}
                riskLevelReferenceData={riskLevelReferenceData}
                isContact={true}
                firstActionText={getTranslation(translations.contactsScreen.addFollowupsButton, this.props.translation).toUpperCase()}
                secondActionText={getTranslation(translations.contactsScreen.editButton, this.props.translation).toUpperCase()}
                onPressFollowUp={this.handlePressFollowUp}
                onPressMissing={this.handleOnPressMissing}
                onPressExposure={this.handleOnPressExposure}
                onPressMap={this.handleOnPressMap}
            />
        )
    };

    getItemLayout = (data, index) => ({
        length: calculateDimension(178, true, this.props.screenSize),
        offset: calculateDimension(178, true, this.props.screenSize) * index,
        index
    });

    renderSeparatorComponent = () => {
        return (
            <View style={style.separatorComponentStyle} />
        )
    };

    handleOnChangeText = (text) => {
        console.log("### handleOnChangeText: ", text);
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, {searchText: text})
        }), console.log('### filter after changed text: ', this.state.filter))
    };

    handleOnSubmitEditing = (text) => {
        console.log ('text', text)
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

    handlePressFilter = () => {
        this.props.navigator.showModal({
            screen: 'FollowUpsFilterScreen',
            animated: true,
            passProps: {
                activeFilters: this.state.filterFromFilterScreen || null,
                onApplyFilters: this.handleOnApplyFilters,
                screen: 'ContactsFilterScreen'
            }
        })
    };

    handleOnApplyFilters = (filter) => {
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

    handlePressFollowUp = (item, contact) => {
        let contactPlaceOfResidence = [];
        if (item && item.addresses && Array.isArray(item.addresses) && item.addresses.length > 0) {
            contactPlaceOfResidence = item.addresses.filter((e) => {
                return e.typeId === config.userResidenceAddress.userPlaceOfResidence
            })
        }

        this.props.navigator.push({
            screen: 'FollowUpsSingleScreen',
            animated: true,
            animationType: 'fade',
            passProps: {
                item: {
                    date: new Date(),
                    outbreakId: this.props.user.activeOutbreakId,
                    lostToFollowUp: false,
                    address: contactPlaceOfResidence[0] || null
                },
                contact: contact || item,
                filter: this.state.filter,
                isNew: true
            }
        })
    };

    handleOnPressMissing = (followUp, contact) => {
        console.log("Handle on press edit followUp: ", JSON.stringify(followUp));
        console.log("Handle on press edit contact: ", JSON.stringify(contact));
        this.props.navigator.push({
            screen: 'ContactsSingleScreen',
            animated: true,
            animationType: 'fade',
            passProps: {
                contact: contact || followUp
            }
        })
    };

    handleOnPressExposure = (followUp, contact) => {
        console.log('handleOnPressExposure', followUp. contact)
        this.props.navigator.showModal({
            screen: "ExposureScreen",
            animated: true,
            passProps: {
                contact: contact || followUp,
                type: 'Contact'
            }
        })
    };

    handleOnPressMap = (followUp, contact) => {
        console.log("Handle on press map followUp: ", JSON.stringify(followUp));
        console.log("Handle on press map contact: ", JSON.stringify(contact));

        let contactPlaceOfResidence = null
        if (contact && contact.addresses && Array.isArray(contact.addresses) && contact.addresses.length > 0) {
            contactPlaceOfResidence = contact.addresses.filter((e) => {
                return e.typeId === config.userResidenceAddress.userPlaceOfResidence
            })
        } else if (followUp && followUp.addresses && Array.isArray(followUp.addresses) && followUp.addresses.length > 0) {
            contactPlaceOfResidence = followUp.addresses.filter((e) => {
                return e.typeId === config.userResidenceAddress.userPlaceOfResidence
            })
        }

        console.log('contactPlaceOfResidence', contactPlaceOfResidence);
        if (contactPlaceOfResidence !== undefined && contactPlaceOfResidence !== null && Array.isArray(contactPlaceOfResidence) && contactPlaceOfResidence.length > 0 && contactPlaceOfResidence[0] !== undefined && contactPlaceOfResidence[0] !== null) {
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
        }
    };

    handlePressNavbarButton = () => {
        this.props.navigator.toggleDrawer({
            side: 'left',
            animated: true,
            to: 'open'
        })
    };

    filterContacts = () => {
        let allFilters = {}

        if (this.state.filterFromFilterScreen && this.state.filterFromFilterScreen.age) {
            allFilters.age = this.state.filterFromFilterScreen.age
        } else {
            allFilters.age = null
        }

        if (this.state.filterFromFilterScreen && this.state.filterFromFilterScreen.gender && this.state.filterFromFilterScreen.gender !== null) {
            allFilters.gender = this.state.filterFromFilterScreen.gender
        } else {
            allFilters.gender = null
        }

        if (this.state.filter && this.state.filter.searchText && this.state.filter.searchText.trim().length > 0) {
            let splitedFilter= this.state.filter.searchText.split(" ");
            splitedFilter = splitedFilter.filter((e) => {return e !== ""});
            allFilters.searchText = new RegExp(splitedFilter.join("|"), "ig");
        } else {
            allFilters.searchText = null
        }

        if (this.state.filterFromFilterScreen && this.state.filterFromFilterScreen.selectedLocations && this.state.filterFromFilterScreen.selectedLocations.length > 0) {
            allFilters.selectedLocations = this.state.filterFromFilterScreen.selectedLocations;
        } else {
            allFilters.selectedLocations = null
        }

        if (this.state.filterFromFilterScreen && this.state.filterFromFilterScreen.sort && this.state.filterFromFilterScreen.sort.length > 0) {
            allFilters.sort = this.state.filterFromFilterScreen.sort;
        } else {
            allFilters.sort = null
        }
        
        if (!allFilters.age && !allFilters.gender && !allFilters.searchText && !allFilters.selectedLocations && !allFilters.sort) {
            allFilters = null
        }

        this.setState({
            loading: true
        }, () => {
            this.props.getContactsForOutbreakId(this.props.user.activeOutbreakId, allFilters, null);
        })
    };

    onNavigatorEvent = (event) => {
        navigation(event, this.props.navigator);
    };

    handleOnPressQRCode = () => {
        console.log('handleOnPressQRCode')

        this.props.navigator.showModal({
            screen: 'QRScanScreen',
            animated: true,
            passProps: {
                pushNewScreen: this.pushNewEditScreen
            }
        })
    };

    pushNewEditScreen = (QRCodeInfo) => {
        console.log('pushNewEditScreen QRCodeInfo', QRCodeInfo)

        let itemId = null
        let itemType = null
        let outbreakId = null

        if (QRCodeInfo && QRCodeInfo !== undefined && QRCodeInfo.data && QRCodeInfo.data !== undefined){
            let parsedData = null
            try {
                parsedData =  JSON.parse(QRCodeInfo.data)
            } catch(err) {
                setTimeout(function(){
                    Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props && this.props.translation ? this.props.translation : null), getTranslation(translations.alertMessages.errorOccuredMsg,  this.props && this.props.translation ? this.props.translation : null), [
                        {
                            text: getTranslation(translations.alertMessages.okButtonLabel,  this.props && this.props.translation ? this.props.translation : null), 
                            onPress: () => {console.log('Ok pressed')}
                        }
                    ])
                }, 1000)
                return 
            }
            if (parsedData && parsedData !== undefined){
                console.log('parsedData', parsedData)

                if (parsedData.targetResource && parsedData.targetResource !== undefined) {
                    if (parsedData.targetResource === 'case' || parsedData.targetResource === 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE') {
                        itemType = 'case'
                        if (parsedData.resourceContext && parsedData.resourceContext !== undefined && 
                            parsedData.resourceContext.outbreakId && parsedData.resourceContext.outbreakId !== undefined && 
                            parsedData.resourceContext.caseId && parsedData.resourceContext.caseId !== undefined) {
                                itemId = parsedData.resourceContext.caseId
                                outbreakId = parsedData.resourceContext.outbreakId
                        }
                    } else if (parsedData.targetResource === 'contact' || parsedData.targetResource === 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT') {
                        itemType = 'contact'
                        if (parsedData.resourceContext && parsedData.resourceContext !== undefined && 
                            parsedData.resourceContext.outbreakId && parsedData.resourceContext.outbreakId !== undefined && 
                            parsedData.resourceContext.contactId && parsedData.resourceContext.contactId !== undefined) {
                                itemId = parsedData.resourceContext.contactId
                                outbreakId = parsedData.resourceContext.outbreakId
                        }
                    }
                }
            }
        }

        console.log('pushNewEditScreen', itemId, itemType, outbreakId)
        if (itemId && itemType && outbreakId && outbreakId === this.props.user.activeOutbreakId) {
            let itemPouchId = null
            if (itemType === 'case') {
                itemPouchId = `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE_${outbreakId}_${itemId}`
            } else if (itemType === 'contact') {
                itemPouchId = `person.json_LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT_${outbreakId}_${itemId}`
            }

            if (itemPouchId) {
                getItemByIdRequest(outbreakId, itemPouchId, itemType, (error, response) => {
                    if (error) {
                        console.log("*** getItemByIdRequest error: ", error);
                        Alert.alert(getTranslation(translations.alertMessages.alertLabel,  this.props && this.props.translation ? this.props.translation : null), getTranslation(translations.alertMessages.noItemAlert,  this.props && this.props.translation ? this.props.translation : null), [
                            {
                                text: getTranslation(translations.alertMessages.okButtonLabel,  this.props && this.props.translation ? this.props.translation : null), 
                                onPress: () => {console.log('Ok pressed')}
                            }
                        ])
                    }
                    if (response) {
                        console.log("*** getItemByIdRequest response: ", response);
                        if (itemType === 'case') {
                            this.props.navigator.push({
                                screen: 'CaseSingleScreen',
                                animated: true,
                                animationType: 'fade',
                                passProps: {
                                    case: response
                                }
                            })
                        } else if (itemType === 'contact') {
                            this.props.navigator.push({
                                screen: 'ContactsSingleScreen',
                                animated: true,
                                animationType: 'fade',
                                passProps: {
                                    contact: response
                                }
                            })
                        }
                    }
                })
            }
        } else {
            setTimeout(function(){
                Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props && this.props.translation ? this.props.translation : null), getTranslation(translations.alertMessages.noItemAlert,  this.props && this.props.translation ? this.props.translation : null), [
                    {
                        text: getTranslation(translations.alertMessages.okButtonLabel,  this.props && this.props.translation ? this.props.translation : null), 
                        onPress: () => {console.log('Ok pressed')}
                    }
                ])
            }, 1000)
        }
    };
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    containerContent: {
        flex: 1,
        backgroundColor: 'rgba(217, 217, 217, 0.5)'
    },
    separatorComponentStyle: {
        height: 8
    },
    title: {
        fontSize: 17,
        fontFamily: 'Roboto-Medium',
    },
    mapContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF'
    },
    breadcrumbContainer: {
        flex: 0.9,
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },
});

function mapStateToProps(state) {
    return {
        user: state.user,
        screenSize: state.app.screenSize,
        syncState: state.app.syncState,
        filter: state.app.filters,
        contacts: state.contacts,
        errors: state.errors,
        referenceData: state.referenceData,
        translation: state.app.translation,
        role: state.role,
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        getContactsForOutbreakId,
        addFilterForScreen,
        removeFilterForScreen
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(ContactsScreen);