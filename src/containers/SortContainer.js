import React, {Component} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {connect} from "react-redux";
import Ripple from 'react-native-material-ripple';
import ElevatedView from 'react-native-elevated-view';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import get from 'lodash/get';
import {calculateDimension, getTranslation} from '../utils/functions';
import config from '../utils/config';
import Button from '../components/Button';
import CardComponent from '../components/CardComponent';
import translations from '../utils/translations';
import styles from './../styles';

class SortContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            addSortRuleText: getTranslation(translations.sortTab.addSortRule, this.props.translation)
        };
    };

    shouldComponentUpdate(nextProps, nextState) {
        const { filter } = this.props;
        if (filter.sort.length !== nextProps.filter.sort.length) {
            return true
        }

        return false
    };

    render() {
        const { addSortRuleText } = this.state;
        const { screenSize, translation } = this.props;
        const { handleMoveToPrevieousScreenButton, onPressAddSortRule, onPressApplyFilters, onPressResetFilters } = this.props;
        const { filter } = this.props;
        const { sortCriteriaDropDownItems, } = config;

        return (
            <View style={[style.container]}>
                <Button
                    title={'Back'}
                    onPress={handleMoveToPrevieousScreenButton}
                    color={styles.backgroundColor}
                    titleColor={styles.textColor}
                    height={calculateDimension(35, true, screenSize)}
                    width={calculateDimension(164, false, screenSize)}
                    style={{marginVertical: calculateDimension(16, true, screenSize)}}
                />

                <KeyboardAwareScrollView
                    style={style.containerScrollView}
                    contentContainerStyle={[style.contentContainerStyle, { paddingBottom: screenSize.height < 600 ? 70 : 20 }]}
                    keyboardShouldPersistTaps={'always'}
                >
                    <View style={style.container}>
                        {
                            filter && filter.sort && filter.sort.map((item, index) => {
                                return this.handleRenderItem(item, index)
                            })
                        }
                    </View>
                    {
                        filter.sort.length < sortCriteriaDropDownItems.length ?
                            <View style={{alignSelf: 'flex-start', marginHorizontal: calculateDimension(16, false, screenSize)}}>
                                <Button
                                    title={addSortRuleText}
                                    onPress={onPressAddSortRule}
                                    color={styles.primaryColor}
                                    titleColor={styles.backgroundColor}
                                    height={calculateDimension(35, true, screenSize)}
                                    width={calculateDimension(130, false, screenSize)}
                                    style={{marginVertical: calculateDimension(16, true, screenSize)}}
                                />
                            </View> : null
                    }
                </KeyboardAwareScrollView>
                <View style={style.containerButtonApplyFilters}>
                    <Button
                        title={getTranslation(translations.generalLabels.applyFiltersButton, translation)}
                        color={styles.primaryColor}
                        titleStyle={{ fontFamily: 'Roboto-Medium', fontSize: 14 }}
                        titleColor={styles.backgroundColor}
                        onPress={onPressApplyFilters}
                        width={calculateDimension(245, false, screenSize)}
                        height={calculateDimension(35, true, screenSize)}
                        style={{marginRight: calculateDimension(8, false, screenSize)}}
                    />
                    <Button
                        title={getTranslation(translations.generalLabels.resetFiltersButton, translation)}
                        color={styles.backgroundColor}
                        titleStyle={{ fontFamily: 'Roboto-Medium', fontSize: 14 }}
                        titleColor={styles.textColor}
                        onPress={onPressResetFilters}
                        width={calculateDimension(90, false, screenSize)}
                        height={calculateDimension(35, true, screenSize)}
                    />
                </View>
            </View>
        );
    };

    handleRenderItem = (item, index) => {
        const { configFilterScreen } = this.props;

        let fields = configFilterScreen.sort.fields
        return this.renderItemCardComponent(fields, index)
    };

    renderItemCardComponent = (fields, cardIndex = null) => {
        const { screenSize } = this.props;
        const { designScreenSize } = config;
        return (
            <ElevatedView key={cardIndex} elevation={5} style={[style.containerCardComponent, {
                marginHorizontal: calculateDimension(16, false, screenSize),
                minHeight: calculateDimension(72, true, screenSize),
                width: calculateDimension(designScreenSize.width - 32, false, screenSize)
            }, style.cardStyle]}>
                <ScrollView scrollEnabled={false} style={{flex: 1}} contentContainerStyle={{flexGrow: 1}}>
                    {
                        fields && fields.map((item, index) => {
                            return this.handleRenderItemCardComponent(item, index, cardIndex);
                        })
                    }
                </ScrollView>
            </ElevatedView>
        );
    };

    handleRenderItemCardComponent = (item, index, cardIndex) => {
        return (
            <View style={[style.subcontainerCardComponent, {flex: 1}]} key={index}>
                {
                    this.handleRenderItemByType(item, cardIndex)
                }
            </View>
        )
    };

    handleRenderItemByType = (item, cardIndex) => {
        const { filter, translation } = this.props;
        const { onChangeSectionedDropDown, onChangeDropDown, onDeletePress } = this.props;
        const { sortCriteriaDropDownItems, sortOrderDropDownItems } = this.props;
        let value = '';

        if (item.type === 'DropdownInput' && item.id === 'sortCriteria') {
            let configSortCiteriaFilter = sortCriteriaDropDownItems.filter((e) => {
                return filter.sort.map((k) => { return k.sortCriteria }).indexOf(e.value) === -1
            })

            item.data = configSortCiteriaFilter.map((e) => { return { label: getTranslation(e.value, translation), value: e.value } })
            value = this.computeValueForSortScreen(item, cardIndex);
        }
        if (item.type === 'DropdownInput' && item.id === 'sortOrder') {
            item.data = sortOrderDropDownItems.map((e) => { return { label: getTranslation(e.value, translation), value: e.value } })
            value = this.computeValueForSortScreen(item, cardIndex);
        }
        if (item.type === 'ActionsBar') {
            item.onPressArray = [onDeletePress]
        }

        return (
            <CardComponent
                item={item}
                isEditMode={true}
                isEditModeForDropDownInput={true}
                value={value}
                index={cardIndex}
                onChangeSectionedDropDown={onChangeSectionedDropDown}
                onChangeDropDown={onChangeDropDown}
                onDeletePress={onDeletePress}
                permissionsList={item.permissionsList}
            />
        )
    };

    computeValueForSortScreen = (item, index) => {
        const { filter, translation } = this.props;

        if (index !== null && index >= 0) {
            if (item.objectType === 'Sort') {
                return filter && filter.sort && Array.isArray(filter.sort) && filter.sort.length > 0 && filter.sort[index][item.id] !== undefined ?
                    getTranslation(filter.sort[index][item.id], translation) : '';
            }
        }
        return filter && filter[item.id] ? getTranslation(filter[item.id], translation) : '';
    };
};

const style = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: styles.screenBackgroundColor,
        borderRadius: 4,
        flex: 1
    },
    containerCardComponent: {
        backgroundColor: styles.backgroundColor,
        borderRadius: 4
    },
    subcontainerCardComponent: {
        alignItems: 'center',
        flex: 1
    },
    cardStyle: {
        flex: 1,
        marginVertical: 6
    },
    containerScrollView: {
        backgroundColor: styles.screenBackgroundColor,
        flex: 1
    },
    contentContainerStyle: {
        alignItems: 'center'
    },
    containerButtonApplyFilters: {
        flex: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 16
    }
});

function mapStateToProps(state) {
    return {
        screenSize: get(state, 'app.screenSize', config.designScreenSize),
        translation: get(state, 'app.translation', []),
    };
};

export default connect(mapStateToProps)(SortContainer);
