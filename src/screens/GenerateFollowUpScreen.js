/**
 * Created by mobileclarisoft on 19/11/2018.
 */
import React, {PureComponent} from 'react';
import {View, StyleSheet, Platform} from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import Button from './../components/Button';
import styles from './../styles';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import ElevatedView from 'react-native-elevated-view';
import {calculateDimension} from './../utils/functions';
import Section from './../components/Section';
import DatePicker from './../components/DatePicker';
import {Dialog} from 'react-native-ui-lib';

class GenerateFollowUpScreen extends PureComponent{

    constructor(props) {
        super(props);
        this.state = {
            date: new Date(),
        };
    }

    componentDidMount() {

    }

    render () {
        let contentWidth = calculateDimension(297, false, this.props.screenSize);
        let marginHorizontal = calculateDimension(14, false, this.props.screenSize);
        return (
            <Dialog
                visible={this.props.showGenerateFollowUpScreen}
                width="90%"
                height="75%"
                onDismiss={this.props.onCancelPressed}
            >
                <ElevatedView
                    elevation={3}
                    style={{
                        flex: 1,
                        backgroundColor: 'white',
                        borderRadius: 4,
                        marginVertical: 10,
                        justifyContent: 'space-around'
                    }}>
                    <Section
                        label="Generate follow ups"
                        hasBorderBottom={false}
                        containerStyle={{width: '100%', flex: 0.15}}
                    />
                    <DatePicker
                        id='generateFollowUpDate'
                        label={"Follow-up date"}
                        value={this.state.date}
                        isEditMode={true}
                        isRequired={false}
                        onChange={this.onDateChanged}
                        style={{width: contentWidth, marginHorizontal}}
                    />
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly'}}>
                        <Button
                            title="Cancel"
                            color="white"
                            titleColor={"black"}
                            onPress={this.props.onCancelPressed}
                            height={25}
                            width="40%"
                        />
                        <Button
                            title="OK"
                            color={styles.buttonGreen}
                            titleColor={'white'}
                            onPress={this.onOkPressed}
                            height={25}
                            width="40%"
                        />
                    </View>
                </ElevatedView>
            </Dialog>
        );
    }

    onDateChanged = (date, id, objectType) => {
        this.setState({
            date: date
        })
    };

    onOkPressed = () => {
        this.props.onOkPressed(this.state.date);
    }
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
        contacts: state.contacts
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(GenerateFollowUpScreen);