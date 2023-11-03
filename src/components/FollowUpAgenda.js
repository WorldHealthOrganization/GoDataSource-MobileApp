/**
 * Created by florinpopa on 23/08/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {Text, View} from 'react-native';
import {connect} from "react-redux";
import cloneDeep from "lodash/cloneDeep";
import {Agenda} from 'react-native-calendars';
import {calculateDimension, getTranslation} from "../utils/functions";
import translation from './../utils/translations';
import FollowUpAgendaItem from './FollowUpAgendaItem';
import {prepareFieldsAndRoutes} from "../utils/formValidators";
import config from "../utils/config";

class FollowUpAgenda extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {
            collapsed: {}
        };

        this.preparedFields = prepareFieldsAndRoutes(this.props.outbreak, 'follow-ups', config.followUpsSingleScreen);
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
                preparedFields={this.preparedFields}
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

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        outbreak: state.outbreak,
        translation: state.app.translation
    };
}

export default connect(mapStateToProps)(FollowUpAgenda);
