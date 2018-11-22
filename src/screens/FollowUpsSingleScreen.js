/**
 * Created by florinpopa on 25/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {View, StyleSheet, Platform, Animated, Alert, BackHandler} from 'react-native';
import {Icon} from 'react-native-material-ui';
import styles from './../styles';
import NavBarCustom from './../components/NavBarCustom';
import {calculateDimension} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {getFollowUpsForOutbreakId, getMissedFollowUpsForOutbreakId} from './../actions/followUps';
import {TabBar, TabView, SceneMap} from 'react-native-tab-view';
import FollowUpsSingleGetInfoContainer from './../containers/FollowUpsSingleGetInfoContainer';
import FollowUpsSingleQuestionnaireContainer from './../containers/FollowUpsSingleQuestionnaireContainer';
import Breadcrumb from './../components/Breadcrumb';
import Menu, {MenuItem} from 'react-native-material-menu';
import Ripple from 'react-native-material-ripple';
import {createFollowUp, updateFollowUpAndContact, deleteFollowUp} from './../actions/followUps';
import {updateContact} from './../actions/contacts';
import {removeErrors} from './../actions/errors';
import DateTimePicker from 'react-native-modal-datetime-picker';
import _ from 'lodash';
import {extractIdFromPouchId, computeIdForFileType, updateRequiredFields} from './../utils/functions';

class FollowUpsSingleScreen extends Component {

    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
            routes: config.tabsValuesRoutes.followUpsSingle,
            index: 0,
            item: this.props.item,
            contact: this.props.contact,
            savePressed: false,
            deletePressed: false,
            isDateTimePickerVisible: false,
            isEditMode: true 
        };
        // Bind here methods, or at least don't declare methods in the render method
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }

    // GenInfoRoute = () => (
    //     <FollowUpsSingleGetInfoContainer
    //         item={this.state.item}
    //         contact={this.state.contact}
    //         onNext={this.handleNextPress}
    //         onChangeText={this.onChangeText}
    //         onChangeDate={this.onChangeDate}
    //         onChangeSwitch={this.onChangeSwitch}
    //         onChangeDropDown={this.onChangeDropDown}
    //     />
    // );
    // QuestRoute = () => (
    //     <FollowUpsSingleQuestionnaireContainer
    //         item={this.state.item}
    //         contact={this.state.contact}
    //         isEditMode={true}
    //         onChangeTextAnswer={this.onChangeTextAnswer}
    //         onChangeDateAnswer={this.onChangeDateAnswer}
    //         onChangeSingleSelection={this.onChangeSingleSelection}
    //         onChangeMultipleSelection={this.onChangeMultipleSelection}
    //         onPressSave={this.handleOnPressSave}
    //         onPressMissing={this.handleOnPressMissing}
    //     />
    // );

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        let today = new Date()
        let itemDate = new Date(this.props.item.date)
    
        var todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        let followUpDate = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate())
        
        if (followUpDate < todayDate) {
            console.log('follow-ups date < today => needitabil')
            this.setState({
                isEditMode: false
            })
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick() {
        // this.props.navigator.goBack(null);
        this.props.navigator.pop({
            animated: true,
            animationType: 'fade'
        })
        return false;
    }

    // Please add here the react lifecycle methods that you need
    static getDerivedStateFromProps(props, state) {
        // console.log("FollowUpsSingleScreen: ", state);
        if (props.errors && props.errors.type && props.errors.message) {
            Alert.alert(props.errors.type, props.errors.message, [
                {
                    text: 'Ok', onPress: () => {
                        state.savePressed = false;
                        props.removeErrors()
                    }
                }
            ])
        } else {
            if (state.savePressed || state.deletePressed) {
                if (props.startLoadingScreen !== undefined) {
                    props.startLoadingScreen()
                }
                props.navigator.pop({
                    animated: true,
                    animationType: 'fade',
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
                                entities={['Follow-ups', ((this.props.contact && this.props.contact.firstName ? (this.props.contact.firstName + " ") : '') + (this.props.contact && this.props.contact.lastName ? this.props.contact.lastName : ''))]}
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
                                    <MenuItem onPress={this.handleOnPressMissing}>Missing</MenuItem>
                                    <MenuItem onPress={this.handleOnPressDeceased}>Deceased</MenuItem>
                                    <MenuItem onPress={this.handleOnPressDelete}>Delete follow-up</MenuItem>
                                    <DateTimePicker
                                        isVisible={this.state.isDateTimePickerVisible}
                                        onConfirm={this._handleDatePicked}
                                        onCancel={this._hideDateTimePicker}
                                    />
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

    handleOnIndexChange = (index) => {
        this.setState({index});
    };

    handleRenderScene = ({route}) => {

        switch(route.key) {
            case 'genInfo':
                return (
                    <FollowUpsSingleGetInfoContainer
                        isEditMode={this.state.isEditMode}
                        item={this.state.item}
                        contact={this.state.contact}
                        onNext={this.handleNextPress}
                        onChangeText={this.onChangeText}
                        onChangeDate={this.onChangeDate}
                        onChangeSwitch={this.onChangeSwitch}
                        onChangeDropDown={this.onChangeDropDown}
                    />
                );
            case 'quest':
                return (
                    <FollowUpsSingleQuestionnaireContainer
                        item={this.state.item}
                        contact={this.state.contact}
                        isEditMode={this.state.isEditMode}
                        onChangeTextAnswer={this.onChangeTextAnswer}
                        onChangeDateAnswer={this.onChangeDateAnswer}
                        onChangeSingleSelection={this.onChangeSingleSelection}
                        onChangeMultipleSelection={this.onChangeMultipleSelection}
                        onPressSave={this.handleOnPressSave}
                        onPressMissing={this.handleOnPressMissing}
                    />
                );
            default:
                return (
                    <FollowUpsSingleGetInfoContainer
                        item={this.state.item}
                        isEditMode={this.state.isEditMode}
                        contact={this.state.contact}
                        onNext={this.handleNextPress}
                        onChangeText={this.onChangeText}
                        onChangeDate={this.onChangeDate}
                        onChangeSwitch={this.onChangeSwitch}
                        onChangeDropDown={this.onChangeDropDown}
                    />
                );
        }

    };

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

    handleNextPress = () => {
        this.handleOnIndexChange(this.state.index + 1 );
    };

    onChangeText = (value, id, objectType) => {
        console.log("onChangeText: ", objectType);
        if (objectType === 'FollowUp') {
            this.setState(
                (prevState) => ({
                    item: Object.assign({}, prevState.item, {[id]: value})
                }), () => {
                    console.log("onChangeText", id, " ", value, " ", this.state.item);
                }
            )
        } else {
            if (objectType === 'Contact') {
                this.setState(
                    (prevState) => ({
                        contact: Object.assign({}, prevState.contact, {[id]: value})
                    }), () => {
                        console.log("onChangeText", id, " ", value, " ", this.state.contact);
                    }
                )
            }
        }
    };

    onChangeDate = (value, id, objectType) => {
        console.log("onChangeDate: ", value, id);

        if (objectType === 'FollowUp') {
            this.setState(
                (prevState) => ({
                    item: Object.assign({}, prevState.item, {[id]: value})
                })
                , () => {
                    console.log("onChangeDate", id, " ", value, " ", this.state.item);
                }
            )
        } else {
            if (objectType === 'Contact') {
                this.setState(
                    (prevState) => ({
                        contact: Object.assign({}, prevState.contact, {[id]: value})
                    })
                    , () => {
                        console.log("onChangeDate", id, " ", value, " ", this.state.contact);
                    }
                )
            }
        }
    };

    onChangeSwitch = (value, id, objectType) => {
        // console.log("onChangeSwitch: ", value, id, this.state.item);
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
            if (objectType === 'FollowUp') {
                this.setState(
                    (prevState) => ({
                        item: Object.assign({}, prevState.item, {[id]: value})
                    }), () => {
                        console.log("onChangeSwitch", id, " ", value, " ", this.state.item);
                    }
                )
            } else {
                if (objectType === 'Contact') {
                    this.setState(
                        (prevState) => ({
                            contact: Object.assign({}, prevState.contact, {[id]: value})
                        }), () => {
                            console.log("onChangeSwitch", id, " ", value, " ", this.state.contact);
                        }
                    )
                }
            }
        }

    };

    onChangeDropDown = (value, id, objectType) => {
        // console.log("onChangeDropDown: ", value, id, this.state.item);
        if (objectType === 'FollowUp' || id === 'address') {
            if (id === 'address') {
                if (!this.state.item[id]) {
                    this.state.item[id] = {};
                }

                let address = this.state.contact && this.state.contact.addresses &&
                                Array.isArray(this.state.contact.addresses) && this.state.contact.addresses.length > 0 ? this.state.contact.addresses.filter((e) => {
                    return value.includes(e.addressLine1 || '') && value.includes(e.addressLine2 || '') && value.includes(e.city || '') && value.includes(e.country || '') && value.includes(e.postalCode || '');
                })
                    : [];

                this.setState(
                    (prevState) => ({
                        item: Object.assign({}, prevState.item, {[id]: address[0]})
                    }), () => {
                        console.log("onChangeDropDown", id, " ", value, " ", this.state.item);
                    }
                )
            } else {
                this.setState(
                    (prevState) => ({
                        item: Object.assign({}, prevState.item, {[id]: value && value.value ? value.value : value})
                    }), () => {
                        console.log("onChangeDropDown", id, " ", value, " ", this.state.item);
                    }
                )
            }

        } else {
            if (objectType === 'Contact') {
                this.setState(
                    (prevState) => ({
                        contact: Object.assign({}, prevState.contact, {[id]: value && value.value ? value.value : value})
                    }), () => {
                        console.log("onChangeDropDown", id, " ", value, " ", this.state.contact);
                    }
                )
            }
        }
    };

    onChangeTextAnswer = (value, id) => {
        let itemClone = _.cloneDeep(this.state.item);
        let questionnaireAnswers = itemClone && itemClone.questionnaireAnswers ? itemClone.questionnaireAnswers : null;
        if (!itemClone.questionnaireAnswers) {
            itemClone.questionnaireAnswers = {};
            questionnaireAnswers = itemClone.questionnaireAnswers;
        }
        questionnaireAnswers[id] = value;
        this.setState(prevState => ({
            item: Object.assign({}, prevState.item, {questionnaireAnswers: questionnaireAnswers})
        }))
    };

    onChangeDateAnswer = (value, id) => {
        let itemClone = _.cloneDeep(this.state.item);
        let questionnaireAnswers = itemClone && itemClone.questionnaireAnswers ? itemClone.questionnaireAnswers : null;
        if (!itemClone.questionnaireAnswers) {
            itemClone.questionnaireAnswers = {};
            questionnaireAnswers = itemClone.questionnaireAnswers;
        }
        questionnaireAnswers[id] = value;
        this.setState(prevState => ({
            item: Object.assign({}, prevState.item, {questionnaireAnswers: questionnaireAnswers})
        }))
    };

    onChangeSingleSelection = (value, id) => {
        let itemClone = _.cloneDeep(this.state.item);
        let questionnaireAnswers = itemClone && itemClone.questionnaireAnswers ? itemClone.questionnaireAnswers : null;
        if (!itemClone.questionnaireAnswers) {
            itemClone.questionnaireAnswers = {};
            questionnaireAnswers = itemClone.questionnaireAnswers;
        }
        questionnaireAnswers[id] = value.value;
        this.setState(prevState => ({
            item: Object.assign({}, prevState.item, {questionnaireAnswers: questionnaireAnswers})
        }))
    };

    onChangeMultipleSelection = (selections, id) => {
        let itemClone = Object.assign({}, this.state.item);
        let questionnaireAnswers = itemClone && itemClone.questionnaireAnswers ? itemClone.questionnaireAnswers : null;
        if (!itemClone.questionnaireAnswers) {
            itemClone.questionnaireAnswers = {};
            questionnaireAnswers = itemClone.questionnaireAnswers;
        }
        questionnaireAnswers[id] = selections.map((e) => {return e.value});
        this.setState(prevState => ({
            item: Object.assign({}, prevState.item, {questionnaireAnswers: questionnaireAnswers})
        }))
    };

    handleOnPressSave = () => {
        // Mark followUp as performed, and then update to the server
        let now = new Date();
        this.setState(prevState => ({
            item: Object.assign({}, prevState.item,
                {
                    updatedAt: now.toISOString(),
                    updatedBy: extractIdFromPouchId(this.props.user._id, 'user.json')
                }
            ),
            contact: Object.assign({}, prevState.contact, {
                updatedAt: now.toISOString(),
                updatedBy: extractIdFromPouchId(this.props.user._id, 'user.json')
            }),
            savePressed: true
        }), () => {
            let followUpClone = _.cloneDeep(this.state.item);
            let contactClone = _.cloneDeep(this.state.contact);

            if (followUpClone.address && followUpClone.address.location) {
                delete followUpClone.address.location;
            }

            if (contactClone.followUps) {
                delete contactClone.followUps;
            }

            if (contactClone.relationships) {
                delete contactClone.relationships;
            }

            if (this.props.isNew) {
                followUpClone = updateRequiredFields(this.props.user.activeOutbreakId, this.props.user._id, Object.assign({}, followUpClone), action = 'create', 'followUp.json');
                console.log ('followUpClone create', JSON.stringify(followUpClone))
                this.props.createFollowUp(this.props.outbreak.id, contactClone._id, followUpClone, contactClone, null, this.props.user.token)
            } else {
                if (this.state.deletePressed === false) {
                    followUpClone = updateRequiredFields(this.props.user.activeOutbreakId, this.props.user._id, Object.assign({}, followUpClone), action = 'update');
                    console.log ('followUpClone update', JSON.stringify(followUpClone))
                } else {
                    followUpClone = updateRequiredFields(this.props.user.activeOutbreakId, this.props.user._id, Object.assign({}, followUpClone), action = 'delete');
                    console.log ('followUpClone delete', JSON.stringify(followUpClone))
                }
                this.props.updateFollowUpAndContact(this.props.user.activeOutbreakId, contactClone._id, followUpClone._id, followUpClone, contactClone, this.props.user.token, this.props.filter);
            }
        });
    };

    handleOnPressMissing = () => {
        this.setState(prevState => ({
            item: Object.assign({}, prevState.item, {statusId: config.followUpStatuses.missed})
        }), () => {
            this.handleOnPressSave();
        })
    };

    showMenu = () => {
        this.refs.menuRef.show();
    };

    hideMenu = () => {
        this.refs.menuRef.hide();
    };

    handleOnPressDeceased = () => {
        console.log("### show date time picker: ");
        this._showDateTimePicker();
    };

    handleOnPressDelete = () => {
        // console.log("### handleOnPressDelete");
        Alert.alert("Alert", 'Are you sure you want to delete this follow-up?', [
            {
                text: 'Yes', onPress: () => {
                    this.hideMenu();
                    this.setState({
                        deletePressed: true
                    }, () => {
                        // console.log("### existing filters: ", this.props.filter);
                        // this.props.deleteFollowUp(this.props.outbreak.id, this.state.contact.id, this.state.item.id, this.props.filter, this.props.user.token);
                        this.setState(prevState => ({
                            item: Object.assign({}, prevState.item, {
                                deleted: true,
                                deletedAt: new Date().toISOString()
                            })
                        }), () => {
                            this.handleOnPressSave();
                        })
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

    _showDateTimePicker = () => {
        // console.log("ShowDate");
        this.setState({ isDateTimePickerVisible: true });
    };

    _hideDateTimePicker = () => {
        this.setState({ isDateTimePickerVisible: false });
    };

    _handleDatePicked = (date) => {
        // console.log("Date selected: ", date);
        // this._hideDateTimePicker();
        this.setState(prevState => ({
            contact: Object.assign({}, prevState.contact, {deceased: true, dateDeceased: date})
        }), () => {
            this.hideMenu();
            this.handleOnPressSave();
        });
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
        justifyContent: 'space-between'
    }
});

function mapStateToProps(state) {
    return {
        user: state.user,
        screenSize: state.app.screenSize,
        followUps: state.followUps,
        outbreak: state.outbreak,
        errors: state.errors,
        contacts: state.contacts
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        getFollowUpsForOutbreakId,
        getMissedFollowUpsForOutbreakId,
        createFollowUp,
        updateFollowUpAndContact,
        deleteFollowUp,
        updateContact,
        removeErrors
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(FollowUpsSingleScreen);