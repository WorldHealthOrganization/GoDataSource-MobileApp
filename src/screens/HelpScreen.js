/**
 * Created by mobileclarisoft on 11/12/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {View, Text, StyleSheet, Alert, Animated, BackHandler} from 'react-native';
import styles from './../styles';
import NavBarCustom from './../components/NavBarCustom';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import SearchFilterView from './../components/SearchFilterView';
import HelpListItem from './../components/HelpListItem';
import AnimatedListView from './../components/AnimatedListView';
import {removeErrors} from './../actions/errors';
import {addFilterForScreen, removeFilterForScreen} from './../actions/app';
import _ from 'lodash';
import {calculateDimension, navigation, getTranslation, localSortHelpItem, filterItemsForEachPage} from './../utils/functions';
import ViewHOC from './../components/ViewHOC';
import translations from './../utils/translations'

const scrollAnim = new Animated.Value(0);
const offsetAnim = new Animated.Value(0);

class HelpScreen extends Component {

    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
            filter: this.props.filter && this.props.filter['HelpScreen'] ? this.props.filter['HelpScreen'] : { searchText: '' },
            filterFromFilterScreen: this.props.filter && this.props.filter['HelpFilterScreen'] ? this.props.filter['HelpFilterScreen'] : null,
            helpItems: [],

            refreshing: false,
            loading: false,
            error: null,

            displayModalFormat: false,
            pageAskingHelpFrom: this.props.pageAskingHelpFrom && this.props.pageAskingHelpFrom !== undefined ? this.props.pageAskingHelpFrom : null,
            pageAskingHelpFromNameToDisplay: '',
        };

        // Bind here methods, or at least don't declare methods in the render method
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
        this.renderHelp = this.renderHelp.bind(this);
        this.keyExtractor = this.keyExtractor.bind(this);
        this.renderSeparatorComponent = this.renderSeparatorComponent.bind(this);
        this.listEmptyComponent = this.listEmptyComponent.bind(this);
        this.filterHelp = this.filterHelp.bind(this);
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }

    // Please add here the react lifecycle methods that you need
    static getDerivedStateFromProps(props, state) {
        if (props.errors && props.errors.type && props.errors.message) {
            Alert.alert(props.errors.type, props.errors.message, [
                {
                    text: getTranslation(translations.alertMessages.okButtonLabel, props.translation),
                    onPress: () => {
                        props.removeErrors();
                        state.loading = false;
                    }
                }
            ])
        }

        let helpItemClone = _.cloneDeep(props.helpItem);
        if (state.filter || state.filterFromFilterScreen) {
            helpItemClone = localSortHelpItem(helpItemClone, props.filter, state.filter, state.filterFromFilterScreen, props.translation)
        }

        if (state.pageAskingHelpFrom && state.pageAskingHelpFrom !== undefined) {
            helpItemClone = filterItemsForEachPage(helpItemClone, state.pageAskingHelpFrom)
        }

        if(helpItemClone){
            state.helpItems = helpItemClone;
        }
        return null;
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        
        this.props.removeFilterForScreen('HelpFilterScreen');

        console.log('componentDidMount HelpScreen', this.props.pageAskingHelpFrom)
        if (this.state.pageAskingHelpFrom && this.state.pageAskingHelpFrom !== undefined) {
            let itemsToSetInState = this.prepareFieldsForHelpFromPage()
            this.setState({
                filter: itemsToSetInState.filter,
                filterFromFilterScreen: null,
                displayModalFormat: true,
                pageAskingHelpFromNameToDisplay: itemsToSetInState.pageAskingHelpFromNameToDisplay,
            }, () => {
                console.log ('filter removed')
            })
        }
    };

    shouldComponentUpdate(nextProps, nextState) {
        if (!nextProps.helpItem) {
            return false;
        }

        return true;
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick() {
        return false;
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
        let helpTitle = []; helpTitle[1] = getTranslation(translations.helpScreen.helpTitle, this.props.translation);

        let filterNumbers = 0
        if (this.state.filterFromFilterScreen) {
            if (this.state.filterFromFilterScreen.categories && this.state.filterFromFilterScreen.categories.length > 0) {
                ++filterNumbers
            }
        }
        let filterText = filterNumbers === 0 ? `${getTranslation(translations.generalLabels.filterTitle, this.props.translation)}` : `${getTranslation(translations.generalLabels.filterTitle, this.props.translation)}(${filterNumbers})`;

        return (
            <ViewHOC style={style.container}
                     showLoader={(this.props && this.props.syncState && ((this.props.syncState.id === 'sync' && this.props.syncState.status !== null && this.props.syncState.status !== 'Success') && this.props.syncState.status !== 'Error')) || (this && this.state && this.state.loading)}
                     loaderText={this.props && this.props.syncState ? 'Loading' : getTranslation(translations.loadingScreenMessages.loadingMsg, this.props.translation)}>
                {
                    this.state.displayModalFormat === true ? (
                        <NavBarCustom customTitle={
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    height: '100%'
                                }}
                            >
                                <Text style={[style.title, {marginLeft: 30}]}>
                                    {`${helpTitle[1]} ${getTranslation(translations.helpScreen.itemsForMessage, this.props.translation)} ${this.state.pageAskingHelpFromNameToDisplay}`}
                                </Text>
                            </View>
                        }
                            title={null}
                            navigator={this.props.navigator}
                            iconName="close"
                            handlePressNavbarButton={this.handlePressNavbarButton}
                        />
                    ) : (
                    <NavBarCustom
                        title={helpTitle[1]}
                        navigator={this.props.navigator || null}
                        iconName="menu"
                        handlePressNavbarButton={this.handlePressNavbarButton}
                    >
                    </NavBarCustom>
                    )
                }
                <View style={style.containerContent}>
                    <AnimatedListView
                        stickyHeaderIndices={[0]}
                        data={this.state.helpItems || []}
                        renderItem={this.renderHelp}
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
                                filterText={filterText}
                            />}
                        ItemSeparatorComponent={this.renderSeparatorComponent}
                        ListEmptyComponent={this.listEmptyComponent}
                        style={[style.listViewStyle]}
                        componentContainerStyle={style.componentContainerStyle}
                        onScroll={this.handleScroll}
                        refreshing={this.state.refreshing}
                        onRefresh={this.handleOnRefresh}
                        getItemLayout={this.getItemLayout}
                    />
                </View>
            </ViewHOC>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handlePressNavbarButton = () => {
        this.state.displayModalFormat === true ? (
            this.props.navigator.dismissModal()
        ) : (
            this.setState({
                calendarPickerOpen: false
            }, () => {
                this.props.navigator.toggleDrawer({
                    side: 'left',
                    animated: true,
                    to: 'open'
                })
            })
        )
    };

    startLoadingScreen = () => {
        this.setState({
            loading: true
        })
    };

    renderHelp = ({item}) => {
        return (<HelpListItem
            item={item}
            onPressViewHelp={this.handlePressViewHelp}
            firstActionText={getTranslation(item.statusId, this.props.translation)}
        />)
    };

    getItemLayout = (data, index) => ({
        length: calculateDimension(178, true, this.props.screenSize),
        offset: calculateDimension(178, true, this.props.screenSize) * index,
        index
    });

    keyExtractor = (item, index) => {
       return item._id;
    };

    renderSeparatorComponent = () => {
        return (
            <View style={style.separatorComponentStyle} />
        )
    };

    handleOnRefresh = () => {
        this.setState({
            refreshing: true
        }, () => {
            this.filterHelp()
        });
    };

    listEmptyComponent = () => {
        return (
            <View style={[style.emptyComponent, {height: calculateDimension((667 - 152), true, this.props.screenSize)}]}>
                {
                    this.state.displayModalFormat === true ? (
                        <Text style={style.emptyComponentTextView}>
                            {`${getTranslation(translations.helpScreen.noHelpItemsToShowMessage, this.props.translation)} for ${this.state.pageAskingHelpFromNameToDisplay}`} 
                        </Text>
                    ) : (
                        <Text style={style.emptyComponentTextView}>
                            {`${getTranslation(translations.helpScreen.noHelpItemsToShowMessage, this.props.translation)}`} 
                        </Text>
                    )
                }
            </View>
        )
    };

    handlePressViewHelp = (item) => {
        console.log("### handlePressFollowUp: ", item);

        let itemClone = Object.assign({}, item);
        this.props.navigator.push({
            screen: 'HelpSingleScreen',
            // animated: true,
            // animationType: 'fade',
            passProps: {
                isNew: false,
                item: itemClone,
                filter: this.state.filter,
                startLoadingScreen: this.startLoadingScreen
            }
        })
    };

    //PrepareFieldsForHelpFromPage
    prepareFieldsForHelpFromPage = () => {
        let filter = {searchText: ''}
        let pageAskingHelpFromNameToDisplay = ''

        if (this.state.pageAskingHelpFrom === 'followUps') {
            pageAskingHelpFromNameToDisplay = getTranslation(translations.followUpsScreen.followUpsTitle, this.props.translation)
        } else if (this.state.pageAskingHelpFrom === 'contacts') {
            pageAskingHelpFromNameToDisplay = getTranslation(translations.contactsScreen.contactsTitle, this.props.translation)
        } else if (this.state.pageAskingHelpFrom === 'cases') {
            pageAskingHelpFromNameToDisplay = getTranslation(translations.casesScreen.casesTitle, this.props.translation)
        } 
        else if (this.state.pageAskingHelpFrom === 'followUpSingleScreenAdd') {
            pageAskingHelpFromNameToDisplay = `${getTranslation(translations.helpScreen.addMessage, this.props.translation)} ${getTranslation(translations.followUpsSingleScreen.title, this.props.translation)}`
        } else if (this.state.pageAskingHelpFrom === 'contactsSingleScreenAdd') {
            pageAskingHelpFromNameToDisplay = `${getTranslation(translations.helpScreen.addMessage, this.props.translation)} ${getTranslation(translations.contactSingleScreen.title, this.props.translation)}`
        } else if (this.state.pageAskingHelpFrom === 'casesSingleScreenAdd') {
            pageAskingHelpFromNameToDisplay = `${getTranslation(translations.helpScreen.addMessage, this.props.translation)} ${getTranslation(translations.caseSingleScreen.title, this.props.translation)}`
        } 
        else if (this.state.pageAskingHelpFrom === 'followUpSingleScreenEdit') {
            pageAskingHelpFromNameToDisplay = `${getTranslation(translations.helpScreen.editMessage, this.props.translation)} ${getTranslation(translations.followUpsSingleScreen.title, this.props.translation)}`
        } else if (this.state.pageAskingHelpFrom === 'contactsSingleScreenEdit') {
            pageAskingHelpFromNameToDisplay = `${getTranslation(translations.helpScreen.editMessage, this.props.translation)} ${getTranslation(translations.contactSingleScreen.title, this.props.translation)}`
        } else if (this.state.pageAskingHelpFrom === 'casesSingleScreenEdit') {
            pageAskingHelpFromNameToDisplay = `${getTranslation(translations.helpScreen.editMessage, this.props.translation)} ${getTranslation(translations.caseSingleScreen.title, this.props.translation)}`
        } 
        else if (this.state.pageAskingHelpFrom === 'followUpSingleScreenView') {
            pageAskingHelpFromNameToDisplay = `${getTranslation(translations.helpScreen.viewMessage, this.props.translation)} ${getTranslation(translations.followUpsSingleScreen.title, this.props.translation)}`
        } else if (this.state.pageAskingHelpFrom === 'contactsSingleScreenView') {
            pageAskingHelpFromNameToDisplay = `${getTranslation(translations.helpScreen.viewMessage, this.props.translation)} ${getTranslation(translations.contactSingleScreen.title, this.props.translation)}`
        } else if (this.state.pageAskingHelpFrom === 'casesSingleScreenView') {
            pageAskingHelpFromNameToDisplay = `${getTranslation(translations.helpScreen.viewMessage, this.props.translation)} ${getTranslation(translations.caseSingleScreen.title, this.props.translation)}`
        }
        else if (this.state.pageAskingHelpFrom === 'exposureAdd') {
            pageAskingHelpFromNameToDisplay = `${getTranslation(translations.exposureScreen.editExposureLabel, this.props.translation)}`
        } else if (this.state.pageAskingHelpFrom === 'exposureEdit') {
            pageAskingHelpFromNameToDisplay = `${getTranslation(translations.exposureScreen.editExposureLabel, this.props.translation)}`
        }

        return {
            filter: filter,
            pageAskingHelpFromNameToDisplay: pageAskingHelpFromNameToDisplay
        }
    }

    //Filters 
    applyFilters = () => {
        this.props.addFilterForScreen('HelpScreen', this.state.filter);
        this.setState({
            loading: true
        }, () => {
            this.filterHelp()
        })
    };

    handleOnSubmitEditing = (text) => {
        this.filterHelp();
    };

    handleOnApplyFilters = (filter) => {
        console.log ('foolowUpsScreen handleOnApplyFilters', filter)
        this.setState({
            filterFromFilterScreen: filter
        }, () => {
            this.filterHelp();
        })
    };

    filterHelp = () => {
        let helpItemClone = _.cloneDeep(this.props.helpItem);
        if (this.state.filter || this.state.filterFromFilterScreen){
            helpItemClone = localSortHelpItem(helpItemClone, this.props.filter, this.state.filter, this.state.filterFromFilterScreen, this.props.translation)
        }
        if (this.state.pageAskingHelpFrom && this.state.pageAskingHelpFrom !== undefined) {
            helpItemClone = filterItemsForEachPage(helpItemClone, this.state.pageAskingHelpFrom)
        }

        this.setState ({
            helpItems: helpItemClone,
            refreshing: false
        })
    };

    handlePressFilter = () => {
        this.props.navigator.showModal({
            screen: 'HelpFilterScreen',
            animated: true,
            passProps: {
                activeFilters: this.state.filterFromFilterScreen || null,
                onApplyFilters: this.handleOnApplyFilters,
                screen: 'HelpFilterScreen'
            }
        })
    };

    handleOnChangeText = (text) => {
        console.log("### handleOnChangeText: ", text);
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, {searchText: text})
        }), console.log('### filter after changed text: ', this.state.filter))
    };


    //Other
    showMenu = () => {
        this.refs.menuRef.show();
    };

    hideMenu = () => {
        this.refs.menuRef.hide();
    };

    onNavigatorEvent = (event) => {
        navigation(event, this.props.navigator);
    };
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    mapContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF'
    },
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
        filter: state.app.filters,
        syncState: state.app.syncState,
        errors: state.errors,
        translation: state.app.translation,
        helpCategory: state.helpCategory,
        helpItem: state.helpItem,
        role: state.role
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        removeErrors,
        addFilterForScreen,
        removeFilterForScreen,
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(HelpScreen);