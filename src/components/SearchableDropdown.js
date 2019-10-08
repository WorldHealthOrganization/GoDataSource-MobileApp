/**
 * Created by florinpopa on 22/10/2018.
 */
import React, { Component } from 'react';
import {Text, View, FlatList } from 'react-native';
import PropTypes from 'prop-types';
import TextInput from './TextInput';
import {connect} from "react-redux";
import Ripple from 'react-native-material-ripple';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import {getCasesByName} from './../actions/cases';
import {computeFullName} from './../utils/functions';

class SearchableDropDown extends Component{
    constructor(props) {
        super(props);
        this.state = {
            text: '',
            searchText: '',
            item: {},
            listItems: []
        };
        this.searchedItems = debounce(this.searchedItems, 2000);
    };

    componentDidMount(){
        this.setState({
            text: get(this.props, 'value', '')
        })
    }

    updateText = (text) => {
        this.setState({
            text: text
        });
        this.searchedItems();
    };

    searchedItems = () => {
        this.setState({
            searchText: this.state.text
        }, () => {
            if (this.state.searchText === '') {
                this.setState({
                    listItems: []
                })
            } else {
                getCasesByName(this.props.outbreakId, this.state.searchText)
                    .then((cases) => {
                        // console.log('Cases: ', cases);
                        this.setState({
                            listItems: cases
                        })
                    })
                    .catch((errorSearchCases) => {
                        console.log('ErrorSearchCases: ', errorSearchCases);
                    })
            }
        })
    };

    renderItems = (item) => {
        let caseItem = item.item;
        caseItem.fullName = computeFullName(caseItem);

        return (
            <Ripple style={{ ...this.props.itemStyle }} onPress={() => {this.setSelectedItem(caseItem)}}>
                <Text style={{ ...this.props.itemTextStyle }}>{caseItem.fullName}</Text>
            </Ripple>
        );
    };

    setSelectedItem = (selectedItem) => {
        // Keyboard.dismiss();
        this.setState({
            item: selectedItem,
            text: selectedItem.fullName,
            searchText: selectedItem.fullName,
            listItems: []
        }, () => {
            //Perform more actions
            this.props.onSelectExposure(selectedItem);
        })
    };

    render() {
        return (
            <View keyboardShouldpersist='always' style={{...this.props.containerStyle}}>
                <TextInput
                    id={'SearchableDropDownId'}
                    ref={(e) => this.input = e}
                    onChange={this.updateText}
                    isEditMode={this.props.isEditMode}
                    value={this.state.text}
                    label={this.props.placeholder}
                    onSubmitEditing={this.props.onSubmitEditing}
                    style={{width: '90%'}}
                    translation={this.props.translation}
                    isRequired={false}
                />
                <FlatList
                    style={{...this.props.itemsContainerStyle}}
                    enableEmptySections={true}
                    keyboardShouldPersistTaps="always"
                    data={this.state.listItems || []}
                    renderItem={this.renderItems}/>
            </View>
        );
    };
}

SearchableDropDown.propTypes = {
    isEditMode: PropTypes.bool,
    onSelectExposure: PropTypes.func,
    value: PropTypes.string
};

SearchableDropDown.defaultProps = {
    isEditMode: true,
    onSelectExposure: () => {console.log('Default onSelectExposure')},

};

function mapStateToProps(state) {
    return {
        outbreakId: get(state, 'user.activeOutbreakId', null)
    }
}

export default connect(mapStateToProps)(SearchableDropDown)