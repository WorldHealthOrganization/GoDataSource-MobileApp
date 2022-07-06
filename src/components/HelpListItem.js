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
import styles from './../styles';
import Ripple from 'react-native-material-ripple';
import ElevatedView from 'react-native-elevated-view';
import translations from './../utils/translations'

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
        let primaryColor = 'black';
        let categoryText = help ? (help.categoryId ? `${getTranslation(translations.helpScreen.helpCategoryLabel, this.props.translation)}: ${getTranslation(help.categoryId, this.props.translation)}` : ' ') : '';

        return (
            <ElevatedView elevation={3} style={[style.container, {
                marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                height: calculateDimension(178, true, this.props.screenSize)
            }]}>
                <View style={[style.firstSectionContainer, {
                    height: calculateDimension(53, true, this.props.screenSize),
                    paddingBottom: calculateDimension(18, true, this.props.screenSize)
                }]}>
                    <ListItem
                        numberOfLines={1}
                        centerElement={
                            <View style={style.centerItemContainer}>
                                <Text style={[style.primaryText, {flex: 3, color: primaryColor}]} numberOfLines={1}>{primaryText}</Text>
                            </View>
                        }
                        style={{
                            container: {marginRight: calculateDimension(13, false, this.props.screenSize)},
                            rightElementContainer: {justifyContent: 'center', alignItems: 'center'}
                        }}
                    />
                </View>
                <View style={styles.lineStyle}/>
                <View style={[style.secondSectionContainer, {height: calculateDimension(78.5, true, this.props.screenSize)}]}>
                    <Text
                        style={[style.addressStyle, {
                            marginHorizontal: calculateDimension(14, false, this.props.screenSize),
                            marginVertical: 7.5
                        }]}
                        numberOfLines={2}
                    >{categoryText}</Text>
                </View>
                <View style={styles.lineStyle}/>
                <View style={[style.thirdSectionContainer, {marginHorizontal: calculateDimension(14, false, this.props.screenSize)}]}>
                    <Ripple style={[style.rippleStyle]} onPress={this.onPressHelpItem}>
                        <Text style={[style.rippleTextStyle]}>{this.props.firstActionText || getTranslation(translations.helpScreen.viewHelpLabel, this.props.translation).toUpperCase()}</Text>
                    </Ripple>
                </View>
            </ElevatedView>
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
    container: {
        backgroundColor: 'white',
        borderRadius: 2
    },
    firstSectionContainer: {
        justifyContent: 'space-between',
    },
    addressStyle: {
        fontFamily: 'Roboto-Light',
        fontSize: 12,
        color: styles.textColor
    },
    secondSectionContainer: {
        justifyContent: 'center'
    },
    thirdSectionContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    rippleStyle: {
        height: '100%',
        justifyContent: 'center'
    },
    rippleTextStyle: {
        fontFamily: 'Roboto-Medium',
        fontSize: 12,
        color: styles.primaryButton
    },
    centerItemContainer: {
        flexDirection: 'row',
        height: '100%',
        alignItems: 'center'
    },
    primaryText: {
        fontFamily: 'Roboto-Medium',
        fontSize: 18,
        color: 'black'
    },
    secondaryText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 13,
        color: 'black'
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
