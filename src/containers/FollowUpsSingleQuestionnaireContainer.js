/**
 * Created by florinpopa on 25/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {
    View,
    StyleSheet,
    InteractionManager,
    Alert,
    TouchableWithoutFeedback,
    Keyboard,
    findNodeHandle
} from 'react-native';
import {calculateDimension, extractAllQuestions, getTranslation, checkRequiredQuestions} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import styles from './../styles';
import QuestionCard from './../components/QuestionCard';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Button from './../components/Button';
import {LoaderScreen} from 'react-native-ui-lib';
import Section from './../components/Section';
import {sortBy} from 'lodash';
import translations from './../utils/translations'
import cloneDeep from "lodash/cloneDeep";

class FollowUpsSingleQuestionnaireContainer extends PureComponent {

    // This will be a container, so put as less business logic here as possible
    constructor(props) {
        super(props);
        this.state = {
            interactionComplete: false,
            questions: [],
            previousAnswers: this.props.previousAnswers
        };
    }

    // Please add here the react lifecycle methods that you need
    // shouldComponentUpdate(nextProps, nextState) {
    //     if (isEqual(nextProps.item, this.props.item)) {
    //         return false;
    //     }
    //     return true;
    // }

    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this.setState({
                interactionComplete: true,
            })
        })
    }

    // shouldComponentUpdate(nextProps, nextState) {
    //     if (nextProps.activeIndex === 1) {
    //         return true;
    //     }
    //     return false;
    // }

    static getDerivedStateFromProps(props, state) {
        // Get all additional questions recursively
        // let sortedQuestions = sortBy(props.questions, ['order', 'variable']);
        // sortedQuestions = extractAllQuestions(sortedQuestions, props.item);
        // state.questions = sortedQuestions;
        //
        // return null;
        if (props.previousAnswers) {
            state.previousAnswers = props.previousAnswers;
        }
        // Sort the answers by date
        if (state.previousAnswers && Object.keys(state.previousAnswers).length > 0) {
            for (let questionId in state.previousAnswers) {
                if (Array.isArray(state.previousAnswers[questionId]) && state.previousAnswers[questionId].length > 1) {
                    state.previousAnswers[questionId] = state.previousAnswers[questionId].sort((a, b) => {
                        if (new Date(a.date) > new Date(b.date)) {
                            return -1;
                        }
                        if (new Date(a.date) < new Date(b.date)) {
                            return 1;
                        }
                        return 0;
                    })
                }
            }
        }

        let sortedQuestions = sortBy(cloneDeep(props.questions), ['order', 'variable']);
        state.questions = extractAllQuestions(sortedQuestions, state.previousAnswers);
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        if(!this.state.interactionComplete) {
            return (
                <LoaderScreen overlay={true} backgroundColor={'white'}/>
            )
        }
        // console.log('FollowUpsSingleContainer render Questionnaire');

        // console.log("### FollowUpsSingleQuestionnaire: ", this.props.questions);
        let buttonHeight = calculateDimension(25, true, this.props.screenSize);
        let buttonWidth = calculateDimension(165.5, false, this.props.screenSize);
        let marginVertical = calculateDimension(12.5, true, this.props.screenSize);
        let viewWidth = calculateDimension(config.designScreenSize.width - 32, false, this.props.screenSize);

        return (
            <View style={{flex: 1}}>
                <View style={style.mainContainer}>
                    {
                        this && this.props && this.props.isEditMode ? (
                            <View style={[style.containerButtons, {marginVertical: marginVertical, width: viewWidth}]}>
                                <Button
                                    title={getTranslation(translations.generalButtons.saveButtonLabel, this.props.translation)}
                                    onPress={this.onPressSave}
                                    color={styles.buttonGreen}
                                    titleColor={'white'}
                                    height={buttonHeight}
                                    width={buttonWidth}
                                />
                            </View>) : (null)
                    }
                    <KeyboardAwareScrollView
                        style={style.container}
                        contentContainerStyle={[style.contentContainerStyle, {paddingBottom: this.props.screenSize.height < 600 ? 70 : 20}]}
                        keyboardShouldPersistTaps={'always'}
                        extraHeight={20 + 81 + 50 + 70}
                        innerRef={ref => {
                            this.scrollFollowUpsSingleQuestionnaire = ref
                        }}
                    >
                        {
                            this.state && this.state.questions && Array.isArray(this.state.questions) && this.state.questions.length > 0 && this.state.questions.map((item, index) => {
                                return this.handleRenderItem(item, index, this.state.questions.length);
                            })
                        }
                    </KeyboardAwareScrollView>
                </View>
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (item, index, totalNumberOfQuestions) => {
        if (item.inactive === false ) {
            return (
                <QuestionCard
                    item={item}
                    index={index + 1}
                    totalNumberOfQuestions={totalNumberOfQuestions}
                    source={this.props.previousAnswers}
                    isEditMode={this.props.isEditMode}
                    onChangeTextAnswer={this.props.onChangeTextAnswer}
                    onChangeDateAnswer={this.props.onChangeDateAnswer}
                    onChangeSingleSelection={this.props.onChangeSingleSelection}
                    onChangeMultipleSelection={this.props.onChangeMultipleSelection}
                    onFocus={this.handleOnFocus}
                    onClickAddNewMultiFrequencyAnswer={this.props.onClickAddNewMultiFrequencyAnswer}
                    onClickShowPreviousAnswers={this.props.onClickShowPreviousAnswers}
                    onBlur={this.handleOnBlur}
                />
            )
        }
    };

    onPressSave = () => {
        // First check if all the required questions are filled
        let checkRequiredFields = checkRequiredQuestions(this.state.questions, this.props.previousAnswers);
        checkRequiredFields = checkRequiredFields.map((e) => {return getTranslation(e, this.props.translation)});
        console.log("Check required questions: ", checkRequiredFields);
        if (checkRequiredFields && Array.isArray(checkRequiredFields) && checkRequiredFields.length === 0) {
            this.props.onPressSave();
        } else {
            Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), `${getTranslation(translations.alertMessages.requiredFieldsMissingError, this.props.translation)}.\n${getTranslation(translations.alertMessages.missingFields, this.props.translation)}: ${checkRequiredFields}`, [
                {
                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation), 
                    onPress: () => {console.log("OK pressed")}
                }
            ])
        }
    };

    // checkRequiredQuestions = (questions, previousAnswers) => {
    //     let requiredQuestions = [];
    //     for (let i = 0; i < questions.length; i++) {
    //         if (questions[i].required && questions[i].inactive === false) {
    //             if (!previousAnswers || !previousAnswers[questions[i].variable] || !Array.isArray(previousAnswers[questions[i].variable]) || previousAnswers[questions[i].variable].findIndex((e) => {
    //                 return !e.value || e.value === ''
    //             }) > -1) {
    //                 requiredQuestions.push(questions[i].text);
    //             }
    //         }
    //         if (questions[i].additionalQuestions && Array.isArray(questions[i].additionalQuestions) && questions[i].additionalQuestions.length > 0) {
    //             for (let j = 0; j < questions[i].additionalQuestions.length; j++) {
    //                 if (questions[i].additionalQuestions[j].required && previousAnswers[questions[i].variable].findIndex((e) => {
    //                     return e.subAnswers && e.subAnswers[questions[i].additionalQuestions[j].variable][0].value !== null && e.subAnswers[questions[i].additionalQuestions[j].variable][0].value !== ""
    //                 }) === -1) {
    //                     requiredQuestions.push(questions[i].additionalQuestions[j].text);
    //                 }
    //             }
    //         }
    //     }
    //     return requiredQuestions;
    // };

    handleOnFocus = (event) => {
        this.scrollToInput(findNodeHandle(event.target))
    };

    handleOnBlur = (event) =>{
        this.scrollFollowUpsSingleQuestionnaire.props.scrollToPosition(0, 0, false)
        this.scrollToInput(findNodeHandle(event.target))
    }

    scrollToInput (reactNode) {
        // Add a 'scroll' ref to your ScrollView
        this.scrollFollowUpsSingleQuestionnaire.props.scrollToFocusedInput(reactNode)
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
