/**
 * Created by florinpopa on 16/07/2018.
 */
import React, {PureComponent} from 'react';
import {TextInput, View, Text, StyleSheet, Platform, Dimensions} from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import {ListItem, Icon} from 'react-native-material-ui';
import {calculateDimension} from './../utils/functions';
import config from './../utils/config';
import CalendarPicker from './CalendarPicker';
import Calendar from "react-native-calendars/src/calendar/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import Ripple from 'react-native-material-ripple';

class NavBarCustom extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: ''
        };
    }

    // Please add here the react lifecycle methods that you need


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <View style={[this.props.style, style.container,
                {
                    height: calculateDimension(81, true, this.props.screenSize),
                    marginTop: Platform.OS === 'ios' ? this.props.screenSize.height === 812 ? 44 : 20 : 0,
                    marginHorizontal: calculateDimension(16, false, this.props.screenSize)
                },
                Platform.OS === 'ios' && {zIndex: 99}
            ]}
            >
                <View style={[style.containerUpperNavBar]}>
                    <Ripple onPress={this.handlePressNavbarButton}>
                        <Icon name="menu"/>
                    </Ripple>
                    <Text style={style.title}>{this.props.title}</Text>
                </View>
                <View style={[style.containerLowerNavBar]}>
                    {
                        this.props.children
                    }
                </View>
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handlePressNavbarButton = () => {
        this.props.navigator.toggleDrawer({
            side: 'left',
            animated: true,
            to: 'missing'
        })
    }
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        backgroundColor: 'rgb(237, 237, 237)'
    },
    containerUpperNavBar: {
        flex: 0.5,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    title: {
        fontSize: 17,
        fontFamily: 'Roboto-Medium',
        marginLeft: 30
    },
    containerLowerNavBar: {
        flex: 0.5,
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
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

export default connect(mapStateToProps, matchDispatchProps)(NavBarCustom);
