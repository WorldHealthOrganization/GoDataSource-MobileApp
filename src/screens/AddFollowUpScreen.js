/**
 * Created by florinpopa on 13/08/2018.
 */
/**
 * Created by florinpopa on 05/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {StyleSheet, View} from 'react-native';
import Button from './../components/Button';
import {connect} from "react-redux";
import get from 'lodash/get';
import ElevatedView from 'react-native-elevated-view';
import {calculateDimension, createDate, getTranslation} from './../utils/functions';
import Section from './../components/Section';
import DatePicker from './../components/DatePicker';
import {Dialog} from 'react-native-ui-lib';
import translations from './../utils/translations';
import config from './../utils/config';
import styles from './../styles';

class AddFollowUpScreen extends PureComponent{

    constructor(props) {
        super(props);
        this.state = {
            date: createDate(null),
            selectedContact: '',
            contacts: [],
            isModified: false,
        };
    }

    render () {
        let contentWidth = calculateDimension(297, false, this.props.screenSize);
        let marginHorizontal = calculateDimension(14, false, this.props.screenSize);
        let height = calculateDimension(200, true, this.props.screenSize);

        return (
            <Dialog
                visible={this.props.showAddFollowUpScreen}
                width="90%"
                height={height}
                onDismiss={this.onCancelPressed}
            >
                <ElevatedView
                    elevation={3}
                    style={{
                        flex: 1,
                        backgroundColor: styles.backgroundColor,
                        borderRadius: 4,
                        marginVertical: 10,
                    }}>
                    <View style={{flex: 0.2}}>
                        <Section
                            label={getTranslation(translations.addFollowUpScreen.addFollowUpLabel, this.props.translation)}
                            hasBorderBottom={false}
                            containerStyle={{width: '100%', flex: 1}}
                            translation={this.props.translation}
                        />
                    </View>
                    <View style={{flex: 0.4, alignItems: 'center'}}>
                        <DatePicker
                            id='followUpDate'
                            label={getTranslation(translations.addFollowUpScreen.followUpDateLabel, this.props.translation)}
                            value={this.state.date}
                            isEditMode={true}
                            isRequired={false}
                            onChange={this.onDateChanged}
                            style={{width: contentWidth, flex: 0.33}}
                            translation={this.props.translation}
                        />
                    </View>
                    <View style={{flex: 0.2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly'}}>
                        <Button
                            title={getTranslation(translations.generalButtons.cancelButtonLabel, this.props.translation)}
                            style={styles.secondaryButton}
                            onPress={this.onCancelPressed}
                            height={35}
                            width={165}
                        />
                        <Button
                            title={getTranslation(translations.generalButtons.saveButtonLabel, this.props.translation)}
                            color={styles.primaryColor}
                            titleColor={styles.backgroundColor}
                            onPress={this.onSavePressed}
                            height={35}
                            width={165}
                        />
                    </View>
                </ElevatedView>
            </Dialog>
        );
    }

    onDateChanged = (date, id, objectType) => {
        this.setState({
            date: date,
            isModified: true
        })
    };

    onSavePressed = () => {
        this.setState({
            date: createDate(this.state.date),
            isModified: false
        }, () => {
            this.props.onSavePressed(this.state.date);
        });
    };

    onCancelPressed = () => {
        this.setState({
            date: createDate(null),
            isModified: false
        }, () => {
            this.props.onCancelPressed();
        });
    };
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        backgroundColor: 'transparent',
        height: 200,
        width: 200
    }
});

function mapStateToProps(state) {
    return {
        screenSize: get(state, 'app.screenSize', config.designScreenSize),
        translation: get(state, 'app.translation', [])
    };
}

export default connect(mapStateToProps)(AddFollowUpScreen);