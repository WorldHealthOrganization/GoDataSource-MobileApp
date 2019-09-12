import React, {PureComponent} from 'react';
import {View, Text, StyleSheet, Platform, ScrollView} from 'react-native';
import styles from './../styles';
import cloneDeep from "lodash/cloneDeep";
import translations from "../utils/translations";
import {calculateDimension, getTranslation} from "../utils/functions";
import DatePicker from './DatePicker';
import TextInput from './TextInput';
import DropdownInput from './DropdownInput';
import DropDown from './DropDown';
import Section from './Section';
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import get from 'lodash/get';

// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box

class QuestionCardContent extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            showDropdown: false,
            answerDate: new Date()
        }
    }

    componentDidUpdate(prevProps) {
        if (get(this.props, `source[${get(this.props, 'item.variable', null)}][0].date`, null) && get(this.props, `source[${get(this.props, 'item.variable', null)}][0].date`, null) !== get(prevProps, `source[${get(prevProps, 'item.variable', null)}][0].date`, null)) {
            this.setState({
                answerDate: get(this.props, `source[${get(this.props, 'item.variable', null)}][0].date`, null)
            })
        }
    }

    // static getDerivedStateFromProps(props, state) {
    //     if (props.source && props.source[props.item.variable] && Array.isArray(props.source[props.item.variable]) && props.source[props.item.variable][0] && props.source[props.item.variable][0].date) {
    //         state.answerDate = props.source[props.item.variable][0].date;
    //     }
    //     return null;
    // }

    render() {
        // console.log("Render QuestionCardTitle");
        return (
            <ScrollView scrollEnabled={false} keyboardShouldPersistTaps={'always'}>
                {
                    this.props.item.multiAnswer ? (
                        <DatePicker
                            id={'answerDate'}
                            label={'Answer Date'}
                            value={this.state.answerDate}
                            isEditMode={!!(this.props.isEditMode && this.props.editableQuestionDate)}
                            isRequired={true}
                            style={{width: this.props.viewWidth, marginHorizontal: this.props.viewMarginHorizontal}}
                            onChange={(value, id) => {this.onChangeAnswerDate(value, this.props.item.variable)}}
                        />
                    ) : (null)
                }
                {
                    this.handleRenderItem(this.props.item)
                }
                {
                    this.props.item.additionalQuestions ? (
                        <View>
                            <Section label={'Additional Questions'}/>
                            {
                                this.props.item.additionalQuestions.map((additionalQuestion) => {
                                    return this.handleRenderAdditionalQuestions(additionalQuestion, this.props.item.variable);
                                })
                            }
                        </View>
                    ) : (null)
                }
                {
                    this.props.item.multiAnswer && this.props.isEditMode && !this.props.hideButtons ? (
                        this.props.children
                    ) : (null)
                }
            </ScrollView>
        )
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (item) => {
        // console.log('handleRenderItem: ', item);
        // item = item.item;
        return (
            <View style={[style.containerCardComponent, {
                minHeight: calculateDimension(72, true, this.props.screenSize)
            }]}>
                {
                    this.handleRenderItemByType(item)
                }
            </View>
        )
    };

    handleRenderItemByType = (item, parentId) => {
        // console.log("Answers: ", item);

        let width = calculateDimension(315, false, this.props.screenSize);
        let marginHorizontal = calculateDimension(14, false, this.props.screenSize);
        let source = cloneDeep(this.props.source);
        if (!source) {
            source = {};
        }

        if (parentId) {
            if (!source[parentId]) {
                source[parentId] = [];
                source[parentId].push({subAnswers: {}});
            }
            if (!source[parentId][0]) {
                source[parentId][0] = {subAnswers: {}}
            }
            if (!source[parentId][0].subAnswers) {
                source[parentId][0].subAnswers = {};
            }
            if (!source[parentId][0].subAnswers[item.variable]) {
                switch(item.answerType) {
                    case 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_FREE_TEXT':
                        source[parentId][0].subAnswers[item.variable] = {date: item.multiAnswer ? this.state.answerDate : null, value: ''};
                        break;
                    case 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_SINGLE_ANSWER':
                        source[parentId][0].subAnswers[item.variable] = {date: item.multiAnswer ? this.state.answerDate : null, value: ''};
                        break;
                    case 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_MULTIPLE_ANSWERS':
                        source[parentId][0].subAnswers[item.variable] = {date: item.multiAnswer ? this.state.answerDate : null, value: []};
                        break;
                    default:
                        source[parentId][0].subAnswers[item.variable] = {date: item.multiAnswer ? this.state.answerDate : null, value: ''};
                        break;
                }
            }
        } else {
            if (!source[item.variable]) {
                switch(item.answerType) {
                    case 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_FREE_TEXT':
                        source[item.variable] = [];
                        source[item.variable].push({date: item.multiAnswer ? this.state.answerDate : null, value: ''});
                        break;
                    case 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_SINGLE_ANSWER':
                        source[item.variable] = [];
                        source[item.variable].push({date: item.multiAnswer ? this.state.answerDate : null, value: ''});
                        break;
                    case 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_MULTIPLE_ANSWERS':
                        source[item.variable] = [];
                        source[item.variable].push({date: item.multiAnswer ? this.state.answerDate : null, value: []});
                        break;
                    default:
                        source[item.variable] = [];
                        source[item.variable].push({date: item.multiAnswer ? this.state.answerDate : null, value: ''});
                        break;
                }
            }
        }

        let questionAnswers = null;

        questionAnswers = parentId ? source && source[parentId] && Array.isArray(source[parentId]) && source[parentId].length > 0 &&
            source[parentId][0] && typeof source[parentId][0] === 'object' && Object.keys(source[parentId][0]).length > 0 &&
            source[parentId][0].subAnswers && typeof source[parentId][0].subAnswers === "object" &&
            Object.keys(source[parentId][0].subAnswers).length > 0 && source[parentId][0].subAnswers[item.variable] &&
            Array.isArray(source[parentId][0].subAnswers[item.variable]) && source[parentId][0].subAnswers[item.variable].length > 0 &&
            source[parentId][0].subAnswers[item.variable][0] && source[parentId][0].subAnswers[item.variable][0].value ?
            source[parentId][0].subAnswers[item.variable][0].value : '' :
            source[item.variable] && Array.isArray(source[item.variable]) && source[item.variable].length > 0 &&
            source[item.variable][0] && source[item.variable][0].value ? source[item.variable][0].value : '';

        if (item.answerType === 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_SINGLE_ANSWER') {
            // console.log('QuestionCard: ', item);
            questionAnswers = questionAnswers !== null &&
            questionAnswers !== undefined &&
            item.answers.map((e) => {return e && e.value ? e.value : null}).indexOf(questionAnswers) > -1 &&
            item.answers[item.answers.map((e) => {return e.value ? e.value : null}).indexOf(questionAnswers)] ?
                getTranslation(item.answers[item.answers.map((e) => {return e.value}).indexOf(questionAnswers)].label, this.props.translation) : ' ';
        }
        else {
            if (item.answerType === 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_MULTIPLE_ANSWERS') {
                // console.log('QuestionCard: ', item);
                questionAnswers = questionAnswers !== null && questionAnswers !== undefined && Array.isArray(questionAnswers) && questionAnswers.length > 0 ?
                    item.answers.filter((e) => {
                        console.log('Inside filter: ', e);
                        return e && e.value && questionAnswers.indexOf(e.value) > -1;
                    }).map((e) => {
                        return {label: getTranslation(e.label, this.props.translation), value: e.value || null}
                    }) : [];
            }
        }

        // console.log("### questionAnswers: ", questionAnswers, item);
        // if (item.type === 'DropdownInput' && item.isExposure) {
        //     item.data = this.props.cases.map((e) => {return {value: ((e.firstName ? e.firstName : '') + (e.lastName ? (" " + e.lastName) : ''))}})
        // }
        // console.log('Itemm: ', item);

        switch(item.answerType) {
            case 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_FREE_TEXT':
                return (
                    <TextInput
                        id={item.variable}
                        label={translations.questionCardLabels.textInputLabel}
                        labelValue={item.text}
                        value={questionAnswers}
                        isEditMode={this.props.isEditMode}
                        isRequired={item.required}
                        onChange={(text, id) => {
                            let valueToSend = {
                                date: this.state.answerDate, value: text
                            };
                            // if (source[item.variable][0].subAnswers) {
                            //     valueToSend.subAnswers = source[item.variable][0].subAnswers
                            // }
                            this.props.onChangeTextAnswer(valueToSend, id, parentId);
                        }}
                        multiline={true}
                        style={{width: width, marginHorizontal: marginHorizontal}}
                        translation={this.props.translation}
                        screenSize={this.props.screenSize}
                        onFocus={this.props.onFocus}
                        onBlur={this.props.onBlur}
                    />
                );
            case 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_NUMERIC':
                return (
                    <TextInput
                        id={item.variable}
                        label={translations.questionCardLabels.textInputLabel}
                        labelValue={item.text}
                        value={questionAnswers}
                        isEditMode={this.props.isEditMode}
                        isRequired={item.required}
                        onChange={(text, id) => {
                            let valueToSend = {
                                date: this.state.answerDate, value: parseFloat(text)
                            };
                            // if (source[item.variable][0].subAnswers) {
                            //     valueToSend.subAnswers = source[item.variable][0].subAnswers
                            // }
                            this.props.onChangeTextAnswer(valueToSend, id, parentId);
                        }}
                        multiline={true}
                        keyboardType={'numeric'}
                        style={{width: width, marginHorizontal: marginHorizontal}}
                        translation={this.props.translation}
                        screenSize={this.props.screenSize}
                        onFocus={this.props.onFocus}
                        onBlur={this.props.onBlur}
                    />
                );
            case 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_DATE_TIME':
                return (
                    <DatePicker
                        id={item.variable}
                        label={translations.questionCardLabels.datePickerLabel}
                        value={questionAnswers}
                        isEditMode={get(this.props, 'isEditMode', true)}
                        isRequired={item.required}
                        onChange={(date, id) => {
                            let valueToSend = {
                                date: this.state.answerDate, value: date
                            };
                            // if (source[item.variable][0].subAnswers) {
                            //     valueToSend.subAnswers = source[item.variable][0].subAnswers
                            // }
                            this.props.onChangeDateAnswer(valueToSend, id, parentId);
                        }}
                        style={{width: width, marginHorizontal: marginHorizontal}}
                        translation={this.props.translation}
                    />
                );
            case 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_SINGLE_ANSWER':
                const data = item.answers.map((e) => {return {value: getTranslation(e.label, this.props.translation), id: e.value}});
                const dataWithNoneOption = cloneDeep(data);
                if (dataWithNoneOption !== undefined && dataWithNoneOption !== null && dataWithNoneOption.length > 0) {
                    const dataFormatKeys = Object.keys(dataWithNoneOption[0]);
                    if (dataFormatKeys.length === 2) {
                        const noneLabel = getTranslation(translations.generalLabels.noneLabel, this.props.translation);
                        if (dataFormatKeys[0] === 'label' && dataFormatKeys[1] === 'value'){
                            noneData = { label: noneLabel, value: null };
                            dataWithNoneOption.unshift(noneData);
                        } else if (dataFormatKeys[0] === 'value' && dataFormatKeys[1] === 'id'){
                            noneData = { value: noneLabel, id: null };
                            dataWithNoneOption.unshift(noneData);
                        }
                    }
                }

                return (
                    <DropdownInput
                        id={item.variable}
                        label={translations.questionCardLabels.dropDownInputLabel}
                        labelValue={item.text}
                        value={questionAnswers}
                        data={dataWithNoneOption}
                        isEditMode={this.props.isEditMode}
                        isRequired={item.required}
                        onChange={(selectedValue, id) => {
                            let valueToSend = {
                                date: this.state.answerDate, value: selectedValue.value
                            };
                            let index = item.answers.findIndex((e) => {return e.value === selectedValue.value});
                            if (item.answers[index] && item.answers[index].additionalQuestions) {
                                valueToSend.subAnswers = {};
                                for (let i=0; i<item.answers[index].additionalQuestions.length; i++) {
                                    valueToSend.subAnswers[item.answers[index].additionalQuestions[i].variable] = [{date: this.state.answerDate, value: ''}]
                                }
                            }
                            this.props.onChangeSingleSelection(valueToSend, id, parentId);
                        }}
                        style={{width: width, marginHorizontal: marginHorizontal}}
                        translation={this.props.translation}
                        screenSize={this.props.screenSize}
                    />
                );
            case 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_MULTIPLE_ANSWERS':
                return (
                    <DropDown
                        key={item.variable}
                        id={item.variable}
                        label={translations.questionCardLabels.dropDownLabel}
                        labelValue={item.text}
                        value={questionAnswers}
                        data={item.answers.map((e) => {return {label: getTranslation(e.label, this.props.translation), value: e.value}})}
                        isEditMode={this.props.isEditMode}
                        isRequired={item.required}
                        onChange={(selectedAnswers, id) => {
                            let valueToSend = {
                                date: this.state.answerDate, value: selectedAnswers.map((e) => {return e.value})
                            };
                            let subAnswers = [];
                            for (let j=0; j<valueToSend.value.length; j++) {
                                let index = item.answers.findIndex((e) => {return e.value === valueToSend.value[j]});
                                if (item.answers[index] && item.answers[index].additionalQuestions) {
                                    // valueToSend.subAnswers = {};
                                    for (let i=0; i<item.answers[index].additionalQuestions.length; i++) {
                                        subAnswers[item.answers[index].additionalQuestions[i].variable] = [{date: this.state.answerDate, value: ''}]
                                    }
                                }
                            }
                            if (subAnswers !== {}) {
                                valueToSend.subAnswers = subAnswers;
                            }
                            this.props.onChangeMultipleSelection(valueToSend, id, parentId);
                        }}
                        style={{width: width, marginHorizontal: marginHorizontal}}
                        dropDownStyle={{width: width, alignSelf: 'center'}}
                        showDropdown={this.state.showDropdown}
                    />
                );
            default:
                return(
                    item.answerType !== undefined ? (
                        <View>
                            <Text>{"TODO: item type: " + item.answerType + " is not implemented yet"}</Text>
                        </View>
                    ) : null
                )
        }

    };

    handleRenderAdditionalQuestions = (additionalQuestion, parentId) => {
        console.log('handleRenderAdditionalQuestions: ', additionalQuestion);
        return (
            <View>
                <Section label={getTranslation(additionalQuestion.text, this.props.translation)} />
                {
                    this.handleRenderItemByType(additionalQuestion, parentId)
                }
            </View>
        )
    };

    onChangeAnswerDate = (date, id) => {
        this.setState({
            answerDate: date
        }, () => {
            this.props.onChangeAnswerDate(date, id)
        });
    };
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
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

export default connect(mapStateToProps, matchDispatchProps)(QuestionCardContent);