/**
 * Created by florinpopa on 06/08/2018.
 */
import React, {PureComponent} from 'react';
import {View, Text, StyleSheet} from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import {Icon} from 'react-native-material-ui';
import {calculateDimension} from './../utils/functions';
import config from './../utils/config';
import styles from './../styles';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import PropTypes from 'prop-types';
import CustomMarker from './CustomMarker';
import translations from './../utils/translations'
import {getTranslation} from './../utils/functions';

class IntervalPicker extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {
            interval: [this.props.min, this.props.max]
        }
    }

    // Please add here the react lifecycle methods that you need


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <View
                style={[{
                    backgroundColor: 'white',
                    marginVertical: 3,
                    borderRadius: 3
                }, this.props.style]}
            >
                <View style={{width: '100%', alignItems: 'center', justifyContent: 'center'}}>
                    <MultiSlider
                        values={this.props.value ? this.props.value.length === 1 ? this.props.value : [this.props.value[0], this.props.value[1]] : [this.state.interval[0], this.state.interval[1]]}
                        onValuesChange={this.multiSliderValuesChange}
                        min={this.props.min}
                        max={this.props.max}
                        step={1}
                        snapped
                        unselectedStyle={{
                            backgroundColor: styles.navigationDrawerSeparatorGrey
                        }}
                        selectedStyle={{
                            backgroundColor: styles.buttonGreen
                        }}
                        customMarker={(props) => {
                             return (
                                <CustomMarker currentValue={props.currentValue}/>)
                        }}
                        allowOverlap={false}
                    />
                </View>
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    multiSliderValuesChange = (values) => {
        this.props.onChange(values, this.props.id);
    };
}


IntervalPicker.defaultProps = {
    label: 'Test',
    noMargin: true
};

IntervalPicker.propTypes = {
    label: PropTypes.string.isRequired,
    noMargin: PropTypes.bool
};

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flex: 1
    },
    itemStyle: {
        height: 25,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12.5
    },
    itemTextStyle: {
        paddingHorizontal: 18,
        fontFamily: 'Roboto-Regular',
        fontSize: 11
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        translation: state.app.translation,
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(IntervalPicker);
