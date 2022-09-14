/**
 * Created by florinpopa on 23/08/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {Image, StyleSheet, Text, View, Linking} from 'react-native';
import translations from './../utils/translations'
import {calculateDimension, callPhone, getTranslation} from './../utils/functions';
import {connect} from "react-redux";
import Ripple from 'react-native-material-ripple';
import styles from './../styles';
import { RFC_2822 } from 'moment';

class PersonListItemNameAndAddressComponent extends PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        let {firstComponentRenderData, translation, titleColor, emails} = this.props;
        return (
            /* Card First Component */
            <View>
                <View>
                    <View key={'firstView'} style={style.cardContainer}>
                        {/* Card First Component - Header */}
                        <View style={style.cardHeader}>
                            <View style={style.cardHeaderTitle}>
                                {/* Card First Component - Title */}
                                <Ripple
                                    key={'firstChildOfFirstView'}
                                    onPress={() => this.props.onPressName(firstComponentRenderData.type, firstComponentRenderData.id)}>
                                    <Text
                                        style={[style.primaryText, {color: titleColor || styles.textColor}]}
                                        numberOfLines={1}>
                                        {firstComponentRenderData.fullName}
                                    </Text>
                                </Ripple>
                            </View>
                            {
                                (this.props.type !== 'User' && this.props.type !== 'LabResult') ? (
                                    /* Card First Component - Map icon */
                                    <View style={[style.cardHeaderMap, {display: this.props.onPressMapIcon ? 'flex' : 'none'}]}>
                                        <Ripple
                                            key={'secondView'}
                                            style={style.cardHeaderMapIcon} 
                                            disabled={!this.props.onPressMapIcon}
                                            onPress={this.props.onPressMapIcon}>
                                            <Image source={{uri: 'map_icon'}} style={style.cardHeaderMapIcon} />
                                        </Ripple>
                                    </View>
                                ) : (null)
                            }
                        </View>
                        {/* Card First Component - Content */}
                        <View style={style.cardContent}>
                            <View>
                                {/* Card First Component - Gender & Age */}
                                <View style={style.cardContentGenderAgeContainer}>
                                    <Text
                                        style={[style.cardContentGender, {display: !firstComponentRenderData.gender ? 'none' : 'flex'}]}
                                        numberOfLines={1}>
                                        {'\u2022 ' + firstComponentRenderData.gender}
                                    </Text>
                                    <Text
                                        style={[style.cardContentAge, {display: !firstComponentRenderData.age ? 'none' : 'flex'}]}
                                        numberOfLines={1}>
                                        {'\u2022 ' + firstComponentRenderData.age}
                                    </Text>
                                </View>
                                {/* Card First Component - ID */}
                                <Text
                                    style={[style.secondaryText, {display: firstComponentRenderData.visualId ? 'flex' : 'none'}]}
                                    numberOfLines={1}>
                                    {'\u2022 ' + 'ID: '}
                                    <Text style={style.cardContentValueText}>
                                        {firstComponentRenderData.visualId}
                                    </Text>
                                </Text>
                            </View>
                            {
                                this.props.type === 'Event' ?
                                    <>
                                        {/* Card First Component - Date */}
                                        <Text style={[style.secondaryText, {display: firstComponentRenderData.date ? 'flex' : 'none'}]}>
                                            {'\u2022 ' + getTranslation(translations.eventSingleScreen.date, translation) + ': '}
                                            <Text style={style.cardContentValueText}>
                                                {firstComponentRenderData.date}
                                            </Text>
                                        </Text>
                                        {/* Card First Component - Description */}
                                        <Text style={[style.secondaryText, {display: firstComponentRenderData.description ? 'flex' : 'none'}]}>
                                            {'\u2022 ' + getTranslation(translations.eventSingleScreen.description, translation) + ': '}
                                            <Text style={style.cardContentValueText}>
                                                {firstComponentRenderData.description}
                                            </Text>
                                        </Text>
                                    </>
                                    :
                                    null
                            }
                            {/* Card First Component - Address */}
                            <Text style={[style.secondaryText, {display: firstComponentRenderData.addressString ? 'flex' : 'none'}]}>
                                {'\u2022 ' + getTranslation(translations.addressFieldLabels.address, translation) + ': '}
                                <Text style={style.cardContentValueText}>
                                    {firstComponentRenderData.addressString}
                                </Text>
                            </Text>
                            {/* Card First Component - Emails */}
                            <Text style={[style.secondaryText, {display: firstComponentRenderData.emails ? 'flex' : 'none'}]}>
                                {'\u2022 ' + "Emails" + ': '}
                                <Text style={style.cardContentValueText}>
                                    {firstComponentRenderData.emails}
                                </Text>
                            </Text>
                            {
                                firstComponentRenderData.status ?
                                (
                                    /* Card First Component - Follow-up Final Status */
                                    <Text style={[style.secondaryText, {display: firstComponentRenderData.status ? 'flex' : 'none'}]}>
                                        {'\u2022 ' + getTranslation(translations.contactSingleScreen.followUpFinalStatus, translation) + ': '}
                                        <Text style={style.cardContentValueText}>
                                            {firstComponentRenderData.status}
                                        </Text>
                                    </Text>
                                ) : (null)
                            }
                            {
                                firstComponentRenderData.institutionName ?
                                    (
                                        /* Card First Component - Institution Name */
                                        <Text style={[style.secondaryText, {display: firstComponentRenderData.institutionName ? 'flex' : 'none'}]}>
                                            {'\u2022 ' + getTranslation(translations.usersScreen.institutionName, translation) + ': '}
                                            <Text style={style.cardContentValueText}>
                                                {firstComponentRenderData.institutionName}
                                            </Text>
                                        </Text>
                                    ) : (null)
                            }
                            {
                                firstComponentRenderData.telephoneNumbers ?
                                    (
                                        /* Card First Component - Phone Numbers */
                                        <View style={{flex: 1, flexDirection:'row'}}>
                                            <Text style={[style.secondaryText, {display: firstComponentRenderData.telephoneNumbers ? 'flex' : 'none'}]}>
                                                {'\u2022 ' + getTranslation(translations.usersScreen.primaryPhone, translation) + ": "}
                                            </Text>
                                            <Ripple onPress={() => {callPhone(translation)(firstComponentRenderData.telephoneNumbers)}}>
                                                <Text style={[style.cardContentPrimaryColorText, {display: firstComponentRenderData.telephoneNumbers ? 'flex' : 'none'}]}>
                                                    {firstComponentRenderData.telephoneNumbers}
                                                </Text>
                                            </Ripple>
                                        </View>
                                    ) : (null)
                            }
                            {
                                firstComponentRenderData.classification ?
                                    (
                                        /* Card First Component - Classification */
                                        <Text style={[style.secondaryText, {display: firstComponentRenderData.classification ? 'flex' : 'none'}]}>
                                            {'\u2022 ' + getTranslation(translations.caseSingleScreen.classification, translation) + ': '}
                                            <Text style={style.cardContentValueText}>
                                                {firstComponentRenderData.classification}
                                            </Text>
                                        </Text>
                                    ) : (null)
                            }
                            {
                                firstComponentRenderData.labName ?
                                    (
                                        /* Card First Component - Lab Name */
                                        <Text style={[style.secondaryText, {display: firstComponentRenderData.labName ? 'flex' : 'none'}]}>
                                            {'\u2022 ' + getTranslation(translations.labResultsScreen.labName, translation) + ': '}
                                            <Text style={style.cardContentValueText}>
                                                {getTranslation(firstComponentRenderData.labName, translation)}
                                            </Text>
                                        </Text>
                                    ) : (null)
                            }
                            {
                                firstComponentRenderData.dateSampleTaken ?
                                    (
                                        /* Card First Component - Date Sample Taken */
                                        <Text style={[style.secondaryText, {display: firstComponentRenderData.dateSampleTaken ? 'flex' : 'none'}]}>
                                            {'\u2022 ' + getTranslation(translations.labResultsScreen.sampleTaken, translation) + ': '}
                                            <Text style={style.cardContentValueText}>
                                                {firstComponentRenderData.dateSampleTaken}
                                            </Text>
                                        </Text>
                                    ) : (null)
                            }
                            {
                                firstComponentRenderData.dateOfResult ?
                                    (
                                        /* Card First Component - Date of Result */
                                        <Text style={[style.secondaryText, {display: firstComponentRenderData.dateOfResult ? 'flex' : 'none'}]}>
                                            {'\u2022 ' + getTranslation(translations.labResultsScreen.dateOfResult, translation) + ': '}
                                            <Text style={style.cardContentValueText}>
                                                {firstComponentRenderData.dateOfResult}
                                            </Text>
                                        </Text>
                                    ) : (null)
                            }
                            {
                                firstComponentRenderData.result ?
                                    (
                                        /* Card First Component - Result */
                                        <Text style={[style.secondaryText, {display: firstComponentRenderData.result ? 'flex' : 'none'}]}>
                                            {'\u2022 ' + getTranslation(translations.labResultsScreen.result, translation) + ': '}
                                            <Text style={style.cardContentValueText}>
                                                {firstComponentRenderData.result}
                                            </Text>
                                        </Text>
                                    ) : (null)
                            }
                            {
                                firstComponentRenderData.labResultStatus ?
                                    (
                                        /* Card First Component - Result Status */
                                        <Text style={[style.secondaryText, {display: firstComponentRenderData.labResultStatus ? 'flex' : 'none'}]}>
                                            {'\u2022 ' + getTranslation(translations.labResultsScreen.status, translation) + ': '}
                                            <Text style={style.cardContentValueText}>
                                                {firstComponentRenderData.labResultStatus}
                                            </Text>
                                        </Text>
                                    ) : (null)
                            }
                        </View>
                    </View>
                </View>
            </View>
        )
    }
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    cardContainer: {
        borderRadius: 4,
        flex: 1,
        overflow: 'hidden'
    },
    cardHeader: {
        alignItems: 'center',
        backgroundColor: styles.backgroundColorRgb,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    cardHeaderTitle: {
        flex: 1
    },
    primaryText: {
        color: styles.textColor,
        fontFamily: 'Roboto-Medium',
        fontSize: 16,
        lineHeight: 20,
        paddingVertical: 4,
        paddingHorizontal: 8
    },
    cardHeaderMap: {
        alignItems: 'center',
        backgroundColor: '#78a8a6',
        borderBottomLeftRadius: 4,
        height: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        width: 30
    },
    cardHeaderMapIcon: {
        height: 30,
        width: 30
    },
    cardContent: {
        padding: 16
    },
    cardContentGenderAgeContainer: {
        flexDirection: 'row'
    },
    cardContentGender: {
        color: styles.textColor,
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        marginRight: 16
    },
    cardContentAge: {
        color: styles.textColor,
        fontFamily: 'Roboto-Regular',
        fontSize: 14
    },
    secondaryText: {
        color: styles.secondaryColor,
        fontFamily: 'Roboto-Regular',
        fontSize: 14
    },
    cardContentPrimaryColorText: {
        color: styles.primaryColor,
        fontFamily: 'Roboto-Regular',
        fontSize: 14
    },
    cardContentValueText: {
        color: styles.textColor
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        translation: state.app.translation,
    };
}

export default connect(mapStateToProps)(PersonListItemNameAndAddressComponent);