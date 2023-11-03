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
import LabResultsSingleContainer from './../containers/LabResultsSingleContainer';
import LabResultsSingleQuestionnaireContainer from './../containers/LabResultsSingleQuestionnaireContainer';
import Breadcrumb from './../components/Breadcrumb';
import Menu, {MenuItem} from 'react-native-material-menu';
import Ripple from 'react-native-material-ripple';
import {updateLabResultAndContact} from './../actions/labResults';
import _, {cloneDeep, sortBy} from 'lodash';
import {
    calculateDimension,
    createDate, createStackFromComponent,
    getTranslation,
    mapAnswers,
    reMapAnswers,
    updateRequiredFields
} from './../utils/functions';
import translations from './../utils/translations'
import ElevatedView from 'react-native-elevated-view';
import ViewHOC from './../components/ViewHOC';
import PermissionComponent from './../components/PermissionComponent';
import moment from 'moment/min/moment.min';
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

class LabResultsSingleScreen extends Component {

    constructor(props) {
        super(props);


        this.preparedFields = prepareFieldsAndRoutes(this.props.outbreak, 'lab-results', config.labResultsSingleScreen);

        this.state = {
            routes: config.tabsValuesRoutes.labResultsSingle,
            index: 0,
            item: this.props.item || {},
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

        // Using old permission system
        // if (this.props.isNew === false) {
        //     if (this.props.role && this.props.role.find((e) => e === config.userPermissions.writeLabResult) !== undefined) {
        //         // let today = createDate(null);
        //         // let itemDate = createDate(this.props.item.date);
        //         //
        //         // let todayDate = createDate(moment.utc([today.getFullYear(), today.getMonth(), today.getDate()])._d);
        //         // let labResultDate = createDate(moment.utc([itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate()])._d);
        //         //
        //         // if (labResultDate > todayDate) {
        //         //     isEditMode = false
        //         // }
        //     } else if (this.props.role && this.props.role.find((e) => e === config.userPermissions.writeLabResult) === undefined && this.props.role.find((e) => e === config.userPermissions.readLabResult) !== undefined) {
        //
        //         isEditMode = false
        //     }
        // }

        console.log("Sequence?", this.state?.item?.sequence);
        if (this.props.questions) {
            let mappedAnswers = mapAnswers(this.props.questions, this.state?.item?.questionnaireAnswers);
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
        this.navigationListener.remove();
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
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
            const resultField = this.preparedFields.generalInfo[0].fields.find(x=>x.id === 'result');
            if (resultField.isRequired !== false) {
                if (_.get(this.state.item,'status',null) === 'LNG_REFERENCE_DATA_CATEGORY_LAB_TEST_RESULT_STATUS_COMPLETED') {
                    if (resultField.isRequired !== true){
                        resultField.isRequired = true;
                    }
                } else if (resultField.isRequired !== undefined) {
                    resultField.isRequired = undefined;
                }
            }
        return (
            <ViewHOC style={style.container}
                     showLoader={this && this.state && this.state.loading}
                     loaderText={this.props && this.props.syncState ? 'Loading' : getTranslation(translations.loadingScreenMessages.loadingMsg, this.props.translation)}
            >
                <NavBarCustom
                    title={null}
                    customTitle={
                        <View style={style.headerContainer}>
                            <View style={[style.breadcrumbContainer]}>
                                <Breadcrumb
                                    entities={[getTranslation(this.props && this.props.previousScreen ? this.props.previousScreen : translations.labResultsSingleScreen.title, this.props.translation), getTranslation(this.props.isNew ? translations.labResultsSingleScreen.createLabResult : `${this.props.contact.firstName || ''} ${this.props.contact.lastName || ''}`, this.props.translation)]}
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
                                !this.props.isNew && checkArrayAndLength(_.intersection(
                                    _.get(this.props, 'role', []),
                                    [
                                        constants.PERMISSIONS_LAB_RESULT.labResultAll,
                                        constants.PERMISSIONS_LAB_RESULT.labResultDelete
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
                                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                                    <Icon name="more-vert" color={styles.textColor} size={24} />
                                                </Ripple>
                                            }
                                            style={{top: 36}}
                                        >
                                            <PermissionComponent
                                                render={() => (
                                                    <MenuItem onPress={this.handleOnPressDelete}>
                                                        {getTranslation(translations.labResultsSingleScreen.deleteLabResult, this.props.translation)}
                                                    </MenuItem>
                                                )}
                                                permissionsList={[
                                                    constants.PERMISSIONS_LAB_RESULT.labResultAll,
                                                    constants.PERMISSIONS_LAB_RESULT.labResultDelete
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
                    navigationState={{index: this.state.index, routes:this.state.routes}}
                    onIndexChange={this.handleOnIndexChange}
                    animationEnabled={Platform.OS === 'ios'}
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
                    <LabResultsSingleContainer
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
                    <LabResultsSingleQuestionnaireContainer
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
                    <LabResultsSingleContainer
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
        if (this.state.item?.deleted){
            return [];
        }
        let checkRequiredFields = [];
        for (let i = 0; i < this.preparedFields.generalInfo.length; i++ ){
            for (let j = 0; j < this.preparedFields.generalInfo[i].fields.length; j++ ){
                const field = this.preparedFields.generalInfo[i].fields[j];
                if (field.isRequired && !_.get(this.state.item,field.id, null) &&
                    !(field.dependsOn && _.get(this.state.item,field.dependsOn,false) !== field.dependsOnValue)
                ){
                    checkRequiredFields.push(getTranslation(field.label,this.props.translation));
                }
            }
        }

        return checkRequiredFields;
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
            this.setState(
                (prevState) => ({
                    item: Object.assign({}, _.set(prevState.item || {}, id, value)),
                    isModified: true
                }), () => {
                    console.log("onChangeText", id, " ", value, " ", this.state.item);
                }
            )
    };
    onChangeDate = (value, id, objectType) => {
            this.setState(
                (prevState) => ({
                    item: Object.assign({},_.set(prevState.item || {},id,value ? new Date(value).toISOString() : null)),
                    isModified: true
                })
                , () => {
                    console.log("onChangeDate", id, value, this.state.item);
                }
            )
    };
    onChangeSwitch = (value, id, objectType) => {
        // console.log("onChangeSwitch: ", value, id, this.state.item);
                this.setState(
                    (prevState) => ({
                        item: Object.assign({}, _.set(prevState.item || {},id,value)),
                        isModified: true
                    }), () => {
                        console.log("onChangeSwitch", id, " ", value, " ", this.state.item);
                    }
                )

    };
    onChangeDropDown = (value, id, objectType) => {
        console.log("onChangeDropDown: ", value, id, objectType);
                this.setState(
                    (prevState) => ({
                        item: Object.assign({}, _.set(prevState.item || {},id,value && value.value !== undefined ? value.value : value)),
                        isModified: true
                    }), () => {
                        console.log("onChangeDropDown", id, " ", value, " ", this.state.item);
                    }
                )
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
        // Mark labResult as performed, and then update to the server
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
                        let labResultClone = _.cloneDeep(this.state.item);
                        if (labResultClone.targeted !== false && labResultClone.targeted !== true) {
                            labResultClone.targeted = false;
                        }
                        if(labResultClone.sequence){
                            if(labResultClone.sequence.hasSequence){
                                delete labResultClone.sequence.noSequenceReason;
                            } else {
                                delete labResultClone.sequence.dateSampleSent;
                                delete labResultClone.sequence.labId;
                                delete labResultClone.sequence.dateResult;
                                delete labResultClone.sequence.resultId;
                            }
                        }
                        console.log("Before save delete sequence", labResultClone);

                        if (this.props.isNew) {
                            labResultClone.personType = this.props.personType;
                            labResultClone.personId = this.props.personId;
                            labResultClone.outbreakId = this.props.outbreak?._id;
                            labResultClone = updateRequiredFields(this.props.outbreak._id, this.props.user._id, Object.assign({}, labResultClone),  'create', 'labResult');
                            // console.log('labResultClone create', JSON.stringify(labResultClone))
                            console.log("Full clone New", labResultClone)
                            updateLabResultAndContact(labResultClone)
                                .then((responseCreateLabResult) => {
                                    console.log("The response from update lab result", responseCreateLabResult);
                                    // this.props.refresh();
                                    Navigation.setStackRoot(this.props.componentId,
                                        {
                                            component:{
                                                name: this.props.personType === translations.personTypes.cases ? 'CasesScreen' : 'ContactsScreen',
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
                                .catch((errorCreateLabResult) => {
                                    console.log("Error create lab result",errorCreateLabResult);
                                })
                        } else {
                            if (this.state.deletePressed === false) {
                                labResultClone = updateRequiredFields(this.props.outbreak._id, this.props.user._id, Object.assign({}, labResultClone), action = 'update');
                                // console.log('labResultClone update', JSON.stringify(labResultClone))
                            } else {
                                labResultClone = updateRequiredFields(this.props.outbreak._id, this.props.user._id, Object.assign({}, labResultClone), action = 'delete');
                                // console.log('labResultClone delete', JSON.stringify(labResultClone))
                            }
                            updateLabResultAndContact(labResultClone)
                                .then((responseUpdateLabResult) => {
                                    this.props.refresh();
                                    Navigation.pop(this.props.componentId)
                                })
                                .catch((errorUpdateLabResult) => {
                                    console.log(errorUpdateLabResult);
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
        if (this.state.item.deleted){
            return true;
        }
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
            item: Object.assign({}, prevState.item, { statusId: config.labResultStatuses.missed })
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
                    handleUpdateContactFromLabResult: this.handleUpdateContactFromLabResult,
                    refresh: this.props.refresh
                }
            }
        })
    };

    handleUpdateContactFromLabResult = (updatedContact) => {
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
        Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.labResultsSingleScreen.deleteAlertMessage, this.props.translation), [
            {
                text: getTranslation(translations.alertMessages.yesButtonLabel, this.props.translation),
                onPress: () => {
                    this.hideMenu();
                    this.setState({
                        deletePressed: true
                    }, () => {
                        // console.log("### existing filters: ", this.props.filter);
                        // this.props.deleteLabResult(this.props.outbreak.id, this.state.contact.id, this.state.item.id, this.props.filter, this.props.user.token);
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
            pageAskingHelpFrom = 'labResultsSingleScreenAdd'
        } else {
            if (this.state.isEditMode === true) {
                pageAskingHelpFrom = 'labResultsSingleScreenEdit'
            } else if (this.state.isEditMode === false) {
                pageAskingHelpFrom = 'labResultsSingleScreenView'
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
        questions: _.get(state, 'outbreak.labResultsTemplate', null),
        translation: _.get(state, 'app.translation', []),
        role: _.get(state, 'role', [])
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
)(LabResultsSingleScreen);