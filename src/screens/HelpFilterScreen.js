/**
 * Created by mobileclarisoft on 12/12/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {View, Text, StyleSheet, Platform, Animated} from 'react-native';
import {Button} from 'react-native-material-ui';
import styles from './../styles';
import NavBarCustom from './../components/NavBarCustom';
import {extractIdFromPouchId, getTranslation} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {getContactsForOutbreakId} from './../actions/contacts';
import {addFilterForScreen, removeFilterForScreen} from './../actions/app';
import {TabBar, TabView} from 'react-native-tab-view';
import HelpFilterContainer from './../containers/HelpFilterContainer';
import HelpSortContainer from './../containers/HelpSortContainer';
import FollowUpsSortContainer from './../containers/FollowUpsSortContainer';
import translations from './../utils/translations';
import _ from 'lodash';

class HelpFilterScreen extends Component {

    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
            filter: {
                filter: {
                    categories: []
                },
                sort: []
            },
            routes: config.tabsValuesRoutes.helpFilter,
            index: 0,
        };
        // Bind here methods, or at least don't declare methods in the render method
    }

    // Please add here the react lifecycle methods that you need
    static getDerivedStateFromProps(props, state) {
        let filterClone = Object.assign({}, state.filter.filter);
        if (props && props.activeFilters) {
            if (props.activeFilters.categories && Array.isArray(props.activeFilters.categories)){
                filterClone.categories = props.activeFilters.categories;
            }
            console.log("### Active filters: ", filterClone);
        }
        state.filter.filter = filterClone
        return null
    };

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <View style={style.container}>
                <NavBarCustom
                    title={getTranslation(translations.helpFilter.helpFilterTitle, this.props.translation)}
                    navigator={this.props.navigator}
                    iconName="close"
                    handlePressNavbarButton={this.handlePressNavbarButton}
                />
                <TabView
                    navigationState={this.state}
                    renderScene={this.handleRenderScene}
                    renderTabBar={this.handleRenderTabBar}
                    onIndexChange={this.handleOnIndexChange}
                />
            </View>
        );
    }

    handleOnIndexChange = (index) => {
        this.setState({index});
    };

    handleRenderScene = () => {
        if (this.state.index === 0) {
            return (
                <HelpFilterContainer
                    filter={this.state.filter}
                    onChangeMultipleSelection={this.handleOnChangeMultipleSelection}
                    onPressApplyFilters={this.handleOnPressApplyFilters}
                />
            );
        } else {
            return (
                <HelpSortContainer
                    filter={this.state.filter}
                    onPressApplyFilters={this.handleOnPressApplyFilters}
                    onPressAddSortRule={this.onPressAddSortRule}
                    onChangeDropDown={this.onChangeDropDown}
                    onDeletePress={this.onDeleteSortRulePress}
                />
            );
        }
    };

    onPressAddSortRule = () => {
        let sort = [];
        if (this.state && this.state.filter && this.state.filter.sort) {
            sort = _.cloneDeep(this.state.filter.sort);
        }
        sort.push({
            sortCriteria: '',
            sortOrder: '',
        });
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, {sort}),
        }), () => {
            console.log("### after adding sort rule: ", this.state.filter);
        })
    };

    onDeleteSortRulePress = (index) => {
        console.log("onDeleteSortRulePress: ", index);
        let filterSortClone = _.cloneDeep(this.state.filter.sort);
        filterSortClone.splice(index, 1);
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, {sort: filterSortClone}),
        }), () => {
            console.log("After onDeleteSortRulePress ", this.state.sort);
        })
    };

    onChangeDropDown = (value, id, objectTypeOrIndex, objectType) => {
        console.log("sort onChangeDropDown: ", value, id, objectTypeOrIndex, this.state.filter);
        if (typeof objectTypeOrIndex === 'number' && objectTypeOrIndex >= 0) {
            if (objectType === 'Sort') {
                let sortClone = _.cloneDeep(this.state.filter.sort);
                sortClone[objectTypeOrIndex][id] = value && value.value ? value.value : value;
                console.log ('sortClone', sortClone)
                this.setState(prevState => ({
                    filter: Object.assign({}, prevState.filter, {sort: sortClone}),
                }), () => {
                    console.log("onChangeDropDown", id, " ", value, " ", this.state.filter);
                })
            }
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
    }

    // Please write here all the methods that are not react native lifecycle methods
    handlePressNavbarButton = () => {
        this.props.removeFilterForScreen(this.props.screen);
        this.props.navigator.dismissModal(this.props.onApplyFilters(null));
    };

    handleOnChangeMultipleSelection = (selections, id) => {
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, {filter: Object.assign({}, prevState.filter.filter, {[id]: selections})})
        }), () => {
            console.log("### handleOnChangeMultipleSelection: ", this.state.filter.filter);
        })
    };

    handleOnPressApplyFilters = () => {
        let filterStateClone = Object.assign({}, this.state.filter.filter);
        let filterSortClone = this.state.filter.sort.slice()

        let filter = {};

        if (filterStateClone.categories) {
            filter.categories = filterStateClone.categories;
        }

        if (filterSortClone && filterSortClone.length > 0){
            filter.sort = filterSortClone;
        }

        this.props.addFilterForScreen(this.props.screen, filter);
        this.props.navigator.dismissModal(this.props.onApplyFilters(filter));
    };
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
        helpCategory: state.helpCategory,
        translation: state.app.translation
    };
};

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        getContactsForOutbreakId,
        addFilterForScreen,
        removeFilterForScreen
    }, dispatch);
};

export default connect(mapStateToProps, matchDispatchProps)(HelpFilterScreen);