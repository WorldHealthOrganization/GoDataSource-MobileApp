/**
 * Created by florinpopa on 04/07/2018.
 */
/**
 * Created by florinpopa on 14/06/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import {Icon} from 'react-native-material-ui';
import styles from './../styles';
import NavBarCustom from './../components/NavBarCustom';
import CalendarPicker from './../components/CalendarPicker';
import config from './../utils/config';
import Ripple from 'react-native-material-ripple';
import {connect} from "react-redux";
import AnimatedListView from './../components/AnimatedListView';
import Breadcrumb from './../components/Breadcrumb';
import ValuePicker from './../components/ValuePicker';
import {getFollowUpsForOutbreakId} from './../actions/followUps';
import ElevatedView from 'react-native-elevated-view';
import get from 'lodash/get';
import {calculateDimension, createDate, getTranslation} from './../utils/functions';
import ViewHOC from './../components/ViewHOC';
import {Popup} from 'react-native-map-link';
import translations from './../utils/translations'
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {pushNewEditScreen} from './../utils/screenTransitionFunctions';
import {enhanceListWithGetData} from './../components/higherOrderComponents/withListData';
import {checkArrayAndLength} from "../utils/typeCheckingFunctions";
import {bindActionCreators} from "redux";
import {setLoaderState} from './../actions/app';
import PermissionComponent from './../components/PermissionComponent';
import {handleQRSearchTransition} from "../utils/screenTransitionFunctions";

class FollowUpsScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            isVisible: false,
            latitude: 0,
            longitude: 0,
            sourceLatitude: 0,
            sourceLongitude: 0,
            error: null,
            calendarPickerOpen: false,

            followUpsColors: {}
        };
    };

    // Please add here the react lifecycle methods that you need

    componentDidUpdate(prevProps) {
        if (this.props.data && prevProps.data !== this.props.data) {
            this.setState({
                refreshing: false
            })
        }
    }

    componentDidMount = () => {
        let followUpsColors = {};
        let refData = checkArrayAndLength(this.props.referenceData) ? this.props.referenceData.filter((e) => {return e.categoryId === "LNG_REFERENCE_DATA_CONTACT_DAILY_FOLLOW_UP_STATUS_TYPE"}) : {};
        for (let i=0; i<refData.length; i++) {
            followUpsColors[refData[i].value] = refData[i].colorCode || styles.buttonGreen
        }
        this.setState({
            followUpsColors
        }
        )
    };

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        let {mainFilter, followUpFilter} = this.props;

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
        let filterText = filterNumbers === 0 ? `${getTranslation(translations.generalLabels.filterTitle, this.props.translation)}` : `(${filterNumbers})`

        let followUpTitle = []; followUpTitle[0] = getTranslation(translations.followUpsScreen.followUpsTitle, this.props.translation);

        return (
            <ViewHOC style={style.container} refresh={this.props.onRefresh}>
                <NavBarCustom
                    title={null}
                    customTitle={
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <View
                                style={[style.breadcrumbContainer]}>
                                <Breadcrumb
                                    key="followUpsKey"
                                    entities={followUpTitle}
                                    navigator={this.props.navigator}
                                />
                            </View>
                            <View style={{ flex: 0.15, marginRight: 10 }}>
                                <Ripple style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }} onPress={this.handleOnPressQRCode}>
                                    <MaterialCommunityIcons name="qrcode-scan" color={'black'} size={20} />
                                </Ripple>
                            </View>

                            <View style={{flex: 0.135 /*, marginRight: 10*/}}>
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
                                    }} onPress={this.goToHelpScreen}>
                                        <Icon name="help" color={'white'} size={15}/>
                                    </Ripple>
                                </ElevatedView>
                            </View>
                        </View>
                    }
                    navigator={this.props.navigator || null}
                    iconName="menu"
                    handlePressNavbarButton={this.handlePressNavbarButton}
                >
                    <CalendarPicker
                        width={calculateDimension(155, false, this.props.screenSize)}
                        height={calculateDimension(25, true, this.props.screenSize)}
                        onDayPress={this.handleDayPress}
                        value={get(followUpFilter, 'date', createDate(null).toLocaleString())}
                        pickerOpen={this.state.calendarPickerOpen}
                        openCalendarModal={this.openCalendarModal}
                    />
                    <ValuePicker
                        top={this.calculateTopForDropdown()}
                        onSelectValue={this.onSelectValue}
                        value={getTranslation(get(this.props, 'followUpFilter.statusId.value', translations.followUpsScreenStatusFilterValues.allValue), this.props.translation)}
                    />
                </NavBarCustom>
                <View style={style.containerContent}>
                    <PermissionComponent
                        render={() => (
                            <AnimatedListView
                                data={this.props.data || []}
                                dataCount={get(this.props, 'dataCount', 0)}
                                dataType={'FollowUp'}
                                colors={this.state.followUpsColors}
                                filterText={filterText}
                                style={[style.listViewStyle]}
                                componentContainerStyle={style.componentContainerStyle}
                                refreshing={this.state.refreshing}
                                onRefresh={this.handleOnRefresh}
                                onSearch={this.props.setSearchText}
                                onPressFilter={this.props.onPressFilter}
                                onPressView={this.props.onPressView}
                                onPressCenterButton={this.props.onPressCenterButton}
                                onPressAddExposure={this.props.onPressAddExposure}
                                onPressMap={this.handleOnPressMap}
                                onPressName={this.props.onPressFullName}
                                onPressExposure={this.props.onPressExposure}
                                screen={translations.followUpsScreen.followUpsTitle}
                                onEndReached={this.props.onEndReached}
                                hasFilter={true}
                            />
                        )}
                        permissionsList={['follow_up_all', 'follow_up_list']}
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
                                }}
                            />
                        ) : console.log('this.state.error', this.state.error)
                    }
                </View>
            </ViewHOC>
        );
    };

    // Please write here all the methods that are not react native lifecycle methods
    openCalendarModal = () => {
        this.setState({
            calendarPickerOpen: !this.state.calendarPickerOpen
        })
    };

    handlePressNavbarButton = () => {
        this.setState({
            calendarPickerOpen: false
        }, () => {
            this.props.navigator.toggleDrawer({
                side: 'left',
                animated: true,
                to: 'open'
            })
        })
    };

    handleOnRefresh = () => {
        this.setState({
            refreshing: true
        }, () => {
            this.props.onRefresh();
        });
    };

    calculateTopForDropdown = () => {
        return calculateDimension(98, true, this.props.screenSize);
    };

    onSelectValue = (value) => {
        this.props.setFollowUpFilter('statusId', value !== translations.followUpsScreenStatusFilterValues.allValue ? value : null)
    };

    handleDayPress = (day) => {
        this.props.setFollowUpFilter('date', day);
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

    goToHelpScreen = () => {
        let pageAskingHelpFrom = 'followUps';
        this.props.navigator.showModal({
            screen: 'HelpScreen',
            animated: true,
            passProps: {
                pageAskingHelpFrom: pageAskingHelpFrom
            }
        });
    };

    handleOnPressQRCode = () => {
        // console.log('handleOnPressQRCode');

        this.props.navigator.showModal({
            screen: 'QRScanScreen',
            animated: true,
            passProps: {
                pushNewScreen: this.pushNewEditScreenLocal
            }
        })
    };

    pushNewEditScreenLocal = (QRCodeInfo) => {
        // console.log('pushNewEditScreen QRCodeInfo do with method from another side', QRCodeInfo);

        this.setState({
            loading: true
        }, () => {
            pushNewEditScreen(QRCodeInfo, this.props.navigator, this.props && this.props.user ? this.props.user : null, this.props && this.props.translation ? this.props.translation : null, (error, itemType, record) => {
                this.setState({
                    loading: false
                }, () => {
                    handleQRSearchTransition(this.props.navigator, error, itemType, record, get(this.props, 'user', null), get(this.props, 'translation', null));
                });
            })
        });
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
        backgroundColor: styles.appBackground,
        paddingBottom: 25
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

mapStateToProps = (state) => {
    return {
        user: get(state, 'user', {}),
        screenSize: get(state, 'app.screenSize', config.designScreenSize),
        translation: get(state, 'app.translation', []),
        referenceData: get(state, 'referenceData', []),
        role: get(state, 'role', []),
        location:       get(state, 'locations.locationsList')
    };
};

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        setLoaderState
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(enhanceListWithGetData(getFollowUpsForOutbreakId, 'FollowUpsScreen')(FollowUpsScreen));