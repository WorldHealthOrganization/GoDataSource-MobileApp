/**
 * Created by florinpopa on 26/07/2018.
 */
/**
 * Created by florinpopa on 25/07/2018.
 */
import React, {PureComponent} from 'react';
import {View, Text, StyleSheet, InteractionManager} from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import {Icon} from 'react-native-material-ui';
import Ripple from 'react-native-material-ripple';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {calculateDimension} from './../utils/functions';

const Crumb = ({isCrumbActive, index, text, numberOfEntities, crumbPress}) => {
    return (
        <Ripple onPress={() => crumbPress(index)} style={[style.crumbStyle, {flex: 1}]}>
            <Text
                style={[isCrumbActive ? style.activeCrumbTextStyle : style.crumbTextStyle]}
                numberOfLines={1}
            >{text}</Text>
            {
                index !== (numberOfEntities - 1) && (
                    <Icon name="chevron-right" size={16} color={isCrumbActive && 'black'} style={style.chevronStyle} />
                )
            }
        </Ripple>
    )
}

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
                width: calculateDimension(270, false, this.props.screenSize),
                marginLeft: calculateDimension(16, false, this.props.screenSize)
            }]}>
                {
                    this.props.entities.map((item, index) => {
                        return (
                            <Crumb
                                text={item}
                                index={index}
                                isCrumbActive={this.state.index === index}
                                numberOfEntities={this.props.entities.length}
                                crumbPress={this.handleCrumbPress}
                            />
                        )
                    })
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
                this.props.navigator.pop({
                    animated: true,
                    animationType: 'fade'
                })
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
        screenSize: state.app.screenSize
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(Breadcrumb);
