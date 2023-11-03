/**
 * Created by florinpopa on 25/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import geolocation from '@react-native-community/geolocation';
import {Alert, Animated, BackHandler, Platform, StyleSheet, View} from 'react-native';
import {Icon} from 'react-native-material-ui';
import NavBarCustom from './../components/NavBarCustom';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators, compose} from "redux";
import {PagerScroll, TabBar, TabView} from 'react-native-tab-view';
import FollowUpsSingleContainer from './../containers/FollowUpsSingleContainer';
import FollowUpsSingleQuestionnaireContainer from './../containers/FollowUpsSingleQuestionnaireContainer';
import Breadcrumb from './../components/Breadcrumb';
import Menu, {MenuItem} from 'react-native-material-menu';
import Ripple from 'react-native-material-ripple';
import {addFollowUp, createFollowUp, updateFollowUpAndContact} from './../actions/followUps';
import _, {cloneDeep, remove, sortBy} from 'lodash';
import {
    calculateDimension,
    createDate, createStackFromComponent, daysSince,
    getTranslation,
    mapAnswers,
    reMapAnswers,
    updateRequiredFields
} from './../utils/functions';
import translations from './../utils/translations'
import ElevatedView from 'react-native-elevated-view';
import ViewHOC from './../components/ViewHOC';
import PermissionComponent from './../components/PermissionComponent';
import moment from 'moment-timezone';
import {checkArrayAndLength} from './../utils/typeCheckingFunctions';
import {checkRequiredQuestions, extractAllQuestions} from "../utils/functions";
import constants from './../utils/constants';
import withPincode from './../components/higherOrderComponents/withPincode';
import {Navigation} from "react-native-navigation";
import {fadeInAnimation, fadeOutAnimation} from "../utils/animations";
import {setDisableOutbreakChange} from "../actions/outbreak";
import styles from './../styles';
import colors from "../styles/colors";
import {prepareFieldsAndRoutes} from "../utils/formValidators";

class FollowUpsSingleScreen extends Component {

    constructor(props) {
        super(props);

        let routes = config.tabsValuesRoutes.followUpsSingle;
        this.preparedFields = prepareFieldsAndRoutes(this.props.outbreak, 'follow-ups', config.followUpsSingleScreen);
        if (this.preparedFields.address?.invisible){
            remove(routes, (route => route.key === 'address'))
        }

        this.state = {
            routes: routes,
            index: 0,
            item: this.props.item,
            contact: this.props.contact,
            savePressed: false,
            deletePressed: false,
            isDateTimePickerVisible: false,
            isEditMode: _.get(this.props, 'isEditMode', false),
            isModified: false,
            itemBeforeEdit: {},

            currentAnswers: {},
            previousAnswers: {},
            mappedQuestions: [],
        };
        // Bind here methods, or at least don't declare methods in the render method
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }

    componentDidMount() {
        const listener = {
            componentDidAppear: () => {
                this.props.setDisableOutbreakChange(true);
            }
        };
        // Register the listener to all events related to our component
        this.navigationListener = Navigation.events().registerComponentListener(listener, this.props.componentId);
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);

        let isEditMode = _.get(this.props, 'isEditMode', true);

        if (this.props.isNew === false) {
            if (this.props.role && this.props.role.find((e) => e === config.userPermissions.writeFollowUp) !== undefined) {
                let today = createDate(null);
                let itemDate = createDate(this.props.item.date);

                let todayDate = createDate(moment.tz([today.getFullYear(), today.getMonth(), today.getDate()], this.props.timezone).toDate());
                let followUpDate = createDate(moment.tz([itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate()], this.props.timezone).toDate());

                if (followUpDate > todayDate) {
                    console.log('follow-ups date < today => needitabil');
                    isEditMode = false
                }
            } else if (this.props.role && this.props.role.find((e) => e === config.userPermissions.writeFollowUp) === undefined && this.props.role.find((e) => e === config.userPermissions.readFollowUp) !== undefined) {

                isEditMode = false
            }
        }

        if (this.props.questions) {
            let mappedAnswers = mapAnswers(this.props.questions, this.state.item.questionnaireAnswers);
            this.setState({
                previousAnswers: mappedAnswers.mappedAnswers,
                mappedQuestions: mappedAnswers.mappedQuestions,
                isEditMode
            }, () => {
                console.log('Previous Answers: ', this.state.previousAnswers);
            });
        } else {
            this.setState({
                isEditMode
            })
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);

        this.navigationListener.remove();
    }

    handleBackButtonClick() {
        // this.props.navigator.goBack(null);
        if (this.state.isModified === true) {
            Alert.alert("", 'You have unsaved data. Are you sure you want to leave this page and lose all changes?', [
                {
                    text: 'Yes', onPress: () => {
                        Navigation.pop(this.props.componentId)
                    }
                },
                {
                    text: 'Cancel', onPress: () => {
                        console.log("onPressCancelEdit No pressed - nothing changes")
                    }
                }
            ])
        } else {
            Navigation.pop(this.props.componentId)
        }
        return true;
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <ViewHOC style={style.container}
                showLoader={this && this.state && this.state.loading}
                loaderText={
                    this.props && this.props.syncState ? 'Loading' : getTranslation(translations.loadingScreenMessages.loadingMsg, this.props.translation)
                }
            >
                <NavBarCustom
                    title={null}
                    customTitle={
                        <View style={style.headerContainer}>
                            <View style={[style.breadcrumbContainer]}>
                                <Breadcrumb
                                    entities={[getTranslation(this.props && this.props.previousScreen ? this.props.previousScreen : translations.followUpsSingleScreen.title, this.props.translation), ((this.state.contact && this.state.contact.firstName ? (this.state.contact.firstName + " ") : '') + (this.state.contact && this.state.contact.lastName ? this.state.contact.lastName : ''))]}
                                    componentId={this.props.componentId}
                                    onPress={this.handlePressBreadcrumb}
                                />
                            </View>
                            <View style={style.headerButtonSpacing}>
                                <ElevatedView
                                    elevation={0}
                                    style={[
                                        style.headerButton,
                                        {
                                            width: calculateDimension(30, false, this.props.screenSize),
                                            height: calculateDimension(30, true, this.props.screenSize)
                                        }
                                    ]}
                                >
                                    <Ripple style={style.headerButtonInner} onPress={this.goToHelpScreen}>
                                        <Icon name="help" color={styles.textColor} size={18} />
                                    </Ripple>
                                </ElevatedView>
                            </View>
                            {
                                checkArrayAndLength(_.intersection(
                                    _.get(this.props, 'role', []),
                                    [
                                        constants.PERMISSIONS_FOLLOW_UP.followUpAll,
                                        constants.PERMISSIONS_FOLLOW_UP.followUpDelete,
                                        constants.PERMISSIONS_CONTACT.contactAll,
                                        constants.PERMISSIONS_CONTACT.contactView,
                                    ]
                                )) ? (
                                    <View>
                                        <Menu
                                            ref="menuRef"
                                            button={
                                                <Ripple
                                                    style={[
                                                        style.moreMenuButton,
                                                        {
                                                            width: calculateDimension(30, false, this.props.screenSize),
                                                            height: calculateDimension(30, true, this.props.screenSize)
                                                        }
                                                    ]}
                                                    onPress={this.showMenu}
                                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                                >
                                                    <Icon name="more-vert" color={styles.textColor} size={24} />
                                                </Ripple>
                                            }
                                            style={{top: 36}}
                                        >
                                            <PermissionComponent
                                                render={() => (
                                                    <MenuItem onPress={this.handleEditContact}>
                                                        {getTranslation(translations.followUpsSingleScreen.editContactButton, this.props.translation)}
                                                    </MenuItem>
                                                )}
                                                permissionsList={[
                                                    constants.PERMISSIONS_CONTACT.contactAll,
                                                    constants.PERMISSIONS_CONTACT.contactView
                                                ]}
                                            />
                                            <PermissionComponent
                                                render={() => (
                                                    <MenuItem onPress={this.handleOnPressDelete}>
                                                        {getTranslation(translations.followUpsSingleScreen.deleteButton, this.props.translation)}
                                                    </MenuItem>
                                                )}
                                                permissionsList={[
                                                    constants.PERMISSIONS_FOLLOW_UP.followUpAll,
                                                    constants.PERMISSIONS_FOLLOW_UP.followUpDelete
                                                ]}
                                            />
                                        </Menu>
                                    </View>
                                ) : null
                            }
                        </View>
                    }
                    componentId={this.props.componentId}
                    iconName="menu"
                    handlePressNavbarButton={this.handlePressNavbarButton}
                />
                <TabView
                    navigationState={this.state}
                    animationEnabled={Platform.OS === 'ios'}
                    onIndexChange={this.handleOnIndexChange}
                    renderScene={this.handleRenderScene}
                    renderPager={this.handleRenderPager}
                    renderTabBar={this.handleRenderTabBar}
                    useNativeDriver
                />
            </ViewHOC>
        );
    }

    handleRenderPager = (props) => {
        return (Platform.OS === 'ios') ? <PagerScroll {...props} swipeEnabled={false} animationEnabled={false} /> :
            <PagerScroll {...props} swipeEnabled={false} animationEnabled={false} />
    };

    // Please write here all the methods that are not react native lifecycle methods
    handlePressNavbarButton = () => {
        Navigation.mergeOptions(this.props.componentId, {
            sideMenu: {
                left: {
                    visible: true,
                },
            },
        });
    };

    handleOnIndexChange = _.throttle((index) => {
        this.setState({ index });
    }, 300);

    handleRenderScene = ({ route }) => {

        switch (route.key) {
            case 'genInfo':
                return (
                    <FollowUpsSingleContainer
                        routeKey={this.state.routes[this.state.index].key}
                        preparedFields={this.preparedFields}
                        isNew={this.props.isNew}
                        isEditMode={this.state.isEditMode}
                        item={this.state.item}
                        contact={this.state.contact}
                        activeIndex={this.state.index}
                        onPressNextButton={this.handleNextPress}
                        onPressPreviousButton={this.handlePreviousPress}
                        onChangeText={this.onChangeText}
                        onChangeDate={this.onChangeDate}
                        onChangeSwitch={this.onChangeSwitch}
                        onChangeDropDown={this.onChangeDropDown}
                        onPressSaveEdit={this.handleOnPressSave}
                        numberOfTabs={this.state.routes.length}
                        onPressEdit={this.onPressEdit}
                        onPressCancelEdit={this.onPressCancelEdit}
                    />
                );
            case 'quest':
                return (
                    <FollowUpsSingleQuestionnaireContainer
                        item={this.state.item}
                        currentAnswers={this.state.currentAnswers}
                        previousAnswers={this.state.previousAnswers}
                        contact={this.state.contact}
                        isNew={this.props.isNew}
                        isEditMode={this.state.isEditMode && moment.tz(this.props.timezone).diff(this.state.item.date) >= 0}
                        activeIndex={this.state.index}
                        onChangeTextAnswer={this.onChangeTextAnswer}
                        onChangeDateAnswer={this.onChangeDateAnswer}
                        onChangeSingleSelection={this.onChangeSingleSelection}
                        onChangeMultipleSelection={this.onChangeMultipleSelection}
                        onPressSaveEdit={this.handleOnPressSave}
                        onPressMissing={this.handleOnPressMissing}
                        onClickAddNewMultiFrequencyAnswer={this.onClickAddNewMultiFrequencyAnswer}
                        onChangeAnswerDate={this.onChangeAnswerDate}
                        savePreviousAnswers={this.savePreviousAnswers}
                        copyAnswerDate={this.handleCopyAnswerDate}
                        onPressPreviousButton={this.handlePreviousPress}
                        numberOfTabs={this.state.routes.length}
                        onPressEdit={this.onPressEdit}
                        onPressCancelEdit={this.onPressCancelEdit}
                    />
                );
            default:
                return (
                    <FollowUpsSingleContainer
                        item={this.state.item}
                        isEditMode={this.state.isEditMode}
                        contact={this.state.contact}
                        onNext={this.handleNextPress}
                        onChangeText={this.onChangeText}
                        onChangeDate={this.onChangeDate}
                        onChangeSwitch={this.onChangeSwitch}
                        onChangeDropDown={this.onChangeDropDown}
                    />
                );
        }

    };

    handleRenderTabBar = (props) => {
        return (
            <TabBar
                {...props}
                indicatorStyle={{
                    backgroundColor: styles.primaryColor,
                    height: 2
                }}
                style={{
                    height: 36,
                    backgroundColor: styles.backgroundColor
                }}
                tabStyle={{
                    paddingHorizontal: 16,
                    marginHorizontal: 0,
                    textAlign: 'center'
                }}
                activeColor={styles.primaryColor}
                inactiveColor={styles.secondaryColor}
                renderLabel={this.handleRenderLabel(props)}
            />
        )
    };

    handleRenderLabel = (props) => ({ route, focused }) => {

        return (
            <Animated.Text style={{
                fontFamily: 'Roboto-Medium',
                fontSize: 12,
                flex: 1,
                alignSelf: 'center',
                color: focused ? colors.primaryColor : this.props.isNew ? colors.secondaryColor : colors.textColor
            }}>
                {getTranslation(route.title, this.props.translation).toUpperCase()}
            </Animated.Text>
        );
    };

    checkRequiredFields = () => {
        if (this.state.item.deleted){
            return [];
        }
        let checkRequiredFields = [];
        if (this.state.item.statusId === translations.generalLabels.noneLabel) {
            checkRequiredFields.push(getTranslation(_.get(config, 'followUpsSingleScreen.fields[1].label', 'Status'), this.props.translation));
        }
        for (let i = 0; i < this.preparedFields.generalInfo.length; i++ ){
            for (let j = 0; j < this.preparedFields.generalInfo[i].fields.length; j++ ){
                const field = this.preparedFields.generalInfo[i].fields[j];
                if (field.isRequired && !this.state.item[field.id]){
                    checkRequiredFields.push(getTranslation(field.label,this.props.translation));
                }
            }
        }
        for (let i = 0; i < this.preparedFields.address.length; i++ ){
            for (let j = 0; j < this.preparedFields.address[i].fields.length; j++ ){
                const field = this.preparedFields.address[i].fields[j];
                if (field.isRequired && !this.state.item[field.id]){
                    checkRequiredFields.push(getTranslation(field.label,this.props.translation));
                }
            }
        }
        return checkRequiredFields
    }

    handleNextPress = () => {
        // Before getting to the next screen, first do some checking of the required fields
        let checkRequiredFields = this.checkRequiredFields();

        if (checkArrayAndLength(checkRequiredFields)) {
            Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), `${getTranslation(translations.alertMessages.requiredFieldsMissingError, this.props.translation)}.\n${getTranslation(translations.alertMessages.missingFields, this.props.translation)}: ${checkRequiredFields}`, [
                {
                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                    onPress: () => { console.log("OK pressed") }
                }
            ])
        } else {
            this.handleOnIndexChange(this.state.index + 1);
        }
    };
    handlePreviousPress = () => {
        this.handleOnIndexChange(this.state.index - 1);
    }

    //Breadcrumb click
    handlePressBreadcrumb = () => {
        if (this.state.isModified === true) {
            Alert.alert("", 'You have unsaved data. Are you sure you want to leave this page and lose all changes?', [
                {
                    text: 'Yes', onPress: () => {
                        Navigation.pop(this.props.componentId)
                    }
                },
                {
                    text: 'Cancel', onPress: () => {
                        console.log("onPressCancelEdit No pressed - nothing changes")
                    }
                }
            ])
        } else {
            Navigation.pop(this.props.componentId);
        }
    };

    // Handle changes to the regular fields
    onChangeText = (value, id, objectType) => {
        console.log("onChangeText: ", objectType);
        if (objectType === 'FollowUp') {
            this.setState(
                (prevState) => ({
                    item: Object.assign({}, prevState.item, { [id]: value }),
                    isModified: true
                }), () => {
                    console.log("onChangeText", id, " ", value, " ", this.state.item);
                }
            )
        } else {
            if (objectType === 'Contact') {
                this.setState(
                    (prevState) => ({
                        contact: Object.assign({}, prevState.contact, { [id]: value }),
                        isModified: true
                    }), () => {
                        console.log("onChangeText", id, " ", value, " ", this.state.contact);
                    }
                )
            }
        }
    };
    onChangeDate = (value, id, objectType) => {

        if (objectType === 'FollowUp') {
            if (!value) {
                this.setState(
                    (prevState) => ({
                        item: Object.assign({}, prevState.item, { [id]: value, statusId: translations.followUpStatuses.notPerformed, fillLocation: false }),
                        isModified: true,
                    })
                )
                return;
            }
            let status = this.state.item.statusId;
            let currentAnswers = this.state.currentAnswers;
            let previousAnswers = this.state.previousAnswers;
            let mappedQuestions = this.state.mappedQuestions;
            let fillLocation = this.state.item.fillLocation;
            if (id === 'date' && moment.tz(this.props.timezone).diff(value) < 0){
                status = translations.followUpStatuses.notPerformed;
                fillLocation = false;
            } else if (id === 'date' && moment.tz(this.props.timezone).diff(value) >= 0) {
                currentAnswers = {};
                previousAnswers = {};
                mappedQuestions = [];
            }
            this.setState(
                (prevState) => ({
                    item: Object.assign({}, prevState.item, { [id]: value, statusId: status, fillLocation }),
                    isModified: true,
                    currentAnswers,
                    previousAnswers,
                    mappedQuestions,
                })
                , () => {
                    console.log("onChangeDate statusId", id, " ", value, " ", this.state.item);
                }
            )
        } else {
            if (objectType === 'Contact') {
                this.setState(
                    (prevState) => ({
                        contact: Object.assign({}, prevState.contact, { [id]: value }),
                        isModified: true
                    })
                    , () => {
                        console.log("onChangeDate", id, " ", value, " ", this.state.contact);
                    }
                )
            }
        }
    };
    onChangeSwitch = (value, id, objectType) => {
        // console.log("onChangeSwitch: ", value, id, this.state.item);
        if (id === 'fillLocation') {
            geolocation.getCurrentPosition((position) => {
                this.setState(
                    (prevState) => ({
                        item: Object.assign({}, prevState.item, { [id]: value ? {geoLocation: { lat: position.coords.latitude, lng: position.coords.longitude }} : {geoLocation: { lat: null, lng: null }} }),
                        isModified: true
                    }), () => {
                        console.log("onChangeSwitch", id, " ", value, " ", this.state.item);
                    }
                )
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
            )
        } else {
            if (objectType === 'FollowUp') {
                this.setState(
                    (prevState) => ({
                        item: Object.assign({}, prevState.item, { [id]: value }),
                        isModified: true
                    }), () => {
                        console.log("onChangeSwitch", id, " ", value, " ", this.state.item);
                    }
                )
            } else {
                if (objectType === 'Contact') {
                    this.setState(
                        (prevState) => ({
                            contact: Object.assign({}, prevState.contact, { [id]: value }),
                            isModified: true
                        }), () => {
                            console.log("onChangeSwitch", id, " ", value, " ", this.state.contact);
                        }
                    )
                }
            }
        }

    };
    onChangeDropDown = (value, id, objectType) => {
        console.log("onChangeDropDown: ", value, id, this.state.item);
        if (objectType === 'FollowUp' || id === 'address') {
            if (id === 'address') {
                if (!this.state.item[id]) {
                    this.state.item[id] = {};
                }

                let address = this.state.contact && this.state.contact.addresses && Array.isArray(this.state.contact.addresses) && this.state.contact.addresses.length > 0 ? this.state.contact.addresses.filter((e) => {
                    return value.includes(e.addressLine1 || '') && value.includes(e.addressLine2 || '') && value.includes(e.city || '') && value.includes(e.country || '') && value.includes(e.postalCode || '');
                }) : [];

                this.setState(
                    (prevState) => ({
                        item: Object.assign({}, prevState.item, { [id]: address[0] }),
                        isModified: true
                    }), () => {
                        console.log("onChangeDropDown", id, " ", value, " ", this.state.item);
                    }
                )
            } else {
                this.setState(
                    (prevState) => ({
                        item: Object.assign({}, prevState.item, { [id]: value && value.value !== undefined ? value.value : value }),
                        isModified: true
                    }), () => {
                        console.log("onChangeDropDown", id, " ", value, " ", this.state.item);
                    }
                )
            }

        } else {
            if (objectType === 'Contact') {
                this.setState(
                    (prevState) => ({
                        contact: Object.assign({}, prevState.contact, { [id]: value && value.value !== undefined ? value.value : value }),
                        isModified: true
                    }), () => {
                        console.log("onChangeDropDown", id, " ", value, " ", this.state.contact);
                    }
                )
            }
        }
    };

    // Handle changes to the questionnaire fields
    onChangeTextAnswer = (value, id, parentId, index) => {
        let questionnaireAnswers = _.cloneDeep(this.state.previousAnswers);

        if (parentId) {
            if (!questionnaireAnswers[parentId]) {
                questionnaireAnswers[parentId] = [];
            }
            if (questionnaireAnswers[parentId] && Array.isArray(questionnaireAnswers[parentId]) && questionnaireAnswers[parentId].length > 0 && questionnaireAnswers[parentId][0]) {
                if (typeof questionnaireAnswers[parentId][0].subAnswers === "object" && Object.keys(questionnaireAnswers[parentId][0].subAnswers).length === 0) {
                    questionnaireAnswers[parentId][0].subAnswers = {};
                }
                if (!questionnaireAnswers[parentId][0].subAnswers[id]) {
                    questionnaireAnswers[parentId][0].subAnswers[id] = [];
                }
                questionnaireAnswers[parentId][0].subAnswers[id][0] = value;
            }
        } else {
            if (!questionnaireAnswers[id]) {
                questionnaireAnswers[id] = [];
            }
            questionnaireAnswers[id][index] = value;
        }

        this.setState({
            previousAnswers: questionnaireAnswers,
            isModified: true
        })
    };
    onChangeDateAnswer = (value, id, parentId, index) => {
        console.log ('onChangeDateAnswer', value, id)
        let questionnaireAnswers = _.cloneDeep(this.state.previousAnswers);

        if (parentId) {
            if (!questionnaireAnswers[parentId]) {
                questionnaireAnswers[parentId] = [];
            }
            if (questionnaireAnswers[parentId] && Array.isArray(questionnaireAnswers[parentId]) && questionnaireAnswers[parentId].length > 0 && questionnaireAnswers[parentId][0]) {
                if (typeof questionnaireAnswers[parentId][0].subAnswers === "object" && Object.keys(questionnaireAnswers[parentId][0].subAnswers).length === 0) {
                    questionnaireAnswers[parentId][0].subAnswers = {};
                }
                if (!questionnaireAnswers[parentId][0].subAnswers[id]) {
                    questionnaireAnswers[parentId][0].subAnswers[id] = [];
                }
                questionnaireAnswers[parentId][0].subAnswers[id][0] = value;
            }
        } else {
            if (!questionnaireAnswers[id]) {
                questionnaireAnswers[id] = [];
            }
            questionnaireAnswers[id][index] = value;
        }
        this.setState(prevState => ({
            previousAnswers: questionnaireAnswers,
            isModified: true
        }))
    };
    onChangeSingleSelection = (value, id, parentId, index) => {
        // console.log ('onChangeSingleSelection', value, id)
        let questionnaireAnswers = _.cloneDeep(this.state.previousAnswers);

        if (parentId) {
            if (!questionnaireAnswers[parentId]) {
                questionnaireAnswers[parentId] = [];
            }
            if (questionnaireAnswers[parentId] && Array.isArray(questionnaireAnswers[parentId]) && questionnaireAnswers[parentId].length > 0 && questionnaireAnswers[parentId][0]) {
                if (typeof questionnaireAnswers[parentId][0].subAnswers === "object" && Object.keys(questionnaireAnswers[parentId][0].subAnswers).length === 0) {
                    questionnaireAnswers[parentId][0].subAnswers = {};
                }
                if (!questionnaireAnswers[parentId][0].subAnswers[id]) {
                    questionnaireAnswers[parentId][0].subAnswers[id] = [];
                }
                if (_.get(value, 'subAnswers', null) !== null) {
                    questionnaireAnswers[parentId][0].subAnswers = Object.assign({}, questionnaireAnswers[parentId][0].subAnswers, value.subAnswers);
                    delete value.subAnswers;
                }
                questionnaireAnswers[parentId][0].subAnswers[id][0] = value;
            }
        } else {
            if (!questionnaireAnswers[id]) {
                questionnaireAnswers[id] = [];
            }
            questionnaireAnswers[id][index] = value;
        }
        this.setState(prevState => ({
            previousAnswers: questionnaireAnswers,
            isModified: true
        }))
    };
    onChangeMultipleSelection = (value, id, parentId, index) => {
        let questionnaireAnswers = _.cloneDeep(this.state.previousAnswers);

        if (parentId) {
            if (!questionnaireAnswers[parentId]) {
                questionnaireAnswers[parentId] = [];
            }
            if (questionnaireAnswers[parentId] && Array.isArray(questionnaireAnswers[parentId]) && questionnaireAnswers[parentId].length > 0 && questionnaireAnswers[parentId][0]) {
                if (!_.get(questionnaireAnswers, `[${parentId}][0].subAnswers`, null) || (typeof questionnaireAnswers[parentId][0].subAnswers === "object" && Object.keys(questionnaireAnswers[parentId][0].subAnswers).length === 0)) {
                    questionnaireAnswers[parentId][0].subAnswers = {};
                }
                if (!questionnaireAnswers[parentId][0].subAnswers[id]) {
                    questionnaireAnswers[parentId][0].subAnswers[id] = [];
                }
                if (_.get(value, 'subAnswers', null) !== null) {
                    questionnaireAnswers[parentId][0].subAnswers = Object.assign({}, questionnaireAnswers[parentId][0].subAnswers, value.subAnswers);
                    delete value.subAnswers;
                }
                questionnaireAnswers[parentId][0].subAnswers[id][0] = value;
            }
        } else {
            if (!questionnaireAnswers[id]) {
                questionnaireAnswers[id] = [];
            }
            questionnaireAnswers[id][index] = value;
        }
        this.setState(prevState => ({
            previousAnswers: questionnaireAnswers,
            isModified: true
        }))
    };
    onChangeAnswerDate = (value, questionId, index) => {
        let questionnaireAnswers = _.cloneDeep(this.state.previousAnswers);
        if (questionnaireAnswers && questionnaireAnswers[questionId] && Array.isArray(questionnaireAnswers[questionId]) && questionnaireAnswers[questionId].length) {
            if (questionnaireAnswers[questionId][index]) {
                questionnaireAnswers[questionId][index].date = value;
                if (questionnaireAnswers[questionId][0].subAnswers && typeof questionnaireAnswers[questionId][0].subAnswers === "object" && Object.keys(questionnaireAnswers[questionId][0].subAnswers).length > 0) {
                    for (let subQuestionId in questionnaireAnswers[questionId][0].subAnswers) {
                        questionnaireAnswers[questionId][0].subAnswers[subQuestionId].map((e) => {
                            return { value: e.value, date: value };
                        })
                    }
                }
            }
        }else{
            questionnaireAnswers[questionId]= [{date: value, value: null}];
        }

        this.setState({
            previousAnswers: questionnaireAnswers,
            isModified: true
        })
    };

    handleOnPressSave = () => {
        // Mark followUp as performed, and then update to the server
        let now = createDate(null);
        let checkRequiredFields = this.checkRequiredFields();

        if (checkArrayAndLength(checkRequiredFields)) {
            Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), `${getTranslation(translations.alertMessages.requiredFieldsMissingError, this.props.translation)}.\n${getTranslation(translations.alertMessages.missingFields, this.props.translation)}: ${checkRequiredFields}`, [
                {
                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                    onPress: () => { console.log("OK pressed") }
                }
            ])
        } else {
            let sortedQuestions = sortBy(cloneDeep(this.props.questions), ['order', 'variable']);
            let questions = extractAllQuestions(sortedQuestions, this.state.previousAnswers, 0);
            let checkRequiredFields = checkRequiredQuestions(questions, this.state.previousAnswers);
            checkRequiredFields = checkRequiredFields.map((e) => { return getTranslation(e, this.props.translation) });
            // console.log("Check required questions: ", checkRequiredFields);
            if (checkRequiredFields && Array.isArray(checkRequiredFields) && checkRequiredFields.length === 0) {
                if( this.checkAnswerDatesQuestionnaire()){
                    let questionnaireAnswers = reMapAnswers(_.cloneDeep(this.state.previousAnswers));
                    questionnaireAnswers = this.filterUnasweredQuestions(questionnaireAnswers);
                    this.setState(prevState => ({
                        item: Object.assign({}, prevState.item,
                            {
                                questionnaireAnswers: questionnaireAnswers
                            }
                        ),
                        isModified: false,
                    }), () => {
                        let followUpClone = _.cloneDeep(this.state.item);
                        if (followUpClone.targeted !== false && followUpClone.targeted !== true) {
                            followUpClone.targeted = false;
                        }
                        // let contactClone = _.cloneDeep(this.state.contact);

                        if (followUpClone.address && followUpClone.address.location) {
                            delete followUpClone.address.location;
                        }

                        followUpClone.index = daysSince(_.get(this.props, 'contact.followUp.startDate', null), followUpClone.date) + 1;

                        if (this.props.isNew) {
                            followUpClone = updateRequiredFields(this.props.outbreak._id, this.props.user._id, Object.assign({}, followUpClone), action = 'create', 'followUp');
                            // console.log('followUpClone create', JSON.stringify(followUpClone))
                            createFollowUp(followUpClone)
                                .then((responseCreateFollowUp) => {
                                    // this.props.refresh();
                                    Navigation.setStackRoot(this.props.componentId,
                                        {
                                            component:{
                                                name: 'ContactsScreen',
                                                options:{
                                                    animations:{
                                                        pop: fadeOutAnimation,
                                                        push: fadeInAnimation
                                                    }
                                                }
                                            }
                                        }
                                    )
                                })
                                .catch((errorCreateFollowUp) => {
                                    console.log(errorCreateFollowUp);
                                })
                        } else {
                            if (this.state.deletePressed === false) {
                                followUpClone = updateRequiredFields(this.props.outbreak._id, this.props.user._id, Object.assign({}, followUpClone), action = 'update');
                                // console.log('followUpClone update', JSON.stringify(followUpClone))
                            } else {
                                followUpClone = updateRequiredFields(this.props.outbreak._id, this.props.user._id, Object.assign({}, followUpClone), action = 'delete');
                                // console.log('followUpClone delete', JSON.stringify(followUpClone))
                            }
                            updateFollowUpAndContact(followUpClone)
                                .then((responseUpdateFollowUp) => {
                                    this.props.refresh();
                                    Navigation.pop(this.props.componentId)
                                })
                                .catch((errorUpdateFollowUp) => {
                                    console.log(errorUpdateFollowUp);
                                })
                        }
                    });
                }else{
                    Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), getTranslation(translations.alertMessages.answerDateMissingError, this.props.translation), [
                        {
                            text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                            onPress: () => { console.log("OK pressed") }
                        }
                    ])
                }
            } else {
                Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), `${getTranslation(translations.alertMessages.requiredFieldsMissingError, this.props.translation)}.\n${getTranslation(translations.alertMessages.missingFields, this.props.translation)}: ${checkRequiredFields}`, [
                    {
                        text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                        onPress: () => { console.log("OK pressed") }
                    }
                ])
            }

        }
    };

    checkAnswerDatesQuestionnaire = () => {
        let previousAnswersClone = _.cloneDeep(this.state.previousAnswers);
        let sortedQuestions = sortBy(cloneDeep(this.props.questions), ['order', 'variable']);
        sortedQuestions = extractAllQuestions(sortedQuestions, this.state.previousAnswers, 0);
        let canSave = true;
        //questions exist
        if( Array.isArray(sortedQuestions) && sortedQuestions.length > 0){
            for(let i=0; i < sortedQuestions.length; i++){
                //verify only multianswer questions and if they were answered
                if(sortedQuestions[i].multiAnswer && previousAnswersClone.hasOwnProperty(sortedQuestions[i].variable)){
                    //current answers
                    let answerValues = previousAnswersClone[sortedQuestions[i].variable];
                    //validate all the answers of the question
                    if( Array.isArray(answerValues) && answerValues.length > 0){
                        for( let q=0; q < answerValues.length; q++){
                            // if it has value then it must have date
                            if(answerValues[q].value !== null && answerValues[q].date === null){
                                canSave = false;
                            }
                        }
                    }
                }
            }
        }
        return canSave;
    };

    handleOnPressMissing = () => {
        this.setState(prevState => ({
            item: Object.assign({}, prevState.item, { statusId: config.followUpStatuses.missed })
        }), () => {
            this.handleOnPressSave();
        })
    };

    showMenu = () => {
        this.refs.menuRef.show();
    };

    hideMenu = () => {
        this.refs.menuRef.hide();
    };

    handleOnPressDeceased = () => {
        console.log("### show date time picker: ");
        this._showDateTimePicker();
    };

    handleEditContact = () => {
        this.hideMenu();

        Navigation.push(this.props.componentId,{
            component:{
                name: 'ContactsSingleScreen',
                passProps: {
                    contact: this.state.contact,
                    handleUpdateContactFromFollowUp: this.handleUpdateContactFromFollowUp,
                    refresh: this.props.refresh
                }
            }
        })
    };

    handleUpdateContactFromFollowUp = (updatedContact) => {
        const { item } = this.state;
        const itemCpy = _.cloneDeep(item);

        if (updatedContact && updatedContact.addresses && Array.isArray(updatedContact.addresses) && updatedContact.addresses.length > 0) {
            let contactPlaceOfResidence = updatedContact.addresses.filter((e) => {
                return e.typeId === config.userResidenceAddress.userPlaceOfResidence
            });
            itemCpy.address = contactPlaceOfResidence[0];
        } else {
            itemCpy.address = null;
        }

        this.setState({
            item: itemCpy,
            contact: updatedContact,
        });

        if (this.props.mimeComponentDidMount !== undefined) {
            this.props.mimeComponentDidMount()
        }
    };

    handleOnPressDelete = () => {
        // console.log("### handleOnPressDelete");
        Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.followUpsSingleScreen.deleteFollowUpAlertError, this.props.translation), [
            {
                text: getTranslation(translations.alertMessages.yesButtonLabel, this.props.translation),
                onPress: () => {
                    this.hideMenu();
                    this.setState({
                        deletePressed: true
                    }, () => {
                        // console.log("### existing filters: ", this.props.filter);
                        // this.props.deleteFollowUp(this.props.outbreak.id, this.state.contact.id, this.state.item.id, this.props.filter, this.props.user.token);
                        this.setState(prevState => ({
                            item: Object.assign({}, prevState.item, {
                                deleted: true,
                                deletedAt: createDate().toISOString()
                            })
                        }), () => {
                            this.handleOnPressSave();
                        })
                    })
                }
            },
            {
                text: getTranslation(translations.alertMessages.cancelButtonLabel, this.props.translation),
                onPress: () => {
                    this.hideMenu();
                }
            }
        ])
    };

    _showDateTimePicker = () => {
        // console.log("ShowDate");
        this.setState({ isDateTimePickerVisible: true });
    };

    _hideDateTimePicker = () => {
        this.setState({ isDateTimePickerVisible: false });
    };

    _handleDatePicked = (date) => {
        // console.log("Date selected: ", date);
        // this._hideDateTimePicker();
        this.setState(prevState => ({
            contact: Object.assign({}, prevState.contact, { deceased: true, dateDeceased: date })
        }), () => {
            this.hideMenu();
            this.handleOnPressSave();
        });
    };

    goToHelpScreen = () => {
        let pageAskingHelpFrom = null;
        if (this.props.isNew !== null && this.props.isNew !== undefined && this.props.isNew === true) {
            pageAskingHelpFrom = 'followUpSingleScreenAdd'
        } else {
            if (this.state.isEditMode === true) {
                pageAskingHelpFrom = 'followUpSingleScreenEdit'
            } else if (this.state.isEditMode === false) {
                pageAskingHelpFrom = 'followUpSingleScreenView'
            }
        }
        Navigation.showModal(createStackFromComponent({
            name: 'HelpScreen',
            passProps: {
                pageAskingHelpFrom: pageAskingHelpFrom
            }
        }));
    };

    // used for adding multi-frequency answers
    onClickAddNewMultiFrequencyAnswer = (item) => {
        //add new empty item to question and update previousAnswers
        let previousAnswersClone = _.cloneDeep(this.state.previousAnswers);
        if(previousAnswersClone.hasOwnProperty(item.variable) && item.variable){
            previousAnswersClone[item.variable].push({date: null, value: null});
        }else{
            previousAnswersClone = Object.assign({}, previousAnswersClone, { [item.variable]: [{date: null, value: null}] });
        }
        this.savePreviousAnswers(previousAnswersClone[item.variable], item.variable);
    };
    savePreviousAnswers = (previousAnswers, previousAnswersId) => {
        this.setState(prevState => ({
            previousAnswers: Object.assign({}, prevState.previousAnswers, { [previousAnswersId]: previousAnswers }),
            isModified: true
        }), () => {
            // console.log('Updated previousAnswers: ', this.state.previousAnswers);
            Navigation.dismissAllModals();
        })
    };
    handleCopyAnswerDate = (value) => {
        let previousAnswersClone = _.cloneDeep(this.state.previousAnswers);
        let sortedQuestions = sortBy(cloneDeep(this.props.questions), ['order', 'variable']);
        sortedQuestions = extractAllQuestions(sortedQuestions, previousAnswersClone, 0);

        for (let question of sortedQuestions){
            if (question.variable && question.answerType !== "LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_MARKUP"){
                if (previousAnswersClone[question.variable]){
                    previousAnswersClone[question.variable] = previousAnswersClone[question.variable].map((e) => {
                        return Object.assign(e, {date: e.date || createDate(value).toISOString()})
                    })
                } else {
                    previousAnswersClone[question.variable] = [{
                        date: createDate(value).toISOString(),
                        value: null
                    }]
                }
            }
        }
        this.setState({
            previousAnswers: previousAnswersClone,
            isModified: true
        });
    };
    filterUnasweredQuestions = (previousAnswers) => {
        let previousAnswersClone = _.cloneDeep(previousAnswers);
        let sortedQuestions = sortBy(cloneDeep(this.props.questions), ['order', 'variable']);
        sortedQuestions = extractAllQuestions(sortedQuestions, this.state.previousAnswers, 0);
        if( Array.isArray(sortedQuestions) && sortedQuestions.length > 0) {
            for (let i = 0; i < sortedQuestions.length; i++) {
                //verify only multianswer questions and if they were answered
                if (sortedQuestions[i].multiAnswer && previousAnswersClone.hasOwnProperty(sortedQuestions[i].variable)) {
                    //current answers
                    let answerValues = previousAnswersClone[sortedQuestions[i].variable];
                    let answerValuesClone = [];
                    //validate all the answers of the question
                    if( Array.isArray(answerValues) && answerValues.length > 0){
                        answerValuesClone = answerValues.filter((answer)=>{
                            return answer.value !== null;
                        });
                    }
                    if(answerValuesClone.length > 0){
                        //update answer list
                        previousAnswersClone[sortedQuestions[i].variable] = answerValuesClone;
                    }else{
                        //remove key
                        delete previousAnswersClone[sortedQuestions[i].variable];
                    }
                }
            }
        }
        return previousAnswersClone;
    };


    onPressEdit = () => {
        this.setState({
            isEditMode: true,
            isModified: false,
            itemBeforeEdit: _.cloneDeep(this.state.item)
        })
    };
    onPressCancelEdit = () => {
        if (this.state.isModified === true) {
            Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.caseDiscardAllChangesConfirmation, this.props.translation), [
                {
                    text: getTranslation(translations.alertMessages.yesButtonLabel, this.props.translation),
                    onPress: () => {
                        this.setState({
                            item: _.cloneDeep(this.state.itemBeforeEdit),
                            isModified: false,
                            isEditMode: false
                        })
                    }
                },
                {
                    text: getTranslation(translations.alertMessages.cancelButtonLabel, this.props.translation),
                    onPress: () => {
                        console.log("onPressCancelEdit No pressed - nothing changes")
                    }
                }
            ])
        } else {
            //there are no changes
            this.setState({
                isEditMode: false
            })
        }
    };
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flex: 1
    },
    headerContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: 16
    },
    breadcrumbContainer: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },
    headerButtonSpacing: {
        marginRight: 8
    },
    headerButton: {
        backgroundColor: styles.disabledColor,
        borderRadius: 4
    },
    headerButtonInner: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center'
    },
    moreMenuButton: {
        alignItems: 'center',
        backgroundColor: styles.disabledColor,
        borderRadius: 4,
        justifyContent: 'center'
    }
});

function mapStateToProps(state) {
    return {
        user: _.get(state, 'user', {_id: null, activeOutbreakId: null}),
        outbreak: _.get(state, 'outbreak', {_id: null}),
        screenSize: _.get(state, 'app.screenSize', config.designScreenSize),
        questions: _.get(state, 'outbreak.contactFollowUpTemplate', null),
        translation: _.get(state, 'app.translation', []),
        role: _.get(state, 'role', []),
        timezone: _.get(state, 'app.timezone', null)
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        setDisableOutbreakChange
    }, dispatch);
};

export default compose(
    withPincode(),
    connect(mapStateToProps, matchDispatchProps)
)(FollowUpsSingleScreen);
