/**
 * Created by florinpopa on 23/07/2018.
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

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const VIEWABILITY_CONFIG = {
    minimumViewTime: 3000,
    viewAreaCoveragePercentThreshold: 100,
    waitForInteraction: true
};

class AnimatedListView extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    scrollPosition = new Animated.Value(0);

    handleScroll = Animated.event(
        [{nativeEvent: { contentOffset: { y: this.scrollPosition } }}],
        {useNativeDriver: true}
    );

    // Please add here the react lifecycle methods that you need


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <AnimatedFlatList
                ref={this.animatedFlatList}
                data={this.props.data}
                renderItem={this.props.renderItem}
                keyExtractor={this.props.keyExtractor}
                ItemSeparatorComponent={this.props.ItemSeparatorComponent}
                legacyImplementation={false}
                viewabilityCongig={VIEWABILITY_CONFIG}
                disableVirtualization={false}
                onScroll={this.props.onScroll}
                ListHeaderComponent={this.props.ListHeaderComponent}
                ListEmptyComponent={this.props.ListEmptyComponent}
                style={this.props.style}
                componentContainerStyle={this.props.componentContainerStyle}
                stickyHeaderIndices={this.props.stickyHeaderIndices}
                onRefresh={this.props.onRefresh}
                refreshing={this.props.refreshing}
            />
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
}

AnimatedListView.defaultProps = {
    data: [],
    renderItem: () => {return (<View  />)},
    keyExtractor: () => {return null},
    renderSeparatorComponent: () => {return (<View />)}
};

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

export default connect(mapStateToProps, matchDispatchProps)(AnimatedListView);
