/**
 * Created by florinpopa on 23/08/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import translations from './../utils/translations'
import {calculateDimension, getTranslation} from './../utils/functions';
import {connect} from "react-redux";
import Ripple from 'react-native-material-ripple';
import {checkArrayAndLength} from './../utils/typeCheckingFunctions';
import lodashGet from 'lodash/get';
import styles from './../styles';

class PersonListItemNameAndAddressComponent extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        // console.log(`Render PersonListItem subComponent 2`);
        let {data, translation, screenSize} = this.props;
        return (
            <View style={style.exposedSection}>
                {
                    data && data.followUpDay ? (
                        <View style={style.exposedSectionContent}>
                            <Text style={[style.secondaryText]} numberOfLines={1}>
                                {'\u2022 ' + getTranslation(translations.personListItem.dayOfFollowUp, translation)}
                                <Text style={style.valueText}>{data.followUpDay}</Text>
                            </Text>
                        </View>
                    ) : (null)
                }
                {
                    checkArrayAndLength(lodashGet(data, 'exposures', null)) ? (
                        <View>
                            <Text style={style.exposedToTextStyle}>
                                {getTranslation(translations.followUpsScreen.exposedToMessage, translation) + ":"}
                            </Text>
                            {
                                data.exposures.map((exposure, index) => {
                                    return this.renderExposures(exposure, index);
                                })
                            }
                        </View>
                    ) : (null)
                }
            </View>
        )
    }


    renderExposures = (exposure, index) => {
        return(
            <Ripple disabled={exposure.type !== translations.personTypes.cases || exposure.type !== translations.personTypes.events} key={index} onPress={() => this.props.onPressExposureProp(exposure)}>
                <Text style={[style.secondaryText]} numberOfLines={1}>
                    {`\u2022 ${exposure.fullName} ${exposure.visualId ? `(${exposure.visualId})` : ''}`}
                </Text>
            </Ripple>
        )
    };
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        backgroundColor: styles.backgroundColor,
        borderRadius: 4
    },
    firstSectionContainer: {
        justifyContent: 'space-between',
    },
    addressStyle: {
        color: styles.textColor,
        fontFamily: 'Roboto-Light',
        fontSize: 14
    },
    secondSectionContainer: {
        justifyContent: 'center'
    },
    thirdSectionContainer: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    rippleStyle: {
        height: '100%',
        justifyContent: 'center'
    },
    rippleTextStyle: {
        color: styles.primaryColor,
        fontFamily: 'Roboto-Medium',
        fontSize: 14
    },
    centerItemContainer: {
        height: '100%',
        justifyContent: 'center'
    },
    primaryText: {
        color: styles.textColor,
        fontFamily: 'Roboto-Medium',
        fontSize: 16
    },
    secondaryText: {
        color: styles.secondaryColor,
        fontFamily: 'Roboto-Regular',
        fontSize: 14
    },
    exposedSection: {
        justifyContent: 'space-between',
        paddingBottom: 16,
        paddingHorizontal: 16
    },
    exposedToTextStyle: {
        color: styles.textColor,
        fontFamily: 'Roboto-Medium',
        fontSize: 14
    },
    exposedSectionContent: {
        marginBottom: 16
    },
    valueText: {
        color: styles.textColor
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        translation: state.app.translation,
        roles: state.role
    };
}

export default connect(mapStateToProps)(PersonListItemNameAndAddressComponent);