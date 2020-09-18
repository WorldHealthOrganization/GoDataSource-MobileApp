import React, {PureComponent} from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import styles from './../styles';
import cloneDeep from "lodash/cloneDeep";
import translations from "../utils/translations";
import {calculateDimension, getTranslation} from "../utils/functions";
import DatePicker from './DatePicker';
import TextInput from './TextInput';
import DropdownInput from './DropdownInput';
import DropDown from './DropDown';
import Section from './Section';
import {connect} from "react-redux";
import get from 'lodash/get';
import Ripple from 'react-native-material-ripple';
import {Icon} from 'react-native-material-ui';
import uniqueId from "lodash/uniqueId";
import {checkArrayAndLength} from './../utils/typeCheckingFunctions';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
class QuestionCardContent extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            showDropdown: false,
        }
    }

    render() {
        let answerDate = get(this.props, `source[${get(this.props, 'item.variable', null)}][${this.props.index}].date`, null);
        return (
            <ScrollView key={uniqueId('key_')} scrollEnabled={false} keyboardShouldPersistTaps={'always'}>

                {
                    this.props.item.multiAnswer ? (
                        <View style = {{
                            flex: 1,
                            width: this.props.viewWidth,
                            flexDirection: this.props.isEditMode ? 'row' : 'column'
                        }}>
                            <View style={{flexDirection: 'row', marginHorizontal: this.props.viewMarginHorizontal}}>
                                <DatePicker
                                    id={'answerDate'}
                                    label={'Answer Date'}
                                    value={answerDate}
                                    multiAnswer={this.props.item.multiAnswer}
                                    isEditMode={!!(this.props.isEditMode && this.props.editableQuestionDate)}
                                    isRequired={true}
                                    style={{
                                        width: this.props.isEditMode ? (this.props.viewWidth / 2) - 25 : this.props.viewWidth - 25,
                                    }}
                                    onChange={(value, id) => {
                                        this.onChangeAnswerDate(value, this.props.item.variable, this.props.index)
                                    }}
                                />
                                {   this.props.isEditMode &&
                                    <View style={{
                                        minHeight: calculateDimension(60, true, this.props.screenSize),
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        width: 25,
                                        backgroundColor: 'red'
                                    }}>
                                        {
                                            answerDate !== null && <Ripple onPress={() => this.handleCopyAnswerDate(answerDate)}><Icon name="content-copy"/></Ripple>
                                        }
                                    </View>
                                }
                            </View>
                            <View  style={{
                                flexDirection: 'row',
                                width: this.props.isEditMode ? (this.props.viewWidth / 2) : this.props.viewWidth,
                            }}>
                                <View style={{maxWidth:  this.props.isEditMode ? ( this.props.index === 0 ? (this.props.viewWidth / 2 ) - 25 : (this.props.viewWidth / 2 )) : this.props.viewWidth }}>
                                    { this.handleRenderItem(this.props.item) }
                                </View>
                                {   this.props.isEditMode && !this.props.isCollapsed && this.props.index === 0 &&  Array.isArray(this.props.source[this.props.item.variable]) && this.props.source[this.props.item.variable].length > 1 &&
                                    <View style={{
                                        minHeight: calculateDimension(60, true, this.props.screenSize),
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        width: 25,
                                        backgroundColor: 'red'
                                    }}>
                                        <Ripple onPress={() => { this.handleDeletePrevAnswer(0)}}>
                                            <Icon name="delete"/>
                                        </Ripple>
                                    </View>
                                }
                            </View>
                        </View>
                    ) : ( this.handleRenderItem(this.props.item) )
                }
                {
                    checkArrayAndLength(this.props.item.additionalQuestions) ? (
                        <View>
                            <Section label={translations.questionCardLabels.additionalQuestions} containerStyle={{marginBottom: 8}}/>
                            {
                                this.props.item.additionalQuestions.map((additionalQuestion) => {
                                    return this.handleRenderAdditionalQuestions(additionalQuestion, this.props.item.variable);
                                })
                            }
                        </View>
                    ) : (null)
                }
            </ScrollView>
        )
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (item) => {
        // console.log('handleRenderItem: ', item);
        return (
            <View style={[style.containerCardComponent, {
                minHeight: calculateDimension(60, true, this.props.screenSize),
                maxWidth: this.props.viewWidth,
                justifyContent: 'center'
            }]}>
                {
                    this.handleRenderItemByType(item)
                }
            </View>
        )
    };

    handleRenderItemByType = (item, parentId) => {
        let answerDate = get(this.props, `source[${get(this.props, 'item.variable', null)}][${this.props.index}].date`, null);
        let calculateWidth = this.props.isEditMode ? ( this.props.item.multiAnswer && !parentId ? (this.props.viewWidth / 2 ) - (this.props.isCollapsed ? 0 : 25) : 300) : 300;
        let width = calculateDimension(300, false, this.props.screenSize);
        let alternateWidth = calculateDimension(calculateWidth, false, this.props.screenSize);
        let marginHorizontal = calculateDimension(14, false, this.props.screenSize);
        let marginVertical = calculateDimension(8, true, this.props.screenSize);
        let style = {
            width: item.answerType === 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_DATE_TIME' ? width : alternateWidth,
            marginHorizontal,
            marginTop: parentId ? 2 : 4,
            marginBottom: parentId ? 8 : 4
        };
        let source = cloneDeep(this.props.source);
        if (!source) {
            source = {};
        }
        if (parentId) {
            if (!source[parentId]) {
                source[parentId] = [];
            }
            if (!source[parentId][this.props.index]) {
                source[parentId][this.props.index] = {subAnswers: {}}
            }
            if (!source[parentId][this.props.index].subAnswers) {
                source[parentId][this.props.index].subAnswers = {};
            }
            if (!source[parentId][this.props.index].subAnswers[item.variable]) {
                switch(item.answerType) {
                    case 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_FREE_TEXT':
                        source[parentId][this.props.index].subAnswers[item.variable] = {date: item.multiAnswer ? answerDate : null, value: ''};
                        break;
                    case 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_SINGLE_ANSWER':
                        source[parentId][this.props.index].subAnswers[item.variable] = {date: item.multiAnswer ? answerDate : null, value: ''};
                        break;
                    case 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_MULTIPLE_ANSWERS':
                        source[parentId][this.props.index].subAnswers[item.variable] = {date: item.multiAnswer ? answerDate : null, value: []};
                        break;
                    default:
                        source[parentId][this.props.index].subAnswers[item.variable] = {date: item.multiAnswer ? answerDate : null, value: ''};
                        break;
                }
            }
        } else {
            if (!source[item.variable]) {
                switch(item.answerType) {
                    case 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_FREE_TEXT':
                        source[item.variable] = [];
                        source[item.variable].push({date: item.multiAnswer ? answerDate : null, value: ''});
                        break;
                    case 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_SINGLE_ANSWER':
                        source[item.variable] = [];
                        source[item.variable].push({date: item.multiAnswer ? answerDate : null, value: ''});
                        break;
                    case 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_MULTIPLE_ANSWERS':
                        source[item.variable] = [];
                        source[item.variable].push({date: item.multiAnswer ? answerDate : null, value: []});
                        break;
                    default:
                        source[item.variable] = [];
                        source[item.variable].push({date: item.multiAnswer ? answerDate : null, value: ''});
                        break;
                }
            }
        }


        let questionAnswers = parentId ? get(source, `[${parentId}][${this.props.index}].subAnswers[${item.variable}][0].value`, '') : get(source, `[${item.variable}][${this.props.index}].value`, '');

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
                        // console.log('Inside filter: ', e);
                        return e && e.value && questionAnswers.indexOf(e.value) > -1;
                    }).map((e) => {
                        return {label: getTranslation(e.label, this.props.translation), value: e.value || null}
                    }) : [];
            }
        }

        switch(item.answerType) {
            case 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_FREE_TEXT':
                return (
                    <TextInput
                        id={item.variable}
                        label={translations.questionCardLabels.textInputLabel}
                        skipLabel={true}
                        labelValue={item.text}
                        value={questionAnswers}
                        isEditMode={this.props.isEditMode}
                        isRequired={item.required}
                        onChange={(text, id) => {
                            let valueToSend = {
                                date: answerDate, value: text
                            };
                            this.props.onChangeTextAnswer(valueToSend, id, parentId, this.props.index);
                        }}

                        multiline={true}
                        style={style}
                        translation={this.props.translation}
                        screenSize={this.props.screenSize}
                        onFocus={this.props.onFocus}
                        onBlur={this.props.onBlur}
                    />
                );
            case 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_NUMERIC':
                return (
                    <TextInput
                        key={item.variable}
                        id={item.variable}
                        label={translations.questionCardLabels.textInputLabel}
                        skipLabel={true}
                        labelValue={item.text}
                        value={questionAnswers}
                        isEditMode={this.props.isEditMode}
                        isRequired={item.required}
                        onChange={(text, id) => {
                            let valueToSend = {
                                date: answerDate, value: parseFloat(text)
                            };
                            this.props.onChangeTextAnswer(valueToSend, id, parentId, this.props.index);
                        }}
                        multiline={true}
                        keyboardType={'numeric'}
                        style={style}
                        translation={this.props.translation}
                        screenSize={this.props.screenSize}
                        onFocus={this.props.onFocus}
                        onBlur={this.props.onBlur}
                    />
                );
            case 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_DATE_TIME':
                return (
                    <DatePicker
                        key={item.variable}
                        id={item.variable}
                        label={translations.questionCardLabels.datePickerLabel}
                        skipLabel={true}
                        value={questionAnswers}
                        isEditMode={get(this.props, 'isEditMode', true)}
                        isRequired={item.required}
                        onChange={(date, id) => {
                            let valueToSend = {
                                date: answerDate, value: date
                            };
                            this.props.onChangeDateAnswer(valueToSend, id, parentId, this.props.index);
                        }}
                        style={style}
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
                        key={item.variable}
                        id={item.variable}
                        label={translations.questionCardLabels.dropDownInputLabel}
                        skipLabel={true}
                        labelValue={item.text}
                        value={questionAnswers}
                        data={dataWithNoneOption}
                        isEditMode={this.props.isEditMode}
                        isRequired={item.required}
                        onChange={(selectedValue, id) => {
                            let valueToSend = {
                                date: answerDate, value: selectedValue.value
                            };
                            let index = item.answers.findIndex((e) => {return e.value === selectedValue.value});
                            if (item.answers[index] && item.answers[index].additionalQuestions) {
                                valueToSend.subAnswers = {};
                                for (let i=0; i<item.answers[index].additionalQuestions.length; i++) {
                                    valueToSend.subAnswers[item.answers[index].additionalQuestions[i].variable] = [{date: answerDate, value: ''}]
                                }
                            }
                            this.props.onChangeSingleSelection(valueToSend, id, parentId, this.props.index);
                        }}
                        style={style}
                        translation={this.props.translation}
                        screenSize={this.props.screenSize}
                    />
                );
            case 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_MULTIPLE_ANSWERS':
                return (
                    <DropDown
                        key={uniqueId('key_')}
                        id={item.variable}
                        label={translations.questionCardLabels.dropDownLabel}
                        skipLabel={true}
                        labelValue={item.text}
                        value={questionAnswers}
                        data={item.answers.map((e) => {return {label: getTranslation(e.label, this.props.translation), value: e.value}})}
                        isEditMode={this.props.isEditMode}
                        isRequired={item.required}
                        onChange={(selectedAnswers, id) => {
                            let valueToSend = {
                                date: answerDate, value: selectedAnswers.map((e) => {return e.value})
                            };
                            let subAnswers = {};
                            for (let j=0; j<valueToSend.value.length; j++) {
                                let index = item.answers.findIndex((e) => {return e.value === valueToSend.value[j]});
                                if (item.answers[index] && item.answers[index].additionalQuestions) {
                                    for (let i=0; i<item.answers[index].additionalQuestions.length; i++) {
                                        subAnswers[item.answers[index].additionalQuestions[i].variable] = [{date: answerDate, value: ''}]
                                    }
                                }
                            }
                            if (subAnswers !== {}) {
                                valueToSend.subAnswers = subAnswers;
                            }
                            this.props.onChangeMultipleSelection(valueToSend, id, parentId, this.props.index);
                        }}
                        style={style}
                        dropDownStyle={{width: width, alignSelf: 'center'}}
                        showDropdown={this.state.showDropdown}
                    />
                );
            case 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_MARKUP':
                return (
                    <Section key={item.variable} label={getTranslation(item.text, this.props.translation)} containerStyle={{marginBottom: 8}} />
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
        return (
            <View key={uniqueId('key_')}>
                {
                    additionalQuestion.answerType !== 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_MARKUP' ? (
                        <Section key={uniqueId('key_')} label={getTranslation(additionalQuestion.text, this.props.translation)} labelSize={'medium'} style={{marginBottom: 3}} />
                    ) : (null)
                }
                {
                    this.handleRenderItemByType(additionalQuestion, parentId)
                }
            </View>
        )
    };

    onChangeAnswerDate = (date, id, index) => {
        this.props.onChangeAnswerDate(date, id, index);
    };

    handleDeletePrevAnswer = (index) => {
        Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.deletePreviousAnswer, this.state.translation), [
            {
                text: getTranslation(translations.generalLabels.noAnswer, this.props.translation), onPress: () => { console.log('Cancel pressed') }
            },
            {
                text: getTranslation(translations.generalLabels.yesAnswer, this.props.translation), onPress: () => {
                    this.deletePreviousAnswer(index);
                }
            }
        ]);
    };

    deletePreviousAnswer = (index) => {
        let questionnaireAnswers = cloneDeep(this.props.source[this.props.item.variable]);
        questionnaireAnswers.splice(index, 1);
        this.props.savePreviousAnswers(questionnaireAnswers, this.props.item.variable);
    };

    handleCopyAnswerDate = (value) => {
        Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.copyAnswerDate, this.state.translation), [
            {
                text: getTranslation(translations.generalLabels.noAnswer, this.props.translation), onPress: () => { console.log('Cancel pressed') }
            },
            {
                text: getTranslation(translations.generalLabels.yesAnswer, this.props.translation), onPress: () => {
                    this.copyAnswerDate(value);
                }
            }
        ]);
    };

    copyAnswerDate = (value) => {
        this.props.copyAnswerDate(value);
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

export default connect(mapStateToProps)(QuestionCardContent);