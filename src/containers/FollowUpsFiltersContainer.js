/**
 * Created by florinpopa on 25/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {TextInput, View, Text, StyleSheet, Platform, Dimensions, Image} from 'react-native';
import {ListItem, Icon} from 'react-native-material-ui';
import {calculateDimension} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {TextField} from 'react-native-material-textfield';
import Button from './../components/Button';
import styles from './../styles';
import Ripple from 'react-native-material-ripple';
import ElevatedView from 'react-native-elevated-view';
import CardComponent from './../components/CardComponent';

class FollowUpsFiltersContainer extends PureComponent {

    // This will be a container, so put as less business logic here as possible
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
            <View style={style.container}>
                {
                    config.followUpsFilterScreen.filter.map((item) => {
                        return this.handleRenderItem(item);
                    })
                }
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (item) => {
        console.log("### item from FollowUpsFiltersContainer: ", item);
        return (
            <CardComponent
                item={item.fields}
                style={{height: 108}}
            />
        )
    }
}


// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 2
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        contacts: state.contacts,
        cases: state.cases,
        events: state.events
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(FollowUpsFiltersContainer);
