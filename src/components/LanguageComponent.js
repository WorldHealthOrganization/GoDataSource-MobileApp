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
import {selectTranslations, selectUserLanguage, selectUser, selectAllLanguages} from './../utils/selectors';
import {useSetStateWithCallback} from "../utils/hooks";
import translations from './../utils/translations';


const selectReduxDataForLanguageComponent = createSelector(
    [selectTranslations, selectUserLanguage, selectAllLanguages, selectUser],
    (translation, userLanguage, allLanguages, user) => [translation, userLanguage, allLanguages, user]
);

const LanguageComponent = React.memo(({style, navigator}) => {
    const [translation, userLanguage, {apiLanguages, deviceLanguages}, user] = useSelector(selectReduxDataForLanguageComponent);
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
            navigator.toggleDrawer({
                    side: 'left',
                    animated: true,
                    to: 'closed'
                });
            setTimeout(() => {
                setShowModal(true);
                setSelectedLanguage(value);
            }, 500);
        } else {
            if (value !== selectedLanguage) {
                let userClone = Object.assign({}, user);
                userClone.languageId = value;
                dispatch(getTranslationsAsync(value, userClone?.activeOutbreakId));

                userClone = updateRequiredFields(userClone.activeOutbreakId, userClone._id, userClone, 'update');
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
    navigator: PropTypes.object.isRequired,
    style: PropTypes.object.isRequired
};

LanguageComponent.defaultProps = {
    navigator: {},
    style: {}
};

export default LanguageComponent;
