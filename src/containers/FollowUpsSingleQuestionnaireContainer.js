/**
 * Created by florinpopa on 25/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, { Component } from 'react';
import {
    View,
    StyleSheet,
    InteractionManager,
    Alert,
    ScrollView
} from 'react-native';
import { calculateDimension, extractAllQuestions, getTranslation, checkRequiredQuestions, createDate } from './../utils/functions';
import config from './../utils/config';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import styles from './../styles';
import QuestionCard from './../components/QuestionCard';
import Button from './../components/Button';
import { LoaderScreen } from 'react-native-ui-lib';
import { sortBy } from 'lodash';
import translations from './../utils/translations'
import cloneDeep from "lodash/cloneDeep";
import uniqueId from "lodash/uniqueId";
import _ from "lodash";
import TopContainerButtons from './../components/TopContainerButtons';

class FollowUpsSingleQuestionnaireContainer extends Component {

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
                <LoaderScreen overlay={true} backgroundColor={'white'} />
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
                    {/*{*/}
                        {/*this && this.props && this.props.isEditMode ? (*/}
                            {/*<View style={[style.containerButtons, { marginVertical: marginVertical, width: viewWidth }]}>*/}
                                {/*<Button*/}
                                    {/*title={getTranslation(translations.generalButtons.saveButtonLabel, this.props.translation)}*/}
                                    {/*onPress={() => {this.onPressSave(questions)}}*/}
                                    {/*color={styles.buttonGreen}*/}
                                    {/*titleColor={'white'}*/}
                                    {/*height={buttonHeight}*/}
                                    {/*width={buttonWidth}*/}
                                {/*/>*/}
                            {/*</View>) : (null)*/}
                    {/*}*/}
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
                    key={uniqueId('key_')}
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
        // this.scrollFollowUpsSingleQuestionnaire.props.scrollToPosition(0, 0, false)
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
        flex: 1,
        backgroundColor: styles.screenBackgroundGrey,
        alignItems: 'center'
    },
    container: {
        flex: 1,
        backgroundColor: styles.screenBackgroundGrey
    },
    contentContainerStyle: {
        alignItems: 'center'
    },
    containerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        questions: state.outbreak.contactFollowUpTemplate,
        translation: state.app.translation
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(FollowUpsSingleQuestionnaireContainer);
