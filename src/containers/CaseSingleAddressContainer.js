/**
 * Created by mobileclarisoft on 10/09/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {TextInput, View, Text, StyleSheet, FlatList, InteractionManager, ScrollView, Alert, TouchableWithoutFeedback, Keyboard} from 'react-native';
import {LoaderScreen} from 'react-native-ui-lib';
import {calculateDimension, getTranslation, extractIdFromPouchId} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import styles from './../styles';
import CardComponent from './../components/CardComponent';
import Button from './../components/Button';
import Ripple from 'react-native-material-ripple';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import translations from './../utils/translations'
import ElevatedView from 'react-native-elevated-view';
import _ from 'lodash';

class CaseSingleAddressContainer extends PureComponent {

    // This will be a container, so put as less business logic here as possible
    constructor(props) {
        super(props);
        this.state = {
            interactionComplete: false,
        };
    }

    // Please add here the react lifecycle methods that you need
    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this.setState({
                interactionComplete: true
            })
        })
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        if(!this.state.interactionComplete) {
            return (
                <LoaderScreen overlay={true} backgroundColor={'white'}/>
            )
        }

        return (
            <TouchableWithoutFeedback onPress={() => {
                Keyboard.dismiss()
            }} accessible={false}>
                <View style={style.container}>
                    <View style={{flexDirection: 'row'}}>
                        {
                            this.props.isNew ? (
                                <View style={{flexDirection: 'row'}}>
                                    <Button
                                        title={getTranslation(translations.generalButtons.backButtonLabel, this.props.translation)}
                                        onPress={this.handleBackButton}
                                        color={styles.buttonGreen}
                                        titleColor={'white'}
                                        height={calculateDimension(25, true, this.props.screenSize)}
                                        width={calculateDimension(130, false, this.props.screenSize)}
                                        style={{
                                            marginVertical: calculateDimension(12.5, true, this.props.screenSize),
                                            marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                                        }}/>
                                    <Button
                                        title={getTranslation(translations.generalButtons.nextButtonLabel, this.props.translation)}
                                        onPress={this.handleNextButton}
                                        color={styles.buttonGreen}
                                        titleColor={'white'}
                                        height={calculateDimension(25, true, this.props.screenSize)}
                                        width={calculateDimension(130, false, this.props.screenSize)}
                                        style={{
                                            marginVertical: calculateDimension(12.5, true, this.props.screenSize),
                                            marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                                        }}/>
                                </View>) : (
                                this.props.isEditMode ? (
                                    <View style={{flexDirection: 'row'}}>
                                        <Button
                                            title={getTranslation(translations.generalButtons.saveButtonLabel, this.props.translation)}
                                            onPress={this.props.onPressSaveEdit}
                                            color={styles.buttonGreen}
                                            titleColor={'white'}
                                            height={calculateDimension(25, true, this.props.screenSize)}
                                            width={calculateDimension(166, false, this.props.screenSize)}
                                            style={{
                                                marginVertical: calculateDimension(12.5, true, this.props.screenSize),
                                                marginRight: 10,
                                        }}/>
                                        <Button
                                            title={getTranslation(translations.generalButtons.cancelButtonLabel, this.props.translation)}
                                            onPress={this.props.onPressCancelEdit}
                                            color={styles.buttonGreen}
                                            titleColor={'white'}
                                            height={calculateDimension(25, true, this.props.screenSize)}
                                            width={calculateDimension(166, false, this.props.screenSize)}
                                            style={{
                                                marginVertical: calculateDimension(12.5, true, this.props.screenSize),
                                                marginRight: 10,
                                        }}/>
                                    </View>) : (
                                        this.props.role.find((e) => e === config.userPermissions.writeCase) !== undefined ? (
                                            <Button
                                                title={getTranslation(translations.generalButtons.editButtonLabel, this.props.translation)}
                                                onPress={this.props.onPressEdit}
                                                color={styles.buttonGreen}
                                                titleColor={'white'}
                                                height={calculateDimension(25, true, this.props.screenSize)}
                                                width={calculateDimension(166, false, this.props.screenSize)}
                                                style={{
                                                    marginVertical: calculateDimension(12.5, true, this.props.screenSize),
                                                    marginRight: 10,
                                                }}/>
                                        ) : null
                                    ))
                        }
                    </View>
                    <KeyboardAwareScrollView
                        style={style.containerScrollView}
                        contentContainerStyle={[style.contentContainerStyle, {paddingBottom: this.props.screenSize.height < 600 ? 70 : 20}]}
                        keyboardShouldPersistTaps={'always'}
                    >
                         <View style={style.container}>
                            {
                                this.props.case && this.props.case.addresses && this.props.case.addresses.map((item, index) => {
                                    return this.handleRenderItem(item, index)
                                })
                            }
                        </View>
                        {
                            this.props.isEditMode ? (
                                <View style={{alignSelf: 'flex-start', marginHorizontal: calculateDimension(16, false, this.props.screenSize), marginVertical: 20}}>
                                    <Ripple
                                        style={{
                                            height: 25,
                                            justifyContent: 'center'
                                        }}
                                        onPress={this.props.onPressAddAddress}
                                    >
                                        <Text style={{fontFamily: 'Roboto-Medium', fontSize: 12, color: styles.buttonGreen}}>
                                            {this.props.case.addresses && this.props.case.addresses.length === 0 ? getTranslation(translations.caseSingleScreen.oneAddressText, this.props.translation) : getTranslation(translations.caseSingleScreen.moreAddressesText, this.props.translation)}
                                        </Text>
                                    </Ripple>
                                </View>
                            ) : null
                        }
                    </KeyboardAwareScrollView>
                </View>
            </TouchableWithoutFeedback>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (item, index) => {
        let fields = config.caseSingleScreen.address.fields.map((field) => {
            return Object.assign({},field, {isEditMode: this.props.isEditMode})
        });
        return this.rederItemCardComponent(fields, index)
    }

    rederItemCardComponent = (fields, cardIndex = null) => {
        return (
            <ElevatedView elevation={3} style={[style.containerCardComponent, {
                marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                width: calculateDimension(config.designScreenSize.width - 32, false, this.props.screenSize),
                marginVertical: 4,
                minHeight: calculateDimension(72, true, this.props.screenSize)
            }, style.cardStyle]}>
                <ScrollView scrollEnabled={false} style={{flex: 1}} contentContainerStyle={{flexGrow: 1}}>
                    {
                        fields && fields.map((item, index) => {
                            return this.handleRenderItemCardComponent(item, index, cardIndex);
                        })
                    }
                </ScrollView>
            </ElevatedView>
        );
    }

    handleRenderItemCardComponent = (item, index, cardIndex) => {
        return (
            <View style={[style.subcontainerCardComponent, {flex: 1}]} key={index}>
                {
                    this.handleRenderItemByType(item, cardIndex)
                }
            </View>
        )
    };

    handleRenderItemByType = (item, cardIndex) => {
        let value = '';
        let isEditModeForDropDownInput = true
        let minimumDate = undefined;
        let maximumDate = undefined;

        if (item.type === 'DropdownInput') {
            item.data = this.computeDataForCasesSingleScreenDropdownInput(item, cardIndex);
        } else if (item.type === 'ActionsBar') {
            item.onPressArray = [this.props.onDeletePress]
        }

        if (item.type === 'DropDownSectioned') {
            if (this.props.case && this.props.case.addresses && Array.isArray(this.props.case.addresses) && this.props.case.addresses[cardIndex] && this.props.case.addresses[cardIndex][item.id] && this.props.case.addresses[cardIndex][item.id] !== "") {
                for (let i = 0; i < this.props.locations.length; i++) {
                    let myLocationName = this.getLocationNameById(this.props.locations[i], this.props.case.addresses[cardIndex][item.id])
                    if (myLocationName !== null){
                        value = myLocationName
                        break
                    }
                }
            }
        } else {
            value = this.computeValueForCasesSingleScreen(item, cardIndex);
        }
       
        if (item.type === 'DatePicker' && value === '') {
            value = null
        }
        isEditModeForDropDownInput = this.props.isEditMode

        let dateValidation = this.setDateValidations(item);
        minimumDate = dateValidation.minimumDate;
        maximumDate = dateValidation.maximumDate;

        return (
            <CardComponent
                item={item}
                isEditMode={this.props.isEditMode}
                case={this.props.case}
                selectedItemIndexForAgeUnitOfMeasureDropDown={this.props.selectedItemIndexForAgeUnitOfMeasureDropDown}
                onChangeextInputWithDropDown={this.props.onChangeextInputWithDropDown}
                value={value}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                isEditModeForDropDownInput={isEditModeForDropDownInput}
                index={cardIndex}
                style={style.cardStyle}

                onChangeText={this.props.onChangeText}
                onChangeDate={this.props.onChangeDate}
                onChangeSwitch={this.props.onChangeSwitch}
                onChangeDropDown={this.props.onChangeDropDown}
                onChangeTextSwitchSelector={this.props.onChangeTextSwitchSelector}
                onChangeSectionedDropDown={this.props.onChangeSectionedDropDown}
                onDeletePress={this.props.onDeletePress}
            />
        )
    };

    getLocationNameById = (element, locationId) => {
        if(extractIdFromPouchId(element._id, 'location') === locationId) {
            return element.name;
        } else {
            if (element.children && element.children.length > 0) {
                let i;
                let result = null;

                for(i=0; result === null && i < element.children.length; i++){
                    result = this.getLocationNameById(element.children[i], locationId);
                }
                return result;
            }
        }
        return null;
    };

    setDateValidations = (item) => {
        let minimumDate = undefined;
        let maximumDate = undefined;

        if (item.type === 'DatePicker') {
            if (item.objectType === 'Address' && item.id === 'date') {
                maximumDate = new Date()
            }
        }
        
        let dateValidation = {minimumDate, maximumDate}
        return dateValidation
    };

    computeDataForCasesSingleScreenDropdownInput = (item) => {
        if (item.id === 'riskLevel') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId.includes("RISK_LEVEL")
            }).map((o) => {return {value: getTranslation(o.value, this.props.translation), id: o.value}})
        }
        if (item.id === 'gender') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_GENDER'
            }).map((o) => {return {label: getTranslation(o.value, this.props.translation), value: o.value}})
        }
        if (item.id === 'typeId') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_ADDRESS_TYPE'
            }).map((o) => {return {value: getTranslation(o.value, this.props.translation), id: o.value}})
        }
        if (item.id === 'classification') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_CASE_CLASSIFICATION'
            }).map((o) => {return {label: getTranslation(o.value, this.props.translation), value: o.value}})
        }
        if (item.id === 'outcomeId') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_OUTCOME'
            }).map((o) => {return {label: getTranslation(o.value, this.props.translation), value: o.value}})
        }
        if (item.id === 'type') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_DOCUMENT_TYPE'
            }).map((o) => {return {label: getTranslation(o.value, this.props.translation), value: o.value}})
        }
        if (item.id === 'occupation') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_OCCUPATION'
            }).map((o) => {return {value: getTranslation(o.value, this.props.translation), id: o.value}})
        }
    };

    computeValueForCasesSingleScreen = (item, index) => {
        if (index !== null || index >= 0) {
            if (item.objectType === 'Address') {
                if (item.id === 'lng') {
                    return this.props.case && this.props.case.addresses && Array.isArray(this.props.case.addresses) &&
                    this.props.case.addresses[index] && this.props.case.addresses[index].geoLocation &&
                    this.props.case.addresses[index].geoLocation.coordinates &&
                    Array.isArray(this.props.case.addresses[index].geoLocation.coordinates) ?
                        getTranslation(this.props.case.addresses[index].geoLocation.coordinates[0], this.props.translation) : '';
                } else {
                    if (item.id === 'lat') {
                        return this.props.case && this.props.case.addresses && Array.isArray(this.props.case.addresses) &&
                        this.props.case.addresses[index] && this.props.case.addresses[index].geoLocation &&
                        this.props.case.addresses[index].geoLocation.coordinates &&
                        Array.isArray(this.props.case.addresses[index].geoLocation.coordinates) ?
                            getTranslation(this.props.case.addresses[index].geoLocation.coordinates[1], this.props.translation) : '';
                    } else {
                        return this.props.case && this.props.case.addresses && Array.isArray(this.props.case.addresses) && this.props.case.addresses[index][item.id] ?
                            getTranslation(this.props.case.addresses[index][item.id], this.props.translation) : '';
                    }
                }
            }
        }
        return this.props.case && this.props.case[item.id] ? getTranslation(this.props.case[item.id], this.props.translation) : '';
    };

    handleNextButton = () => {
        if (this.props.checkRequiredFieldsAddresses()) {
            if (this.props.hasPlaceOfResidence) {
                this.props.handleMoveToNextScreenButton(true)
            } else {
                Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.addressOfResidenceError, this.props.translation), [
                    {
                        text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation), 
                        onPress: () => {console.log("OK pressed")}
                    }
                ])
            }
        } else {
            Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.addressRequiredFieldsMissing, this.props.translation), [
                {
                    text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation), 
                    onPress: () => {console.log("OK pressed")}
                }
            ])
        }
    }

    handleBackButton = () => {
        this.props.handleMoveToPrevieousScreenButton()
    }
}


// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    containerCardComponent: {
        backgroundColor: 'white',
        borderRadius: 2
    },
    subcontainerCardComponent: {
        alignItems: 'center',
        flex: 1
    },
    container: {
        flex: 1,
        backgroundColor: styles.screenBackgroundGrey,
        alignItems: 'center',
    },
    cardStyle: {
        marginVertical: 4,
        flex: 1
    },
    containerScrollView: {
        flex: 1,
        backgroundColor: styles.screenBackgroundGrey
    },
    contentContainerStyle: {
        alignItems: 'center'
    },
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        role: state.role,
        translation: state.app.translation,
        referenceData: state.referenceData,
        locations: state.locations,
    };

}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(CaseSingleAddressContainer);
