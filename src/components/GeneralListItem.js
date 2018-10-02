/**
 * Created by florinpopa on 23/08/2018.
 */
/**
 * Created by florinpopa on 03/08/2018.
 */
import React, {PureComponent} from 'react';
import {View, Text, StyleSheet, PixelRatio} from 'react-native';
import PropTypes from 'prop-types';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import styles from './../styles';
import {ListItem} from 'react-native-ui-lib';
import ElevatedView from 'react-native-elevated-view';
import ActionsBar from './ActionsBar';

GeneralListItem = ({title, primaryText, secondaryText, firstComponent, secondComponent, thirdComponent, hasActionsBar, textsArray, textsStyleArray, onPressArray, actionsBarContainerStyle, containerStyle}) => (
    <ElevatedView
        elevation={3}
        style={[{borderRadius: 2, height: '100%', backgroundColor: 'white'}, containerStyle]}
    >
        <View containerStyle={{flex: 1, height: '100%'}}>
                {
                    firstComponent ? (
                        firstComponent
                    ) : (
                        <Text style={style.title}>{title}</Text>
                    )
                }
                {
                    secondComponent ? (
                        secondComponent
                    ) : (
                        <Text style={style.primaryText}>{primaryText}</Text>
                    )
                }
                {
                    thirdComponent ? (
                        thirdComponent
                    ) : (
                        <Text style={style.primaryText}>{secondaryText}</Text>
                    )
                }
                {
                    hasActionsBar ? (<ActionsBar
                            textsArray={textsArray}
                            textsStyleArray={textsStyleArray}
                            onPressArray={onPressArray}
                            containerStyle={[{height: 54}]}
                        />) : (null)
                }
        </View>
    </ElevatedView>
);

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

// GeneralListItem.propTypes = {
//     label: PropTypes.string.isRequired,
//     hasBorderBottom: PropTypes.boolean,
//     borderBottomColor: PropTypes.string
// };
//
// GeneralListItem.defaultProps = {
//     label: 'Test',
//     hasBorderBottom: false,
//     borderBottomColor: styles.navigationDrawerSeparatorGrey
// };

export default GeneralListItem;