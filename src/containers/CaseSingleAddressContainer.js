/**
 * Created by mobileclarisoft on 10/09/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {TextInput, View, Text, StyleSheet, FlatList, InteractionManager, Alert} from 'react-native';
import {LoaderScreen} from 'react-native-ui-lib';
import {calculateDimension} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import styles from './../styles';
import CardComponent from './../components/CardComponent';
import Button from './../components/Button';
import Ripple from 'react-native-material-ripple';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

class CaseSingleAddressContainer extends PureComponent {

    // This will be a container, so put as less business logic here as possible
    constructor(props) {
        super(props);
        this.state = {
            interactionComplete: false,
            oneAddressText: 'Add address',
            moreAddressesText: 'Add another address'
        };
    }

    // Please add here the react lifecycle methods that you need
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
            <View style={style.container}>
                <View style={{flexDirection: 'row'}}>
                    {
                        this.props.isNew ? (
                            <View style={{flexDirection: 'row'}}>
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
                            </View>) : (
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
                </View>
                <KeyboardAwareScrollView
                    style={style.containerScrollView}
                    contentContainerStyle={[style.contentContainerStyle, {paddingBottom: this.props.screenSize.height < 600 ? 70 : 20}]}
                    keyboardShouldPersistTaps={'always'}
                >
                    <View style={style.container}>
                        {
                            this.props.case && this.props.case.addresses && this.props.case.addresses.map((item, index) => {
                                return this.handleRenderItem(item, index)
                            })
                        }
                    </View>
                    {
                        this.props.isEditMode ? (
                            <View style={{alignSelf: 'flex-start', marginHorizontal: calculateDimension(16, false, this.props.screenSize), marginVertical: 20}}>
                                <Ripple
                                    style={{
                                        height: 25,
                                        justifyContent: 'center'
                                    }}
                                    onPress={this.props.onPressAddAddress}
                                >
                                    <Text style={{fontFamily: 'Roboto-Medium', fontSize: 12, color: styles.buttonGreen}}>
                                        {this.props.case.addresses && this.props.case.addresses.length === 0 ? this.state.oneAddressText : this.state.moreAddressesText}
                                    </Text>
                                </Ripple>
                            </View>
                        ) : null
                    }
                </KeyboardAwareScrollView>
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (item, index, address) => {
        let fields = config.caseSingleScreen.address.fields.map((field) => {
            return Object.assign({},field, {isEditMode: this.props.isEditMode})
        });
        return (
            <CardComponent
                item={fields}
                index={index}
                isEditMode={this.props.isEditMode}
                screen={'CaseSingleScreen'}
                case={this.props.case}
                style={style.cardStyle}
                onChangeText={this.props.onChangeText}
                onChangeDate={this.props.onChangeDate}
                onChangeSwitch={this.props.onChangeSwitch}
                onChangeDropDown={this.props.onChangeDropDown}
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
        screenSize: state.app.screenSize
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(CaseSingleAddressContainer);
