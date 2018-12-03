/**
 * Created by florinpopa on 03/08/2018.
 */
import React, {PureComponent} from 'react';
import {View, Text, StyleSheet, PixelRatio} from 'react-native';
import PropTypes from 'prop-types';
import styles from './../styles';
import translations from './../utils/translations'
import {getTranslation} from './../utils/functions';

// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box

Section = ({label, hasBorderBottom, borderBottomColor, containerStyle, translation}) => (
    <View style={[style.containerStyle, containerStyle]}>
        <View style={[style.containerText]}>
            <Text style={style.textStyle}>
                {getTranslation(label, translation)}
            </Text>
        </View>
        <View style={[style.separatorStyle, {backgroundColor: borderBottomColor, display: hasBorderBottom ? 'flex' : 'none'}]}/>
    </View>
);

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
    textStyle: {
        fontFamily: 'Roboto-Medium',
        fontSize: 18,
        color: 'black',
        marginLeft: 15
    },
    separatorStyle: {
        width: '100%',
        height: 1
    }
});

Section.propTypes = {
    label: PropTypes.string.isRequired,
    hasBorderBottom: PropTypes.boolean,
    borderBottomColor: PropTypes.string
};

Section.defaultProps = {
    label: 'Test',
    hasBorderBottom: false,
    borderBottomColor: styles.navigationDrawerSeparatorGrey
};

export default Section;