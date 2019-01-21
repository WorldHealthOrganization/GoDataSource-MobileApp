/**
 * Created by florinpopa on 25/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {calculateDimension, getTranslation} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import Button from './../components/Button';
import styles from './../styles';
import Ripple from 'react-native-material-ripple';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import CardComponent from './../components/CardComponent';
import ElevatedView from 'react-native-elevated-view';
import translations from './../utils/translations'
import _ from 'lodash';

class HelpSortContainer extends Component {

    // This will be a container, so put as less business logic here as possible
    constructor(props) {
        super(props);
        this.state = {
            addSortRuleText: getTranslation(translations.sortTab.addSortRule, this.props.translation)
        };
    }
    // Please add here the react lifecycle methods that you need
    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.filter.sort.length !== nextProps.filter.sort.length) {
            return true
        }

        return false
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <View style={[style.container]}>
                <KeyboardAwareScrollView
                    style={style.containerScrollView}
                    contentContainerStyle={[style.contentContainerStyle, {paddingBottom: this.props.screenSize.height < 600 ? 70 : 20}]}
                    keyboardShouldPersistTaps={'always'}
                >
                    <View style={style.container}>
                        {
                            this.props.filter && this.props.filter.sort && this.props.filter.sort.map((item, index) => {
                                return this.handleRenderItem(item, index)
                            })
                        }
                    </View>
                    {
                        this.props.filter.sort.length < config.helpItemsSortCriteriaDropDownItems.length ? 
                            <View style={{alignSelf: 'flex-start', marginHorizontal: calculateDimension(16, false, this.props.screenSize), marginVertical: 20}}>
                                <Ripple
                                    style={{
                                        height: 25,
                                        justifyContent: 'center'
                                    }}
                                    onPress={this.props.onPressAddSortRule}
                                >
                                    <Text style={{fontFamily: 'Roboto-Medium', fontSize: 12, color: styles.buttonGreen}}>
                                        {this.state.addSortRuleText}
                                    </Text>
                                </Ripple>
                            </View> : null
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
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (item, index) => {
        let fields = config.helpFilterScreen.sort.fields
        return this.renderItemCardComponent(fields, index)
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
        if (item.type === 'DropdownInput' && item.id === 'sortCriteria') {
            let configSortCiteriaFilter = config.helpItemsSortCriteriaDropDownItems.filter ((e) => {
                return this.props.filter.sort.map((k) => {return k.sortCriteria}).indexOf(e.value) === -1
            })
            item.data = configSortCiteriaFilter.map((e) => { return {label: getTranslation(e.value, this.props.translation), value: e.value }})
            value = this.computeValueForSortScreen(item, cardIndex);
        }
        if (item.type === 'DropdownInput' && item.id === 'sortOrder') {
            item.data = config.sortOrderDropDownItems.map((e) => { return {label: getTranslation(e.value, this.props.translation), value: e.value }})
            value = this.computeValueForSortScreen(item, cardIndex);
        }
        if (item.type === 'ActionsBar') {
            item.onPressArray = [this.props.onDeletePress]
        }

        return (
            <CardComponent
                item={item}
                isEditMode={true}
                isEditModeForDropDownInput={true}
                value={value}
                index={cardIndex}
                filter={this.props.filter}

                onChangeSectionedDropDown={this.props.onChangeSectionedDropDown}
                onChangeDropDown={this.props.onChangeDropDown}
                onDeletePress={this.props.onDeletePress}
            />
        )
    };

    computeValueForSortScreen = (item, index) => {
        if (index !== null && index >= 0) {
            if (item.objectType === 'Sort') {
                return this.props.filter && this.props.filter.sort && Array.isArray(this.props.filter.sort) && this.props.filter.sort.length > 0 && this.props.filter.sort[index][item.id] !== undefined ?
                getTranslation(this.props.filter.sort[index][item.id], this.props.translation) : '';
            }
        }
        return this.props.filter && this.props.filter[item.id] ? getTranslation(this.props.filter[item.id], this.props.translation) : '';
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
        justifyContent: 'flex-end',
        marginBottom: 22,
        marginTop: 10
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        translation: state.app.translation,
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(HelpSortContainer);
