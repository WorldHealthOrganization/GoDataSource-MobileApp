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
import {StackActions} from '@react-navigation/native';
import {calculateDimension, getTranslation} from '../utils/functions';
import {navigationRef} from '../Root';
import styles from '../styles';

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
                index !== (numberOfEntities - 1) ? (<Icon name="chevron-right" size={16} color={styles.secondaryColor} style={[style.chevronStyle]} />) : (null)
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
            <View style={style.crumbsContainerStyle}>
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
        InteractionManager.runAfterInteractions(() => {
            const lastIndex = this.props.entities.length - 1;
            // The last crumb is the current screen — tapping it does nothing.
            if (index >= lastIndex) {
                return;
            }
            // Let a host screen override navigation if it supplied a handler.
            if (this.props.onPress) {
                this.props.onPress(index);
                return;
            }
            // Fall back to the global navigation ref when the screen didn't pass
            // its own navigation prop (many callers don't).
            const nav = this.props.navigation ||
                (navigationRef && navigationRef.isReady && navigationRef.isReady() ? navigationRef : null);
            // Guard canGoBack so we never trigger Android's default back (which
            // would send the app to the background).
            if (!nav || !nav.canGoBack || !nav.canGoBack()) {
                return;
            }
            const steps = lastIndex - index;
            try {
                if (steps <= 1) {
                    nav.goBack();
                } else {
                    nav.dispatch(StackActions.pop(steps));
                }
            } catch (e) {
                if (nav.canGoBack()) {
                    nav.goBack();
                }
            }
        });
    }
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    crumbsContainerStyle: {
        backgroundColor: styles.backgroundColor,
        flex: 1,
        flexDirection: 'row',
        paddingHorizontal: 16,
        width: '100%'
    },
    crumbStyle: {
        alignItems: 'center',
        flexDirection: 'row'
    },
    crumbTextStyle: {
        color: styles.secondaryColor,
        fontFamily: 'Roboto-Light',
        fontSize: 16
    },
    activeCrumbTextStyle: {
        color: styles.textColor,
        fontFamily: 'Roboto-Regular',
        fontSize: 16
    },
    chevronStyle: {
        marginHorizontal: 4
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        translation: state.app.translation
    };
}
export default connect(mapStateToProps)(Breadcrumb);
