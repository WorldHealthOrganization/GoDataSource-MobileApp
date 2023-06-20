import React, {Component} from 'react';
import {Animated, Platform, StyleSheet, View} from 'react-native';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {PagerScroll, TabBar, TabView} from 'react-native-tab-view';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import NavBarCustom from './../components/NavBarCustom';
import {extractIdFromPouchId, getTranslation} from './../utils/functions';
import config from './../utils/config';
import {addFilterForScreen, removeFilterForScreen} from './../actions/app';
import FiltersContainer from './../containers/FiltersContainer';
import SortContainer from './../containers/SortContainer';
import translations from './../utils/translations';
import {Navigation} from "react-native-navigation";
import throttle from 'lodash/throttle';
import styles from './../styles';

class FilterScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            filter: {
                filter: {
                    gender: {
                        [translations.localTranslationTokens.male]: false,
                        [translations.localTranslationTokens.female]: false
                    },
                    age: null,
                    selectedLocations: [],
                    selectedIndexDay: null,
                    classification: [],
                    categories: [],
                    vaccines: [],
                    vaccineStatuses: [],
                    pregnancyStatuses: [],
                    type: {
                        [translations.personTypes.cases]: false,
                        [translations.personTypes.contacts]: false
                    }
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
        const { sortOrderDropDownItems, sortCriteriaDropDownItems, eventSortCriteriaDropDownItems, helpItemsSortCriteriaDropDownItems } = config;
        const { followUpsFilterScreen,personFilterScreen, contactFilterScreen, casesFilterScreen, helpFilterScreen, labResultsFilterScreen, eventsFilterScreen, labResultsFilterScreenNoContactPermission } = config;

        let filterClone = cloneDeep(filter.filter);
        let sortClone = cloneDeep(filter.sort);
        let screenTitle = '';
        let routes = null;
        let configFilterScreen = null;
        let mySortCriteriaDropDownItems = [];
        let mySortOrderDropDownItems = sortOrderDropDownItems;

        if (activeFilters !== undefined && activeFilters !== null) {
            if (activeFilters.gender) {
                if (activeFilters.gender === localTranslationTokens.male && filterClone.gender[localTranslationTokens.male] === false) {
                    filterClone.gender[localTranslationTokens.male] = true
                    filterClone.gender[localTranslationTokens.female] = false
                } else if (activeFilters.gender === localTranslationTokens.female && filterClone.gender[localTranslationTokens.female] === false) {
                    filterClone.gender[localTranslationTokens.female] = true
                    filterClone.gender[localTranslationTokens.male] = false
                } else if(activeFilters.gender.$in) {
                    filterClone.gender[localTranslationTokens.female] = true
                    filterClone.gender[localTranslationTokens.male] = true
                }
            }

            if (activeFilters.type){
                Object.keys(filterClone.type).forEach(key=>{
                    if(!activeFilters.type.includes(key)){
                        filterClone.type[key] = false;
                    } else {
                        filterClone.type[key] = true;
                    }
                })
            }

            if (activeFilters.age && Array.isArray(activeFilters.age) && activeFilters.age.length === 2) {
                filterClone.age = [activeFilters.age[0], activeFilters.age[1]]
            }

            if (activeFilters.selectedIndexDay && activeFilters.selectedIndexDay !== '') {
                filterClone.selectedIndexDay = [activeFilters.selectedIndexDay[0], activeFilters.selectedIndexDay[1]]
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
            if (activeFilters.vaccines && Array.isArray(activeFilters.vaccines)) {
                filterClone.vaccines = activeFilters.vaccines;
            }
            if (activeFilters.vaccineStatuses && Array.isArray(activeFilters.vaccineStatuses)) {
                filterClone.vaccineStatuses = activeFilters.vaccineStatuses;
            }
            if (activeFilters.pregnancyStatuses && Array.isArray(activeFilters.pregnancyStatuses)) {
                filterClone.pregnancyStatuses = activeFilters.pregnancyStatuses;
            }

            if (activeFilters.sort && activeFilters.sort !== undefined && Array.isArray(activeFilters.sort) && activeFilters.sort.length > 0) {
                sortClone = activeFilters.sort
            }
        }

        switch (screen) {
            case 'ContactsScreen':
                screenTitle = getTranslation(translations.followUpFilter.contactFilterTitle, translation);
                routes = tabsValuesRoutes.personFilter;
                configFilterScreen = contactFilterScreen;
                mySortCriteriaDropDownItems = sortCriteriaDropDownItems;
                break;
            case 'ContactsOfContactsScreen':
                screenTitle = getTranslation(translations.followUpFilter.contactFilterTitle, translation);
                routes = tabsValuesRoutes.personFilter;
                configFilterScreen = personFilterScreen;
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
            case 'EventsScreen':
                screenTitle = getTranslation(translations.eventsFilter.eventsFilterTitle, translation);
                routes = tabsValuesRoutes.eventsFilter;
                configFilterScreen = eventsFilterScreen;
                mySortCriteriaDropDownItems = eventSortCriteriaDropDownItems;
                break;
            case 'HelpFilterScreen':
                screenTitle = getTranslation(translations.helpFilter.helpFilterTitle, translation);
                routes = tabsValuesRoutes.helpFilter;
                configFilterScreen = helpFilterScreen;
                mySortCriteriaDropDownItems = helpItemsSortCriteriaDropDownItems;
                break;
            case 'LabResultsScreen':
                screenTitle = getTranslation(translations.labResultsFilter.filterTitle, translation);
                routes = this.props.outbreak?.isContactLabResultsActive ? tabsValuesRoutes.labResultsFilter : tabsValuesRoutes.labResultsFilterNoFilter;
                configFilterScreen = this.props.outbreak?.isContactLabResultsActive ? labResultsFilterScreen : labResultsFilterScreenNoContactPermission;
                mySortCriteriaDropDownItems = sortCriteriaDropDownItems;
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
        const { componentId } = this.props;

        return (
            <View style={style.container}>
                <NavBarCustom
                    title={screenTitle}
                    componentId={componentId}
                    iconName="close"
                    handlePressNavbarButton={this.handlePressNavbarButton}
                />
                <TabView
                    swipeEnabled={false}
                    animationEnabled={Platform.OS === 'ios'}
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
                            onChangeText={this.handleOnChangeText}

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
                    backgroundColor: styles.primaryColor,
                    height: 2
                }}
                style={{
                    height: 36,
                    backgroundColor: styles.backgroundColor
                }}
                tabStyle={{
                    paddingHorizontal: 16,
                    marginHorizontal: 0,
                    textAlign: 'center'
                }}
                activeColor={styles.primaryColor}
                inactiveColor={styles.secondaryColor}
                renderLabel={this.handleRenderLabel(props)}
            />
        )
    };

