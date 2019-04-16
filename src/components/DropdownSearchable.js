/**
 * Created by florinpopa on 19/10/2018.
 */
/**
 * Created by mobileclarisoft on 16/07/2018.
 */
import React, {PureComponent} from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import PropTypes from 'prop-types';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import SearchableDropdown from './SearchableDropdown';
import Ripple from 'react-native-material-ripple';
import {getContactsForOutbreakIdRequest} from './../queries/contacts';
import {extractIdFromPouchId, createName, getTranslation} from './../utils/functions';
import translations from './../utils/translations';
import cloneDeep from 'lodash/cloneDeep';

class DropdownSearchable extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {
            searchText: '',
            items: []
        }
    }

    // Please add here the react lifecycle methods that you need


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <SearchableDropdown
                onTextChange={this.handleOnChangeText}
                onItemSelect={this.handleOnChangeItem}
                containerStyle={{padding: 5, minHeight: 130}}
                itemTextStyle={{color: '#222'}}
                itemsContainerStyle={{maxHeight: 120}}
                items={this.state.items}
                defaultIndex={2}
                placeholder={this.props.placeholder}
                resetValue={false}
                onSubmitEditing={this.handleOnSubmitEditing}
            />
        )
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleOnChangeItem = (state) => {
        // if (this.props.labelValue) {
        //     console.log("Label value branch: ", this.props.data, state);
        //     if (this.props && this.props.data && Array.isArray(this.props.data)) {
        //         this.props.onChange(
        //             {
        //                 label: state.name, value: state.id
        //             },
        //             this.props.id,
        //             this.props.objectType ?
        //                 (this.props.objectType === 'Address' ? this.props.index :
        //                         (this.props.objectType === 'LabResult' ? this.props.index : this.props.objectType )
        //                 )
        //                 : this.props.data[this.props.data.map((e) => {
        //                     return e.value
        //                 }).indexOf(state)].type || null,
        //             this.props.objectType
        //         )
        //     }
        // } else {
        //     this.props.onChange(
        //         state,
        //         this.props.id,
        //         this.props.objectType ? (this.props.objectType === 'Address' ? this.props.index : (this.props.objectType === 'LabResult' ? this.props.index : this.props.objectType ) ) : null,
        //         this.props.objectType
        //     )
        // }

        console.log("handleOnChangeItem: ", state);
        this.props.onChange(state);
    };

    handleOnChangeText = (text) => {
        console.log('handleOnChangeText: ', text);
        this.setState({
            searchText: text
        })
    };

    handleOnSubmitEditing = () => {
        // here should make a query on contact for getting searched results
        // outbreakId should be passed by props
        // console.log('handleOnSubmitEditing: ', this.state.searchText);
        let searchText = cloneDeep(this.state.searchText);

        if (searchText && searchText.trim().length > 0) {
            let splitedFilter= searchText.split(" ");
            splitedFilter = splitedFilter.filter((e) => {return e !== ""});
            searchText = new RegExp(splitedFilter.join("|"), "ig");
        } else {
            searchText = null
        }

        getContactsForOutbreakIdRequest(this.props.outbreakId, {searchText: searchText}, null, (error, response) => {
            if (error) {
                Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.dropDownSearchableContactsError, this.props.translation), [
                    {
                        text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                        onPress: () => {console.log('Ok pressed')}
                    }
                ])
            }
            if (response) {
                // console.log('Response: ', response);
                this.setState({
                    items: response.map((e) => {
                        return {
                            id: extractIdFromPouchId(e._id, 'person.json'),
                            name: createName(e.type, e.firstName, e.lastName)
                        }
                    })
                }, () => {
                    console.log('Response mapped: ', this.state.items);
                })
            }
        })
    }
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({

});

DropdownSearchable.propTypes = {
};

export default DropdownSearchable;
