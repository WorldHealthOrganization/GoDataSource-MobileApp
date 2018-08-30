/**
 * Created by mobileclarisoft on 13/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {TextInput, View, Text, StyleSheet, Dimensions, Platform, FlatList, Animated} from 'react-native';
import {Button, Icon} from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import styles from './../styles';
import NavBarCustom from './../components/NavBarCustom';
import {Calendar} from 'react-native-calendars';
import CalendarPicker from './../components/CalendarPicker';
import {calculateDimension} from './../utils/functions';
import config from './../utils/config';
import ButtonWithIcons from './../components/ButtonWithIcons';
import ValuePicker from './../components/ValuePicker';
import Ripple from 'react-native-material-ripple';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import SearchFilterView from './../components/SearchFilterView';
import CaseListItem from './../components/CaseListItem';
import ElevatedView from 'react-native-elevated-view';
import {Dropdown} from 'react-native-material-dropdown';
import Breadcrumb from './../components/Breadcrumb';
import {getCasesForOutbreakId} from './../actions/cases';
import {removeErrors} from './../actions/errors';
import {addFilterForScreen} from './../actions/app';

let height = Dimensions.get('window').height;
let width = Dimensions.get('window').width;

const scrollAnim = new Animated.Value(0);
const offsetAnim = new Animated.Value(0);

class CasesScreen extends Component {
    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
            filter: this.props.filter && this.props.filter['CasesScreen'] ? this.props.filter['CasesScreen'] : {
                searchText: ''
            },
            filterFromFilterScreen: this.props.filter && this.props.filter['CasesFilterScreen'] ? this.props.filter['CasesFilterScreen'] : null,
            followUps: []
        };

        // Bind here methods, or at least don't declare methods in the render method
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
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
    // Please add here the react lifecycle methods that you need

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
        let caseTitle = []; caseTitle[1] = 'Cases';
        return (
            <View style={style.container}>
                <NavBarCustom
                    title={null}
                    customTitle={
                        <View style={{flex: 1, flexDirection: 'row'}}>
                            <View
                                style={[style.breadcrumbContainer]}>
                                <Breadcrumb
                                    key="caseKey"
                                    entities={caseTitle}
                                    navigator={this.props.navigator}
                                />
                            </View>
                            <View style={{flex: 0.1,}}>
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
                                    }} onPress={this.handleOnPressAddCase}>
                                        <Icon name="add" color={'white'} size={15}/>
                                    </Ripple>
                                </ElevatedView>
                            </View>
                        </View>
                    }
                    navigator={this.props.navigator}
                    iconName="menu"
                    handlePressNavbarButton={this.handlePressNavbarButton}
                >

                </NavBarCustom>
                <View style={style.containerContent}>
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
                        filterText={this.state.filterFromFilterScreen && this.state.filterFromFilterScreen.where
                        && this.state.filterFromFilterScreen.where.and && Array.isArray(this.state.filterFromFilterScreen.where.and) ?
                            ("Filter (" + this.state.filterFromFilterScreen.where.and.length + ')') : 'Filter'}
                    />
                    <FlatList
                        data={this.props.cases}
                        renderItem={this.renderCase}
                        keyExtractor={this.keyExtractor}
                        ItemSeparatorComponent={this.renderSeparatorComponent}
                    />
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

    handleDayPress = (day) => {
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, {date: day})
        }), () => {
            console.log("### filter from handleDayPress: ", this.state.filter);
            this.appendToFilter({type: 'date', value: day});
        });
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

    handleOnSubmitEditing = (text) => {
        this.props.addFilterForScreen("CasesScreen", this.state.filter);
        let existingFilter = this.state.filterFromFilterScreen ? Object.assign({}, this.state.filterFromFilterScreen) : Object.assign({}, config.defaultFilterForCases);

        if (!existingFilter.where || Object.keys(existingFilter.where).length === 0) {
            existingFilter.where = {};
        }
        if (!existingFilter.where.or || existingFilter.where.or.length === 0) {
            existingFilter.where.or = [];
        }
        existingFilter.where.or.push({firstName: {like: this.state.filter.searchText, options: 'i'}});
        existingFilter.where.or.push({lastName: {like: this.state.filter.searchText, options: 'i'}});

        this.props.getCasesForOutbreakId(this.props.user.activeOutbreakId, existingFilter, this.props.user.token);
    };

    setFilter = (filter) => {
        this.setState({filter}, () => {
            // After setting the filter, we want to apply it
            this.applyFilters();
        });
    };

    applyFilters = () => {
        // // let filter = {};
        // //
        // // filter.where = {};
        // // filter.where.and = [];
        // //
        // // let oneDay = 24 * 60 * 60 * 1000;
        // //
        // // if (this.state.filter.date) {
        // //     filter.where.and.push({date: {gt: new Date(this.state.filter.date.getTime() - oneDay)}});
        // //     filter.where.and.push({date: {lt: new Date(this.state.filter.date.getTime() + oneDay)}});
        // // }
        // // // else {
        // // //     let now = new Date();
        // // //
        // // //     filter.where.and.push({date: {gt: new Date(now.getTime() - oneDay)}});
        // // //     filter.where.and.push({date: {lt: new Date(now.getTime() + oneDay)}});
        // // // }
        // //
        // // if (this.state.filter.performed) {
        // //     filter.where.and.push({performed: this.state.filter.performed !== 'To do'})
        // // }
        // //
        // this.props.addFilterForScreen('FollowUpsScreen', this.state.filter);
        // //
        // // if (this.state.filter.performed === 'Missed') {
        // //     this.props.getMissedFollowUpsForOutbreakId(this.props.user.activeOutbreakId, filter, this.props.user.token);
        // // } else {
        // //     this.props.getFollowUpsForOutbreakId(this.props.user.activeOutbreakId, filter, this.props.user.token);
        // // }
        //
        // let defaultFilter = Object.assign({}, config.defaultFilterForContacts);
        //
        // // Check if there is an active search
        // if (this.state.filter.searchText) {
        //     if (!defaultFilter.where || Object.keys(defaultFilter.where).length === 0) {
        //         defaultFilter.where = {}
        //     }
        //     if (!defaultFilter.where.or || defaultFilter.where.or.length === 0) {
        //         defaultFilter.where.or = [];
        //     }
        //     defaultFilter.where.or.push({firstName: {like: this.state.filter.searchText, options: 'i'}});
        //     defaultFilter.where.or.push({lastName: {like: this.state.filter.searchText, options: 'i'}});
        // }
        //
        // //Check if there are active filters
        // if (this.state.filterFromFilterScreen) {
        //     defaultFilter.where = this.state.filterFromFilterScreen.where;
        //     if (this.state.filter.searchText) {
        //         if (!defaultFilter.where || Object.keys(defaultFilter.where).length === 0) {
        //             defaultFilter.where = {}
        //         }
        //         if (!defaultFilter.where.or || defaultFilter.where.or.length === 0) {
        //             defaultFilter.where.or = [];
        //         }
        //         defaultFilter.where.or.push({firstName: {like: this.state.filter.searchText, options: 'i'}});
        //         defaultFilter.where.or.push({lastName: {like: this.state.filter.searchText, options: 'i'}});
        //     }
        // }
        //
        // this.props.getContactsForOutbreakId(this.props.user.activeOutbreakId, defaultFilter, this.props.user.token)
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

    handlePressFilter = () => {
        this.props.navigator.showModal({
            screen: 'CasesFilterScreen',
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

    renderCase = ({item}) => {
        return (
            <CaseListItem item={item} onPressCase={this.handleOnPressCase}/>
        )
    };

    keyExtractor = (item, index) => item.id;

    renderSeparatorComponent = () => {
        return (
            <View style={style.separatorComponentStyle} />
        )
    };

    handlePressDropdown = () => {
        this.refs.dropdown.focus();
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
            this.props.getCasesForOutbreakId(this.props.user.activeOutbreakId, filter, this.props.user.token);
        })
    };

    //Open single case SingleCaseScreen
    handleOnPressCase = (item, contact) => {
        console.log("### handlePressCases: ", item);
        this.props.navigator.push({
            screen: 'SingleCaseScreen',
            animated: true,
            animationType: 'fade',
            passProps: {
                item: item,
                filter: this.state.filter
            }
        })
    };

    handleOnPressAddCase = () => {
        console.log("### handlePressAddCases: ");
        this.props.navigator.push({
            screen: 'AddSingleCaseScreen',
            animated: true,
            animationType: 'fade',
            passProps: {
                item: {},
                filter: this.state.filter
            }
        })
    };

    calculateTopForDropdown = () => {
        let dim = calculateDimension(98, true, this.props.screenSize);
        return dim;
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
        backgroundColor: 'rgba(217, 217, 217, 0.5)'
    },
    separatorComponentStyle: {
        height: 8
    },
    breadcrumbContainer: {
        flex: 0.9,
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },
});

function mapStateToProps(state) {
    return {
        user: state.user,
        cases: state.cases,
        filter: state.app.filters,
        screenSize: state.app.screenSize,
        errors: state.errors
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        getCasesForOutbreakId,
        addFilterForScreen,
        removeErrors,
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(CasesScreen);