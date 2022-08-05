/**
 * Created by florinpopa on 03/08/2018.
 */
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import PropTypes from 'prop-types';
import {getTranslation} from './../utils/functions';
import styles from './../styles';

// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box

Section = React.memo(({label, hasBorderBottom, borderBottomColor, containerStyle, translation, labelSize, textStyle}) => {
    let labelStyle = null;
    switch (labelSize) {
        case 'medium':
            labelStyle = style.mediumTextStyle;
            break;
        case 'normal':
            labelStyle = style.normalTextStyle;
            break;
        case 'small':
            labelStyle = style.smallTextStyle;
            break;
        default:
            labelStyle = style.largeTextStyle;
    }
    return (
        <View style={[style.containerStyle, containerStyle]}>
            <View style={[style.containerText]}>
                <Text style={[labelStyle, textStyle]}>
                    {getTranslation(label, translation)}
                </Text>
            </View>
            <View style={[styles.lineStyle, {backgroundColor: borderBottomColor, display: hasBorderBottom ? 'flex' : 'none'}]}/>
        </View>
    )
});

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    containerStyle: {
        backgroundColor: styles.backgroundColorRgb,
        width: '100%'
    },
    containerText: {
        flexDirection: 'row',
        paddingVertical: 4,
        paddingHorizontal: 16
    },
    largeTextStyle: {
        color: styles.textColor,
        fontFamily: 'Roboto-Medium',
        fontSize: 18
    },
    mediumTextStyle: {
        color: styles.textColor,
        fontFamily: 'Roboto-Medium',
        fontSize: 16
    },
    normalTextStyle: {
        color: styles.textColor,
        flexShrink: 1,
        fontFamily: 'Roboto-Regular',
        fontSize: 14
    },
    smallTextStyle: {
        color: styles.textColor,
        fontFamily: 'Roboto-Light',
        fontSize: 12
    }
});

Section.propTypes = {
    label: PropTypes.string.isRequired,
    hasBorderBottom: PropTypes.bool,
    borderBottomColor: PropTypes.string,
    containerStyle: PropTypes.object,
    labelSize: PropTypes.oneOf(['normal', 'medium', 'large', 'small']),
    textStyle: PropTypes.object
};

Section.defaultProps = {
    label: 'Test',
    hasBorderBottom: false,
    borderBottomColor: styles.separatorColor,
    containerStyle: {},
    labelSize: 'large',
    textStyle: {}
};

export default Section;