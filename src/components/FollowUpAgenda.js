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
        return (
            <Agenda
                items={
                    {
                        '2018-08-22': [{text: 'item 1 - any js object'}],
                        '2018-08-23': [{text: 'item 2 - any js object'}],
                        '2018-08-24': [],
                        '2018-08-25': [{text: 'item 3 - any js object'}, {text: 'any js object'}],
                    }
                }
                renderItem={(item, firstItemInDay) => {return (<View><Text>Ceva</Text></View>);}}
                renderEmptyDate={() => {return (<View />);}}
                rowHasChanged={(r1, r2) => {return r1.text !== r2.text}}
                renderDay={(day, item) => {return (<View />);}}
            />
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
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
