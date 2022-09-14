/**
 * Created by florinpopa on 06/08/2018.
 */
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import styles from './../styles';

CustomMarker = React.memo(({markerStyle, style, currentValue, markerColor}) => {
    let formMarkerStyle = {};
    if(Array.isArray(markerStyle)){
        formMarkerStyle = markerStyle[1];
    }
    return (
        <View style={[style, styleLocal.container]}>
            <Text style={[styleLocal.customMarkerText, {color: markerColor || 'black'}]}>
                {currentValue}
            </Text>

            <View style={[styleLocal.customMarkerView, markerStyle]}/>
        </View>
)});

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const styleLocal = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    customMarkerText: {
        alignSelf: 'center',
        fontFamily: 'Roboto-Medium',
        fontSize: 14,
        width: '100%'
    },
    customMarkerView: {
        backgroundColor: styles.primaryColor,
        borderRadius: 16,
        height: 10,
        justifyContent: 'center',
        marginBottom: 16,
        width: 10
    }
});

export default CustomMarker;