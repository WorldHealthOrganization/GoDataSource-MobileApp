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
        // console.log('FollowUpsSingleContainer render Questionnaire');

        // console.log("### FollowUpsSingleQuestionnaire: ", this.props.questions);
        let buttonHeight = calculateDimension(25, true, this.props.screenSize);
        let buttonWidth = calculateDimension(165.5, false, this.props.screenSize);
        let marginVertical = calculateDimension(12.5, true, this.props.screenSize);
        let viewWidth = calculateDimension(config.designScreenSize.width - 32, false, this.props.screenSize);

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
        let questions = extractAllQuestions(sortedQuestions, previousAnswers);

        return (
            <View style={{ flex: 1 }}>
                <View style={style.mainContainer}>
                    {
                        this && this.props && this.props.isEditMode ? (
                            <View style={[style.containerButtons, { marginVertical: marginVertical, width: viewWidth }]}>
                                <Button
                                    title={getTranslation(translations.generalButtons.saveButtonLabel, this.props.translation)}
                                    onPress={() => {this.onPressSave(questions)}}
                                    color={styles.buttonGreen}
                                    titleColor={'white'}
                                    height={buttonHeight}
                                    width={buttonWidth}
                                />
                            </View>) : (null)
                    }
                    <ScrollView
                        style={style.containerScrollView}
                        contentContainerStyle={[style.contentContainerStyle, { paddingBottom: this.props.screenSize.height < 600 ? 70 : 20 }]}
                    >
                        {
                            questions && Array.isArray(questions) && questions.length > 0 && questions.map((item, index) => {
                                return this.handleRenderItem(item, index, questions.length);
                            })
                        }
                    </ScrollView>
                </View>
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (item, index, totalNumberOfQuestions) => {
        if (item.inactive === false) {
            return (
                <QuestionCard
                    key={item.variable}
                    item={item}
                    index={index + 1}
                    isCollapsed={ this.isCollapsed(item)}
                    totalNumberOfQuestions={totalNumberOfQuestions}
                    source={this.props.previousAnswers}
                    isEditMode={this.props.isEditMode}
                    onCollapse={ this.collapseQuestion}
                    onChangeTextAnswer={this.props.onChangeTextAnswer}
                    onChangeDateAnswer={this.props.onChangeDateAnswer}
                    onChangeSingleSelection={this.props.onChangeSingleSelection}
                    onChangeMultipleSelection={this.props.onChangeMultipleSelection}
                    onFocus={this.handleOnFocus}
                    onClickAddNewMultiFrequencyAnswer={this.props.onClickAddNewMultiFrequencyAnswer}
                    onClickShowPreviousAnswers={this.props.onClickShowPreviousAnswers}
                    onBlur={this.handleOnBlur}
                    onChangeAnswerDate={this.props.onChangeAnswerDate}
                    savePreviousAnswers={this.props.savePreviousAnswers}
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
            this.props.onPressSave();
        } else {
            Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), `${getTranslation(translations.alertMessages.requiredFieldsMissingError, this.props.translation)}.\n${getTranslation(translations.alertMessages.missingFields, this.props.translation)}: ${checkRequiredFields}`, [
                {
                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                    onPress: () => { console.log("OK pressed") }
                }
            ])
        }
    };

    handleOnFocus = (event) => {
        // this.scrollToInput(findNodeHandle(event.target))
    };

    handleOnBlur = (event) => {
        // this.scrollFollowUpsSingleQuestionnaire.props.scrollToPosition(0, 0, false)
        // this.scrollToInput(findNodeHandle(event.target))
    };

    scrollToInput(reactNode) {
        // Add a 'scroll' ref to your ScrollView
        // this.scrollFollowUpsSingleQuestionnaire.props.scrollToFocusedInput(reactNode)
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

    collapseQuestion = (item) => {
        let collapsedQuestions = this.state.collapsedQuestions;
        if( this.isCollapsed(item)){
            if(collapsedQuestions.length === 1){
                collapsedQuestions = [];
            } else {
                collapsedQuestions = collapsedQuestions.filter( (question) => {
                    if( question.order !== item.order && question.text !== item.text)
                        return item;
                });
            }
        } else {
            collapsedQuestions.push(item);
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
