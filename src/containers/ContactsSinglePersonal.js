/**
 * Created by florinpopa on 21/08/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {View, StyleSheet, InteractionManager, Alert} from 'react-native';
import {calculateDimension} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import Button from './../components/Button';
import styles from './../styles';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import CardComponent from './../components/CardComponent';
import {LoaderScreen} from 'react-native-ui-lib';

class ContactsSinglePersonal extends Component {

    // This will be a container, so put as less business logic here as possible
    constructor(props) {
        super(props);
        this.state = {
            interactionComplete: false
        };
    }

    // Please add here the react lifecycle methods that you need
    // shouldComponentUpdate(nextProps, nextState) {
    //     // console.log("NextPropsIndex ContactsSinglePersonal: ", nextProps.activeIndex, this.props.activeIndex);
    //     return nextProps.activeIndex === 0;
    // }

    componentWillMount() {
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
        if (!this.state.interactionComplete) {
            return (
                <LoaderScreen overlay={true} backgroundColor={'white'}/>
            )
        }

        return (
            <View style={style.viewContainer}>
                <View style={{flexDirection: 'row'}}>
                    <Button
                        title={'Next'}
                        onPress={this.handleNextButton}
                        color={styles.buttonGreen}
                        titleColor={'white'}
                        height={calculateDimension(25, true, this.props.screenSize)}
                        width={calculateDimension(130, false, this.props.screenSize)}
                        style={{
                            marginVertical: calculateDimension(12.5, true, this.props.screenSize),
                        }}/>
                </View>

                <KeyboardAwareScrollView
                    style={style.containerScrollView}
                    contentContainerStyle={[style.contentContainerStyle, {paddingBottom: this.props.screenSize.height < 600 ? 70 : 20}]}
                    keyboardShouldPersistTaps={'always'}
                >
                    <View style={style.container}>
                        {
                            config.contactsSingleScreen.personal.map((item) => {
                                return this.handleRenderItem(item)
                            })
                        }
                    </View>
                </KeyboardAwareScrollView>
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (item) => {
        // console.log("Item: ", item, this.props.contact);
        return (
            <CardComponent
                item={item.fields}
                contact={this.props.contact}
                style={style.cardStyle}
                screen={'ContactsSingleScreen'}
                isEditMode={true}
                onChangeText={this.props.onChangeText}
                onChangeDropDown={this.props.onChangeDropDown}
                onChangeDate={this.props.onChangeDate}
                onChangeSwitch={this.props.onChangeSwitch}
                selectedItemIndexForTextSwitchSelectorForAge={this.props.selectedItemIndexForTextSwitchSelectorForAge}
                onChangeTextSwitchSelector={this.props.onChangeTextSwitchSelector}
                selectedItemIndexForAgeUnitOfMeasureDropDown={this.props.selectedItemIndexForAgeUnitOfMeasureDropDown}
                onChangeextInputWithDropDown={this.props.onChangeextInputWithDropDown}
            />
        )
    }

    handleNextButton = () => {
        if (this.props.isNew) {
            if (this.props.checkRequiredFieldsPersonalInfo()) {
                if (this.props.checkAgeYearsRequirements()) {
                    if (this.props.checkAgeMonthsRequirements()){
                        this.props.handleMoveToNextScreenButton()
                    } else {
                        Alert.alert("Alert", 'Number of months must be between 0 and 11', [
                            {
                                text: 'Ok', onPress: () => {console.log("OK pressed")}
                            }
                        ])
                    }
                } else {
                    Alert.alert("Alert", 'Number of years must be between 0 and 150', [
                        {
                            text: 'Ok', onPress: () => {console.log("OK pressed")}
                        }
                    ])
                }
            } else {
                    Alert.alert("Alert", 'Please complete all the required fields', [
                        {
                            text: 'Ok', onPress: () => {console.log("OK pressed")}
                        }
                    ])
                }
        } else {
            this.props.handleMoveToNextScreenButton()
        }
    }
}


// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    viewContainer: {
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
    container: {
        flex: 1,
        marginBottom: 10
        
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        contacts: state.contacts,
        cases: state.cases,
        events: state.events
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(ContactsSinglePersonal);
