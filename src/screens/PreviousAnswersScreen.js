// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {View, Text, StyleSheet, Alert, ScrollView} from 'react-native';
import styles from './../styles';
import NavBarCustom from './../components/NavBarCustom';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import _, {sortBy} from 'lodash';
import {calculateDimension, getTranslation} from './../utils/functions';
import translations from './../utils/translations';
import ElevatedView from 'react-native-elevated-view';
import config from './../utils/config';
import QuestionCardContent from './../components/QuestionCardContent';
import ActionsBar from './../components/ActionsBar';
import cloneDeep from "lodash/cloneDeep";
import get from 'lodash/get';
import set from 'lodash/set';
import {extractAllQuestions} from "../utils/functions";
import Button from './../components/Button';

class PreviousAnswersScreen extends Component {

    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
            previousAnswers: this.props.previousAnswers
        };
    }

    // Please add here the react lifecycle methods that you need

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        // console.log('Render PreviousAnswersScreen: ', this.state.previousAnswers);
        return (
            <View style={{flex: 1, backgroundColor: 'white'}}>
                <NavBarCustom customTitle={
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            height: '100%'
                        }}
                    >
                        <Text style={[style.title, {marginLeft: 30}]}>
                            {getTranslation(translations.previousAnswersScreen.previousAnswersTitle, this.props.translation)}
                        </Text>
                    </View>
                }
                              title={null}
                              navigator={this.props.navigator}
                              iconName="close"
                              handlePressNavbarButton={this.handlePressNavbarButton}
                />
                <View style={{backgroundColor: styles.screenBackgroundGrey, justifyContent: 'center', alignItems: 'center'}}>
                    <Button
                        title={getTranslation(translations.generalButtons.saveButtonLabel, this.props.translation)}
                        onPress={this.savePreviousAnswers}
                        color={styles.buttonGreen}
                        titleColor={'white'}
                        height={calculateDimension(25, true, this.props.screenSize)}
                        width={calculateDimension(130, false, this.props.screenSize)}
                        style={{
                            marginVertical: calculateDimension(12.5, true, this.props.screenSize),
                            marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                        }}/>

                </View>
                <ScrollView style={style.mapContainer} contentContainerStyle={style.containerContent}>
                    {
                        this.state && this.state.previousAnswers && Array.isArray(this.state.previousAnswers) && this.state.previousAnswers.length > 0 && this.state.previousAnswers.map((previousAnswer, index) => {
                            return this.renderListOfPreviousAnswers(previousAnswer, index);
                        })
                    }
                </ScrollView>
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handlePressNavbarButton = () => {
       this.props.navigator.dismissModal();
    };

    // List render methods
    listEmptyComponent = () => {
        return (
            <View style={[style.mapContainer, {height: calculateDimension((667 - 152), true, this.props.screenSize)}]}>
                <Text style={style.emptyComponentTextView}>
                    {getTranslation(translations.previousAnswersScreen.noPreviousAnswersToShowMessage, this.props.translation)}
                </Text>
            </View>
        )
    };
    renderListOfPreviousAnswers = (previousAnswer, index) => {
        console.log('renderListOfPreviousAnswers: ', previousAnswer, index);
        let width = calculateDimension(config.designScreenSize.width - 32, false, this.props.screenSize);
        let viewWidth = calculateDimension(315, false, this.props.screenSize);
        let viewHeight = calculateDimension(30, true, this.props.screenSize);
        let marginHorizontal = calculateDimension(14, false, this.props.screenSize);
        let buttonHeight = calculateDimension(25, true, this.props.screenSize);
        let buttonWidth = calculateDimension(120, false, this.props.screenSize);

        let source = {};
        source[this.props.previousAnswerVariable] = [this.state .previousAnswers[index]];
        let sortedQuestions = sortBy(cloneDeep([this.props.item]), ['order', 'variable']);
        sortedQuestions = extractAllQuestions(sortedQuestions, source);
        return (
            <ElevatedView
                style={{
                    width: width,
                    marginVertical: 10,
                    backgroundColor: 'white'
                }}
                elevation={5}
                key={index}
            >
                <QuestionCardContent
                    item={sortedQuestions[0]}
                    source={source}
                    viewWidth={viewWidth}
                    viewMarginHorizontal={marginHorizontal}
                    hideButtons={true}
                    buttonWidth={buttonWidth}
                    buttonHeight={buttonHeight}
                    onClickAddNewMultiFrequencyAnswer={() => {}}
                    onChangeTextAnswer={(value, id, parentId) => {
                        this.onChangeTextAnswer(value, id, parentId, index)
                    }}
                    onChangeDateAnswer={(value, id, parentId) => {
                        this.onChangeDateAnswer(value, id, parentId, index)
                    }}
                    onChangeSingleSelection={(value, id, parentId) => {
                        this.onChangeSingleSelection(value, id, parentId, index)
                    }}
                    onChangeMultipleSelection={(value, id, parentId) => {
                        this.onChangeMultipleSelection(value, id, parentId, index)
                    }}
                    isEditMode={true}
                    editableQuestionDate={true}
                    onChangeAnswerDate={(value, questionId) => {
                        this.onChangeAnswerDate(value, questionId, index)
                    }}
                />
                <ActionsBar
                    textsArray={[getTranslation(translations.caseSingleScreen.deleteButton, this.props.translation)]}
                    textsStyleArray={[{fontFamily: 'Roboto-Regular', fontSize: 14, color: 'red', marginHorizontal}]}
                    onPressArray={[() => {this.handleDeletePrevAnswer(index)}]}
                    containerStyle={[{height: 54}]}
                    isEditMode={true}
                    translation={this.props.translation}
                />
            </ElevatedView>
        )
    };

    // On change answers
    onChangeTextAnswer = (value, id, parentId, index) => {
        // console.log ('onChangeTextAnswer', value, id, parentId, index);
        let questionnaireAnswers = _.cloneDeep(this.state.previousAnswers);

        if (parentId) {
            set(questionnaireAnswers, `[${index}].subAnswers[${id}][0]`, value);
        } else {
            set(questionnaireAnswers, `[${index}]`, value);
        }

        this.setState({
            previousAnswers: questionnaireAnswers,
            isModified: true
        }
        // , () => {
        //     console.log ('onChangeMultipleSelection after setState', this.state.previousAnswers)
        // }
        )
    };
    onChangeSingleSelection = (value, id, parentId, index) => {
        // console.log ('onChangeSingleSelection', value, id, parentId, index);
        let questionnaireAnswers = _.cloneDeep(this.state.previousAnswers);

        if (parentId) {
            set(questionnaireAnswers, `[${index}].subAnswers[${id}][0]`, value);
        } else {
            set(questionnaireAnswers, `[${index}]`, value);
        }

        this.setState({
            previousAnswers: questionnaireAnswers,
            isModified: true
        }
        // , () => {
        //     console.log ('onChangeMultipleSelection after setState', this.state.previousAnswers)
        // }
        )
    };
    onChangeMultipleSelection = (value, id, parentId, index) => {
        // console.log ('onChangeMultipleSelection', value, id, parentId, index);
        let questionnaireAnswers = _.cloneDeep(this.state.previousAnswers);

        if (parentId) {
            set(questionnaireAnswers, `[${index}].subAnswers[${id}][0]`, value);
        } else {
            set(questionnaireAnswers, `[${index}]`, value);
        }

        this.setState({
            previousAnswers: questionnaireAnswers,
            isModified: true
        }
        // , () => {
        //     console.log ('onChangeMultipleSelection after setState', this.state.previousAnswers)
        // }
        )
    };
    onChangeDateAnswer = (value, id, parentId, index) => {
        // console.log ('onChangeDateAnswer', value, id, parentId, index);
        let questionnaireAnswers = _.cloneDeep(this.state.previousAnswers);

        if (parentId) {
            set(questionnaireAnswers, `[${index}].subAnswers[${id}][0]`, value);
        } else {
            set(questionnaireAnswers, `[${index}]`, value);
        }

        this.setState({
            previousAnswers: questionnaireAnswers,
            isModified: true
        }
        // , () => {
        //     console.log ('onChangeDateAnswer after setState', this.state.previousAnswers)
        // }
        )
    };
    onChangeAnswerDate = (value, questionId, index) => {
        let questionnaireAnswers = _.cloneDeep(this.state.previousAnswers);

        set(questionnaireAnswers, `[${index}].date`, value);

        if (get(questionnaireAnswers, `[${index}].subAnswers`, null) !== null && get(questionnaireAnswers, `[${index}].subAnswers`, null) !== {}) {
            for (let subQuestionId in get(questionnaireAnswers, `[${index}].subAnswers`, null)) {
                set(questionnaireAnswers, `[${index}].subAnswers[${subQuestionId}].date`, value);
            }
        }

        // if (questionnaireAnswers && questionnaireAnswers[questionId] && Array.isArray(questionnaireAnswers[questionId]) && questionnaireAnswers[questionId].length) {
        //     if (questionnaireAnswers[questionId][0] && questionnaireAnswers[questionId][index].date) {
        //         questionnaireAnswers[questionId][0].date = value;
        //         if (questionnaireAnswers[questionId][0].subAnswers && typeof questionnaireAnswers[questionId][index].subAnswers === "object" && Object.keys(questionnaireAnswers[questionId][index].subAnswers).length > 0) {
        //             for (let subQuestionId in questionnaireAnswers[questionId][index].subAnswers) {
        //                 questionnaireAnswers[questionId][index].subAnswers[subQuestionId].map((e) => {
        //                     return {value: e.value, date: value};
        //                 })
        //             }
        //         }
        //     }
        // }

        this.setState({
            previousAnswers: questionnaireAnswers,
            isModified: true
        }
        // , () => {
        //     console.log ('onChangeAnswerDate after setState', this.state.previousAnswers);
        // }
        )
    };

    savePreviousAnswers = () => {
        this.props.savePreviousAnswers(this.state.previousAnswers, this.props.previousAnswerVariable);
    };

    handleDeletePrevAnswer = (index) => {
        Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.deletePreviousAnswer, this.state.translation), [
            {
                text: getTranslation(translations.generalLabels.noAnswer, this.props.translation), onPress: () => {console.log('Cancel pressed')}
            },
            {
                text: getTranslation(translations.generalLabels.yesAnswer, this.props.translation), onPress: () => {
                    this.deletePreviousAnswer(index);
                }
            }
        ]);
    };
    deletePreviousAnswer = (index) => {
        let questionnaireAnswers = cloneDeep(this.state.previousAnswers);

        questionnaireAnswers.splice(index, 1);

        this.setState({
            previousAnswers: questionnaireAnswers
        })
    };
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    mapContainer: {
        flex: 1,
        backgroundColor: styles.screenBackgroundGrey
    },
    containerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    separatorComponentStyle: {
        height: 8
    },
    listViewStyle: {

    },
    componentContainerStyle: {

    },
    emptyComponent: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyComponentTextView: {
        fontFamily: 'Roboto-Light',
        fontSize: 15,
        color: styles.textEmptyList
    },
    buttonEmptyListText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 16.8,
        color: styles.buttonTextGray
    },
    breadcrumbContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
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

export default connect(mapStateToProps, matchDispatchProps)(PreviousAnswersScreen);