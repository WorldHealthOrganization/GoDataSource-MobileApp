/**
 * Created by florinpopa on 18/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import NavBarCustom from './../components/NavBarCustom';
import ElevatedView from 'react-native-elevated-view';
import Ripple from 'react-native-material-ripple';
import {Icon} from 'react-native-material-ui';
import {calculateDimension, createStackFromComponent, getTranslation} from './../utils/functions';
import {connect} from "react-redux";
import AnimatedListView from './../components/AnimatedListView';
import {getContactsOfContactsForOutbreakId} from './../actions/contactsOfContacts';
import ViewHOC from './../components/ViewHOC';
import {Popup} from 'react-native-map-link';
import translations from './../utils/translations';
import config from './../utils/config';
import Breadcrumb from './../components/Breadcrumb';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {pushNewEditScreen} from './../utils/screenTransitionFunctions';
import {enhanceListWithGetData} from './../components/higherOrderComponents/withListData';
import get from "lodash/get";
import {checkArrayAndLength} from "../utils/typeCheckingFunctions";
import {handleQRSearchTransition} from "../utils/screenTransitionFunctions";
import {bindActionCreators} from "redux";
import {setLoaderState} from "../actions/app";
import PermissionComponent from './../components/PermissionComponent';
import {PERMISSIONS_CONTACT_OF_CONTACT} from './../utils/constants';
import withPincode from "../components/higherOrderComponents/withPincode";
import {getContactsForOutbreakId} from "../actions/contacts";
import {compose} from "redux";
import {Navigation} from "react-native-navigation";
import {setDisableOutbreakChange} from "../actions/outbreak";
import constants from "../utils/constants";
import styles from './../styles';

class ContactsOfContactsScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            sortData: false,
            isVisible: false,
            latitude: '',
            longitude: '',
            sourceLatitude: '',
            sourceLongitude: '',
            error: null,
            refreshing: false,
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
        })


        const listener = {
            componentDidAppear: () => {
                this.props.setDisableOutbreakChange(false);
            }
        };
        // Register the listener to all events related to our component
        this.navigationListener = Navigation.events().registerComponentListener(listener, this.props.componentId);
    }


    componentWillUnmount() {
        this.navigationListener.remove();
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


        let contactTitle = []; contactTitle[0] = getTranslation(translations.contactsOfContactsScreen.contactsTitle, this.props.translation);

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
                                    key="contactKey"
                                    entities={contactTitle}
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
                                colors={this.state.riskColors}
                                loadMore={this.props.loadMore}
                                goToScreen={this.goToScreen}
                                dataType={'ContactOfContact'}
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
                                screen={translations.contactsOfContactsScreen.contactsTitle}
                                onEndReached={this.props.onEndReached}
                                hasFilter={true}
                            />
                        )}
                        permissionsList={[
                            PERMISSIONS_CONTACT_OF_CONTACT.contactsOfContactsAll,
                            PERMISSIONS_CONTACT_OF_CONTACT.contactsOfContactsList
                        ]}
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

    //Refresh list of contacts
    handleOnRefresh = () => {
        this.setState({
            refreshing: true
        }, () => {
            this.props.onRefresh();
        });
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

    handlePressNavbarButton = () => {
        Navigation.mergeOptions(this.props.componentId, {
            sideMenu: {
                left: {
                    visible: true,
                },
            },
        });
    };


    goToScreen = (contactData, index) => {
        Navigation.push(this.props.componentId,{
            component:{
                name: constants.appScreens.contactsOfContactsSingleScreen,
                passProps: {
                    isNew: false,
                    refresh: this.refresh,
                    contact: contactData,
                    index
                }
            }
        })
    }

    goToHelpScreen = () => {
        let pageAskingHelpFrom = 'contacts';
        Navigation.showModal(createStackFromComponent({
            name: 'HelpScreen',
            passProps: {
                pageAskingHelpFrom: pageAskingHelpFrom
            }
        }));
    };

    handleOnPressQRCode = () => {
        console.log('handleOnPressQRCode');

        Navigation.showModal(createStackFromComponent({
            name: 'QRScanScreen',
            passProps: {
                pushNewScreen: this.pushNewEditScreenLocal
            }
        }))
    };

    pushNewEditScreenLocal = (QRCodeInfo) => {
        console.log('pushNewEditScreen QRCodeInfo do with method from another side', QRCodeInfo);

        this.setState({
            loading: true
        }, () => {
            pushNewEditScreen(QRCodeInfo, this.props.componentId, get(this.props, 'user', null), get(this.props, 'outbreak', null), get(this.props, 'translation', null), (error, itemType, record) => {
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
        loaderState:    get(state, 'app.loaderState', false),
        referenceData:  get(state, 'referenceData', []),
        role:           get(state, 'role', []),
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

// export default connect(mapStateToProps, matchDispatchProps)(enhanceListWithGetData(getContactsOfContactsForOutbreakId       , 'ContactsOfContactsScreen')(ContactsOfContactsScreen));
export default compose(
    withPincode(),
    connect(mapStateToProps, matchDispatchProps),
    enhanceListWithGetData(getContactsOfContactsForOutbreakId, 'ContactsOfContactsScreen')
)(ContactsOfContactsScreen)