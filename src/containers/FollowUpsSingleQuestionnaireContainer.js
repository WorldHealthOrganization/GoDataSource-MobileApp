/**
 * Created by florinpopa on 25/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {View, StyleSheet, InteractionManager} from 'react-native';
import {calculateDimension} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import styles from './../styles';
import QuestionCard from './../components/QuestionCard';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Button from './../components/Button';
import {LoaderScreen} from 'react-native-ui-lib'
import {isEqual, sortBy} from 'lodash';

class FollowUpsSingleQuestionnaireContainer extends PureComponent {

    // This will be a container, so put as less business logic here as possible
    constructor(props) {
        super(props);
        this.state = {
            interactionComplete: false
        };
    }

    // Please add here the react lifecycle methods that you need
    // shouldComponentUpdate(nextProps, nextState) {
    //     if (isEqual(nextProps.item, this.props.item)) {
    //         return false;
    //     }
    //     return true;
    // }

    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this.setState({
                interactionComplete: true
            })
        })
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        if(!this.state.interactionComplete) {
            return (
                <LoaderScreen overlay={true} backgroundColor={'white'}/>
            )
        }

        // console.log("### FollowUpsSingleQuestionnaire: ", this.props.questions);
        let buttonHeight = calculateDimension(25, true, this.props.screenSize);
        let buttonWidth = calculateDimension(165.5, false, this.props.screenSize);
        let marginVertical = calculateDimension(12.5, true, this.props.screenSize);
        let viewWidth = calculateDimension(config.designScreenSize.width - 32, false, this.props.screenSize);

        // Sort questions by the order field
        let sortedQuestions = sortBy(this.props.questions, ['order']);

        return (
            <View style={style.mainContainer}>
                {
                    this && this.props && this.props.isEditMode ? (<View style={[style.containerButtons, {marginVertical: marginVertical, width: viewWidth}]}>
                            <Button
                                title={'Save'}
                                onPress={this.props.onPressSave}
                                color={styles.buttonGreen}
                                titleColor={'white'}
                                height={buttonHeight}
                                width={buttonWidth}
                            />
                            <Button
                                title={'Missing'}
                                onPress={this.props.onPressMissing}
                                color={'white'}
                                titleColor={styles.buttonTextGray}
                                height={buttonHeight}
                                width={buttonWidth}
                            />
                        </View>) : (null)
                }
                <KeyboardAwareScrollView
                    style={style.container}
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
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (item, index) => {
        return (
            <QuestionCard
                item={item}
                index={index + 1}
                source={this.props.item}
                isEditMode={this.props.isEditMode}
                onChangeTextAnswer={this.props.onChangeTextAnswer}
                onChangeDateAnswer={this.props.onChangeDateAnswer}
                onChangeSingleSelection={this.props.onChangeSingleSelection}
                onChangeMultipleSelection={this.props.onChangeMultipleSelection}
            />
        )
    }
}


// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: styles.screenBackgroundGrey,
        alignItems: 'center'
    },
    container: {
        flex: 1,
        backgroundColor: styles.screenBackgroundGrey
    },
    contentContainerStyle: {
        alignItems: 'center'
    },
    containerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        questions: state.outbreak.contactFollowUpTemplate
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(FollowUpsSingleQuestionnaireContainer);
