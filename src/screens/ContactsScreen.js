/**
 * Created by florinpopa on 18/07/2018.
 */
import React, {Component} from 'react';
import {View, StyleSheet, Animated, Text} from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import {Icon} from 'react-native-material-ui';
import styles from './../styles';
import NavBarCustom from './../components/NavBarCustom';
import ElevatedView from 'react-native-elevated-view';
import Ripple from 'react-native-material-ripple';
import {calculateDimension} from './../utils/functions';
import FollowUpListItem from './../components/FollowUpListItem';
import SearchFilterView from './../components/SearchFilterView';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import AnimatedListView from './../components/AnimatedListView';
import {getContactsForOutbreakId} from './../actions/contacts';
import {addFilterForScreen} from './../actions/app';
import {navigation} from './../utils/functions';
import ViewHOC from './../components/ViewHOC';


const scrollAnim = new Animated.Value(0);
const offsetAnim = new Animated.Value(0);


class ContactsScreen extends Component {

    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
            contacts: [],
            filter: this.props.filter && this.props.filter['FollowUpsScreen'] ? this.props.filter['FollowUpsScreen'] : {
                date: new Date(),
                searchText: ''
            },
            filterFromFilterScreen: this.props.filter && this.props.filter['FollowUpsFilterScreen'] ? this.props.filter['FollowUpsFilterScreen'] : null,
            loading: true,
        };
        // Bind here methods, or at least don't declare methods in the render method
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    // Please add here the react lifecycle methods that you need
    componentDidMount() {
        this.setState({
            loading: true
        }, () => {
            this.props.getContactsForOutbreakId(this.props.user.activeOutbreakId, null, null);
        })
    }

    static getDerivedStateFromProps(props, state) {
        // if (props.contacts)
        state.loading = false;

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

        return (
            <ViewHOC style={style.container}
                     showLoader={(this.props && this.props.syncState && (this.props.syncState !== 'Finished processing' && this.props.syncState !== 'Error')) || (this && this.state && this.state.loading)}
                     loaderText={this.props && this.props.syncState ? this.props.syncState : 'Loading...'}>
                <NavBarCustom
                    customTitle={
                        <View style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            height: '100%'
                        }}>
                            <Text style={[style.title, {marginLeft: 30}]}>Contacts</Text>
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
                                }} onPress={this.handleOnPressAddContact} hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
                                    <Icon name="add" color={'white'} size={15}/>
                                </Ripple>
                            </ElevatedView>
                        </View>
                    }
                    title={null}
                    navigator={this.props.navigator}
                    iconName="menu"
                    handlePressNavbarButton={this.handlePressNavbarButton}
                >
                </NavBarCustom>
                <View style={style.containerContent}>
                    <AnimatedListView
                        stickyHeaderIndices={[0]}
                        data={this.props.contacts || []}
                        renderItem={this.renderContact}
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
                        // ListEmptyComponent={this.listEmptyComponent}
                        style={[style.listViewStyle]}
                        componentContainerStyle={style.componentContainerStyle}
                        onScroll={this.handleScroll}
                        // refreshing={this.state.refreshing}
                        // onRefresh={this.handleOnRefresh}
                    />
                </View>
            </ViewHOC>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleOnPressAddContact = () => {
        this.props.navigator.push({
            screen: 'ContactsSingleScreen',
            animated: true,
            animationType: 'fade',
            passProps: {
                isNew: true
            }
        })
    };

    keyExtractor = (item, index) => item._id;

    renderContact = (item) => {
        // console.log("### item: ", item);
        return (
            <FollowUpListItem
                item={item.item}
                isContact={true}
                firstActionText={'ADD FOLLOW-UP'}
                secondActionText={"EDIT"}
                onPressFollowUp={this.handlePressFollowUp}
                onPressMissing={this.handleOnPressMissing}
                onPressExposure={this.handleOnPressExposure}
            />
        )
    };

    renderSeparatorComponent = () => {
        return (
            <View style={style.separatorComponentStyle} />
        )
    };

    handleOnChangeText = (text) => {
        console.log("### handleOnChangeText: ", text);
        this.setState(prevState => ({
            filter: Object.assign({}, prevState.filter, {searchText: text})
        }), console.log('### filter after changed text: ', this.state.filter))
    };

    handleOnSubmitEditing = (text) => {
        console.log ('text', text)
        // this.props.addFilterForScreen("FollowUpsScreen", this.state.filter);
        // let existingFilter = this.state.filterFromFilterScreen ? Object.assign({}, this.state.filterFromFilterScreen) : Object.assign({}, config.defaultFilterForContacts);
        //
        // if (!existingFilter.where || Object.keys(existingFilter.where).length === 0) {
        //     existingFilter.where = {};
        // }
        // if (!existingFilter.where.or || existingFilter.where.or.length === 0) {
        //     existingFilter.where.or = [];
        // }
        // existingFilter.where.or.push({firstName: {like: this.state.filter.searchText, options: 'i'}});
        // existingFilter.where.or.push({lastName: {like: this.state.filter.searchText, options: 'i'}});
        //
        // this.props.getContactsForOutbreakId(this.props.user.activeOutbreakId, existingFilter, this.props.user.token);

        // Filter contacts by firstName and lastName
        this.filterContacts();
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

    handleOnApplyFilters = (filter) => {
        this.setState({
            filterFromFilterScreen: filter
        }, () => {
            // if (this.state.filter.searchText) {
            //
            //     if (!filter.where.or || filter.where.or.length === 0) {
            //         filter.where.or = [];
            //     }
            //     filter.where.or.push({firstName: {like: this.state.filter.searchText, options: 'i'}});
            //     filter.where.or.push({lastName: {like: this.state.filter.searchText, options: 'i'}});
            // }
            // this.props.getContactsForOutbreakId(this.props.user.activeOutbreakId, filter, this.props.user.token);

            this.filterContacts();
        })
    };

    handlePressFollowUp = (item, contact) => {
        console.log("### handlePressFollowUp item:", JSON.stringify(item));
        console.log("### handlePressFollowUp contact:", JSON.stringify(contact));
        this.props.navigator.push({
            screen: 'FollowUpsSingleScreen',
            animated: true,
            animationType: 'fade',
            passProps: {
                item: {
                    date: new Date(),
                    outbreakId: this.props.user.activeOutbreakId,
                    lostToFollowUp: false
                },
                contact: contact || item,
                filter: this.state.filter,
                isNew: true
            }
        })
    };

    handleOnPressMissing = (followUp, contact) => {
        console.log("Handle on press edit followUp: ", JSON.stringify(followUp));
        console.log("Handle on press edit contact: ", JSON.stringify(contact));
        this.props.navigator.push({
            screen: 'ContactsSingleScreen',
            animated: true,
            animationType: 'fade',
            passProps: {
                contact: contact || followUp
            }
        })
    };

    handleOnPressExposure = (followUp, contact) => {
        this.props.navigator.showModal({
            screen: "ExposureScreen",
            animated: true,
            passProps: {
                contact: contact || followUp,
                type: 'Contact'
            }
        })
    };

    handlePressNavbarButton = () => {
        this.props.navigator.toggleDrawer({
            side: 'left',
            animated: true,
            to: 'open'
        })
    };

    filterContacts = () => {
        let allFilters = {}

        if (this.state.filterFromFilterScreen && this.state.filterFromFilterScreen.age) {
            allFilters.age = this.state.filterFromFilterScreen.age
        } else {
            allFilters.age = null
        }

        if (this.state.filterFromFilterScreen && this.state.filterFromFilterScreen.gender) {
            if (this.state.filterFromFilterScreen.gender === 'Female') {
                allFilters.gender = 'LNG_REFERENCE_DATA_CATEGORY_GENDER_FEMALE'
            } else  if (this.state.filterFromFilterScreen.gender === 'Male') {
                allFilters.gender = 'LNG_REFERENCE_DATA_CATEGORY_GENDER_MALE'
            }
        } else {
            allFilters.gender = null
        }

        console.log('this.state.filter.searchText ', this.state.filter.searchText)
        if (this.state.filter.searchText.trim().length > 0) {
            let splitedFilter= this.state.filter.searchText.split(" ")
            allFilters.searchText = new RegExp(splitedFilter.join("|"), "ig");
        } else {
            allFilters.searchText = null
        }
        
        if (!allFilters.age && !allFilters.gender && !allFilters.searchText) {
            allFilters = null
        }

        this.props.getContactsForOutbreakId(this.props.user.activeOutbreakId, allFilters, null);
    };

    onNavigatorEvent = (event) => {
        navigation(event, this.props.navigator);
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
    title: {
        fontSize: 17,
        fontFamily: 'Roboto-Medium',
    }
});

function mapStateToProps(state) {
    return {
        user: state.user,
        screenSize: state.app.screenSize,
        syncState: state.app.syncState,
        contacts: state.contacts,
        errors: state.errors
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        getContactsForOutbreakId,
        addFilterForScreen
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(ContactsScreen);