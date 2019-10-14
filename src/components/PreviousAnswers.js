// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, { Component } from 'react';
import {Icon} from 'react-native-material-ui';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import styles from './../styles';
import NavBarCustom from './../components/NavBarCustom';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import _, { sortBy } from 'lodash';
import { calculateDimension, getTranslation } from './../utils/functions';
import translations from './../utils/translations';
import ElevatedView from 'react-native-elevated-view';
import config from './../utils/config';
import QuestionCardContent from './../components/QuestionCardContent';
import ActionsBar from './../components/ActionsBar';
import cloneDeep from "lodash/cloneDeep";
import get from 'lodash/get';
import set from 'lodash/set';
import ViewHOC from './../components/ViewHOC';
import { extractAllQuestions } from "../utils/functions";
import Ripple from 'react-native-material-ripple';
import Button from './../components/Button';

class PreviousAnswers extends Component {

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
        return (
            <ViewHOC style={{ flex: 1, backgroundColor: styles.screenBackgroundGrey,}}
                     showLoader={false}
                     loaderText={"test"}
            >
                <View style={{
                    backgroundColor: styles.screenBackgroundGrey,
                    flexDirection: 'row-reverse',
                    alignSelf: 'center',
                    width: '100%',
                    borderTopColor: styles.screenBackgroundGrey,
                    borderTopWidth: 1
                }}>
                    <Ripple onPress={() => this.props.onCollapse(this.props.item)}>
                        <Icon name="arrow-drop-down"/>
                    </Ripple>
                </View>
                <View style={style.mapContainer} contentContainerStyle={style.containerContent}>
                    {
                        this.state && this.state.previousAnswers && Array.isArray(this.state.previousAnswers) && this.state.previousAnswers.length > 0 && this.state.previousAnswers.map((previousAnswer, index) => {
                            return this.renderListOfPreviousAnswers(previousAnswer, index);
                        })
                    }
                </View>
            </ViewHOC>
        );
    }

    handleOnFocus = (event) => {
        // this.scrollToInput(findNodeHandle(event.target))
    };

    handleOnBlur = (event) => {
        // this.scrollPrevAnswer.props.scrollToPosition(0, 0, false)
        // this.scrollToInput(findNodeHandle(event.target))
    };

    // Please write here all the methods that are not react native lifecycle methods
    handlePressNavbarButton = () => {
        this.props.navigator.dismissModal();
    };

    // List render methods
    listEmptyComponent = () => {
        return (
            <View style={[style.mapContainer, { height: calculateDimension((667 - 152), true, this.props.screenSize) }]}>
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
        source[this.props.previousAnswerVariable] = [this.state.previousAnswers[index]];
        let sortedQuestions = sortBy(cloneDeep([this.props.item]), ['order', 'variable']);
        sortedQuestions = extractAllQuestions(sortedQuestions, source);
        return (
            <ElevatedView
                style={{
                    width: width,
                    marginVertical: 10,
                    backgroundColor: 'white',
                    flexDirection: 'row',
                }}
                elevation={5}
                key={index}
            >
                <QuestionCardContent
                    key={index}
                    item={sortedQuestions[0]}
                    onFocus={this.handleOnFocus}
                    onBlur={this.handleOnBlur}
                    source={source}
                    viewWidth={viewWidth - 30}
                    viewMarginHorizontal={marginHorizontal}
                    hideButtons={true}
                    buttonWidth={buttonWidth}
                    buttonHeight={buttonHeight}
                    onClickAddNewMultiFrequencyAnswer={() => { }}
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
                <View style={{
                    minHeight: calculateDimension(72, true, this.props.screenSize),
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 25
                }}>
                    <Ripple onPress={() => { this.handleDeletePrevAnswer(index)}}>
                        <Icon name="delete"/>
                    </Ripple>
                </View>
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
        });
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
        });
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
        });
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
        });
    };

    onChangeAnswerDate = (value, questionId, index) => {
        let questionnaireAnswers = _.cloneDeep(this.state.previousAnswers);

        set(questionnaireAnswers, `[${index}].date`, value);

        if (get(questionnaireAnswers, `[${index}].subAnswers`, null) !== null && get(questionnaireAnswers, `[${index}].subAnswers`, null) !== {}) {
            for (let subQuestionId in get(questionnaireAnswers, `[${index}].subAnswers`, null)) {
                set(questionnaireAnswers, `[${index}].subAnswers[${subQuestionId}].date`, value);
            }
        }

        this.setState({
            previousAnswers: questionnaireAnswers,
            isModified: true
        });
    };

    savePreviousAnswers = () => {
        this.props.savePreviousAnswers(this.state.previousAnswers, this.props.previousAnswerVariable);
    };

    handleDeletePrevAnswer = (index) => {
        Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.deletePreviousAnswer, this.state.translation), [
            {
                text: getTranslation(translations.generalLabels.noAnswer, this.props.translation), onPress: () => { console.log('Cancel pressed') }
            },
            {
                text: getTranslation(translations.generalLabels.yesAnswer, this.props.translation), onPress: () => {
                    this.deletePreviousAnswer(index);
                    this.props.onCollapse(this.props.item);
                }
            }
        ]);
    };

    deletePreviousAnswer = (index) => {
        let questionnaireAnswers = cloneDeep(this.state.previousAnswers);
        questionnaireAnswers.splice(index, 1);
        this.props.savePreviousAnswers(questionnaireAnswers, this.props.previousAnswerVariable);
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
    containerScrollView: {
        flex: 1,
        backgroundColor: styles.colorWhite
    },
    contentContainerStyle: {
        alignItems: 'center'
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

export default connect(mapStateToProps, matchDispatchProps)(PreviousAnswers);