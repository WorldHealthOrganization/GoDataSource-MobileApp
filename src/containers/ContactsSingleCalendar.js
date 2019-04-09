/**
 * Created by florinpopa on 21/08/2018.
 */
/**
 * Created by florinpopa on 25/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {View, StyleSheet, InteractionManager} from 'react-native';
import {calculateDimension} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import styles from './../styles';
import ElevatedView from 'react-native-elevated-view';
import {LoaderScreen} from 'react-native-ui-lib';
import FollowUpAgenda from './../components/FollowUpAgenda';
import moment from 'moment';
import {getTranslation} from "../utils/functions";
import translations from "../utils/translations";
import Button from './../components/Button';

class ContactsSingleCalendar extends Component {

    // This will be a container, so put as less business logic here as possible
    constructor(props) {
        super(props);
        this.state = {
            interactionComplete: false
        };
    }

    // Please add here the react lifecycle methods that you need
    // shouldComponentUpdate(nextProps, nextState) {
    //     // console.log("NextPropsIndex ContactsSingleCalendar: ", nextProps.activeIndex, this.props.activeIndex);
    //     return nextProps.activeIndex === 3;
    // }

    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this.setState({
                interactionComplete: true
            })
        })
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.activeIndex === 3) {
            return true;
        }
        return false;
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        if(!this.state.interactionComplete) {
            return (
                <LoaderScreen overlay={true} backgroundColor={'white'}/>
            )
        }

        // console.log('ContactsSingleContainer render Calendar');

        let followUps = this.computeFollowUps();
        // console.log("### ContactsSingleCalendar: ", followUps);

        return (
            <ElevatedView elevation={3} style={[style.container]}>
                <View style = {{alignItems: 'center'}}>
                    <View style={{flexDirection: 'row'}}>
                        <Button
                            title={getTranslation(translations.generalButtons.backButtonLabel, this.props.translation)}
                            onPress={this.props.handleMoveToPrevieousScreenButton}
                            color={styles.buttonGreen}
                            titleColor={'white'}
                            height={calculateDimension(25, true, this.props.screenSize)}
                            width={calculateDimension(130, false, this.props.screenSize)}
                            style={{
                                marginVertical: calculateDimension(12.5, true, this.props.screenSize),
                                marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                            }}/>
                        <Button
                            title={getTranslation(translations.generalButtons.saveButtonLabel, this.props.translation)}
                            onPress={this.props.handleOnPressSave}
                            color={styles.buttonGreen}
                            titleColor={'white'}
                            height={calculateDimension(25, true, this.props.screenSize)}
                            width={calculateDimension(130, false, this.props.screenSize)}
                            style={{
                                marginVertical: calculateDimension(12.5, true, this.props.screenSize),
                                marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                            }}/>
                    </View>
                </View>
                <FollowUpAgenda
                    contact={this.props.contact}
                    followUps={followUps}
                />
            </ElevatedView>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    computeFollowUps = () => {
        let followUps = {};
        if (this.props.contact && this.props.contact.followUps && Array.isArray(this.props.contact.followUps) && this.props.contact.followUps.length > 0) {
            for (let i = 0; i < this.props.contact.followUps.length; i++) {
                if (followUps[moment(this.props.contact.followUps[i].date).format('YYYY-MM-DD')]) {
                    followUps[moment(this.props.contact.followUps[i].date).format('YYYY-MM-DD')].push({text: this.props.contact.followUps[i]});
                } else {
                    followUps[moment(this.props.contact.followUps[i].date).format('YYYY-MM-DD')] = [];
                    followUps[moment(this.props.contact.followUps[i].date).format('YYYY-MM-DD')].push({text: this.props.contact.followUps[i]});
                }
            }
        }

        return followUps;
    }
}


// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: styles.screenBackgroundGrey,
        borderRadius: 2
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        contacts: state.contacts,
        cases: state.cases,
        events: state.events,
        translation: state.app.translation,
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(ContactsSingleCalendar);
