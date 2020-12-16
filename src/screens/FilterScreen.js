import React, {Component} from 'react';
import {Animated, Platform, StyleSheet, View} from 'react-native';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {PagerScroll, TabBar, TabView} from 'react-native-tab-view';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import styles from './../styles';
import NavBarCustom from './../components/NavBarCustom';
import {extractIdFromPouchId, getTranslation} from './../utils/functions';
import config from './../utils/config';
import {addFilterForScreen, removeFilterForScreen} from './../actions/app';
import FiltersContainer from './../containers/FiltersContainer';
import SortContainer from './../containers/SortContainer';
import translations from './../utils/translations';

class FilterScreen extends Component {
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
                    classification: [],
                    categories: []
                },
                sort: []
            },
            index: 0,

            routes: config.tabsValuesRoutes.followUpsFilter,
            screenTitle: '',
            configFilterScreen: null,
            sortCriteriaDropDownItems: [],
            sortOrderDropDownItems: [],

        };
    }

    componentDidMount() {
        const { filter } = this.state;
        const { activeFilters, translation, screen } = this.props;

        const { tabsValuesRoutes, localTranslationTokens } = config;
        const { sortOrderDropDownItems, sortCriteriaDropDownItems, helpItemsSortCriteriaDropDownItems } = config;
        const { followUpsFilterScreen, casesFilterScreen, helpFilterScreen } = config;

        let filterClone = cloneDeep(filter.filter);
        let sortClone = cloneDeep(filter.sort);
        let screenTitle = '';
        let routes = null;
        let configFilterScreen = null;
        let mySortCriteriaDropDownItems = [];
        let mySortOrderDropDownItems = sortOrderDropDownItems;

        if (activeFilters !== undefined && activeFilters !== null) {
            if (activeFilters.gender) {
                if (activeFilters.gender === localTranslationTokens.male && filterClone.gender.Male === false) {
                    filterClone.gender.Male = true
                    filterClone.gender.Female = false
                } else if (activeFilters.gender === localTranslationTokens.female && filterClone.gender.Female === false) {
                    filterClone.gender.Female = true
                    filterClone.gender.Male = false
                }
            }

            if (activeFilters.age && Array.isArray(activeFilters.age) && activeFilters.age.length === 2) {
                filterClone.age[0] = activeFilters.age[0];
                filterClone.age[1] = activeFilters.age[1];
            }

            if (activeFilters.selectedLocations && Array.isArray(activeFilters.selectedLocations) && activeFilters.selectedLocations.length > 0) {
                filterClone.selectedLocations = activeFilters.selectedLocations;
            }

            if (activeFilters.classification && Array.isArray(activeFilters.classification) && activeFilters.classification.length > 0) {
                filterClone.classification = activeFilters.classification;
            }

            if (activeFilters.categories && Array.isArray(activeFilters.categories)) {
                filterClone.categories = activeFilters.categories;
            }

            if (activeFilters.sort && activeFilters.sort !== undefined && Array.isArray(activeFilters.sort) && activeFilters.sort.length > 0) {
                sortClone = activeFilters.sort
            }
        }

        switch (screen) {
            case 'ContactsScreen':
                screenTitle = getTranslation(translations.followUpFilter.contactFilterTitle, translation);
                routes = tabsValuesRoutes.followUpsFilter;
                configFilterScreen = followUpsFilterScreen;
                mySortCriteriaDropDownItems = sortCriteriaDropDownItems;
                break;
            case 'FollowUpsScreen':
                screenTitle = getTranslation(translations.followUpFilter.followUpsFilterTitle, translation);
                routes = tabsValuesRoutes.followUpsFilter;
                configFilterScreen = followUpsFilterScreen;
                mySortCriteriaDropDownItems = sortCriteriaDropDownItems;
                break;
            case 'CasesScreen':
                screenTitle = getTranslation(translations.casesFilter.casesFilterTitle, translation);
                routes = tabsValuesRoutes.casesFilter;
                configFilterScreen = casesFilterScreen;
                mySortCriteriaDropDownItems = sortCriteriaDropDownItems;
                break;
            case 'HelpFilterScreen':
                screenTitle = getTranslation(translations.helpFilter.helpFilterTitle, translation);
                routes = tabsValuesRoutes.helpFilter;
                configFilterScreen = helpFilterScreen;
                mySortCriteriaDropDownItems = helpItemsSortCriteriaDropDownItems;
                break;
            default:
                screenTitle = getTranslation(translations.followUpFilter.contactFilterTitle, translation);
                routes = tabsValuesRoutes.followUpsFilter;
                configFilterScreen = followUpsFilterScreen;
                mySortCriteriaDropDownItems = sortCriteriaDropDownItems;
                break;
        }

        const globalFilter = {
            filter: filterClone,
            sort: sortClone
        }

        this.setState({
            filter: globalFilter,
            screenTitle,
            routes,
            configFilterScreen,
            sortCriteriaDropDownItems: mySortCriteriaDropDownItems,
            sortOrderDropDownItems: mySortOrderDropDownItems
        })
    };

    render() {
        const { screenTitle } = this.state;
        const { navigator } = this.props;

        return (
            <View style={style.container}>
                <NavBarCustom
                    title={screenTitle}
                    navigator={navigator}
                    iconName="close"
                    handlePressNavbarButton={this.handlePressNavbarButton}
                />
                <TabView
                    swipeEnabled={false}
                    navigationState={this.state}
                    renderScene={this.handleRenderScene}
                    renderPager={this.handleRenderPager}
                    renderTabBar={this.handleRenderTabBar}
                    onIndexChange={this.handleOnIndexChange}
                />
            </View>
        );
    };


    // Render stuff
    handleRenderPager = (props) => {
        return (Platform.OS === 'ios') ? <PagerScroll {...props} swipeEnabled={false} animationEnabled={false} /> :
            <PagerScroll {...props} swipeEnabled={false} animationEnabled={false} />
    };

    handleRenderScene = ({ route }) => {
        const { configFilterScreen, filter, index, sortCriteriaDropDownItems, sortOrderDropDownItems } = this.state;

        if (configFilterScreen !== null) {
            switch (route.key) {
                case 'filters':
                    return (
                        <FiltersContainer
                            filter={filter}
                            configFilterScreen={configFilterScreen}
                            key={index}

                            handleMoveToNextScreenButton={this.handleMoveToNextScreenButton}
                            onPressApplyFilters={this.handleOnPressApplyFilters}
                            onPressResetFilters={this.handleResetFilters}

                            onSelectItem={this.handleOnSelectItem}
                            onChangeSectionedDropDown={this.handleOnChangeSectionedDropDown}
                            onChangeInterval={this.handleOnChangeInterval}
                            onChangeMultipleSelection={this.handleOnChangeMultipleSelection}

                        />
                    );
                case 'sort':
                    return (
                        <SortContainer
                            filter={filter}
                            configFilterScreen={configFilterScreen}
                            key={index}
                            sortCriteriaDropDownItems={sortCriteriaDropDownItems}
                            sortOrderDropDownItems={sortOrderDropDownItems}

                            handleMoveToPrevieousScreenButton={this.handleMoveToPrevieousScreenButton}
                            onPressApplyFilters={this.handleOnPressApplyFilters}
                            onPressResetFilters={this.handleResetFilters}

                            onPressAddSortRule={this.onPressAddSortRule}
                            onChangeDropDown={this.onChangeDropDown}
                            onDeletePress={this.onDeleteSortRulePress}
                        />
                    );
                default:
                    return null;
            }
        } else {
            return null;
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

    handleRenderLabel = (props) => ({ route, index }) => {
        const { translation } = this.props;

        if (props.navigationState.routes !== null) {
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
                    {getTranslation(route.title, translation).toUpperCase()}
                </Animated.Text>
            );
        } else {
            return null
        }
    };


    // Buttons action
    handlePressNavbarButton = () => {
        const { navigator } = this.props;
        navigator.dismissModal();
    };

    handleResetFilters = () => {
        const { navigator, screen, onApplyFilters, removeFilterForScreen } = this.props;

        removeFilterForScreen(screen);
        navigator.dismissModal(onApplyFilters(null));
    };

    handleOnIndexChange = (index) => {
        this.setState({ index });
    };

    handleMoveToNextScreenButton = () => {
        const { index } = this.state;
        let nextIndex = index + 1;
        this.handleOnIndexChange(nextIndex)
    };

    handleMoveToPrevieousScreenButton = () => {
        const { index } = this.state;
        let nextIndex = index - 1;
        this.handleOnIndexChange(nextIndex)
    };

    handleOnPressApplyFilters = () => {
        const { filter } = this.state;
        const { localTranslationTokens } = config;
        const { addFilterForScreen, screen, navigator, onApplyFilters } = this.props;

        let filterStateClone = Object.assign({}, filter.filter);
        let filterSortClone = filter.sort.slice()
        let filterClone = {};

        if (filterStateClone.gender.Male && !filterStateClone.gender.Female) {
            filterClone.gender = localTranslationTokens.male
        }
        if (filterStateClone.gender.Female && !filterStateClone.gender.Male) {
            filterClone.gender = localTranslationTokens.female
        }
        if (filterStateClone.age) {
            filterClone.age = filterStateClone.age;
        }
        if (filterStateClone.selectedLocations) {
            filterClone.selectedLocations = filterStateClone.selectedLocations;
        }
        if (filterStateClone.classification) {
            if (filterStateClone.classification.length > 0) {
                filterClone.classification = filterStateClone.classification.map((e) => get(e, 'value', null));
            }
        }
        if (filterStateClone.categories) {
            filterClone.categories = filterStateClone.categories;
        }
        if (filterSortClone && filterSortClone.length > 0) {
            filterClone.sort = filterSortClone;
        }

        addFilterForScreen(screen, filterClone);
        navigator.dismissModal(onApplyFilters(filterClone));
    };


    // Sort
    onPressAddSortRule = () => {
        const { filter } = this.state;
        let sort = [];

        if (filter && filter.sort) {
            sort = cloneDeep(filter.sort);
        }

        sort.push({
            sortCriteria: '',
            sortOrder: '',
        });

        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, { sort }),
        }), () => {
            console.log("### after adding sort rule: ", this.state.filter);
        })
    };

    onDeleteSortRulePress = (index) => {
        let filterSortClone = cloneDeep(this.state.filter.sort);
        filterSortClone.splice(index, 1);
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, { sort: filterSortClone }),
        }), () => {
            console.log("After onDeleteSortRulePress ", this.state.sort);
        })
    };


    // Change fields
    onChangeDropDown = (value, id, objectTypeOrIndex, objectType) => {
        console.log("sort onChangeDropDown: ", value, id, objectTypeOrIndex, this.state.filter);
        if (typeof objectTypeOrIndex === 'number' && objectTypeOrIndex >= 0) {
            if (objectType === 'Sort') {
                let sortClone = cloneDeep(this.state.filter.sort);
                sortClone[objectTypeOrIndex][id] = value && value.value !== undefined ? value.value : value;
                console.log('sortClone', sortClone)
                this.setState(prevState => ({
                    filter: Object.assign({}, prevState.filter, { sort: sortClone }),
                }), () => {
                    console.log("onChangeDropDown", id, " ", value, " ", this.state.filter);
                })
            }
        }
    };

    handleOnSelectItem = (item, index, id) => {
        console.log("### handleOnSelectItem: ", item, index, id);
        let filter = Object.assign({}, this.state.filter.filter);
        filter[id][item.value] = !filter[id][item.value];
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, Object.assign({}, prevState.filter.filter, { [id]: filter[id] }))
        }))
    };

    handleOnChangeSectionedDropDown = (selectedItems) => {
        let selectedItemsWithExtractedId = selectedItems.map((e) => {
            return extractIdFromPouchId(e._id, 'location')
        })

        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, { filter: Object.assign({}, prevState.filter.filter, { selectedLocations: selectedItemsWithExtractedId }) })
        }), () => {
            console.log("Filters: ", this.state.filter.filter);
        })
    };

    handleOnChangeInterval = (values, id) => {
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, { filter: Object.assign({}, prevState.filter.filter, { [id]: values }) })
        }));
    };

    handleOnChangeMultipleSelection = (selections, id) => {
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, { filter: Object.assign({}, prevState.filter.filter, { [id]: selections }) })
        }), () => {
            console.log("### selections: ", this.state.filter.filter);
        })
    };
}

const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    }
});

function mapStateToProps(state) {
    return {
        screenSize: get(state, 'app.screenSize', config.designScreenSize),
        translation: get(state, 'app.translation', [])
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        addFilterForScreen,
        removeFilterForScreen
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(FilterScreen);