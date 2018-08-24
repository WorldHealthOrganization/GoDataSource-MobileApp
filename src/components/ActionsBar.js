/**
 * Created by florinpopa on 22/08/2018.
 */
/**
 * Created by florinpopa on 03/08/2018.
 */
import React, {PureComponent} from 'react';
import {View, Text, StyleSheet, PixelRatio} from 'react-native';
import PropTypes from 'prop-types';
import Ripple from 'react-native-material-ripple';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import styles from './../styles';

ActionsBar = ({textsArray, addressIndex, textsStyleArray, onPressArray, hasBorder, borderColor, containerStyle, containerTextStyle}) => (
    <View style={[style.containerStyle, containerStyle]}>
        <View style={[style.separatorStyle, {backgroundColor: borderColor, display: hasBorder ? 'flex' : 'none'}]}/>
        <View style={[style.containerText, containerTextStyle]}>
            {
                textsArray.map((text, index) => {
                    return (
                        <Ripple
                            style={style.rippleStyle}
                            onPress={onPressArray && onPressArray[index] ? () => {onPressArray[index](addressIndex)} : () => {console.log("Default ")}}
                        >
                            <Text style={[
                                textsStyleArray && Array.isArray(textsStyleArray) &&
                                textsStyleArray[index] ? textsStyleArray[index] : style.textStyle]}
                                  numberOfLines={1}
                            >{text}</Text>
                        </Ripple>
                    )
                })
            }
        </View>
    </View>
);

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    containerStyle: {
        width: '100%',
    },
    containerText: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    rippleStyle: {
        height: '100%',
        justifyContent: 'center'
    },
    textStyle: {
        fontFamily: 'Roboto-Medium',
        fontSize: 12,
        color: styles.buttonGreen
    },
    separatorStyle: {
        width: '100%',
        height: 1
    }
});

ActionsBar.propTypes = {
    textsArray: PropTypes.array.isRequired,
    textsStyleArray: PropTypes.array,
    onPressArray: PropTypes.array,
    hasBorder: PropTypes.boolean,
    borderColor: PropTypes.string,
    containerStyle: PropTypes.object
};

ActionsBar.defaultProps = {
    textsArray: [],
    textsStyleArray: [],
    onPressArray: [],
    hasBorder: true,
    borderColor: styles.navigationDrawerSeparatorGrey,
    containerStyle: {}
};

export default ActionsBar;