/**
 * Created by florinpopa on 23/08/2018.
 */
/**
 * Created by florinpopa on 03/08/2018.
 */
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import ElevatedView from 'react-native-elevated-view';
import ActionsBar from './ActionsBar';
import {checkPermissions, getTranslation} from './../utils/functions';
import styles from './../styles';
import {ISO_8601} from 'moment';
import PermissionComponent from "./PermissionComponent";
import lodashGet from "lodash/get";
import {connect} from "react-redux";
import {checkArrayAndLength} from "../utils/typeCheckingFunctions";

GeneralListItem = ({title, primaryText, secondaryText, firstComponent, secondComponent, thirdComponent, hasActionsBar, textsArray, textsStyleArray, onPressArray, arrayPermissions, onPermissionDisable, outbreakPermissions, secondaryOutbreakPermissions, actionsBarContainerStyle, containerStyle, translation, hasSecondaryActionsBar, secondaryTextsArray, secondaryTextsStyleArray, secondaryOnPressArray, secondaryArrayPermissions}) => {
    // console.log('GeneralListItem render called');
    return (
        <ElevatedView
            elevation={5}
            style={[{borderRadius: 4, backgroundColor: styles.backgroundColor, marginBottom: 4}, containerStyle]}
        >
            <View containerStyle={containerStyle}>
                {
                    firstComponent ? (
                        firstComponent
                    ) : (
                        <View style={style.cardHeader}>
                            <View style={style.cardHeaderTitle}>
                                <Text numberOfLines={1}>
                                    {getTranslation(title, translation)}
                                </Text>
                            </View>
                        </View>
                    )
                }
                {
                    secondComponent ? (
                        secondComponent
                    ) : primaryText ? (
                        <Text style={style.primaryText}>
                            {getTranslation(primaryText, translation)}
                        </Text>
                    ) : (null)
                }
                {
                    thirdComponent ? (
                        thirdComponent
                    ) : secondaryText ? (
                        <Text style={style.primaryText}>
                            {getTranslation(secondaryText, translation)}
                        </Text>
                    ) : (null)
                }
                {
                    hasActionsBar ? (<ActionsBar
                        textsArray={textsArray}
                        textsStyleArray={textsStyleArray}
                        onPressArray={onPressArray}
                        containerStyle={{height: textsArray.length !== 0 ? 30 : 0}}
                        isEditMode={true}
                        translation={translation}
                        onPermissionDisable={onPermissionDisable}
                        outbreakPermissions={outbreakPermissions}
                        arrayPermissions={arrayPermissions}
                    />) : (null)
                }
                {
                    hasSecondaryActionsBar ?
                        (<PermissionComponent
                                render={() => (<ActionsBar
                                    textsArray={secondaryTextsArray}
                                    textsStyleArray={secondaryTextsStyleArray}
                                    onPressArray={secondaryOnPressArray}
                                    containerStyle={{height: secondaryTextsArray.length !== 0 ? 32 : 0}}
                                    isEditMode={true}
                                    translation={translation}
                                    outbreakPermissions={secondaryOutbreakPermissions}
                                    arrayPermissions={secondaryArrayPermissions}
                                />)}
                                outbreakPermissions={[].concat.apply([],secondaryOutbreakPermissions)}
                                permissionsList={[].concat.apply([],secondaryArrayPermissions)}
                            />
                        ) : (null)
                }
            </View>
        </ElevatedView>
    );
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    containerStyle: {
        width: '100%'
    },
    cardHeader: {
        alignItems: 'center',
        backgroundColor: styles.backgroundColorRgb,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    cardHeaderTitle: {
        color: styles.textColor,
        flex: 1,
        fontFamily: 'Roboto-Medium',
        fontSize: 16,
        lineHeight: 20,
        paddingVertical: 4,
        paddingHorizontal: 8
    },
    primaryText: {
        color: styles.textColor,
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        paddingHorizontal: 16,
        paddingVertical: 8
    },
});

function mapStateToProps(state) {
    return {
        permissions: lodashGet(state, 'role', []),
        outbreak: lodashGet(state, 'outbreak', null)
    };
}

export default connect(
    mapStateToProps,
)(GeneralListItem);