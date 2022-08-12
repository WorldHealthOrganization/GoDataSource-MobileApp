/**
 * Created by florinpopa on 23/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {useRef} from 'react';
import {calculateDimension, getTranslation} from './../utils/functions';
import config from './../utils/config';
import {useSelector} from "react-redux";
import {createSelector} from 'reselect';
import ElevatedView from 'react-native-elevated-view';
import ButtonWithIcons from './ButtonWithIcons';
import {Dropdown} from 'react-native-material-dropdown';
import lodashGet from 'lodash/get';
import styles from './../styles';

const selectValuePickerReduxData = createSelector(
    state => lodashGet(state, 'referenceData', []),
    state => lodashGet(state, 'app.screenSize', config.designScreenSize),
    state => lodashGet(state, 'app.translation', []),
    (referenceData, screenSize, translation) => {
        return {
            referenceData: referenceData ? referenceData.filter((e) => {
                return e.active && !e.deleted && e.categoryId === 'LNG_REFERENCE_DATA_CONTACT_DAILY_FOLLOW_UP_STATUS_TYPE'
            })
                .sort((a, b) => {
                    return a.order - b.order;
                })
                .map((e) => {
                    return {value: e.value}
                })
                : [],
            screenSize,
            translation
        }
    }
);

export default ValuePicker = React.memo(({value, onSelectValue, top}) => {
    const dropdown = useRef(null);
    const {referenceData, screenSize, translation} = useSelector(selectValuePickerReduxData);
    let data = referenceData;
    if (lodashGet(data, '[0].value', null) !== config.dropDownValues[0].value) {
        data.unshift(config.dropDownValues[0]);
    }

    const handlePressDropdown = () => {
        dropdown.current.focus();
    };

    const handleChangeText = (value, index, dataLocal) => {
        if (value !== config.dropDownValues[0].value) {
            onSelectValue({
                label: data[dataLocal.map((e) => {
                    return e.value
                }).indexOf(value)].label, value: value
            });
        } else {
            onSelectValue();
        }
    };

    return (
        <ElevatedView elevation={2} style={{backgroundColor: 'transparent'}}>
            <ButtonWithIcons
                label={value}
                width={calculateDimension(164, false, screenSize)}
                height={calculateDimension(30, true, screenSize)}
                firstIcon="visibility"
                secondIcon="arrow-drop-down"
                isFirstIconPureMaterial={true}
                isSecondIconPureMaterial={true}
                onPress={handlePressDropdown}
            >
                <Dropdown
                    ref={dropdown}
                    data={data.map((e) => {return {label: e.value === 'All' ? e.value : getTranslation(e.value, translation), value: e.value}})}
                    value={value}
                    renderAccessory={() => {
                        return null;
                    }}
                    dropdownOffset={{
                        top: top,
                        left: -calculateDimension(145, false, screenSize)
                    }}
                    dropdownPosition={0}
                    onChangeText={handleChangeText}
                    baseColor={styles.textColor}
                    textColor={styles.textColor}
                    itemColor={styles.secondaryColor}
                    selectedItemColor={styles.primaryColor}
                    disabledItemColor={styles.disabledColor}
                    pickerStyle={{borderRadius: 4, marginTop: 5, marginLeft: -4, width: 172}}
                />
            </ButtonWithIcons>
        </ElevatedView>
    );
})

ValuePicker.defaultProps = {
    width: 124,
    height: 25,
    firstIcon: "3d-rotation",
    secondIcon: "arrow-drop-down",
    data: []
};
