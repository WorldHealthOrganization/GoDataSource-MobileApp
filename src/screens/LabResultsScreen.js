/**
 * Created by mobileclarisoft on 13/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {Icon} from 'react-native-material-ui';
import styles from './../styles';
import NavBarCustom from './../components/NavBarCustom';
import {calculateDimension, createStackFromComponent, getTranslation} from './../utils/functions';
import Ripple from 'react-native-material-ripple';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import ElevatedView from 'react-native-elevated-view';
import Breadcrumb from './../components/Breadcrumb';
import {setLoaderState} from './../actions/app';
import AnimatedListView from './../components/AnimatedListView';
import ViewHOC from './../components/ViewHOC';
import translations from './../utils/translations';
import config from './../utils/config';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {pushNewEditScreen} from './../utils/screenTransitionFunctions';
import {enhanceListWithGetData} from './../components/higherOrderComponents/withListData';
import get from "lodash/get";
import {checkArrayAndLength} from "../utils/typeCheckingFunctions";
import {Popup} from 'react-native-map-link';
import PermissionComponent from './../components/PermissionComponent';
import {handleQRSearchTransition} from "../utils/screenTransitionFunctions";
import withPincode from "../components/higherOrderComponents/withPincode";
import {getContactsForOutbreakId} from "../actions/contacts";
import {compose} from "redux";
import {Navigation} from "react-native-navigation";
import {getAllLabResultsForOutbreak} from "../actions/labResults";

class LabResultsScreen extends Component {

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
        console.log("Comp did mount", this.props.filtersToAdd);
        if(this.props.filtersToAdd){
            this.props.setMainFilter(Object.assign(this.props.mainFilter, this.props.filtersToAdd));
        }
        let riskColors = {};
        let refData = checkArrayAndLength(get(this.props, 'referenceData', null)) !== null ? this.props.referenceData.filter((e) => {return e.categoryId.includes("RISK_LEVEL")}) : [];
        for (let i=0; i<refData.length; i++) {
            riskColors[refData[i].value] = refData[i].colorCode || 'black'
        }
        this.setState({
            riskColors: riskColors
        });
        // this.props.setMainFilter()
    }

    componentDidUpdate(prevProps) {
        console.log("Lab results update", prevProps?.data.length, this.props.data?.length)
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
        console.log("Lab results prop important", this.props.data?.length);

        let filterNumbers = 0;
        if (mainFilter) {
            if (get(mainFilter, 'type', null) !== null) {
                ++filterNumbers
            }
            if(get(mainFilter, 'personId', null) !== null){
                ++filterNumbers
            }
        }
        let filterText = filterNumbers === 0 ? `${getTranslation(translations.generalLabels.filterTitle, this.props.translation)}` : `(${filterNumbers})`;


        let labResultTitle = []; labResultTitle[0] = getTranslation(translations.labResultsScreen.labResultsTitle, this.props.translation);
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
                                    key="labResultKey"
                                    entities={labResultTitle}
                                    componentId={this.props.componentId}
                                />
                            </View>
                            <View style={{flex: 0.15, marginRight: 10}}>
                                <Ripple style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }} onPress={this.handleOnPressQRCode}>
                                    <MaterialCommunityIcons name="qrcode-scan" color={'black'} size={20}/>
                                </Ripple>
                            </View>

                            <View style={{flex: 0.15, marginRight: 10}}>
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

                            {/*<PermissionComponent*/}
                            {/*    render={() => (*/}
                            {/*        <View style={{flex: 0.15}}>*/}
                            {/*            <ElevatedView*/}
                            {/*                elevation={3}*/}
                            {/*                style={{*/}
                            {/*                    backgroundColor: styles.buttonGreen,*/}
                            {/*                    width: calculateDimension(33, false, this.props.screenSize),*/}
                            {/*                    height: calculateDimension(25, true, this.props.screenSize),*/}
                            {/*                    borderRadius: 4*/}
                            {/*                }}*/}
                            {/*            >*/}
                            {/*                <Ripple style={{*/}
                            {/*                    flex: 1,*/}
                            {/*                    justifyContent: 'center',*/}
                            {/*                    alignItems: 'center'*/}
                            {/*                }} onPress={this.handleOnPressAddLabResult}>*/}
                            {/*                    <Icon name="add" color={'white'} size={15}/>*/}
                            {/*                </Ripple>*/}
                            {/*            </ElevatedView>*/}
                            {/*        </View>*/}
                            {/*    )}*/}
                            {/*    permissionsList={['labResult_all', 'labResult_create']}*/}
                            {/*/>*/}
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
                                dataType={'LabResult'}
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
                                onPressCenterButton={this.props.onPressCenterButton}
                                onPressMap={this.handleOnPressMap}
                                onPressName={this.props.onPressFullName}
                                onPressExposure={this.props.onPressExposure}
                                screen={translations.labResultsSingleScreen.title}
                                onEndReached={this.props.onEndReached}
                                hasFilter={true}
                            />
                        )}
                        // permissionsList={['labResult_all', 'labResult_list']}
                    />
                </View>
                {
                    this.props.loadMore ? (
                        <View style={
                            {
                                width: '100%',
                                height: 60,
                                backgroundColor: styles.appBackground,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <ActivityIndicator animating size={'large'} />
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
        Navigation.mergeOptions(this.props.componentId, {
            sideMenu: {
                left: {
                    visible: true,
                },
            },
        });
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

    //Refresh list of lab results
    handleOnRefresh = () => {
        this.setState({
            refreshing: true
        }, () => {
            this.props.onRefresh();
        });
    };


    goToHelpScreen = () => {
        let pageAskingHelpFrom = 'labResults';
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
            pushNewEditScreen(QRCodeInfo, this.props.componentId, this.props && this.props.user ? this.props.user : null, this.props.outbreak, this.props && this.props.translation ? this.props.translation : null, (error, itemType, record) => {
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
        setLoaderState
    }, dispatch);
}

// export default connect(mapStateToProps, matchDispatchProps)(enhanceListWithGetData(getCasesForOutbreakId, 'LabResultsScreen')(LabResultsScreen));
export default compose(
    withPincode(),
    connect(mapStateToProps, matchDispatchProps),
    enhanceListWithGetData(getAllLabResultsForOutbreak, 'LabResultsScreen')
)(LabResultsScreen)