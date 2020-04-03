import React, {Component} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {connect} from "react-redux";
import Ripple from 'react-native-material-ripple';
import ElevatedView from 'react-native-elevated-view';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import get from 'lodash/get';
import {calculateDimension, getTranslation} from '../utils/functions';
import config from '../utils/config';
import Button from '../components/Button';
import styles from '../styles';
import CardComponent from '../components/CardComponent';
import translations from '../utils/translations'

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
                    color={styles.buttonGreen}
                    titleColor={'white'}
                    height={calculateDimension(25, true, screenSize)}
                    width={calculateDimension(130, false, screenSize)}
                    style={{
                        marginVertical: calculateDimension(12.5, true, screenSize),
                        marginHorizontal: calculateDimension(16, false, screenSize),
                    }}
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
                            <View style={{ alignSelf: 'flex-start', marginHorizontal: calculateDimension(16, false, screenSize), marginVertical: 20 }}>
                                <Ripple
                                    style={{
                                        height: 25,
                                        justifyContent: 'center'
                                    }}
                                    onPress={onPressAddSortRule}
                                >
                                    <Text style={{ fontFamily: 'Roboto-Medium', fontSize: 12, color: styles.buttonGreen }}>
                                        {addSortRuleText}
                                    </Text>
                                </Ripple>
                            </View> : null
                    }
                </KeyboardAwareScrollView>
                <View style={style.containerButtonApplyFilters}>
                    <Button
                        title={getTranslation(translations.generalLabels.applyFiltersButton, translation)}
                        color={styles.buttonGreen}
                        onPress={onPressApplyFilters}
                        width={calculateDimension(247.5, false, screenSize)}
                        height={calculateDimension(32, true, screenSize)}
                        style={{
                            marginRight: calculateDimension(6.5, false, screenSize),
                        }}
                        titleStyle={{ fontFamily: 'Roboto-Medium', fontSize: 14 }}
                        titleColor={'white'}
                    />
                    <Button
                        title={getTranslation(translations.generalLabels.resetFiltersButton, translation)}
                        color={styles.buttonWhite}
                        onPress={onPressResetFilters}
                        width={calculateDimension(80.5, false, screenSize)}
                        height={calculateDimension(32, true, screenSize)}
                        style={{
                            marginLeft: calculateDimension(6.5, false, screenSize),
                        }}
                        titleStyle={{ fontFamily: 'Roboto-Medium', fontSize: 14 }}
                        titleColor={'black'}
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
            <ElevatedView key={cardIndex} elevation={3} style={[style.containerCardComponent, {
                marginHorizontal: calculateDimension(16, false, screenSize),
                width: calculateDimension(designScreenSize.width - 32, false, screenSize),
                marginVertical: 4,
                minHeight: calculateDimension(72, true, screenSize)
            }, style.cardStyle]}>
                <ScrollView scrollEnabled={false} style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
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
            <View style={[style.subcontainerCardComponent, { flex: 1 }]} key={index}>
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
                filter={filter}

                onChangeSectionedDropDown={onChangeSectionedDropDown}
                onChangeDropDown={onChangeDropDown}
                onDeletePress={onDeletePress}
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
    containerCardComponent: {
        backgroundColor: 'white',
        borderRadius: 2
    },
    subcontainerCardComponent: {
        alignItems: 'center',
        flex: 1
    },
    container: {
        flex: 1,
        backgroundColor: styles.screenBackgroundGrey,
        borderRadius: 2,
        alignItems: 'center',
    },
    cardStyle: {
        marginVertical: 4,
        flex: 1
    },
    containerScrollView: {
        flex: 1,
        backgroundColor: styles.screenBackgroundGrey
    },
    contentContainerStyle: {
        alignItems: 'center'
    },
    containerButtonApplyFilters: {
        flex: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 22,
        marginTop: 10
    }
});

function mapStateToProps(state) {
    return {
        screenSize: get(state, 'app.screenSize', config.designScreenSize),
        translation: get(state, 'app.translation', []),
    };
};

export default connect(mapStateToProps)(SortContainer);
