import React, {useState} from 'react'
import {Text, StyleSheet, ScrollView} from 'react-native';
import Modal from 'react-native-modal';
import ElevatedView from 'react-native-elevated-view';
import PropTypes from 'prop-types';
import {createSelector} from 'reselect';
import styles from "../styles";
import LocalButton from './Button';
import SelectMultiple from 'react-native-select-multiple';
import {useSelector} from "react-redux";
import {calculateDimension, getTranslation} from "../utils/functions";
import {selectScreenSize, selectTranslations} from './../utils/selectors';
import {checkArrayAndLength} from "../utils/typeCheckingFunctions";
import {languageModalComponentLabels} from './../utils/translations';
import translations from "../utils/translations";

const selectLanguageModalComponentReduxProps = createSelector(
    [selectTranslations, selectScreenSize],
    (translation, screenSize) => [translation, screenSize]
);

const LanguageModalComponent = React.memo(({availableLanguages, showModal, onCancel, onPressDownload}) => {
    const [languages, setLanguages] = useState([]);
    const [showError, setShowError] = useState(false);
    const [translation, screenSize] = useSelector(selectLanguageModalComponentReduxProps);

    function onPressContinue() {
        if (checkArrayAndLength(languages)) {
            onPressDownload(languages.map((e) => e.value));
        } else {
            setShowError(true);
        }
    }

    function handleOnSelectionChange(selectedLanguages) {
        setLanguages(selectedLanguages);
        if (showError && checkArrayAndLength(selectedLanguages)) {
            setShowError(false);
        }
    }

    return (
        <Modal
            isVisible={showModal}
            onBackdropPress={onCancel}
        >
            <ElevatedView
                elevation={4}
                style={{
                    justifyContent: 'center',
                    backgroundColor: 'white',
                    alignItems: 'center',
                    marginHorizontal: 16,
                    padding: 8,
                    borderRadius: 10,
                    height: '70%',
                }}
            >
                <Text
                    style={style.titleText}>{getTranslation(translations.navigationDrawer.languagesLabel, translation)}</Text>
                <ScrollView>
                    <Text
                        style={style.subText}>{getTranslation(languageModalComponentLabels.infoMessage, translation)}</Text>
                    <SelectMultiple
                        style={{width: '100%'}}
                        items={availableLanguages}
                        selectedItems={languages}
                        onSelectionsChange={handleOnSelectionChange}
                    />
                </ScrollView>
                {
                    showError ? (
                        <Text
                            style={style.alertStyle}
                        >{getTranslation(languageModalComponentLabels.alertNoLanguage, translation)}</Text>
                    ) : (null)
                }

                <LocalButton
                    title={getTranslation(getTranslation(languageModalComponentLabels.downloadButton, translation))}
                    onPress={onPressContinue}
                    color={styles.buttonGreen}
                    titleColor={'white'}
                    height={calculateDimension(35, true, screenSize)}
                    width={calculateDimension(200, false, screenSize)}
                    style={{
                        marginVertical: calculateDimension(12.5, true, screenSize),
                        marginRight: 10
                    }}/>
            </ElevatedView>
        </Modal>
    )
});

const style = StyleSheet.create({
    titleText: {
        fontFamily: 'Roboto-Medium',
        fontSize: 18,
        marginVertical: 10
    },
    subText: {
        fontFamily: 'Roboto-Light',
        fontSize: 16,
        textAlign: 'center'
    },
    alertStyle: {
        fontFamily: 'Roboto-Light',
        fontSize: 16,
        textAlign: 'center',
        color: 'red',
        paddingVertical: 8
    }
});

LanguageModalComponent.propTypes = {
    showModal: PropTypes.bool.isRequired,
    availableLanguages: PropTypes.array.isRequired,
    onCancel: PropTypes.func.isRequired,
    onPressDownload: PropTypes.func.isRequired
};

LanguageModalComponent.defaultProps = {
    showModal: false,
    availableLanguages: [],
    onCancel: () => {console.log('Default onCancel of LanguageModalComponent')},
    onPressDownload: () => {console.log('Default onPressDownload of LanguageModalComponent')}
};

export default LanguageModalComponent