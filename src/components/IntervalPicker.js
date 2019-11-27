/**
 * Created by florinpopa on 06/08/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {View, StyleSheet} from 'react-native';
import styles from './../styles';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import PropTypes from 'prop-types';
import CustomMarker from './CustomMarker';
import {getTooltip} from './../utils/functions';
import TooltipComponent from './TooltipComponent';
import lodashGet from 'lodash/get';

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
        let tooltip = getTooltip(this.props.label, this.props.translation, this.props.tooltipsMessage, this.props.tooltipsMessage);
        return (
            <View
                style={[{
                    backgroundColor: 'white',
                    marginVertical: 3,
                    borderRadius: 3,
                    alignItems: 'center'
                }, this.props.style]}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                    <MultiSlider
                        values={this.props.value ? this.props.value.length === 1 ? this.props.value : [this.props.value[0], this.props.value[1]] : [this.state.interval[0], this.state.interval[1]]}
                        onValuesChange={this.multiSliderValuesChange}
                        min={this.props.min}
                        max={this.props.max}
                        step={this.props.step ? this.props.step : 1}
                        snapped
                        sliderLength={this.props.sliderLength}
                        unselectedStyle={{
                            backgroundColor: lodashGet(this.props, 'unselectedStyle', styles.navigationDrawerSeparatorGrey)
                        }}
                        selectedStyle={{
                            backgroundColor: lodashGet(this.props, 'selectedStyle', styles.buttonGreen)
                        }}
                        customMarker={(props) => {
                             return (
                                <CustomMarker
                                    currentValue={props.currentValue}
                                    markerColor={this.props.markerColor}
                                />)
                        }}
                        allowOverlap={false}
                    />
                    {
                        tooltip.hasTooltip === true ? (
                            <TooltipComponent
                                tooltipMessage={tooltip.tooltipMessage}
                                style = {{
                                    flex: 0,
                                    marginTop: 0,
                                    marginBottom: 0,
                                    marginLeft: 5
                                }}
                            />
                        ) : null
                    }
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
    noMargin: true,
    markerColor: 'black',
    sliderLength: 280,
    selectedStyle: styles.buttonGreen,
    unselectedStyle: styles.navigationDrawerSeparatorGrey
};

IntervalPicker.propTypes = {
    label: PropTypes.string.isRequired,
    noMargin: PropTypes.bool,
    markerColor: PropTypes.string,
    sliderLength: PropTypes.number,
    selectedStyle: PropTypes.string,
    unselectedStyle: PropTypes.string
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
