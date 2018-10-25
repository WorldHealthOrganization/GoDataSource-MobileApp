/**
 * Created by florinpopa on 21/08/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import { View, Text, StyleSheet, InteractionManager, Alert} from 'react-native';
import {LoaderScreen} from 'react-native-ui-lib';
import {calculateDimension} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import Button from './../components/Button';
import styles from './../styles';
import Ripple from 'react-native-material-ripple';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import CardComponent from './../components/CardComponent';

class ContactsSingleAddress extends Component {

    // This will be a container, so put as less business logic here as possible
    constructor(props) {
        super(props);
        this.state = {
            interactionComplete: false
        };
    }

    // Please add here the react lifecycle methods that you need
    // shouldComponentUpdate(nextProps, nextState) {
    //     // console.log("NextPropsIndex ContactsSingleAddress: ", nextProps.activeIndex, this.props.activeIndex);
    //     return nextProps.activeIndex === 1;
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

        return (
            <View style={style.viewContainer}>
                <View style={{flexDirection: 'row'}}>
                    {
                        this.props.isNew ? 
                            <View style = {{flexDirection:'row'}}>          
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
                                     }}/> 
                                 <Button
                                     title={'Next'}
                                     onPress={this.handleNextButton}
                                     color={styles.buttonGreen}
                                     titleColor={'white'}
                                     height={calculateDimension(25, true, this.props.screenSize)}
                                     width={calculateDimension(130, false, this.props.screenSize)}
                                     style={{
                                         marginVertical: calculateDimension(12.5, true, this.props.screenSize),
                                         marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                                     }}/> 
                            </View> : null
                    }
                </View>

                <KeyboardAwareScrollView
                    style={style.containerScrollView}
                    contentContainerStyle={[style.contentContainerStyle, {paddingBottom: this.props.screenSize.height < 600 ? 70 : 20}]}
                    keyboardShouldPersistTaps={'always'}
                >
                    <View style={style.container}>
                        {
                            this.props.contact && this.props.contact.addresses && this.props.contact.addresses.map((item, index) => {
                                return this.handleRenderItem(item, index)
                            })
                        }
                    </View>
                    <View style={{alignSelf: 'flex-start', marginHorizontal: calculateDimension(16, false, this.props.screenSize), marginVertical: 20}}>
                        <Ripple
                            style={{
                                height: 25,
                                justifyContent: 'center'
                            }}
                            onPress={this.props.onPressAddAdrress}
                        >
                            <Text style={{fontFamily: 'Roboto-Medium', fontSize: 12, color: styles.buttonGreen}}>Add another address</Text>
                        </Ripple>
                    </View>
                </KeyboardAwareScrollView>
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (item, index) => {
        // console.log("Item: ", item, this.props.contact, index);
        return (
            <CardComponent
                item={config.contactsSingleScreen.address.fields}
                index={index}
                contact={this.props.contact}
                isEditMode={true}
                style={style.cardStyle}
                screen={'ContactsSingleScreen'}
                onChangeText={this.props.onChangeText}
                onChangeDropDown={this.props.onChangeDropDown}
                onChangeDate={this.props.onChangeDate}
                onChangeSwitch={this.props.onChangeSwitch}
                onChangeSectionedDropDown={this.props.onChangeSectionedDropDown}
                onDeletePress={this.props.onDeletePress}
            />
        )
    }

    handleNextButton = () => {
        // if (true) {
        if (this.props.checkRequiredFieldsAddresses()) {
            this.props.handleMoveToNextScreenButton(true)
        } else {
            Alert.alert("Alert", 'Please add at least one address with all the required fields completed', [
                {
                    text: 'Ok', onPress: () => {console.log("OK pressed")}
                }
            ])
        }
    }

    handleBackButton = () => {
        this.props.handleMoveToPrevieousScreenButton()
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
        marginBottom: 30
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

export default connect(mapStateToProps, matchDispatchProps)(ContactsSingleAddress);
