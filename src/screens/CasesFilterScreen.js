/**
 * Created by mobileclarisoft on 13/08/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {View, Text, StyleSheet, Platform, Animated} from 'react-native';
import {Button} from 'react-native-material-ui';
import styles from './../styles';
import NavBarCustom from './../components/NavBarCustom';
import {extractIdFromPouchId} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {addFilterForScreen, removeFilterForScreen} from './../actions/app';
import {TabBar, TabView, PagerScroll} from 'react-native-tab-view';
import CasesFiltersContainer from './../containers/CasesFiltersContainer';
import CasesSortContainer from './../containers/CasesSortContainer';

class CasesFilterScreen extends Component {

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
                    age: [0, 150],
                    selectedLocations: [],
                    classification: []
                },
                sort: []
            },
            routes: config.tabsValuesRoutes.casesFilter,
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
            if (props.activeFilters.classification && Array.isArray(props.activeFilters.classification)){
                filterClone.classification = props.activeFilters.classification;
            }
            if (props.activeFilters.selectedLocations && Array.isArray(props.activeFilters.selectedLocations)){
                filterClone.selectedLocations = props.activeFilters.selectedLocations;
            }
            console.log("### Active filters: ", filterClone);
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
                    title="Cases filters"
                    navigator={this.props.navigator}
                    iconName="close"
                    handlePressNavbarButton={this.handlePressNavbarButton}
                />
                <TabView
                    swipeEnabled = {false}
                    navigationState={this.state}
                    renderPager={this.handleRenderPager}
                    renderScene={this.handleRenderScene}
                    renderTabBar={this.handleRenderTabBar}
                    onIndexChange={this.handleOnIndexChange}
                />
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handlePressNavbarButton = () => {
        this.props.removeFilterForScreen('CasesFilterScreen');
        this.props.navigator.dismissModal(this.props.onApplyFilters(config.defaultFilterForCases));
    };

    handleOnIndexChange = (index) => {
        this.setState({index});
    };

    handleMoveToNextScreenButton = () => {
        let nextIndex = this.state.index + 1
        this.handleOnIndexChange(nextIndex)
    }

    handleMoveToPrevieousScreenButton = () => {
        let nextIndex = this.state.index - 1
        this.handleOnIndexChange(nextIndex)
    }

    handleRenderScene = () => {
        if (this.state.index === 0) {
            return (
                <CasesFiltersContainer
                    filter={this.state.filter}
                    handleMoveToNextScreenButton={this.handleMoveToNextScreenButton}
                    onSelectItem={this.handleOnSelectItem}
                    onChangeSectionedDropDown={this.handleOnChangeSectionedDropDown}
                    onChangeInterval={this.handleOnChangeInterval}
                    onChangeMultipleSelection={this.handleOnChangeMultipleSelection}
                    onPressApplyFilters={this.handleOnPressApplyFilters}
                />
            )
        } else {
            return (
                <CasesSortContainer
                    handleMoveToPrevieousScreenButton={this.handleMoveToPrevieousScreenButton}
                    filter={this.state.filter}
                    key={this.state.index}
                />
            )
        }
    };

    handleRenderPager = (props) => {
        return (Platform.OS === 'ios') ? <PagerScroll {...props} swipeEnabled={false} animationEnabled={false} /> :
            <PagerScroll {...props} swipeEnabled={false} animationEnabled={false} />
    };

    handleRenderTabBar = (props) => {
        return (
            <TabBar
                {...props}
                scrollEnabled={false}
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

    handleOnSelectItem = (item, index, id) => {
        console.log("### handleOnSelectItem: ", item, index, id);
        let filter = Object.assign({}, this.state.filter.filter);
        filter[id][item.value] = !filter[id][item.value];
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, Object.assign({}, prevState.filter.filter, {[id]: filter[id]}))
        }))
    };

    handleOnChangeSectionedDropDown = (selectedItems) => {
        let selectedItemsWithExtractedId = selectedItems.map ((e) => {
            return extractIdFromPouchId (e, 'location')
        })

        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, {filter: Object.assign({}, prevState.filter.filter, {selectedLocations: selectedItemsWithExtractedId})})
        }), () => {
            console.log("Filters: ", this.state.filter.filter);
        })
    };

    handleOnChangeInterval = (values, id) => {
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, {filter: Object.assign({}, prevState.filter.filter, {[id]: values})})
        }));
    };

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

        if (filterStateClone.gender.Male && !filterStateClone.gender.Female ) {
            filter.gender = config.localTranslationTokens.male
        }
        if (filterStateClone.gender.Female && !filterStateClone.gender.Male) {
            filter.gender = config.localTranslationTokens.female
        }
        if (filterStateClone.age) {
            filter.age = filterStateClone.age;
        }
        if (filterStateClone.classification) {
            if (filterStateClone.classification.length > 0) {
                let orClassification = [];
                filterStateClone.classification.map((item, index) => {
                    orClassification.push({classification: item.value ? item.value : null});
                });
                filter.classification = orClassification;
            }
        }
        if (filterStateClone.selectedLocations) {
            filter.selectedLocations = filterStateClone.selectedLocations;
        }

        this.props.addFilterForScreen('CasesFilterScreen', filter);
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
        cases: state.cases
    };
};

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        addFilterForScreen,
        removeFilterForScreen
    }, dispatch);
};

export default connect(mapStateToProps, matchDispatchProps)(CasesFilterScreen);