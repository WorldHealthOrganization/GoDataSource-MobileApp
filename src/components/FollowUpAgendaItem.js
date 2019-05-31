import React, {PureComponent} from 'react';
import {View, Text, Modal, StyleSheet, TextInput, FlatList} from 'react-native';
import {Icon} from 'react-native-material-ui';
import config from './../utils/config';
import Ripple from 'react-native-material-ripple';
import stylesGlobal from './../styles';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import translations from './../utils/translations'
import {getTranslation, getTooltip, calculateDimension} from './../utils/functions';
import FollowUpsSingleQuestionnarireContainer from './../containers/FollowUpsSingleQuestionnaireContainer';
import FollowUpsSingleGetInfoContainer from './../containers/FollowUpsSingleGetInfoContainer'
import FollowUpsSingleAddressContainer from './../containers/FollowUpsSingleAddressContainer'
import Collapsible from 'react-native-collapsible';
import get from "lodash/get";
import translation from "../utils/translations";
import {mapAnswers} from "../utils/functions";
import cloneDeep from "lodash/cloneDeep";

class FollowUpAgendaItem extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {
            collapsed: {

            }
        };
    }

    // Since this.props.selectedItems is just an array of ids, we want to map them to the internal structure of the component

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        // console.log("SectionedMultiSelect: ", this.props.items);
        let mappedAnswers = {};
        if (get(this.props, 'outbreak.contactFollowUpTemplate', 'failOubreakQuestions') !== 'failOubreakQuestions' && get(this.props, 'item.text.questionnaireAnswers', 'failQuestionnaire') !== 'failQuestionnaire') {
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
                                {/*{*/}
                                    {/*ToggleFollowUpDetails(getTranslation(translation.followUpAgenda.followUpStatus, this.props.translation), this.props.screenSize, itemIdStatus, this.props.ChangeCollpased, this.props.collapsed, 30)*/}
                                {/*}*/}
                                {/*{*/}
                                    {/*this.props.collapsed[itemIdStatus] === false ? (*/}
                                        {/*<Collapsible collapsed={this.props.collapsed[itemIdStatus]}>*/}
                                            <FollowUpsSingleGetInfoContainer
                                                isNew={false}
                                                isEditMode={false}
                                                item={get(this.props, 'item.text', {})}
                                                contact={this.props.contact}
                                            />
                                        {/*</Collapsible>) : null*/}
                                {/*}*/}
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

    ChangeCollpased = (id) => {
        const { collapsed } = this.state;
        const collapsedCpy = cloneDeep(collapsed);

        if (collapsedCpy[id] !== undefined) {
            collapsedCpy[id] = !collapsedCpy[id]
        } else {
            collapsedCpy[id] = false;
        }
        this.setState({
            collapsed: collapsedCpy
        })
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

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        translation: state.app.translation,
        outbreakContactFollowUpTemplate: state.outbreak.contactFollowUpTemplate
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(FollowUpAgendaItem);
