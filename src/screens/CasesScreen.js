/**
 * Created by mobileclarisoft on 13/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {View, Alert, StyleSheet, Dimensions, Animated, BackHandler} from 'react-native';
import {Icon} from 'react-native-material-ui';
import styles from './../styles';
import NavBarCustom from './../components/NavBarCustom';
import {calculateDimension, navigation, getTranslation, createFilterCasesObject} from './../utils/functions';
import config from './../utils/config';
import Ripple from 'react-native-material-ripple';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import SearchFilterView from './../components/SearchFilterView';
import ElevatedView from 'react-native-elevated-view';
import Breadcrumb from './../components/Breadcrumb';
import {getCasesForOutbreakId} from './../actions/cases';
import {removeErrors} from './../actions/errors';
import {addFilterForScreen, removeFilterForScreen} from './../actions/app';
import AnimatedListView from './../components/AnimatedListView';
import ViewHOC from './../components/ViewHOC';
import { Popup } from 'react-native-map-link';
import translations from './../utils/translations'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {pushNewEditScreen} from './../utils/screenTransitionFunctions';
import RNExitApp from 'react-native-exit-app';
import PersonListItem from "../components/PersonListItem";

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
            loading: false,

            sortData: false,
            isVisible: false,
            latitude: 0,
            longitude: 0,
            sourceLatitude: 0,
            sourceLongitude: 0,
            error: null,

            riskColors: {}
        };

        // Bind here methods, or at least don't declare methods in the render method
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }

    // Please add here the react lifecycle methods that you need
    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        let riskColors = {};
        let refData = this.props.referenceData.filter((e) => {return e.categoryId.includes("RISK_LEVEL")});
        for (let i=0; i<refData.length; i++) {
            riskColors[refData[i].value] = refData[i].colorCode || 'black'
        }
        this.filterCases();
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

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
        ]);
        return true;
    }

    componentDidUpdate(prevProps) {
        if (!this.props.loaderState && this.state.refreshing) {
            this.setState({
                refreshing: false
            })
        }
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
        if (this.props.errors && this.props.errors.type && this.props.errors.message) {
            Alert.alert(this.props.errors.type, this.props.errors.message, [
                {
                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                    onPress: () => {
                        this.props.removeErrors();
                    }
                }
            ])
        }
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
            if (this.state.filterFromFilterScreen.classification && this.state.filterFromFilterScreen.classification.length > 0) {
                ++filterNumbers
            }
        }
        let filterText = filterNumbers === 0 ? `${getTranslation(translations.generalLabels.filterTitle, this.props.translation)}` : `${getTranslation(translations.generalLabels.filterTitle, this.props.translation)}(${filterNumbers})`;

        let caseTitle = []; caseTitle[0] = getTranslation(translations.casesScreen.casesTitle, this.props.translation);
        return (
            <ViewHOC style={style.container}
                     showLoader={(this.props && this.props.loaderState) || (this.state && this.state.loading)}
                     loaderText={this.props && this.props.syncState ? 'Loading' : getTranslation(translations.loadingScreenMessages.loadingMsg, this.props.translation)}>
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
                            <View style={{flex: 0.15, marginRight: 10}}>
                                <Ripple style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }} onPress={this.handleOnPressQRCode}>
                                    <MaterialCommunityIcons name="qrcode-scan" color={'black'} size={20}/>
                                </Ripple>
                            </View>

                            <View style={{flex: 0.15, marginRight: 10}}>
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
                                        <Icon name="help" color={'white'} size={15}/>
                                    </Ripple>
                                </ElevatedView> 
                            </View>
                            {
                                this.props.role !== null && this.props.role.find((e) => e === config.userPermissions.writeCase) !== undefined ? (
                                    <View style={{flex: 0.15}}>
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
                                            }} onPress={this.handleOnPressAddCase}>
                                                <Icon name="add" color={'white'} size={15}/>
                                            </Ripple>
                                        </ElevatedView>
                                    </View>
                                ) : null
                            }
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
                                filterText={filterText}
                            />
                        }
                        ItemSeparatorComponent={this.renderSeparatorComponent}
                        style={[style.listViewStyle]}
                        componentContainerStyle={style.componentContainerStyle}
                        onScroll={this.handleScroll}
                        refreshing={this.state.refreshing && this.props.loaderState}
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
                                    appsWhiteList: ['google-maps', 'apple-maps', 'waze', 'citymapper', 'uber', 'lyft', 'transit', 'yandex', 'moovit']
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
        // Filter cases by firstName and lastName
        this.filterCases();
    };

    //Save keyword for search in cases
    handleOnChangeText = (text) => {
        // console.log("### handleOnChangeText: ", text);
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, {searchText: text})
        }),
            // console.log('### filter after changed text: ', this.state.filter)
        )
    };

    //Open filter screen for cases
    handlePressFilter = () => {
        this.props.navigator.showModal({
            screen: 'FilterScreen',
            animated: true,
            passProps: {
                activeFilters: this.state.filterFromFilterScreen || null,
                onApplyFilters: this.handleOnApplyFilters,
                screen: 'CasesFilterScreen'
            }
        })
    };

    // Filter cases by selected criteria
    handleOnApplyFilters = (filter) => {
        this.setState({
            filterFromFilterScreen: filter
        }, () => {
            // Filter cases
            this.filterCases();
        })
    };

    //Render a case tile
    renderCase = ({item}) => {
        // console.log('Render Case: ', item.firstName);
        let margins = calculateDimension(16, false, this.props.screenSize);
        return (
            <PersonListItem
                type={'Case'}
                titleColor={item && item.riskLevel ? this.state.riskColors[item.riskLevel] : 'black'}
                itemToRender={item}
                onPressMapIconProp={this.handleOnPressMap}
                onPressNameProp={this.handleOnPressNameProp}
                textsArray={[
                    getTranslation(translations.casesScreen.viewButtonLabel, this.props.translation),
                    getTranslation(translations.casesScreen.addContactButtonLabel, this.props.translation)
                ]}
                textsStyleArray={[[styles.buttonTextActionsBar, {marginLeft: margins}], [styles.buttonTextActionsBar, {marginRight: margins}]]}
                onPressTextsArray={[
                    () => {
                        // console.log('Test performance renderFollowUpQuestion');
                        this.handleOnPressCase(item);
                    },
                    () => {
                        // console.log('Test performance renderFollowUpQuestion');
                        this.handleOnPressAddContact(item, null);
                    }]}
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
            // Filter cases
            this.filterCases();
        });
    };

    //Open single case CaseSingleScreen
    handleOnPressCase = (item, contact) => {
        // console.log("### handlePressCases: ", JSON.stringify(item));
        this.props.navigator.push({
            screen: 'CaseSingleScreen',
            // animated: true,
            // animationType: 'fade',
            passProps: {
                case: item,
            }
        })
    };

    //Create new contact in ContactSingleScreen
    handleOnPressAddContact = (item, contact) => {
        // console.log('*** handleOnPressAddContact: ', item, contact)
        this.props.navigator.push({
            screen: 'ContactsSingleScreen',
            // animated: true,
            // animationType: 'fade',
            passProps: {
                isNew: true,
                addContactFromCasesScreen: true,
                caseIdFromCasesScreen: item._id,
                caseAddress: this.extractCurrentAddress(item)
            }
        })
    };

    extractCurrentAddress = (item) => {
        let itemToReturn = null;
        if (item && item.addresses && Array.isArray(item.addresses) && item.addresses.length > 0) {
            itemToReturn = item.addresses.find((e) => {return e.typeId === config.userResidenceAddress.userPlaceOfResidence})
        }
        return itemToReturn;
    };

    handleOnPressMap = (myCase) => {
        if (myCase && myCase.addresses && Array.isArray(myCase.addresses) && myCase.addresses.length > 0) {
            let casePlaceOfResidence = myCase.addresses.filter((e) => {
                return e.typeId === config.userResidenceAddress.userPlaceOfResidence
            });
            // console.log('casePlaceOfResidence', casePlaceOfResidence)
            let casePlaceOfResidenceLatitude = casePlaceOfResidence[0] && casePlaceOfResidence[0].geoLocation && casePlaceOfResidence[0].geoLocation.coordinates && Array.isArray(casePlaceOfResidence[0].geoLocation.coordinates) && casePlaceOfResidence[0].geoLocation.coordinates.length === 2 && casePlaceOfResidence[0].geoLocation.coordinates[1] !== undefined && casePlaceOfResidence[0].geoLocation.coordinates[1] !== null ? casePlaceOfResidence[0].geoLocation.coordinates[1] : 0;
            let casePlaceOfResidenceLongitude = casePlaceOfResidence[0] && casePlaceOfResidence[0].geoLocation && casePlaceOfResidence[0].geoLocation.coordinates && Array.isArray(casePlaceOfResidence[0].geoLocation.coordinates) && casePlaceOfResidence[0].geoLocation.coordinates.length === 2 && casePlaceOfResidence[0].geoLocation.coordinates[0] !== undefined && casePlaceOfResidence[0].geoLocation.coordinates[0] !== null ? casePlaceOfResidence[0].geoLocation.coordinates[0] : 0;
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
            screen: 'CaseSingleScreen',
            animated: true,
            passProps: {
                case: this.props.cases.find((e) => {return e._id === personId})
            }
        })
    };

    //Create new case in CaseSingleScreen
    handleOnPressAddCase = () => {
        this.props.navigator.push({
            screen: 'CaseSingleScreen',
            // animated: true,
            // animationType: 'fade',
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
        let allFilters = null;
        allFilters = createFilterCasesObject(this.state.filterFromFilterScreen, this.state.filter);
        this.props.getCasesForOutbreakId(this.props.user.activeOutbreakId, allFilters, null);
    };

    goToHelpScreen = () => {
        let pageAskingHelpFrom = 'cases';
        this.props.navigator.showModal({
            screen: 'HelpScreen',
            animated: true,
            passProps: {
                pageAskingHelpFrom: pageAskingHelpFrom
            }
        });
    };

    handleOnPressQRCode = () => {
        // console.log('handleOnPressQRCode');

        this.props.navigator.showModal({
            screen: 'QRScanScreen',
            animated: true,
            passProps: {
                pushNewScreen: this.pushNewEditScreenLocal
            }
        })
    };

    pushNewEditScreenLocal = (QRCodeInfo) => {
        // console.log('pushNewEditScreen QRCodeInfo do with method from another side', QRCodeInfo);

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
                                        // console.log('Yes pressed');
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
    breadcrumbContainer: {
        flex: 0.8,
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },
});

function mapStateToProps(state) {
    return {
        user:           state.user,
        filter:         state.app.filters,
        screenSize:     state.app.screenSize,
        syncState:      state.app.syncState,
        translation:    state.app.translation,
        loaderState:    state.app.loaderState,
        role:           state.role,
        cases:          state.cases,
        errors:         state.errors,
        referenceData:  state.referenceData
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