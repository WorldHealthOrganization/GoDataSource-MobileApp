/**
 * Created by florinpopa on 19/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {TextInput, View, Text, StyleSheet, Platform, Dimensions, Animated} from 'react-native';
import {ListItem, Icon} from 'react-native-material-ui';
import {calculateDimension} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {TextField} from 'react-native-material-textfield';
import Button from './Button';
import styles from './../styles';
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

        console.log("### style: ", this.props.style);

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
                    <TextInputWithIcon/>
                    <Button title="Filter" color="white" titleColor={styles.buttonTextGray}
                            onPress={() => console.log("TEst")} height={25} width={35}/>
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

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(SearchFilterView);
