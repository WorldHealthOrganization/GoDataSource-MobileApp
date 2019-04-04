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
import cloneDeep from "lodash/cloneDeep";
import {extractAllQuestions} from "../utils/functions";

class PreviousAnswersScreen extends Component {

    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    // Please add here the react lifecycle methods that you need
    static getDerivedStateFromProps(props, state) {
        return null;
    }


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        console.log('Render PreviousAnswersScreen: ', this.props.previousAnswers);
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
                            {'Previous Answers'}
                        </Text>
                    </View>
                }
                              title={null}
                              navigator={this.props.navigator}
                              iconName="close"
                              handlePressNavbarButton={this.handlePressNavbarButton}
                />
                <ScrollView style={style.mapContainer} contentContainerStyle={style.containerContent}>
                    {
                        this.props && this.props.previousAnswers && Array.isArray(this.props.previousAnswers) && this.props.previousAnswers.length > 0 && this.props.previousAnswers.map((previousAnswer, index) => {
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

    listEmptyComponent = () => {
        return (
            <View style={[style.mapContainer, {height: calculateDimension((667 - 152), true, this.props.screenSize)}]}>
                <Text style={style.emptyComponentTextView}>
                    {getTranslation(translations.helpScreen.noHelpItemsToShowMessage, this.props.translation)}
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
        source[this.props.previousAnswerVariable] = [this.props.previousAnswers[index]];
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
                    onChangeTextAnswer={() => {}}
                    onChangeDateAnswer={() => {}}
                    onChangeSingleSelection={() => {}}
                    onChangeMultipleSelection={() => {}}
                    isEditMode={false}
                />
            </ElevatedView>
        )
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