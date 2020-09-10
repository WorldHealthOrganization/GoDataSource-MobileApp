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

Section = React.memo(({label, hasBorderBottom, borderBottomColor, containerStyle, translation, mediumTextStyle}) => (
    <View style={[style.containerStyle, containerStyle]}>
        <View style={[style.containerText]}>
            <Text style={mediumTextStyle ? style.mediumTextStyle : style.largeTextStyle}>
                {getTranslation(label, translation)}
            </Text>
        </View>
        <View style={[style.separatorStyle, {backgroundColor: borderBottomColor, display: hasBorderBottom ? 'flex' : 'none'}]}/>
    </View>
));

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    containerStyle: {
        width: '100%',
    },
    containerText: {
        justifyContent: 'center',
        flex: 1
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
        color: styles.colorLabelActiveTab,
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
    mediumTextStyle: PropTypes.bool
};

Section.defaultProps = {
    label: 'Test',
    hasBorderBottom: false,
    borderBottomColor: styles.navigationDrawerSeparatorGrey,
    mediumTextStyle: false
};

export default Section;