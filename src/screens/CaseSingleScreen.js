/**
 * Created by mobileclarisoft on 23/07/2018.
 */
import React, {Component} from 'react';
import {View, Alert, Text, StyleSheet, Animated, ScrollView, Dimensions} from 'react-native';
import {TabBar, TabView, SceneMap} from 'react-native-tab-view';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import NavBarCustom from './../components/NavBarCustom';
import Breadcrumb from './../components/Breadcrumb';
import Menu, {MenuItem} from 'react-native-material-menu';
import Ripple from 'react-native-material-ripple';
import styles from './../styles';
import config from './../utils/config';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
// import {Button} from 'react-native-material-ui';

import CaseSinglePersonalContainer from './../containers/CaseSinglePersonalContainer';
import CaseSingleAddressContainer from './../containers/CaseSingleAddressContainer';
import CaseSingleInfectionContainer from './../containers/CaseSingleInfectionContainer';
import CaseSingleLabDataContainer from './../containers/CaseSingleLabDataContainer';
import {Icon} from 'react-native-material-ui';
import {removeErrors} from './../actions/errors';
import {addCase, updateCase, deleteCase} from './../actions/cases';

class CaseSingleScreen extends Component {

    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
            deletePressed: false,
            savePressed: false,
            item: this.props.item,
            contact: null,
            routes: config.tabsValuesRoutes.casesSingle,
            index: 0,
            isEditMode: false,
            isDateTimePickerVisible: false
        };
        // Bind here methods, or at least don't declare methods in the render method

    }

    // Please add here the react lifecycle methods that you need
    static getDerivedStateFromProps(props, state) {
        console.log("CaseSingleScreen: ", state, props);
        if (props.errors && props.errors.type && props.errors.message) {
            Alert.alert(props.errors.type, props.errors.message, [
                {
                    text: 'Ok', onPress: () => {
                    state.savePressed = false;
                    state.deletePressed = false;
                    props.removeErrors()
                }
                }
            ])
        } else {
            if (state.savePressed || state.deletePressed) {
                props.navigator.pop({
                    animated: true,
                    animationType: 'fade'
                })
            }
        }
        return null;
    }

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
                                entities={['Cases', (this.props.item.firstName ? this.props.item.firstName : '' + " " + this.props.item.lastName ? this.props.item.lastName : '')]}
                                navigator={this.props.navigator}
                            />
                            <View>
                                <Menu
                                    ref="menuRef"
                                    button={
                                        <Ripple onPress={this.showMenu}>
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
                <TabView
                    navigationState={this.state}
                    onIndexChange={this.handleOnIndexChange}
                    renderScene={this.handleRenderScene}
                    renderTabBar={this.handleRenderTabBar}
                    useNativeDriver
                />
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

    handleRenderScene = ({route}) => {
        switch(route.key) {
            case 'personal':
                return <CaseSinglePersonalContainer
                    item={this.state.item}
                    isEditMode={this.state.isEditMode}
                    followup={this.state.item}
                    contact={this.state.item}
                    onNext={this.handleNextPress}
                    onPressEdit={this.handleEditPress}
                    onPressSave={this.handleSavePress}
                    onChangeText={this.onChangeText}
                    onChangeDate={this.onChangeDate}
                    onChangeSwitch={this.onChangeSwitch}
                    onChangeDropDown={this.onChangeDropDown}
                />;
            case 'address':
                return <CaseSingleAddressContainer
                    item={this.state.item}
                    isEditMode={this.state.isEditMode}
                    followup={this.state.item}
                    contact={this.state.item}
                    onNext={this.handleNextPress}
                    onPressEdit={this.handleEditPress}
                    onPressSave={this.handleSavePress}
                    onChangeText={this.onChangeText}
                    onChangeDate={this.onChangeDate}
                    onChangeSwitch={this.onChangeSwitch}
                    onChangeDropDown={this.onChangeDropDown}
                />;
            case 'infection':
                return <CaseSingleInfectionContainer
                    item={this.state.item}
                    isEditMode={this.state.isEditMode}
                    followup={this.state.item}
                    contact={this.state.item}
                    onNext={this.handleNextPress}
                    onPressEdit={this.handleEditPress}
                    onPressSave={this.handleSavePress}
                    onChangeText={this.onChangeText}
                    onChangeDate={this.onChangeDate}
                    onChangeSwitch={this.onChangeSwitch}
                    onChangeDropDown={this.onChangeDropDown}
                />;
            case 'labData':
                return <CaseSingleLabDataContainer
                    item={this.state.item}
                    isEditMode={this.state.isEditMode}
                    followup={this.state.item}
                    contact={this.state.item}
                    onNext={this.handleNextPress}
                    onPressEdit={this.handleEditPress}
                    onPressSave={this.handleSavePress}
                    onPressCancel={this.handleCancelPress}
                    onChangeText={this.onChangeText}
                    onChangeDate={this.onChangeDate}
                    onChangeSwitch={this.onChangeSwitch}
                    onChangeDropDown={this.onChangeDropDown}
                />;
            default: return null;
        }
    };

    //Index change for TabBar
    handleOnIndexChange = (index) => {
        this.setState({index});
    };

    //Generate TabBar
    handleRenderTabBar = (props) => {
        return (
            <TabBar
                {...props}
                indicatorStyle={{
                    backgroundColor: styles.buttonGreen,
                    height: 2
                }}
                style={{
                    height: 41,
                    backgroundColor: 'white'
                }}
                renderLabel={this.handleRenderLabel(props)}
            />
        )
    };

    //Render label for TabBar
    handleRenderLabel = (props) => ({route, index}) => {
        const inputRange = props.navigationState.routes.map((x, i) => i);

        const outputRange = inputRange.map(
            inputIndex => (inputIndex === index ? styles.colorLabelActiveTab : styles.colorLabelInactiveTab)
        );
        const color = props.position.interpolate({
            inputRange,
            outputRange: outputRange,
        });

        return (
            <Animated.Text style={{
                fontFamily: 'Roboto-Medium',
                fontSize: 12,
                color: color,
                flex: 1,
                alignSelf: 'center'
            }}>
                {route.title}
            </Animated.Text>
        );
    };

    //Show right top menu
    showMenu = () => {
        this.refs.menuRef.show();
    };

    //Hide right top menu
    hideMenu = () => {
        this.refs.menuRef.hide();
    };

    //Action 1 from right top menu
    handleOnPressAction1 = () => {

    };

    //Delete case from right top menu
    handleOnPressDeleteCase = () => {
        // console.log("### handleOnPressDelete");
        Alert.alert("Alert", 'Are you sure you want to delete this case?', [
            {
                text: 'Yes', onPress: () => {
                this.hideMenu();
                this.setState({
                    deletePressed: true
                }, () => {
                    console.log("### existing filters: ", this.props.filter, this.state);
                    this.props.deleteCase(this.props.outbreak.id, this.state.item.id, this.props.filter, this.props.user.token);
                })
            }
            },
            {
                text: 'No', onPress: () => {
                this.hideMenu();
            }
            }
        ])
    };

    //Pressed next and navigate to next route
    handleNextPress = () => {
        this.handleOnIndexChange(this.state.index + 1 );
    };

    //Pressed edit and change isEditMode
    handleEditPress = () => {
        this.setState({
                isEditMode: true
            }, () => {
                console.log("handleEditPress", this.state.isEditMode);
            }
        )
    };

    //Pressed save and change case
    handleSavePress = () => {
        this.setState({
                isEditMode: false
            }, () => {
                console.log("handleSavePress", this.state.isEditMode);
            }
        )
    };

    //Pressed cancel and go back to Cases list
    handleCancelPress = () => {
        this.props.navigator.pop({
            animated: true,
            animationType: 'fade'
        });
    };

    //Handle text change from route
    onChangeText = (value, id, objectType) => {
        this.setState(
            (prevState) => ({
                item: Object.assign({}, prevState.item, {[id]: value})
            }), () => {
                console.log("onChangeText", id, " ", value, " ", this.state.item);
            }
        )
    };

    //Handle date change from route
    onChangeDate = (value, id, objectType) => {
        this.setState(
            (prevState) => ({
                item: Object.assign({}, prevState.item, {[id]: value})
            })
            , () => {
                console.log("onChangeDate", id, " ", value, " ", this.state.item);
            }
        )
    };

    //Handle switch change from route
    onChangeSwitch = (value, id, objectType) => {
        if (id === 'fillGeoLocation') {
            navigator.geolocation.getCurrentPosition((position) => {
                    this.setState(
                        (prevState) => ({
                            item: Object.assign({}, prevState.item, {[id]: value ? {lat: position.coords.latitude, lng: position.coords.longitude} : null })
                        }), () => {
                            console.log("onChangeSwitch", id, " ", value, " ", this.state.item);
                        }
                    )
                },
                (error) => {
                    Alert.alert("Alert", 'There was an issue with getting your location', [
                        {
                            text: 'Ok', onPress: () => {console.log("OK pressed")}
                        }
                    ])
                },
                {
                    enableHighAccuracy: true, timeout: 20000, maximumAge: 1000
                }
            )
        } else {
            this.setState(
                (prevState) => ({
                    item: Object.assign({}, prevState.item, {[id]: value})
                }), () => {
                    console.log("onChangeSwitch", id, " ", value, " ", this.state.item);
                }
            )
        }

    };

    //Handle drop down change from route
    onChangeDropDown = (value, id, objectType) => {
        this.setState(
            (prevState) => ({
                item: Object.assign({}, prevState.item, {[id]: value && value.value ? value.value : value})
            }), () => {
                console.log("onChangeDropDown", id, " ", value, " ", this.state.item);
            }
        )
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
        outbreak: state.outbreak,
        errors: state.errors,
        cases: state.cases,
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        addCase,
        updateCase,
        deleteCase,
        removeErrors
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(CaseSingleScreen);