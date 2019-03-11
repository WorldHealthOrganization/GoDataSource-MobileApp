/**
 * Created by florinpopa on 27/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {View, Text, StyleSheet, Platform, Dimensions, Image, FlatList, ScrollView} from 'react-native';
import {ListItem, Icon} from 'react-native-material-ui';
import {calculateDimension, getTranslation} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import Button from './Button';
import styles from './../styles';
import Ripple from 'react-native-material-ripple';
import ElevatedView from 'react-native-elevated-view';
import DropdownInput from './DropdownInput';
import TextInput from './TextInput';
import DropDown from './DropDown';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import DatePicker from './DatePicker';
import translations from './../utils/translations';
import QuestionCardTitle from './QuestionCardTitle';


class QuestionCard extends Component {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {
            showDropdown: false
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        // console.log("Next source, old source: ", nextProps.source.questionnaireAnswers[nextProps.item.variable], this.props.source.questionnaireAnswers[this.props.item.variable]);
        if (nextProps.isEditMode !== this.props.isEditMode || !isEqual(nextProps.source.questionnaireAnswers[nextProps.item.variable], this.props.source.questionnaireAnswers[this.props.item.variable])) {
            // console.log("Next source, old source: ", nextProps.item.variable, nextProps.source.questionnaireAnswers[nextProps.item.variable], this.props.source.questionnaireAnswers[this.props.item.variable]);
            return true;
        }
        return false;
    }

    // Please add here the react lifecycle methods that you need
    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        // console.log('Render stuff');
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
                <ScrollView scrollEnabled={false} keyboardShouldPersistTaps={'always'}>
                    {
                        this.handleRenderItem(this.props.item)
                    }
                </ScrollView>
            </ElevatedView>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (item) => {
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

    handleRenderItemByType = (item) => {
        // console.log("Answers: ", item);

        let width = calculateDimension(315, false, this.props.screenSize);
        let marginHorizontal = calculateDimension(14, false, this.props.screenSize);
        let source = cloneDeep(this.props.source);
        if (!source.questionnaireAnswers) {
            source.questionnaireAnswers = {};
        }
        if (!source.questionnaireAnswers[item.variable]) {
            switch(item.answerType) {
                case 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_FREE_TEXT':
                    source.questionnaireAnswers[item.variable] = '';
                    break;
                case 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_SINGLE_ANSWER':
                    source.questionnaireAnswers[item.variable] = '';
                    break;
                case 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_MULTIPLE_ANSWERS':
                    source.questionnaireAnswers[item.variable] = [];
                    break;
                default:
                    source.questionnaireAnswers[item.variable] = '';
                    break;
            }
        }
        let questionAnswers = item.answerType === 'Free text' ? source.questionnaireAnswers[item.text] : source.questionnaireAnswers[item.variable] || null;

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
                        onChange={this.props.onChangeTextAnswer}
                        multiline={true}
                        style={{width: width, marginHorizontal: marginHorizontal}}
                        translation={this.props.translation}
                        screenSize={this.props.screenSize}
                        onFocus={this.props.onFocus}
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
                        onChange={this.props.onChangeTextAnswer}
                        multiline={true}
                        keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
                        style={{width: width, marginHorizontal: marginHorizontal}}
                        translation={this.props.translation}
                        screenSize={this.props.screenSize}
                        onFocus={this.props.onFocus}
                    />
                );
            case 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_DATE_TIME':
                return (
                    <DatePicker
                        id={item.variable}
                        label={translations.questionCardLabels.datePickerLabel}
                        value={questionAnswers}
                        isEditMode={this.props.isEditMode}
                        isRequired={item.required}
                        onChange={this.props.onChangeDateAnswer}
                        style={{width: width, marginHorizontal: marginHorizontal}}
                        translation={this.props.translation}
                    />
                );
            case 'LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_SINGLE_ANSWER':
                const data = item.answers.map((e) => {return {value: getTranslation(e.label, this.props.translation), id: e.value}})
                const dataWithNoneOption = _.cloneDeep(data)
                if (dataWithNoneOption !== undefined && dataWithNoneOption !== null && dataWithNoneOption.length > 0) {
                    const dataFormatKeys = Object.keys(dataWithNoneOption[0])
                    if (dataFormatKeys.length === 2) {
                        const noneLabel = getTranslation(translations.generalLabels.noneLabel, this.props.translation)
                        if (dataFormatKeys[0] === 'label' && dataFormatKeys[1] === 'value'){
                            noneData = { label: noneLabel, value: null }
                            dataWithNoneOption.unshift(noneData)
                        } else if (dataFormatKeys[0] === 'value' && dataFormatKeys[1] === 'id'){
                            noneData = { value: noneLabel, id: null }
                            dataWithNoneOption.unshift(noneData)
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
                        onChange={this.props.onChangeSingleSelection}
                        style={{width: width, marginHorizontal: marginHorizontal}}
                        translation={this.props.translation}
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
                        onChange={this.props.onChangeMultipleSelection}
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
        contacts: state.contacts,
        cases: state.cases,
        events: state.events,
        translation: state.app.translation
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(QuestionCard);
