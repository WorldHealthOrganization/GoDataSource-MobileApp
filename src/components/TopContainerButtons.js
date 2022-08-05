import React, {Component} from 'react';
import {View} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import translations from "../utils/translations";
import {calculateDimension, getTranslation} from "../utils/functions";
import Button from './Button';
import styles from "../styles";

class TopContainerButtons extends Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <View style={{alignItems: 'center'}}>
                {
                    this.props.isNew ?
                        this.props.index === 0 ? this.renderIsNewModeFirstTab() :
                            this.props.index === this.props.numberOfTabs - 1 ? this.renderIsNewModeLastTab() :
                                this.renderIsNewModeIntermediaryTab() :
                        this.props.isEditMode ? this.renderEditModeTab() : this.renderViewModeButtons()
                }
            </View>
        );
    }

    // This only renders an edit button
    renderViewModeButtons () {
        return (
            <Button
                title={getTranslation(translations.generalButtons.editButtonLabel, this.props.translation)}
                onPress={this.props.onPressEdit}
                color={styles.primaryColor}
                titleColor={styles.backgroundColor}
                height={calculateDimension(35, true, this.props.screenSize)}
                width={calculateDimension(164, false, this.props.screenSize)}
                style={{
                    marginVertical: calculateDimension(16, true, this.props.screenSize)
                }} />
        )
    }

    // This renders save and cancel button
    renderEditModeTab() {
        return (
            <View style={{ flexDirection: 'row' }}>
                <Button
                    title={getTranslation(translations.generalButtons.saveButtonLabel, this.props.translation)}
                    onPress={this.props.onPressSaveEdit}
                    color={styles.primaryColor}
                    titleColor={styles.backgroundColor}
                    height={calculateDimension(35, true, this.props.screenSize)}
                    width={calculateDimension(164, false, this.props.screenSize)}
                    style={{
                        marginVertical: calculateDimension(16, true, this.props.screenSize),
                        marginRight: 8
                    }} />
                <Button
                    title={getTranslation(translations.generalButtons.cancelButtonLabel, this.props.translation)}
                    onPress={this.props.onPressCancelEdit}
                    color={styles.primaryColor}
                    titleColor={styles.backgroundColor}
                    height={calculateDimension(35, true, this.props.screenSize)}
                    width={calculateDimension(164, false, this.props.screenSize)}
                    style={{
                        marginVertical: calculateDimension(16, true, this.props.screenSize),
                        marginLeft: 8
                    }} />
            </View>
        )
    }

    // This renders a next button
    renderIsNewModeFirstTab() {
        return (
            <Button
                title={getTranslation(translations.generalButtons.nextButtonLabel, this.props.translation)}
                onPress={this.props.onPressNextButton}
                color={styles.primaryColor}
                titleColor={styles.backgroundColor}
                height={calculateDimension(35, true, this.props.screenSize)}
                width={calculateDimension(164, false, this.props.screenSize)}
                style={{
                    marginVertical: calculateDimension(16, true, this.props.screenSize)
                }} />
        )
    }

    // This renders previous and save button
    renderIsNewModeLastTab() {
        return (
            <View style={{ flexDirection: 'row', width: '90%', alignItems: 'center' }}>
                <Button
                    title={getTranslation(translations.generalButtons.backButtonLabel, this.props.translation)}
                    onPress={this.props.onPressPreviousButton}
                    color={styles.primaryColor}
                    titleColor={styles.backgroundColor}
                    height={calculateDimension(35, true, this.props.screenSize)}
                    width={calculateDimension(164, false, this.props.screenSize)}
                    style={{
                        marginVertical: calculateDimension(16, true, this.props.screenSize),
                        marginRight: 8
                    }} />
                <Button
                    title={getTranslation(translations.generalButtons.saveButtonLabel, this.props.translation)}
                    onPress={this.props.onPressSaveEdit}
                    color={styles.primaryColor}
                    titleColor={styles.backgroundColor}
                    height={calculateDimension(35, true, this.props.screenSize)}
                    width={calculateDimension(164, false, this.props.screenSize)}
                    style={{
                        marginVertical: calculateDimension(16, true, this.props.screenSize),
                        marginLeft: 8
                    }} />
            </View>
        )
    }

    // This renders next and previous buttons
    renderIsNewModeIntermediaryTab() {
        return (
            <View style={{ flexDirection: 'row' }}>
                <Button
                    title={getTranslation(translations.generalButtons.backButtonLabel, this.props.translation)}
                    onPress={this.props.onPressPreviousButton}
                    color={styles.primaryColor}
                    titleColor={styles.backgroundColor}
                    height={calculateDimension(35, true, this.props.screenSize)}
                    width={calculateDimension(164, false, this.props.screenSize)}
                    style={{
                        marginVertical: calculateDimension(16, true, this.props.screenSize),
                        marginRight: 8
                    }} />
                <Button
                    title={getTranslation(translations.generalButtons.nextButtonLabel, this.props.translation)}
                    onPress={this.props.onPressNextButton}
                    color={styles.primaryColor}
                    titleColor={styles.backgroundColor}
                    height={calculateDimension(35, true, this.props.screenSize)}
                    width={calculateDimension(164, false, this.props.screenSize)}
                    style={{
                        marginVertical: calculateDimension(16, true, this.props.screenSize),
                        marginLeft: 8
                    }} />
            </View>
        )
    }
}

TopContainerButtons.propTypes = {
    isEditMode: PropTypes.bool,
    isNew: PropTypes.bool,
    index: PropTypes.number,
    numberOfTabs: PropTypes.number,
    onPressEdit: PropTypes.func,
    onPressSaveEdit: PropTypes.func,
    onPressCancelEdit: PropTypes.func,
    onPressNextButton: PropTypes.func,
    onPressPreviousButton: PropTypes.func,
    onPressSaveAdd: PropTypes.func,
};

TopContainerButtons.defaultProps = {
    isEditMode: false,
    isNew: false,
    index: 0,
    numberOfTabs: 1,
    onPressEdit: () => {console.log('TopContainerButtons default onPressEdit')},
    onPressSaveEdit: () => {console.log('TopContainerButtons default onPressSaveEdit')},
    onPressCancelEdit: () => {console.log('TopContainerButtons default onPressCancelEdit')},
    onPressNextButton: () => {console.log('TopContainerButtons default onPressNextButton')},
    onPressPreviousButton: () => {console.log('TopContainerButtons default onPressPreviousButton')},
    onPressSaveAdd: () => {console.log('TopContainerButtons default onPressSaveAdd')},
};

function mapStateToProps(state) {
    return {
        translation: lodashGet(state, 'app.translation', null),
        screenSize: lodashGet(state, 'app.screenSize', null)
    };
}

export default connect(
    mapStateToProps,
)(TopContainerButtons);
