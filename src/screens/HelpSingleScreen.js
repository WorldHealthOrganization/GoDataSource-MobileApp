/**
 * Created by mobileclarisoft on 12/12/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {Alert, BackHandler, StyleSheet, View} from 'react-native';
import NavBarCustom from './../components/NavBarCustom';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import HelpSingleDetailsContainer from './../containers/HelpSingleDetailsContainer';
import Breadcrumb from './../components/Breadcrumb';
import {removeErrors} from './../actions/errors';
import {getTranslation} from './../utils/functions';
import translations from './../utils/translations'

class HelpSingleScreen extends Component {

    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
            item: this.props.item,
            isEditMode: false,
        };
        // Bind here methods, or at least don't declare methods in the render method
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }
    
    handleBackButtonClick() {
        this.props.navigator.pop();
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
            <View style={style.container}>
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
                                navigator={this.props.navigator}
                                onPress={this.handlePressBreadcrumb}
                            />
                        </View>
                    }
                    navigator={this.props.navigator}
                    iconName="menu"
                    handlePressNavbarButton={this.handlePressNavbarButton}
                />
               <HelpSingleDetailsContainer
                    isEditMode={this.state.isEditMode}
                    item={this.state.item}
                />
            </View>
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
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    breadcrumbContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
});

function mapStateToProps(state) {
    return {
        errors: state.errors,
        translation: state.app.translation,
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        removeErrors
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(HelpSingleScreen);