/**
 * Created by florinpopa on 23/08/2018.
 */
import React, { PureComponent } from 'react';
import { View, Text, StyleSheet } from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import styles from './../styles';
import moment from 'moment';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import cloneDeep from "lodash/cloneDeep";
import Ripple from 'react-native-material-ripple';
import { Icon } from 'react-native-material-ui';
import { Agenda } from 'react-native-calendars';
import FollowUpsSingleQuestionnarireContainer from './../containers/FollowUpsSingleQuestionnaireContainer';
import Collapsible from 'react-native-collapsible';
import { mapAnswers, calculateDimension, getTranslation } from "../utils/functions";
import get from 'lodash/get';
import ElevatedView from 'react-native-elevated-view';
import Button from './Button';
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

        let followUpDate = '';
        let date = '';
        let dateFormat = '';
        followUpDate = get(item, 'text.date', '')
        dateFormat = moment(followUpDate).format('YYYY-MM-DD')
        date = this.extractDate(followUpDate)

        const screenSize = get(this.props, 'screenSize')

        return (
            <View>
                {
                    firstItemInDay ? (
                        <View style={{
                            marginHorizontal: calculateDimension(16, false, screenSize),
                            marginVertical: calculateDimension(5, true, screenSize),
                            flexDirection: 'row',
                            justifyContent: 'space-between'
                        }}>
                            <Text style={{ fontFamily: 'Roboto-Medium', fontSize: 16 }}>{date}</Text>
                            <ElevatedView
                                elevation={3}
                                style={{
                                    backgroundColor: styles.buttonGreen,
                                    width: calculateDimension(33, false, screenSize),
                                    height: calculateDimension(25, true, screenSize),
                                    borderRadius: 4
                                }}
                            >
                                <Ripple style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }} onPress={() => this.ChangeCollpased(dateFormat)}>
                                    {
                                        this.state.collapsed[dateFormat] === true || this.state.collapsed[dateFormat] === undefined
                                            ? <Icon name="add" color={'white'} size={15} />
                                            : <Icon name="remove" color={'white'} size={15} />
                                    }
                                </Ripple>
                            </ElevatedView>
                        </View>
                    ) : (null)
                }
                {
                    this.state.collapsed[dateFormat] === false ? (
                        <Collapsible collapsed={this.state.collapsed[dateFormat]}>
                            <FollowUpsSingleQuestionnarireContainer
                                item={get(item, 'text', {})}
                                previousAnswers={get(mappedAnswers, 'mappedAnswers', {})}
                                contact={this.props.contact}
                                isEditMode={false}
                            />
                        </Collapsible>) : null
                }

            </View>
        )
    };

    ChangeCollpased = (dateFormat) => {
        const { collapsed } = this.state
        const collapsedCpy = cloneDeep(collapsed)

        if (collapsedCpy[dateFormat] !== undefined) {
            collapsedCpy[dateFormat] = !collapsedCpy[dateFormat]
        } else {
            collapsedCpy[dateFormat] = false;
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
