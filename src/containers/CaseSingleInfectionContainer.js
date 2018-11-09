/**
 * Created by mobileclarisoft on 10/09/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {TextInput, View, Text, StyleSheet, FlatList, Alert} from 'react-native';
import {calculateDimension} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import styles from './../styles';
import Ripple from 'react-native-material-ripple';
import CardComponent from './../components/CardComponent';
import Button from './../components/Button';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

class CaseSingleInfectionContainer extends PureComponent {

    // This will be a container, so put as less business logic here as possible
    constructor(props) {
        super(props);
        this.state = {
            oneHospitalizationDateText: 'Add hospitalization date range',
            moreHospitalizationDatesText: 'Add another hospitalization date range',
            oneIsolationDateText: 'Add isolation date range',
            moreIsolationDatesText: 'Add another isolation date range'
        };
    }
    // Please add here the react lifecycle methods that you need


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
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
                    {
                        config.caseSingleScreen.infection.map((item, index) => {
                            return this.handleRenderItem(item, index)
                        })
                    }
                    <View style={style.container}>
                        {
                            this.props.case && this.props.case.hospitalizationDates && this.props.case.hospitalizationDates.map((item, index) => {
                                return this.handleRenderItemForHospitalizationDatesList(item, index)
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
                                    onPress={this.props.onPressAddHospitalizationDate}
                                >
                                    <Text style={{fontFamily: 'Roboto-Medium', fontSize: 12, color: styles.buttonGreen}}>
                                        {this.props.case.hospitalizationDates && this.props.case.hospitalizationDates.length === 0 ? this.state.oneHospitalizationDateText : this.state.moreHospitalizationDatesText}
                                    </Text>
                                </Ripple>
                            </View>
                        ) : null
                    }
                    <View style={style.container}>
                        {
                            this.props.case && this.props.case.isolationDates && this.props.case.isolationDates.map((item, index) => {
                                return this.handleRenderItemForIsolationDatesList(item, index)
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
                                    onPress={this.props.onPressAddIsolationDates}
                                >
                                    <Text style={{fontFamily: 'Roboto-Medium', fontSize: 12, color: styles.buttonGreen}}>
                                        {this.props.case.isolationDates && this.props.case.isolationDates.length === 0 ? this.state.oneIsolationDateText : this.state.moreIsolationDatesText}
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
    handleRenderItem = (item, index) => {
        let fields = item.fields.map( (field) => {
            return Object.assign({},field, {isEditMode: this.props.isEditMode})
        });

        if (this.props.case.deceased === false) {
            fields = fields.filter((field) => {
                return field.id !== 'dateDeceased' && field.id !== 'safeBurial'
            });
        }
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
            />
        )
    }

    handleRenderItemForHospitalizationDatesList = (item, index) => {
        let fields = config.caseSingleScreen.hospitalizationDate.fields.map((field) => {
            return Object.assign({},field, {isEditMode: this.props.isEditMode})
        });
        return (
            <CardComponent
                item={fields}
                index={index}
                screen={'CaseSingleScreen'}
                isEditMode={this.props.isEditMode}
                case={this.props.case}
                style={style.cardStyle}
                onChangeText={this.props.onChangeText}
                onChangeDate={this.props.onChangeDate}
                onChangeSwitch={this.props.onChangeSwitch}
                onChangeDropDown={this.props.onChangeDropDown}
                onDeletePress={this.props.handleOnPressDeleteHospitalizationDates}
            />
        )
    }

    handleRenderItemForIsolationDatesList = (item, index) => {
        let fields = config.caseSingleScreen.isolationDate.fields.map((field) => {
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
                onDeletePress={this.props.handleOnPressDeleteIsolationDates}
            />
        )
    }

    handleNextButton = () => {
        // if (true) {
        if (this.props.checkRequiredFieldsInfection()) {
            this.props.handleMoveToNextScreenButton(true)
        } else {
            Alert.alert("Alert", 'Please complete all the required fields', [
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

export default connect(mapStateToProps, matchDispatchProps)(CaseSingleInfectionContainer);
