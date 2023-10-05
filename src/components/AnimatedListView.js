/**
 * Created by florinpopa on 23/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {View, Text, ActivityIndicator, Animated, FlatList, Alert, StyleSheet} from 'react-native';
import geolocation from '@react-native-community/geolocation';
import {calculateDimension, getTranslation} from './../utils/functions';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import translations from './../utils/translations';
import get from 'lodash/get';
import PersonListItem from "./PersonListItem";
import PropTypes from 'prop-types';
import SearchFilterView from "./SearchFilterView";
import config from "../utils/config";
import constants, {PERMISSIONS_CONTACT_OF_CONTACT} from "../utils/constants";
import {checkArrayAndLength} from "../utils/typeCheckingFunctions";
import styles from './../styles';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const VIEWABILITY_CONFIG = {
    minimumViewTime: 3000,
    viewAreaCoveragePercentThreshold: 100,
    waitForInteraction: true
};



class AnimatedListView extends Component {

    scrollAnim = new Animated.Value(0);
    offsetAnim = new Animated.Value(0);

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        console.log("Animated  list view constructor call", props.dataType);
        super(props);
        this.state = {
            searchText: ''
        };

        this.scrollAnim = new Animated.Value(0);
        this.offsetAnim = new Animated.Value(0);

    }

    clampedScroll = Animated.diffClamp(
        Animated.add(
            this.scrollAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
                extrapolateLeft: 'clamp',
            }),
            this.offsetAnim,
        ),
        0,
        40,
    );

    handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: this.scrollAnim } } }],
        { useNativeDriver: true }
    );

    // Please add here the react lifecycle methods that you need

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        const navbarTranslate = this.clampedScroll.interpolate({
            inputRange: [0, 40],
            outputRange: [0, -40],
            extrapolate: 'clamp',
        });
        const navbarOpacity = this.clampedScroll.interpolate({
            inputRange: [0, 40],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });
        console.log("Rendered animated list view");
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
                        <Animated.View style={[style.searchResultsContainer, {
                            transform: [{
                                translateY: navbarTranslate
                            }],
                            opacity: navbarOpacity,
                            width: calculateDimension(375 - 32, false, this.props.screenSize),
                            marginHorizontal: calculateDimension(16, false, this.props.screenSize)
                        }]}>
                            <Text style={style.searchResultsContainerText}>{this.props.dataCount} RESULTS</Text>
                        </Animated.View>
                    </View>
                }
                onEndReached={this.loadMore}
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
        let onPermissionDisable = false;
        let outbreakPermissions = [];
        let secondaryOutbreakPermissions = [];

        let secondaryTextsArray = [];
        let secondaryTextsStyleArray = [];
        let secondaryOnPressTextsArray = [];
        let secondaryArrayPermissions = [];

        let id = null;
        let mainData = null;
        let secondaryData = null;
        let exposureData = null;
        let exposureCount = 0;
        let contactCount = 0;
        let titleColor = null;
        switch(this.props.dataType){
            case 'FollowUp':
                let followUpData = get(item, 'followUpData', null);
                secondaryData = followUpData;
                mainData = get(item, 'mainData', null);
                exposureData = get(item, 'exposureData', null);
                textsArray = [
                    getTranslation(get(followUpData, 'statusId', translations.followUpStatuses.notPerformed), this.props.translation),
                    // getTranslation(translations.followUpsScreen.addExposureFollowUpLabel, this.props.translation)
                ];
                textsStyleArray = [
                    [styles.buttonTextActionsBar, {color: this.props.colors[followUpData.statusId], }],
                    // [styles.buttonTextActionsBar, {}]
                ];
                onPressTextsArray = [
                    () => {
                        this.props.onPressView(followUpData, mainData);
                        // this.handlePressFollowUp(item, this.props.contacts.find((e) => {return extractIdFromPouchId(e._id, 'person') === item.personId}))
                    },
                    () => {
                        this.props.onPressAddExposure(mainData);
                        // this.handleOnPressExposure(item, this.props.contacts.find((e) => {return extractIdFromPouchId(e._id, 'person') === item.personId}))
                    }
                ];
                arrayPermissions = [
                    [constants.PERMISSIONS_FOLLOW_UP.followUpAll, constants.PERMISSIONS_FOLLOW_UP.followUpView],
                    // [
                    //     [constants.PERMISSIONS_RELATIONSHIP.relationshipAll, constants.PERMISSIONS_CONTACT.contactAll],
                    //     [constants.PERMISSIONS_RELATIONSHIP.relationshipAll, constants.PERMISSIONS_CONTACT.contactCreateRelationshipExposures],
                    //     [constants.PERMISSIONS_RELATIONSHIP.relationshipCreate, constants.PERMISSIONS_CONTACT.contactAll],
                    //     [constants.PERMISSIONS_RELATIONSHIP.relationshipCreate, constants.PERMISSIONS_CONTACT.contactCreateRelationshipExposures]
                    // ]
                ];
                onPermissionDisable = [
                    true,
                    // false
                ];
                id = get(followUpData, 'id', null);
                break;
            case 'Contact':
                mainData = get(item, 'mainData', null);
                exposureCount = get(item, 'countExposures', 0);
                contactCount = get(item, 'countContacts', 0);
                textsArray = [
                    getTranslation(translations.casesScreen.viewButtonLabel, this.props.translation),
                    `${getTranslation(translations.casesScreen.contactExposures, this.props.translation)} (${contactCount})`,
                    `${getTranslation(translations.casesScreen.exposures, this.props.translation)} (${exposureCount})`
                ];
                secondaryTextsArray = [
                    getTranslation(translations.casesScreen.addContactOfContact, this.props.translation),
                ]
                textsStyleArray = [
                    [styles.buttonTextActionsBar, {fontSize: 14}],
                    [styles.buttonTextActionsBar, {fontSize: 14}],
                    [styles.buttonTextActionsBar, {fontSize: 14}]];
                secondaryTextsStyleArray = [
                    [styles.buttonTextActionsBar, {fontSize: 14, margin: 'auto', justifyContent: 'center'}],
                ]
                onPressTextsArray = [
                    () => {
                        this.props.onPressView(mainData);
                    },
                    () => {
                        this.props.goToScreen(mainData,2);
                    },
                    () => {
                        this.props.goToScreen(mainData,this.props.outbreak?.isContactsOfContactsActive ? 3 : 2);
                    }];
                secondaryOnPressTextsArray = [
                    () => {
                        this.props.onPressCenterButton(mainData);
                    }
                ]
                arrayPermissions = [
                    [constants.PERMISSIONS_CONTACT.contactAll, constants.PERMISSIONS_CONTACT.contactView],
                    [
                        [constants.PERMISSIONS_RELATIONSHIP.relationshipAll, constants.PERMISSIONS_CONTACT.contactAll],
                        [constants.PERMISSIONS_RELATIONSHIP.relationshipAll, constants.PERMISSIONS_CONTACT.contactCreateRelationshipExposures],
                        [constants.PERMISSIONS_RELATIONSHIP.relationshipCreate, constants.PERMISSIONS_CONTACT.contactAll],
                        [constants.PERMISSIONS_RELATIONSHIP.relationshipCreate, constants.PERMISSIONS_CONTACT.contactCreateRelationshipExposures]
                    ],
                    [
                        // [constants.PERMISSIONS_RELATIONSHIP.relationshipAll, constants.PERMISSIONS_CONTACT.contactAll],
                        // [constants.PERMISSIONS_RELATIONSHIP.relationshipAll, constants.PERMISSIONS_CONTACT.contactCreateRelationshipExposures],
                        // [constants.PERMISSIONS_RELATIONSHIP.relationshipCreate, constants.PERMISSIONS_CONTACT.contactAll],
                        // [constants.PERMISSIONS_RELATIONSHIP.relationshipCreate, constants.PERMISSIONS_CONTACT.contactCreateRelationshipExposures]
                    ],
                ];
                secondaryArrayPermissions = [
                    [
                        [constants.PERMISSIONS_CONTACT.contactAll, PERMISSIONS_CONTACT_OF_CONTACT.contactsOfContactsAll],
                        [constants.PERMISSIONS_CONTACT.contactAll, PERMISSIONS_CONTACT_OF_CONTACT.contactsOfContactsCreate],
                        [constants.PERMISSIONS_CONTACT.contactCreateContactOfContact, PERMISSIONS_CONTACT_OF_CONTACT.contactsOfContactsAll],
                        [constants.PERMISSIONS_CONTACT.contactCreateContactOfContact, PERMISSIONS_CONTACT_OF_CONTACT.contactsOfContactsCreate]
                    ]
                ];
                outbreakPermissions = [
                    [],
                    [constants.PERMISSIONS_OUTBREAK.allowRegistrationOfCoC],
                    []
                ];
                secondaryOutbreakPermissions = [
                    [constants.PERMISSIONS_OUTBREAK.allowRegistrationOfCoC]
                ];
                onPermissionDisable = [false, true, false];
                titleColor = this.props.colors[mainData.riskLevel];
                break;
            case 'ContactOfContact':
                mainData = get(item, 'mainData', null);
                exposureCount = get(item, 'countExposures', 0);
                textsArray = [
                    getTranslation(translations.casesScreen.viewButtonLabel, this.props.translation),
                    `${getTranslation(translations.casesScreen.exposures, this.props.translation)} (${exposureCount})`
                ];
                textsStyleArray = [
                    [styles.buttonTextActionsBar, {fontSize: 14, }],
                    [styles.buttonTextActionsBar, {fontSize: 14, }],
                ]
                onPressTextsArray = [
                    () => {
                        this.props.onPressView(mainData)
                    },
                    () => {
                        this.props.goToScreen(mainData, 2);
                    }];
                arrayPermissions = [
                    [PERMISSIONS_CONTACT_OF_CONTACT.contactsOfContactsAll, PERMISSIONS_CONTACT_OF_CONTACT.contactsOfContactsView],
                    [
                        [constants.PERMISSIONS_RELATIONSHIP.relationshipAll, PERMISSIONS_CONTACT_OF_CONTACT.contactsOfContactsAll],
                        [constants.PERMISSIONS_RELATIONSHIP.relationshipAll, PERMISSIONS_CONTACT_OF_CONTACT.contactsOfContactsCreateRelationshipContacts],
                        [constants.PERMISSIONS_RELATIONSHIP.relationshipCreate, PERMISSIONS_CONTACT_OF_CONTACT.contactsOfContactsAll],
                        [constants.PERMISSIONS_RELATIONSHIP.relationshipCreate, PERMISSIONS_CONTACT_OF_CONTACT.contactsOfContactsCreateRelationshipContacts]
                    ],
                ];
                titleColor = this.props.colors[mainData.riskLevel];
                break;
            case 'Case':
                mainData = get(item, 'mainData', null);
                exposureCount = get(item, 'countExposures', 0);
                contactCount = get(item, 'countContacts', 0);
                textsArray = [
                    getTranslation(translations.casesScreen.viewButtonLabel, this.props.translation),
                    `${getTranslation(translations.casesScreen.contactExposures, this.props.translation)} (${contactCount})`,
                    `${getTranslation(translations.casesScreen.exposures, this.props.translation)} (${exposureCount})`,
                ];
                secondaryTextsArray = [
                    getTranslation(translations.casesScreen.addContactButtonLabel, this.props.translation)
                ]
                textsStyleArray = [
                    [styles.buttonTextActionsBar, {}],
                    [styles.buttonTextActionsBar, {fontSize: 14}],
                    [styles.buttonTextActionsBar, {fontSize: 14, }],
                ];
                secondaryTextsStyleArray = [
                    [styles.buttonTextActionsBar, {}]
                ]
                onPressTextsArray = [
                    () => {
                        this.props.onPressView(mainData);
                    },
                    () => {
                        this.props.goToScreen(mainData, 3);
                    },
                    () => {
                        this.props.goToScreen(mainData, 4);
                    },
                ];
                secondaryOnPressTextsArray = [
                    () => {
                        this.props.onPressAddExposure(mainData);
                    }
                ]
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
                        constants.PERMISSIONS_RELATIONSHIP.relationshipAll,
                        constants.PERMISSIONS_RELATIONSHIP.relationshipList,
                        constants.PERMISSIONS_CASE.caseAll,
                        constants.PERMISSIONS_CASE.caseListRelationshipContacts
                    ]
                ];
                secondaryArrayPermissions = [
                    [
                        constants.PERMISSIONS_CONTACT.contactAll,
                        constants.PERMISSIONS_CONTACT.contactCreate
                    ],
                ]
                titleColor = this.props.colors[mainData.classification];
                break;
            case 'Event':
                mainData = get(item, 'mainData', null);
                exposureCount = get(item, 'countExposures', 0);
                contactCount = get(item, 'countContacts', 0);
                textsArray = [
                    getTranslation(translations.casesScreen.viewButtonLabel, this.props.translation),
                    `${getTranslation(translations.casesScreen.contactExposures, this.props.translation)} (${contactCount})`,
                    `${getTranslation(translations.casesScreen.exposures, this.props.translation)} (${exposureCount})`,
                ];
                secondaryTextsArray = [
                    getTranslation(translations.casesScreen.addContactButtonLabel, this.props.translation)
                ]
                textsStyleArray = [
                    [styles.buttonTextActionsBar, {}],
                    [styles.buttonTextActionsBar, {fontSize: 14}],
                    [styles.buttonTextActionsBar, {fontSize: 14, }],
                ];
                secondaryTextsStyleArray = [
                    [styles.buttonTextActionsBar, {}]
                ]
                onPressTextsArray = [
                    () => {
                        this.props.onPressView(mainData);
                    },
                    () => {
                        this.props.goToScreen(mainData, 2);
                    },
                    () => {
                        this.props.goToScreen(mainData, 3);
                    },
                ];
                secondaryOnPressTextsArray = [
                    () => {
                        this.props.onPressAddExposure(mainData);
                    }
                ]
                arrayPermissions = [
                    [
                        constants.PERMISSIONS_EVENT.eventAll,
                        constants.PERMISSIONS_EVENT.eventView
                    ],
                    [
                        constants.PERMISSIONS_RELATIONSHIP.relationshipAll,
                        constants.PERMISSIONS_RELATIONSHIP.relationshipList,
                        constants.PERMISSIONS_EVENT.eventAll,
                        constants.PERMISSIONS_EVENT.eventListRelationshipContacts
                    ],
                    [
                        constants.PERMISSIONS_RELATIONSHIP.relationshipAll,
                        constants.PERMISSIONS_RELATIONSHIP.relationshipList,
                        constants.PERMISSIONS_EVENT.eventAll,
                        constants.PERMISSIONS_EVENT.eventListRelationshipContacts
                    ]
                ];
                secondaryArrayPermissions = [
                    [
                        constants.PERMISSIONS_CONTACT.contactAll,
                        constants.PERMISSIONS_CONTACT.contactCreate
                    ],
                ]
                titleColor = this.props.colors[mainData.classification];
                break;
            case 'User':
                mainData = get(item, 'mainData', null);
                exposureData = get(item, 'exposureData', []);
                textsArray = [
                    getTranslation(translations.usersScreen.phoneButtonLabel, this.props.translation)
                ];
                textsStyleArray = [
                    [styles.buttonTextActionsBar, {color: styles.backgroundColor, lineHeight: 22}],
                    [styles.buttonTextActionsBar, {}],
                    [styles.buttonTextActionsBar, {}]];
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
            case 'LabResult':
                const labResultData = get(item, 'labResultData', null);
                secondaryData = labResultData;
                mainData = get(item, 'mainData', null);
                textsArray = [
                    getTranslation(translations.casesScreen.viewButtonLabel, this.props.translation)
                ];
                textsStyleArray = [
                    [styles.buttonTextActionsBar, {fontSize: 14, }]
                ];
                onPressTextsArray = [
                    () => {
                        this.props.onPressView(labResultData,mainData);
                    }];
                arrayPermissions = [
                    [
                        constants.PERMISSIONS_LAB_RESULT.labResultAll,
                        constants.PERMISSIONS_LAB_RESULT.labResultView
                    ]
                ];
                break;
            default:
                textsArray = [];
                textsStyleArray = [];
                onPressTextsArray = [];


                secondaryTextsArray = [];
                secondaryTextsStyleArray = [];
                secondaryOnPressTextsArray = [];
                break;
        }
            let placeOfResidence = mainData?.addresses ?
                mainData?.addresses?.find((e) => {
                    return e.typeId === config.userResidenceAddress.userPlaceOfResidence;
                })
                :
                (mainData?.address?.typeId === config.userResidenceAddress.userPlaceOfResidence ? mainData?.address : null);
            let placeOfResidenceLatitude = get(placeOfResidence, 'geoLocation.coordinates[1]', '');
            let placeOfResidenceLongitude = get(placeOfResidence, 'geoLocation.coordinates[0]', '');

        return(
            <PersonListItem
                key={id}
                type={this.props.dataType}
                itemToRender={item}
                onPressMapIconProp={(placeOfResidenceLongitude === '' && placeOfResidenceLatitude === '') ?
                    null
                    :
                    () => this.handleOnPressMap(mainData)
                }
                onPressNameProp={() => this.props.onPressName(mainData, this.props.screen, secondaryData)}
                onPressExposureProp={this.props.onPressExposure}
                screenSize={this.props.screenSize}
                textsArray={textsArray}
                textsStyleArray={textsStyleArray}
                onPressTextsArray={onPressTextsArray}
                arrayPermissions={arrayPermissions}
                onPermissionDisable={onPermissionDisable}
                outbreakPermissions={outbreakPermissions}
                secondaryOutbreakPermissions={secondaryOutbreakPermissions}
                secondaryTextsArray={secondaryTextsArray}
                secondaryTextsStyleArray={secondaryTextsStyleArray}
                secondaryOnPressTextsArray={secondaryOnPressTextsArray}
                secondaryArrayPermissions={secondaryArrayPermissions}
                titleColor={titleColor}
            />
        )
    };

    listEmptyComponent = () => {
        let message = null;
        switch (this.props.dataType) {
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
            case 'LabResult':
                message = translations.labResultsScreen.noLabResults;
                break;
            case 'Event':
                message = translations.eventsScreen.noEvents;
                break;
            default:
                message = translations.labResultsScreen.noLabResults;
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
            case 'ContactOfContact':
                return get(item, 'mainData._id', null);
            case 'Case':
                return get(item, 'mainData._id', null);
            case 'User':
                return get(item, 'mainData._id', null);
            case 'LabResult':
                return get(item, 'labResultData._id', null);
            case 'Event':
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

    loadMore = () => {
        if (this.props.data.length >= 10) {
            this.props.onEndReached(null)
        }
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
        if (checkArrayAndLength(get(person, 'addresses', null)) || person?.address) {

            let placeOfResidence = person.addresses ?
                person.addresses.find((e) => {
                    return e.typeId === config.userResidenceAddress.userPlaceOfResidence;
                })
                :
                (person.address.typeId === config.userResidenceAddress.userPlaceOfResidence ? person.address : null);

            let placeOfResidenceLatitude = get(placeOfResidence, 'geoLocation.coordinates[1]', '');
            let placeOfResidenceLongitude = get(placeOfResidence, 'geoLocation.coordinates[0]', '');

            if (placeOfResidenceLongitude !== '' && placeOfResidenceLatitude !== ''){
                geolocation.getCurrentPosition(
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
    onPressCenterButton: PropTypes.func,
    onEndReached: PropTypes.func
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
    onPressCenterButton: () => {console.log('Default function onPressCenterButton')},
    onEndReached: () => {console.log('Default function onEndReached')}
};

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    emptyComponent: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    separatorComponentStyle: {
        height: 8
    },
    searchResultsContainer: {
        backgroundColor: '#eeeeee'
    },
    searchResultsContainerText: {
        fontWeight: 'bold',
        marginBottom: 5
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        translation: state.app.translation,
        outbreak: state.outbreak
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(AnimatedListView);
