/**
 * Created by florinpopa on 23/08/2018.
 */
/**
 * Created by florinpopa on 03/08/2018.
 */
import React, {PureComponent} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import PropTypes from 'prop-types';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import styles from './../styles';
import translations from './../utils/translations'
import {getTranslation, calculateDimension} from './../utils/functions';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import GeneralListItem from './GeneralListItem';
import Ripple from 'react-native-material-ripple';
import {extractIdFromPouchId, getAddress, handleExposedTo} from "../utils/functions";
import config from "../utils/config";


class PersonListItemNameAndAddressComponent extends PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        // console.log(`Render PersonListItem subComponent 1 ${this.props.firstComponentRenderData.fullName}`);
        let {firstComponentRenderData, translation, titleColor} = this.props;
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
                        <Text style={[style.secondaryText, {
                            flex: 1,
                            marginHorizontal: 7,
                            display: firstComponentRenderData.addressString ? 'flex' : 'none'
                        }]}>{'\u2022 ' + getTranslation(translations.addressFieldLabels.address, translation) + ": " + firstComponentRenderData.addressString}</Text>
                    </View>
                    <Ripple key={'secondView'} style={{width: 35, height: 35}} onPress={this.props.onPressMapIcon}>
                        <Image source={{uri: 'map_icon'}} style={{width: 35, height: 35}}/>
                    </Ripple>
                </View>
                {
                    this.props.type !== 'Case' ? (
                        <View key={'thirdView'} style={styles.lineStyle} />
                    ) : (null)
                }
            </View>
        )
    }


    // onPressMapIcon = () => {
    //     let {type, itemToRender} = this.
    //     InteractionManager.runAfterInteractions(() => {
    //         let person = type === 'Contact' || type === 'Case' ? itemToRender : this.props.contacts && Array.isArray(this.props.contacts) && this.props.contacts.length > 0 ?  this.props.contacts.find((e) => {return extractIdFromPouchId(e._id, 'person') === itemToRender.personId}) : null;
    //
    //             this.props.onPressMapIcon(person)
    //
    //     })
    // };
    //
    // handleOnPressName = (type, personId) => {
    //     InteractionManager.runAfterInteractions(() => {
    //         this.props.onPressNameProp(type, personId);
    //     })
    // };
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