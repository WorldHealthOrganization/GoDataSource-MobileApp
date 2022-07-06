/**
 * Created by florinpopa on 22/08/2018.
 */
/**
 * Created by florinpopa on 03/08/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import Ripple from 'react-native-material-ripple';
import {getTranslation} from './../utils/functions';
import styles from './../styles';
import {checkArrayAndLength} from './../utils/typeCheckingFunctions';
import PermissionComponent from './PermissionComponent';

ActionsBar = React.memo(({textsArray, addressIndex, textsStyleArray, onPressArray, arrayPermissions, outbreakPermissions, onPermissionDisable, hasBorder, borderColor, containerStyle, containerTextStyle, isEditMode, translation}) => (
    <View style={[style.containerStyle, containerStyle]}>
        <View style={[style.separatorStyle, {backgroundColor: borderColor, display: hasBorder ? 'flex' : 'none'}]}/>
        {
            isEditMode !== undefined && isEditMode !== null && isEditMode === true ? (
                <View style={[style.containerText, containerTextStyle]}>
                {
                    textsArray.map((text, index) => {
                        if (checkArrayAndLength(arrayPermissions) && arrayPermissions.length === textsArray.length) {
                            return (
                                <PermissionComponent
                                    key={index}
                                    render={() => (
                                        <Ripple
                                            key={index}
                                            style={style.rippleStyle}
                                            onPress={onPressArray && onPressArray[index] ? () => {
                                                onPressArray[index](addressIndex)
                                            } : () => {
                                                console.log("Default ")
                                            }}
                                        >
                                            <Text style={[
                                                textsStyleArray && Array.isArray(textsStyleArray) &&
                                                textsStyleArray[index] ? textsStyleArray[index] : style.textStyle]}
                                                  numberOfLines={1}
                                            >
                                                {getTranslation(text, translation)}
                                            </Text>
                                        </Ripple>
                                    )}
                                    outbreakPermissions={checkArrayAndLength(outbreakPermissions) ? outbreakPermissions[index] : []}
                                    permissionsList={arrayPermissions[index]}
                                    alternativeRender={() =>{
                                        if(onPermissionDisable && onPermissionDisable[index]){
                                            return (
                                                <Ripple
                                                    key={index}
                                                    style={style.rippleStyle}
                                                    disabled={true}
                                                    onPress={onPressArray && onPressArray[index] ? () => {
                                                        onPressArray[index](addressIndex)
                                                    } : () => {
                                                        console.log("Default ")
                                                    }}
                                                >
                                                    <Text style={[
                                                        textsStyleArray && Array.isArray(textsStyleArray) &&
                                                        textsStyleArray[index] ? textsStyleArray[index] : style.textStyle,
                                                        onPermissionDisable[index] ? {color:'gray'} : {}
                                                    ]}
                                                          numberOfLines={1}
                                                    >
                                                        {getTranslation(text, translation)}
                                                    </Text>
                                                </Ripple>
                                            )
                                        }
                                        return (<View style={[style.rippleStyle, {width: 60}]}/>)
                                    }}
                                />
                            )
                        } else {
                            return (
                                <Ripple
                                    key={index}
                                    style={[style.rippleStyle]}
                                    onPress={onPressArray && onPressArray[index] ? () => {
                                        onPressArray[index](addressIndex)
                                    } : () => {
                                        console.log("Default ")
                                    }}
                                >
                                    <Text style={[
                                        textsStyleArray && Array.isArray(textsStyleArray) &&
                                        textsStyleArray[index] ? textsStyleArray[index] : style.textStyle
                                    ]}
                                          numberOfLines={1}
                                    >
                                        {getTranslation(text, translation)}
                                    </Text>
                                </Ripple>
                            )
                        }
                    })
                }
                </View>) : null
        }
    </View>
));

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
        display: 'flex',
        flex: 1,
        height: '100%',
        justifyContent: 'center',
    },
    textStyle: {
        fontFamily: 'Roboto-Medium',
        fontSize: 12,
        color: styles.primaryButton
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
    arrayPermissions: PropTypes.array,
    hasBorder: PropTypes.bool,
    borderColor: PropTypes.string,
    containerStyle: PropTypes.object
};

ActionsBar.defaultProps = {
    textsArray: [],
    textsStyleArray: [],
    onPressArray: [],
    arrayPermissions: [],
    hasBorder: true,
    borderColor: styles.separatorColor,
    containerStyle: {}
};

export default ActionsBar;