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
import {calculateDimension} from './../utils/functions';
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
                    age: [0, 100],
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
        if (props && props.activeFilters && props.activeFilters.where && props.activeFilters.where.and && Array.isArray(props.activeFilters.where.and)) {
            for(let i=0; i<props.activeFilters.where.and.length; i++) {
                if (props.activeFilters.where.and[i].gender) {
                    filterClone.gender[props.activeFilters.where.and[i].gender] = true;
                }
                if (props.activeFilters.where.and[i].age && props.activeFilters.where.and[i].age.gte) {
                    filterClone.age[0] = props.activeFilters.where.and[i].age.gte;
                }
                if (props.activeFilters.where.and[i].age && props.activeFilters.where.and[i].age.lte) {
                    filterClone.age[1] = props.activeFilters.where.and[i].age.lte;
                }
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
                    navigationState={this.state}
                    onIndexChange={this.handleOnIndexChange}
                    renderPager={this.handleRenderPager}
                    renderScene={this.handleRenderScene}
                    renderTabBar={this.handleRenderTabBar}
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

    handleRenderScene = () => {
        if (this.state.index === 0) {
            return (
                <CasesFiltersContainer
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
                <CasesSortContainer
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
        let filter = Object.assign({}, config.defaultFilterForCases);

        filter.where = {};

        filter.where.and = [];

        if(filterStateClone.gender.Female && filterStateClone.gender.Male){
            let orGender = [{gender: 'Male'},{gender: 'Female'}];
            filter.where.and.push({or: orGender});
        }else {
            if (filterStateClone.gender.Male) {
                filter.where.and.push({gender: 'Male'})
            }
            if (filterStateClone.gender.Female) {
                filter.where.and.push({gender: 'Female'})
            }
        }

        if (filterStateClone.age) {
            filter.where.and.push({age: {gte: filterStateClone.age[0]}});
            filter.where.and.push({age: {lte: filterStateClone.age[1]}});
        }

        if(filterStateClone.classification){
            if(filterStateClone.classification.length > 0){
                if(filterStateClone.classification.length == 1){
                    filter.where.and.push({classification: filterStateClone.classification[0].value});
                }else {
                    let orClassification = [];
                    filterStateClone.classification.map((item, index) => {
                        orClassification.push({classification: item.value});
                    });
                    filter.where.and.push({or: orClassification});
                }
            }
        }

        this.props.addFilterForScreen('CasesFilterScreen', filter);

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
        cases: state.cases
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        addFilterForScreen,
        removeFilterForScreen
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(CasesFilterScreen);