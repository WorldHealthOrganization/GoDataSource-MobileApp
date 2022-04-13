/**
 * Created by florinpopa on 23/08/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {Image, StyleSheet, Text, View, Linking} from 'react-native';
import styles from './../styles';
import translations from './../utils/translations'
import {calculateDimension, callPhone, getTranslation} from './../utils/functions';
import {connect} from "react-redux";
import Ripple from 'react-native-material-ripple';
import colors from "../styles/colors";

class PersonListItemNameAndAddressComponent extends PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        let {firstComponentRenderData, translation, titleColor, emails} = this.props;
        return (
            <View>
                <View style={{
                    flexDirection: 'row',
                    marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                    justifyContent: 'space-between',
                    marginVertical: 5
                }}>
                    <View key={'firstView'} style={{flex: 1}}>
                        <Ripple key={'firstChildOfFirstView'} onPress={() => this.props.onPressName(firstComponentRenderData.type, firstComponentRenderData.id)}>
                            <Text style={[style.primaryText, {marginVertical: 5, flex: 3, color: titleColor || 'black'}]}
                                  numberOfLines={1}>{firstComponentRenderData.fullName}</Text>
                        </Ripple>
                        <View style={{flexDirection: 'row'}}>
                            <Text
                                style={[style.secondaryText, {marginHorizontal: 7, display: !firstComponentRenderData.gender && !firstComponentRenderData.age ? 'none' : 'flex'}]}
                                numberOfLines={1}
                            >{'\u2022 ' + firstComponentRenderData.gender + ' ' + firstComponentRenderData.age}</Text>
                            <Text
                                style={[style.secondaryText, {marginHorizontal: 7, display: firstComponentRenderData.visualId ? 'flex' : 'none'}]}
                                numberOfLines={1}
                            >{'\u2022 ' + ' ID: ' + firstComponentRenderData.visualId}</Text>
                        </View>
                        {
                            this.props.type === 'Event' ?
                                <>
                                    <Text style={[style.secondaryText, {
                                        flex: 1,
                                        marginHorizontal: 7,
                                        display: firstComponentRenderData.date ? 'flex' : 'none'
                                    }]}>
                                        {'\u2022 ' + getTranslation(translations.eventSingleScreen.date, translation) + ": " + firstComponentRenderData.date}
                                    </Text>
                                    <Text style={[style.secondaryText, {
                                        flex: 1,
                                        marginHorizontal: 7,
                                        display: firstComponentRenderData.description ? 'flex' : 'none'
                                    }]}>
                                        {'\u2022 ' + getTranslation(translations.eventSingleScreen.description, translation) + ": " + firstComponentRenderData.description}
                                    </Text>
                                </>
                                :
                                null
                        }
                        <Text style={[style.secondaryText, {
                            flex: 1,
                            marginHorizontal: 7,
                            display: firstComponentRenderData.addressString ? 'flex' : 'none'
                        }]}>
                            {'\u2022 ' + getTranslation(translations.addressFieldLabels.address, translation) + ": " + firstComponentRenderData.addressString}
                        </Text>
                        <Text style={[style.secondaryText, {
                            flex: 1,
                            marginHorizontal: 7,
                            display: firstComponentRenderData.emails ? 'flex' : 'none'
                        }]}>
                            {'\u2022 ' + "Emails" + ": " + firstComponentRenderData.emails}
                        </Text>
                        {
                            firstComponentRenderData.status ?
                            (
                                <Text style={[style.secondaryText, {
                                    flex: 1,
                                    marginHorizontal: 7,
                                    display: firstComponentRenderData.status ? 'flex' : 'none'
                                }]}>
                                    {'\u2022 ' + getTranslation(translations.contactSingleScreen.followUpFinalStatus, translation) + ": " + firstComponentRenderData.status}
                                </Text>
                            ) : (null)
                        }
                        {
                            firstComponentRenderData.institutionName ?
                                (
                                    <Text style={[style.secondaryText, {
                                        flex: 1,
                                        marginHorizontal: 7,
                                        display: firstComponentRenderData.institutionName ? 'flex' : 'none'
                                    }]}>
                                        {'\u2022 ' + getTranslation(translations.usersScreen.institutionName, translation) + ": " + firstComponentRenderData.institutionName}
                                    </Text>
                                ) : (null)
                        }
                        {
                            firstComponentRenderData.telephoneNumbers ?
                                (
                                    <View style={{
                                        flex: 1,
                                        marginHorizontal: 7,
                                        flexDirection:'row'
                                    }}>
                                        <Text style={[style.secondaryText, {
                                            display: firstComponentRenderData.telephoneNumbers ? 'flex' : 'none'
                                        }]}>
                                            {'\u2022 ' + getTranslation(translations.usersScreen.primaryPhone, translation) + ": "}
                                        </Text>
                                        <Ripple onPress={() => {
                                            callPhone(translation)(firstComponentRenderData.telephoneNumbers)
                                        }}>
                                            <Text style={[style.secondaryText, {
                                                color: colors.buttonGreen,
                                                display: firstComponentRenderData.telephoneNumbers ? 'flex' : 'none'
                                            }]}>
                                                {firstComponentRenderData.telephoneNumbers}
                                            </Text>
                                        </Ripple>
                                    </View>
                                ) : (null)
                        }
                        {
                            firstComponentRenderData.classification ?
                                (
                                    <Text style={[style.secondaryText, {
                                        flex: 1,
                                        marginHorizontal: 7,
                                        display: firstComponentRenderData.classification ? 'flex' : 'none'
                                    }]}>
                                        {'\u2022 ' + getTranslation(translations.caseSingleScreen.classification, translation) + ": " + firstComponentRenderData.classification}
                                    </Text>
                                ) : (null)
                        }
                        {
                            firstComponentRenderData.labName ?
                                (
                                    <Text style={[style.secondaryText, {
                                        flex: 1,
                                        marginHorizontal: 7,
                                        display: firstComponentRenderData.labName ? 'flex' : 'none'
                                    }]}>
                                        {'\u2022 ' + getTranslation(translations.labResultsScreen.labName, translation) + ": " + getTranslation(firstComponentRenderData.labName, translation)}
                                    </Text>
                                ) : (null)
                        }
                        {
                            firstComponentRenderData.dateSampleTaken ?
                                (
                                    <Text style={[style.secondaryText, {
                                        flex: 1,
                                        marginHorizontal: 7,
                                        display: firstComponentRenderData.dateSampleTaken ? 'flex' : 'none'
                                    }]}>
                                        {'\u2022 ' + getTranslation(translations.labResultsScreen.sampleTaken, translation) + ": " + firstComponentRenderData.dateSampleTaken}
                                    </Text>
                                ) : (null)
                        }
                        {
                            firstComponentRenderData.dateOfResult ?
                                (
                                    <Text style={[style.secondaryText, {
                                        flex: 1,
                                        marginHorizontal: 7,
                                        display: firstComponentRenderData.dateOfResult ? 'flex' : 'none'
                                    }]}>
                                        {'\u2022 ' + getTranslation(translations.labResultsScreen.dateOfResult, translation) + ": " + firstComponentRenderData.dateOfResult}
                                    </Text>
                                ) : (null)
                        }
                        {
                            firstComponentRenderData.result ?
                                (
                                    <Text style={[style.secondaryText, {
                                        flex: 1,
                                        marginHorizontal: 7,
                                        display: firstComponentRenderData.result ? 'flex' : 'none'
                                    }]}>
                                        {'\u2022 ' + getTranslation(translations.labResultsScreen.result, translation) + ": " + firstComponentRenderData.result}
                                    </Text>
                                ) : (null)
                        }
                        {
                            firstComponentRenderData.labResultStatus ?
                                (
                                    <Text style={[style.secondaryText, {
                                        flex: 1,
                                        marginHorizontal: 7,
                                        display: firstComponentRenderData.labResultStatus ? 'flex' : 'none'
                                    }]}>
                                        {'\u2022 ' + getTranslation(translations.labResultsScreen.status, translation) + ": " + firstComponentRenderData.labResultStatus}
                                    </Text>
                                ) : (null)
                        }
                    </View>
                    {
                        (this.props.type !== 'User' &&
                            this.props.type !== 'LabResult') ? (
                            <Ripple key={'secondView'} style={{width: 35, height: 35}} disabled={!this.props.onPressMapIcon} onPress={this.props.onPressMapIcon}>
                                <Image source={{uri: 'map_icon'}} style={{width: 35, height: 35}}/>
                            </Ripple>
                        ) : (null)
                    }
                </View>
                {
                    this.props.type !== 'Case' ? (
                        <View key={'thirdView'} style={styles.lineStyle} />
                    ) : (null)
                }
            </View>
        )
    }
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
        color: styles.navigationDrawerItemText
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
        color: styles.buttonGreen
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
        color: styles.buttonTextGray
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
    };
}

export default connect(mapStateToProps)(PersonListItemNameAndAddressComponent);