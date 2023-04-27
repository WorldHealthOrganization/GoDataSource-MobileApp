/**
 * Created by florinpopa on 27/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {StyleSheet, View} from 'react-native';
import {calculateDimension, getTranslation} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import Button from './Button';
import ElevatedView from 'react-native-elevated-view';
import translations from './../utils/translations';
import QuestionCardTitle from './QuestionCardTitle';
import QuestionCardContent from './QuestionCardContent';
import get from "lodash/get";
import {sortBy} from "lodash";
import PreviousAnswers from "./PreviousAnswers";
import uniqueId from "lodash/uniqueId";
import isEqual from "lodash/isEqual";
import styles from './../styles';

class QuestionCard extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {
            previousAnswers: this.props.source
        };
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        let answer = false;
        for(const [key, value] of Object.entries(nextState)){
            if (this.state[key] !== value) {
                const newStateVariable = get(value, `${get(nextProps, 'item.variable', null)}`, null)
                const oldStateVariable = get(this.state[key], `${get(nextProps, 'item.variable', null)}`, null)
                if(newStateVariable?.length !== oldStateVariable?.length
                    || !isEqual(newStateVariable,oldStateVariable)) {
                    return true;
                }
            }
        }
        for (const [key, value] of Object.entries(nextProps)) {
            if (!isEqual(this.props[key], value)) {
                switch (key) {
                    case 'item':
                        if (this.props[key].id !== value.id) {
                            answer=true;
                            break;
                        }
                        break;
                    case 'source':
                        const nextPropsVariable = get(nextProps, `source[${get(nextProps, 'item.variable', null)}]`, null);
                        const propsVariable =  get(this.props, `source[${get(this.props, 'item.variable', null)}]`, null)
                        if (nextPropsVariable?.length !== propsVariable?.length) {
                            answer = true;
                            break;
                        } else {
                            answer = true;
                            break;
                        }
                    default:
                        answer = true;
                        break;
                }
                if(answer) break;
            } else {
                switch (key) {
                    case 'item':
                        if(this.props.item.variable !== nextProps.item.variable){
                            answer = true;
                            break;
                        }
                        break;
                }
                if(answer) break;
            }
        }
        return answer;
    }

    componentDidUpdate(prevProps) {
        const answer = get(this.props, `source[${get(this.props, 'item.variable', null)}]`, null)
        const prevAnswer = get(prevProps, `source[${get(this.props, 'item.variable', null)}]`, null)

        //update previous answers if length is different because item was deleted/added
        if(answer && answer?.length !== prevAnswer?.length){
            this.setState({
                previousAnswers: this.props.source
            });
        }else{
            //update previous answers if date or value was updated for current answer
            if (!isEqual(answer, prevAnswer)) {
                this.setState({
                    previousAnswers: this.props.source
                })
            }

        }
    }

    // Please add here the react lifecycle methods that you need
    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        let viewWidth = calculateDimension(315, false, this.props.screenSize);
        let viewHeight = calculateDimension(30, true, this.props.screenSize);
        let marginHorizontal = calculateDimension(16, false, this.props.screenSize);
        let buttonHeight = calculateDimension(35, true, this.props.screenSize);
        let buttonWidth = calculateDimension(150, false, this.props.screenSize);
        let index = this.calculateIndex(this.props.totalQuestions, this.props.index);
        return (
            <ElevatedView
                elevation={5}
                style={[this.props.style, style.container, {
                    marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                    width: calculateDimension(config.designScreenSize.width - 32, false, this.props.screenSize)
                }]}
            >
                {
                    this.props.item.answerType === 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_MARKUP' ? null :
                        <QuestionCardTitle
                            height={calculateDimension(43, true, this.props.screenSize)}
                            paddingRight={calculateDimension(34, true, this.props.screenSize)}
                            paddingLeft={calculateDimension(16, true, this.props.screenSize)}
                            paddingTopBottom={calculateDimension(4, false, this.props.screenSize)}
                            marginLeft={calculateDimension(8, false, this.props.screenSize)}
                            marginRight={calculateDimension(34, false, this.props.screenSize)}
                            questionNumber={getTranslation(translations.generalLabels.questionInitial, this.props.translation).charAt(0).toUpperCase() + index}
                            questionText={getTranslation(this.props.item.text, this.props.translation)}
                            questionCategory={''}
                        />
                }
                <View>
                    {
                        this.props.item.multiAnswer && this.props.isEditMode && !this.props.hideButtons ? (
                            <View
                                style={[style.addAnswerStyle, {
                                    height: viewHeight,
                                    marginHorizontal,
                                    width: viewWidth
                                }]}
                            >
                                {/*Add answer button*/}
                                <Button
                                    title={getTranslation(translations.questionCardLabels.addAnswer, this.props.translation)}
                                    width={buttonWidth}
                                    height={buttonHeight}
                                    titleColor={styles.backgroundColor}
                                    color={styles.primaryColor}
                                    onPress={() => {
                                        this.props.onCollapse(this.props.item, true);
                                        this.props.onClickAddNewMultiFrequencyAnswer(this.props.item)
                                    }}
                                />
                            </View>
                        ) : (null)
                    }
                    {this.props.item.multiAnswer && this.props.isEditMode && this.props.isCollapsed ? null :
                        <QuestionCardContent
                            index={0}
                            item={this.props.item}
                            isCollapsed={this.props.isCollapsed}
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
                            savePreviousAnswers={this.props.savePreviousAnswers}
                            copyAnswerDate={this.props.copyAnswerDate}
                            isEditMode={this.props.isEditMode}
                            onChangeAnswerDate={this.props.onChangeAnswerDate}
                            editableQuestionDate={this.props.editableQuestionDate}
                            onFocus={this.props.onFocus}
                            onBlur={this.props.onBlur}
                        />
                    }
                    {
                        this.props.item.multiAnswer && this.props.isEditMode &&
                        <View>
                            <PreviousAnswers
                                item={this.props.item}
                                previousAnswers={this.state.previousAnswers[this.props.item.variable]}
                                previousAnswerVariable={this.props.item.variable}
                                savePreviousAnswers={this.props.savePreviousAnswers}
                                copyAnswerDate={this.props.copyAnswerDate}
                                onCollapse={this.props.onCollapse}
                                isCollapsed={this.props.isCollapsed}
                            />
                        </View>
                    }
                </View>
            </ElevatedView>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    onClickAddNewMultiFrequencyAnswer = (item) => {
        this.props.onClickAddNewMultiFrequencyAnswer(item);
    };

    calculateIndex = (totalQuestions, itemIndex) => {
        let finalIndex = itemIndex;
        totalQuestions.map( (item, index) => {
            //verify only for previous items
            if( index < itemIndex ){
                //remove inactive questions
                if( item.inactive === true ){
                    finalIndex = finalIndex - 1;
                } else {
                    //remove markup questions
                    if( item.answerType === 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_MARKUP'){
                        finalIndex = finalIndex - 1;
                    }
                }
            }
        });
        return finalIndex;
    };
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        backgroundColor: styles.backgroundColor,
        borderRadius: 4,
        marginVertical: 6
    },
    addAnswerStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 16
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        translation: state.app.translation
    };
}

export default connect(mapStateToProps)(QuestionCard);
