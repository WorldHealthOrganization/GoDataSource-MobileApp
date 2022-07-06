/**
 * Created by florinpopa on 03/08/2018.
 */
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from './../styles';
import {getTranslation} from './../utils/functions';

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
            <View style={[style.separatorStyle, {backgroundColor: borderBottomColor, display: hasBorderBottom ? 'flex' : 'none'}]}/>
        </View>
    )
});

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    containerStyle: {
        width: '100%',
        // flex: 1
    },
    containerText: {
        // justifyContent: 'center',
        // flex: 1,
        flexDirection: 'row'
    },
    largeTextStyle: {
        fontFamily: 'Roboto-Medium',
        fontSize: 18,
        color: 'black',
        marginLeft: 15
    },
    mediumTextStyle: {
        fontFamily: 'Roboto-Medium',
        fontSize: 16,
        color: styles.textColor,
        marginLeft: 15
    },
    normalTextStyle: {
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        color: styles.textColor,
        marginLeft: 15,
        flexShrink: 1
    },
    smallTextStyle: {
        fontFamily: 'Roboto-Light',
        fontSize: 15,
        color: styles.textColor,
        marginLeft: 15
    },
    separatorStyle: {
        width: '100%',
        height: 1
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