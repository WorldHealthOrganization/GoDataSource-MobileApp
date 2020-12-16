/**
 * Created by florinpopa on 26/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {View, Text, StyleSheet, InteractionManager} from 'react-native';
import {Icon} from 'react-native-material-ui';
import Ripple from 'react-native-material-ripple';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {calculateDimension, getTranslation} from './../utils/functions';

const Crumb = ({isCrumbActive, index, text, numberOfEntities, crumbPress, translation}) => {
    return (
        <Ripple onPress={() => crumbPress(index)} style={[style.crumbStyle, index !== 0 ? {flex: 1}: {}]}>
            <Text
                style={[isCrumbActive ? style.activeCrumbTextStyle : style.crumbTextStyle]}
                numberOfLines={1}
            >
                {getTranslation(text, translation)}
            </Text>
            {
                index !== (numberOfEntities - 1) ? (<Icon name="chevron-right" size={16} color={isCrumbActive ? 'black' : 'gray'} style={[style.chevronStyle]} />) : (null)
            }
        </Ripple>
    )
};

class Breadcrumb extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {
            index: 1
        };
    }

    // Please add here the react lifecycle methods that you need
    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <View style={[style.crumbsContainerStyle, {
                width: calculateDimension(250, false, this.props.screenSize),
                marginLeft: calculateDimension(16, false, this.props.screenSize)
            }]}>
                {
                    this.props.entities.length === 1 ? (
                        <Text style={[style.activeCrumbTextStyle, style.crumbStyle]}>{this.props.entities[0]}</Text>
                    ) : (
                        this.props.entities.map((item, index) => {
                            return (
                                <Crumb
                                    key={index}
                                    text={item}
                                    index={index}
                                    isCrumbActive={this.state.index === index}
                                    numberOfEntities={this.props.entities.length}
                                    crumbPress={this.handleCrumbPress}
                                    translation={this.props.translation}
                                />
                            )
                        })
                    )
                }
            </View>
        );
    }


    // Please write here all the methods that are not react native lifecycle methods
    handleCrumbPress = (index) => {
        // this.setState({
        //     index
        // })
        InteractionManager.runAfterInteractions(() => {
            if (index === 0) {
                if(this.props.onPress){
                    this.props.onPress();
                }else {
                    this.props.navigator.pop()
                }
            }
        });
    }
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    crumbsContainerStyle: {
        backgroundColor: 'white',
        flexDirection: 'row'
    },
    crumbStyle: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    crumbTextStyle: {
        fontFamily: 'Roboto-Light',
        fontSize: 18,
        color: 'black'
    },
    activeCrumbTextStyle: {
        fontFamily: 'Roboto-Medium',
        fontSize: 18,
        color: 'black'
    },
    chevronStyle: {
        marginHorizontal: 12
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        translation: state.app.translation
    };
}
export default connect(mapStateToProps)(Breadcrumb);
