'use strict';
import React, {Component, useEffect} from 'react';
import {connect} from 'react-redux';
import NavBarCustom from '../components/NavBarCustom';
import {getTranslation} from '../utils/functions';
import translations from '../utils/translations';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import lodashGet from 'lodash/get';
import styles from '../styles';

import {Camera, useCameraDevice, useCodeScanner, useCameraPermission} from 'react-native-vision-camera';

function VisionQRScanner({onRead, style}) {
  // Reactive permission hook: re-renders this component as soon as the user
  // grants access, so the camera activates on the first visit. Using the
  // fire-and-forget Camera.requestCameraPermission() in componentDidMount did
  // not trigger a re-render, so on a fresh install the scanner stayed black
  // until the user backed out and re-entered (the "need to click twice" bug).
  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice('back');

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (codes.length > 0) {
        onRead({data: codes[0].value});
      }
    },
  });

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  if (!hasPermission || !device) return null;

  return (
    <Camera
      style={style}
      device={device}
      isActive={true}
      codeScanner={codeScanner}
    />
  );
}

class QRScanScreen extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    console.log('Render inside qr scan', style.container);
    return (
      <View style={style.container}>
        <NavBarCustom
          customTitle={
            <View style={style.titleBar}>
              <Text style={[style.title, {marginLeft: 24}]}>
                {getTranslation(
                  translations.qrScanScreen.title,
                  this.props.translation,
                )}
              </Text>
            </View>
          }
          title={null}
          componentId={this.props.componentId}
          iconName="close"
          handlePressNavbarButton={this.handlePressNavbarButton}
        />
        <VisionQRScanner
          style={style.cameraContainer}
          onRead={this.onSuccess.bind(this)}
        />
      </View>
    );
  }

  handlePressNavbarButton = () => {
    if (this.props.navigation) {
      this.props.navigation.goBack();
    }
  };

  onSuccess(e) {
    //  TO DO get data from e...
    console.log('Here we have some values for e: ', e);
    const {pushNewScreen, allowBack, skipEdit, isMultipleHub} =
      this.props.route.params || {};
    if (pushNewScreen) {
      pushNewScreen(e, allowBack, skipEdit, isMultipleHub);
    }
    if (this.props.navigation) {
      this.props.navigation.goBack();
    }
  }
}

const style = StyleSheet.create({
  container: {
    backgroundColor: styles.backgroundColor,
    flex: 1,
    zIndex: 10000,
  },
  cameraContainer: {
    height: Dimensions.get('window').height,
  },
  markerContainer: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  finder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topLeftEdge: {
    height: 20,
    left: 0,
    position: 'absolute',
    top: 0,
    width: 40,
  },
  topRightEdge: {
    height: 20,
    position: 'absolute',
    right: 0,
    top: 0,
    width: 40,
  },
  bottomLeftEdge: {
    bottom: 0,
    height: 20,
    left: 0,
    position: 'absolute',
    width: 40,
  },
  bottomRightEdge: {
    bottom: 0,
    height: 20,
    position: 'absolute',
    right: 0,
    width: 40,
  },
  titleBar: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    height: '100%',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
  },
});

function mapStateToProps(state) {
  return {
    translation: lodashGet(state, 'app.translation', []),
  };
}

export default connect(mapStateToProps)(QRScanScreen);
