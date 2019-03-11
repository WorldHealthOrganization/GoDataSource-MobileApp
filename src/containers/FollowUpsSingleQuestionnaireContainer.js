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
import {calculateDimension, extractAllQuestions, mapQuestions, getTranslation} from './../utils/functions';
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
        let sortedQuestions = sortBy(props.questions, ['order', 'variable']);
        sortedQuestions = extractAllQuestions(sortedQuestions, props.item);
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
                            this.state.questions.map((item, index) => {
                                return this.handleRenderItem(item, index)
                            })
                        }
                    </KeyboardAwareScrollView>
                </View>
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderSectionedList = (item, index) => {
        return (
            <View>
                <Section
                    label={getTranslation(item.categoryName, this.props.translation)}
                    containerStyle={{
                        marginVertical: 10
                    }}
                    translation={this.props.translation}
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
        if (item.inactive === false ){
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
                    onFocus={this.handleOnFocus}
                />
            )
        }
    };

    onPressSave = () => {
        // First check if all the required questions are filled
        let checkRequiredFields = this.checkRequiredQuestions();
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

    checkRequiredQuestions = () => {
        let requiredQuestions = [];
        // Loop through all categories' questions and if a required question is unanswered return false
        if (this.state.questions && Array.isArray(this.state.questions) && this.state.questions.length > 0) {
            for (let i = 0; i < this.state.questions.length; i++) {
                if (this.state.questions[i].variable && this.props.item) {
                    if (this.state.questions[i].required === true) {
                        if (!this.props.item.questionnaireAnswers || !this.props.item.questionnaireAnswers[this.state.questions[i].variable]) {
                            requiredQuestions.push(getTranslation(this.state.questions[i].text, this.props.translation));
                            // return false;
                        }
                    }
                }
            }
        }
        return requiredQuestions;
        // return true;
    };

    handleOnFocus = (event) => {
        this.scrollToInput(findNodeHandle(event.target))
    };

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
