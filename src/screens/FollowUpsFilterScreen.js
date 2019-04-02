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
import {extractIdFromPouchId, getTranslation} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {getContactsForOutbreakId} from './../actions/contacts';
import {addFilterForScreen, removeFilterForScreen} from './../actions/app';
import {TabBar, TabView, PagerScroll} from 'react-native-tab-view';
import FollowUpsFiltersContainer from './../containers/FollowUpsFiltersContainer';
import FollowUpsSortContainer from './../containers/FollowUpsSortContainer';
import translations from './../utils/translations';
import _ from 'lodash';

let callGetDerivedStateFromProps = true;

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
                    age: [0, 150],
                    selectedLocations: [],
                    exposure: []
                },
                sort: []
            },
            routes: config.tabsValuesRoutes.followUpsFilter,
            index: 0,
        };
        // Bind here methods, or at least don't declare methods in the render method
    }

    // Please add here the react lifecycle methods that you need
    static getDerivedStateFromProps(props, state) {
        if (callGetDerivedStateFromProps === true){
            console.log ('getDerivedStateFromProps - FollowUpsFilter')
            let filterClone = _.cloneDeep(state.filter.filter);
            let sortClone = _.cloneDeep(state.filter.sort);

            if (props && props.activeFilters) {
                if (props.activeFilters.gender) {
                    if (props.activeFilters.gender === config.localTranslationTokens.male && filterClone.gender.Male === false) {
                        filterClone.gender.Male = true
                        filterClone.gender.Female = false
                    } else if (props.activeFilters.gender === config.localTranslationTokens.female && filterClone.gender.Female === false) {
                        filterClone.gender.Female = true
                        filterClone.gender.Male = false
                    }
                }

                if (props.activeFilters.age && Array.isArray(props.activeFilters.age) && props.activeFilters.age.length === 2) {
                    filterClone.age[0] = props.activeFilters.age[0];
                    filterClone.age[1] = props.activeFilters.age[1];
                }

                if (props.activeFilters.selectedLocations && Array.isArray(props.activeFilters.selectedLocations) && props.activeFilters.selectedLocations.length > 0){
                    filterClone.selectedLocations = props.activeFilters.selectedLocations;
                }
            
                if (props.activeFilters.sort && props.activeFilters.sort !== undefined && Array.isArray(props.activeFilters.sort) && props.activeFilters.sort.length > 0){
                    sortClone = props.activeFilters.sort
                }
            }
            state.filter.filter = filterClone
            state.filter.sort = sortClone
        } else {
            callGetDerivedStateFromProps = true;
        }
        return null
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        
        return (
            <View style={style.container}>
                <NavBarCustom
                    title={this.props.screen === 'ContactsFilterScreen' ? getTranslation(translations.followUpFilter.contactFilterTitle, this.props.translation) : getTranslation(translations.followUpFilter.followUpsFilterTitle, this.props.translation)}
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


    handleRenderPager = (props) => {
        return (Platform.OS === 'ios') ? <PagerScroll {...props} swipeEnabled={false} animationEnabled={false} /> :
            <PagerScroll {...props} swipeEnabled={false} animationEnabled={false} />
    };

    // Please write here all the methods that are not react native lifecycle methods
    handlePressNavbarButton = () => {
        this.props.navigator.dismissModal();
    };

    handleResetFilters = () => {
        this.props.removeFilterForScreen(this.props.screen);
        this.props.navigator.dismissModal(this.props.onApplyFilters(null));
    };

    handleOnIndexChange = (index) => {
        callGetDerivedStateFromProps = false;
        this.setState({index});
    };

    handleMoveToNextScreenButton = () => {
        let nextIndex = this.state.index + 1;
        this.handleOnIndexChange(nextIndex)
    };

    handleMoveToPrevieousScreenButton = () => {
        let nextIndex = this.state.index - 1;
        this.handleOnIndexChange(nextIndex)
    };


    handleRenderScene = ({route}) => {
        switch (route.key) {
            case 'filters':
                return (
                    <FollowUpsFiltersContainer
                        filter={this.state.filter}
                        onSelectItem={this.handleOnSelectItem}
                        onPressResetFilters={this.handleResetFilters}
                        onChangeSectionedDropDown={this.handleOnChangeSectionedDropDown}
                        onChangeInterval={this.handleOnChangeInterval}
                        onChangeMultipleSelection={this.handleOnChangeMultipleSelection}
                        onPressApplyFilters={this.handleOnPressApplyFilters}
                        handleMoveToNextScreenButton={this.handleMoveToNextScreenButton}
                    />
                );
            case 'sort':
                return (
                    <FollowUpsSortContainer
                        handleMoveToPrevieousScreenButton={this.handleMoveToPrevieousScreenButton}
                        filter={this.state.filter}
                        onPressApplyFilters={this.handleOnPressApplyFilters}
                        onPressAddSortRule={this.onPressAddSortRule}
                        onChangeDropDown={this.onChangeDropDown}
                        onPressResetFilters={this.handleResetFilters}
                        onDeletePress={this.onDeleteSortRulePress}
                        key={this.state.index}
                    />
                );
            default:
                return (
                    <FollowUpsFiltersContainer
                        filter={this.state.filter}
                        onSelectItem={this.handleOnSelectItem}
                        onChangeSectionedDropDown={this.handleOnChangeSectionedDropDown}
                        onChangeInterval={this.handleOnChangeInterval}
                        onChangeMultipleSelection={this.handleOnChangeMultipleSelection}
                        onPressApplyFilters={this.handleOnPressApplyFilters}
                        handleMoveToNextScreenButton={this.handleMoveToNextScreenButton}
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

    onPressAddSortRule = () => {
        let sort = [];
        if (this.state && this.state.filter && this.state.filter.sort) {
            sort = _.cloneDeep(this.state.filter.sort);
        }
        sort.push({
            sortCriteria: '',
            sortOrder: '',
        });
        callGetDerivedStateFromProps = false;
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, {sort}),
        }), () => {
            console.log("### after adding sort rule: ", this.state.filter);
        })
    }

    onDeleteSortRulePress = (index) => {
        console.log("onDeleteSortRulePress: ", index);
        let filterSortClone = _.cloneDeep(this.state.filter.sort);
        filterSortClone.splice(index, 1);
        callGetDerivedStateFromProps = false;
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, {sort: filterSortClone}),
        }), () => {
            console.log("After onDeleteSortRulePress ", this.state.sort);
        })
    }

    onChangeDropDown = (value, id, objectTypeOrIndex, objectType) => {
        console.log("sort onChangeDropDown: ", value, id, objectTypeOrIndex, this.state.filter);
        if (typeof objectTypeOrIndex === 'number' && objectTypeOrIndex >= 0) {
            if (objectType === 'Sort') {
                let sortClone = _.cloneDeep(this.state.filter.sort);
                sortClone[objectTypeOrIndex][id] = value && value.value !== undefined ? value.value : value;
                console.log ('sortClone', sortClone)
                callGetDerivedStateFromProps = false;
                this.setState(prevState => ({
                    filter: Object.assign({}, prevState.filter, {sort: sortClone}),
                }), () => {
                    console.log("onChangeDropDown", id, " ", value, " ", this.state.filter);
                })
            }
        }
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

    handleOnSelectItem = (item, index, id) => {
        console.log("### handleOnSelectItem: ", item, index, id);
        let filter = Object.assign({}, this.state.filter.filter);
        filter[id][item.value] = !filter[id][item.value];
        callGetDerivedStateFromProps = false;
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, Object.assign({}, prevState.filter.filter, {[id]: filter[id]}))
        }))
    }

    handleOnChangeSectionedDropDown = (selectedItems) => {
        let selectedItemsWithExtractedId = selectedItems.map ((e) => {
            return extractIdFromPouchId (e._id, 'location')
        })
        callGetDerivedStateFromProps = false;
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, {filter: Object.assign({}, prevState.filter.filter, {selectedLocations: selectedItemsWithExtractedId})})
        }), () => {
            console.log("Filters: ", this.state.filter.filter);
        })
    };

    handleOnChangeInterval = (values, id) => {
        callGetDerivedStateFromProps = false;
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, {filter: Object.assign({}, prevState.filter.filter, {[id]: values})})
        }));
    }

    handleOnChangeMultipleSelection = (selections, id) => {
        callGetDerivedStateFromProps = false;
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, {filter: Object.assign({}, prevState.filter.filter, {[id]: selections})})
        }), () => {
            console.log("### selections: ", this.state.filter.filter);
        })
    };

    handleOnPressApplyFilters = () => {
        let filterStateClone = Object.assign({}, this.state.filter.filter);
        let filterSortClone = this.state.filter.sort.slice()
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
        if (filterStateClone.selectedLocations) {
            filter.selectedLocations = filterStateClone.selectedLocations;
        }
        if (filterSortClone && filterSortClone.length > 0){
            filter.sort = filterSortClone;
        }

        // this.props.getContactsForOutbreakId(this.props.user.activeOutbreakId, filter, this.props.user.token);
        this.props.addFilterForScreen(this.props.screen, filter);
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
        followUps: state.followUps,
        translation: state.app.translation
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