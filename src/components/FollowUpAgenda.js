/**
 * Created by florinpopa on 23/08/2018.
 */
import React, { PureComponent } from 'react';
import { View, Text, StyleSheet } from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import styles from './../styles';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import cloneDeep from "lodash/cloneDeep";
import Ripple from 'react-native-material-ripple';
import { Icon } from 'react-native-material-ui';
import { Agenda } from 'react-native-calendars';
import FollowUpsSingleQuestionnarireContainer from './../containers/FollowUpsSingleQuestionnaireContainer';
import FollowUpsSingleGetInfoContainer from './../containers/FollowUpsSingleGetInfoContainer'
import FollowUpsSingleAddressContainer from './../containers/FollowUpsSingleAddressContainer'
import Collapsible from 'react-native-collapsible';
import { mapAnswers, calculateDimension, getTranslation } from "../utils/functions";
import get from 'lodash/get';
import ElevatedView from 'react-native-elevated-view';
import translation from './../utils/translations';
import FollowUpAgendaItem from './FollowUpAgendaItem';

class FollowUpAgenda extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {
            collapsed: {}
        };
    }

    // Please add here the react lifecycle methods that you need

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        const newFollowUps = cloneDeep(this.props.followUps);

        return (
            <Agenda
                items={newFollowUps}
                renderItem={this.renderItem}
                renderEmptyDate={() => { return (<View />); }}
                rowHasChanged={(r1, r2) => { return r1.text !== r2.text }}
                renderDay={this.renderDay}
                theme={{
                    agendaKnobColor: 'rgba(0, 0, 0, 0.1)',
                }}
                renderEmptyData={this.renderEmptyData}
            />
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    renderItem = (item, firstItemInDay) => {
        return (
            <FollowUpAgendaItem
                firstItemInDay={firstItemInDay}
                item={item}
                collapsed={this.state.collapsed}
                ChangeCollpased={this.ChangeCollpased}
            />
        )
    };

    ChangeCollpased = (id) => {
        const { collapsed } = this.state
        const collapsedCpy = cloneDeep(collapsed)

        if (collapsedCpy[id] !== undefined) {
            collapsedCpy[id] = !collapsedCpy[id]
        } else {
            collapsedCpy[id] = false;
        }
        this.setState({
            collapsed: collapsedCpy
        })
    }

    renderDay = (day, item) => {
        return (
            <View />
        )
    };

    renderEmptyData = () => {
        let marginHorizontal = calculateDimension(16, false, this.props.screenSize);
        return (
            <View style={{ marginHorizontal }}>
                <Text style={{ fontFamily: 'Roboto-Medium', fontSize: 16 }}>{getTranslation(translation.followUpAgenda.noFollUpsForDate, this.props.translation)}</Text>
            </View>
        )
    }
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        outbreak: state.outbreak,
        translation: state.app.translation
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(FollowUpAgenda);
