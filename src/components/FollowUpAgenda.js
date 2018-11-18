/**
 * Created by florinpopa on 23/08/2018.
 */
import React, {PureComponent} from 'react';
import {TextInput, View, Text, StyleSheet, Platform, Dimensions, TouchableOpacity, Animated, FlatList} from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import {ListItem, Icon, Button} from 'react-native-material-ui';
import {calculateDimension} from './../utils/functions';
import config from './../utils/config';
import Ripple from 'react-native-material-ripple';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './../styles';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {Agenda} from 'react-native-calendars';
import FollowUpsSingleQuestionnarireContainer from './../containers/FollowUpsSingleQuestionnaireContainer';

class FollowUpAgenda extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    // Please add here the react lifecycle methods that you need


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        // console.log('### FollowUpAgenda followUps: ', this.props.followUps);
        return (
            <Agenda
                items={this.props.followUps}
                renderItem={this.renderItem}
                renderEmptyDate={() => {return (<View />);}}
                rowHasChanged={(r1, r2) => {return r1.text !== r2.text}}
                renderDay={(day, item) => {return (<View />);}}
                theme={{
                    agendaKnobColor: 'rgba(0, 0, 0, 0.1)',
                }}
                renderEmptyData = {() => {return (<View />);}}
            />
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    renderItem = (item, firstItemInDay) => {
        console.log("RenderItem from FollowUpAgenda: ", item);
        return(
            <FollowUpsSingleQuestionnarireContainer
                item={item.text}
                contact={this.props.contact}
                isEditMode={false}
            />
        )
}
}

// FollowUpAgenda.defaultProps = {
//     data: [],
//     renderItem: () => {return (<View  />)},
//     keyExtractor: () => {return null},
//     renderSeparatorComponent: () => {return (<View />)}
// };

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(FollowUpAgenda);
