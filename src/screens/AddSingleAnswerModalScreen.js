/**
 * Created by florinpopa on 13/08/2018.
 */
/**
 * Created by florinpopa on 05/07/2018.
 */
import React, { Component } from 'react';
import { View, StyleSheet, findNodeHandle, Alert, ScrollView } from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import Button from './../components/Button';
import styles from './../styles';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import ElevatedView from 'react-native-elevated-view';
import { calculateDimension, getTranslation } from './../utils/functions';
import config from './../utils/config';
import Section from './../components/Section';
import { Dialog } from 'react-native-ui-lib';
import translations from './../utils/translations';
import QuestionCard from './../components/QuestionCard';
import _, { sortBy } from "lodash";
import { extractAllQuestions } from './../utils/functions';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { checkRequiredQuestions } from './../utils/functions';

class AddSingleAnswerModalScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            currentAnswers: null,
            item: null
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.item && this.props.item !== prevProps.item) {
            if (typeof this.props.currentAnswers === 'object' && Object.keys(this.props.currentAnswers).length === 0) {
                this.props.currentAnswers[this.props.item.variable] = [{
                    date: new Date(),
                    value: ''
                }]
            }
            let sortedQuestions = sortBy([this.props.item], ['order', 'variable']);
            sortedQuestions = extractAllQuestions(sortedQuestions, this.props.currentAnswers);
            this.setState({
                item: sortedQuestions[0]
            });
        }
    }

    // static getDerivedStateFromProps(props, state) {
    //     if (props.item) {
    //         if (typeof props.currentAnswers === 'object' && Object.keys(props.currentAnswers).length === 0) {
    //             props.currentAnswers[props.item.variable] = [{
    //                 date: new Date(),
    //                 value: ''
    //             }]
    //         }
    //         let sortedQuestions = sortBy([props.item], ['order', 'variable']);
    //         sortedQuestions = extractAllQuestions(sortedQuestions, props.currentAnswers);
    //         state.item = sortedQuestions[0];
    //     }
    //     return null;
    // }

    render() {
        let contentWidth = calculateDimension(350, false, this.props.screenSize);
        let marginHorizontal = calculateDimension(14, false, this.props.screenSize);
        let height = calculateDimension(450, true, this.props.screenSize);

        return (
            <Dialog
                visible={this.props.showAddSingleAnswerModalScreen}
                width={contentWidth}
                height={height}
                onDismiss={this.onCancelPressed}
            >
                <ElevatedView
                    elevation={3}
                    style={{
                        flex: 1,
                        backgroundColor: 'white',
                        borderRadius: 4,
                        marginVertical: 10,
                    }}>
                    <View style={{ flex: 0.1 }}>
                        <Section
                            label={getTranslation(translations.addSingleAnswerModalScreen.addNewAnswer, this.props.translation)}
                            hasBorderBottom={false}
                            containerStyle={{ width: '100%', flex: 1 }}
                            translation={this.props.translation}
                        />
                    </View>
                    {/* <KeyboardAwareScrollView
                        style={style.containerScrollView}
                        contentContainerStyle={[style.contentContainerStyle, { paddingBottom: this.props.screenSize.height < 600 ? 70 : 20 }]}
                        keyboardShouldPersistTaps={'always'}
                        extraHeight={20 + 81 + 50 + 70}
                        innerRef={ref => {
                            this.scrollAddSingleAnswerModal = ref
                        }}
                    > */}
                    <ScrollView
                        style={style.containerScrollView}
                        contentContainerStyle={[style.contentContainerStyle, { paddingBottom: this.props.screenSize.height < 600 ? 70 : 20 }]}
                    >
                        <View style={{ flex: 0.8, alignItems: 'center', justifyContent: 'center' }}>
                            {
                                this.state.item && this.props.currentAnswers ? (
                                    <QuestionCard
                                        item={this.state.item}
                                        isEditMode={true}
                                        index={1}
                                        totalNumberOfQuestions={1}
                                        source={this.props.currentAnswers}
                                        onChangeTextAnswer={this.onChangeTextAnswer}
                                        onChangeSingleSelection={this.onChangeSingleSelection}
                                        onChangeMultipleSelection={this.onChangeMultipleSelection}
                                        onChangeDateAnswer={this.onChangeDateAnswer}
                                        onFocus={this.handleOnFocus}
                                        hideButtons={true}
                                        onChangeAnswerDate={this.onChangeAnswerDate}
                                        editableQuestionDate={true}
                                    />
                                ) : (null)
                            }
                        </View>
                    </ScrollView>
                    {/* </KeyboardAwareScrollView> */}
                    <View style={{
                        flex: 0.1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-evenly'
                    }}>
                        <Button
                            title={getTranslation(translations.generalButtons.cancelButtonLabel, this.props.translation)}
                            color="white"
                            titleColor={"black"}
                            onPress={this.onCancelPressed}
                            height={25}
                            width="40%"
                        />
                        <Button
                            title={getTranslation(translations.generalButtons.saveButtonLabel, this.props.translation)}
                            color={styles.buttonGreen}
                            titleColor={'white'}
                            onPress={this.onSavePressed}
                            height={25}
                            width="40%"
                        />
                    </View>
                </ElevatedView>
            </Dialog >
        );
    }

    onChangeTextAnswer = (value, id, parentId) => {
        let questionnaireAnswers = _.cloneDeep(this.props.currentAnswers);

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
            questionnaireAnswers[id][0] = value;
        }
        // console.log('onChangeMultipleSelection after setState', questionnaireAnswers);
        this.props.updateCurrentAnswers(questionnaireAnswers);
    };

    onChangeSingleSelection = (value, id, parentId) => {
        let questionnaireAnswers = _.cloneDeep(this.props.currentAnswers);

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
            questionnaireAnswers[id][0] = value;
        }
        // console.log('onChangeMultipleSelection after setState', questionnaireAnswers);
        this.props.updateCurrentAnswers(questionnaireAnswers);
    };

    onChangeMultipleSelection = (value, id, parentId) => {
        let questionnaireAnswers = _.cloneDeep(this.props.currentAnswers);

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
            questionnaireAnswers[id][0] = value;
        }
        // console.log('onChangeMultipleSelection after setState', questionnaireAnswers);
        this.props.updateCurrentAnswers(questionnaireAnswers);
    };

    onChangeDateAnswer = (value, id, parentId) => {
        let questionnaireAnswers = _.cloneDeep(this.props.currentAnswers);

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
            questionnaireAnswers[id][0] = value;
        }
        // console.log('onChangeDateAnswer after setState', questionnaireAnswers);
        this.props.updateCurrentAnswers(questionnaireAnswers);
    };

    onChangeAnswerDate = (value, questionId) => {
        let questionnaireAnswers = _.cloneDeep(this.props.currentAnswers);
        if (questionnaireAnswers && questionnaireAnswers[questionId] && Array.isArray(questionnaireAnswers[questionId]) && questionnaireAnswers[questionId].length) {
            if (questionnaireAnswers[questionId][0] && questionnaireAnswers[questionId][0].date) {
                questionnaireAnswers[questionId][0].date = value;
                if (questionnaireAnswers[questionId][0].subAnswers && typeof questionnaireAnswers[questionId][0].subAnswers === "object" && Object.keys(questionnaireAnswers[questionId][0].subAnswers).length > 0) {
                    for (let subQuestionId in questionnaireAnswers[questionId][0].subAnswers) {
                        questionnaireAnswers[questionId][0].subAnswers[subQuestionId].map((e) => {
                            return { value: e.value, date: value };
                        })
                    }
                }
            }
        }

        this.props.updateCurrentAnswers(questionnaireAnswers);
    };

    onSavePressed = () => {
        // First Check for required questions
        console.log('onSavePressed AddSingleAnswerModalScreen: ', this.props.item, this.props.currentAnswers);
        let checkRequiredFields = checkRequiredQuestions([this.props.item], this.props.currentAnswers);
        checkRequiredFields = checkRequiredFields.map((e) => { return getTranslation(e, this.props.translation) });
        if (checkRequiredFields && Array.isArray(checkRequiredFields) && checkRequiredFields.length > 0) {
            Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), `${getTranslation(translations.alertMessages.requiredFieldsMissingError, this.props.translation)}.\n${getTranslation(translations.alertMessages.missingFields, this.props.translation)}: ${checkRequiredFields}`, [
                {
                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                    onPress: () => { console.log("OK pressed") }
                }
            ])
        } else {
            this.props.saveCurrentAnswer();
        }
    };

    onCancelPressed = () => {
        this.props.onCancelPressed();
    };

    handleOnFocus = (event) => {
        // this.scrollToInput(findNodeHandle(event.target))
    };

    scrollToInput(reactNode) {
        // Add a 'scroll' ref to your ScrollView
        // this.scrollAddSingleAnswerModal.props.scrollToFocusedInput(reactNode)
    };
}



// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        backgroundColor: 'transparent',
        width: 200,
        height: 200
    },
    containerScrollView: {
        flex: 1,
        backgroundColor: styles.screenBackgroundGrey
    },
    contentContainerStyle: {
        alignItems: 'center'
    },
});

function mapStateToProps(state) {
    return {
        user: state.user,
        screenSize: state.app.screenSize,
        contacts: state.contacts,
        translation: state.app.translation
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(AddSingleAnswerModalScreen);