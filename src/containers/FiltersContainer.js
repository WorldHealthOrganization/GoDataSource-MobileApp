import React, {PureComponent} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {connect} from "react-redux";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import ElevatedView from 'react-native-elevated-view';
import filter from 'lodash/filter';
import get from 'lodash/get';
import {calculateDimension, extractIdFromPouchId, getTranslation} from './../utils/functions';
import config from './../utils/config';
import Button from './../components/Button';
import styles from './../styles';
import CardComponent from './../components/CardComponent';
import translations from './../utils/translations';

class FiltersContainer extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
        };
    };

    render() {
        console.log("Excuse me?", this.props.filter?.filter);
        const { configFilterScreen } = this.props
        const { handleMoveToNextScreenButton, onPressResetFilters, onPressApplyFilters } = this.props
        const { screenSize, translation } = this.props

        return (
            <View style={style.container}>
                <Button
                    title={getTranslation(translations.generalButtons.nextButtonLabel, translation)}
                    onPress={handleMoveToNextScreenButton}
                    color={styles.buttonGreen}
                    titleColor={'white'}
                    height={calculateDimension(25, true, screenSize)}
                    width={calculateDimension(130, false, screenSize)}
                    style={{
                        marginVertical: calculateDimension(12.5, true, screenSize),
                    }} />
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
        return this.renderItemCardComponent(item.fields, index)
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
        const { translation, filter } = this.props;
        const { onChangeSectionedDropDown, onChangeInterval, onChangeMultipleSelection, onSelectItem } = this.props;

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

        return (
            <CardComponent
                key={item}
                item={item}
                isEditMode={true}
                isEditModeForDropDownInput={true}
                value={value}
                data={data}

                onChangeSectionedDropDown={onChangeSectionedDropDown}
                onChangeInterval={onChangeInterval}
                onChangeMultipleSelection={onChangeMultipleSelection}
                onSelectItem={onSelectItem}
                permissionsList={item.permissionsList}
            />
        )
    };

    computeDataForDropdown = (item) => {
        if (item.id === 'classification') {
            return filter(this.props.referenceData, (o) => { return o.active === true && o.categoryId.includes("CASE_CLASSIFICATION") })
                .sort((a, b) => { return a.order - b.order; })
                .map((o) => { return { label: getTranslation(o.value, this.props.translation), value: o.value } })
        } else if (item.id === 'categories') {
            return filter(this.props.helpCategory, (o) => {
                return o.deleted === false && o.fileType === 'helpCategory.json'
            }).map((o) => { return { label: getTranslation(o.name, this.props.translation), value: o._id } })
        } else if (item.id === 'vaccines') {
            return filter(this.props.referenceData, (o) => { return o.active === true && o.categoryId === "LNG_REFERENCE_DATA_CATEGORY_VACCINE" })
                .sort((a, b) => { return a.order - b.order; })
                .map((o) => { return { label: getTranslation(o.value, this.props.translation), value: o.value } })
        } else if (item.id === 'vaccineStatuses') {
            return filter(this.props.referenceData, (o) => { return o.active === true && o.categoryId === "LNG_REFERENCE_DATA_CATEGORY_VACCINE_STATUS" })
                .sort((a, b) => { return a.order - b.order; })
                .map((o) => { return { label: getTranslation(o.value, this.props.translation), value: o.value } })
        } else if (item.id === 'pregnancyStatuses') {
            return filter(this.props.referenceData, (o) => { return o.active === true && o.categoryId === "LNG_REFERENCE_DATA_CATEGORY_PREGNANCY_STATUS" })
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
    containerButtonApplyFilters: {
        flex: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 22,
        marginTop: 10
    },
    containerScrollView: {
        flex: 1,
        backgroundColor: styles.screenBackgroundGrey,
    },
});

function mapStateToProps(state) {
    return {
        screenSize: get(state, 'app.screenSize', config.designScreenSize),
        translation: get(state, 'app.translation', []),
        locations: get(state, `locations.locations`, []),
        helpCategory: get(state, 'helpCategory', []),
        referenceData: get(state, 'referenceData', [])
    };
}

export default connect(mapStateToProps)(FiltersContainer);
