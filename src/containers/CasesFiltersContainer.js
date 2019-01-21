/**
 * Created by mobileclarisoft on 30/08/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {calculateDimension, getTranslation} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import Button from './../components/Button';
import styles from './../styles';
import CardComponent from './../components/CardComponent';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import translations from './../utils/translations'
import ElevatedView from 'react-native-elevated-view';
import _ from 'lodash';

class CasesFiltersContainer extends PureComponent {

    // This will be a container, so put as less business logic here as possible
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    // Please add here the react lifecycle methods that you need


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <View style={style.container}>
                <Button
                    title={getTranslation(translations.generalButtons.nextButtonLabel, this.props.translation)}
                    onPress={this.props.handleMoveToNextScreenButton}
                    color={styles.buttonGreen}
                    titleColor={'white'}
                    height={calculateDimension(25, true, this.props.screenSize)}
                    width={calculateDimension(130, false, this.props.screenSize)}
                    style={{
                        marginVertical: calculateDimension(12.5, true, this.props.screenSize),
                    }}/>
                <KeyboardAwareScrollView
                    style={style.containerScrollView}
                    contentContainerStyle={[style.contentContainerStyle, {paddingBottom: this.props.screenSize.height < 600 ? 70 : 20}]}
                    keyboardShouldPersistTaps={'always'}
                >
                {
                    config.casesFilterScreen.filter.map((item,index) => {
                        return this.handleRenderItem(item, index);
                    })
                }
                </KeyboardAwareScrollView>
                <View style={style.containerButtonApplyFilters}>
                    <Button
                        title={getTranslation(translations.generalLabels.applyFiltersButton, this.props.translation)}
                        color={styles.buttonGreen}
                        onPress={this.props.onPressApplyFilters}
                        width={calculateDimension(343, false, this.props.screenSize)}
                        height={calculateDimension(32, true, this.props.screenSize)}
                        style={{alignSelf: 'center'}}
                        titleStyle={{fontFamily: 'Roboto-Medium', fontSize: 14}}
                        titleColor={'white'}
                    />
                </View>
            </View>
        );
    };

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (item, index) => {
        return this.renderItemCardComponent(item.fields, index)
    };

    renderItemCardComponent = (fields, cardIndex = null) => {
        return (
            <ElevatedView elevation={3} style={[style.containerCardComponent, {
                marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                width: calculateDimension(config.designScreenSize.width - 32, false, this.props.screenSize),
                marginVertical: 4,
                minHeight: calculateDimension(72, true, this.props.screenSize)
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
        let value = '';
        let data = []
        if (item.type === 'Selector' && item.id === 'gender') {
            item.data = item.data.map((e) => {return {
                value: getTranslation(e.value, this.props.translation), 
                selected: this.props.filter && this.props.filter.filter && this.props.filter.filter.gender && this.props.filter.filter.gender[e.value] ? true : false}
            })
        }
        if (item.type === 'IntervalPicker' && item.id === 'age') {
            item.value = this.props.filter.filter[item.id];
        }
        if (item.type === 'DropDownSectioned' && item.id === 'selectedLocations') {
            sectionedSelectedItems = this.props.filter.filter[item.id].map ((e) => {
                return 'location.json_' + e
            })
        }
        if (item.type === 'DropDown' && item.id === 'classification') {
            data = this.computeDataForDropdown(item);
            value = this.props.filter.filter[item.id];
        }

        return (
            <CardComponent
                item={item}
                isEditMode={true}
                isEditModeForDropDownInput={true}
                value={value}
                filter={this.props.filter}
                data={data}

                onChangeSectionedDropDown={this.props.onChangeSectionedDropDown}
                onChangeInterval={this.props.onChangeInterval}
                onChangeMultipleSelection={this.props.onChangeMultipleSelection}
                onSelectItem={this.props.onSelectItem}
            />
        )
    };

    computeDataForDropdown = (item) => {
        if (item.id === 'classification') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId.includes("CASE_CLASSIFICATION")
            }).map((o) => {return {label: getTranslation(o.value, this.props.translation), value: o.value}})
        }

        return [];
    };
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
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
    containerScrollView: {
        flex: 1,
        backgroundColor: styles.screenBackgroundGrey,
    },
    containerButtonApplyFilters: {
        flex: 0,
        justifyContent: 'flex-end',
        marginBottom: 22,
        marginTop: 10
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        cases: state.cases,
        translation: state.app.translation,
        referenceData: state.referenceData,
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(CasesFiltersContainer);