    handleRenderLabel = (props) => ({ route, focused }) => {
        const { translation } = this.props;

        if (props.navigationState.routes !== null) {

            return (
                <Animated.Text style={{
                    fontFamily: 'Roboto-Medium',
                    fontSize: 12,
                    color: styles.textColor,
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
        Navigation.dismissModal(this.props.componentId);
    };

    handleResetFilters = async () => {
        const { componentId, screen, onApplyFilters, removeFilterForScreen } = this.props;

        removeFilterForScreen(screen);
        await Navigation.dismissModal(componentId);
        onApplyFilters(null);
    };

    handleOnIndexChange = throttle((index) => {
        this.setState({ index });
    }, 300);

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

    handleOnPressApplyFilters = async () => {
        const { filter } = this.state;
        const { localTranslationTokens } = config;
        const { addFilterForScreen, screen, componentId, onApplyFilters } = this.props;

        let filterStateClone = Object.assign({}, filter.filter);
        let filterSortClone = filter.sort.slice()
        let filterClone = {};

        console.log("Important cases filter state clone", filterStateClone);
        if (filterStateClone.gender[localTranslationTokens.male] && !filterStateClone.gender[localTranslationTokens.female]) {
            filterClone.gender = localTranslationTokens.male
        }
        if (filterStateClone.gender[localTranslationTokens.female] && !filterStateClone.gender[localTranslationTokens.male]) {
            filterClone.gender = localTranslationTokens.female
        }
        if (filterStateClone.gender[localTranslationTokens.female] && filterStateClone.gender[localTranslationTokens.male]){
            filterClone.gender = {
                $in: [localTranslationTokens.male, localTranslationTokens.female]
            };
        }
        filterClone.type = []
        Object.keys(filterStateClone.type).forEach(k=>{
            if(filterStateClone.type[k]){
                filterClone.type.push(k);
            }
        });
        if (filterStateClone.age) {
            filterClone.age = filterStateClone.age;
        }
        if (filterStateClone.selectedLocations) {
            filterClone.selectedLocations = filterStateClone.selectedLocations;
        }
        if (filterStateClone.selectedIndexDay) {
            filterClone.selectedIndexDay = filterStateClone.selectedIndexDay;
        }
        if (filterStateClone.classification) {
            filterClone.classification = filterStateClone.classification;
        }
        if (filterStateClone.categories) {
            filterClone.categories = filterStateClone.categories;
        }
        if (filterStateClone.vaccines) {
            filterClone.vaccines = filterStateClone.vaccines;
        }
        if (filterStateClone.vaccineStatuses) {
            filterClone.vaccineStatuses = filterStateClone.vaccineStatuses;
        }
        if (filterStateClone.pregnancyStatuses) {
            filterClone.pregnancyStatuses = filterStateClone.pregnancyStatuses;
        }

        if (filterSortClone && filterSortClone.length > 0) {
            filterClone.sort = filterSortClone;
        }

        addFilterForScreen(screen, filterClone);
        await Navigation.dismissModal(componentId);
        onApplyFilters(filterClone)
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
        console.log("HUUUH?", filter);
        filter[id][item.value] = !item.selected;
        console.log("Filter?", filter);
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

    handleOnChangeText = (text, id) => {
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, { filter: Object.assign({}, prevState.filter.filter, { [id]: text }) })
        }))
    }

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
        backgroundColor: styles.backgroundColor,
        flex: 1
    }
});

function mapStateToProps(state) {
    return {
        screenSize: get(state, 'app.screenSize', config.designScreenSize),
        translation: get(state, 'app.translation', []),
        outbreak: get(state, 'outbreak', null)
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        addFilterForScreen,
        removeFilterForScreen
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(FilterScreen);