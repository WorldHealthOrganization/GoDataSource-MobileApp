import React, {PureComponent} from 'react';
import {Text, View} from 'react-native';
import {Icon} from 'react-native-material-ui';
import Ripple from 'react-native-material-ripple';
import {connect} from "react-redux";
import {calculateDimension, getTranslation} from './../utils/functions';
import FollowUpsSingleQuestionnarireContainer from './../containers/FollowUpsSingleQuestionnaireContainer';
import FollowUpsSingleGetInfoContainer from './../containers/FollowUpsSingleGetInfoContainer'
import FollowUpsSingleAddressContainer from './../containers/FollowUpsSingleAddressContainer'
import Collapsible from 'react-native-collapsible';
import get from "lodash/get";
import translation from "../utils/translations";
import {mapAnswers} from "../utils/functions";

class FollowUpAgendaItem extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    // Since this.props.selectedItems is just an array of ids, we want to map them to the internal structure of the component

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        // console.log("SectionedMultiSelect: ", this.props.items);
        let mappedAnswers = {};
        if (get(this.props, 'outbreakContactFollowUpTemplate', 'failOubreakQuestions') !== 'failOubreakQuestions' && get(this.props, 'item.text.questionnaireAnswers', 'failQuestionnaire') !== 'failQuestionnaire') {
            mappedAnswers = mapAnswers(this.props.outbreakContactFollowUpTemplate, this.props.item.text.questionnaireAnswers);
        }

        let date = '';
        if (this.props.firstItemInDay) {
            date = this.extractDate(get(this.props, 'item.text.date', ''))
        }

        // const screenSize = get(this.props, 'screenSize')
        const itemId = get(this.props, 'item.text._id', undefined);
        const itemIdQuestionnaire = `${itemId}_questionnaire`;
        const itemIdStatus = `${itemId}_status`;
        const itemIdAddress = `${itemId}_address`;
        return (
            <View>
                {
                    this.props && this.props.firstItemInDay ? (
                        <View style={{
                            marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                            marginVertical: calculateDimension(5, true, this.props.screenSize),
                        }}>
                            <Text style={{ fontFamily: 'Roboto-Medium', fontSize: 16 }}>{date}</Text>
                        </View>
                    ) : (null)
                }
                {
                    ToggleFollowUpDetails(getTranslation(translation.followUpAgenda.followUp, this.props.translation), this.props.screenSize, itemId, this.props.ChangeCollpased, this.props.collapsed, 25)
                }
                {
                    this.props.collapsed[itemId] === false ? (
                            <Collapsible collapsed={this.props.collapsed[itemId]}>
                                <FollowUpsSingleGetInfoContainer
                                    isNew={false}
                                    isEditMode={false}
                                    preparedFields={this.props.preparedFields}
                                    item={get(this.props, 'item.text', {})}
                                    contact={this.props.contact}
                                            />
                                {
                                    ToggleFollowUpDetails(getTranslation(translation.followUpAgenda.followUpQuestionnaire, this.props.translation), this.props.screenSize, itemIdQuestionnaire, this.props.ChangeCollpased, this.props.collapsed, 30)
                                }
                                {
                                    this.props.collapsed[itemIdQuestionnaire] === false ? (
                                        <Collapsible collapsed={this.props.collapsed[itemIdQuestionnaire]}>
                                            <FollowUpsSingleQuestionnarireContainer
                                                item={get(this.props, 'item.text', {})}
                                                previousAnswers={get(mappedAnswers, 'mappedAnswers', {})}
                                                contact={this.props.contact}
                                                isEditMode={false}
                                                noEditButton={true}
                                            />
                                        </Collapsible>) : null
                                }
                                {
                                    ToggleFollowUpDetails(getTranslation(translation.followUpAgenda.followUpAddress, this.props.translation), this.props.screenSize, itemIdAddress, this.props.ChangeCollpased, this.props.collapsed, 30)
                                }
                                {
                                    this.props.collapsed[itemIdAddress] === false ? (
                                        <Collapsible collapsed={this.props.collapsed[itemIdAddress]}>
                                            <FollowUpsSingleAddressContainer
                                                item={get(this.props, 'item.text', {})}
                                                contact={this.props.contact}
                                                preparedFields={this.props.preparedFields}
                                            />
                                        </Collapsible>) : null
                                }
                            </Collapsible>)
                        : null
                }
            </View >
        )
    }

    // Please write here all the methods that are not react native lifecycle methods
    extractDate = (date) => {
        date = new Date(date);
        return `${date.getDate() < 9 ? '0' + date.getDate() : date.getDate()}/${date.getUTCMonth() < 9 ? '0' + (date.getUTCMonth() + 1) : (date.getUTCMonth() + 1)}/${date.getUTCFullYear()}`;
    };
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

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        translation: state.app.translation,
        outbreakContactFollowUpTemplate: state.outbreak.contactFollowUpTemplate
    };
}

export default connect(mapStateToProps)(FollowUpAgendaItem);
