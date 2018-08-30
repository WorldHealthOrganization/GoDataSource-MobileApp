/**
 * Created by florinpopa on 04/07/2018.
 */
/**
 * Created by florinpopa on 14/06/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {View, Text, StyleSheet, Alert, Animated, NativeModules} from 'react-native';
import {Button, Icon} from 'react-native-material-ui';
import styles from './../styles';
import NavBarCustom from './../components/NavBarCustom';
import CalendarPicker from './../components/CalendarPicker';
import {calculateDimension} from './../utils/functions';
import config from './../utils/config';
import Ripple from 'react-native-material-ripple';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import SearchFilterView from './../components/SearchFilterView';
import FollowUpListItem from './../components/FollowUpListItem';
import MissedFollowUpListItem from './../components/MissedFollowUpListItem';
import AnimatedListView from './../components/AnimatedListView';
import ValuePicker from './../components/ValuePicker';
import {getFollowUpsForOutbreakId, getMissedFollowUpsForOutbreakId, updateFollowUpAndContact, addFollowUp, generateFollowUp} from './../actions/followUps';
import {getContactsForOutbreakId} from './../actions/contacts';
import {removeErrors} from './../actions/errors';
import {addFilterForScreen} from './../actions/app';
import ElevatedView from 'react-native-elevated-view';
import _ from 'lodash';
import AddFollowUpScreen from './AddFollowUpScreen';
import {LoaderScreen, Colors} from 'react-native-ui-lib'

const scrollAnim = new Animated.Value(0);
const offsetAnim = new Animated.Value(0);

class FollowUpsScreen extends Component {

    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
            // filter: this.props.filter && this.props.filter['FollowUpsScreen'] ? this.props.filter['FollowUpsScreen'] : null,
            filter: this.props.filter && this.props.filter['FollowUpsScreen'] ? this.props.filter['FollowUpsScreen'] : {
                date: new Date(),
                searchText: ''
            },
            filterFromFilterScreen: this.props.filter && this.props.filter['FollowUpsFilterScreen'] ? this.props.filter['FollowUpsFilterScreen'] : null,
            followUps: [],
            showAddFollowUpScreen: false,
            refreshing: false,
            loading: true
        };
        // Bind here methods, or at least don't declare methods in the render method
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
        this.renderFollowUp = this.renderFollowUp.bind(this);
        this.keyExtractor = this.keyExtractor.bind(this);
        this.renderSeparatorComponent = this.renderSeparatorComponent.bind(this);
        this.calculateTopForDropdown = this.calculateTopForDropdown.bind(this);
        this.listEmptyComponent = this.listEmptyComponent.bind(this);
        this.onSelectValue = this.onSelectValue.bind(this);
        this.handleDayPress = this.handleDayPress.bind(this);
    }

    // Please add here the react lifecycle methods that you need
    static getDerivedStateFromProps(props, state) {
        if (props.errors && props.errors.type && props.errors.message) {
            Alert.alert(props.errors.type, props.errors.message, [
                {
                    text: 'Ok', onPress: () => {
                    props.removeErrors();
                    state.loading = false;
                }
                }
            ])
        }

        if (props.contacts) {
            let contactWithOneFollowUp = [];
            state.followUps = [];
            contactWithOneFollowUp = _.filter(props.contacts, (contact) => {
                // console.log("### contact from filter: ", contact);
                let followUp = _.filter(contact.followUps, (followUp) => {
                    let oneDay = 24 * 60 * 60 * 1000;
                    let truthValue = false;
                    if (!state.filter.date) {
                        state.filter.date = new Date();
                    }

                    // let dateString = state.filter.date.getFullYear() + '-' + (state.filter.date.getMonth() + 1) + '-' + (state.filter.date.getDate() + 1);
                    // let date = new Date('2018/8/10');
                    //
                    //
                    // console.log(date);
                    // console.log(new Date(followUp.date));
                    // console.log(new Date(new Date(state.filter.date.getFullYear() + '-' + (state.filter.date.getMonth() + 1) + '-' + (state.filter.date.getDate() + 1))));
                    // console.log("~~~~~~~~~~~~~~");

                    // Check if the followUp is from the date selected from the calendar
                    truthValue = (new Date(state.filter.date.getFullYear() + '/' + (state.filter.date.getMonth() + 1) + '/' + (state.filter.date.getDate() + 1)).getTime() - oneDay) <= new Date(followUp.date).getTime() &&
                        (new Date(new Date(state.filter.date.getFullYear() + '/' + (state.filter.date.getMonth() + 1) + '/' + (state.filter.date.getDate() + 1)).getTime()) > new Date(followUp.date).getTime());

                    // Check if the follow-up was performed/lost
                    if (state.filter.performed && state.filter.performed === 'To do') {
                        truthValue = truthValue && !followUp.performed && !followUp.lostToFollowUp;
                    } else {
                        if (state.filter.performed && state.filter.performed === 'Missed') {
                            truthValue = truthValue && ((followUp.lostToFollowUp && followUp.performed) || (!followUp.performed && !followUp.lostToFollowUp));
                            // Also check if the follow-up was in the past. You cannot miss a follow-up from the future
                            let oneDay = 24 * 60 * 60 * 1000;
                            let now = new Date();
                            truthValue = truthValue && (new Date(followUp.date).getTime() - oneDay <= new Date(now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + (now.getDate() + 1)).getTime())
                        }
                    }

                    if (truthValue) {
                        state.followUps.push(followUp);
                    }
                    return truthValue;
                });
                return followUp.length > 0;
            });
            state.refreshing = false;
            state.loading = false;
        }
        return null;
    }

    clampedScroll= Animated.diffClamp(
        Animated.add(
            scrollAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
                extrapolateLeft: 'clamp',
            }),
            offsetAnim,
        ),
        0,
        30,
    );

    handleScroll = Animated.event(
            [{nativeEvent: {contentOffset: {y: scrollAnim}}}],
            {useNativeDriver: true}
        );

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        const navbarTranslate = this.clampedScroll.interpolate({
            inputRange: [0, 30],
            outputRange: [0, -30],
            extrapolate: 'clamp',
        });
        const navbarOpacity = this.clampedScroll.interpolate({
            inputRange: [0, 30],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });

        // console.log('this.state.filter: ', this.state.followUps);

        return (
            <View style={style.container}>
                <NavBarCustom
                    title="Follow-ups"
                    navigator={this.props.navigator}
                    iconName="menu"
                    handlePressNavbarButton={this.handlePressNavbarButton}
                >
                    <CalendarPicker
                        width={calculateDimension(124, false, this.props.screenSize)}
                        height={calculateDimension(25, true, this.props.screenSize)}
                        onDayPress={this.handleDayPress}
                        value={this.state.filter.date || new Date().toLocaleString()}
                    />
                    <ValuePicker
                        top={this.calculateTopForDropdown()}
                        onSelectValue={this.onSelectValue}
                        value={this.state.filter.performed || config.dropDownValues[0].value}
                    />
                    <ElevatedView
                        elevation={3}
                        style={{
                            backgroundColor: styles.buttonGreen,
                            width: calculateDimension(33, false, this.props.screenSize),
                            height: calculateDimension(25, true, this.props.screenSize),
                            borderRadius: 4
                        }}
                    >
                    <Ripple style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }} onPress={this.handleOnPressAddFollowUp}>
                        <Icon name="add" color={'white'} size={15}/>
                    </Ripple>
                    </ElevatedView>
                </NavBarCustom>
                <View style={style.containerContent}>
                    <AnimatedListView
                        stickyHeaderIndices={[0]}
                        data={this.state.followUps || []}
                        renderItem={this.renderFollowUp}
                        keyExtractor={this.keyExtractor}
                        ListHeaderComponent={
                            <SearchFilterView
                                style={{
                                    transform: [{
                                        translateY: navbarTranslate
                                    }],
                                    opacity: navbarOpacity
                                }}
                                value={this.state.filter.searchText}
                                onPress={this.handlePressFilter}
                                onChangeText={this.handleOnChangeText}
                                onSubmitEditing={this.handleOnSubmitEditing}
                                filterText={this.state.filterFromFilterScreen && this.state.filterFromFilterScreen.where && this.state.filterFromFilterScreen.where.and && Array.isArray(this.state.filterFromFilterScreen.where.and) ? ("Filter (" + this.state.filterFromFilterScreen.where.and.length + ')') : 'Filter'}
                            />}
                        ItemSeparatorComponent={this.renderSeparatorComponent}
                        ListEmptyComponent={this.listEmptyComponent}
                        style={[style.listViewStyle]}
                        componentContainerStyle={style.componentContainerStyle}
                        onScroll={this.handleScroll}
                        refreshing={this.state.refreshing}
                        onRefresh={this.handleOnRefresh}
                    />
                </View>
                <AddFollowUpScreen
                    showAddFollowUpScreen={this.state.showAddFollowUpScreen}
                    onCancelPressed={this.handleOnCancelPressed}
                    onSavePressed={this.handleOnSavePressed}
                />
                {
                    this.state.loading &&
                        <LoaderScreen
                            color={Colors.blue60}
                            message={"Loading..."}
                            overlay
                        />
                }
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

    renderFollowUp = ({item}) => {
        let oneDay = 24 * 60 * 60 * 1000;
        let itemDate = new Date(item.date).getTime();
        let now = new Date().getTime() - oneDay;
        if ((!item.performed && itemDate < now) || item.lostToFollowUp) {
            return (
                <MissedFollowUpListItem
                    item={item}
                    onPressFollowUp={this.handlePressFollowUp}
                />
            )
        } else {
            return (
                <FollowUpListItem
                    item={item}
                    onPressFollowUp={this.handlePressFollowUp}
                    onPressMissing={this.handleOnPressMissing}
                    onPressExposure={this.handleOnPressExposure}
                />
            )
        }
    };

    keyExtractor = (item, index) => item.id;

    renderSeparatorComponent = () => {
        return (
            <View style={style.separatorComponentStyle} />
        )
    };

    handleOnRefresh = () => {
        this.setState({
            refreshing: true
        }, () => {
            this.props.getContactsForOutbreakId(this.props.user.activeOutbreakId, config.defaultFilterForContacts, this.props.user.token);
        });
    };

    calculateTopForDropdown = () => {
        let dim = calculateDimension(98, true, this.props.screenSize);
        return dim;
    };

    listEmptyComponent = () => {
        return (
            <View style={[style.emptyComponent, {height: calculateDimension((667 - 152), true, this.props.screenSize)}]}>
                <Text style={style.emptyComponentTextView}>There are no follow-ups to display</Text>
                <Button
                    raised
                    upperCase={false}
                    text="Generate for 1 day"
                    color="blue"
                    titleColor="red"
                    onPress={this.handleGenerateFollowUps}
                    style={{
                        text: style.buttonEmptyListText,
                        container: {width: calculateDimension(230, false, this.props.screenSize), height: calculateDimension(35, true, this.props.screenSize)}
                    }}
                />
            </View>
        )
    };

    onSelectValue = (value) => {
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, {performed: value})
        }), () => {
            console.log("### filter from onSelectValue: ", this.state.filter);
            if (value === 'All') {
                this.removeFromFilter({type: 'performed'});
            } else {
                this.appendToFilter({type: 'performed', value});
            }
        });
    };

    handleDayPress = (day) => {
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, {date: day})
        }), () => {
            console.log("### filter from handleDayPress: ", this.state.filter);
            this.appendToFilter({type: 'date', value: day});
        });
    };

    handlePressFollowUp = (item, contact) => {
        console.log("### handlePressFollowUp: ", item);
        this.props.navigator.push({
            screen: 'FollowUpsSingleScreen',
            animated: true,
            animationType: 'fade',
            passProps: {
                item: item,
                contact: contact,
                filter: this.state.filter
            }
        })
    };

    handleOnPressMissing = (followUp, contact) => {
        followUp.lostToFollowUp = true;
        followUp.performed = true;
        // console.log("### ceva: ", followUp, contact);
        this.props.updateFollowUpAndContact(this.props.user.activeOutbreakId, contact.id, followUp.id, followUp, contact, this.props.user.token);
    };

    handleOnPressExposure = (followUp, contact) => {
        this.props.navigator.showModal({
            screen: "ExposureScreen",
            animated: true,
            passProps: {
                contact: contact,
                type: 'Contact'
            }
        })
    };

    handlePressFilter = () => {
        this.props.navigator.showModal({
            screen: 'FollowUpsFilterScreen',
            animated: true,
            passProps: {
                activeFilters: this.state.filterFromFilterScreen || null,
                onApplyFilters: this.handleOnApplyFilters
            }
        })
    };

    handleOnChangeText = (text) => {
        console.log("### handleOnChangeText: ", text);
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, {searchText: text})
        }), console.log('### filter after changed text: ', this.state.filter))
    };

    handleOnPressAddFollowUp = () => {
        this.setState({
            showAddFollowUpScreen: !this.state.showAddFollowUpScreen
        })
    };

    handleOnCancelPressed = () => {
        this.setState({
            showAddFollowUpScreen: !this.state.showAddFollowUpScreen
        })
    };

    handleOnSavePressed = (contact, date) => {
        // Here contact={label: <name>, value: <contactId>} and date is a regular date
        let followUp = {
            performed: false,
            lostToFollowUp: false,
            date: date,
            outbreakId: this.props.user.activeOutbreakId,
            personId: contact.value
        };

        this.setState({
            showAddFollowUpScreen: !this.state.showAddFollowUpScreen
        }, () => {
            this.props.addFollowUp(this.props.user.activeOutbreakId, contact.value, followUp, this.props.user.token);
        });
    };

    handleGenerateFollowUps = () => {
        this.props.generateFollowUp(this.props.user.activeOutbreakId, 1, this.props.user.token);
    };

    // Append to the existing filter newProp={name: value}
    appendToFilter = (newProp) => {
        let auxFilter = Object.assign({}, this.state.filter);

        // If the filter exists, check if it has already the wanted props and change them. Otherwise add them
        if (auxFilter) {
           auxFilter[newProp.type] = newProp.value;
        }

        this.setFilter(auxFilter);
    };

    removeFromFilter = (newProp) => {
        let auxFilter = Object.assign({}, this.state.filter);

        if (auxFilter && auxFilter[newProp.type]) {
            delete auxFilter[newProp.type];
        }

        this.setFilter(auxFilter);
    };

    setFilter = (filter) => {
        this.setState({filter}, () => {
            // After setting the filter, we want to apply it
            this.applyFilters();
        });
    };

    applyFilters = () => {
        // let filter = {};
        //
        // filter.where = {};
        // filter.where.and = [];
        //
        // let oneDay = 24 * 60 * 60 * 1000;
        //
        // if (this.state.filter.date) {
        //     filter.where.and.push({date: {gt: new Date(this.state.filter.date.getTime() - oneDay)}});
        //     filter.where.and.push({date: {lt: new Date(this.state.filter.date.getTime() + oneDay)}});
        // }
        // // else {
        // //     let now = new Date();
        // //
        // //     filter.where.and.push({date: {gt: new Date(now.getTime() - oneDay)}});
        // //     filter.where.and.push({date: {lt: new Date(now.getTime() + oneDay)}});
        // // }
        //
        // if (this.state.filter.performed) {
        //     filter.where.and.push({performed: this.state.filter.performed !== 'To do'})
        // }
        //
        this.props.addFilterForScreen('FollowUpsScreen', this.state.filter);
        //
        // if (this.state.filter.performed === 'Missed') {
        //     this.props.getMissedFollowUpsForOutbreakId(this.props.user.activeOutbreakId, filter, this.props.user.token);
        // } else {
        //     this.props.getFollowUpsForOutbreakId(this.props.user.activeOutbreakId, filter, this.props.user.token);
        // }

        let defaultFilter = Object.assign({}, config.defaultFilterForContacts);

        // Check if there is an active search
        if (this.state.filter.searchText) {
            if (!defaultFilter.where || Object.keys(defaultFilter.where).length === 0) {
                defaultFilter.where = {}
            }
            if (!defaultFilter.where.or || defaultFilter.where.or.length === 0) {
                defaultFilter.where.or = [];
            }
            defaultFilter.where.or.push({firstName: {like: this.state.filter.searchText, options: 'i'}});
            defaultFilter.where.or.push({lastName: {like: this.state.filter.searchText, options: 'i'}});
        }

        //Check if there are active filters
        if (this.state.filterFromFilterScreen) {
            defaultFilter.where = this.state.filterFromFilterScreen.where;
            if (this.state.filter.searchText) {
                if (!defaultFilter.where || Object.keys(defaultFilter.where).length === 0) {
                    defaultFilter.where = {}
                }
                if (!defaultFilter.where.or || defaultFilter.where.or.length === 0) {
                    defaultFilter.where.or = [];
                }
                defaultFilter.where.or.push({firstName: {like: this.state.filter.searchText, options: 'i'}});
                defaultFilter.where.or.push({lastName: {like: this.state.filter.searchText, options: 'i'}});
            }
        }

        this.props.getContactsForOutbreakId(this.props.user.activeOutbreakId, defaultFilter, this.props.user.token)
    };

    handleOnSubmitEditing = (text) => {
        this.props.addFilterForScreen("FollowUpsScreen", this.state.filter);
        let existingFilter = this.state.filterFromFilterScreen ? Object.assign({}, this.state.filterFromFilterScreen) : Object.assign({}, config.defaultFilterForContacts);

        if (!existingFilter.where || Object.keys(existingFilter.where).length === 0) {
            existingFilter.where = {};
        }
        if (!existingFilter.where.or || existingFilter.where.or.length === 0) {
            existingFilter.where.or = [];
        }
        existingFilter.where.or.push({firstName: {like: this.state.filter.searchText, options: 'i'}});
        existingFilter.where.or.push({lastName: {like: this.state.filter.searchText, options: 'i'}});

        this.props.getContactsForOutbreakId(this.props.user.activeOutbreakId, existingFilter, this.props.user.token);
    };

    handleOnApplyFilters = (filter) => {
        this.setState({
            filterFromFilterScreen: filter
        }, () => {
            if (this.state.filter.searchText) {

                if (!filter.where.or || filter.where.or.length === 0) {
                    filter.where.or = [];
                }
                filter.where.or.push({firstName: {like: this.state.filter.searchText, options: 'i'}});
                filter.where.or.push({lastName: {like: this.state.filter.searchText, options: 'i'}});
            }
            this.props.getContactsForOutbreakId(this.props.user.activeOutbreakId, filter, this.props.user.token);
        })
    };

    onNavigatorEvent = (event) => {
        if (event.type === 'DeepLink') {
            console.log("###");
            if (event.link.includes('Navigate')) {
                let linkComponents = event.link.split('/');
                console.log("### linkComponents: ", linkComponents);
                if (linkComponents.length > 0) {
                    let screenToSwitchTo = null;
                    let addScreen = null;
                    switch(linkComponents[1]) {
                        case '0':
                            screenToSwitchTo = 'FollowUpsScreen';
                            break;
                        case '1':
                            screenToSwitchTo = "ContactsScreen";
                            break;
                        case '2':
                            screenToSwitchTo = "CasesScreen";
                            break;
                        case '2-add':
                            screenToSwitchTo = "CasesScreen";
                            addScreen = "AddSingleCaseScreen";
                            break;
                        default:
                            screenToSwitchTo = "FollowUpsScreen";
                            break;
                    }
                    this.props.navigator.resetTo({
                        screen: screenToSwitchTo,
                        animated: true
                    });
                    if(addScreen) {
                        this.props.navigator.push({
                            screen: addScreen,
                            animated: true,
                            animationType: 'fade',
                            passProps: {
                                item: {},
                                filter: null
                            }
                        })
                    }
                }
            }
        }
    };
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    containerContent: {
        flex: 1,
        backgroundColor: styles.appBackground
    },
    separatorComponentStyle: {
        height: 8
    },
    listViewStyle: {

    },
    componentContainerStyle: {

    },
    emptyComponent: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyComponentTextView: {
        fontFamily: 'Roboto-Light',
        fontSize: 15,
        color: styles.textEmptyList
    },
    buttonEmptyListText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 16.8,
        color: styles.buttonTextGray
    }
});

function mapStateToProps(state) {
    return {
        user: state.user,
        screenSize: state.app.screenSize,
        filter: state.app.filters,
        followUps: state.followUps,
        contacts: state.contacts,
        errors: state.errors
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        getFollowUpsForOutbreakId,
        getMissedFollowUpsForOutbreakId,
        removeErrors,
        addFilterForScreen,
        getContactsForOutbreakId,
        updateFollowUpAndContact,
        addFollowUp,
        generateFollowUp
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(FollowUpsScreen);