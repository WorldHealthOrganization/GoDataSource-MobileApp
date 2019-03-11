/**
 * Created by florinpopa on 13/08/2018.
 */
/**
 * Created by florinpopa on 05/07/2018.
 */
import React, {PureComponent} from 'react';
import {View, StyleSheet, Platform, Alert} from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import Button from './../components/Button';
import styles from './../styles';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import ElevatedView from 'react-native-elevated-view';
import {calculateDimension, getTranslation} from './../utils/functions';
import config from './../utils/config';
import Section from './../components/Section';
import DropdownInput from './../components/DropdownInput';
import DatePicker from './../components/DatePicker';
import {Dialog} from 'react-native-ui-lib';
import {getContactsForOutbreakIdRequest} from './../queries/contacts';
import DropdownSearchable from './../components/DropdownSearchable';
import translations from './../utils/translations'

class AddFollowUpScreen extends PureComponent{

    constructor(props) {
        super(props);
        this.state = {
            date: new Date(),
            selectedContact: '',
            contacts: [],
            isModified: false,
        };
    }

    componentDidMount() {
        // getContactsForOutbreakIdRequest(this.props.user.activeOutbreakId, null, null, (error, contacts) => {
        //     if (error) {
        //         console.log("An error occurred while getting all contacts for add contacts screen");
        //     }
        //     if (contacts) {
        //         this.setState({
        //             contacts
        //         })
        //     }
        // })
    }

    render () {
        let contentWidth = calculateDimension(297, false, this.props.screenSize);
        let marginHorizontal = calculateDimension(14, false, this.props.screenSize);
        let height = calculateDimension(420, true, this.props.screenSize);

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
                        backgroundColor: 'white',
                        borderRadius: 4,
                        marginVertical: 10,
                    }}>
                    <View style={{flex: 0.1}}>
                        <Section
                            label={getTranslation(translations.addFollowUpScreen.addFollowUpLabel, this.props.translation)}
                            hasBorderBottom={false}
                            containerStyle={{width: '100%', flex: 1}}
                            translation={this.props.translation}
                        />
                    </View>
                    <View style={{flex: 0.8, alignItems: 'center'}}>
                        <DatePicker
                            id='followUpDate'
                            label={getTranslation(translations.addFollowUpScreen.followUpDateLabel, this.props.translation)}
                            value={this.state.date}
                            isEditMode={true}
                            isRequired={false}
                            onChange={this.onDateChanged}
                            style={{width: contentWidth, marginHorizontal, flex: 0.33}}
                            translation={this.props.translation}
                        />
                        <DropdownSearchable
                            outbreakId={this.props && this.props.user && this.props.user.activeOutbreakId ? this.props.user.activeOutbreakId : null}
                            onChange={this.onDropdownSearchableChanged}
                            placeholder={getTranslation(translations.addFollowUpScreen.searchContactPlacehodler, this.props.translation)}
                            translation={this.props.translation}
                        />
                    </View>
                    <View style={{flex: 0.1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly'}}>
                        <Button
                            title={getTranslation(translations.generalButtons.cancelButtonLabel, this.props.translation)}
                            color="white"
                            titleColor={"black"}
                            onPress={this.onCancelPressed}
                            height={25}
                            width="40%"
                        />
                        <Button
                            title={getTranslation(translations.generalButtons.saveButtonLabel, this.props.translation)}
                            color={styles.buttonGreen}
                            titleColor={'white'}
                            onPress={this.onSavePressed}
                            height={25}
                            width="40%"
                        />
                    </View>
                </ElevatedView>
            </Dialog>
        );
    }

    onDropdownSearchableChanged = (value) => {
        this.setState({
            selectedContact: value,
            isModified: true
        })
    };

    onDateChanged = (date, id, objectType) => {
        this.setState({
            date: date,
            isModified: true
        })
    };

    onSavePressed = () => {
        this.setState({
            date: new Date(),
            isModified: false
        }, () => {
            this.props.onSavePressed(this.state.selectedContact, this.state.date);
        });
    };

    onCancelPressed = () => {
        this.setState({
            date: new Date(),
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
        width: 200,
        height: 200
    }
});

function mapStateToProps(state) {
    return {
        user: state.user,
        screenSize: state.app.screenSize,
        contacts: state.contacts,
        translation: state.app.translation
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(AddFollowUpScreen);