/**
 * Created by mobileclarisoft on 12/12/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {InteractionManager, StyleSheet, Text, View} from 'react-native';
import {ListItem} from 'react-native-material-ui';
import {calculateDimension, getTranslation} from './../utils/functions';
import {connect} from "react-redux";
import Ripple from 'react-native-material-ripple';
import ElevatedView from 'react-native-elevated-view';
import translations from './../utils/translations';
import styles from './../styles';

class HelpListItem extends PureComponent {

    // This will be a dumb component, so it's best to put as least business logic as possible
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
        let help = this.props && this.props.item ? this.props.item : null;
        let primaryText = help ? (help.title ? getTranslation(help.title, this.props.translation) : ' ') : '';
        let categoryText = help ? (help.categoryId ? `${getTranslation(translations.helpScreen.helpCategoryLabel, this.props.translation)}: ${getTranslation(help.categoryId, this.props.translation)}` : ' ') : '';

        return (
            <View style={[style.containerWrapper, {marginHorizontal: calculateDimension(16, false, this.props.screenSize)}]}>
                <ElevatedView elevation={5} style={style.container}>
                    {/* Help Header */}
                    <View style={[style.firstSectionContainer]}>
                        <ListItem
                            numberOfLines={1}
                            centerElement={
                                /* Help Title */
                                <View style={style.centerItemContainer}>
                                    <Text style={[style.primaryText]} numberOfLines={1}>
                                        {primaryText}
                                    </Text>
                                </View>
                            }
                            style={{
                                container: {
                                    backgroundColor: styles.backgroundColorRgb,
                                    borderTopLeftRadius: 4,
                                    borderTopRightRadius: 4,
                                    height: 'auto',
                                    paddingVertical: 8
                                },
                                rightElementContainer: {
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }
                            }}
                        />
                    </View>
                    {/* Help Content */}
                    <View style={[style.secondSectionContainer]}>
                        <Text
                            style={[style.addressStyle]}
                            numberOfLines={2}
                        >
                            {categoryText}
                        </Text>
                    </View>
                    {/* Help Button */}
                    <View style={[style.thirdSectionContainer]}>
                        <Ripple onPress={this.onPressHelpItem}>
                            <Text style={[style.rippleTextStyle]}>
                                {this.props.firstActionText || getTranslation(translations.helpScreen.viewHelpLabel, this.props.translation).toUpperCase()}
                            </Text>
                        </Ripple>
                    </View>
                </ElevatedView>
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    onPressHelpItem = () => {
        InteractionManager.runAfterInteractions(() => {
            this.props.onPressViewHelp(this.props.item);
        });
    };
}


// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    containerWrapper: {
        backgroundColor: styles.backgroundColor,
        borderRadius: 4,
        marginVertical: 4
    },
    container: {
        backgroundColor: styles.backgroundColor,
        borderRadius: 4
    },
    firstSectionContainer: {
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        justifyContent: 'space-between'
    },
    centerItemContainer: {
        marginLeft: -8
    },
    primaryText: {
        color: styles.textColor,
        fontFamily: 'Roboto-Medium',
        fontSize: 16,
        lineHeight: 20
    },
    secondSectionContainer: {
        color: styles.secondaryColor,
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        padding: 16
    },
    addressStyle: {
        color: styles.secondaryColor,
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
    },
    thirdSectionContainer: {
        display: 'flex',
        flex: 1,
        justifyContent: 'center',
        padding: 4
    },
    rippleTextStyle: {
        backgroundColor: styles.primaryColorRgb,
        borderRadius: 4,
        color: styles.primaryColor,
        display: 'flex',
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        lineHeight: 26,
        textAlign: 'center'
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        translation: state.app.translation,
        helpCategory: state.helpCategory,
        events: state.events,
        role: state.role
    };
}

export default connect(mapStateToProps)(HelpListItem);
