/**
 * Created by mobileclarisoft on 13/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {TextInput, View, Text, Alert, StyleSheet, Dimensions, Platform, FlatList, Animated, BackHandler} from 'react-native';
import {Button, Icon as IconMaterial} from 'react-native-material-ui';
import styles from './../styles';
import NavBarCustom from './../components/NavBarCustom';
import {calculateDimension, navigation, getTranslation} from './../utils/functions';
import config from './../utils/config';
import Ripple from 'react-native-material-ripple';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import SearchFilterView from './../components/SearchFilterView';
import CaseListItem from './../components/CaseListItem';
import ElevatedView from 'react-native-elevated-view';
import Breadcrumb from './../components/Breadcrumb';
import {getCasesForOutbreakId} from './../actions/cases';
import {removeErrors} from './../actions/errors';
import {addFilterForScreen, removeFilterForScreen} from './../actions/app';
import AnimatedListView from './../components/AnimatedListView';
import ViewHOC from './../components/ViewHOC';
import _ from 'lodash';
import { Popup } from 'react-native-map-link';
import translations from './../utils/translations'
import {getItemByIdRequest} from './../queries/cases'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

let height = Dimensions.get('window').height;
let width = Dimensions.get('window').width;

const scrollAnim = new Animated.Value(0);
const offsetAnim = new Animated.Value(0);

class CasesScreen extends Component {
    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
            filter: this.props.filter && this.props.filter['CasesScreen'] ? this.props.filter['CasesScreen'] : {
                searchText: ''
            },
            filterFromFilterScreen: this.props.filter && this.props.filter['CasesFilterScreen'] ? this.props.filter['CasesFilterScreen'] : null,
            cases: [],
            refreshing: false,
            loading: true,

            isVisible: false,
            latitude: 0,
            longitude: 0,
            sourceLatitude: 0,
            sourceLongitude: 0,
            error: null,
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
            if (this.props.filter && (this.props.filter['CasesScreen'] || this.props.filter['CasesFilterScreen'])) {
                this.filterCases();
            } else {
                this.props.getCasesForOutbreakId(this.props.user.activeOutbreakId, null, null);
            }
        })
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick() {
        // this.props.navigator.goBack(null);
        return true;
    }

    static getDerivedStateFromProps(props, state) {
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

        state.loading = false;
        state.refreshing = false
        return null;
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
        let caseTitle = []; caseTitle[1] = getTranslation(translations.casesScreen.casesTitle, this.props.translation);
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
                                    key="caseKey"
                                    entities={caseTitle}
                                    navigator={this.props.navigator}
                                />
                            </View>
                            <View style={{flex: 0.2, marginRight: 10}}>
                                <Ripple style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }} onPress={this.handleOnPressQRCode}>
                                    <Icon name="qrcode-scan" color={'black'} size={30}/>
                                </Ripple>
                            </View>
                         
                            <View style={{flex: 0.1}}>
                                <ElevatedView
                                    elevation={3}
                                    style={{
                                        backgroundColor: this.props.role.find((e) => e === config.userPermissions.writeContact) !== undefined ? styles.buttonGreen : 'white',
                                        width: calculateDimension(33, false, this.props.screenSize),
                                        height: calculateDimension(25, true, this.props.screenSize),
                                        borderRadius: 4
                                    }}
                                >
                                {
                                    this.props.role.find((e) => e === config.userPermissions.writeCase) !== undefined ? (
                                        <Ripple style={{
                                            flex: 1,
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }} onPress={this.handleOnPressAddCase}>
                                            <IconMaterial name="add" color={'white'} size={15}/>
                                        </Ripple>
                                    ) : null
                                }
                                </ElevatedView>
                            </View>
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
                        data={this.props.cases || []}
                        renderItem={this.renderCase}
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
                                filterText={(this.state.filterFromFilterScreen && Object.keys(this.state.filterFromFilterScreen).length > 0) ? (getTranslation(translations.generalLabels.filterTitle, this.props.translation) + " (" + Object.keys(this.state.filterFromFilterScreen).length + ')') : getTranslation(translations.generalLabels.filterTitle, this.props.translation)}
                            />
                        }
                        ItemSeparatorComponent={this.renderSeparatorComponent}
                        style={[style.listViewStyle]}
                        componentContainerStyle={style.componentContainerStyle}
                        onScroll={this.handleScroll}
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
    handlePressNavbarButton = () => {
        this.props.navigator.toggleDrawer({
            side: 'left',
            animated: true,
            to: 'open'
        })
    };

    //Search cases using keyword
    handleOnSubmitEditing = () => {
        // this.props.addFilterForScreen("CasesScreen", this.state.filter);
        // let existingFilter = this.state.filterFromFilterScreen ? Object.assign({}, this.state.filterFromFilterScreen) : Object.assign({}, config.defaultFilterForCases);
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
        // this.props.getCasesForOutbreakId(this.props.user.activeOutbreakId, existingFilter, this.props.user.token);

        // Filter cases by firstName and lastName
        this.filterCases();
    };

    //Save keyword for search in cases
    handleOnChangeText = (text) => {
        console.log("### handleOnChangeText: ", text);
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, {searchText: text})
        }), console.log('### filter after changed text: ', this.state.filter))
    };

    //Open filter screen for cases
    handlePressFilter = () => {
        this.props.navigator.showModal({
            screen: 'CasesFilterScreen',
            animated: true,
            passProps: {
                activeFilters: this.state.filterFromFilterScreen || null,
                onApplyFilters: this.handleOnApplyFilters
            }
        })
    };

    //Filter cases by selected criteria
    handleOnApplyFilters = (filter) => {
        this.setState({
            filterFromFilterScreen: filter
        }, () => {
            // if (this.state.filter.searchText) {
            //
            //     if(!filter.hasOwnProperty('where')){
            //         filter.where = {};
            //     }
            //
            //     if (!filter.where.or || filter.where.or.length === 0) {
            //         filter.where.or = [];
            //     }
            //     filter.where.or.push({firstName: {like: this.state.filter.searchText, options: 'i'}});
            //     filter.where.or.push({lastName: {like: this.state.filter.searchText, options: 'i'}});
            // }
            // this.props.getCasesForOutbreakId(this.props.user.activeOutbreakId, filter, this.props.user.token);

            // Filter cases
            this.filterCases();
        })
    };

    //Render a case tile
    renderCase = ({item}) => {
        return (
            <CaseListItem 
                item={item} 
                onPressCase={this.handleOnPressCase}             
                onPressMap={this.handleOnPressMap}
                onPressAddContact={this.handleOnPressAddContact} 
            />
        )
    };

    //Key extractor for case list
    keyExtractor = (item, index) => item._id;

    //Item separator for case list
    renderSeparatorComponent = () => {
        return (
            <View style={style.separatorComponentStyle} />
        )
    };

    //Refresh list of cases
    handleOnRefresh = () => {
        this.setState({
            refreshing: true
        }, () => {
            // this.props.addFilterForScreen("CasesScreen", this.state.filter);
            // let existingFilter = this.state.filterFromFilterScreen ? Object.assign({}, this.state.filterFromFilterScreen) : Object.assign({}, config.defaultFilterForCases);
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
            // this.props.getCasesForOutbreakId(this.props.user.activeOutbreakId, existingFilter, this.props.user.token);

            // Filter cases
            this.filterCases();
        });
    };

    //Open single case CaseSingleScreen
    handleOnPressCase = (item, contact) => {
        console.log("### handlePressCases: ", JSON.stringify(item));
        this.props.navigator.push({
            screen: 'CaseSingleScreen',
            animated: true,
            animationType: 'fade',
            passProps: {
                case: item,
            }
        })
    };

    //Create new contact in ContactSingleScreen
    handleOnPressAddContact = (item, contact) => {
        console.log('*** handleOnPressAddContact: ', item, contact)
        this.props.navigator.push({
            screen: 'ContactsSingleScreen',
            animated: true,
            animationType: 'fade',
            passProps: {
                isNew: true,
                addContactFromCasesScreen: true,
                caseIdFromCasesScreen: item._id
            }
        })
    };

    handleOnPressMap = (myCase, contact) => {
        console.log('handleOnPressMap', myCase. contact)
        if (myCase && myCase.addresses && Array.isArray(myCase.addresses) && myCase.addresses.length > 0) {
            let casePlaceOfResidence = myCase.addresses.filter((e) => {
                return e.typeId === config.userResidenceAddress.userPlaceOfResidence
            })
            console.log('casePlaceOfResidence', casePlaceOfResidence)
            let casePlaceOfResidenceLatitude = casePlaceOfResidence[0] && casePlaceOfResidence[0].geoLocation && casePlaceOfResidence[0].geoLocation.coordinates && Array.isArray(casePlaceOfResidence[0].geoLocation.coordinates) && casePlaceOfResidence[0].geoLocation.coordinates.length === 2 && casePlaceOfResidence[0].geoLocation.coordinates[1] !== undefined && casePlaceOfResidence[0].geoLocation.coordinates[1] !== null ? casePlaceOfResidence[0].geoLocation.coordinates[1] : 0
            let casePlaceOfResidenceLongitude = casePlaceOfResidence[0] && casePlaceOfResidence[0].geoLocation && casePlaceOfResidence[0].geoLocation.coordinates && Array.isArray(casePlaceOfResidence[0].geoLocation.coordinates) && casePlaceOfResidence[0].geoLocation.coordinates.length === 2 && casePlaceOfResidence[0].geoLocation.coordinates[0] !== undefined && casePlaceOfResidence[0].geoLocation.coordinates[0] !== null ? casePlaceOfResidence[0].geoLocation.coordinates[0] : 0
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.setState({
                        latitude: casePlaceOfResidenceLatitude,
                        longitude: casePlaceOfResidenceLongitude,
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
    }

    //Create new case in CaseSingleScreen
    handleOnPressAddCase = () => {
        this.props.navigator.push({
            screen: 'CaseSingleScreen',
            animated: true,
            animationType: 'fade',
            passProps: {
                isNew: true,
            }
        })
    };
    
    //Navigator event
    onNavigatorEvent = (event) => {
        navigation(event, this.props.navigator);
    };

    filterCases = () => {
        let allFilters = {}

        //age
        if (this.state.filterFromFilterScreen && this.state.filterFromFilterScreen.age) {
            allFilters.age = this.state.filterFromFilterScreen.age
        } else {
            allFilters.age = null
        }

        //gender
        if (this.state.filterFromFilterScreen && this.state.filterFromFilterScreen.gender && this.state.filterFromFilterScreen.gender !== null) {
            allFilters.gender = this.state.filterFromFilterScreen.gender

        } else {
            allFilters.gender = null
        }

        //classification
        if (this.state.filterFromFilterScreen && this.state.filterFromFilterScreen.classification) {
            allFilters.classification = this.state.filterFromFilterScreen.classification;
        } else {
            allFilters.classification = null
        }

        //search text
        if (this.state.filter && this.state.filter.searchText && this.state.filter.searchText.trim().length > 0) {
            let splitedFilter= this.state.filter.searchText.split(" ")
            splitedFilter = splitedFilter.filter((e) => {return e !== ""})
            allFilters.searchText = new RegExp(splitedFilter.join("|"), "ig");
        } else {
            allFilters.searchText = null
        }

        //selected locations
        if (this.state.filterFromFilterScreen && this.state.filterFromFilterScreen.selectedLocations && this.state.filterFromFilterScreen.selectedLocations.length > 0) {
            allFilters.selectedLocations = this.state.filterFromFilterScreen.selectedLocations;
        } else {
            allFilters.selectedLocations = null
        }

        //sort rules
        if (this.state.filterFromFilterScreen && this.state.filterFromFilterScreen.sort && this.state.filterFromFilterScreen.sort.length > 0) {
            allFilters.sort = this.state.filterFromFilterScreen.sort;
        } else {
            allFilters.sort = null
        }

        if (!allFilters.age && !allFilters.gender && !allFilters.searchText && !allFilters.classification && !allFilters.selectedLocations && !allFilters.sort) {
            allFilters = null
        }

        this.setState({
            loading: true
        }, () => {
            this.props.getCasesForOutbreakId(this.props.user.activeOutbreakId, allFilters, null);
        })
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
            let parsedData =  JSON.parse(QRCodeInfo.data)
            if (parsedData && parsedData !== undefined){
                console.log('parsedData', parsedData)

                if (parsedData.targetResource && parsedData.targetResource !== undefined) {
                    if (parsedData.targetResource === 'case') {
                        itemType = 'case'
                    } else if (parsedData.targetResource === 'contact') {
                        itemType = 'contact'
                    }
                }

                if (parsedData.resourceContext && parsedData.resourceContext !== undefined && 
                    parsedData.resourceContext.outbreakId && parsedData.resourceContext.outbreakId !== undefined && 
                    parsedData.resourceContext.caseId && parsedData.resourceContext.caseId !== undefined) {
                        itemId = parsedData.resourceContext.caseId
                        outbreakId = parsedData.resourceContext.outbreakId
                }
            }
        }

        console.log('pushNewEditScreen', itemId, itemType, outbreakId)
        if (itemId && itemType && outbreakId) {
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
                        Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.noItemAlert, this.props.translation), [
                            {
                                text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation), 
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
                                screen: 'ContactSingleScreen',
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
            Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.noItemAlert, this.props.translation), [
                {
                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation), 
                    onPress: () => {console.log('Ok pressed')}
                }
            ])
        }
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
        backgroundColor: 'rgba(217, 217, 217, 0.5)'
    },
    separatorComponentStyle: {
        height: 8
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
        role: state.role,
        cases: state.cases,
        filter: state.app.filters,
        screenSize: state.app.screenSize,
        syncState: state.app.syncState,
        errors: state.errors,
        translation: state.app.translation
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        getCasesForOutbreakId,
        addFilterForScreen,
        removeErrors,
        removeFilterForScreen
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(CasesScreen);