/**
 * Created by mobileclarisoft on 13/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import {Icon} from 'react-native-material-ui';
import NavBarCustom from './../components/NavBarCustom';
import {calculateDimension, createStackFromComponent, getTranslation} from './../utils/functions';
import Ripple from 'react-native-material-ripple';
import {connect} from "react-redux";
import {bindActionCreators, compose} from "redux";
import ElevatedView from 'react-native-elevated-view';
import Breadcrumb from './../components/Breadcrumb';
import {getUsersForOutbreakId} from './../actions/user';
import {setLoaderState} from './../actions/app';
import {setDisableOutbreakChange} from  './../actions/outbreak';
import AnimatedListView from './../components/AnimatedListView';
import ViewHOC from './../components/ViewHOC';
import translations from './../utils/translations';
import config from './../utils/config';
import {enhanceListWithGetData} from './../components/higherOrderComponents/withListData';
import call from 'react-native-phone-call';
import get from 'lodash/get';
import withPincode from './../components/higherOrderComponents/withPincode';
import {Navigation} from "react-native-navigation";
import styles from './../styles';

class UsersScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            refreshing: false
        };


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

    // Please add here the react lifecycle methods that you need
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
                        <View style={style.headerContainer}>
                            <View
                                style={[style.breadcrumbContainer]}>
                                <Breadcrumb
                                    key="userKey"
                                    entities={usersTitle}
                                    componentId={this.props.componentId}
                                />
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
                    <AnimatedListView
                        data={this.props.data || []}
                        dataCount={this.props.dataCount || 0}
                        dataType={'User'}
                        hasFilter={false}
                        style={[style.listViewStyle]}
                        componentContainerStyle={style.componentContainerStyle}
                        refreshing={this.state.refreshing}
                        onRefresh={this.handleOnRefresh}
                        onSearch={this.props.setSearchText}
                        onPressView={this.handleCallUsers}
                        screen={translations.usersScreen.usersTitle}
                    />
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
        Navigation.showModal(createStackFromComponent({
            name: 'HelpScreen',
            passProps: {
                pageAskingHelpFrom: pageAskingHelpFrom
            }
        }));
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
    containerContent: {
        backgroundColor: styles.screenBackgroundColor,
        flex: 1
    }
});

function mapStateToProps(state) {
    return {
        screenSize:     get(state, 'app.screenSize', config.designScreenSize),
        syncState:      get(state, 'app.syncState', null),
        translation:    get(state, 'app.translation', []),
        loaderState:    get(state, 'app.loaderState', false),
        location:       get(state, 'locations.locationsList'),
        teams:          get(state, 'teams', []),
        user:           get(state, 'user', {activeOutbreakId: null}),
        outbreak:       get(state, 'outbreak', {activeOutbreakId: null})
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        setLoaderState,
        setDisableOutbreakChange
    }, dispatch);
}

export default compose(
    connect(mapStateToProps, matchDispatchProps),
    withPincode(),
    enhanceListWithGetData(getUsersForOutbreakId, 'UsersScreen')
)(UsersScreen);