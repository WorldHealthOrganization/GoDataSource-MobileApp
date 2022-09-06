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
import {checkArrayAndLength} from './../utils/typeCheckingFunctions';
import PermissionComponent from './PermissionComponent';
import {Icon} from 'react-native-material-ui';
import styles from './../styles';

ActionsBar = React.memo(({textsArray, addressIndex, textsStyleArray, onPressArray, arrayPermissions, outbreakPermissions, onPermissionDisable, hasBorder, borderColor, containerStyle, containerTextStyle, isEditMode, translation, iconArray}) => (
    <View style={[style.containerStyle, containerStyle]}>
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
                                                        onPermissionDisable[index] ? {backgroundColor: styles.disabledColor} : {}
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
                                    style={[Array.isArray(iconArray) && iconArray[index] ? style.deleteBtn : style.defaultBtn]}
                                    onPress={onPressArray && onPressArray[index] ? () => {
                                        onPressArray[index](addressIndex)
                                    } : () => {
                                        console.log("Default ")
                                    }}
                                >
                                    {
                                        Array.isArray(iconArray) && iconArray[index] ? <Icon name="delete" color={styles.backgroundColor} size={18} /> : null
                                    }
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
        width: '100%'
    },
    containerText: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 0
    },
    rippleStyle: {
        alignItems: 'center',
        display: 'flex',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        marginHorizontal: 4,
        paddingVertical: 0
    },
    textStyle: {
        backgroundColor: styles.primaryColorRgb,
        borderRadius: 4,
        color: styles.primaryColor,
        display: 'flex',
        flex: 1,
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        lineHeight: 26,
        textAlign: 'center'
    },
    deleteBtn: {
        alignItems: 'center',
        backgroundColor: styles.dangerColor,
        borderRadius: 4,
        color: styles.backgroundColor,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        marginHorizontal: 0,
        paddingVertical: 4,
        paddingHorizontal: 8
    },
    defaultBtn: {
        alignItems: 'center',
        backgroundColor: styles.primaryColor,
        borderRadius: 4,
        color: styles.backgroundColor,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        marginHorizontal: 0,
        paddingVertical: 4,
        paddingHorizontal: 8
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