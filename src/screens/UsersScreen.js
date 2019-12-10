/**
 * Created by mobileclarisoft on 13/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {View, StyleSheet} from 'react-native';
import {Icon} from 'react-native-material-ui';
import styles from './../styles';
import NavBarCustom from './../components/NavBarCustom';
import {calculateDimension, getTranslation} from './../utils/functions';
import Ripple from 'react-native-material-ripple';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import ElevatedView from 'react-native-elevated-view';
import Breadcrumb from './../components/Breadcrumb';
import {getUsersForOutbreakId} from './../actions/user';
import {setLoaderState} from './../actions/app';
import AnimatedListView from './../components/AnimatedListView';
import ViewHOC from './../components/ViewHOC';
import translations from './../utils/translations';
import {enhanceListWithGetData} from './../components/higherOrderComponents/withListData';
import get from "lodash/get";
import {checkArrayAndLength} from "../utils/typeCheckingFunctions";
import { Popup } from 'react-native-map-link';
import call from 'react-native-phone-call';

class UsersScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            sortData: false,
            isVisible: false,
            latitude: 0,
            longitude: 0,
            sourceLatitude: 0,
            sourceLongitude: 0,
            error: null,
            riskColors: {}
        };
    }

    // Please add here the react lifecycle methods that you need
    componentDidMount() {
        let riskColors = {};
        let refData = this.props.referenceData.filter((e) => {return e.categoryId.includes("RISK_LEVEL")});
        for (let i=0; i<refData.length; i++) {
            riskColors[refData[i].value] = refData[i].colorCode || 'black'
        }
        this.setState({
            riskColors: riskColors
        });
    }

    componentDidUpdate(prevProps) {
        if (this.props.data && prevProps.data !== this.props.data) {
            this.setState({
                refreshing: false
            })
        }
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        let {mainFilter} = this.props;

        let filterNumbers = 0;
        if (mainFilter) {
            if (get(mainFilter, 'gender', null) !== null) {
                ++filterNumbers
            }
            if (get(mainFilter, 'age', null) !== null) {
                ++filterNumbers
            }
            if (checkArrayAndLength(get(mainFilter, 'selectedLocations', null))) {
                ++filterNumbers
            }
        }
        let filterText = filterNumbers === 0 ? `${getTranslation(translations.generalLabels.filterTitle, this.props.translation)}` : `(${filterNumbers})`;
        let usersTitle = []; usersTitle[0] = getTranslation(translations.usersScreen.usersTitle, this.props.translation);

        return (
            <ViewHOC style={style.container}
                     showLoader={(this.props && this.props.loaderState) || (this.state && this.state.loading)}
                     loaderText={this.props && this.props.syncState ? 'Loading' : getTranslation(translations.loadingScreenMessages.loadingMsg, this.props.translation)}
                     refresh={this.props.onRefresh}
            >
                <NavBarCustom
                    title={null}
                    customTitle={
                        <View style={{flex: 1, flexDirection: 'row'}}>
                            <View
                                style={[style.breadcrumbContainer]}>
                                <Breadcrumb
                                    key="userKey"
                                    entities={usersTitle}
                                    navigator={this.props.navigator}
                                />
                            </View>
                            <View style={{ flex: 0.15 }}>
                            </View>
                            <View style={{ flex: 0.15 }}>
                                <ElevatedView
                                    elevation={3}
                                    style={{
                                        backgroundColor: styles.buttonGreen,
                                        width: calculateDimension(33, false, this.props.screenSize),
                                        height: calculateDimension(25, true, this.props.screenSize),
                                        borderRadius: 4, marginLeft: 10
                                    }}
                                >
                                    <Ripple style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }} onPress={this.goToHelpScreen}>
                                        <Icon name="help" color={'white'} size={15}/>
                                    </Ripple>
                                </ElevatedView>
                            </View>
                        </View>
                    }
                    navigator={this.props.navigator}
                    iconName="menu"
                    handlePressNavbarButton={this.handlePressNavbarButton}
                >
                </NavBarCustom>
                <View style={style.containerContent}>
                    <AnimatedListView
                        data={this.props.data || []}
                        dataCount={this.props.dataCount || 0}
                        dataType={'User'}
                        colors={this.state.riskColors}
                        filterText={filterText}
                        hasFilter={false}
                        style={[style.listViewStyle]}
                        componentContainerStyle={style.componentContainerStyle}
                        refreshing={this.state.refreshing}
                        onRefresh={this.handleOnRefresh}
                        onSearch={this.props.setSearchText}
                        onPressFilter={this.props.onPressFilter}
                        onPressView={this.handleCallUsers}
                        onPressAddExposure={this.props.onPressAddExposure}
                        onPressCenterButton={this.props.onPressCenterButton}
                        onPressMap={this.handleOnPressMap}
                        onPressName={this.props.onPressFullName}
                        onPressExposure={this.props.onPressExposure}
                        screen={translations.caseSingleScreen.title}
                        onEndReached={this.props.onEndReached}
                    />
                </View>

                <View style={styles.mapContainer}>
                    {
                        this.state.error === null ? (
                            <Popup
                                isVisible={this.state.isVisible}
                                onCancelPressed={() => this.setState({ isVisible: false })}
                                onAppPressed={() => this.setState({ isVisible: false })}
                                onBackButtonPressed={() => this.setState({ isVisible: false })}
                                options={{
                                    latitude: this.state.latitude,
                                    longitude: this.state.longitude,
                                    sourceLatitude: this.state.sourceLatitude,
                                    sourceLongitude: this.state.sourceLongitude,
                                    dialogTitle: getTranslation(translations.alertMessages.mapsPopupMessage, this.props.translation),
                                    cancelText: getTranslation(translations.alertMessages.cancelButtonLabel, this.props.translation),
                                    appsWhiteList: ['google-maps', 'apple-maps', 'waze', 'citymapper', 'uber', 'lyft', 'transit', 'yandex', 'moovit']
                                    //other possibilities: citymapper, uber, lyft, transit, yandex, moovit
                                }}
                            />
                        ) : console.log('this.state.error', this.state.error)
                    }
                </View>
            </ViewHOC>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handlePressNavbarButton = () => {
        this.props.navigator.toggleDrawer({
            side: 'left',
            animated: true,
            to: 'open'
        })
    };

    handleOnPressMap = (dataFromMapHandler) => {
        this.setState(prevState => ({
            latitude: get(dataFromMapHandler, 'latitude', 0),
            longitude: get(dataFromMapHandler, 'longitude', 0),
            sourceLatitude: get(dataFromMapHandler, 'sourceLatitude', 0),
            sourceLongitude: get(dataFromMapHandler, 'sourceLongitude', 0),
            isVisible: get(dataFromMapHandler, 'isVisible', false),
            error: get(dataFromMapHandler, 'error', null)
        }))
    };

    //Refresh list of users
    handleOnRefresh = () => {
        this.setState({
            refreshing: true
        }, () => {
            this.props.onRefresh();
        });
    };

    goToHelpScreen = () => {
        let pageAskingHelpFrom = 'users';
        this.props.navigator.showModal({
            screen: 'HelpScreen',
            animated: true,
            passProps: {
                pageAskingHelpFrom: pageAskingHelpFrom
            }
        });
    };

    handleCallUsers = (mainData) => {
        let primaryPhone = mainData.hasOwnProperty('telephoneNumbers') ? mainData.telephoneNumbers[translations.usersScreen.primaryPhone] : null;
        if ( primaryPhone ) {
            const args = {
                number: primaryPhone, // String value with the number to call
                prompt: false // Optional boolean property. Determines if the user should be prompt prior to the call
            };
            call(args).catch(console.error)
        }
    };
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the confcig directory
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
        backgroundColor: styles.appBackground,
        paddingBottom: 25
    },
    separatorComponentStyle: {
        height: 8
    },
    breadcrumbContainer: {
        flex: 0.8,
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },
});

function mapStateToProps(state) {
    return {
        user:           state.user,
        screenSize:     state.app.screenSize,
        syncState:      state.app.syncState,
        translation:    state.app.translation,
        loaderState:    state.app.loaderState,
        role:           state.role,
        referenceData:  state.referenceData
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        setLoaderState
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(enhanceListWithGetData(getUsersForOutbreakId, 'UsersScreen')(UsersScreen));