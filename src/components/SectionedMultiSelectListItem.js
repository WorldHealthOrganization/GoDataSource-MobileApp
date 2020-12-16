import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Ripple from 'react-native-material-ripple';
import {checkArrayAndLength} from "../utils/typeCheckingFunctions";

// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box

SectionedMultiSelectListItem = ({item, uniqueKey, subKey, handleOnSelectItem, handleOnPressExpand,
               handleRenderList, iconWidth, selectedItems, selectToggleIconComponent,
               expandedItems, dropDownToggleIconUpComponent, dropDownToggleIconDownComponent}) => (
    <View style={{flex: 1, marginVertical: 10}}>
        <View style={{flexDirection: 'row', flex: 1, alignItems: 'center', justifyContent: 'space-between'}}>
            <Ripple
                onPress={() => {handleOnSelectItem(item)}}
            >
                <Text
                    style={{
                        fontFamily: 'Roboto-Light',
                        fontSize: 16,
                        marginVertical: 2
                    }}
                    numberOfLines={1}
                >{item.name}</Text>
            </Ripple>
            <View style={{flexDirection: 'row'}}>
                {
                    selectedItems.findIndex((e) => {return e[uniqueKey] === item[uniqueKey]}) > -1 ? (
                        <Ripple
                            style={{height: '100%', width: iconWidth, marginRight: 10}}
                        >
                            {
                                selectToggleIconComponent
                            }
                        </Ripple>
                    ) : (null)
                }
                {
                    item[subKey] && checkArrayAndLength(item[subKey]) ? (
                        <Ripple
                            style={{height: '100%', width: iconWidth}}
                            onPress={() => {handleOnPressExpand(item[uniqueKey])}}
                            hitSlop={{
                                top: 20,
                                left: 20,
                                bottom: 20,
                                right: 20
                            }}
                        >
                            {
                                expandedItems.findIndex((e) => {return e === item[uniqueKey]}) > -1 ?
                                    dropDownToggleIconUpComponent : dropDownToggleIconDownComponent
                            }
                        </Ripple>
                    ) : (
                        <View
                            style={{height: '100%', width: iconWidth}}
                        />
                    )
                }
            </View>
        </View>
        {
            item[subKey] && expandedItems.findIndex((e) => {return e === item[uniqueKey]}) > -1 ? (
                <View style={{marginLeft: 20}}>
                    {
                        handleRenderList(item[subKey])
                    }
                </View>
            ) : (null)
        }
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

export default SectionedMultiSelectListItem;