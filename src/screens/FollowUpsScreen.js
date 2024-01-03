/**
 * Created by florinpopa on 04/07/2018.
 */
/**
 * Created by florinpopa on 14/06/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {Icon} from 'react-native-material-ui';
import NavBarCustom from './../components/NavBarCustom';
import CalendarPicker from './../components/CalendarPicker';
import config from './../utils/config';
import Ripple from 'react-native-material-ripple';
import {connect} from "react-redux";
import {compose} from 'redux';
import AnimatedListView from './../components/AnimatedListView';
import Breadcrumb from './../components/Breadcrumb';
import ValuePicker from './../components/ValuePicker';
import {getFollowUpsForOutbreakId} from './../actions/followUps';
import ElevatedView from 'react-native-elevated-view';
import get from 'lodash/get';
import {calculateDimension, createDate, createStackFromComponent, getTranslation} from './../utils/functions';
import ViewHOC from './../components/ViewHOC';
import {Popup} from 'react-native-map-link';
import translations from './../utils/translations'
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {pushNewEditScreen} from './../utils/screenTransitionFunctions';
import {enhanceListWithGetData} from './../components/higherOrderComponents/withListData';
import {checkArrayAndLength} from "../utils/typeCheckingFunctions";
import {bindActionCreators} from "redux";
import {setLoaderState} from './../actions/app';
import {setDisableOutbreakChange} from './../actions/outbreak'
import PermissionComponent from './../components/PermissionComponent';
import {handleQRSearchTransition} from "../utils/screenTransitionFunctions";
import withPincode from './../components/higherOrderComponents/withPincode';
import {Navigation} from "react-native-navigation";
import styles from './../styles';

class FollowUpsScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            isVisible: false,
            latitude: '',
            longitude: '',
            sourceLatitude: '',
            sourceLongitude: '',
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
        if(!prevProps.referenceData && Object.keys(this.state.followUpsColors).length === 0 && this.props.referenceData ){
            this.setColors();
        }
    }

    componentDidMount = () => {
        this.setColors();

        const listener = {
            componentDidAppear: () => {
                this.props.setDisableOutbreakChange(false);
            }
        };
        // Register the listener to all events related to our component
        this.navigationListener = Navigation.events().registerComponentListener(listener, this.props.componentId);
    };

    componentWillUnmount() {
        this.navigationListener.remove();
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        let {mainFilter, followUpFilter} = this.props;

        let filterNumbers = 0;
        if (mainFilter) {
            Object.keys(mainFilter).forEach(key => {
                if(checkArrayAndLength(mainFilter[key])){
                    filterNumbers++;
                } else if(mainFilter[key] !== null && !Array.isArray(mainFilter[key])){
                    filterNumbers++;
                }
            })
        }
        let filterText = filterNumbers === 0 ? `${getTranslation(translations.generalLabels.filterTitle, this.props.translation)}` : `(${filterNumbers})`

        let followUpTitle = []; followUpTitle[0] = getTranslation(translations.followUpsScreen.followUpsTitle, this.props.translation);

        return (
            <ViewHOC style={style.container} refresh={this.props.onRefresh}>
                <NavBarCustom
                    title={null}
                    customTitle={
                        <View style={style.headerContainer}>
                            <View
                                style={[style.breadcrumbContainer]}>
                                <Breadcrumb
                                    key="followUpsKey"
                                    entities={followUpTitle}
                                    componentId={this.props.componentId}
                                />
                            </View>
                            <View style={style.headerButtonSpacing}>
                                <Ripple style={style.headerButtonInner} onPress={this.handleOnPressQRCode}>
                                    <MaterialCommunityIcons name="qrcode-scan" color={styles.textColor} size={24} />
                                </Ripple>
                            </View>
                            <View>
                                <ElevatedView
                                    elevation={0}
                                    style={[
                                        style.headerButton,
                                        {
                                            width: calculateDimension(30, false, this.props.screenSize),
                                            height: calculateDimension(30, true, this.props.screenSize)
                                        }
                                    ]}
                                >
                                    <Ripple style={style.headerButtonInner} onPress={this.goToHelpScreen}>
                                        <Icon name="help" color={styles.textColor} size={18} />
                                    </Ripple>
                                </ElevatedView>
                            </View>
                        </View>
                    }
                    componentId={this.props.componentId || null}
                    iconName="menu"
                    handlePressNavbarButton={this.handlePressNavbarButton}
                >
                    <View style={style.followUpTopBar}>
                        <CalendarPicker
                            width={calculateDimension(164, false, this.props.screenSize)}
                            height={calculateDimension(30, true, this.props.screenSize)}
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
                    </View>
                </NavBarCustom>
                <View style={styles.lineStyle} />
                <View style={style.containerContent}>
                    <PermissionComponent
                        render={() => (
                            <AnimatedListView
                                data={this.props.data || []}
                                dataCount={get(this.props, 'dataCount', 0)}
                                dataType={'FollowUp'}
                                colors={this.state.followUpsColors}
                                loadMore={this.props.loadMore}
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
                {
                    this.props.loadMore ? (
                        <View style={style.loadMore}>
                            <ActivityIndicator animating size={'small'} color={styles.backgroundColor} />
                        </View>
                    ) : (null)
                }

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

    setColors = () =>{

        let followUpsColors = {};
        let refData = checkArrayAndLength(this.props.referenceData) ? this.props.referenceData.filter((e) => {return e.categoryId === "LNG_REFERENCE_DATA_CONTACT_DAILY_FOLLOW_UP_STATUS_TYPE"}) : {};
        for (let i=0; i<refData.length; i++) {
            followUpsColors[refData[i].value] = refData[i].colorCode || styles.primaryColor
        }
        this.setState({
                followUpsColors
            }
        )
    }

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
            Navigation.mergeOptions(this.props.componentId, {
                sideMenu: {
                    left: {
                        visible: true,
                    },
                },
            });
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
            latitude: get(dataFromMapHandler, 'latitude', ''),
            longitude: get(dataFromMapHandler, 'longitude', ''),
            sourceLatitude: get(dataFromMapHandler, 'sourceLatitude', ''),
            sourceLongitude: get(dataFromMapHandler, 'sourceLongitude', ''),
            isVisible: get(dataFromMapHandler, 'isVisible', false),
            error: get(dataFromMapHandler, 'error', null)
        }))
    };

    goToHelpScreen = () => {
        let pageAskingHelpFrom = 'followUps';
        Navigation.showModal(createStackFromComponent({
            name: 'HelpScreen',
            passProps: {
                pageAskingHelpFrom: pageAskingHelpFrom
            }
        }));
    };

    handleOnPressQRCode = () => {
        // console.log('handleOnPressQRCode');

        Navigation.showModal(createStackFromComponent({
            name: 'QRScanScreen',
            passProps: {
                pushNewScreen: this.pushNewEditScreenLocal
            }
        }))
    };

    pushNewEditScreenLocal = (QRCodeInfo) => {
        // console.log('pushNewEditScreen QRCodeInfo do with method from another side', QRCodeInfo);

        this.setState({
            loading: true
        }, () => {
            pushNewEditScreen(QRCodeInfo, this.props.componentId, this.props && this.props.user ? this.props.user : null, this.props && this.props.outbreak ? this.props.outbreak : null, this.props && this.props.translation ? this.props.translation : null, (error, itemType, record) => {
                this.setState({
                    loading: false
                }, () => {
                    handleQRSearchTransition(this.props.componentId, error, itemType, record, get(this.props, 'user', null), get(this.props, 'outbreak', null), get(this.props, 'translation', null), get(this.props, 'role', []), this.props.refresh);
                });
            })
        });
    };
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flex: 1
    },
    headerContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: 16
    },
    breadcrumbContainer: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },
    headerButton: {
        backgroundColor: styles.disabledColor,
        borderRadius: 4
    },
    headerButtonInner: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center'
    },
    headerButtonSpacing: {
        marginRight: 8
    },
    followUpTopBar: {
        alignItems: 'center',
        backgroundColor: styles.backgroundColor,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: -1,
        paddingHorizontal: 16,
        paddingVertical: 5
    },
    containerContent: {
        backgroundColor: styles.screenBackgroundColor,
        flex: 1
    },
    loadMore: {
        alignItems: 'center',
        backgroundColor: styles.primaryColor,
        height: 30,
        justifyContent: 'center',
        width: '100%'
    },
    mapContainer: {
        alignItems: 'center',
        backgroundColor: styles.screenBackgroundColor,
        flex: 1,
        justifyContent: 'center'
    },
    listViewStyle: {},
    componentContainerStyle: {},
    emptyComponent: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    emptyComponentTextView: {
        color: styles.secondaryColor,
        fontFamily: 'Roboto-Light',
        fontSize: 16
    },
    buttonEmptyListText: {
        color: styles.secondaryColor,
        fontFamily: 'Roboto-Regular',
        fontSize: 16
    }
});

mapStateToProps = (state) => {
    return {
        user: get(state, 'user', {}),
        screenSize: get(state, 'app.screenSize', config.designScreenSize),
        translation: get(state, 'app.translation', []),
        referenceData: get(state, 'referenceData', []),
        role: get(state, 'role', []),
        location:       get(state, 'locations.locationsList'),
        teams: get(state, 'teams'),
        outbreak: get(state, 'outbreak')
    };
};

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        setLoaderState,
        setDisableOutbreakChange
    }, dispatch);
}

export default compose(
    connect(mapStateToProps, matchDispatchProps),
    withPincode(),
    enhanceListWithGetData(getFollowUpsForOutbreakId, 'FollowUpsScreen')
)(FollowUpsScreen)

// export default connect(mapStateToProps, matchDispatchProps)(enhanceListWithGetData(getFollowUpsForOutbreakId, 'FollowUpsScreen')(FollowUpsScreen));