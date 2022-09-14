'use strict';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import NavBarCustom from './../components/NavBarCustom';
import {getTranslation} from './../utils/functions';
import translations from './../utils/translations';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import lodashGet from 'lodash/get';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {Navigation} from "react-native-navigation";
import styles from './../styles';

class QRScanScreen extends Component {

    constructor(props){
        super(props)
    }

    render() {
        console.log("Render inside qr scan", style.container);
        return (
            <View style = {style.container}>
                <NavBarCustom customTitle={
                    <View style={style.titleBar}>
                        <Text style={[style.title, {marginLeft: 24}]}>
                            {getTranslation(translations.qrScanScreen.title, this.props.translation)}
                        </Text>
                    </View>
                }
                    title={null}
                    componentId={this.props.componentId}
                    iconName="close"
                    handlePressNavbarButton={this.handlePressNavbarButton}
                />
                <QRCodeScanner
                    showMarker={true}
                    onRead={this.onSuccess.bind(this)}
                    cameraStyle={style.cameraContainer}
                    // customMarker={<CustomMarker />}
                />
            </View>
        );
    }

    handlePressNavbarButton = () => {
        Navigation.dismissModal(this.props.componentId)
    }

    onSuccess(e) {
        //  TO DO get data from e...
        console.log('Here we have some values for e: ', e);
        this.props.pushNewScreen(e, this.props.allowBack, this.props.skipEdit, this.props.isMultipleHub);
        Navigation.dismissModal(this.props.componentId);
    }
}

const style = StyleSheet.create({
    container: {
        backgroundColor: styles.backgroundColor,
        flex: 1,
        zIndex: 10000
    },
    cameraContainer: {
        height: Dimensions.get('window').height
    },
    markerContainer: {
        alignItems: "center",
        bottom: 0,
        justifyContent: "center",
        left: 0,
        position: "absolute",
        right: 0,
        top: 0
    },
    finder: {
        alignItems: "center",
        justifyContent: "center"
    },
    topLeftEdge: {
        height: 20,
        left: 0,
        position: "absolute",
        top: 0,
        width: 40
    },
    topRightEdge: {
        height: 20,
        position: "absolute",
        right: 0,
        top: 0,
        width: 40
    },
    bottomLeftEdge: {
        bottom: 0,
        height: 20,
        left: 0,
        position: "absolute",
        width: 40
    },
    bottomRightEdge: {
        bottom: 0,
        height: 20,
        position: "absolute",
        right: 0,
        width: 40
    },
    titleBar: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        height: '100%',
        justifyContent: 'space-between'
    },
    title: {
        fontFamily: 'Roboto-Medium',
        fontSize: 16
    }
});

function mapStateToProps(state) {
    return {
        translation: lodashGet(state, 'app.translation', [])
    };
}

export default connect(mapStateToProps)(QRScanScreen);