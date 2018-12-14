/**
 * Created by florinpopa on 15/10/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import styles from './../styles';
import NavBarCustom from './../components/NavBarCustom';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import ViewHOC from './../components/ViewHOC';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';

class MapScreen extends Component {
    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
        };

        // Bind here methods, or at least don't declare methods in the render method
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    // Please add here the react lifecycle methods that you need

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        const initialRegion = {
            latitude: this.props.contactPlaceOfResidence.latitude, 
            longitude: this.props.contactPlaceOfResidence.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        }

        return (
            <ViewHOC style={style.container}
                     showLoader={false}
                     loaderText={''}>
                <NavBarCustom
                    title="Map"
                    navigator={this.props.navigator}
                    iconName="close"
                    handlePressNavbarButton={this.handlePressNavbarButton}
                />
                <View style={{flex: 1}}>
                    <MapView
                        initialRegion={initialRegion}
                        style={StyleSheet.absoluteFillObject}
                    >
                            <Marker
                                coordinate={this.props.contactPlaceOfResidence}
                                title={'Test title'}
                                />
                     </MapView>
                </View>
            </ViewHOC>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handlePressNavbarButton = () => {
        this.props.navigator.dismissModal();
    };

    //Navigator event
    onNavigatorEvent = (event) => {
        if (event.type === 'DeepLink') {
            console.log("###");
            if (event.link.includes('Navigate')) {
                let linkComponents = event.link.split('/');
                console.log("### linkComponents: ", linkComponents);
                if (linkComponents.length > 0) {
                    let screenToSwitchTo = null;
                    let addScreen = null;
                    switch(linkComponents[1]) {
                        case '0':
                            screenToSwitchTo = 'FollowUpsScreen';
                            break;
                        case '1':
                            screenToSwitchTo = "ContactsScreen";
                            break;
                        case '2':
                            screenToSwitchTo = "CasesScreen";
                            break;
                        case '2-add':
                            screenToSwitchTo = "CasesScreen";
                            addScreen = "CaseSingleScreen";
                            break;
                        case 'help':
                            screenToSwitchTo = "HelpScreen";
                            break;
                        default:
                            screenToSwitchTo = "FollowUpsScreen";
                            break;
                    }
                    this.props.navigator.resetTo({
                        screen: screenToSwitchTo,
                        animated: true
                    });
                    if(addScreen) {
                        this.props.navigator.push({
                            screen: addScreen,
                            animated: true,
                            animationType: 'fade',
                            passProps: {
                                item: {},
                                filter: null
                            }
                        })
                    }
                }
            }
        }
    };
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
});

function mapStateToProps(state) {
    return {
        user: state.user
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(MapScreen);