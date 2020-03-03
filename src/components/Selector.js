/**
 * Created by florinpopa on 03/08/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import Ripple from 'react-native-material-ripple';
import styles from './../styles';
import {connect} from "react-redux";

class Selector extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    // Please add here the react lifecycle methods that you need


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <View style={[this.props.style, style.container]}>
                <FlatList
                    data={this.props.data}
                    renderItem={this.renderItem}
                    horizontal={true}
                />
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    renderItem = ({item, index}) => {
        return (
            <Ripple
                style={[
                    style.itemStyle,
                    {
                        backgroundColor: item.selected ? styles.buttonGreen : styles.colorUnselectedItem,
                        marginHorizontal: index === 0 ? 0 : 10
                    }
                    ]}
                onPress={() => {this.handleSelectItem(item, index)}}
            >
                <Text style={[style.itemTextStyle, {color: item.selected ? 'white' : styles.colorUnselectedItemText}]}>
                    {item.value}
                </Text>
            </Ripple>
        )
    };

    handleSelectItem = (item, index) => {
        this.props.selectItem(item, index, this.props.id);
    }
}

Selector.defaultProps = {

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

export default connect(mapStateToProps)(Selector);
