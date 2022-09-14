/**
 * Created by mobileclarisoft on 12/12/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {Alert, BackHandler, StyleSheet, View} from 'react-native';
import NavBarCustom from './../components/NavBarCustom';
import {connect} from "react-redux";
import {bindActionCreators, compose} from "redux";
import lodashGet from 'lodash/get';
import HelpSingleDetailsContainer from './../containers/HelpSingleDetailsContainer';
import Breadcrumb from './../components/Breadcrumb';
import {removeErrors} from './../actions/errors';
import {getTranslation} from './../utils/functions';
import translations from './../utils/translations';
import withPincode from './../components/higherOrderComponents/withPincode';
import ViewHOC from "../components/ViewHOC";
import {Navigation} from "react-native-navigation";
import {setDisableOutbreakChange} from "../actions/outbreak";
import styles from './../styles';

class HelpSingleScreen extends Component {


    constructor(props) {
        super(props);
        this.state = {
            item: this.props.item,
            isEditMode: false,
            loading: false
        };
        // Bind here methods, or at least don't declare methods in the render method
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }

    componentDidMount() {
        const listener = {
            componentDidAppear: () => {
                this.props.setDisableOutbreakChange(true);
            }
        };
        // Register the listener to all events related to our component
        this.navigationListener = Navigation.events().registerComponentListener(listener, this.props.componentId);
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    componentWillUnmount() {
        this.navigationListener.remove();
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }
    
    handleBackButtonClick() {
        Navigation.pop(this.props.componentId);
        return true;
    };

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        if (this.props.errors && this.props.errors.type && this.props.errors.message) {
            Alert.alert(this.props.errors.type, this.props.errors.message, [
                {
                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                    onPress: () => {
                        this.props.removeErrors();
                    }
                }
            ])
        }
        return (
            <ViewHOC style={style.container}
                     showLoader={this && this.state && this.state.loading}
                     loaderText={this.props && this.props.syncState ? 'Loading' : getTranslation(translations.loadingScreenMessages.loadingMsg, this.props.translation)}>
                <NavBarCustom
                    title={null}
                    customTitle={
                        <View
                            style={[style.breadcrumbContainer]}>
                            <Breadcrumb
                                entities={[
                                    getTranslation(translations.helpScreen.helpTitle, this.props.translation),
                                    getTranslation(translations.helpScreen.helpViewItemTitle, this.props.translation)
                                ]}
                                componentId={this.props.componentId}
                                onPress={this.handlePressBreadcrumb}
                            />
                        </View>
                    }
                    componentId={this.props.componentId}
                    iconName="menu"
                    handlePressNavbarButton={this.handlePressNavbarButton}
                />
               <HelpSingleDetailsContainer
                    isEditMode={this.state.isEditMode}
                    item={this.state.item}
                />
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
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        backgroundColor: styles.backgroundColor,
        flex: 1
    },
    breadcrumbContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
});

function mapStateToProps(state) {
    return {
        errors: lodashGet(state, 'errors', null),
        translation: lodashGet(state, 'app.translation', []),
        syncState: lodashGet(state, 'app.syncState', null)
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        removeErrors,
        setDisableOutbreakChange
    }, dispatch);
}

export default compose(
    withPincode(),
    connect(mapStateToProps, matchDispatchProps)
)(HelpSingleScreen);