/**
 * Created by florinpopa on 25/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {Alert, InteractionManager, ScrollView, StyleSheet, View} from 'react-native';
import {checkRequiredQuestions, createDate, extractAllQuestions, getTranslation} from './../utils/functions';
import {connect} from "react-redux";
import QuestionCard from './../components/QuestionCard';
import {LoaderScreen} from 'react-native-ui-lib';
import _, {sortBy} from 'lodash';
import translations from './../utils/translations';
import constants from './../utils/constants';
import config from './../utils/config';
import cloneDeep from "lodash/cloneDeep";
import uniqueId from "lodash/uniqueId";
import TopContainerButtons from './../components/TopContainerButtons';
import PermissionComponent from './../components/PermissionComponent';
import styles from './../styles';

class LabResultsSingleQuestionnaireContainer extends Component {

    // This will be a container, so put as less business logic here as possible
    constructor(props) {
        super(props);
        this.state = {
            interactionComplete: false,
            questions: [],
            previousAnswers: this.props.previousAnswers,
            collapsedQuestions: [],
        };
    }

    // Please add here the react lifecycle methods that you need
    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this.setState({
                interactionComplete: true,
            })
        })
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        if (!this.state.interactionComplete) {
            return (
                <LoaderScreen overlay={true} backgroundColor={styles.backgroundColor} />
            )
        }

        // Logic moved from the getDerivedStateFromProps
        let previousAnswers = {};
        if (this.props.previousAnswers) {
            previousAnswers = Object.assign({}, this.props.previousAnswers);
        }

        if (previousAnswers && Object.keys(previousAnswers).length > 0) {
            for (let questionId in previousAnswers) {
                if(previousAnswers.hasOwnProperty(questionId)) {
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
        let questions = extractAllQuestions(sortedQuestions, previousAnswers, 0);

        return (
            <View style={{ flex: 1 }}>
                <View style={style.mainContainer}>
                    <PermissionComponent
                        render={() => (
                            <TopContainerButtons
                                isNew={this.props.isNew}
                                isEditMode={this.props.isEditMode}
                                index={this.props.activeIndex}
                                numberOfTabs={this.props.numberOfTabs}
                                onPressEdit={this.props.onPressEdit}
                                onPressSaveEdit={this.props.onPressSaveEdit}
                                onPressCancelEdit={this.props.onPressCancelEdit}
                                onPressNextButton={this.props.handleNextButton}
                                onPressPreviousButton={this.props.onPressPreviousButton}
                            />
                        )}
                        permissionsList={[
                            constants.PERMISSIONS_LAB_RESULT.labResultAll,
                            constants.PERMISSIONS_LAB_RESULT.labResultCreate,
                            constants.PERMISSIONS_LAB_RESULT.labResultModify
                        ]}
                    />
                    <ScrollView
                        style={style.containerScrollView}
                        contentContainerStyle={[style.contentContainerStyle, { paddingBottom: this.props.screenSize.height < 600 ? 70 : 20 }]}
                    >
                        {
                            questions && Array.isArray(questions) && questions.length > 0 && questions.map((item, index) => {
                                return this.handleRenderItem(previousAnswers, item, index, questions);
                            })
                        }
                    </ScrollView>
                </View>
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (previousAnswers, item, index, totalQuestions) => {
        const totalNumberOfQuestions = totalQuestions.length;
        if (item.inactive === false) {
            return (
                <QuestionCard
                    key={index}
                    item={item}
                    index={index + 1}
                    isCollapsed={ this.isCollapsed(item)}
                    totalNumberOfQuestions={totalNumberOfQuestions}
                    source={previousAnswers}
                    totalQuestions={totalQuestions}
                    isEditMode={this.props.isEditMode}
                    onCollapse={ this.collapseQuestion}
                    onChangeTextAnswer={this.props.onChangeTextAnswer}
                    onChangeDateAnswer={this.props.onChangeDateAnswer}
                    onChangeSingleSelection={this.props.onChangeSingleSelection}
                    onChangeMultipleSelection={this.props.onChangeMultipleSelection}
                    onFocus={this.handleOnFocus}
                    onClickAddNewMultiFrequencyAnswer={this.props.onClickAddNewMultiFrequencyAnswer}
                    onBlur={this.handleOnBlur}
                    onChangeAnswerDate={this.props.onChangeAnswerDate}
                    savePreviousAnswers={this.props.savePreviousAnswers}
                    editableQuestionDate={true}
                    copyAnswerDate={this.props.copyAnswerDate}
                />
            )
        }
    };

    onPressSave = (questions) => {
        // First check if all the required questions are filled
        let checkRequiredFields = checkRequiredQuestions(questions, this.props.previousAnswers);
        checkRequiredFields = checkRequiredFields.map((e) => { return getTranslation(e, this.props.translation) });
        console.log("Check required questions: ", checkRequiredFields);
        if (checkRequiredFields && Array.isArray(checkRequiredFields) && checkRequiredFields.length === 0) {
            if( this.checkAnswerDatesQuestionnaire()){
                this.props.onPressSave();
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
    };

    checkAnswerDatesQuestionnaire = () => {
        let previousAnswersClone = _.cloneDeep(this.props.previousAnswers);
        let sortedQuestions = sortBy(cloneDeep(this.props.questions), ['order', 'variable']);
        sortedQuestions = extractAllQuestions(sortedQuestions, this.props.previousAnswers, 0);
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

    handleOnFocus = (event) => {
        // this.scrollToInput(findNodeHandle(event.target))
    };

    handleOnBlur = (event) => {
        // this.scrollLabResultsSingleQuestionnaire.props.scrollToPosition(0, 0, false)
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
    mainContainer: {
        alignItems: 'center',
        backgroundColor: styles.screenBackgroundColor,
        flex: 1
    },
    container: {
        backgroundColor: styles.screenBackgroundColor,
        flex: 1
    },
    contentContainerStyle: {
        alignItems: 'center'
    },
    containerButtons: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center'
    }
});

function mapStateToProps(state){
    return {
        screenSize: _.get(state, 'app.screenSize', config.designScreenSize),
        questions: _.get(state, 'outbreak.labResultsTemplate', null),
        translation: _.get(state, 'app.translation', [])
    };
}

export default connect(mapStateToProps)(LabResultsSingleQuestionnaireContainer);
