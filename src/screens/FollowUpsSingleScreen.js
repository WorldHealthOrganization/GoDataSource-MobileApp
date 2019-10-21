/**
 * Created by florinpopa on 25/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, { Component } from 'react';
import { View, StyleSheet, Animated, Alert, BackHandler, Platform } from 'react-native';
import { Icon } from 'react-native-material-ui';
import styles from './../styles';
import NavBarCustom from './../components/NavBarCustom';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {TabBar, TabView, PagerScroll} from 'react-native-tab-view';
import FollowUpsSingleContainer from './../containers/FollowUpsSingleContainer';
import FollowUpsSingleQuestionnaireContainer from './../containers/FollowUpsSingleQuestionnaireContainer';
import Breadcrumb from './../components/Breadcrumb';
import Menu, { MenuItem } from 'react-native-material-menu';
import Ripple from 'react-native-material-ripple';
import { createFollowUp, updateFollowUpAndContact, deleteFollowUp } from './../actions/followUps';
import { removeErrors } from './../actions/errors';
import _ from 'lodash';
import { calculateDimension, extractIdFromPouchId, updateRequiredFields, getTranslation, mapAnswers, reMapAnswers, createDate } from './../utils/functions';
import translations from './../utils/translations'
import ElevatedView from 'react-native-elevated-view';
import ViewHOC from './../components/ViewHOC';
import moment from 'moment';
import {checkArrayAndLength} from './../utils/typeCheckingFunctions';

class FollowUpsSingleScreen extends Component {

    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
            routes: config.tabsValuesRoutes.followUpsSingle,
            index: 0,
            item: this.props.item,
            contact: this.props.contact,
            savePressed: false,
            deletePressed: false,
            isDateTimePickerVisible: false,
            isEditMode: true,
            isModified: false,

            currentAnswers: {},
            previousAnswers: [],
            mappedQuestions: [],
        };
        // Bind here methods, or at least don't declare methods in the render method
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);

        let isEditMode = true;

        if (this.props.isNew === false) {
            if (this.props.role && this.props.role.find((e) => e === config.userPermissions.writeFollowUp) !== undefined) {
                let today = createDate(null);
                let itemDate = createDate(this.props.item.date);

                let todayDate = createDate(moment.utc([today.getFullYear(), today.getMonth(), today.getDate()])._d);
                let followUpDate = createDate(moment.utc([itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate()])._d);

                if (followUpDate > todayDate) {
                    console.log('follow-ups date < today => needitabil');
                    isEditMode = false
                }
            } else if (this.props.role && this.props.role.find((e) => e === config.userPermissions.writeFollowUp) === undefined && this.props.role.find((e) => e === config.userPermissions.readFollowUp) !== undefined) {

                isEditMode = false
            }
        }

        if (this.props.contactFollowUpTemplate) {
            let mappedAnswers = mapAnswers(this.props.contactFollowUpTemplate, this.state.item.questionnaireAnswers);
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
    }

    handleBackButtonClick() {
        // this.props.navigator.goBack(null);
        if (this.state.isModified === true) {
            Alert.alert("", 'You have unsaved data. Are you sure you want to leave this page and lose all changes?', [
                {
                    text: 'Yes', onPress: () => {
                        this.props.navigator.pop(
                            //     {
                            //     animated: true,
                            //     animationType: 'fade'
                            // }
                        )
                    }
                },
                {
                    text: 'Cancel', onPress: () => {
                        console.log("onPressCancelEdit No pressed - nothing changes")
                    }
                }
            ])
        } else {
            this.props.navigator.pop(
                //     {
                //     animated: true,
                //     animationType: 'fade'
                // }
            )
        }
        return true;
    }

    // Please add here the react lifecycle methods that you need
    componentDidUpdate(prevProps) {
        if (this.state.savePressed || this.state.deletePressed) {
            if (this.props.startLoadingScreen !== undefined) {
                this.props.startLoadingScreen();
            }
            this.props.navigator.pop(
                {
                    animated: true,
                    animationType: 'fade',
                }
            )
        }
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {

        if (this.props.errors && this.props.errors.type && this.props.errors.message) {
            Alert.alert(this.props.errors.type, this.props.errors.message, [
                {
                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                    onPress: () => {
                        this.setState({
                            savePressed: false
                        }, () => {
                            this.props.removeErrors();
                        });
                    }
                }
            ])
        }

        return (
            <ViewHOC style={style.container}
                showLoader={this && this.state && this.state.loading}
                loaderText={this.props && this.props.syncState ? 'Loading' : getTranslation(translations.loadingScreenMessages.loadingMsg, this.props.translation)}
            >
                <NavBarCustom
                    title={null}
                    customTitle={
                        <View
                            style={[style.breadcrumbContainer]}>
                            <Breadcrumb
                                entities={[getTranslation(this.props && this.props.previousScreen ? this.props.previousScreen : translations.followUpsSingleScreen.title, this.props.translation), ((this.state.contact && this.state.contact.firstName ? (this.state.contact.firstName + " ") : '') + (this.state.contact && this.state.contact.lastName ? this.state.contact.lastName : ''))]}
                                navigator={this.props.navigator}
                                onPress={this.handlePressBreadcrumb}
                            />
                            <View style={{ flexDirection: 'row', marginRight: calculateDimension(16, false, this.props.screenSize) }}>
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
                                {
                                    this.props.role && this.props.role.find((e) => e === config.userPermissions.writeFollowUp) !== undefined ? (
                                        <View>
                                            <Menu
                                                ref="menuRef"
                                                button={
                                                    <Ripple onPress={this.showMenu} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                                        <Icon name="more-vert" />
                                                    </Ripple>
                                                }
                                            >
                                                <MenuItem onPress={this.handleEditContact}>
                                                    {getTranslation(translations.followUpsSingleScreen.editContactButton, this.props.translation)}
                                                </MenuItem>
                                            </Menu>
                                        </View>
                                    ) : null
                                }
                            </View>
                        </View>
                    }
                    navigator={this.props.navigator}
                    iconName="menu"
                    handlePressNavbarButton={this.handlePressNavbarButton}
                />
                <TabView
                    navigationState={this.state}
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
        this.props.navigator.toggleDrawer({
            side: 'left',
            animated: true,
            to: 'open'
        })
    };

    handleOnIndexChange = (index) => {
        this.setState({ index });
    };

    handleRenderScene = ({ route }) => {

        switch (route.key) {
            case 'genInfo':
                return (
                    <FollowUpsSingleContainer
                        isNew={this.props.isNew}
                        isEditMode={this.state.isEditMode}
                        item={this.state.item}
                        contact={this.state.contact}
                        activeIndex={this.state.index}
                        onNext={this.handleNextPress}
                        onChangeText={this.onChangeText}
                        onChangeDate={this.onChangeDate}
                        onChangeSwitch={this.onChangeSwitch}
                        onChangeDropDown={this.onChangeDropDown}
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
                        isEditMode={this.state.isEditMode}
                        activeIndex={this.state.index}
                        onChangeTextAnswer={this.onChangeTextAnswer}
                        onChangeDateAnswer={this.onChangeDateAnswer}
                        onChangeSingleSelection={this.onChangeSingleSelection}
                        onChangeMultipleSelection={this.onChangeMultipleSelection}
                        onPressSave={this.handleOnPressSave}
                        onPressMissing={this.handleOnPressMissing}
                        onClickAddNewMultiFrequencyAnswer={this.onClickAddNewMultiFrequencyAnswer}
                        onChangeAnswerDate={this.onChangeAnswerDate}
                        savePreviousAnswers={this.savePreviousAnswers}
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
                    backgroundColor: styles.buttonGreen,
                    height: 2
                }}
                style={{
                    height: 41,
                    backgroundColor: 'white'
                }}
                renderLabel={this.handleRenderLabel(props)}
            />
        )
    };

    handleRenderLabel = (props) => ({ route, index }) => {
        const inputRange = props.navigationState.routes.map((x, i) => i);

        const outputRange = inputRange.map(
            inputIndex => (inputIndex === index ? styles.colorLabelActiveTab : styles.colorLabelInactiveTab)
        );
        const color = props.position.interpolate({
            inputRange,
            outputRange: outputRange,
        });

        return (
            <Animated.Text style={{
                fontFamily: 'Roboto-Medium',
                fontSize: 12,
                flex: 1,
                color: color,
                alignSelf: 'center'
            }}>
                {getTranslation(route.title, this.props.translation).toUpperCase()}
            </Animated.Text>
        );
    };

    handleNextPress = () => {
        // Before getting to the next screen, first do some checking of the required fields
        let checkRequiredFields = [];
        if (this.state.item.statusId === config.followUpStatuses.notPerformed || this.state.item.statusId === translations.generalLabels.noneLabel) {
            checkRequiredFields.push(getTranslation(_.get(config, 'followUpsSingleScreen.fields[1].label', 'Status'), this.props.translation));
        }

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

    //Breadcrumb click
    handlePressBreadcrumb = () => {
        if (this.state.isModified === true) {
            Alert.alert("", 'You have unsaved data. Are you sure you want to leave this page and lose all changes?', [
                {
                    text: 'Yes', onPress: () => {
                        this.props.navigator.pop()
                    }
                },
                {
                    text: 'Cancel', onPress: () => {
                        console.log("onPressCancelEdit No pressed - nothing changes")
                    }
                }
            ])
        } else {
            this.props.navigator.pop();
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
        console.log("onChangeDate: ", value, id);

        if (objectType === 'FollowUp') {
            this.setState(
                (prevState) => ({
                    item: Object.assign({}, prevState.item, { [id]: value }),
                    isModified: true
                })
                , () => {
                    console.log("onChangeDate", id, " ", value, " ", this.state.item);
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
            navigator.geolocation.getCurrentPosition((position) => {
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
        // console.log("onChangeDropDown: ", value, id, this.state.item);
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
        // console.log ('onChangeDateAnswer', value, id)
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
        // console.log ('onChangeMultipleSelection', selections, id)
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
    onChangeAnswerDate = (value, questionId, index) => {
        let questionnaireAnswers = _.cloneDeep(this.state.previousAnswers);
        if (questionnaireAnswers && questionnaireAnswers[questionId] && Array.isArray(questionnaireAnswers[questionId]) && questionnaireAnswers[questionId].length) {
            if (questionnaireAnswers[questionId][index] && questionnaireAnswers[questionId][index].date) {
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
        this.setState(prevState => ({
            item: Object.assign({}, prevState.item,
                {
                    updatedAt: now.toISOString(),
                    updatedBy: extractIdFromPouchId(this.props.user._id, 'user.json'),
                    questionnaireAnswers: reMapAnswers(_.cloneDeep(this.state.previousAnswers))
                }
            ),
            contact: Object.assign({}, prevState.contact, {
                updatedAt: now.toISOString(),
                updatedBy: extractIdFromPouchId(this.props.user._id, 'user.json')
            }),
            savePressed: true,
            isModified: false,
        }), () => {
            let followUpClone = _.cloneDeep(this.state.item);
            if (followUpClone.targeted !== false && followUpClone.targeted !== true) {
                followUpClone.targeted = false;
            }
            let contactClone = _.cloneDeep(this.state.contact);

            if (followUpClone.address && followUpClone.address.location) {
                delete followUpClone.address.location;
            }

            if (contactClone.followUps) {
                delete contactClone.followUps;
            }

            if (contactClone.relationships) {
                delete contactClone.relationships;
            }

            if (this.props.isNew) {
                followUpClone = updateRequiredFields(this.props.user.activeOutbreakId, this.props.user._id, Object.assign({}, followUpClone), action = 'create', 'followUp.json');
                console.log('followUpClone create', JSON.stringify(followUpClone));
                this.props.createFollowUp(this.props.user.activeOutbreakId, contactClone._id, followUpClone, contactClone, null, this.props.user.token, this.props.teams)
            } else {
                if (this.state.deletePressed === false) {
                    followUpClone = updateRequiredFields(this.props.user.activeOutbreakId, this.props.user._id, Object.assign({}, followUpClone), action = 'update');
                    console.log('followUpClone update', JSON.stringify(followUpClone))
                } else {
                    followUpClone = updateRequiredFields(this.props.user.activeOutbreakId, this.props.user._id, Object.assign({}, followUpClone), action = 'delete');
                    console.log('followUpClone delete', JSON.stringify(followUpClone))
                }
                this.props.updateFollowUpAndContact(this.props.user.activeOutbreakId, contactClone._id, followUpClone._id, followUpClone, contactClone, this.props.user.token, this.props.filter, this.props.teams);
            }
        });
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
        console.log('handleEditContact: ', JSON.stringify(this.state.contact));
        this.hideMenu();

        this.props.navigator.push({
            screen: 'ContactsSingleScreen',
            passProps: {
                contact: this.state.contact,
                handleUpdateContactFromFollowUp: this.handleUpdateContactFromFollowUp
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
        this.props.navigator.showModal({
            screen: 'HelpScreen',
            animated: true,
            passProps: {
                pageAskingHelpFrom: pageAskingHelpFrom
            }
        });
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
            this.props.navigator.dismissAllModals();
        })
    };
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    breadcrumbContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    }
});

function mapStateToProps(state) {
    return {
        teams: state.teams,
        user: state.user,
        screenSize: state.app.screenSize,
        followUps: state.followUps,
        contactFollowUpTemplate: state.outbreak.contactFollowUpTemplate,
        errors: state.errors,
        contacts: state.contacts,
        translation: state.app.translation,
        role: state.role
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        createFollowUp,
        updateFollowUpAndContact,
        deleteFollowUp,
        removeErrors
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(FollowUpsSingleScreen);