/**
 * Created by florinpopa on 16/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {InteractionManager, Platform, StyleSheet, Text, View} from 'react-native';
import {Icon} from 'react-native-material-ui';
import {calculateDimension, getTranslation} from './../utils/functions';
import {connect} from "react-redux";
import Ripple from 'react-native-material-ripple';
import ElevatedView from 'react-native-elevated-view';
import styles from './../styles';
import {Navigation} from "react-native-navigation";

class NavBarCustom extends PureComponent {

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
            <View style={[this.props.style, style.container,
                {
                    height: calculateDimension(this.props.children ? 81 : 40.5, true, this.props.screenSize),
                    marginTop: Platform.OS === 'ios' ? this.props.screenSize.height >= 812 ? 44 : 20 : 0,
                    marginHorizontal: calculateDimension(16, false, this.props.screenSize)
                },
                Platform.OS === 'ios' && {zIndex: 99}
            ]}
            >
                <View style={[style.containerUpperNavBar, {flex: this.props.children ? 0.5 : 1, justifyContent: 'space-between'}]}>
                    <View style={[style.containerUpperNavBar, {flex: 1}]}>
                        <Ripple onPress={this.handlePressNavbarButton} hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
                            <Icon name={this.props.iconName}/>
                        </Ripple>
                        {
                            this.props.customTitle && !this.props.title ? (
                                this.props.customTitle
                            ) : (
                                <Text style={style.title}>
                                    {getTranslation(this.props.title, this.props.translation)}
                                </Text>
                            )
                        }
                    </View>
                    {
                        this.props.hasHelpItems !== null && this.props.hasHelpItems !== undefined && this.props.hasHelpItems === true ? (
                            <ElevatedView
                                elevation={3}
                                style={{
                                    flex: 0,
                                    backgroundColor: styles.buttonGreen,
                                    width: calculateDimension(33, false, this.props.screenSize),
                                    height: calculateDimension(25, true, this.props.screenSize),
                                    borderRadius: 4
                                }}
                            >
                                <Ripple style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }} onPress={this.handleHelpIconClick}>
                                    <Icon name="help" color={'white'} size={15}/>
                                </Ripple>
                            </ElevatedView> 
                        ) : null
                    }
                </View>
                {
                    this && this.props && this.props.children ? (<View style={[style.containerLowerNavBar]}>
                            {
                                this.props.children || null
                            }
                        </View>) : (null)
                }
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handlePressNavbarButton = () => {
        console.log("Clicked the nav bar button");
        InteractionManager.runAfterInteractions(() => {
            console.log("After interaction", this.props.componentId);
            Navigation.mergeOptions(this.props.componentId,{
                sideMenu: {
                    left: {
                        visible: true
                    }
                }});
            this.props.handlePressNavbarButton();
        })
    }

    handleHelpIconClick = () => {
        InteractionManager.runAfterInteractions(() => {
            this.props.goToHelpScreen();
        })
    }
}

NavBarCustom.defaultProps = {
    customTitle: null,
    title: 'Test'
};

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        backgroundColor: 'rgb(237, 237, 237)'
    },
    containerUpperNavBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    title: {
        fontSize: 17,
        fontFamily: 'Roboto-Medium',
        marginLeft: 30
    },
    containerLowerNavBar: {
        flex: 0.5,
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        translation: state.app.translation
    };
}

export default connect(mapStateToProps)(NavBarCustom);
