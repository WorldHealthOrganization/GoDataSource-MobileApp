/**
 * Created by florinpopa on 03/08/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import Ripple from 'react-native-material-ripple';
import {connect} from "react-redux";
import {getTranslation} from "../utils/functions";
import styles from './../styles';

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
                        backgroundColor: item.selected ? styles.primaryColor : styles.disabledColor,
                        marginHorizontal: index === 0 ? 0 : 8
                    }
                    ]}
                onPress={() => {this.handleSelectItem(item, index)}}
            >
                <Text style={[style.itemTextStyle, {color: item.selected ? styles.backgroundColor : styles.textColor}]}>
                    {this.props.shouldTranslate ? getTranslation(item.value, this.props.translation) : item.value}
                </Text>
            </Ripple>
        )
    };

    handleSelectItem = (item, index) => {
        console.log("What item", item);
        this.props.selectItem(item, index, this.props.id);
    }
}

Selector.defaultProps = {

};

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 8
    },
    itemStyle: {
        alignItems: 'center',
        borderRadius: 16,
        height: 30,
        justifyContent: 'center'
    },
    itemTextStyle: {
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        paddingHorizontal: 16
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        translation: state.app.translation,
    };
}

export default connect(mapStateToProps)(Selector);
