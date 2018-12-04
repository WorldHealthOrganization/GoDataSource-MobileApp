/**
 * Created by mobileclarisoft on 10/09/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {TextInput, View, Text, StyleSheet, FlatList, TouchableWithoutFeedback, Keyboard} from 'react-native';
import {calculateDimension, extractAllQuestions, mapQuestions, getTranslation} from '../utils/functions';
import config from '../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import styles from '../styles';
import QuestionCard from '../components/QuestionCard';
import Button from '../components/Button';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {sortBy} from 'lodash';
import translations from './../utils/translations'

class CaseSingleInvestigationContainer extends PureComponent {

    // This will be a container, so put as less business logic here as possible
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
         // Get all additional questions recursively
        let sortedQuestions = extractAllQuestions(this.props.questions, this.props.item);
        sortedQuestions = sortBy(sortedQuestions, ['order', 'variable']);

        return (
            <TouchableWithoutFeedback onPress={() => {
                Keyboard.dismiss()
            }} accessible={false}>
                <View style={style.container}>
                    <View style={{flexDirection: 'row'}}>
                    {
                        this.props.isNew ? (
                            <View style={{flexDirection: 'row', width: '90%', alignItems: 'center'}}>
                                <Button
                                title={getTranslation(translations.generalButtons.backButtonLabel, this.props.translation)}
                                onPress={this.handleBackButton}
                                color={styles.buttonGreen}
                                titleColor={'white'}
                                height={calculateDimension(25, true, this.props.screenSize)}
                                width={calculateDimension(130, false, this.props.screenSize)}
                                style={{
                                    marginVertical: calculateDimension(12.5, true, this.props.screenSize),
                                    marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                                }}/>
                                <Button
                                    title={getTranslation(translations.generalButtons.saveButtonLabel, this.props.translation)}
                                    onPress={this.props.onPressSave}
                                    color={styles.buttonGreen}
                                    titleColor={'white'}
                                    height={calculateDimension(25, true, this.props.screenSize)}
                                    width={calculateDimension(130, false, this.props.screenSize)}
                                    style={{
                                        marginVertical: calculateDimension(12.5, true, this.props.screenSize),
                                        marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                                    }}/>
                            </View>
                            )
                            : (
                            this.props.isEditMode ? (
                                <View style={{flexDirection: 'row'}}>
                                    <Button
                                        title={getTranslation(translations.generalButtons.saveButtonLabel, this.props.translation)}
                                        onPress={this.props.onPressSaveEdit}
                                        color={styles.buttonGreen}
                                        titleColor={'white'}
                                        height={calculateDimension(25, true, this.props.screenSize)}
                                        width={calculateDimension(166, false, this.props.screenSize)}
                                        style={{
                                            marginVertical: calculateDimension(12.5, true, this.props.screenSize),
                                            marginRight: 10,
                                    }}/>
                                    <Button
                                        title={getTranslation(translations.generalButtons.cancelButtonLabel, this.props.translation)}
                                        onPress={this.props.onPressCancelEdit}
                                        color={styles.buttonGreen}
                                        titleColor={'white'}
                                        height={calculateDimension(25, true, this.props.screenSize)}
                                        width={calculateDimension(166, false, this.props.screenSize)}
                                        style={{
                                            marginVertical: calculateDimension(12.5, true, this.props.screenSize),
                                            marginRight: 10,
                                    }}/>
                                </View>) : (
                                <Button
                                    title={getTranslation(translations.generalButtons.editButtonLabel, this.props.translation)}
                                    onPress={this.props.onPressEdit}
                                    color={styles.buttonGreen}
                                    titleColor={'white'}
                                    height={calculateDimension(25, true, this.props.screenSize)}
                                    width={calculateDimension(166, false, this.props.screenSize)}
                                    style={{
                                        marginVertical: calculateDimension(12.5, true, this.props.screenSize),
                                        marginRight: 10,
                                    }}/>))
                    }
                    </View>
                    <KeyboardAwareScrollView
                        style={style.containerScrollView}
                        contentContainerStyle={[style.contentContainerStyle, {paddingBottom: this.props.screenSize.height < 600 ? 70 : 20}]}
                        keyboardShouldPersistTaps={'always'}
                    >
                        {
                            sortedQuestions.map((item, index) => {
                                return this.handleRenderItem(item, index)
                            })
                        }
                    </KeyboardAwareScrollView>
                </View>
            </TouchableWithoutFeedback>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderSectionedList = (item, index) => {
        return (
            <View>
                <Section
                    label={this.getTranslation(item.categoryName)}
                    containerStyle={{
                        marginVertical: 10
                    }}
                    translation={this.props.translation}
                />
                {
                    item.questions.map((item, index) => {
                        return this.handleRenderItem(item, index)
                    })
                }
            </View>
        )
    };

    handleRenderItem = (item, index) => {
        return (
            <QuestionCard
                item={item}
                isEditMode={this.props.isEditMode}
                index={index + 1}
                source={this.props.item}
                onChangeTextAnswer={this.props.onChangeTextAnswer}
                onChangeSingleSelection={this.props.onChangeSingleSelection}
                onChangeMultipleSelection={this.props.onChangeMultipleSelection}
                onChangeDateAnswer={this.props.onChangeDateAnswer}
            />
        )
    }

    handleBackButton = () => {
        this.props.handleMoveToPrevieousScreenButton()
    }

    getTranslation = (value) => {
        if (value && value !== '') {
            let valueToBeReturned = value;
            if (value && typeof value === 'string' && value.includes('LNG')) {
                valueToBeReturned = value && this.props.translation && Array.isArray(this.props.translation) && this.props.translation[this.props.translation.map((e) => {
                    return e && e.token ? e.token : null
                }).indexOf(value)] ? this.props.translation[this.props.translation.map((e) => {
                    return e.token
                }).indexOf(value)].translation : '';
            }
            return valueToBeReturned;
        }
        return '';
    };
}


// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: styles.screenBackgroundGrey,
        alignItems: 'center',
    },
    cardStyle: {
        marginVertical: 4,
        flex: 1
    },
    containerScrollView: {
        flex: 1,
        backgroundColor: styles.screenBackgroundGrey
    },
    contentContainerStyle: {
        alignItems: 'center'
    },
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        questions: state.outbreak.caseInvestigationTemplate,
        translation: state.app.translation
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(CaseSingleInvestigationContainer);
