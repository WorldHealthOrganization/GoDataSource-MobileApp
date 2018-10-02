/**
 * Created by florinpopa on 25/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {View, Text, StyleSheet, Platform, Animated} from 'react-native';
import {Button} from 'react-native-material-ui';
import styles from './../styles';
import NavBarCustom from './../components/NavBarCustom';
import {calculateDimension} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {getContactsForOutbreakId} from './../actions/contacts';
import {addFilterForScreen, removeFilterForScreen} from './../actions/app';
import {TabBar, TabView} from 'react-native-tab-view';
import FollowUpsFiltersContainer from './../containers/FollowUpsFiltersContainer';
import FollowUpsSortContainer from './../containers/FollowUpsSortContainer';

class FollowUpsFilterScreen extends Component {

    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
            filter: {
                filter: {
                    gender: {
                        Male: false,
                        Female: false
                    },
                    age: [0, 100],
                    selectedLocations: [],
                    exposure: []
                },
                sort: []
            },
            routes: config.tabsValuesRoutes.followUpsFilter,
            index: 0
        };
        // Bind here methods, or at least don't declare methods in the render method
    }

    // Please add here the react lifecycle methods that you need
    static getDerivedStateFromProps(props, state) {
        let filterClone = Object.assign({}, state.filter.filter);
        if (props && props.activeFilters) {
                if (props.activeFilters.gender) {
                    filterClone.gender[props.activeFilters.gender] = true;
                }
                if (props.activeFilters.age && Array.isArray(props.activeFilters.age) && props.activeFilters.age.length === 2) {
                    filterClone.age[0] = props.activeFilters.age[0];
                    filterClone.age[1] = props.activeFilters.age[1];
                }
            console.log("### Active filters: ", filterClone);
        }
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {

        return (
            <View style={style.container}>
                <NavBarCustom
                    title="Follow-ups filters"
                    navigator={this.props.navigator}
                    iconName="close"
                    handlePressNavbarButton={this.handlePressNavbarButton}
                />
                <TabView
                    navigationState={this.state}
                    onIndexChange={this.handleOnIndexChange}
                    renderScene={this.handleRenderScene}
                    renderTabBar={this.handleRenderTabBar}
                />
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handlePressNavbarButton = () => {
        this.props.removeFilterForScreen('FollowUpsFilterScreen');
        this.props.navigator.dismissModal(this.props.onApplyFilters(null));
    };

    handleOnIndexChange = (index) => {
        this.setState({index});
    };

    handleRenderScene = () => {
        if (this.state.index === 0) {
            return (
                <FollowUpsFiltersContainer
                    filter={this.state.filter}
                    onSelectItem={this.handleOnSelectItem}
                    onChangeSectionedDropDown={this.handleOnChangeSectionedDropDown}
                    onChangeInterval={this.handleOnChangeInterval}
                    onChangeMultipleSelection={this.handleOnChangeMultipleSelection}
                    onPressApplyFilters={this.handleOnPressApplyFilters}
                />
            )
        } else {
            return (
                <FollowUpsSortContainer
                    filter={this.state.filter}
                />
            )
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
    }

    handleOnSelectItem = (item, index, id) => {
        console.log("### handleOnSelectItem: ", item, index, id);
        let filter = Object.assign({}, this.state.filter.filter);
        filter[id][item.value] = !filter[id][item.value];
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, Object.assign({}, prevState.filter.filter, {[id]: filter[id]}))
        }))
    }

    handleOnChangeSectionedDropDown = (selectedItems) => {
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, {filter: Object.assign({}, prevState.filter.filter, {selectedLocations: selectedItems})})
        }), () => {
            console.log("Filters: ", this.state.filter.filter);
        })
    };

    handleOnChangeInterval = (values, id) => {
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, {filter: Object.assign({}, prevState.filter.filter, {[id]: values})})
        }));
    }

    handleOnChangeMultipleSelection = (selections, id) => {
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, {filter: Object.assign({}, prevState.filter.filter, {[id]: selections})})
        }), () => {
            console.log("### selections: ", this.state.filter.filter);
        })
    };

    handleOnPressApplyFilters = () => {
        let filterStateClone = Object.assign({}, this.state.filter.filter);
        let filter = {};

        if (filterStateClone.gender.Male) {
            filter.gender = 'Male'
        }
        if (filterStateClone.gender.Female) {
            filter.gender = 'Female'
        }

        if (filterStateClone.age) {
            filter.age = filterStateClone.age;
        }

        // this.props.getContactsForOutbreakId(this.props.user.activeOutbreakId, filter, this.props.user.token);

        this.props.addFilterForScreen('FollowUpsFilterScreen', filter);

        this.props.navigator.dismissModal(this.props.onApplyFilters(filter));
    }
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    }
});

function mapStateToProps(state) {
    return {
        user: state.user,
        screenSize: state.app.screenSize,
        followUps: state.followUps
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        getContactsForOutbreakId,
        addFilterForScreen,
        removeFilterForScreen
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(FollowUpsFilterScreen);