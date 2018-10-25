/**
 * Created by florinpopa on 22/10/2018.
 */
import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    ListView,
    // TextInput,
    View,
    TouchableOpacity,
    Keyboard
} from 'react-native';
import TextInput from './TextInput';

var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
export default class SearchableDropDown extends Component{
    constructor(props) {
        super(props);
        this.state = {
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
        const onTextChange = this.props.onTextChange;
        if (onTextChange && typeof onTextChange === 'function') {
            setTimeout(() => {
                onTextChange(searchedText);
            }, 0);
        }
    };

    renderItems = (item) => {
        return (
            <TouchableOpacity style={{ ...this.props.itemStyle }} onPress={() => {
                this.setState({ item: item });
                Keyboard.dismiss();
                setTimeout(() => {
                    this.props.onItemSelect(item);
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
                    ref={(e) => this.input = e}
                    onChangeText={(text) => {
                        this.searchedItems(text)}
                    }
                    value={this.state.item.name}
                    label={this.props.placeholder}
                    onSubmitEditing={this.props.onSubmitEditing}
                />
                <ListView
                    style={{...this.props.itemsContainerStyle}}
                    keyboardShouldPersistTaps="always"
                    dataSource={ds.cloneWithRows(this.props.items)}
                    renderRow={this.renderItems}/>
            </View>
        );
    };
}