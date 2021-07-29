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

class QRScanScreen extends Component {

    constructor(props){
        super(props)
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
                        <Text style={[style.title, {marginLeft: 30}]}>
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
        translation: lodashGet(state, 'app.translation', [])
    };
}

export default connect(mapStateToProps)(QRScanScreen);