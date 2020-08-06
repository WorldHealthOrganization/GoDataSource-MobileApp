/**
 * Created by florinpopa on 23/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, FlatList, Alert} from 'react-native';
import {calculateDimension, getTranslation} from './../utils/functions';
import styles from './../styles';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import translations from './../utils/translations';
import get from 'lodash/get';
import PersonListItem from "./PersonListItem";
import PropTypes from 'prop-types';
import SearchFilterView from "./SearchFilterView";
import config from "../utils/config";
import constants from "../utils/constants";
import {checkArrayAndLength} from "../utils/typeCheckingFunctions";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const VIEWABILITY_CONFIG = {
    minimumViewTime: 3000,
    viewAreaCoveragePercentThreshold: 100,
    waitForInteraction: true
};

const scrollAnim = new Animated.Value(0);
const offsetAnim = new Animated.Value(0);

class AnimatedListView extends Component {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {
            searchText: ''
        };
    }

    clampedScroll = Animated.diffClamp(
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
        [{ nativeEvent: { contentOffset: { y: scrollAnim } } }],
        { useNativeDriver: true }
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
        return (
            <AnimatedFlatList
                ref={this.animatedFlatList}
                data={Array.isArray(this.props.data) ? this.props.data : []}
                extraData={this.props.extraData}
                renderItem={this.renderItem}
                keyExtractor={this.keyExtractor}
                ItemSeparatorComponent={this.renderSeparatorComponent}
                legacyImplementation={false}
                viewabilityCongig={VIEWABILITY_CONFIG}
                disableVirtualization={false}
                onScroll={this.handleScroll}
                ListEmptyComponent={this.listEmptyComponent}
                style={this.props.style}
                componentContainerStyle={this.props.componentContainerStyle}
                stickyHeaderIndices={[0]}
                onRefresh={this.props.onRefresh}
                refreshing={this.props.refreshing}
                removeClippedSubviews={true}
                maxToRenderPerBatch={5}
                updateCellsBatchingPeriod={50}
                initialNumToRender={5}
                windowSize={10}
                ListHeaderComponent={
                    <View>
                        <SearchFilterView
                            style={{
                                transform: [{
                                    translateY: navbarTranslate
                                }],
                                opacity: navbarOpacity
                            }}
                            value={this.state.searchText}
                            hasFilter={this.props.hasFilter}
                            onPress={this.props.onPressFilter}
                            onChangeText={this.handleOnChangeText}
                            onSubmitEditing={this.handleOnSubmitEditing}
                            onEndEditing={this.handleOnEndEditing}
                            filterText={this.props.filterText}
                        />
                        <Animated.View style={{
                            transform: [{
                                translateY: navbarTranslate
                            }],
                            opacity: navbarOpacity,
                            width: calculateDimension(375 - 32, false, this.props.screenSize),
                            marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                            backgroundColor: '#eeeeee'
                        }}>
                            <Text style={{ marginBottom: 5, fontWeight: 'bold'}}>{this.props.dataCount} RESULTS</Text>
                        </Animated.View>
                    </View>
                }
                onEndReached={this.props.data.length >= 10 ? this.props.onEndReached : null}
                onEndReachedThreshold={0.01}
            />
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    renderItem = ({ item }) => {
        let margins = calculateDimension(16, false, this.props.screenSize);
        let textsArray = [];
        let textsStyleArray = [];
        let onPressTextsArray = [];
        let arrayPermissions = [];
        let id = null;
        let mainData = null;
        let exposureData = null;
        let titleColor = null;
        switch(this.props.dataType){
            case 'FollowUp':
                let followUpData = get(item, 'followUpData', null);
                mainData = get(item, 'mainData', null);
                exposureData = get(item, 'exposureData', null);
                textsArray = [
                    getTranslation(get(followUpData, 'statusId', translations.followUpStatuses.notPerformed), this.props.translation),
                    getTranslation(translations.followUpsScreen.addExposureFollowUpLabel, this.props.translation)
                ];
                textsStyleArray = [
                    [styles.buttonTextActionsBar, {color: this.props.colors[followUpData.statusId], marginLeft: margins}],
                    [styles.buttonTextActionsBar, {marginRight: margins}]];
                onPressTextsArray = [
                    () => {
                        this.props.onPressView(followUpData, mainData);
                        // this.handlePressFollowUp(item, this.props.contacts.find((e) => {return extractIdFromPouchId(e._id, 'person') === item.personId}))
                    },
                    () => {
                        this.props.onPressAddExposure(mainData);
                        // this.handleOnPressExposure(item, this.props.contacts.find((e) => {return extractIdFromPouchId(e._id, 'person') === item.personId}))
                    }];
                arrayPermissions = [
                    [constants.PERMISSIONS_FOLLOW_UP.followUpAll, constants.PERMISSIONS_FOLLOW_UP.followUpView],
                    [
                        [constants.PERMISSIONS_RELATIONSHIP.relationshipAll, constants.PERMISSIONS_CONTACT.contactAll],
                        [constants.PERMISSIONS_RELATIONSHIP.relationshipAll, constants.PERMISSIONS_CONTACT.contactCreateRelationshipExposures],
                        [constants.PERMISSIONS_RELATIONSHIP.relationshipCreate, constants.PERMISSIONS_CONTACT.contactAll],
                        [constants.PERMISSIONS_RELATIONSHIP.relationshipCreate, constants.PERMISSIONS_CONTACT.contactCreateRelationshipExposures]
                    ]
                ];
                id = get(followUpData, 'id', null);
                break;
            case 'Contact':
                mainData = get(item, 'mainData', null);
                exposureData = get(item, 'exposureData', null);
                textsArray = [
                    getTranslation(translations.casesScreen.viewButtonLabel, this.props.translation),
                    getTranslation(translations.contactsScreen.editButton, this.props.translation),
                    getTranslation(translations.followUpsScreen.addExposureFollowUpLabel, this.props.translation)
                ];
                textsStyleArray = [
                    [styles.buttonTextActionsBar, {fontSize: 14, marginLeft: margins}],
                    [styles.buttonTextActionsBar, {fontSize: 14}],
                    [styles.buttonTextActionsBar, {fontSize: 14, marginRight: margins}]];
                onPressTextsArray = [
                    () => {
                        this.props.onPressView(mainData)
                    },
                    () => {
                        this.props.onPressCenterButton(mainData)
                    },
                    () => {
                        this.props.onPressAddExposure(mainData);
                    }];
                arrayPermissions = [
                    [constants.PERMISSIONS_CONTACT.contactAll, constants.PERMISSIONS_CONTACT.contactView],
                    [constants.PERMISSIONS_CONTACT.contactAll, constants.PERMISSIONS_CONTACT.contactModify],
                    [
                        [constants.PERMISSIONS_RELATIONSHIP.relationshipAll, constants.PERMISSIONS_CONTACT.contactAll],
                        [constants.PERMISSIONS_RELATIONSHIP.relationshipAll, constants.PERMISSIONS_CONTACT.contactCreateRelationshipExposures],
                        [constants.PERMISSIONS_RELATIONSHIP.relationshipCreate, constants.PERMISSIONS_CONTACT.contactAll],
                        [constants.PERMISSIONS_RELATIONSHIP.relationshipCreate, constants.PERMISSIONS_CONTACT.contactCreateRelationshipExposures]
                    ],
                ];
                titleColor = this.props.colors[mainData.riskLevel];
                break;
            case 'Case':
                mainData = get(item, 'mainData', null);
                exposureData = get(item, 'exposureData', []);
                textsArray = [
                    getTranslation(translations.casesScreen.viewButtonLabel, this.props.translation),
                    `${getTranslation(translations.casesScreen.contactExposures, this.props.translation)}(${get(exposureData, 'length', 0)})`,
                    getTranslation(translations.casesScreen.addContactButtonLabel, this.props.translation)
                ];
                textsStyleArray = [
                    [styles.buttonTextActionsBar, {marginLeft: margins}],
                    [styles.buttonTextActionsBar, {fontSize: 14}],
                    [styles.buttonTextActionsBar, {marginRight: margins}]];
                onPressTextsArray = [
                    () => {
                        this.props.onPressView(mainData);
                    },
                    () => {
                        this.props.onPressCenterButton(mainData);
                    },
                    () => {
                        this.props.onPressAddExposure(mainData);
                    }];
                arrayPermissions = [
                    [
                        constants.PERMISSIONS_CASE.caseAll,
                        constants.PERMISSIONS_CASE.caseView
                    ],
                    [
                        constants.PERMISSIONS_RELATIONSHIP.relationshipAll,
                        constants.PERMISSIONS_RELATIONSHIP.relationshipList,
                        constants.PERMISSIONS_CASE.caseAll,
                        constants.PERMISSIONS_CASE.caseListRelationshipContacts
                    ],
                    [
                        constants.PERMISSIONS_CONTACT.contactAll,
                        constants.PERMISSIONS_CONTACT.contactCreate
                    ],
                ];
                titleColor = this.props.colors[mainData.classification];
                break;
            case 'User':
                mainData = get(item, 'mainData', null);
                exposureData = get(item, 'exposureData', []);
                textsArray = [
                    getTranslation(translations.usersScreen.phoneButtonLabel, this.props.translation)
                ];
                textsStyleArray = [
                    [styles.buttonTextActionsBar, {marginLeft: margins}],
                    [styles.buttonTextActionsBar, {fontSize: 14}],
                    [styles.buttonTextActionsBar, {marginRight: margins}]];
                onPressTextsArray = [
                    () => {
                        this.props.onPressView(mainData);
                    },
                    () => {
                        this.props.onPressCenterButton(mainData);
                    },
                    () => {
                        this.props.onPressAddExposure(mainData);
                    }];
                titleColor = 'black';
                break;
            default:
                textsArray = [];
                textsStyleArray = [];
                onPressTextsArray = [];
                break;
        }
        return(
            <PersonListItem
                key={id}
                type={this.props.dataType}
                itemToRender={item}
                onPressMapIconProp={() => this.handleOnPressMap(mainData)}
                onPressNameProp={() => this.props.onPressName(mainData, this.props.screen)}
                onPressExposureProp={this.props.onPressExposure}
                screenSize={this.props.screenSize}
                textsArray={textsArray}
                textsStyleArray={textsStyleArray}
                onPressTextsArray={onPressTextsArray}
                arrayPermissions={arrayPermissions}
                titleColor={titleColor}
            />
        )
    };

    listEmptyComponent = () => {
        let message = null;
        switch(this.props.dataType) {
            case 'FollowUp':
                message = translations.followUpsScreen.noFollowupsMessage;
                break;
            case 'Contact':
                message = translations.contactsScreen.noContacts;
                break;
            case 'Case':
                message = translations.casesScreen.noCases;
                break;
            case 'User':
                message = translations.usersScreen.noUsers;
                break;
            default:
                message = translations.followUpsScreen.noFollowupsMessage;
        }
        return (
            <View style={[style.emptyComponent, { height: calculateDimension((667 - 152), true, this.props.screenSize) }]}>
                <Text style={style.emptyComponentTextView}>
                    {getTranslation(message, this.props.translation)}
                </Text>
            </View>
        )
    };

    keyExtractor = (item, index) => {
        switch(this.props.dataType) {
            case 'FollowUp':
                return get(item, 'followUpData._id', null);
            case 'Contact':
                return get(item, 'mainData._id', null);
            case 'Case':
                return get(item, 'mainData._id', null);
            case 'User':
                return get(item, 'mainData._id', null);
            default:
                return get(item, 'mainData._id', null);
        }
    };

    renderSeparatorComponent = () => {
        return (
            <View style={style.separatorComponentStyle} />
        )
    };

    handleOnChangeText = (text) => {
        this.setState(prevState => ({
            searchText: text
        }))
    };

    handleOnSubmitEditing = () => {
        console.log("OnSubmitEditing");
    };

    handleOnEndEditing = (text) => {
        this.props.onSearch(this.state.searchText);
    };

    handleOnPressMap = (person) => {
        if (checkArrayAndLength(get(person, 'addresses', null))) {
            let placeOfResidence = person.addresses.find((e) => {
                return e.typeId === config.userResidenceAddress.userPlaceOfResidence
            });
            let placeOfResidenceLatitude = get(placeOfResidence, 'geoLocation.coordinates[1]', 0);
            let placeOfResidenceLongitude = get(placeOfResidence, 'geoLocation.coordinates[0]', 0);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.props.onPressMap({
                        latitude: placeOfResidenceLatitude,
                        longitude: placeOfResidenceLongitude,
                        sourceLatitude: position.coords.latitude,
                        sourceLongitude: position.coords.longitude,
                        isVisible: true,
                        error: null,
                    });
                },
                (error) => {
                    Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(error.message, this.props.translation), [
                        {
                            text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                            onPress: () => { console.log("OK pressed") }
                        }
                    ])
                },
                {
                    timeout: 5000
                }
            );
        }
    };
}

Animated.propTypes = {
    data: PropTypes.array.isRequired,
    dataCount: PropTypes.number,
    dataType: PropTypes.oneOf(['FollowUp', 'Contact', 'Case']).isRequired,
    filterText: PropTypes.string,
    onSearch: PropTypes.func,
    onPressFilter: PropTypes.func,
    onPressView: PropTypes.func,
    onPressMap: PropTypes.func,
    onPressName: PropTypes.func,
    onPressCenterButton: PropTypes.func
};

AnimatedListView.defaultProps = {
    data: [],
    dataCount: 0,
    dataType: 'FollowUp',
    filterText: `${getTranslation(translations.generalLabels.filterTitle, get(this.props, 'translation', null))}`,
    onSearch: () => {console.log("Default function onSearch")},
    onPressFilter: () => {console.log("Default function onPressFilter")},
    onPressView: () => {console.log('Default function onPressView')},
    onPressMap: () => {console.log('Default function onPressMap')},
    onPressName: () => {console.log('Default function onPressName')},
    onPressCenterButton: () => {console.log('Default function onPressCenterButton')}
};

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    emptyComponent: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    separatorComponentStyle: {
        height: 8
    },
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        translation: state.app.translation
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(AnimatedListView);
