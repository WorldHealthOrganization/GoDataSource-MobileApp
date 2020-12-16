/**
 * Created by florinpopa on 19/10/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import SearchableDropdown from './SearchableDropdown';

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
        this.props.onChange(state);
    };

    handleOnChangeText = (text) => {
        console.log('handleOnChangeText: ', text);
        this.setState({
            searchText: text
        })
    };
}

export default DropdownSearchable;
