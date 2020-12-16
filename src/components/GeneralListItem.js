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

GeneralListItem = ({title, primaryText, secondaryText, firstComponent, secondComponent, thirdComponent, hasActionsBar, textsArray, textsStyleArray, onPressArray, arrayPermissions, actionsBarContainerStyle, containerStyle, translation}) => {
    // console.log('GeneralListItem render called');
    return (
        <ElevatedView
            elevation={3}
            style={[{borderRadius: 2, backgroundColor: 'white'}, containerStyle]}
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
                        textsStyleArray={textsStyleArray}
                        onPressArray={onPressArray}
                        containerStyle={{height: 54}}
                        isEditMode={true}
                        translation={translation}
                        arrayPermissions={arrayPermissions}
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
        width: '100%',
    },
    title: {
        fontFamily: 'Roboto-Medium',
        fontSize: 18,
        color: 'black',
        marginVertical: 10,
        marginHorizontal: 14
    },
    primaryText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 13,
        color: 'black',
        marginHorizontal: 14,
        marginVertical: 8
    }
});

export default (GeneralListItem);