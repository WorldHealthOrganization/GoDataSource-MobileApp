'use strict';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {bindActionCreators} from "redux";
import NavBarCustom from './../components/NavBarCustom';
import styles from './../styles';

import {
  AppRegistry,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  View
} from 'react-native';

import QRCodeScanner from 'react-native-qrcode-scanner';

class QRScanScreen extends Component {
    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props){
        super(props)
    }

    onSuccess(e) {
        //  TO DO get data from e
        this.props.navigator.dismissModal(this.props.pushNewScreen(e))
    }

    render() {
        return (
            <View style = {style.container}>
                <NavBarCustom customTitle={
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            height: '100%'
                        }}
                    >
                        <Text style={[style.title, {marginLeft: 30}]}>Scan QR code</Text>
                    </View>
                }
                title={null}
                navigator={this.props.navigator}
                iconName="close"
                handlePressNavbarButton={this.handlePressNavbarButton}
                />
                <QRCodeScanner
                    // showMarker = {true}
                    onRead={this.onSuccess.bind(this)}
                    cameraStyle={style.cameraContainer}
                    // customMarker={<CustomMarker />}
                />
            </View>
        );
    }
    
    handlePressNavbarButton = () => {
        this.props.navigator.dismissModal()
    }
}

CustomMarker = () => {
    return (
        <View style={[style.markerContainer]}>
            <View style={[style.finder, {height: 250, width: 250}]}>
                <View
                    style={[
                    { borderColor: "green" },
                    style.topLeftEdge,
                    {
                        borderLeftWidth: 3,
                        borderTopWidth: 3
                    }
                    ]}
                />
                <View
                    style={[
                    { borderColor: "green" },
                    style.topRightEdge,
                    {
                        borderRightWidth: 3,
                        borderTopWidth: 3
                    }
                    ]}
                />
                <View
                    style={[
                    { borderColor: "green" },
                    style.bottomLeftEdge,
                    {
                        borderLeftWidth: 3,
                        borderBottomWidth: 3
                    }
                    ]}
                />
                <View
                    style={[
                    { borderColor: "green" },
                    style.bottomRightEdge,
                    {
                        borderRightWidth: 3,
                        borderBottomWidth: 3
                    }
                    ]}
                />
            </View>
      </View>
    )
}

const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    cameraContainer: {
        height: Dimensions.get('window').height
    },
    markerContainer: {
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    },
    finder: {
        alignItems: "center",
        justifyContent: "center"
    },
    topLeftEdge: {
        position: "absolute",
        top: 0,
        left: 0,
        width: 40,
        height: 20
    },
    topRightEdge: {
        position: "absolute",
        top: 0,
        right: 0,
        width: 40,
        height: 20
    },
    bottomLeftEdge: {
        position: "absolute",
        bottom: 0,
        left: 0,
        width: 40,
        height: 20
    },
    bottomRightEdge: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 40,
        height: 20
    },
    title: {
        fontSize: 17,
        fontFamily: 'Roboto-Medium',
    }   
});

function mapStateToProps(state) {
    return {
    };
}

function matchDispatchToProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchToProps)(QRScanScreen);