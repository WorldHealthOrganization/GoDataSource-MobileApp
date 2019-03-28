import React, {PureComponent} from 'react';
import {View, Text, Modal, StyleSheet, TextInput, FlatList} from 'react-native';
import {Icon} from 'react-native-material-ui';
import config from './../utils/config';
import Ripple from 'react-native-material-ripple';
import stylesGlobal from './../styles';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import translations from './../utils/translations'
import {getTranslation, getTooltip, calculateDimension} from './../utils/functions';
import TooltipComponent from './TooltipComponent';
import ElevatedView from 'react-native-elevated-view';
import Button from './Button';
import SectionedMultiSelectListItem from './SectionedMultiSelectListItem';

class SectionedMultiSelect extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {
            searchText: '',
            isModalVisible: false,
            reRenderProps: {
                selectedItems: [],
                expandedItems: []
            },
            allItems: this.props.items
        };
    }

    // Since this.props.selectedItems is just an array of ids, we want to map them to the internal structure of the component
    componentWillMount() {
        let selectedItems = [];
        if (this.props.selectedItems && Array.isArray(this.props.selectedItems) && this.props.selectedItems.length > 0) {
            selectedItems = this.extractSelectedItems(this.props.items, this.props.selectedItems, '_id');
        } else {
            if (typeof this.props.selectedItems === 'string') {
                selectedItems = this.extractSelectedItems(this.props.items, [this.props.selectedItems], 'name');
            }
        }

        console.log('SectionedMultiSelect componentWillMount selectedItems: ', selectedItems);
        this.setState(prevState => ({
            reRenderProps: Object.assign({}, prevState.reRenderProps, {selectedItems: selectedItems})
        }));
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        // console.log("SectionedMultiSelect: ", this.props.items);
        return (
            <View>
                {/*Component container*/}
                <Ripple onPress={this.handleOnPress}>
                    {/*Text and dropdown icon container*/}
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Text>{this.props.selectText}</Text>
                        <Icon name={'arrow-drop-down'} />
                    </View>
                    {
                        this.props.showUnderline ? (
                            <View style={{
                                width: '100%',
                                height: 0.5,
                                backgroundColor: this.props.underlineColor
                            }}/>
                        ) : (null)
                    }
                </Ripple>
                <Modal
                    visible={this.state.isModalVisible}
                    animationType={'slide'}
                    transparent={true}
                >
                    <View style={{
                        flex: 1,
                        backgroundColor: 'transparent',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <ElevatedView
                            style={{
                                width: calculateDimension(this.props.screenSize.width - 28, false, this.props.screenSize),
                                height: '80%',
                                backgroundColor: 'white',
                                alignSelf: 'center',
                                marginHorizontal: calculateDimension(6.5, false, this.props.screenSize)
                            }}
                            elevation={5}
                        >
                            {/*Search header*/}
                            <View
                                style={{
                                    flex: 0.1,
                                    flexDirection: 'row',
                                    backgroundColor: stylesGlobal.screenBackgroundGrey,
                                    alignItems: 'center'
                                }}
                            >
                                <View
                                    style={{
                                        flex: 0.15,
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Icon name={'search'}/>
                                </View>
                                <TextInput
                                    style={{
                                        flex: 0.9,
                                        marginRight: 13
                                    }}
                                    value={this.state.searchText}
                                    onChangeText={this.handleOnChangeTextSearch}
                                    placeholder={this.props.searchPlaceholderText}
                                />
                            </View>
                            {/*List container*/}
                            <View
                                style={{
                                    flex: 0.8,
                                    marginHorizontal: calculateDimension(14, false, this.props.screenSize),
                                    marginTop: calculateDimension(6.5, true, this.props.screenSize)
                                }}
                            >
                                {
                                    this.handleRenderList(this.state.allItems)
                                }
                            </View>
                            {/*Action buttons container*/}
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    flex: 0.1
                                }}
                            >
                                <Button
                                    title={'Ok'}
                                    height={calculateDimension(32, true, this.props.screenSize)}
                                    style={{
                                        marginHorizontal: 6.5,
                                        flex: 0.75
                                    }}
                                    color={stylesGlobal.buttonGreen}
                                    titleColor={'white'}
                                    titleStyle={{fontFamily: 'Roboto-Medium', fontSize: 14}}
                                    onPress={this.handleOnPressOk}
                                />
                                <Button
                                    title={'Cancel'}
                                    height={calculateDimension(32, true, this.props.screenSize)}
                                    style={{
                                        marginHorizontal: 6.5,
                                        flex: 0.25
                                    }}
                                    color={'white'}
                                    titleColor={'black'}
                                    titleStyle={{fontFamily: 'Roboto-Medium', fontSize: 14}}
                                    onPress={this.handleOnPress}
                                />
                            </View>
                        </ElevatedView>
                    </View>
                </Modal>
            </View>
        )
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleOnPressOk = () => {
        this.props.onSelectedItemsChange(this.state.reRenderProps.selectedItems);
        this.setState({
            isModalVisible: !this.state.isModalVisible
        })
    };

    handleOnPress = () => {
        this.setState({
            isModalVisible: !this.state.isModalVisible
        })
    };

    keyExtractor = (item, index) => item[this.props.uniqueKey];

    handleRenderList = (listItems) => {
        return (
            <FlatList
                data={listItems}
                extraData={this.state.reRenderProps}
                renderItem={this.handleRenderItem}
                keyExtractor={this.keyExtractor}
            />
        )
    };

    handleRenderItem = ({item, index}) => {
        // console.log('handleRenderItem: ', this.props.selectedItems);
        return (
            <SectionedMultiSelectListItem
                item={item}
                uniqueKey={this.props.uniqueKey}
                subKey={this.props.subKey}
                handleOnSelectItem={this.handleOnSelectItem}
                handleOnPressExpand={this.handleOnPressExpand}
                handleRenderList={this.handleRenderList}
                iconWidth={calculateDimension(20, false, this.props.screenSize)}
                selectedItems={this.state.reRenderProps.selectedItems}
                selectToggleIconComponent={this.props.selectToggleIconComponent}
                expandedItems={this.state.reRenderProps.expandedItems}
                dropDownToggleIconUpComponent={this.props.dropDownToggleIconUpComponent}
                dropDownToggleIconDownComponent={this.props.dropDownToggleIconDownComponent}
            />
        )
    };

    handleOnSelectItem = (item) => {

        let selectedItemsClone = this.state.reRenderProps.selectedItems.slice();
        let elementIndex = selectedItemsClone.findIndex((e) => {
            return e[this.props.uniqueKey] === item[this.props.uniqueKey]
        });
        if (elementIndex > -1) {
            selectedItemsClone.splice(elementIndex, 1);
        } else {
            if (this.props.single) {
                selectedItemsClone[0] = item;
            } else {
                selectedItemsClone.push(item);
            }
        }

        this.setState(prevState => ({
            reRenderProps: Object.assign({}, prevState.reRenderProps, {selectedItems: selectedItemsClone})
        }), () => {
            console.log('Selected Items biatch: ', this.state.reRenderProps.selectedItems);
        })
    };

    handleOnPressExpand = (itemId) => {
        let expandedItemsClone = this.state.reRenderProps.expandedItems.slice();
        let elementIndex = expandedItemsClone.findIndex((e) => {return e === itemId});
        if (elementIndex > -1) {
            expandedItemsClone.splice(elementIndex, 1);
        } else {
            expandedItemsClone.push(itemId);
        }

        this.setState(prevState => ({
            reRenderProps: Object.assign({}, prevState.reRenderProps, {expandedItems: expandedItemsClone})
        }), () => {
            console.log('Selected Items biatch: ', this.state.reRenderProps.expandedItems);
        })
    };

    handleOnChangeTextSearch = (text) => {
        this.setState({
            searchText: text
        }, () => {
            console.log('Here do the filtering');
            let filteredData = this.filterData(this.props.items.slice(), text);
            this.setState({
                allItems: filteredData
            })
        })
    };

    filterData = (items, text) => {
        let filteredData = [];
        for (let i=0; i<items.length; i++) {
            let keepData = null;
            if (items[i][this.props.subKey]) {
                keepData = this.filterData(items[i][this.props.subKey], text);
            }

            if (items[i].name.toUpperCase().includes(text.toUpperCase())) {
                if (keepData && Array.isArray(keepData) && keepData.length > 0) {
                    filteredData.push(Object.assign({}, items[i], {children: keepData}))
                } else {
                    delete items[i][this.props.subKey];
                    filteredData.push(items[i]);
                }
            } else {
                if (keepData && Array.isArray(keepData) && keepData.length > 0) {
                    filteredData.push(Object.assign({}, items[i], {children: keepData}))
                }
            }
        }

        return filteredData;
    };

    extractSelectedItems = (items, selectedItemsIds, parameter) => {
        // console.log('extractSelectedItems selectedItemsIds: ', selectedItemsIds, parameter)
        let selectedItems = [];
        for (let i=0; i<items.length; i++) {
            if (items[i].children) {
                selectedItems = selectedItems.concat(this.extractSelectedItems(items[i].children, selectedItemsIds, parameter));
            }
            if (selectedItemsIds.findIndex((e) => {return e === items[i][parameter]}) > -1) {
                selectedItems.push(items[i]);
            }
        }
        return selectedItems;
    };
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
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

export default connect(mapStateToProps, matchDispatchProps)(SectionedMultiSelect);
