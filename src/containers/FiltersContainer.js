import React, {PureComponent} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {connect} from "react-redux";
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import ElevatedView from 'react-native-elevated-view';
import filter from 'lodash/filter';
import get from 'lodash/get';
import {calculateDimension, extractIdFromPouchId, getTranslation} from './../utils/functions';
import config from './../utils/config';
import Button from './../components/Button';
import CardComponent from './../components/CardComponent';
import translations from './../utils/translations';
import styles from './../styles';

class FiltersContainer extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
        };
    };

    render() {
        const { configFilterScreen } = this.props
        const { handleMoveToNextScreenButton, onPressResetFilters, onPressApplyFilters } = this.props
        const { screenSize, translation } = this.props

        return (
            <View style={style.container}>
                <Button
                    title={getTranslation(translations.generalButtons.nextButtonLabel, translation)}
                    onPress={handleMoveToNextScreenButton}
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
                    {
                        configFilterScreen.filter.map((item, index) => {
                            return this.handleRenderItem(item, index);
                        })
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
        return this.renderItemCardComponent(item.fields, index)
    };

    renderItemCardComponent = (fields, cardIndex = null) => {
        const { screenSize } = this.props;
        const { designScreenSize } = config;

        return (
            <ElevatedView key={cardIndex} elevation={5} style={[style.containerCardComponent, {
                marginHorizontal: calculateDimension(16, false, screenSize),
                marginVertical: 6,
                minHeight: calculateDimension(72, true, screenSize),
                width: calculateDimension(designScreenSize.width - 32, false, screenSize),
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
        const { translation, filter } = this.props;
        const { onChangeSectionedDropDown, onChangeInterval, onChangeMultipleSelection, onSelectItem, onChangeText } = this.props;

        let value = '';
        let data = [];

        if (item.type === 'Selector') {
            item = Object.assign({}, item);
            item.data = item.data.map((e) => {
                console.log("Help", item.id, filter.filter);
                return {
                    value: e.value,
                    selected: !!(filter && filter.filter && filter.filter[item.id] && filter.filter[item.id][e.value])
                }
            })
        }
        if (item.type === 'IntervalPicker' && item.id === 'age') {
            item.value = filter.filter[item.id];
        }
        if(item.type === 'IntervalPicker' && item.id === 'selectedIndexDay') {
            item.max = this.props.outbreak?.periodOfFollowup * 2;
            item.value = filter.filter[item.id];
        }
        if (item.type === 'DropDownSectioned' && item.id === 'selectedLocations') {
            if (filter.filter[item.id].length === 1) {
                for (let i = 0; i < this.props.locations.length; i++) {
                    let myLocationName = this.getLocationNameById(this.props.locations[i], filter.filter[item.id][0])
                    if (myLocationName !== null) {
                        value = myLocationName
                        break
                    }
                }
            } else {
                value = filter.filter[item.id].map((e) => {
                    return 'location.json_' + e
                })
            }
        }
        if (item.type === 'DropDown') {
            data = this.computeDataForDropdown(item);
            value = filter.filter[item.id];
        }
        if(item.type === 'TextInput') {
            value = filter.filter[item.id];
            item.value = filter.filter[item.id];
        }


        return (
            <CardComponent
                key={item}
                item={item}
                isEditMode={true}
                isEditModeForDropDownInput={true}
                value={value}
                data={data}
                onChangeText={onChangeText}
                onChangeSectionedDropDown={onChangeSectionedDropDown}
                onChangeInterval={onChangeInterval}
                onChangeMultipleSelection={onChangeMultipleSelection}
                onSelectItem={onSelectItem}
                permissionsList={item.permissionsList}
            />
        )
    };

    computeDataForDropdown = (item) => {
        if (item.id === 'categories') {
            return filter(this.props.helpCategory, (o) => {
                return o.deleted === false && o.fileType === 'helpCategory.json'
            }).map((o) => { return { label: getTranslation(o.name, this.props.translation), value: o._id } })
        }
        if (item.categoryId) {
            return filter(this.props.referenceData, (o) => {
                return (o.active === true && o.categoryId === item.categoryId) && (
                    o.isSystemWide ||
                    !this.props.outbreak?.allowedRefDataItems ||
                    !this.props.outbreak.allowedRefDataItems[o.categoryId] ||
                    this.props.outbreak.allowedRefDataItems[o.categoryId][o.value]
                );
            })
                .sort((a, b) => { return a.order - b.order; })
                .map((o) => { return { label: getTranslation(o.value, this.props.translation), value: o.value } })
        }
        return [];
    };

    getLocationNameById = (element, locationId) => {
        if (extractIdFromPouchId(element._id, 'location') === locationId) {
            return element.name;
        } else {
            if (element.children && element.children.length > 0) {
                let i;
                let result = null;

                for (i = 0; result === null && i < element.children.length; i++) {
                    result = this.getLocationNameById(element.children[i], locationId);
                }
                return result;
            }
        }
        return null;
    };
}

const style = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: styles.screenBackgroundColor,
        flex: 1
    },
    containerScrollView: {
        backgroundColor: styles.screenBackgroundColor,
        flex: 1
    },
    containerCardComponent: {
        backgroundColor: styles.backgroundColor,
        borderRadius: 4
    },
    subcontainerCardComponent: {
        alignItems: 'center',
        borderRadius: 4,
        flex: 1
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
        locations: get(state, `locations.locations`, []),
        helpCategory: get(state, 'helpCategory', []),
        referenceData: get(state, 'referenceData', []),
        outbreak: get(state, 'outbreak', null)
    };
}

export default connect(mapStateToProps)(FiltersContainer);
