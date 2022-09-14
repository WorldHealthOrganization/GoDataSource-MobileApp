/**
 * Created by florinpopa on 21/08/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {InteractionManager, StyleSheet, View} from 'react-native';
import {connect} from "react-redux";
import ElevatedView from 'react-native-elevated-view';
import {LoaderScreen} from 'react-native-ui-lib';
import FollowUpAgenda from './../components/FollowUpAgenda';
import get from 'lodash/get';
import moment from 'moment/min/moment.min';
import TopContainerButtons from "./../components/TopContainerButtons";
import PermissionComponent from './../components/PermissionComponent';
import constants from "./../utils/constants";
import config from "./../utils/config";
import {
    PERMISSION_CREATE_CONTACT,
    PERMISSION_CREATE_CONTACT_OF_CONTACT,
    PERMISSION_EDIT_CONTACT, PERMISSION_EDIT_CONTACT_OF_CONTACT
} from "../utils/constants";
import translations from "../utils/translations";
import styles from './../styles';

class ContactsSingleCalendar extends Component {

    // This will be a container, so put as less business logic here as possible
    constructor(props) {
        super(props);
        this.state = {
            interactionComplete: false
        };
    }

    // Please add here the react lifecycle methods that you need
    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this.setState({
                interactionComplete: true
            })
        })
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.routeKey === 'calendar') {
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
                <LoaderScreen
                    overlay={true}
                    loaderColor={styles.primaryColor}
                    backgroundColor={'rgba(255, 255, 255, 0.8)'} />
            )
        }

        // console.log('ContactsSingleContainer render Calendar');

        let followUps = this.computeFollowUps();
        // console.log("### ContactsSingleCalendar: ", followUps);

        let permissionsList = [];
        if (this.props.isNew) {
            permissionsList = this.props.type === translations.personTypes.contactsOfContacts ? PERMISSION_CREATE_CONTACT_OF_CONTACT : PERMISSION_CREATE_CONTACT;
        } else {
            permissionsList = this.props.type === translations.personTypes.contactsOfContacts ? PERMISSION_EDIT_CONTACT_OF_CONTACT : PERMISSION_EDIT_CONTACT;
        }

        return (
            <ElevatedView elevation={5} style={[style.container]}>
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
        backgroundColor: styles.screenBackgroundColor,
        borderRadius: 4,
        flex: 1
    }
});

function mapStateToProps(state) {
    return {
        screenSize: get(state, 'app.screenSize', config.designScreenSize),
        translation: get(state, 'app.translation', [])
    };
}

export default connect(mapStateToProps)(ContactsSingleCalendar);
