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
import {getTranslation} from './../utils/functions';
import styles from './../styles';
import { ISO_8601 } from 'moment';

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
                        <Text style={style.title}>
                            {getTranslation(title, translation)}
                        </Text>
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
                        // textsStyleArray={textsStyleArray}  // I commented this because it cancels the style from ActionBar for card buttons
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
                    hasSecondaryActionsBar ? (<ActionsBar
                        textsArray={secondaryTextsArray}
                        // textsStyleArray={secondaryTextsStyleArray}  // I commented this because it cancels the style from ActionBar for card buttons
                        onPressArray={secondaryOnPressArray}
                        containerStyle={{height: secondaryTextsArray.length !== 0 ? 32 : 0}}
                        isEditMode={true}
                        translation={translation}
                        outbreakPermissions={secondaryOutbreakPermissions}
                        arrayPermissions={secondaryArrayPermissions}
                    />) : (null)
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
    title: {
        color: styles.textColor,
        fontFamily: 'Roboto-Medium',
        fontSize: 16,
        lineHeight: 20
    },
    primaryText: {
        color: styles.secondaryColor,
        fontFamily: 'Roboto-Regular',
        fontSize: 14
    }
});

export default (GeneralListItem);