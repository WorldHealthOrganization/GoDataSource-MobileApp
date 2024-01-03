// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {Icon} from 'react-native-material-ui';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {connect} from "react-redux";
import _, {sortBy, isEqual} from 'lodash';
import {calculateDimension, getTranslation} from './../utils/functions';
import translations from './../utils/translations';
import ElevatedView from 'react-native-elevated-view';
import config from './../utils/config';
import QuestionCardContent from './../components/QuestionCardContent';
import cloneDeep from "lodash/cloneDeep";
import get from 'lodash/get';
import set from 'lodash/set';
import ViewHOC from './../components/ViewHOC';
import {extractAllQuestions} from "../utils/functions";
import Ripple from 'react-native-material-ripple';
import uniqueId from "lodash/uniqueId";
import {Navigation} from "react-native-navigation";
import styles from './../styles';

class PreviousAnswers extends Component {


    constructor(props) {
        super(props);
        this.state = {
            previousAnswers: this.props.previousAnswers || [],
            isModified: false,
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.previousAnswers !== undefined && this.props.previousAnswers !== undefined){
            if( this.props.previousAnswers.length !== prevProps.previousAnswers.length){
                this.setState({
                    previousAnswers: this.props.previousAnswers || []
                });
            }else{
                if( !isEqual(this.props.previousAnswers, prevProps.previousAnswers)){
                    this.setState({
                        previousAnswers: this.props.previousAnswers || []
                    });
                }else {
                    let shouldUpdate = false;
                    for (let i=0; i<this.props.previousAnswers.length; i++) {
                        if(this.props.previousAnswers[i].hasOwnProperty('subAnswers')){
                            //did not have subAnswer previously
                            if(!prevProps.previousAnswers[i].hasOwnProperty('subAnswers')){
                                shouldUpdate = true;
                            }else {
                                if (typeof this.props.previousAnswers[i].subAnswers === 'object') {
                                    //did not have a key in subAnswers previously
                                    if (typeof prevProps.previousAnswers[i].subAnswers !== 'object'){
                                        shouldUpdate = true;
                                    }else {
                                        //has more keys in subAnswers than previously
                                        if (Object.keys(this.props.previousAnswers[i].subAnswers).length !== Object.keys(prevProps.previousAnswers[i].subAnswers).length) {
                                            shouldUpdate = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if(shouldUpdate){
                        this.setState({
                            previousAnswers: this.props.previousAnswers || []
                        });
                    }
                }
            }
        } else {
            if (prevProps.previousAnswers === undefined && this.props.previousAnswers !== undefined){
                this.setState({
                    previousAnswers: this.props.previousAnswers || []
                });
            }
        }
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <ViewHOC style={style.previousAnswerContainer} showLoader={false} loaderText={"test"}>
                <View style={[style.previousAnswerInner, {
                    marginHorizontal: calculateDimension(24, false, this.props.screenSize),
                    marginVertical: calculateDimension(5, true, this.props.screenSize)
                }]}>
                    <Text style={style.previousAnswerInnerText}>
                        { getTranslation(translations.questionCardLabels.previousAnswers, this.props.translation) }
                    </Text>
                    <Ripple style={[style.previousAnswerInnerRipple, {
                        height: calculateDimension(25, true, this.props.screenSize),
                        width: calculateDimension(36, false, this.props.screenSize)
                    }]}
                    onPress={() => this.props.onCollapse(this.props.item)}>
                        <Icon name={this.props.isCollapsed ? "arrow-drop-down" : "arrow-drop-up"} />
                    </Ripple>
                </View>
                { this.props.isCollapsed &&
                    <View style={style.mapContainer} contentContainerStyle={style.containerContent}>
                        {
                            Array.isArray(this.state.previousAnswers) && this.state.previousAnswers.map((previousAnswer, index) => {
                                return this.renderListOfPreviousAnswers(previousAnswer, index);
                            })
                        }
                    </View>
                }
            </ViewHOC>
        );
    }

    handleOnFocus = (event) => {
    };

    handleOnBlur = (event) => {
    };

    // Please write here all the methods that are not react native lifecycle methods
    handlePressNavbarButton = () => {
        Navigation.dismissModal(this.props.componentId);
    };

    renderListOfPreviousAnswers = (previousAnswer, index) => {
        let width = calculateDimension(config.designScreenSize.width - 32, false, this.props.screenSize);
        let viewWidth = calculateDimension(315, false, this.props.screenSize);
        let marginHorizontal = calculateDimension(14, false, this.props.screenSize);
        let buttonHeight = calculateDimension(25, true, this.props.screenSize);
        let buttonWidth = calculateDimension(120, false, this.props.screenSize);

        let source = {};
        source[this.props.previousAnswerVariable] = this.state.previousAnswers;
        let sortedQuestions = sortBy(cloneDeep([this.props.item]), ['order', 'variable']);
        sortedQuestions = extractAllQuestions(sortedQuestions, source, index);
        return (
            <ElevatedView
                style={[style.previousAnswerContent, { width: width }]}
                elevation={5}
                key={index}
            >
                <QuestionCardContent
                    index={index}
                    isCollapsed={true}
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
                    onChangeTextAnswer={(value, id, parentId, index) => {
                        this.onChangeTextAnswer(value, id, parentId, index)
                    }}
                    onChangeDateAnswer={(value, id, parentId, index) => {
                        this.onChangeDateAnswer(value, id, parentId, index)
                    }}
                    onChangeSingleSelection={(value, id, parentId, index) => {
                        this.onChangeSingleSelection(value, id, parentId, index)
                    }}
                    onChangeMultipleSelection={(value, id, parentId, index) => {
                        this.onChangeMultipleSelection(value, id, parentId, index)
                    }}
                    isEditMode={true}
                    editableQuestionDate={true}
                    onChangeAnswerDate={(value, questionId, index) => {
                        this.onChangeAnswerDate(value, questionId, index)
                    }}
                    copyAnswerDate={this.props.copyAnswerDate}
                />
                <View style={[style.previousAnswerContentInner, {
                    minHeight: calculateDimension(72, true, this.props.screenSize)
                }]}>
                    <Ripple onPress={() => { this.handleDeletePrevAnswer(index)}}>
                        <Icon name="delete" color={styles.dangerColor} size={18} />
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
            if(!questionnaireAnswers[index].hasOwnProperty("subAnswers")){
                questionnaireAnswers[index] = Object.assign({}, questionnaireAnswers[index],{ subAnswers: {}});
            }
            if( typeof questionnaireAnswers[index].subAnswers !== 'object' ){
                questionnaireAnswers[index].subAnswers = {};
            }
            if (!questionnaireAnswers[index].subAnswers[id]) {
                questionnaireAnswers[index].subAnswers[id] = [];
            }
            questionnaireAnswers[index].subAnswers[id][0] = value;
        } else {
            set(questionnaireAnswers, `[${index}]`, value);
        }

        // console.log('~~~~~~~~~~ onChangeTextAnswer', questionnaireAnswers);
        this.setState({
            previousAnswers: questionnaireAnswers || [],
            isModified: true
        }, () => {
            this.props.savePreviousAnswers(this.state.previousAnswers, this.props.previousAnswerVariable);
        });
    };

    onChangeSingleSelection = (value, id, parentId, index) => {
        // console.log ('onChangeSingleSelection', value, id, parentId, index);
        let questionnaireAnswers = _.cloneDeep(this.state.previousAnswers);

        if (parentId) {
            if(!questionnaireAnswers[index].hasOwnProperty("subAnswers")){
                questionnaireAnswers[index] = Object.assign({}, questionnaireAnswers[index],{ subAnswers: {}});
            }
            if( typeof questionnaireAnswers[index].subAnswers !== 'object' ){
                questionnaireAnswers[index].subAnswers = {};
            }
            if (!questionnaireAnswers[index].subAnswers[id]) {
                questionnaireAnswers[index].subAnswers[id] = [];
            }
            questionnaireAnswers[index].subAnswers[id][0] = value;
        } else {
            set(questionnaireAnswers, `[${index}]`, value);
        }

        // console.log('~~~~~~~~~~ onChangeSingleSelection', questionnaireAnswers);
        this.setState({
            previousAnswers: questionnaireAnswers || [],
            isModified: true
        }, () => {
            this.props.savePreviousAnswers(this.state.previousAnswers, this.props.previousAnswerVariable);
        });
    };

    onChangeMultipleSelection = (value, id, parentId, index) => {
        // console.log ('onChangeMultipleSelection', value, id, parentId, index, this.state.previousAnswers);
        let questionnaireAnswers = _.cloneDeep(this.state.previousAnswers);
        if (parentId) {
            if(!questionnaireAnswers[index].hasOwnProperty("subAnswers")){
                questionnaireAnswers[index] = Object.assign({}, questionnaireAnswers[index],{ subAnswers: {}});
            }
            if( typeof questionnaireAnswers[index].subAnswers !== 'object' ){
                questionnaireAnswers[index].subAnswers = {};
            }
            if (!questionnaireAnswers[index].subAnswers[id]) {
                questionnaireAnswers[index].subAnswers[id] = [];
            }
            questionnaireAnswers[index].subAnswers[id][0] = value;
        } else {
            set(questionnaireAnswers, `[${index}]`, value);
        }

        // console.log('~~~~~~~~~~ onChangeMultipleSelection', questionnaireAnswers);
        this.setState({
            previousAnswers: questionnaireAnswers || [],
            isModified: true
        }, () => {
            console.log ('questionnaireAnswers', this.state.previousAnswers);
            this.props.savePreviousAnswers(this.state.previousAnswers, this.props.previousAnswerVariable);
        });
    };

    onChangeDateAnswer = (value, id, parentId, index) => {
        let questionnaireAnswers = _.cloneDeep(this.state.previousAnswers);

        if (parentId) {
            if(!questionnaireAnswers[index].hasOwnProperty("subAnswers")){
                questionnaireAnswers[index] = Object.assign({}, questionnaireAnswers[index],{ subAnswers: {}});
            }
            if( typeof questionnaireAnswers[index].subAnswers !== 'object' ){
                questionnaireAnswers[index].subAnswers = {};
            }
            if (!questionnaireAnswers[index].subAnswers[id]) {
                questionnaireAnswers[index].subAnswers[id] = [];
            }
            questionnaireAnswers[index].subAnswers[id][0] = value;
        } else {
            set(questionnaireAnswers, `[${index}]`, value);
        }

        // console.log('~~~~~~~~~~ onChangeDateAnswer', questionnaireAnswers);
        this.setState({
            previousAnswers: questionnaireAnswers || [],
            isModified: true
        }, () => {
            this.props.savePreviousAnswers(this.state.previousAnswers, this.props.previousAnswerVariable);
        });
    };

    onChangeAnswerDate = (value, questionId, index) => {
        let questionnaireAnswers = _.cloneDeep(this.state.previousAnswers);
        set(questionnaireAnswers, `[${index}].date`, value);

        if (get(questionnaireAnswers, `[${index}].subAnswers`, null) !== null && get(questionnaireAnswers, `[${index}].subAnswers`, null) !== {}) {
            for (let subQuestionId in get(questionnaireAnswers, `[${index}].subAnswers`, null)) {
                questionnaireAnswers[index].subAnswers[subQuestionId] = questionnaireAnswers[index].subAnswers[subQuestionId].map((e) => {
                    return {value: e.value, date: value};
                })
            }
        }

        this.setState({
            previousAnswers: questionnaireAnswers || [],
            isModified: true
        }, () => {
            this.props.savePreviousAnswers(this.state.previousAnswers, this.props.previousAnswerVariable);
        });
    };

    savePreviousAnswers = () => {
        this.props.savePreviousAnswers(this.state.previousAnswers, this.props.previousAnswerVariable);
        this.props.onCollapse(this.props.item);
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
        let questionnaireAnswers = cloneDeep(this.state.previousAnswers);
        questionnaireAnswers.splice(index, 1);
        this.props.savePreviousAnswers(questionnaireAnswers, this.props.previousAnswerVariable);
    };
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    previousAnswerContainer: {
        backgroundColor: styles.screenBackgroundColor,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
        flex: 1
    },
    previousAnswerInner: {
        alignSelf: 'center',
        backgroundColor: styles.screenBackgroundColor,
        borderTopWidth: 1,
        borderTopColor: styles.screenBackgroundColor,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        width: '100%'
    },
    previousAnswerInnerText: {
        fontFamily: 'Roboto-Medium',
        fontSize: 16
    },
    previousAnswerInnerRipple: {
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    mapContainer: {
        backgroundColor: styles.screenBackgroundColor,
        flex: 1
    },
    containerContent: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    previousAnswerContent: {
        backgroundColor: styles.backgroundColor,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
        flexDirection: 'row'
    },
    previousAnswerContentInner: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 50
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        translation: state.app.translation
    };
}

export default connect(mapStateToProps)(PreviousAnswers);