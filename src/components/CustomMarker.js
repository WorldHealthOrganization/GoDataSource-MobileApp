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
        <View
            style={[style, styleLocal.container]}
        >

            <Text
                style={[{
                    fontFamily: 'Roboto-Medium',
                    fontSize: 15,
                    width: '100%',
                    alignSelf: 'center',
                    color: markerColor || 'black'
                }]}
            >
                {currentValue}
            </Text>

            <View style={[{
                borderRadius: 18,
                width: 9,
                height: 9,
                justifyContent: 'center',
                marginBottom: 14,
                backgroundColor: styles.primaryButton
            },markerStyle]}/>
        </View>
)});

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const styleLocal = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default CustomMarker;