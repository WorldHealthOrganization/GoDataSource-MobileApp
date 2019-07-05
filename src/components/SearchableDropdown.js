/**
 * Created by florinpopa on 22/10/2018.
 */
import React, { Component } from 'react';
import {StyleSheet, Text, ListView, View, TouchableOpacity, Keyboard } from 'react-native';
import TextInput from './TextInput';

var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

export default class SearchableDropDown extends Component{
    constructor(props) {
        super(props);
        this.state = {
            searchText: '',
            item: {},
            listItems: []
        };
        this.renderList = this.renderList.bind(this);
    };

    renderList() {
        return (
            <ListView
                style={{...this.props.itemsContainerStyle}}
                keyboardShouldPersistTaps="always"
                dataSource={ds.cloneWithRows(this.state.listItems)}
                renderRow={this.renderItems}/>
        )
    }

    componentDidMount(){
        const listItems = this.props.items;
        const defaultIndex = this.props.defaultIndex;
        if (defaultIndex && listItems.length > defaultIndex) {
            this.setState({
                listItems,
                item: listItems[defaultIndex]
            });
        }
        else {
            this.setState({listItems});
        }
    }

    searchedItems= (searchedText) => {
        console.log('Searched text', searchedText);
        this.setState({
            searchText: searchedText
        }, () => {
            this.props.onTextChange(searchedText);
        })
    };

    renderItems = (item) => {
        return (
            <TouchableOpacity style={{ ...this.props.itemStyle }} onPress={() => {
                this.setState({ item: item });
                Keyboard.dismiss();
                setTimeout(() => {
                    this.setState({
                        searchText: item.name
                    }, () => {
                        this.props.onItemSelect(item);
                    });
                }, 0);
            }}>
                <Text style={{ ...this.props.itemTextStyle }}>{item.name}</Text>
            </TouchableOpacity>
        );
    };

    render() {
        return (
            <View keyboardShouldpersist='always' style={{...this.props.containerStyle}}>
                <TextInput
                    id={'SearchableDropDownId'}
                    ref={(e) => this.input = e}
                    onChange={this.searchedItems}
                    isEditMode={true}
                    value={this.state.searchText}
                    label={this.props.placeholder}
                    onSubmitEditing={this.props.onSubmitEditing}
                    style={{width: '90%'}}
                    translation={this.props.translation}
                    isRequired={false}
                />
                <ListView
                    style={{...this.props.itemsContainerStyle}}
                    enableEmptySections={true}
                    keyboardShouldPersistTaps="always"
                    dataSource={ds.cloneWithRows(this.props.items)}
                    renderRow={this.renderItems}/>
            </View>
        );
    };
}
