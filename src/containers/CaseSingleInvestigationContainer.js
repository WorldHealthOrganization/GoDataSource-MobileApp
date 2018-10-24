/**
 * Created by mobileclarisoft on 10/09/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {TextInput, View, Text, StyleSheet, FlatList} from 'react-native';
import {calculateDimension} from '../utils/functions';
import config from '../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import styles from '../styles';
import QuestionCard from '../components/QuestionCard';
import Button from '../components/Button';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

class CaseSingleInvestigationContainer extends PureComponent {

    // This will be a container, so put as less business logic here as possible
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    // Please add here the react lifecycle methods that you need


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <View style={style.container}>
                {
                    this.props.isNew ? (
                        <Button
                        title={'Back'}
                        onPress={this.handleBackButton}
                        color={styles.buttonGreen}
                        titleColor={'white'}
                        height={calculateDimension(25, true, this.props.screenSize)}
                        width={calculateDimension(130, false, this.props.screenSize)}
                        style={{
                            marginVertical: calculateDimension(12.5, true, this.props.screenSize),
                            marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                        }}/>) : (
                        this.props.isEditMode ? (
                            <View style={{flexDirection: 'row'}}>
                                <Button
                                    title={'Save'}
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
                                    title={'Cancel'}
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
                                title={'Edit'}
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
                <KeyboardAwareScrollView
                    style={style.containerScrollView}
                    contentContainerStyle={[style.contentContainerStyle, {paddingBottom: this.props.screenSize.height < 600 ? 70 : 20}]}
                    keyboardShouldPersistTaps={'always'}
                >
                    {
                        this.props.questions.map((item, index) => {
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
                isEditMode={this.props.isEditMode}
                index={index + 1}
                source={this.props.case}
                isEditMode={this.props.isEditMode}
                onChangeTextAnswer={this.props.onChangeTextAnswer}
                onChangeSingleSelection={this.props.onChangeSingleSelection}
                onChangeMultipleSelection={this.props.onChangeMultipleSelection}
            />
        )
    }

    handleBackButton = () => {
        this.props.handleMoveToPrevieousScreenButton()
    }
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
        questions: state.outbreak.caseInvestigationTemplate

    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(CaseSingleInvestigationContainer);
