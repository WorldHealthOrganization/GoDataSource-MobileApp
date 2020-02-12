import React, {Component} from 'react'
import {Alert, BackHandler} from 'react-native';
import get from 'lodash/get';
import {createDate} from './../../utils/functions';
import {getTranslation, navigation, extractMainAddress} from "../../utils/functions";
import RNExitApp from "react-native-exit-app";
import translations from "../../utils/translations";
import constants from './../../utils/constants';
import {screenTransition} from './../../utils/screenTransitionFunctions';

// Here have access to redux props
export function enhanceListWithGetData(methodForGettingData, screenType) {
    return function withDataHandling(WrappedComponent) {
        class WithListData extends Component {
            static navigatorStyle = {
                navBarHidden: true
            };

            constructor(props) {
                super(props);
                let now = createDate();
                this.state={
                    searchText: '',
                    mainFilter: {},
                    followUpFilter: {
                        date: now,
                        statusId: null
                    },
                    data: [],
                    dataCount: 0,
                    lastElement: null,
                    limit: 15,
                    isAddFromNavigation: false
                };
                this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
            }

            componentDidMount() {
                BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
                if (this.props.isAddFromNavigation && this.props.addScreen) {
                    this.setState({
                        isAddFromNavigation: true
                    }, () => {
                        this.getData(true);
                    })
                } else {
                    this.getData(true);
                }
            }

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
                ]);
                return true;
            };

            render() {
                let props = Object.assign({},
                    this.props,
                    {
                        data: this.state.data,
                        dataCount: this.state.dataCount,
                        mainFilter: this.state.mainFilter,
                        followUpFilter: this.state.followUpFilter
                    });
                return (
                    <WrappedComponent
                        setSearchText={this.setSearchText}
                        setFollowUpFilter={this.setFollowUpFilter}
                        setMainFilter={this.setMainFilter}
                        onRefresh={this.refresh}
                        onPressFilter={this.onPressFilter}
                        onPressView={this.onPressView}
                        onPressAddExposure={this.onPressAddExposure}
                        onPressCenterButton={this.onPressCenterButton}
                        onPressFullName={this.onPressFullName}
                        onPressExposure={this.onPressExposure}
                        onEndReached={this.getData}
                        {...props} />
                );
            }

            prepareFilters = () => {
                let filter = {};
                switch (screenType) {
                    case 'FollowUpsScreen':
                        let statusId = get(this.state, 'followUpFilter.statusId.value');
                        filter = {
                            outbreakId: get(this.props, 'user.activeOutbreakId', null),
                            followUpFilter: Object.assign({}, get(this.state, 'followUpFilter', null), {statusId}),
                            userTeams: get(this.props, 'teams', null),
                            contactsFilter: get(this.state, 'mainFilter', null),
                            exposureFilter: get(this.state, 'searchText', null),
                            lastElement: get(this.state, 'lastElement', null),
                            offset: get(this.state, 'offset', 0)
                        };
                        break;
                    case 'ContactsScreen':
                        filter = {
                            outbreakId: get(this.props, 'user.activeOutbreakId', null),
                            contactsFilter: get(this.state, 'mainFilter', null),
                            exposureFilter: get(this.state, 'searchText', null),
                            lastElement: get(this.state, 'lastElement', null),
                            offset: get(this.state, 'data.length', 0)
                        };
                        break;
                    case 'CasesScreen':
                        filter = {
                            outbreakId: get(this.props, 'user.activeOutbreakId', null),
                            casesFilter: get(this.state, 'mainFilter', null),
                            searchText: get(this.state, 'searchText', null),
                            lastElement: get(this.state, 'lastElement', null),
                            offset: get(this.state, 'data.length', 0)
                        };
                        break;
                    case 'UsersScreen':
                        filter = {
                            outbreakId: get(this.props, 'user.activeOutbreakId', null),
                            casesFilter: get(this.state, 'mainFilter', null),
                            searchText: get(this.state, 'searchText', null),
                            lastElement: get(this.state, 'lastElement', null),
                            offset: get(this.state, 'data.length', 0)
                        };
                        break;
                    default:
                        break;
                }
                return filter;
            };

            getData = (isRefresh) => {
                if (this.state.isAddFromNavigation) {
                    this.setState({
                        isAddFromNavigation: false
                    }, () => {
                        setTimeout(() => {
                            this.props.navigator.push({
                                screen: this.props.addScreen,
                                animated: true,
                                animationType: 'fade',
                                passProps: {
                                    isNew: true,
                                    refresh: this.refresh
                                }
                            })
                        }, 100)
                    })
                } else {
                    // If it's refresh or first getData get regular data
                    // else it means that is onEndReached so check if data modulo 10 is zero and continue
                    let doAction = false;
                    if (isRefresh === true) {
                        this.props.setLoaderState(true);
                        doAction = true;
                    } else {
                        doAction = this.state.data.length % 10 === 0 && this.state.data.length !== this.state.dataCount;
                    }
                    if (doAction === true) {
                        let filters = this.prepareFilters();
                        methodForGettingData(filters, isRefresh === true ? isRefresh : false, this.props)
                            .then((result) => {
                                if (isRefresh === true) {
                                    this.props.setLoaderState(false);
                                }
                                this.setState((prevState) => {
                                    console.log(prevState.dataCount);
                                    console.log('Stuff: ', get(result, 'dataCount', prevState.dataCount));
                                    return {
                                        data: prevState.lastElement !== null ? prevState.data.concat(result.data) : result.data,
                                            lastElement: result.data.length === 10 ? screenType === 'FollowUpsScreen' ? Object.assign({}, get(result, 'data[9].mainData', null), {followUpId: get(result, 'data[9].followUpData._id', null)}) : get(result, 'data[9].mainData', null) : null,
                                        isAddFromNavigation: false,
                                        dataCount: get(result, 'dataCount', prevState.dataCount),
                                        offset: result.data.length
                                    }
                                })
                            })
                            .catch((errorGetData) => {
                                this.setState({
                                    isAddFromNavigation: false
                                }, () => {
                                    this.props.setLoaderState(false);
                                    Alert.alert('Error', 'An error occurred while getting data', [
                                        {
                                            text: 'Ok', onPress: () => {
                                                console.log('Ok pressed')
                                            }
                                        }
                                    ])
                                });
                            })
                    }
                }
            };

            refresh = () => {
                this.setState({
                    lastElement: null,
                    offset: 0
                }, () => {
                    this.getData(true)
                })
            };

            setSearchText = (text) => {
                this.setState(prevState => ({
                    searchText: text,
                    offset: 0
                }), () => this.refresh())
            };

            // Here will be mostly status and date
            setFollowUpFilter = (key, value) => {
                this.setState(prevState => ({
                    followUpFilter: Object.assign({}, prevState.followUpFilter, {[key]: value}),
                    offset: 0
                }), () => this.refresh())
            };

            setMainFilter = (filter) => {
                this.setState(prevState => ({
                    mainFilter: filter,
                    offset: 0
                }), () => this.refresh())
            };

            // Navigator methods
            onPressFilter = () => {
                this.props.navigator.showModal({
                    screen: constants.appScreens.filterScreen,
                    animated: true,
                    passProps: {
                        activeFilters: this.state.mainFilter,
                        onApplyFilters: this.setMainFilter,
                        screen: screenType
                    }
                })
            };

            // onPressView handles what happens when the user clicks on the lower left button of the list
            onPressView = (dataToForward, contactData) => {
                let forwardScreen = this.computeForwardScreen('onPressView');
                let forwardProps = {
                    isNew: false,
                    refresh: this.refresh
                };
                switch (screenType) {
                    case 'FollowUpsScreen':
                        forwardProps.item = dataToForward;
                        forwardProps.contact = contactData;
                        forwardProps.isEditMode = false;
                        forwardProps.previousScreen = 'FollowUps';
                        break;
                    case 'ContactsScreen':
                        forwardProps.contact = dataToForward;
                        break;
                    case 'CasesScreen':
                        forwardProps.case = dataToForward;
                        break;
                    default:
                        break;
                }
                if (forwardScreen) {
                    this.props.navigator.push({
                        screen: forwardScreen,
                        animated: true,
                        animationTyp: 'fade',
                        passProps: forwardProps
                    });
                }
            };

            onPressAddExposure = (dataToForward) => {
                let forwardScreen = this.computeForwardScreen('onPressAddExposure');
                if (screenType === 'CasesScreen') {
                    this.props.navigator.push({
                        screen: forwardScreen,
                        animated: true,
                        passProps: {
                            isNew: true,
                            addContactFromCasesScreen: true,
                            caseIdFromCasesScreen: dataToForward._id,
                            caseAddress: extractMainAddress(get(dataToForward, 'addresses', [])),
                            singleCase: dataToForward,
                            refresh: this.refresh
                        }
                    })
                } else {
                    let dataToForwardType = 'contact';
                    if (forwardScreen && dataToForwardType && dataToForward) {
                        this.props.navigator.showModal({
                            screen: forwardScreen,
                            animated: true,
                            passProps: {
                                [dataToForwardType]: dataToForward,
                                type: 'Contact',
                                refresh: this.refresh
                            }
                        })
                    }
                }
            };

            onPressCenterButton = (caseData) => {
                let forwardScreen = this.computeForwardScreen('onPressCenterButton');
                if (screenType === 'CasesScreen') {
                    this.props.navigator.push({
                        screen: forwardScreen,
                        animated: true,
                        passProps: {
                            isNew: false,
                            refresh: this.refresh,
                            case: caseData,
                            index: 3
                        }
                    })
                }
                if (screenType === 'ContactsScreen') {
                    this.props.navigator.push({
                        screen: forwardScreen,
                        animated: true,
                        passProps: {
                            isNew: false,
                            isEditMode: true,
                            contact: caseData,
                            refresh: this.refresh
                        }
                    })
                }
            };

            onPressFullName = (person, prevScreen) => {
                let requiredPermissions = this.computePermissions('onPressFullName');
                let forwardScreen = this.computeForwardScreen('onPressFullName');
                let forwardedProps = {};
                let dataToSend = screenType === 'CasesScreen' ? 'case' : 'contact';
                forwardedProps[dataToSend] = person;
                forwardedProps['previousScreen'] = prevScreen;
                forwardedProps['refresh'] = this.refresh;
                forwardedProps['isEditMode'] = false;

                if (forwardScreen) {
                    screenTransition(this.props.navigator, 'push', forwardScreen, forwardedProps, this.props.role, requiredPermissions);
                    // this.props.navigator.push({
                    //     screen: forwardScreen,
                    //     animated: true,
                    //     passProps: forwardedProps
                    // })
                }
            };

            onPressExposure = (exposure) => {
                let requiredPermissions = this.computePermissions('onPressExposure');
                let forwardScreen = this.computeForwardScreen('onPressExposure');
                let previousScreen = screenType === constants.appScreens.followUpScreen ? translations.followUpsScreen.followUpsTitle : translations.contactsScreen.contactsTitle;

                if (forwardScreen) {
                    let forwardProps = {
                        case: {_id: get(exposure, 'id', null)},
                        refresh: this.refresh,
                        previousScreen: previousScreen
                    };

                    screenTransition(this.props.navigator, 'push', forwardScreen, forwardProps, this.props.role, requiredPermissions);

                    // this.props.navigator.push({
                    //     screen: forwardScreen,
                    //     animated: true,
                    //     passProps: {
                    //         case: {_id: get(exposure, 'id', null)},
                    //         refresh: this.refresh,
                    //         previousScreen: previousScreen
                    //     }
                    // })
                }
            };

            computeForwardScreen = (method) => {
                let forwardScreen = null;
                switch(screenType) {
                    case constants.appScreens.followUpScreen:
                        switch (method) {
                            case 'onPressView':
                                forwardScreen = constants.appScreens.followUpSingleScreen;
                                // forwardScreen = constants.appScreens.viewEditScreen;
                                break;
                            case 'onPressAddExposure':
                                forwardScreen = constants.appScreens.exposureScreen;
                                break;
                            case 'onPressFullName':
                                forwardScreen = constants.appScreens.contactSingleScreen;
                                // forwardScreen = constants.appScreens.viewEditScreen;
                                break;
                            case 'onPressExposure':
                                forwardScreen = constants.appScreens.caseSingleScreen;
                                // forwardScreen = constants.appScreens.viewEditScreen;
                                break;
                            default:
                                forwardScreen = null;
                        }
                        break;
                    case constants.appScreens.contactsScreen:
                        switch (method) {
                            case 'onPressView':
                                forwardScreen = constants.appScreens.contactSingleScreen;
                                break;
                            case 'onPressAddExposure':
                                forwardScreen = constants.appScreens.exposureScreen;
                                break;
                            case 'onPressFullName':
                                forwardScreen = constants.appScreens.contactSingleScreen;
                                break;
                            case 'onPressExposure':
                                forwardScreen = constants.appScreens.caseSingleScreen;
                                break;
                            case 'onPressCenterButton':
                                forwardScreen = constants.appScreens.contactSingleScreen;
                                break;
                            default:
                                forwardScreen = null;
                        }
                        break;
                    case constants.appScreens.casesScreen:
                        switch (method) {
                            case 'onPressView':
                                forwardScreen = constants.appScreens.caseSingleScreen;
                                break;
                            case 'onPressAddExposure':
                                forwardScreen = constants.appScreens.contactSingleScreen;
                                break;
                            case 'onPressFullName':
                                forwardScreen = constants.appScreens.caseSingleScreen;
                                break;
                            case 'onPressExposure':
                                forwardScreen = constants.appScreens.contactSingleScreen;
                                break;
                            case 'onPressCenterButton':
                                forwardScreen = constants.appScreens.caseSingleScreen;
                                break;
                            default:
                                forwardScreen = null;
                        }
                        break;
                    default:
                        break;
                }

                return forwardScreen;
            };

            computePermissions = (method) => {
                let permissions = [];
                switch(screenType) {
                    case constants.appScreens.followUpScreen:
                        switch (method) {
                            case 'onPressFullName':
                                permissions = [
                                    constants.PERMISSIONS_CONTACT.contactAll,
                                    constants.PERMISSIONS_CONTACT.contactView,
                                ];
                                break;
                            case 'onPressExposure':
                                permissions = [
                                    constants.PERMISSIONS_CASE.caseAll,
                                    constants.PERMISSIONS_CASE.caseView,
                                ];
                                break;
                            default:
                                permissions = [];
                        }
                        break;
                    case constants.appScreens.contactsScreen:
                        switch (method) {
                            case 'onPressFullName':
                                permissions = [
                                    constants.PERMISSIONS_CONTACT.contactAll,
                                    constants.PERMISSIONS_CONTACT.contactView,
                                ];
                                break;
                            case 'onPressExposure':
                                permissions = [
                                    constants.PERMISSIONS_CASE.caseAll,
                                    constants.PERMISSIONS_CASE.caseView,
                                ];
                                break;
                            default:
                                permissions = [];
                        }
                        break;
                    case constants.appScreens.casesScreen:
                        switch (method) {
                            case 'onPressFullName':
                                permissions = [
                                    constants.PERMISSIONS_CASE.caseAll,
                                    constants.PERMISSIONS_CASE.caseView,
                                ];
                                break;
                            default:
                                permissions = [];
                        }
                        break;
                    default:
                        break;
                }
                return permissions;
            };

            onNavigatorEvent = (event) => {
                navigation(event, this.props.navigator);
            };
        }

        WithListData.propTypes = {};

        return WithListData;
    }
}