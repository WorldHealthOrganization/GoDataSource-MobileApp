import Navigation from '../navigation/wixNavigationShim';
/**
 * Created by mobileclarisoft on 13/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {Icon} from 'react-native-material-ui';
import NavBarCustom from '../components/NavBarCustom';
import {calculateDimension, createStackFromComponent, getTranslation} from '../utils/functions';
import Ripple from 'react-native-material-ripple';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import ElevatedView from 'react-native-elevated-view';
import Breadcrumb from '../components/Breadcrumb';
import {getCasesForOutbreakId} from '../actions/cases';
import {setLoaderState} from '../actions/app';
import {setDisableOutbreakChange} from "../actions/outbreak";
import AnimatedListView from '../components/AnimatedListView';
import ViewHOC from '../components/ViewHOC';
import translations from '../utils/translations';
import config from '../utils/config';
import {pushNewEditScreen} from '../utils/screenTransitionFunctions';
import {enhanceListWithGetData} from '../components/higherOrderComponents/withListData';
import get from "lodash/get";
import {checkArray, checkArrayAndLength} from "../utils/typeCheckingFunctions";
import {Popup} from 'react-native-map-link';
import PermissionComponent from '../components/PermissionComponent';
import {handleQRSearchTransition} from "../utils/screenTransitionFunctions";
import withPincode from "../components/higherOrderComponents/withPincode";
import {getContactsForOutbreakId} from "../actions/contacts";
import {compose} from "redux";
import constants from "../utils/constants";
import styles from '../styles';

class CasesScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            sortData: false,
            isVisible: false,
            latitude: '',
            longitude: '',
            sourceLatitude: '',
            sourceLongitude: '',
            error: null,
            riskColors: {}
        };
    }

    // Please add here the react lifecycle methods that you need
    componentDidMount() {
        let riskColors = {};
        let refData = checkArrayAndLength(get(this.props, 'referenceData', null)) !== null ? this.props.referenceData.filter((e) => {return e.categoryId.includes("RISK_LEVEL")}) : [];
        for (let i=0; i<refData.length; i++) {
            riskColors[refData[i].value] = refData[i].colorCode || 'black'
        }
        this.setState({
            riskColors: riskColors
        });

        // Replaced Navigation listener with React Navigation listener
        if (this.props.navigation) {
            this.focusUnsubscribe = this.props.navigation.addListener('focus', () => {
                this.props.setDisableOutbreakChange(false);
            });
        }
    }

    componentWillUnmount() {
        if (this.focusUnsubscribe) {
            this.focusUnsubscribe();
        }
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
            Object.keys(mainFilter).forEach(key => {
                if(checkArrayAndLength(mainFilter[key])){
                    filterNumbers++;
                } else if(mainFilter[key] !== null && !Array.isArray(mainFilter[key])){
                    filterNumbers++;
                }
            })
        }
        let filterText = filterNumbers === 0 ? `${getTranslation(translations.generalLabels.filterTitle, this.props.translation)}` : `(${filterNumbers})`;


        let caseTitle = []; caseTitle[0] = getTranslation(translations.casesScreen.casesTitle, this.props.translation);
        return (
            <ViewHOC style={style.container}
                     showLoader={(this.props && this.props.loaderState) || (this.state && this.state.loading)}
                     loaderText={this.props && this.props.syncState ? 'Loading' : getTranslation(translations.loadingScreenMessages.loadingMsg, this.props.translation)}
                     refresh={this.props.onRefresh}
            >
                <NavBarCustom
                    title={null}
                    customTitle={
                        <View style={style.headerContainer}>
                            <View
                                style={[style.breadcrumbContainer]}>
                                <Breadcrumb
                                    key="caseKey"
                                    entities={caseTitle}
                                    componentId={this.props.componentId}
                                />
                            </View>
                            <View style={style.headerButtonSpacing}>
                                <Ripple style={style.headerButtonInner} onPress={this.handleOnPressQRCode}>
                                    <Icon name="center-focus-strong" color={styles.textColor} size={24} />
                                </Ripple>
                            </View>

                            <View style={style.headerButtonSpacing}>
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

                            <PermissionComponent
                                render={() => (
                                    <View>
                                        <ElevatedView
                                            elevation={0}
                                            style={[
                                                style.addCaseButton, 
                                                {
                                                    width: calculateDimension(30, false, this.props.screenSize),
                                                    height: calculateDimension(30, true, this.props.screenSize)
                                                }
                                            ]}
                                        >
                                            <Ripple style={style.headerButtonInner} onPress={this.handleOnPressAddCase}>
                                                <Icon name="add" color={styles.backgroundColor} size={18} />
                                            </Ripple>
                                        </ElevatedView>
                                    </View>
                                )}
                                permissionsList={['case_all', 'case_create']}
                            />
                        </View>
                    }
                    componentId={this.props.componentId}
                    iconName="menu"
                    handlePressNavbarButton={this.handlePressNavbarButton}
                >
                </NavBarCustom>

                <View style={style.containerContent}>
                    <PermissionComponent
                        render={() => (
                            <AnimatedListView
                                data={this.props.data || []}
                                dataCount={this.props.dataCount || 0}
                                dataType={'Case'}
                                extraData={this.props.outbreak?._id}
                                colors={this.state.riskColors}
                                loadMore={this.props.loadMore}
                                filterText={filterText}
                                style={[style.listViewStyle]}
                                componentContainerStyle={style.componentContainerStyle}
                                refreshing={this.state.refreshing}
                                onRefresh={this.handleOnRefresh}
                                onSearch={this.props.setSearchText}
                                onPressFilter={this.props.onPressFilter}
                                onPressView={this.props.onPressView}
                                onPressAddExposure={this.props.onPressAddExposure}
                                onPressCenterButton={this.props.onPressCenterButton}
                                goToScreen={this.goToScreen}
                                onPressMap={this.handleOnPressMap}
                                onPressName={this.props.onPressFullName}
                                onPressExposure={this.props.onPressExposure}
                                screen={translations.caseSingleScreen.title}
                                onEndReached={this.props.onEndReached}
                                hasFilter={true}
                            />
                        )}
                        permissionsList={['case_all', 'case_list']}
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
        if (this.props.navigation) {
            this.props.navigation.openDrawer();
        }
    };

    goToScreen = (caseData, index) => {
        if (this.props.navigation) {
            this.props.navigation.navigate(constants.appScreens.caseSingleScreen, {
                isNew: false,
                refresh: this.refresh,
                case: caseData,
                index
            });
        }
    }

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

    //Refresh list of cases
    handleOnRefresh = () => {
        this.setState({
            refreshing: true
        }, () => {
            this.props.onRefresh();
        });
    };

    //Create new case in CaseSingleScreen
    handleOnPressAddCase = () => {
        if (this.props.navigation) {
            this.props.navigation.navigate('CaseSingleScreen', {
                isNew: true,
                refresh: this.props.onRefresh
            });
        }
    };

    goToHelpScreen = () => {
        let pageAskingHelpFrom = 'cases';
        if (this.props.navigation) {
            // Assuming HelpScreen is a screen we can navigate to
            this.props.navigation.navigate('HelpScreen', {
                pageAskingHelpFrom: pageAskingHelpFrom
            });
        }
    };

    handleOnPressQRCode = () => {
        // console.log('handleOnPressQRCode');
        if (this.props.navigation) {
             this.props.navigation.navigate('QRScanScreen', {
                pushNewScreen: this.pushNewEditScreenLocal
            });
        }
    };

    pushNewEditScreenLocal = (QRCodeInfo) => {
        // console.log('pushNewEditScreen QRCodeInfo do with method from another side', QRCodeInfo);

        this.setState({
            loading: true
        }, () => {
            const componentId = this.props.componentId; // This might be used in logic, but for navigation we use props.navigation
            // Note: pushNewEditScreen utils function likely uses Navigation.push. 
            // We should refactor pushNewEditScreen or modify how it's called.
            // For now, I'll pass props.navigation if possible or handle the callback logic here.
            
            // FIXME: pushNewEditScreen is an external util that might do navigation. 
            // We need to check src/utils/screenTransitionFunctions.js
            
            pushNewEditScreen(QRCodeInfo, componentId, this.props && this.props.user ? this.props.user : null, this.props.outbreak, this.props && this.props.translation ? this.props.translation : null, (error, itemType, record) => {
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
// make a global style in the confcig directory
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
    addCaseButton: {
        backgroundColor: styles.primaryColor,
        borderRadius: 4
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
    }
});

function mapStateToProps(state) {
    return {
        user:           get(state, 'user', null),
        screenSize:     get(state, 'app.screenSize', config.designScreenSize),
        syncState:      get(state, 'app.syncState', null),
        translation:    get(state, 'app.translation', []),
        loaderState:    get(state, 'app.loaderState', null),
        role:           get(state, 'role', []),
        referenceData:  get(state, 'referenceData', []),
        location:       get(state, 'locations.locationsList'),
        outbreak:       get(state, 'outbreak', null)
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        setLoaderState,
        setDisableOutbreakChange
    }, dispatch);
}

// export default connect(mapStateToProps, matchDispatchProps)(enhanceListWithGetData(getCasesForOutbreakId, 'CasesScreen')(CasesScreen));
import {withNavigationParams} from '../components/higherOrderComponents/withNavigationParams';

export default compose(
    withNavigationParams,
    withPincode(),
    connect(mapStateToProps, matchDispatchProps),
    enhanceListWithGetData(getCasesForOutbreakId, 'CasesScreen')
)(CasesScreen)