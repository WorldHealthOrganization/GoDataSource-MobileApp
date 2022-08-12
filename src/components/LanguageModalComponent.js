import React, {useState} from 'react'
import {Text, StyleSheet, ScrollView} from 'react-native';
import Modal from 'react-native-modal';
import ElevatedView from 'react-native-elevated-view';
import PropTypes from 'prop-types';
import {createSelector} from 'reselect';
import LocalButton from './Button';
import SelectMultiple from 'react-native-select-multiple';
import {useSelector} from "react-redux";
import {calculateDimension, getTranslation} from "../utils/functions";
import {selectScreenSize, selectTranslations} from './../utils/selectors';
import {checkArrayAndLength} from "../utils/typeCheckingFunctions";
import translations from "../utils/translations";
import styles from "../styles";

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
                elevation={5}
                style={style.languageModalContainer}
            >
                <Text
                    style={style.titleText}>{getTranslation(translations.navigationDrawer.languagesLabel, translation)}</Text>
                <ScrollView>
                    <Text
                        style={style.subText}>{getTranslation(translations.languageModalComponentLabels.infoMessage, translation)}</Text>
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
                        >{getTranslation(translations.languageModalComponentLabels.alertNoLanguage, translation)}</Text>
                    ) : (null)
                }

                <LocalButton
                    title={getTranslation(getTranslation(translations.languageModalComponentLabels.downloadButton, translation))}
                    onPress={onPressContinue}
                    color={styles.primaryColor}
                    titleColor={styles.backgroundColor}
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
    languageModalContainer: {
        alignItems: 'center',
        backgroundColor: styles.backgroundColor,
        borderRadius: 4,
        height: '70%',
        justifyContent: 'center',
        marginHorizontal: 16,
        padding: 8
    },
    titleText: {
        fontFamily: 'Roboto-Medium',
        fontSize: 18,
        marginVertical: 10
    },
    subText: {
        fontFamily: 'Roboto-Light',
        fontSize: 14,
        textAlign: 'center'
    },
    alertStyle: {
        color: styles.dangerColor,
        fontFamily: 'Roboto-Light',
        fontSize: 14,
        paddingVertical: 8,
        textAlign: 'center',
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