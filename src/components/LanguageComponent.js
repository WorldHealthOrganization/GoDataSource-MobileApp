import React, {useState, useEffect} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {useSelector, useDispatch} from 'react-redux';
import {createSelector} from 'reselect'
import lodashDifference from 'lodash/differenceBy';
import {Dropdown} from 'react-native-material-dropdown';
import LanguageModalComponent from './LanguageModalComponent';
import {updateRequiredFields, getTranslation} from "../utils/functions";
import {updateUser} from './../actions/user';
import {getTranslationsAsync, addLanguagePacks} from './../actions/app';
import {checkArrayAndLength} from "../utils/typeCheckingFunctions";
import {selectTranslations, selectUserLanguage, selectUser, selectAllLanguages, selectOutbreak} from './../utils/selectors';
import {useSetStateWithCallback} from "../utils/hooks";
import translations from './../utils/translations';
import {Navigation} from "react-native-navigation";
import styles from './../styles';

const selectReduxDataForLanguageComponent = createSelector(
    [selectTranslations, selectUserLanguage, selectAllLanguages, selectUser, selectOutbreak],
    (translation, userLanguage, allLanguages, user, outbreak) => [translation, userLanguage, allLanguages, user, outbreak]
);

const LanguageComponent = React.memo(({style, componentId}) => {
    const [translation, userLanguage, {apiLanguages, deviceLanguages}, user, outbreak] = useSelector(selectReduxDataForLanguageComponent);
    const [showModal, setShowModal] = useSetStateWithCallback(false);
    const [selectedLanguage, setSelectedLanguage] = useState(userLanguage);
    const [availableLanguages, setAvailableLanguages] = useState(deviceLanguages);
    const dispatch = useDispatch();

    useEffect(() => {
        if (checkArrayAndLength(apiLanguages) && checkArrayAndLength(deviceLanguages) && apiLanguages.length !== deviceLanguages.length) {
            setAvailableLanguages(deviceLanguages.concat({label: getTranslation(translations.navigationDrawer.addLanguagePacks, translation), value: 'addLanguagePack'}))
        } else {
            setAvailableLanguages(deviceLanguages);
        }
    }, [deviceLanguages, apiLanguages]);

    function setUserLanguage(value) {
        // console.log('value', value)
        if (value === 'addLanguagePack') {
            Navigation.mergeOptions(componentId, {
                sideMenu: {
                    left: {
                        visible: false,
                    },
                },
            });
            //Timeout?
            setTimeout(() => {
                setShowModal(true);
                setSelectedLanguage(value);
            }, 500);
        } else {
            if (value !== selectedLanguage) {
                let userClone = Object.assign({}, user);
                userClone.languageId = value;
                dispatch(getTranslationsAsync(value, outbreak._id));

                userClone = updateRequiredFields(outbreak._id, userClone._id, userClone, 'update');
                setSelectedLanguage(value);

                dispatch(updateUser(userClone));
            }
        }
    }

    function onCancel () {
        // console.log('On cancel');
        setSelectedLanguage(userLanguage);
        setShowModal(false);
    }

    function onPressDownload(languagePacks) {
        // console.log("onPressDownload: ", languagePacks);
        setShowModal(false, (newShowModalValue) => {
            setTimeout(() => {
                dispatch(addLanguagePacks(languagePacks));
            }, 500);
        });
    }

    return (
        <View style={[{flexDirection: 'row'}, style]}>
            <View style={{flex: 1}}>
                <Dropdown
                    label={getTranslation(translations.navigationDrawer.languagesLabel, translation)}
                    data={availableLanguages}
                    value={selectedLanguage}
                    onChangeText={setUserLanguage}
                    inputContainerStyle={{borderBottomColor: 'transparent'}}
                    pickerStyle={{width: '80%'}}
                    selectedItemColor={styles.primaryColor}
                />
            </View>
            <LanguageModalComponent
                availableLanguages={lodashDifference(apiLanguages.map((e) => Object.assign({}, {label: e.name, value: e._id})), deviceLanguages, 'value')}
                showModal={showModal}
                onCancel={onCancel}
                onPressDownload={onPressDownload}
            />
        </View>
    )
});

LanguageComponent.propTypes = {
    componentId: PropTypes.string.isRequired,
    style: PropTypes.object.isRequired
};

LanguageComponent.defaultProps = {
    componentId: {},
    style: {}
};

export default LanguageComponent;
