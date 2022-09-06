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
import {Navigation} from "react-native-navigation";
import styles from './../styles';

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
                    height: calculateDimension(this.props.children ? 81 : 40, true, this.props.screenSize),
                    marginTop: Platform.OS === 'ios' ? this.props.screenSize.height >= 812 ? 44 : 20 : 0
                },
                Platform.OS === 'ios' && {zIndex: 99}
            ]}
            >
                <View style={[style.containerUpperNavBar, {flex: this.props.children ? 0.5 : 1, justifyContent: 'space-between'}]}>
                    <View style={[style.containerUpperNavBar, {flex: 1}]}>
                        <Ripple style={style.menuTrigger} onPress={this.handlePressNavbarButton} hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
                            <Icon style={style.menuTriggerIcon} name={this.props.iconName}/>
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
                                    backgroundColor: styles.disabledColor,
                                    borderRadius: 4,
                                    width: calculateDimension(30, false, this.props.screenSize),
                                    height: calculateDimension(30, true, this.props.screenSize)
                                }}
                            >
                                <Ripple style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }} onPress={this.handleHelpIconClick}>
                                    <Icon name="help" color={styles.backgroundColor} size={18}/>
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
        backgroundColor: styles.backgroundColor
    },
    containerUpperNavBar: {
        alignItems: 'center',
        backgroundColor: styles.backgroundColor,
        borderBottomColor: styles.separatorColor,
        borderBottomWidth: 1,
        flexDirection: 'row',
    },
    menuTrigger: {
        backgroundColor: styles.primaryColor,
        height: 39,
        paddingVertical: 5,
        paddingHorizontal: 4,
        textAlign: 'center',
        width: 39
    },
    menuTriggerIcon: {
        color: styles.backgroundColor,
        fontSize: 30
    },
    title: {
        fontSize: 16,
        fontFamily: 'Roboto-Medium',
        marginLeft: 16,
        textTransform: 'capitalize'
    },
    containerLowerNavBar: {
        alignItems: 'center',
        backgroundColor: styles.backgroundColor,
        flex: 0.5,
        flexDirection: 'row',
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
