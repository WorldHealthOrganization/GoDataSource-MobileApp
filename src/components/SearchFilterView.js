/**
 * Created by florinpopa on 19/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import ElevatedView from 'react-native-elevated-view';
import {calculateDimension} from './../utils/functions';
import {connect} from "react-redux";
import PropTypes from 'prop-types';
import IconButton from './ButtonWithIcons';
import TextInputWithIcon from './TextInputWithIcon';

class SearchFilterView extends Component {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {
            search: ''
        };

        this.handleTextChange = this.handleTextChange.bind(this);

        this.searchRef = this.updateRef.bind(this, 'search');
    }

    // Please add here the react lifecycle methods that you need
    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {

        return (
            <Animated.View style={[this.props.style, {
                height: calculateDimension(50, true, this.props.screenSize),
                backgroundColor: '#eeeeee'
            }]}>
                <View style={[style.container, {
                    width: calculateDimension(375 - 32, false, this.props.screenSize),
                    marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                    marginVertical: calculateDimension(12.5, true, this.props.screenSize)
                }]}>
                    <TextInputWithIcon
                        onSubmitEditing={this.props.onSubmitEditing}
                        onChangeText={this.props.onChangeText}
                        onEndEditing={this.props.onEndEditing}
                        value={this.props.value}
                    />
                    { this.props.hasFilter &&
                        <ElevatedView elevation={4}>
                            <IconButton
                                label={this.props.filterText}
                                containerButton={{backgroundColor: 'white'}}
                                onPress={this.props.onPress}
                                firstIcon={null}
                                isFirstIconPureMaterial={null}
                                secondIcon={'filter-list'}
                                isSecondIconPureMaterial={true}
                            />
                        </ElevatedView>
                    }
                </View>
            </Animated.View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    updateRef(name, ref) {
        this[name] = ref;
    }

    handleTextChange = (text) => {
        ['search']
            .map((name) => ({ name, ref: this[name] }))
            .forEach(({ name, ref }) => {
                if (ref.isFocused()) {
                    this.setState({ [name]: text });
                }
            });
    };
}

SearchFilterView.propTypes = {
    style: PropTypes.object,
    value: PropTypes.string,
    hasFilter: PropTypes.bool,
    onPress: PropTypes.func,
    onChangeText: PropTypes.func,
    onSubmitEditing: PropTypes.func,
    onEndEditing: PropTypes.func,
    filterText: PropTypes.string
};

SearchFilterView.defaultProps = {
    style: {},
    value: '',
    hasFilter: true,
    onPress: () => {console.log('SearchFilterView default onPress')},
    onChangeText: () => {console.log('SearchFilterView default onChangeText')},
    onSubmitEditing: () => {console.log('SearchFilterView default onSubmitEditing')},
    onEndEditing: () => {console.log('SearchFilterView default onEndEditing')},
    filterText: 'Filter By'
};

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flexDirection: 'row'
    },
    textInput: {
        width: '50%',
        alignSelf: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'red',
        paddingVertical: 5
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize
    };
}

export default connect(mapStateToProps)(SearchFilterView);
