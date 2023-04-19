import React, {Component} from 'react'
import {Alert, BackHandler} from 'react-native';
import get from 'lodash/get';
import debounce from 'lodash/debounce';
import union from 'lodash/union';
import {createDate, createStackFromComponent} from './../../utils/functions';
import {extractIdFromPouchId, extractMainAddress, getTranslation, navigation} from "../../utils/functions";
import RNExitApp from "react-native-exit-app";
import translations from "../../utils/translations";
import constants, {PERMISSIONS_CONTACT_OF_CONTACT} from './../../utils/constants';
import {screenTransition} from './../../utils/screenTransitionFunctions';
import {Navigation} from "react-native-navigation";
import {fadeInAnimation, fadeOutAnimation} from "../../utils/animations";



// Here have access to redux props
export function enhanceListWithGetData(methodForGettingData, screenType) {
    return function withDataHandling(WrappedComponent) {
        class WithListData extends Component {

            constructor(props) {
                super(props);
                let now = createDate();
                this.state = {
                    searchText: '',
                    mainFilter: props.outbreak?.isContactLabResultsActive ? {} : {type:[translations.personTypes.cases]},
                    followUpFilter: {
                        date: now,
                        statusId: null
                    },
                    data: [],
                    exposureData: [],
                    dataCount: 0,
                    lastElement: null,
                    limit: 15,
                    isAddFromNavigation: false,
                    loadMore: false
                };
                // this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
            }

            componentDidMount() {
                BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
                if (get(this.props, 'outbreak._id', null) !== null) {
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
            }

            componentDidUpdate(prevProps) {
                if (get(prevProps, 'outbreak._id', null) !== get(this.props, 'outbreak._id', null)) {
                    this.setMainFilter(null);
                }
            }

            componentWillUnmount() {
                BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
            };

            handleBackButtonClick() {
                Alert.alert(getTranslation(translations.alertMessages.alertLabel, get(this.props, 'translation', [])), getTranslation(translations.alertMessages.androidBackButtonMsg, get(this.props, 'translation', [])), [
                    {
                        text: getTranslation(translations.alertMessages.yesButtonLabel, get(this.props, 'translation', [])), onPress: () => {
                            RNExitApp.exitApp();
                            return true;
                        }
                    },
                    {
                        text: getTranslation(translations.alertMessages.cancelButtonLabel, get(this.props, 'translation', [])), onPress: () => {
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
                        exposureData: this.state.data,
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
                        onEndReached={this.getDataDebounce}
                        loadMore={this.state.loadMore}
                        {...props}
                    />
                );
            }

            prepareFilters = (isRefresh) => {
                let filter = {};
                switch (screenType) {
                    case 'FollowUpsScreen':
                        let statusId = get(this.state, 'followUpFilter.statusId.value');
                        filter = {
                            outbreakId: get(this.props, 'outbreak._id', null),
                            followUpFilter: Object.assign({}, get(this.state, 'followUpFilter', null), {statusId}),
                            userTeams: get(this.props, 'teams', null),
                            contactsFilter: get(this.state, 'mainFilter', null),
                            exposureFilter: get(this.state, 'searchText', null),
                            lastElement: get(this.state, 'lastElement', null),
                            offset: get(this.state, 'data.length', 0)
                        };
                        break;
                    case 'ContactsScreen':
                        filter = {
                            outbreakId: get(this.props, 'outbreak._id', null),
                            contactsFilter: get(this.state, 'mainFilter', null),
                            exposureFilter: get(this.state, 'searchText', null),
                            lastElement: get(this.state, 'lastElement', null),
                            offset: get(this.state, 'data.length', 0)
                        };
                        break;
                    case 'ContactsOfContactsScreen':
                        filter = {
                            outbreakId: get(this.props, 'outbreak._id', null),
                            contactsFilter: get(this.state, 'mainFilter', null),
                            exposureFilter: get(this.state, 'searchText', null),
                            lastElement: get(this.state, 'lastElement', null),
                            offset: get(this.state, 'data.length', 0)
                        };
                        break;
                    case 'CasesScreen':
                        filter = {
                            outbreakId: get(this.props, 'outbreak._id', null),
                            casesFilter: get(this.state, 'mainFilter', null),
                            searchText: get(this.state, 'searchText', null),
                            lastElement: get(this.state, 'lastElement', null),
                            offset: get(this.state, 'data.length', 0)
                        };
                        break;
                    case 'EventsScreen':
                        filter = {
                            outbreakId: get(this.props, 'outbreak._id', null),
                            eventsFilter: get(this.state, 'mainFilter', null),
                            searchText: get(this.state, 'searchText', null),
                            lastElement: get(this.state, 'lastElement', null),
                            offset: get(this.state, 'data.length', 0)
                        };
                        break;
                    case 'UsersScreen':
                        filter = {
                            outbreakId: get(this.props, 'outbreak._id', null),
                            casesFilter: get(this.state, 'mainFilter', null),
                            searchText: get(this.state, 'searchText', null),
                            lastElement: get(this.state, 'lastElement', null),
                            offset: get(this.state, 'data.length', 0)
                        };
                        break;
                    case 'LabResultsScreen':
                        filter = {
                            outbreakId: get(this.props, 'outbreak._id', null),
                            labResultsFilter: get(this.state, 'mainFilter', null),
                            searchText: get(this.state, 'searchText', null),
                            lastElement: get(this.state, 'lastElement', null),
                            offset: get(this.state, 'data.length', 0)
                        };
                        break;
                    default:
                        break;
                }
                if (isRefresh){
                    filter.offset = 0
                }
                return filter;
            };

            getData = (isRefresh, isRefreshAfterSync) => {
                if (this.state.isAddFromNavigation) {
                    this.setState({
                        isAddFromNavigation: false
                    }, () => {
                        // Why the timeout?
                        setTimeout(() => {
                            Navigation.push(this.props.componentId,{
                                component: {
                                    // this addScreen prop doesn't seem to be anywhere else
                                    name: this.props.addScreen,
                                    passProps: {
                                        isNew: true,
                                        refresh: this.refresh
                                    },
                                    // fade-in animation
                                    options: {
                                        animations: {
                                            push: fadeInAnimation,
                                            pop: fadeOutAnimation
                                        }
                                    }
                                }
                            })
                        }, 100)
                    })
                } else {
                    // If it's refresh or first getData get regular data
                    // else it means that is onEndReached so check if data modulo 10 is zero and continue
                    let doAction = false;
                    if (isRefresh === true) {
                        if (!isRefreshAfterSync) {
                            this.props.setLoaderState(true);
                        }
                        doAction = true;
                    } else {
                        doAction = this.state.data.length % 10 === 0 && this.state.data.length !== this.state.dataCount;
                    }
                    if (doAction === true
                        && !this.getDataInprogress
                    ) {
                        this.getDataInprogress = true;
                        let filters = this.prepareFilters(isRefresh);
                        this.setState({
                            loadMore: isRefresh === null
                        }, () => {
                            methodForGettingData(filters, isRefresh === true ? isRefresh : false, this.props)
                                .then((result, exposureResult) => {
                                    if (isRefresh === true && !isRefreshAfterSync) {
                                        this.props.setLoaderState(false);
                                    }
                                    let lastElement = null;
                                    if(result.data.length === 10){
                                        if(screenType === 'FollowUpsScreen'){
                                            lastElement =  Object.assign({}, get(result, 'data[9].mainData', null), {followUpId: get(result, 'data[9].followUpData._id', null)});
                                        }
                                        else if(screenType === 'LabResultsScreen'){
                                            lastElement =  Object.assign({}, get(result, 'data[9].mainData', null), {labResultId: get(result, 'data[9].labResultData._id', null)});
                                        } else {
                                            lastElement = get(result, 'data[9].mainData', null);
                                        }
                                    }
                                    this.setState((prevState) => {
                                        return {
                                            data: !isRefresh && (prevState.lastElement !== null || (prevState.data.length + result.data.length) === prevState.dataCount) ? union(prevState.data,result.data) : result.data,
                                            // exposureData: !isRefresh && (prevState.lastElement !== null ||  (prevState.exposureData.length + exposureResult.dataExposures.length) === prevState.dataCount) ? union(prevState.exposureData,exposureResult.dataExposures) : exposureResult.dataExposures,
                                            lastElement: lastElement,
                                            isAddFromNavigation: false,
                                            dataCount: typeof get(result, 'dataCount') === 'number' ? get(result, 'dataCount') : prevState.dataCount,
                                            offset: result.data.length,
                                            loadMore: false
                                        }
                                    }, ()=>{
                                        this.getDataInprogress = false;
                                    })
                                })
                                .catch((errorGetData) => {
                                    this.setState({
                                        isAddFromNavigation: false,
                                        loadMore: false
                                    }, () => {
                                        this.getDataInprogress = false;
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
                        });
                    }
                }
            };


            getDataDebounce = debounce(this.getData, 120);

                refresh = (isRefreshAfterSync) => {
                this.setState({
                    lastElement: null,
                    offset: 0
                }, () => {
                    this.getData(true, isRefreshAfterSync)
                })
            };

            setSearchText = (text) => {
                this.setState(prevState => ({
                    searchText: {
                        text,
                        locations: this.computeLocationIdsFromName(text)
                    },
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
                switch (screenType) {
                    case 'LabResultsScreen':
                        if(!this.props.outbreak?.isContactLabResultsActive){
                            if (!filter){
                                filter = {};
                            }
                            filter.type = [translations.personTypes.cases];
                        }
                }
                this.setState(prevState => ({
                    mainFilter: filter,
                    //This happens in refresh as well
                    offset: 0,
                    lastElement: null
                }), () => this.refresh())
            };

            // Navigator methods
            onPressFilter = () => {
                // const activeFilters = (this.state.mainFilter && Object.keys(this.state.mainFilter).length !== 0) ? this.state.mainFilter :
                Navigation.showModal(createStackFromComponent({
                    name: constants.appScreens.filterScreen,
                    passProps: {
                        activeFilters: this.state.mainFilter,
                        onApplyFilters: this.setMainFilter,
                        screen: screenType
                    }
                }))
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
                    case constants.appScreens.contactsOfContactsScreen:
                        forwardProps.contact = dataToForward;
                        break;
                    case 'CasesScreen':
                        forwardProps.case = dataToForward;
                        break;
                    case 'EventsScreen':
                        forwardProps.event = dataToForward;
                    case 'LabResultsScreen':
                        forwardProps.item = dataToForward;
                        forwardProps.contact = contactData;
                        forwardProps.isEditMode = false;
                        forwardProps.previousScreen = 'LabResults'
                        break;
                    default:
                        break;
                }
                if (forwardScreen) {
                    Navigation.push(this.props.componentId,{
                        component:{
                            name: forwardScreen,
                            passProps: forwardProps,
                            options: {
                                //fade-in animation
                                animations: {
                                    pop: fadeOutAnimation,
                                    push: fadeInAnimation
                                }
                            }
                        }
                    });
                }
            };

            onPressAddExposure = (dataToForward) => {
                let forwardScreen = this.computeForwardScreen('onPressAddExposure');
                if (screenType === 'CasesScreen') {
                    Navigation.push(this.props.componentId,{
                        component: {
                            //contactSingleScreen
                            name: forwardScreen,
                            passProps: {
                                isNew: true,
                                type: translations.personTypes.cases,
                                addContactFromCasesScreen: true,
                                caseIdFromCasesScreen: dataToForward._id,
                                caseAddress: extractMainAddress(get(dataToForward, 'addresses', [])),
                                singleCase: dataToForward,
                                refresh: this.refresh
                            }
                        }
                    })
                } else if (screenType === 'EventsScreen'){
                    Navigation.push(this.props.componentId,{
                        component: {
                            //contactSingleScreen
                            name: forwardScreen,
                            passProps: {
                                isNew: true,
                                type: translations.personTypes.events,
                                addContactFromCasesScreen: true,
                                caseIdFromCasesScreen: dataToForward._id,
                                caseAddress: dataToForward?.address,
                                singleCase: dataToForward,
                                refresh: this.refresh
                            }
                        }
                    })
                } else {
                    let dataToForwardType = 'contact';
                    if (forwardScreen && dataToForwardType && dataToForward) {
                        let type = 'Contact';
                        if (screenType === constants.appScreens.contactsOfContactsScreen) {
                            type = "ContactOfContact";
                        }
                        Navigation.showModal(createStackFromComponent({
                            name: forwardScreen,
                            passProps: {
                                [dataToForwardType]: dataToForward,
                                type: type,
                                refresh: this.refresh
                            }
                        }))
                    }
                }
            };

            onPressCenterButton = (caseData) => {
                let forwardScreen = this.computeForwardScreen('onPressCenterButton');
                if (screenType === 'CasesScreen' || screenType === 'EventsScreen') {
                    Navigation.push(this.props.componentId,{
                        component:{
                            name: forwardScreen,
                            passProps: {
                                isNew: false,
                                refresh: this.refresh,
                                case: caseData,
                                index: 3
                            }
                        }
                    })
                }
                if (screenType === 'ContactsScreen') {
                    Navigation.push(this.props.componentId,{
                        component:{
                            name: forwardScreen,
                            passProps: {
                                isNew: true,
                                type: 'ContactOfContact',
                                addContactFromCasesScreen: true,
                                caseIdFromCasesScreen: caseData._id,
                                caseAddress: extractMainAddress(get(caseData, 'addresses', [])),
                                singleCase: caseData,
                                refresh: this.refresh
                            }
                        }
                    })
                }
                if (screenType === constants.appScreens.contactsOfContactsScreen) {
                    Navigation.push(this.props.componentId, {
                        component: {
                            name: forwardScreen,
                            passProps: {
                                isNew: false,
                                isEditMode: true,
                                contact: caseData,
                                refresh: this.refresh
                            }
                        }
                    })
                }
            };

            onPressFullName = (person, prevScreen, secondaryData) => {
                let requiredPermissions = this.computePermissions('onPressFullName');
                let forwardScreen = this.computeForwardScreen('onPressFullName');
                let forwardedProps = {};
                let dataToSend = null;
                switch (screenType) {
                    case constants.appScreens.casesScreen:
                        dataToSend = 'case'
                        break;
                    case constants.appScreens.eventsScreen:
                        dataToSend = 'event'
                        break;
                    case constants.appScreens.contactsOfContactsScreen:
                        dataToSend = 'contact'
                        break;
                    case constants.appScreens.contactsScreen:
                        dataToSend = 'contact';
                        break;
                    case constants.appScreens.labResultsScreen:
                        dataToSend = 'contact';
                        forwardedProps.item = secondaryData;
                        forwardedProps.contact = person;
                        forwardedProps.isEditMode = false;
                        forwardedProps.previousScreen = 'LabResults'
                        break;
                    case constants.appScreens.followUpScreen:
                        dataToSend = 'contact';
                        forwardedProps.item = secondaryData;
                        forwardedProps.contact = person;
                        forwardedProps.isEditMode = false;
                        forwardedProps.previousScreen = 'FollowUps';
                        break;
                    default:
                        dataToSend = null;
                }

                forwardedProps[dataToSend] = person;
                forwardedProps['previousScreen'] = prevScreen;
                forwardedProps['refresh'] = this.refresh;
                forwardedProps['isEditMode'] = false;
                if (screenType === constants.appScreens.contactsOfContactsScreen) {
                    forwardedProps['type'] = 'ContactsOfContacts'
                }

                if (forwardScreen) {
                    screenTransition(this.props.componentId, 'push', forwardScreen, forwardedProps, this.props.role, requiredPermissions);
                }
            };

            onPressExposure = (exposure) => {
                let requiredPermissions = this.computePermissions('onPressExposure');
                let forwardScreen = this.computeForwardScreen('onPressExposure');
                let previousScreen = screenType === constants.appScreens.followUpScreen ? translations.followUpsScreen.followUpsTitle : translations.contactsScreen.contactsTitle;

                if (forwardScreen) {
                    let forwardProps = null;
                    if (screenType === constants.appScreens.contactsOfContactsScreen) {
                        forwardProps = {
                            contact: {_id: get(exposure, 'id', null)},
                            refresh: this.refresh,
                            previousScreen: translations.contactsOfContactsScreen.contactsTitle,
                            isEditMode: false,
                            getContact: true
                        };
                    } else {
                        forwardProps = {
                            case: {_id: get(exposure, 'id', null)},
                            refresh: this.refresh,
                            previousScreen: previousScreen
                        };
                    }

                    screenTransition(this.props.componentId, 'push', forwardScreen, forwardProps, this.props.role, requiredPermissions);
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
                                forwardScreen = constants.appScreens.followUpSingleScreen;
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
                                forwardScreen = constants.appScreens.contactsOfContactsSingleScreen;
                                break;
                            default:
                                forwardScreen = null;
                        }
                        break;
                    case constants.appScreens.contactsOfContactsScreen:
                        switch (method) {
                            case 'onPressView':
                                forwardScreen = constants.appScreens.contactsOfContactsSingleScreen;
                                break;
                            case 'onPressAddExposure':
                                forwardScreen = constants.appScreens.exposureScreen;
                                break;
                            case 'onPressFullName':
                                forwardScreen = constants.appScreens.contactsOfContactsSingleScreen;
                                break;
                            case 'onPressExposure':
                                forwardScreen = constants.appScreens.contactSingleScreen;
                                break;
                            case 'onPressCenterButton':
                                forwardScreen = constants.appScreens.contactsOfContactsSingleScreen;
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
                    case constants.appScreens.eventsScreen:
                        switch (method) {
                            case 'onPressView':
                                forwardScreen = constants.appScreens.eventSingleScreen;
                                break;
                            case 'onPressAddExposure':
                                forwardScreen = constants.appScreens.contactSingleScreen;
                                break;
                            case 'onPressFullName':
                                forwardScreen = constants.appScreens.eventSingleScreen;
                                break;
                            case 'onPressExposure':
                                forwardScreen = constants.appScreens.contactSingleScreen;
                                break;
                            case 'onPressCenterButton':
                                forwardScreen = constants.appScreens.eventSingleScreen;
                                break;
                            default:
                                forwardScreen = null;
                        }
                        break;
                    case constants.appScreens.labResultsScreen:
                        switch (method) {
                            case 'onPressView':
                                forwardScreen = constants.appScreens.labResultsSingleScreen;
                                // forwardScreen = constants.appScreens.viewEditScreen;
                                break;
                            case 'onPressAddExposure':
                                forwardScreen = constants.appScreens.exposureScreen;
                                break;
                            case 'onPressFullName':
                                forwardScreen = constants.appScreens.labResultsSingleScreen;
                                // forwardScreen = constants.appScreens.viewEditScreen;
                                break;
                            case 'onPressExposure':
                                forwardScreen = constants.appScreens.contactSingleScreen;
                                // forwardScreen = constants.appScreens.viewEditScreen;
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
                    case constants.appScreens.contactsOfContactsScreen:
                        switch (method) {
                            case 'onPressFullName':
                                permissions = [
                                    PERMISSIONS_CONTACT_OF_CONTACT.contactsOfContactsAll,
                                    PERMISSIONS_CONTACT_OF_CONTACT.contactsOfContactsView,
                                ];
                                break;
                            case 'onPressExposure':
                                permissions = [
                                    constants.PERMISSIONS_CONTACT.contactAll,
                                    constants.PERMISSIONS_CONTACT.contactView,
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
                    case constants.appScreens.labResultsScreen:
                        switch (method) {
                            case 'onPressFullName':
                                permissions = [
                                    constants.PERMISSIONS_LAB_RESULT.labResultAll,
                                    constants.PERMISSIONS_LAB_RESULT.labResultView,
                                ];
                                break;
                            default:
                                permissions = [];
                        }
                        break;
                    case constants.appScreens.eventsScreen:
                        switch (method) {
                            case 'onPressFullName':
                                permissions = [
                                    constants.PERMISSIONS_EVENT.eventAll,
                                    constants.PERMISSIONS_EVENT.eventView,
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

            computeLocationIdsFromName = (searchText) => {
                if (!searchText) {
                    return [];
                }
                return this.props.location.filter((e) => e.name.toLowerCase().includes(searchText.toLowerCase())).map((e) => extractIdFromPouchId(e._id, 'location'));
            };

            onNavigatorEvent = (event) => {
                navigation(event, this.props.navigator);
            };
        }

        WithListData.propTypes = {};

        return WithListData;
    }
}