/**
 * Created by mobileclarisoft on 12/12/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {View, StyleSheet, Platform, Animated, Alert, BackHandler} from 'react-native';
import {Icon} from 'react-native-material-ui';
import styles from './../styles';
import NavBarCustom from './../components/NavBarCustom';
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
import {calculateDimension, extractIdFromPouchId, computeIdForFileType, updateRequiredFields, getTranslation} from './../utils/functions';
import translations from './../utils/translations'


class HelpSingleScreen extends Component {

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
            isEditMode: true,
            isModified: false
        };
        // Bind here methods, or at least don't declare methods in the render method
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick() {
        this.props.navigator.pop({
                animated: true,
                animationType: 'fade'
            });
        return false;
    }

    // Please add here the react lifecycle methods that you need
    static getDerivedStateFromProps(props, state) {
        if (props.errors && props.errors.type && props.errors.message) {
            Alert.alert(props.errors.type, props.errors.message, [
                {
                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                    onPress: () => {
                        props.removeErrors();
                    }
                }
            ])
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
                                entities={[
                                    getTranslation(translations.helpScreen.helpTitle, this.props.translation),
                                    getTranslation(translations.helpScreen.helpViewItemTitle, this.props.translation)
                                ]}
                                navigator={this.props.navigator}
                                onPress={this.handlePressBreadcrumb}
                            />
                        </View>
                    }
                    navigator={this.props.navigator}
                    iconName="menu"
                    handlePressNavbarButton={this.handlePressNavbarButton}
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
                        isNew={this.props.isNew}
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
                        isNew={this.props.isNew}
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
                {getTranslation(route.title, this.props.translation).toUpperCase()}
            </Animated.Text>
        );
    };

    handleNextPress = () => {
        this.handleOnIndexChange(this.state.index + 1 );
    };

    //Breadcrumb click
    handlePressBreadcrumb = () => {
        if (this.state.isModified === true) {
            Alert.alert("", 'You have unsaved data. Are you sure you want to leave this page and lose all changes?', [
                {
                    text: 'Yes', onPress: () => {
                    this.props.navigator.pop({
                        animated: true,
                        animationType: 'fade'
                    })
                }
                },
                {
                    text: 'Cancel', onPress: () => {
                    console.log("onPressCancelEdit No pressed - nothing changes")
                }
                }
            ])
        } else {
            this.props.navigator.pop({
                animated: true,
                animationType: 'fade'
            });
        }
    };

    onChangeText = (value, id, objectType) => {
        console.log("onChangeText: ", objectType);
        if (objectType === 'FollowUp') {
            this.setState(
                (prevState) => ({
                    item: Object.assign({}, prevState.item, {[id]: value}),
                    isModified: true
                }), () => {
                    console.log("onChangeText", id, " ", value, " ", this.state.item);
                }
            )
        } else {
            if (objectType === 'Contact') {
                this.setState(
                    (prevState) => ({
                        contact: Object.assign({}, prevState.contact, {[id]: value}),
                        isModified: true
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
                    item: Object.assign({}, prevState.item, {[id]: value}),
                    isModified: true
                })
                , () => {
                    console.log("onChangeDate", id, " ", value, " ", this.state.item);
                }
            )
        } else {
            if (objectType === 'Contact') {
                this.setState(
                    (prevState) => ({
                        contact: Object.assign({}, prevState.contact, {[id]: value}),
                        isModified: true
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
                            item: Object.assign({}, prevState.item, {[id]: value ? {lat: position.coords.latitude, lng: position.coords.longitude} : null }),
                            isModified: true
                        }), () => {
                            console.log("onChangeSwitch", id, " ", value, " ", this.state.item);
                        }
                    )
                },
                (error) => {
                    Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.getLocationError, this.props.translation), [
                        {
                            text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                            onPress: () => {console.log("OK pressed")}
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
                        item: Object.assign({}, prevState.item, {[id]: value}),
                        isModified: true
                    }), () => {
                        console.log("onChangeSwitch", id, " ", value, " ", this.state.item);
                    }
                )
            } else {
                if (objectType === 'Contact') {
                    this.setState(
                        (prevState) => ({
                            contact: Object.assign({}, prevState.contact, {[id]: value}),
                            isModified: true
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

                let address = this.state.contact && this.state.contact.addresses && Array.isArray(this.state.contact.addresses) && this.state.contact.addresses.length > 0 ? this.state.contact.addresses.filter((e) => {
                    return value.includes(e.addressLine1 || '') && value.includes(e.addressLine2 || '') && value.includes(e.city || '') && value.includes(e.country || '') && value.includes(e.postalCode || '');
                }) : [];

                this.setState(
                    (prevState) => ({
                        item: Object.assign({}, prevState.item, {[id]: address[0]}),
                        isModified: true
                    }), () => {
                        console.log("onChangeDropDown", id, " ", value, " ", this.state.item);
                    }
                )
            } else {
                this.setState(
                    (prevState) => ({
                        item: Object.assign({}, prevState.item, {[id]: value && value.value ? value.value : value}),
                        isModified: true
                    }), () => {
                        console.log("onChangeDropDown", id, " ", value, " ", this.state.item);
                    }
                )
            }

        } else {
            if (objectType === 'Contact') {
                this.setState(
                    (prevState) => ({
                        contact: Object.assign({}, prevState.contact, {[id]: value && value.value ? value.value : value}),
                        isModified: true
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
            item: Object.assign({}, prevState.item, {questionnaireAnswers: questionnaireAnswers}),
            isModified: true
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
            item: Object.assign({}, prevState.item, {questionnaireAnswers: questionnaireAnswers}),
            isModified: true
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
            item: Object.assign({}, prevState.item, {questionnaireAnswers: questionnaireAnswers}),
            isModified: true
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
            item: Object.assign({}, prevState.item, {questionnaireAnswers: questionnaireAnswers}),
            isModified: true
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
            savePressed: true,
            isModified: false,
        }), () => {
            let followUpClone = _.cloneDeep(this.state.item);
            if (followUpClone.targeted !== false && followUpClone.targeted !== true) {
                followUpClone.targeted = false;
            }
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
        contacts: state.contacts,
        translation: state.app.translation,
        role: state.role
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

export default connect(mapStateToProps, matchDispatchProps)(HelpSingleScreen);