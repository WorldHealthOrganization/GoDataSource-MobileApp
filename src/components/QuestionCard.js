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
import get from "lodash/get";
import {sortBy} from "lodash";
import PreviousAnswers from "./PreviousAnswers";

class QuestionCard extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {
            previousAnswers: this.props.source
        };
    }

    componentDidUpdate(prevProps) {
        if (get(this.props, `source[${get(this.props, 'item.variable', null)}][0].date`, null) && get(this.props, `source[${get(this.props, 'item.variable', null)}][0].date`, null) !== get(prevProps, `source[${get(prevProps, 'item.variable', null)}][0].date`, null)) {
            this.setState({
                answerDate: get(this.props, `source[${get(this.props, 'item.variable', null)}][0].date`, null),
                previousAnswers: this.props.source
            })
        }
        //update previous answers if item was deleted
        if(get(this.props, `source[${get(this.props, 'item.variable', null)}]`, null) && get(this.props, `source[${get(this.props, 'item.variable', null)}].length`, null) !== get(prevProps, `source[${get(prevProps, 'item.variable', null)}].length`, null)){
            this.setState({
                previousAnswers: this.props.source
            });
        }
    }

    // Please add here the react lifecycle methods that you need
    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        let viewWidth = calculateDimension(315, false, this.props.screenSize);
        let viewHeight = calculateDimension(30, true, this.props.screenSize);
        let marginHorizontal = calculateDimension(14, false, this.props.screenSize);
        let buttonHeight = calculateDimension(25, true, this.props.screenSize);
        let buttonWidth = calculateDimension(120, false, this.props.screenSize);
        let index = this.calculateIndex(this.props.totalQuestions, this.props.index);
        return (
            <ElevatedView elevation={3} key={this.props.key} style={[this.props.style, style.container, {
                marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                width: calculateDimension(config.designScreenSize.width - 32, false, this.props.screenSize),
                marginVertical: 4
            }]}
                onPress={() => {this.setState({showDropdown: false})}}
            >
                {
                    this.props.item.answerType === 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_MARKUP' ? null :
                        <QuestionCardTitle
                            height={calculateDimension(43, true, this.props.screenSize)}
                            paddingRight={calculateDimension(34, true, this.props.screenSize)}
                            paddingLeft={calculateDimension(14, true, this.props.screenSize)}
                            paddingTopBottom={calculateDimension(5, false, this.props.screenSize)}
                            marginLeft={calculateDimension(8, false, this.props.screenSize)}
                            marginRight={calculateDimension(34, false, this.props.screenSize)}
                            questionNumber={getTranslation(translations.generalLabels.questionInitial, this.props.translation).charAt(0).toUpperCase() + index}
                            questionText={getTranslation(this.props.item.text, this.props.translation)}
                            questionCategory={this.props.item && this.props.item.category ?
                                ' - ' + getTranslation(this.props.item.category, this.props.translation) : ''}
                        />
                }
                <View key={this.props.key}>
                    {
                        this.props.item.multiAnswer && this.props.isEditMode && !this.props.hideButtons ? (
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
                                    onPress={() => {
                                        this.props.onCollapse(this.props.item, true);
                                        this.props.onClickAddNewMultiFrequencyAnswer(this.props.item)
                                    }}
                                />
                                <Button
                                    title={getTranslation(translations.questionCardLabels.previousAnswers, this.props.translation)}
                                    width={buttonWidth}
                                    height={buttonHeight}
                                    titleColor={'white'}
                                    color={styles.buttonGreen}
                                    onPress={() => {
                                        this.props.onCollapse(this.props.item)
                                    }}
                                />
                            </View>
                        ) : (null)
                    }
                    <QuestionCardContent
                        key={this.props.key}
                        index={0}
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
                    />
                    {
                        this.props.item.multiAnswer && this.props.isEditMode && this.props.isCollapsed &&
                        <View>
                            <PreviousAnswers
                                item={this.props.item}
                                previousAnswers={this.state.previousAnswers[this.props.item.variable]}
                                previousAnswerVariable={this.props.item.variable}
                                savePreviousAnswers={this.props.savePreviousAnswers}
                                onCollapse={this.props.onCollapse}
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
        // console.log('~~~~~~~~~~ ', totalQuestions, itemIndex);
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
