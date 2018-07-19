/**
 * Created by mobileclarisoft on 12/07/2018.
 */
import React, {PureComponent} from 'react';
import {TextInput, View, Text, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import { RaisedTextButton } from 'react-native-material-buttons';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";

class Button extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
    }

    // Please add here the react lifecycle methods that you need


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <RaisedTextButton
                title={this.props.title}
                color={this.props.color}
                titleColor={this.props.titleColor}
                titleStyle={{
                    fontFamily: 'Roboto-Regular',
                    fontSize: 11.8,
                    alignSelf: 'center',
                    lineHeight: 25
                }}
                onPress={this.props.onPress}
                style={[{
                    borderRadius: 4,
                    height: this.props.height,
                    width: this.props.width,
                },this.props.style]}
            />
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({

});

Button.propTypes = {
    title: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    titleColor: PropTypes.string.isRequired,
    onPress: PropTypes.func.isRequired,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    style: PropTypes.object,
};

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(Button);
