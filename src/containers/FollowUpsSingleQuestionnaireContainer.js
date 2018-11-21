/**
 * Created by florinpopa on 25/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {View, StyleSheet, InteractionManager, Alert, TouchableWithoutFeedback, Keyboard} from 'react-native';
import {calculateDimension, extractAllQuestions, mapQuestions} from './../utils/functions';
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

class FollowUpsSingleQuestionnaireContainer extends PureComponent {

    // This will be a container, so put as less business logic here as possible
    constructor(props) {
        super(props);
        this.state = {
            interactionComplete: false,
            questions: []
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

    static getDerivedStateFromProps(props, state) {
        // Get all additional questions recursively
        let sortedQuestions = extractAllQuestions(props.questions, props.item);

        // mappedQuestions format: [{categoryName: 'cat1', questions: [{q1}, {q2}]}]
        sortedQuestions = mapQuestions(sortedQuestions);

        sortedQuestions = sortBy(sortedQuestions, ['categoryName']);

        for (let i=0; i<sortedQuestions.length; i++) {
            sortedQuestions[i].questions = sortBy(sortedQuestions[i].questions, ['order', 'variable']);
        }

        state.questions = sortedQuestions;

        return null;
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

        // console.log("### FollowUpsSingleQuestionnaire: ", this.props.questions);
        let buttonHeight = calculateDimension(25, true, this.props.screenSize);
        let buttonWidth = calculateDimension(165.5, false, this.props.screenSize);
        let marginVertical = calculateDimension(12.5, true, this.props.screenSize);
        let viewWidth = calculateDimension(config.designScreenSize.width - 32, false, this.props.screenSize);

        return (
            <TouchableWithoutFeedback onPress={() => {
                Keyboard.dismiss()
            }} accessible={false}>
                <View style={style.mainContainer}>
                    {
                        this && this.props && this.props.isEditMode ? (
                            <View style={[style.containerButtons, {marginVertical: marginVertical, width: viewWidth}]}>
                                <Button
                                    title={'Save'}
                                    onPress={this.onPressSave}
                                    color={styles.buttonGreen}
                                    titleColor={'white'}
                                    height={buttonHeight}
                                    width={buttonWidth}
                                />
                                {/*<Button*/}
                                {/*title={'Missing'}*/}
                                {/*onPress={this.props.onPressMissing}*/}
                                {/*color={'white'}*/}
                                {/*titleColor={styles.buttonTextGray}*/}
                                {/*height={buttonHeight}*/}
                                {/*width={buttonWidth}*/}
                                {/*/>*/}
                            </View>) : (null)
                    }
                    <KeyboardAwareScrollView
                        style={style.container}
                        contentContainerStyle={[style.contentContainerStyle, {paddingBottom: this.props.screenSize.height < 600 ? 70 : 20}]}
                        keyboardShouldPersistTaps={'always'}
                    >
                        {
                            this.state.questions.map((item, index) => {
                                return this.handleRenderSectionedList(item, index)
                            })
                        }
                    </KeyboardAwareScrollView>
                </View>
            </TouchableWithoutFeedback>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderSectionedList = (item, index) => {
        return (
            <View>
                <Section
                    label={this.getTranslation(item.categoryName)}
                    containerStyle={{
                        marginVertical: 10
                    }}
                />
                {
                    item.questions.map((item, index) => {
                        return this.handleRenderItem(item, index)
                    })
                }
            </View>
        )
    };

    handleRenderItem = (item, index) => {
        return (
            <QuestionCard
                item={item}
                index={index + 1}
                source={this.props.item}
                isEditMode={this.props.isEditMode}
                onChangeTextAnswer={this.props.onChangeTextAnswer}
                onChangeDateAnswer={this.props.onChangeDateAnswer}
                onChangeSingleSelection={this.props.onChangeSingleSelection}
                onChangeMultipleSelection={this.props.onChangeMultipleSelection}
            />
        )
    };

    onPressSave = () => {
        // First check if all the required questions are filled
        if (this.checkRequiredQuestions()) {
            this.props.onPressSave();
        } else {
            Alert.alert('Validation error', 'Please make sure you have completed all required fields',
                [
                    {
                        text: 'Ok', onPress: () => {console.log('Ok pressed checkRequiredQuestions')}
                    }
                ]
            )
        }
    };

    checkRequiredQuestions = () => {
        // Loop through all categories' questions and if a required question is unanswered return false
        if (this.state.questions && Array.isArray(this.state.questions) && this.state.questions.length > 0) {
            for (let i = 0; i < this.state.questions.length; i++) {
                if (this.state.questions[i] && this.state.questions[i].questions && Array.isArray(this.state.questions[i].questions) && this.state.questions[i].questions.length > 0) {
                    for (let j = 0; j < this.state.questions[i].questions.length; j++) {
                        if (this.state.questions[i].questions[j].variable && this.props.item) {
                            if (!this.props.item.questionnaireAnswers || this.state.questions[i].questions[j].required && !this.props.item.questionnaireAnswers[this.state.questions[i].questions[j].variable]) {
                                return false;
                            }
                        }
                    }
                }
            }
        }
        return true;
    };

    getTranslation = (value) => {
        if (value && value !== '') {
            let valueToBeReturned = value;
            if (value && typeof value === 'string' && value.includes('LNG')) {
                valueToBeReturned = value && this.props.translation && Array.isArray(this.props.translation) && this.props.translation[this.props.translation.map((e) => {
                    return e && e.token ? e.token : null
                }).indexOf(value)] ? this.props.translation[this.props.translation.map((e) => {
                    return e.token
                }).indexOf(value)].translation : '';
            }
            return valueToBeReturned;
        }
        return '';
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
