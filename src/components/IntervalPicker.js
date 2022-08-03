/**
 * Created by florinpopa on 06/08/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {StyleSheet, View} from 'react-native';
import {connect} from "react-redux";
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import PropTypes from 'prop-types';
import CustomMarker from './CustomMarker';
import {getTooltip} from './../utils/functions';
import TooltipComponent from './TooltipComponent';
import lodashGet from 'lodash/get';
import {Switch} from 'react-native-ui-lib';
import styles from './../styles';

class IntervalPicker extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);

        this.state = {
            interval: this.props.value ? this.props.value.length === 1 ? [this.props.value[0]] : [this.props.value[0], this.props.value[1]] : [this.props.min, this.props.max],
            active: this.props.showSwitch ? !!this.props.active : true
        }
    }
    // Please add here the react lifecycle methods that you need

    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.value !== this.props.value){
            this.state.interval = this.props.value ? this.props.value : [this.props.min, this.props.max];
            // this.setState({
            //     interval: this.props.value ? this.props.value.length === 1 ? [this.props.value[0]] : [this.props.value[0], this.props.value[1]] : [this.props.min, this.props.max],
            // })
        }
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        let tooltip = getTooltip(this.props.label, this.props.translation, this.props.tooltipsMessage, this.props.tooltipsMessage);
        return (
            <View style={[{alignItems: 'center'}, this.props.style]}>
                <View style={style.intervalPickerContainer}>
                    {
                        this.props.showSwitch &&
                        <Switch
                            value={this.state.active}
                            onValueChange={(value)=>{
                                if (value){
                                    this.multiSliderValuesChange(this.state.interval);
                                } else {
                                    this.multiSliderValuesChange(null);
                                }
                                this.setState({
                                    active: value
                                });
                            }}
                            height={18}
                            width={36}
                            thumbSize={14}
                            offColor={lodashGet(this.props, 'unselectedStyle', styles.secondaryColor)}
                            onColor={lodashGet(this.props, 'selectedStyle', styles.primaryColor)}
                        />
                    }

                    <MultiSlider
                        values={this.state.interval}
                        onValuesChange={this.multiSliderValuesChange}
                        enabledOne={this.state.active}
                        enabledTwo={this.state.active}
                        min={this.props.min}
                        max={this.props.max}
                        step={this.props.step ? this.props.step : 1}
                        snapped
                        sliderLength={this.props.showSwitch ? this.props.sliderLength - 40 : this.props.sliderLength}
                        unselectedStyle={{
                            backgroundColor: lodashGet(this.props, 'unselectedStyle', styles.secondaryColor)
                        }}
                        selectedStyle={{
                            backgroundColor: this.state.active ?
                                lodashGet(this.props, 'selectedStyle', styles.primaryColor)
                                :
                                lodashGet(this.props, 'unselectedStyle', styles.secondaryColor)
                        }}
                        customMarker={(props) => {
                             return (
                                <CustomMarker
                                    currentValue={props.currentValue}
                                    markerStyle={{
                                        backgroundColor: this.state.active ?
                                            lodashGet(this.props, 'selectedStyle', styles.primaryColor)
                                            :
                                            lodashGet(this.props, 'unselectedStyle', styles.secondaryColor),
                                        height: 14,
                                        width: 14,
                                        top: -2
                                    }}
                                    markerColor={this.state.active ? this.props.markerColor : lodashGet(this.props, 'unselectedStyle', styles.secondaryColor)}
                                />)
                        }}
                        allowOverlap={this.props.allowOverlap || true}
                    />
                    {
                        tooltip.hasTooltip === true ? (
                            <TooltipComponent
                                tooltipMessage={tooltip.tooltipMessage}
                                style = {{
                                    flex: 0,
                                    marginTop: 0,
                                    marginBottom: 0,
                                    marginLeft: 8
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
        if(this.state.active){
            if(values){
                this.setState({
                    interval: values
                })
            }
            this.props.onChange(values, this.props.id);
        }
    };
}


IntervalPicker.defaultProps = {
    label: 'Test',
    noMargin: true,
    markerColor: 'black',
    sliderLength: 280,
    selectedStyle: styles.primaryButton,
    unselectedStyle: styles.separatorColor
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
    intervalPickerContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        width: '100%'
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        translation: state.app.translation,
    };
}

export default connect(mapStateToProps)(IntervalPicker);
