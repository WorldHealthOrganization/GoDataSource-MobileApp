/**
 * Created by florinpopa on 23/08/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import styles from './../styles';
import translations from './../utils/translations'
import {calculateDimension, getTranslation} from './../utils/functions';
import {connect} from "react-redux";
import Ripple from 'react-native-material-ripple';
import {checkArrayAndLength} from './../utils/typeCheckingFunctions';
import lodashGet from 'lodash/get';


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
            <View style={{
                marginHorizontal: calculateDimension(16, false, screenSize),
                justifyContent: 'space-between',
                marginVertical: 5
            }}>
                {
                    data && data.followUpDay ? (
                        <View>
                            <Text style={[style.secondaryText, {marginVertical: 5, marginHorizontal: 7}]} numberOfLines={1}>{getTranslation(translations.personListItem.dayOfFollowUp, translation) + data.followUpDay}</Text>
                        </View>
                    ) : (null)
                }
                {
                    checkArrayAndLength(lodashGet(data, 'exposures', null)) ? (
                        <View>
                            <Text style={style.exposedToTextStyle}>{getTranslation(translations.followUpsScreen.exposedToMessage, translation) + ":"}</Text>
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
                <Text style={[style.secondaryText, {marginVertical: 5, marginHorizontal: 7}]} numberOfLines={1}>{`\u2022 ${exposure.fullName} ${exposure.visualId ? `(${exposure.visualId})` : ''}`}</Text>
            </Ripple>
        )
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
        height: '100%',
        justifyContent: 'center'
    },
    primaryText: {
        fontFamily: 'Roboto-Medium',
        fontSize: 18,
        color: 'black'
    },
    secondaryText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        color: styles.secondaryColor
    },
    exposedToTextStyle: {
        fontFamily: 'Roboto-Medium',
        fontSize: 15,
        color: 'black'
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