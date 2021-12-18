/**
 * Created by florinpopa on 22/10/2018.
 */
import React, {useState, useRef} from 'react';
import {FlatList, Text, View, ScrollView} from 'react-native';
import PropTypes from 'prop-types';
import TextInput from './TextInput';
import {useSelector} from "react-redux";
import Ripple from 'react-native-material-ripple';
import debounce from 'lodash/debounce';
import {getPersonsByName} from './../actions/cases';
import {computeFullName} from './../utils/functions';
import translations from './../utils/translations';
import lodashGet from "lodash/get";
import {createSelector} from "reselect/lib/index";

const selectOutbreakId = createSelector(
    state => lodashGet(state, 'outbreak._id', null),
    (outbreakId) => {
        return {outbreakId}
    }
);

SearchableDropDown = React.memo(({
                                     person,
                                     containerStyle,
                                     isEditMode,
                                     placeholder,
                                     onSubmitEditing,
                                     translation,
                                     itemsContainerStyle,
                                     itemStyle,
                                     itemTextStyle,
                                     onSelectExposure,
                                     type,
                                     relationshipType,
                                     value,
                                 }) => {
    const {outbreakId} = useSelector(selectOutbreakId);
    const delayedSearch = useRef(debounce((tex) => searchedItems(tex), 500)).current;

    const [text, setText] = useState(value);
    const [searchText, setSearchText] = useState('');
    const [item, setItem] = useState({});
    const [listItems, setListItems] = useState([]);

    const updateText = (tex) => {
        setText(tex);
        delayedSearch(tex);
    };

    let renderItems = (item) => {
        let caseItem = item.item;
        caseItem.fullName = computeFullName(caseItem);

        return (
            <Ripple style={{ ...itemStyle }} onPress={() => {setSelectedItem(caseItem)}}>
                <Text style={{ ...itemTextStyle }}>{caseItem.fullName}</Text>
            </Ripple>
        );
    };

    let setSelectedItem = (selectedItem) => {
        // Keyboard.dismiss();
            setItem(selectedItem);
            setText(selectedItem.fullName);
            setSearchText(selectedItem.fullName);
            setListItems([]);
            //Perform more actions
            onSelectExposure(selectedItem);
    };

    let searchedItems = (tex) => {
        // setSearchText(tex);
        if (tex === '') {
            setListItems([]);
        } else {
            getPersonsByName(outbreakId, tex, type, relationshipType)
                .then((cases) => {
                    let filteredCases = cases;
                    if (person){
                        filteredCases = cases.filter(e=>e._id !== person._id);
                    }
                    setListItems(filteredCases);
                })
                .catch((errorSearchCases) => {
                    console.log('ErrorSearchCases: ', errorSearchCases);
                })
        }
    };

    return (
        <View keyboardShouldpersist='always' style={{
            flex:1,
            ...containerStyle
        }}>
            <TextInput
                id={'SearchableDropDownId'}
                onChange={updateText}
                isEditMode={isEditMode}
                value={text}
                label={placeholder}
                onSubmitEditing={onSubmitEditing}
                style={{width: '90%'}}
                translation={translation}
                isRequired={false}
            />
            <FlatList
                nestedScrollEnabled={true}
                style={{
                    flex: 1,
                    maxHeight: 120,
                    ...itemsContainerStyle,
                }}
                enableEmptySections={true}
                keyboardShouldPersistTaps="always"
                data={listItems || []}
                renderItem={renderItems}/>
        </View>
    );
});

SearchableDropDown.propTypes = {
    isEditMode: PropTypes.bool,
    onSelectExposure: PropTypes.func,
    value: PropTypes.string,
    type: PropTypes.oneOf('Contact', 'Case').required
};

SearchableDropDown.defaultProps = {
    isEditMode: true,
    onSelectExposure: () => {console.log('Default onSelectExposure')},
    type: translations.personTypes.contacts
};

export default SearchableDropDown