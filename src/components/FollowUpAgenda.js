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
        const newFollowUps = cloneDeep(this.props.followUps)

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
        let mappedAnswers = {};
        if (get(this.props, 'outbreak.contactFollowUpTemplate', 'failOubreakQuestions') !== 'failOubreakQuestions' && get(item, 'text.questionnaireAnswers', 'failQuestionnaire') !== 'failQuestionnaire') {
            mappedAnswers = mapAnswers(this.props.outbreak.contactFollowUpTemplate, item.text.questionnaireAnswers);
        }

        let date = '';
        if (firstItemInDay) {
            date = this.extractDate(get(item, 'text.date', ''))
        }

        const screenSize = get(this.props, 'screenSize')
        const itemId = get(item, 'text._id', undefined)
        const itemIdQuestionnaire = `${itemId}_questionnaire`
        const itemIdStatus = `${itemId}_status`
        const itemIdAddress = `${itemId}_address`

        return (
            <View>
                {
                    firstItemInDay ? (
                        <View style={{
                            marginHorizontal: calculateDimension(16, false, screenSize),
                            marginVertical: calculateDimension(5, true, screenSize),
                        }}>
                            <Text style={{ fontFamily: 'Roboto-Medium', fontSize: 16 }}>{date}</Text>
                        </View>
                    ) : (null)
                }
                {
                    ToggleFollowUpDetails(getTranslation(translation.followUpAgenda.followUp, this.props.translation), screenSize, itemId, this.ChangeCollpased, this.state.collapsed, 25)
                }
                {
                    this.state.collapsed[itemId] === false ? (
                        <Collapsible collapsed={this.state.collapsed[itemId]}>
                            {
                                ToggleFollowUpDetails(getTranslation(translation.followUpAgenda.followUpStatus, this.props.translation), screenSize, itemIdStatus, this.ChangeCollpased, this.state.collapsed, 30)
                            }
                            {
                                this.state.collapsed[itemIdStatus] === false ? (
                                    <Collapsible collapsed={this.state.collapsed[itemIdStatus]}>
                                        <FollowUpsSingleGetInfoContainer
                                            isNew={false}
                                            isEditMode={false}
                                            item={get(item, 'text', {})}
                                            contact={this.props.contact}
                                        />
                                    </Collapsible>) : null
                            }
                            {
                                ToggleFollowUpDetails(getTranslation(translation.followUpAgenda.followUpQuestionnaire, this.props.translation), screenSize, itemIdQuestionnaire, this.ChangeCollpased, this.state.collapsed, 30)
                            }
                            {
                                this.state.collapsed[itemIdQuestionnaire] === false ? (
                                    <Collapsible collapsed={this.state.collapsed[itemIdQuestionnaire]}>
                                        <FollowUpsSingleQuestionnarireContainer
                                            item={get(item, 'text', {})}
                                            previousAnswers={get(mappedAnswers, 'mappedAnswers', {})}
                                            contact={this.props.contact}
                                            isEditMode={false}
                                        />
                                    </Collapsible>) : null
                            }
                            {
                                ToggleFollowUpDetails(getTranslation(translation.followUpAgenda.followUpAddress, this.props.translation), screenSize, itemIdAddress, this.ChangeCollpased, this.state.collapsed, 30)
                            }
                            {
                                this.state.collapsed[itemIdAddress] === false ? (
                                    <Collapsible collapsed={this.state.collapsed[itemIdAddress]}>
                                        <FollowUpsSingleAddressContainer
                                            item={get(item, 'text', {})}
                                            contact={this.props.contact}
                                        />
                                    </Collapsible>) : null
                            }
                        </Collapsible>)
                        : null
                }
            </View >
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

    extractDate = (date) => {
        date = new Date(date);
        return `${date.getDate() < 9 ? '0' + date.getDate() : date.getDate()}/${date.getUTCMonth() < 9 ? '0' + (date.getUTCMonth() + 1) : (date.getUTCMonth() + 1)}/${date.getUTCFullYear()}`;
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

const ToggleFollowUpDetails = (text, screenSize, itemId, ChangeCollpased, collapsed, marginHorizontal) => {
    return (
        <View style={{
            marginHorizontal: calculateDimension(marginHorizontal, false, screenSize),
            marginVertical: calculateDimension(3, true, screenSize),
            flexDirection: 'row',
            justifyContent: 'space-between'
        }}>
            <Text style={{ fontFamily: 'Roboto-Medium', fontSize: 16 }}>{text}</Text>

            <Ripple style={{
                justifyContent: 'flex-end',
                width: calculateDimension(33, false, screenSize),
                height: calculateDimension(25, true, screenSize),
            }} onPress={() => ChangeCollpased(itemId)}>
                {
                    collapsed[itemId] === true || collapsed[itemId] === undefined
                        ? <Icon name="arrow-drop-down" color={'black'} size={23} />
                        : <Icon name="arrow-drop-up" color={'black'} size={23} />
                }
            </Ripple>
        </View>
    )
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
