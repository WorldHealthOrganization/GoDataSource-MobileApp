/**
 * Created by mobileclarisoft on 16/07/2018.
 */
import React, {PureComponent} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
var Switch = require('react-native-material-switch');

class SwitchInput extends PureComponent {

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
            <View style={[{
                flexDirection: 'row',
                width: '100%'
            }, this.props.style]}>
                <Text style={[{

                }, this.props.labelStyle]}>
                    {this.props.label}
                </Text>
                {
                    this.props.isEditMode ?
                    <Switch
                        active={this.props.value}
                        switchWidth={30}
                        switchHeight={12.5}
                        buttonRadius={9.5}
                        inactiveButtonColor={'rgb(250,250,250)'}
                        inactiveBackgroundColor={'rgba(0,0,0,.3)'}
                        activeButtonColor={this.props.activeButtonColor}
                        activeBackgroundColor={this.props.activeBackgroundColor}
                        style={{
                            flex: 0.1,
                        }}
                        onChangeState={ (state) => this.props.onChange(state, this.props.id)}
                    /> : ( this.props.showValue &&
                        <Text style={{
                            fontFamily: 'Roboto-Light',
                            fontSize: 12.5,
                            textAlign: 'left',
                            color: 'rgb(60,60,60)',
                            lineHeight: 30,
                        }}>
                            {this.props.value != true ? 'No' : 'Yes'}
                        </Text>
                    )
                }
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({

});

SwitchInput.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.bool.isRequired,
    showValue: PropTypes.bool.isRequired,
    isEditMode: PropTypes.bool.isRequired,
    isRequired: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    activeButtonColor: PropTypes.string.isRequired,
    activeBackgroundColor: PropTypes.string.isRequired,
    style: PropTypes.object,
    labelStyle: PropTypes.object,
};

export default SwitchInput;
