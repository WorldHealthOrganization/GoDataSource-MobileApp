/**
 * Created by mobileclarisoft on 10/09/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {createDate, extractAllQuestions} from '../utils/functions';
import {connect} from "react-redux";
import styles from '../styles';
import QuestionCard from '../components/QuestionCard';
import sortBy from 'lodash/sortBy';
import cloneDeep from 'lodash/cloneDeep';
import uniqueId from 'lodash/uniqueId';
import get from 'lodash/get';
import TopContainerButtons from "../components/TopContainerButtons";
import PermissionComponent from './../components/PermissionComponent';
import constants, {
    PERMISSION_CREATE_CONTACT,
    PERMISSION_CREATE_CONTACT_OF_CONTACT, PERMISSION_EDIT_CONTACT,
    PERMISSION_EDIT_CONTACT_OF_CONTACT
} from "./../utils/constants";
import config from "./../utils/config";
import translations from "../utils/translations";

class ContactsSingleQuestionnaire extends Component {

    // This will be a container, so put as less business logic here as possible
    constructor(props) {
        super(props);
        this.state = {
            previousAnswers: this.props.previousAnswers,
            collapsedQuestions: [],
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.isEditMode !== this.props.isEditMode || (nextProps.routeKey === 'investigation')) {
            return true;
        }
        return false;
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        let permissionsList = [];
        if (this.props.isNew) {
            permissionsList = this.props.type === translations.personTypes.contactsOfContacts ? PERMISSION_CREATE_CONTACT_OF_CONTACT : PERMISSION_CREATE_CONTACT;
        } else {
            permissionsList = this.props.type === translations.personTypes.contactsOfContacts ? PERMISSION_EDIT_CONTACT_OF_CONTACT : PERMISSION_EDIT_CONTACT;
        }
        // Get all additional questions recursively
        // Logic moved from the getDerivedStateFromProps
        let previousAnswers = {};
        if (this.props.previousAnswers) {
            previousAnswers = Object.assign({}, this.props.previousAnswers);
        }
        if (previousAnswers && Object.keys(previousAnswers).length > 0) {
            for (let questionId in previousAnswers) {
                if (previousAnswers.hasOwnProperty(questionId)) {
                    if (Array.isArray(previousAnswers[questionId]) && previousAnswers[questionId].length > 1) {
                        previousAnswers[questionId] = previousAnswers[questionId].sort((a, b) => {
                            if (createDate(a.date) > createDate(b.date)) {
                                return -1;
                            }
                            if (createDate(a.date) < createDate(b.date)) {
                                return 1;
                            }
                            return 0;
                        })
                    }
                }
            }
        }
        let sortedQuestions = sortBy(cloneDeep(this.props.questions), ['order', 'variable']);
        sortedQuestions = extractAllQuestions(sortedQuestions, previousAnswers, 0);
        return (
            <View style={{ flex: 1 }}>
                <View style={style.container}>
                    <PermissionComponent
                        render={() => (
                            <TopContainerButtons
                                isNew={this.props.isNew}
                                isEditMode={this.props.isEditMode}
                                index={this.props.index}
                                numberOfTabs={this.props.numberOfTabs}
                                onPressEdit={this.props.onPressEdit}
                                onPressSaveEdit={this.props.isNew ? this.props.onPressSave : this.props.onPressSaveEdit}
                                onPressCancelEdit={this.props.onPressCancelEdit}
                                onPressNextButton={this.props.handleNextButton}
                                onPressPreviousButton={this.handleBackButton}
                            />
                        )}
                        permissionsList={permissionsList}
                    />
                    <ScrollView
                        style={style.containerScrollView}
                        contentContainerStyle={[style.contentContainerStyle, { paddingBottom: this.props.screenSize.height < 600 ? 70 : 20 }]}
                    >
                        {
                            sortedQuestions.map((item, index) => {
                                return this.handleRenderItem(previousAnswers, item, index, sortedQuestions)
                            })
                        }
                    </ScrollView>
                </View>
            </View >
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (previousAnswers, item, index, totalQuestions) => {
        let totalNumberOfQuestions = totalQuestions.length;
        if (item.inactive === false) {
            return (
                <QuestionCard
                    key={index}
                    item={item}
                    isEditMode={this.props.isEditMode}
                    index={index + 1}
                    isCollapsed={ this.isCollapsed(item)}
                    totalQuestions={totalQuestions}
                    totalNumberOfQuestions={totalNumberOfQuestions}
                    source={previousAnswers}
                    onCollapse={ this.collapseQuestion}
                    onChangeTextAnswer={this.props.onChangeTextAnswer}
                    onChangeSingleSelection={this.props.onChangeSingleSelection}
                    onChangeMultipleSelection={this.props.onChangeMultipleSelection}
                    onChangeDateAnswer={this.props.onChangeDateAnswer}
                    onFocus={this.handleOnFocus}
                    onClickAddNewMultiFrequencyAnswer={this.props.onClickAddNewMultiFrequencyAnswer}
                    onBlur={this.handleOnBlur}
                    onChangeAnswerDate={this.props.onChangeAnswerDate}
                    savePreviousAnswers={this.props.savePreviousAnswers}
                    copyAnswerDate={this.props.copyAnswerDate}
                    editableQuestionDate={true}
                />
            )
        }
    };

    handleBackButton = () => {
        this.props.handleMoveToPrevieousScreenButton()
    };

    handleOnFocus = (event) => {
        // this.scrollToInput(findNodeHandle(event.target))
    };

    handleOnBlur = (event) => {
        // this.scrollCasesSingleInvestigation.props.scrollToPosition(0, 0, false)
        // this.scrollToInput(findNodeHandle(event.target))
    };

    isCollapsed = (item) => {
        let isCollapsed = false;
        let collapsedQuestions = this.state.collapsedQuestions;
        if( collapsedQuestions.length > 0) {
            collapsedQuestions.map((question) => {
                if (question.order === item.order && question.text === item.text)
                    isCollapsed = true;
            });
        }
        return isCollapsed;
    };

    collapseQuestion = (item, shouldOpen) => {
        let collapsedQuestions = this.state.collapsedQuestions;
        if(shouldOpen !== undefined){
            if (!this.isCollapsed(item) && shouldOpen) {
                collapsedQuestions.push(item);
            }
        }else {
            if (this.isCollapsed(item)) {
                if (collapsedQuestions.length === 1) {
                    collapsedQuestions = [];
                } else {
                    collapsedQuestions = collapsedQuestions.filter((question) => {
                        if (question.order !== item.order && question.text !== item.text)
                            return item;
                    });
                }
            } else {
                collapsedQuestions.push(item);
            }
        }
        this.setState({ collapsedQuestions: collapsedQuestions});
    };
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: styles.screenBackgroundColor,
        alignItems: 'center',
    },
    cardStyle: {
        marginVertical: 4,
        flex: 1
    },
    containerScrollView: {
        flex: 1,
        backgroundColor: styles.screenBackgroundColor
    },
    contentContainerStyle: {
        alignItems: 'center'
    },
});

function mapStateToProps(state) {
    return {
        screenSize: get(state, 'app.screenSize', config.designScreenSize),
        questions: get(state, 'outbreak.contactInvestigationTemplate', null),
        translation: get(state, 'app.translation', []),
        role: get(state, 'role', [])
    };
}

export default connect(mapStateToProps)(ContactsSingleQuestionnaire);
