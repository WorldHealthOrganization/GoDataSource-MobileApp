/**
 * Created by florinpopa on 27/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {View, StyleSheet} from 'react-native';
import {calculateDimension, getTranslation} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import Button from './Button';
import styles from './../styles';
import ElevatedView from 'react-native-elevated-view';
import translations from './../utils/translations';
import QuestionCardTitle from './QuestionCardTitle';
import QuestionCardContent from './QuestionCardContent';


class QuestionCard extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    // shouldComponentUpdate(nextProps, nextState) {
    //     // console.log("Next source, old source: ", nextProps.source.questionnaireAnswers[nextProps.item.variable], this.props.source.questionnaireAnswers[this.props.item.variable]);
    //     if (nextProps.isEditMode !== this.props.isEditMode ||
    //         (nextProps.source && nextProps.source.questionnaireAnswers && nextProps.source.questionnaireAnswers[nextProps.item.variable] &&
    //             this.props.source && this.props.source.questionnaireAnswers && this.props.source.questionnaireAnswers[this.props.item.variable] &&
    //             !isEqual(nextProps.source.questionnaireAnswers[nextProps.item.variable], this.props.source.questionnaireAnswers[this.props.item.variable])) ||
    //         nextProps.totalNumberOfQuestions !== this.props.totalNumberOfQuestions) {
    //         // console.log("Next source, old source: ", nextProps.item.variable, nextProps.source.questionnaireAnswers[nextProps.item.variable], this.props.source.questionnaireAnswers[this.props.item.variable]);
    //         return true;
    //     }
    //     return false;
    // }

    static getDerivedStateFromProps(props, state) {
        if (props.source && props.source[props.item.variable] && Array.isArray(props.source[props.item.variable]) && props.source[props.item.variable][0] && props.source[props.item.variable][0].date) {
            state.answerDate = props.source[props.item.variable][0].date;
        }
    }

    // Please add here the react lifecycle methods that you need
    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        // console.log('Render QuestionCard: ', this.props.item, this.props.source);
        let viewWidth = calculateDimension(315, false, this.props.screenSize);
        let viewHeight = calculateDimension(30, true, this.props.screenSize);
        let marginHorizontal = calculateDimension(14, false, this.props.screenSize);
        let buttonHeight = calculateDimension(25, true, this.props.screenSize);
        let buttonWidth = calculateDimension(120, false, this.props.screenSize);
        return (
            <ElevatedView elevation={3} style={[this.props.style, style.container, {
                marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                width: calculateDimension(config.designScreenSize.width - 32, false, this.props.screenSize),
                marginVertical: 4
            }]}
                onPress={() => {this.setState({showDropdown: false})}}
            >
                <QuestionCardTitle
                    height={calculateDimension(43, true, this.props.screenSize)}
                    paddingRight={calculateDimension(34, true, this.props.screenSize)}
                    paddingLeft={calculateDimension(14, true, this.props.screenSize)}
                    marginLeft={calculateDimension(8, false, this.props.screenSize)}
                    marginRight={calculateDimension(34, false, this.props.screenSize)}
                    questionNumber={getTranslation(translations.generalLabels.questionInitial, this.props.translation).charAt(0).toUpperCase() + this.props.index}
                    questionText={getTranslation(this.props.item.text, this.props.translation)}
                    questionCategory={this.props.item && this.props.item.category ?
                        ' - ' + getTranslation(this.props.item.category, this.props.translation) : ''}
                />
                <QuestionCardContent
                    item={this.props.item}
                    source={this.props.source}
                    viewWidth={viewWidth}
                    viewMarginHorizontal={marginHorizontal}
                    hideButtons={this.props.hideButtons}
                    buttonWidth={buttonWidth}
                    buttonHeight={buttonHeight}
                    onClickAddNewMultiFrequencyAnswer={this.onClickAddNewMultiFrequencyAnswer}
                    onChangeTextAnswer={this.props.onChangeTextAnswer}
                    onChangeDateAnswer={this.props.onChangeDateAnswer}
                    onChangeSingleSelection={this.props.onChangeSingleSelection}
                    onChangeMultipleSelection={this.props.onChangeMultipleSelection}
                    isEditMode={this.props.isEditMode}
                    onChangeAnswerDate={this.props.onChangeAnswerDate}
                    editableQuestionDate={this.props.editableQuestionDate}
                    onFocus={this.props.onFocus}
                    onBlur={this.props.onBlur}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: viewWidth,
                            marginHorizontal,
                            height: viewHeight,
                            marginVertical: 5
                        }}
                    >
                        <Button
                            title={getTranslation(translations.questionCardLabels.addAnswer, this.props.translation)}
                            width={buttonWidth}
                            height={buttonHeight}
                            titleColor={'white'}
                            color={styles.buttonGreen}
                            onPress={() => {this.props.onClickAddNewMultiFrequencyAnswer(this.props.item)}}
                        />
                        <Button
                            title={getTranslation(translations.questionCardLabels.previousAnswers, this.props.translation)}
                            width={buttonWidth}
                            height={buttonHeight}
                            titleColor={'white'}
                            color={styles.buttonGreen}
                            onPress={() => {this.props.onClickShowPreviousAnswers(this.props.item)}}
                        />
                    </View>
                </QuestionCardContent>
            </ElevatedView>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    onClickAddNewMultiFrequencyAnswer = (item) => {
        this.props.onClickAddNewMultiFrequencyAnswer(item);
    }
}


// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 2
    },
    containerQuestion: {
        flexDirection: 'row',
        backgroundColor: styles.colorBackgroundQuestions,
        alignItems: 'center'
    },
    containerQuestionNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center'
    },
    questionText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 13,
        color: 'black'
    },
    containerCardComponent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        translation: state.app.translation
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(QuestionCard);
