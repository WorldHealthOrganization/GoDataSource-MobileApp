/**
 * Created by mobileclarisoft on 12/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import { RaisedTextButton } from 'react-native-material-buttons';
import {connect} from "react-redux";
import {getTranslation} from './../utils/functions';

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
                title={getTranslation(this.props.title, this.props.translation)}
                color={this.props.color}
                titleColor={this.props.titleColor}
                titleStyle={[{
                    fontFamily: 'Roboto-Regular',
                    fontSize: 11.8,
                    alignSelf: 'center',
                    lineHeight: 25
                }, this.props.titleStyle]}
                onPress={this.props.onPress}
                style={[{
                    borderRadius: 4,
                    height: this.props.height,
                    width: this.props.width
                },this.props.style]}
                {...this.props}
            />
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
}

Button.propTypes = {
    title: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    titleColor: PropTypes.string.isRequired,
    onPress: PropTypes.func.isRequired,
    height: PropTypes.number.isRequired,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    style: PropTypes.object,
};

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        translation: state.app.translation
    };
}

export default connect(mapStateToProps)(Button);
