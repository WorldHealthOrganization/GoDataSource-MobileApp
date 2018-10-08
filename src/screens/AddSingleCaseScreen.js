/**
 * Created by mobileclarisoft on 22/08/2018.
 */
import React, {Component} from 'react';
import {
    // TextInput,
    View, Text, StyleSheet, ScrollView, Dimensions} from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
// import {Button} from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import Button from './../components/Button';
import TextInput from './../components/TextInput';
import SwitchInput from './../components/SwitchInput';
import DropdownInput from './../components/DropdownInput';
import {connect} from "react-redux";
import styles from './../styles';
import {bindActionCreators} from "redux";
import NavBarCustom from './../components/NavBarCustom';
import Breadcrumb from './../components/Breadcrumb';
import Menu, {MenuItem} from 'react-native-material-menu';
import Ripple from 'react-native-material-ripple';
import DateTimePicker from 'react-native-modal-datetime-picker';
import _ from 'lodash';
import {Icon} from 'react-native-material-ui';

class AddSingleCaseScreen extends Component {

    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
            isEditMode: false,
            data: [{
                value: 'Banana',
            }, {
                value: 'Mango',
            }, {
                value: 'Pear',
            }]
        };
        // Bind here methods, or at least don't declare methods in the render method

    }

    // Please add here the react lifecycle methods that you need


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <View style={style.container}>
                <NavBarCustom
                    title={null}
                    customTitle={
                        <View
                            style={[style.breadcrumbContainer]}>
                            <Breadcrumb
                                entities={['Cases', ("Create New Case")]}
                                navigator={this.props.navigator}
                            />
                            <View>
                                <Menu
                                    ref="menuRef"
                                    button={
                                        <Ripple onPress={this.showMenu} hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
                                            <Icon name="more-vert"/>
                                        </Ripple>
                                    }
                                >
                                    <MenuItem
                                        onPress={this.handleOnPressAction1}
                                        textStyle={{color: 'rgb(71,70,70)', fontFamily: 'Roboto-Regular', fontSize: 11.8, lineHeight: 25}}
                                    >
                                        Action 1
                                    </MenuItem>
                                    <MenuItem
                                        onPress={this.handleOnPressAction1}
                                        textStyle={{color: 'rgb(71,70,70)', fontFamily: 'Roboto-Regular', fontSize: 11.8, lineHeight: 25}}
                                    >
                                        Action 2
                                    </MenuItem>
                                    <MenuItem
                                        style={{borderTopWidth: 0.5, borderTopColor: 'rgb(211,211,211)'}}
                                        textStyle={{ color: 'rgb(255,60,56)', fontFamily: 'Roboto-Regular', fontSize: 11.8, lineHeight: 25}}
                                        onPress={this.handleOnPressDeleteCase}
                                    >
                                        Delete case
                                    </MenuItem>
                                </Menu>
                            </View>
                        </View>
                    }
                    navigator={this.props.navigator}
                    iconName="menu"
                    handlePressNavbarButton={this.handlePressNavbarButton}
                />
                <View style={{
                    paddingTop: 12.5,
                    paddingBottom: 12.5,
                    paddingLeft: 16,
                    paddingRight: 16,
                    width: Dimensions.get('window').width,
                    // height: Dimensions.get('window').height,
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center'
                }}>
                    {
                        !this.state.isEditMode &&
                        <Button
                            title='Edit'
                            color='rgb(77,176,160)'
                            titleColor='rgb(255,255,255)'
                            onPress={this.editCase}
                            width={165.5}
                            height={25}
                        />
                    }
                    {
                        this.state.isEditMode &&
                        <View style={{
                            flexDirection: 'row',
                            width: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center'
                        }}>
                            <Button
                                title='Save'
                                color='rgb(77,176,160)'
                                titleColor='rgb(255,255,255)'
                                onPress={this.saveCase}
                                width={165.5}
                                height={25}
                                style={{
                                    marginRight: 11.5,
                                    alignSelf: 'center'
                                }}
                            />
                            <Button
                                title='Cancel'
                                color='rgb(255,255,255)'
                                titleColor='rgb(71,70,70)'
                                onPress={this.cancelEditCase}
                                width={166}
                                height={25}
                                style={{
                                    alignSelf: 'center'
                                }}
                            />
                        </View>
                    }
                </View>

                <View style={{
                    paddingLeft: 16,
                    paddingRight: 16,
                    width: Dimensions.get('window').width,
                    alignItems: 'center',
                }}>
                    <View style={{
                        // height: 211.5,
                        marginBottom: 7,
                        width: '100%',
                        backgroundColor: 'rgb(255,255,255)',
                        borderRadius: 2,
                        shadowColor: 'rgba(1,1,1,0.18)',
                        shadowOffset: { width: 0, height: 2.5 },
                        shadowOpacity: 1,
                        shadowRadius: 2,
                        elevation: 3,
                    }}>
                        <SwitchInput
                            id='flagged'
                            label='FLAGGED'
                            value={true}
                            isEditMode={this.state.isEditMode}
                            isRequired={true}
                            activeButtonColor={'rgb(255,60,56)'}
                            activeBackgroundColor={'rgba(255,60,56,0.3)'}
                            onChange={this.changeValue}
                            showValue={false}
                            style={{
                                marginLeft: 14,
                                marginRight: 14,
                                marginTop: 18,
                                marginBottom: 1,
                            }}
                            labelStyle={{
                                fontFamily: 'Roboto-Medium',
                                fontSize: 15,
                                textAlign: 'left',
                                color: 'rgb(255,60,56)',
                                lineHeight: 30,
                                // flex: 0.8
                            }}
                        />
                        <TextInput
                            id='reason'
                            label='Reason'
                            value='Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat tempor incididunt ut labore dolore.'
                            isEditMode={this.state.isEditMode}
                            isRequired={true}
                            onChange={this.changeValue}
                            style={{
                                marginLeft: 14,
                                marginRight: 14,
                                marginTop: 18,
                                marginBottom: 1,
                            }}
                            multiline={true}
                        />
                    </View>

                    <View style={{
                        // height: 211.5,
                        paddingBottom: 18.5,
                        marginBottom: 7,
                        width: '100%',
                        backgroundColor: 'rgb(255,255,255)',
                        borderRadius: 2,
                        shadowColor: 'rgba(1,1,1,0.18)',
                        shadowOffset: { width: 0, height: 2.5 },
                        shadowOpacity: 1,
                        shadowRadius: 2,
                        elevation: 3,
                    }}>
                        <TextInput
                            id='firstName'
                            label='First name'
                            value='Andrew'
                            isEditMode={this.state.isEditMode}
                            isRequired={true}
                            onChange={this.changeValue}
                            style={{
                                marginLeft: 14,
                                marginRight: 14,
                                marginTop: 18,
                                marginBottom: 1,
                            }}
                        />
                        <TextInput
                            id='middleName'
                            label='Middle name'
                            value='John'
                            isEditMode={this.state.isEditMode}
                            isRequired={false}
                            onChange={this.changeValue}
                            style={{
                                marginLeft: 14,
                                marginRight: 14,
                                marginTop: 18,
                                marginBottom: 1,
                            }}
                        />
                        <TextInput
                            id='lastName'
                            label='Last name'
                            value='Doe'
                            isEditMode={this.state.isEditMode}
                            isRequired={false}
                            onChange={this.changeValue}
                            style={{
                                marginLeft: 14,
                                marginRight: 14,
                                marginTop: 18,
                                marginBottom: 1,
                            }}
                        />
                        <SwitchInput
                            id='nextToYou'
                            label='Is the contact next to you?'
                            value={true}
                            isEditMode={this.state.isEditMode}
                            isRequired={true}
                            activeButtonColor={'rgb(77,176,160)'}
                            activeBackgroundColor={'rgba(77,176,160,0.3)'}
                            onChange={this.changeValue}
                            showValue={true}
                            style={{
                                marginLeft: 14,
                                marginRight: 14,
                                marginTop: 18,
                                marginBottom: 1,
                            }}
                            labelStyle={{
                                fontFamily: 'Roboto-Regular',
                                fontSize: 15,
                                textAlign: 'left',
                                color: 'rgb(0,0,0)',
                                lineHeight: 30,
                                flex: 0.85
                            }}
                        />
                        <DropdownInput
                            id='exposedTo'
                            label='Exposed to (Case)'
                            value='Mango'
                            data={this.state.data}
                            isEditMode={this.state.isEditMode}
                            isRequired={true}
                            onChange={this.changeValue}
                            style={{
                                marginLeft: 14,
                                marginRight: 14,
                                marginTop: 18,
                                marginBottom: 1,
                            }}
                        />
                    </View>
                </View>
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handlePressNavbarButton = () => {
        this.props.navigator.toggleDrawer({
            side: 'left',
            animated: true,
            to: 'open'
        })
    };

    handleOnPressAction1 = () => {

    };

    handleOnPressDeleteCase = () => {

    };

    showMenu = () => {
        this.refs.menuRef.show();
    };

    editCase = () => {
        this.setState({
            isEditMode: true
        });
    };

    cancelEditCase = () => {
        this.setState({
            isEditMode: false
        });
    };

    saveCase = () => {
        console.log('Save');
    };

    changeValue = (value,id) => {
        console.log(value);
        console.log(id);
    };

}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    breadcrumbContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },
    containerContent: {
        flex: 1,
        backgroundColor: 'rgba(217, 217, 217, 0.5)'
    },
    separatorComponentStyle: {
        height: 8
    }
});

function mapStateToProps(state) {
    return {
        user: state.user,
        screenSize: state.app.screenSize,
        errors: state.errors
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(AddSingleCaseScreen);