import React, {PureComponent} from 'react';
import {FlatList, Modal, Text, TextInput, StyleSheet, View} from 'react-native';
import {Icon} from 'react-native-material-ui';
import config from './../utils/config';
import Ripple from 'react-native-material-ripple';
import {connect} from "react-redux";
import {calculateDimension} from './../utils/functions';
import ElevatedView from 'react-native-elevated-view';
import Button from './Button';
import SectionedMultiSelectListItem from './SectionedMultiSelectListItem';
import cloneDeep from 'lodash/cloneDeep';
import debounce from 'lodash/debounce';
import styles from './../styles';

class SectionedMultiSelect extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {
            searchText: '',
            showAll: false,
            isModalVisible: false,
            reRenderProps: {
                selectedItems: [],
                expandedItems: []
            },
            allItems: this.props.allItems,
            items: this.props.items,
        };

        this.handleOnChangeTextSearch = debounce(this.handleOnChangeTextSearch, 2000);
    }

    // Since this.props.selectedItems is just an array of ids, we want to map them to the internal structure of the component
    componentWillMount() {
        let selectedItems = [];
        if (this.props.selectedItems && Array.isArray(this.props.selectedItems) && this.props.selectedItems.length > 0) {
            selectedItems = this.extractSelectedItems(this.props.allItems, this.props.selectedItems, '_id');
        } else {
            if (typeof this.props.selectedItems === 'string') {
                selectedItems = this.extractSelectedItems(this.props.allItems, [this.props.selectedItems], 'name');
            }
        }
        this.setState(prevState => ({
            reRenderProps: Object.assign({}, prevState.reRenderProps, {selectedItems: selectedItems})
        }));
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <View>
                {/**Component container*/}
                <Ripple onPress={this.handleOnPress}>
                    {/**Text and dropdown icon container*/}
                    <View style={style.sectionedMultiSelectDropdown}>
                        <Text style={style.sectionedMultiSelectDropdownLabel}>
                            {this.props.selectText}
                        </Text>
                        <Icon name={'arrow-drop-down'} />
                    </View>
                    {
                        this.props.showUnderline ? (
                            <View style={{ backgroundColor: this.props.underlineColor, height: 0.5, width: '100%'}} />
                        ) : (null)
                    }
                </Ripple>
                <Modal
                    visible={this.state.isModalVisible}
                    animationType={'slide'}
                    transparent={true}
                >
                    <View style={style.sectionedMultiSelectModalContainer}>
                        <ElevatedView
                            style={[
                                style.sectionedMultiSelectModal,
                                {
                                    marginHorizontal: calculateDimension(8, false, this.props.screenSize),
                                    width: calculateDimension(config.designScreenSize.width - 32, false, this.props.screenSize)
                                }
                            ]}
                            elevation={5}
                        >
                            {/**Search header*/}
                            <View style={style.sectionedMultiSelectModalSearch}>
                                <View style={style.sectionedMultiSelectModalSearchLabel}>
                                    <Icon name={'search'}/>
                                </View>
                                <TextInput
                                    style={style.sectionedMultiSelectModalSearchInput}
                                    value={this.state.searchText}
                                    onChangeText={this.handleOnChangeText}
                                    // onSubmitEditing={this.handleOnChangeTextSearch}
                                    placeholder={this.props.searchPlaceholderText}
                                    placeholderTextColor={styles.secondaryColor}
                                />
                            </View>
                            {/** Toggle list button */}
                            <View  style={style.sectionedMultiSelectModalToggleButton}>
                                <Button
                                    title={this.state.showAll ? 'SHOW LESS' : 'SHOW ALL'}
                                    height={calculateDimension(35, true, this.props.screenSize)}
                                    width={calculateDimension(360, true, this.props.screenSize)}
                                    style={{alignSelf:'center'}}
                                    color={styles.primaryColor}
                                    titleColor={styles.backgroundColor}
                                    titleStyle={{fontFamily: 'Roboto-Medium', fontSize: 14}}
                                    onPress={this.handleOnPressShowAll}
                                />
                            </View>
                            {/**List container*/}
                            <View style={style.sectionedMultiSelectModalContent}>
                                {this.handleRenderList(this.state.showAll ? this.state.allItems : this.state.items)}
                            </View>
                            {/**Action buttons container*/}
                            <View style={style.sectionedMultiSelectModalButtons}>
                                <Button
                                    title={'Ok'}
                                    height={calculateDimension(35, true, this.props.screenSize)}
                                    style={style.sectionedMultiSelectModalButtonOk}
                                    color={styles.primaryColor}
                                    titleColor={styles.backgroundColor}
                                    titleStyle={{fontFamily: 'Roboto-Medium', fontSize: 14}}
                                    onPress={this.handleOnPressOk}
                                />
                                <Button
                                    title={'Cancel'}
                                    height={calculateDimension(35, true, this.props.screenSize)}
                                    style={style.sectionedMultiSelectModalButtonCancel}
                                    color={styles.backgroundColor}
                                    titleColor={styles.textColor}
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
                style={{paddingHorizontal: 16}}
            />
        )
    };

    handleRenderItem = ({item, index}) => {
        return (
            <SectionedMultiSelectListItem
                item={item}
                uniqueKey={this.props.uniqueKey}
                subKey={this.props.subKey}
                handleOnSelectItem={this.handleOnSelectItem}
                handleOnPressExpand={this.handleOnPressExpand}
                handleRenderList={this.handleRenderList}
                iconWidth={calculateDimension(16, false, this.props.screenSize)}
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
            console.log('Selected items: ', this.state.reRenderProps.selectedItems);
        })
    };

    handleOnPressExpand = (itemId, onlyExpand) => {
        let expandedItemsClone = this.state.reRenderProps.expandedItems.slice();
        let elementIndex = expandedItemsClone.findIndex((e) => {return e === itemId});
        if (elementIndex > -1) {
            if (!onlyExpand) {
                expandedItemsClone.splice(elementIndex, 1);
            }
        } else {
            expandedItemsClone.push(itemId);
        }

        this.setState(prevState => ({
            reRenderProps: Object.assign({}, prevState.reRenderProps, {expandedItems: expandedItemsClone})
        }), () => {
            console.log('Expanded Items: ', this.state.reRenderProps.expandedItems);
        })
    };

    handleOnChangeText = (text) => {
        this.setState({
            searchText: text
        });
        this.handleOnChangeTextSearch();
    };

    handleOnChangeTextSearch = () => {
        let text = this.state.searchText;
        if (text !== '' && text !== null && text !== undefined) {
            let filteredData = this.filterData(cloneDeep(this.props.items), text);
            let filteredAllData = this.filterData(cloneDeep(this.props.allItems), text);
            this.setState(prevState => ({
                allItems: filteredAllData.filteredData,
                items: filteredData.filteredData,
                reRenderProps: Object.assign({}, prevState.reRenderProps, {expandedItems: this.state.showAll ? filteredAllData.expandedItems : filteredData.expandedItems})
            }))
        } else {
            this.setState(prevState => ({
                allItems: cloneDeep(this.props.allItems),
                items: cloneDeep(this.props.items),
                reRenderProps: Object.assign({}, prevState.reRenderProps, {expandedItems: []})
            }))
        }
    };

    handleOnPressShowAll = () => {
        this.setState(prevState => ({
            showAll: !this.state.showAll,
            allItems: cloneDeep(this.props.allItems),
            items: cloneDeep(this.props.items),
            reRenderProps: Object.assign({}, prevState.reRenderProps, {expandedItems: []}),
            searchText: ''
        }));
    };

    filterData = (items, text) => {
        let dataToReturn = {
            filteredData: [],
            expandedItems: []
        };
        for (let i=0; i<items.length; i++) {
            let keepData = null;
            if (items[i][this.props.subKey]) {
                let aux = this.filterData(items[i][this.props.subKey], text);
                keepData = aux.filteredData;
                dataToReturn.expandedItems = dataToReturn.expandedItems.concat(aux.expandedItems);
            }

            if (items[i].name.toUpperCase().includes(text.toUpperCase())) {
                if (keepData && Array.isArray(keepData) && keepData.length > 0) {
                    dataToReturn.filteredData.push(Object.assign({}, items[i], {children: keepData}));
                    if (items[i][this.props.subKey]) {
                        dataToReturn.expandedItems.push( items[i][this.props.uniqueKey]);
                    }
                } else {
                    dataToReturn.filteredData.push(Object.assign({}, items[i], {children: items[i][this.props.subKey]}));
                    delete items[i][this.props.subKey];
                }
            } else {
                if (keepData && Array.isArray(keepData) && keepData.length > 0) {
                    dataToReturn.filteredData.push(Object.assign({}, items[i], {children: keepData}));
                    dataToReturn.expandedItems.push( items[i][this.props.uniqueKey]);
                }
            }
        }

        return dataToReturn;
    };

    filterDataToExpand = (items, text) => {
        let filteredData = [];
        for (let i=0; i<items.length; i++) {
            if (items[i][this.props.subKey]) {
                filteredData = filteredData.concat(this.filterDataToExpand(items[i][this.props.subKey], text));
            }

            if (!items[i].name.toUpperCase().includes(text.toUpperCase())) {
                if (items[i][this.props.subKey]) {
                    filteredData.push( items[i][this.props.uniqueKey]);
                }
            }
        }

        return filteredData;
    };

    extractSelectedItems = (items, selectedItemsIds, parameter) => {
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

const style = StyleSheet.create({
    sectionedMultiSelectDropdown: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    sectionedMultiSelectDropdownLabel: {
        color: styles.textColor,
        fontFamily: 'Roboto-Regular',
        fontSize: 14
    },
    sectionedMultiSelectModalContainer: {
        alignItems: 'center',
        backgroundColor: styles.overlayColor,
        flex: 1,
        justifyContent: 'center'
    },
    sectionedMultiSelectModal: {
        alignSelf: 'center',
        backgroundColor: styles.backgroundColor,
        borderRadius: 4,
        height: '80%'
    },
    sectionedMultiSelectModalSearch: {
        alignItems: 'center',
        backgroundColor: styles.screenBackgroundColor,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        flexDirection: 'row'
    },
    sectionedMultiSelectModalSearchLabel: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 16
    },
    sectionedMultiSelectModalSearchInput: {
        color: styles.textColor,
        paddingHorizontal: 16,
        paddingVertical: 8
    },
    sectionedMultiSelectModalToggleButton: {
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: styles.backgroundColor,
        borderBottomWidth: 1,
        borderBottomColor: styles.separatorColor,
        flexDirection: 'row',
        padding: 8
    },
    sectionedMultiSelectModalContent: {
        flex: 1
    },
    sectionedMultiSelectModalButtons: {
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: styles.separatorColor,
        flexDirection: 'row',
        padding: 8
    },
    sectionedMultiSelectModalButtonOk: {
        flex: 0.75,
        marginRight: 4
    },
    sectionedMultiSelectModalButtonCancel: {
        flex: 0.25,
        marginLeft: 4
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        translation: state.app.translation,
    };
}

export default connect(mapStateToProps)(SectionedMultiSelect);
