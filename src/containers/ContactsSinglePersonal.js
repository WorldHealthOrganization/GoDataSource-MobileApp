/**
 * Created by florinpopa on 21/08/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {View, StyleSheet, InteractionManager, Alert, TouchableWithoutFeedback, Keyboard, ScrollView, findNodeHandle} from 'react-native';
import {calculateDimension, getTranslation} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import Button from './../components/Button';
import styles from './../styles';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import CardComponent from './../components/CardComponent';
import {LoaderScreen} from 'react-native-ui-lib';
import translations from './../utils/translations'
import ElevatedView from 'react-native-elevated-view';
import _ from 'lodash';

class ContactsSinglePersonal extends PureComponent {

    // This will be a container, so put as less business logic here as possible
    constructor(props) {
        super(props);
        this.state = {
            interactionComplete: false
        };
    }

    // Please add here the react lifecycle methods that you need
    componentWillMount() {
        InteractionManager.runAfterInteractions(() => {
            this.setState({
                interactionComplete: true
            })
        })
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.activeIndex === 0) {
            return true;
        }
        return false;
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        if (!this.state.interactionComplete) {
            return (
                <LoaderScreen overlay={true} backgroundColor={'white'}/>
            )
        }

        // console.log('ContactsSingleContainer render Personal');

        return (
            <View style={{flex: 1}}>
                <View style={style.viewContainer}>
                    <View style={{flexDirection: 'row'}}>
                        <Button
                            title={getTranslation(translations.generalButtons.nextButtonLabel, this.props.translation)}
                            onPress={this.handleNextButton}
                            color={styles.buttonGreen}
                            titleColor={'white'}
                            height={calculateDimension(25, true, this.props.screenSize)}
                            width={calculateDimension(130, false, this.props.screenSize)}
                            style={{
                                marginVertical: calculateDimension(12.5, true, this.props.screenSize),
                            }}/>
                    </View>

                    <KeyboardAwareScrollView
                        style={style.containerScrollView}
                        contentContainerStyle={[style.contentContainerStyle, {paddingBottom: this.props.screenSize.height < 600 ? 70 : 20}]}
                        keyboardShouldPersistTaps={'always'}
                        extraHeight={20 + 81 + 50 + 70}
                        innerRef={ref => {
                            this.scrollContactsSinglePersonal = ref
                        }} >
                        <View style={style.container}>
                            {
                                config.contactsSingleScreen.personal.map((item) => {
                                    return this.handleRenderItem(item)
                                })
                            }
                        </View>
                    </KeyboardAwareScrollView>
                </View>
            </View>
        );
    };

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (item) => {
        let fields = item.fields.map((field) => {
            return Object.assign({},field, {isEditMode: this.props.isEditMode})
        });
        return this.renderItemCardComponent(fields)
    };

    renderItemCardComponent = (fields, cardIndex = null) => {
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
    };

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
        let minimumDate = undefined;
        let maximumDate = undefined;

        if (item.type === 'DropdownInput') {
            item.data = this.computeDataForContactsSingleScreenDropdownInput(item);
        }

        if (item.type === 'DatePicker' && item.objectType !== 'Address') {
            value = this.props.contact[item.id]
        } else if (item.type === 'SwitchInput' && this.props.contact[item.id] !== undefined) {
            value = this.props.contact[item.id]
        } else {
            value = this.computeValueForContactsSingleScreen(item);
        }

        if (this.props.selectedItemIndexForTextSwitchSelectorForAge !== null && this.props.selectedItemIndexForTextSwitchSelectorForAge !== undefined && item.objectType === 'Contact' && item.dependsOn !== undefined && item.dependsOn !== null){
            let itemIndexInConfigTextSwitchSelectorValues = config[item.dependsOn].map((e) => {return e.value}).indexOf(item.id)
            if (itemIndexInConfigTextSwitchSelectorValues > -1) {
                if (itemIndexInConfigTextSwitchSelectorValues != this.props.selectedItemIndexForTextSwitchSelectorForAge) {
                    return
                }
            }
        }
      
        if (item.type === 'DatePicker' && value === '') {
            value = null
        }

        let dateValidation = this.setDateValidations(item);
        minimumDate = dateValidation.minimumDate;
        maximumDate = dateValidation.maximumDate;

        return (
            <CardComponent
                item={item}
                isEditMode={this.props.isEditMode}
                contact={this.props.contact}
                isEditModeForDropDownInput={this.props.isEditMode}
                selectedItemIndexForAgeUnitOfMeasureDropDown={this.props.selectedItemIndexForAgeUnitOfMeasureDropDown}
                onChangeextInputWithDropDown={this.props.onChangeextInputWithDropDown}
                value={value}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                
                onChangeText={this.props.onChangeText}
                onChangeDate={this.props.onChangeDate}
                onChangeSwitch={this.props.onChangeSwitch}
                onChangeDropDown={this.props.onChangeDropDown}
                onChangeTextSwitchSelector={this.props.onChangeTextSwitchSelector}

                onFocus={this.handleOnFocus}
            />
        )
    };

    setDateValidations = (item) => {
        let minimumDate = undefined;
        let maximumDate = undefined;

        if (item.type === 'DatePicker') {
            if (item.id === 'dob' || item.id === 'dateOfReporting') {
                maximumDate = new Date()
            }
        }
        
        let dateValidation = {minimumDate, maximumDate}
        return dateValidation
    }

    computeValueForContactsSingleScreen = (item) => {
        if (item.id === 'age') {
            if (this.props.contact && this.props.contact[item.id] !== null && this.props.contact[item.id] !== undefined) {
             return this.props.contact[item.id]
            }
        } else {
            return this.props.contact && this.props.contact[item.id] ? getTranslation(this.props.contact[item.id], this.props.translation) : '';
        }
    };

    computeDataForContactsSingleScreenDropdownInput = (item) => {
        if (item.id === 'riskLevel') {
            return _.filter(this.props.referenceData, (o) => {return o.active === true && o.categoryId.includes("RISK_LEVEL")})
                    .sort((a,b) => { return a.order - b.order; })
                    .map((o) => {return {value: getTranslation(o.value, this.props.translation), id: o.value}})
        }
        if (item.id === 'gender') {
            return _.filter(this.props.referenceData, (o) => {return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_GENDER'})
                    .sort((a,b) => { return a.order - b.order; })
                    .map((o) => {return {value: getTranslation(o.value, this.props.translation), id: o.value}})
        }
        if (item.id === 'occupation') {
            return _.filter(this.props.referenceData, (o) => {return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_OCCUPATION'})
                    .sort((a,b) => { return a.order - b.order; })
                    .map((o) => {return {value: getTranslation(o.value, this.props.translation), id: o.value}})
        }
    };

    handleNextButton = () => {
        if (this.props.isNew) {
            let missingFields = this.props.checkRequiredFieldsPersonalInfo();
            if (missingFields && Array.isArray(missingFields) && missingFields.length === 0) {
                if (this.props.checkAgeYearsRequirements()) {
                    if (this.props.checkAgeMonthsRequirements()){
                        this.props.handleMoveToNextScreenButton()
                    } else {
                        Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), getTranslation(translations.alertMessages.monthsValueError, this.props.translation), [
                            {
                                text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation), 
                                onPress: () => {console.log("OK pressed")}
                            }
                        ])
                    }
                } else {
                    Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), getTranslation(translations.alertMessages.yearsValueError, this.props.translation), [
                        {
                            text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation), 
                            onPress: () => {console.log("OK pressed")}
                        }
                    ])
                }
            } else {
                Alert.alert(getTranslation(translations.alertMessages.validationErrorLabel, this.props.translation), `${getTranslation(translations.alertMessages.requiredFieldsMissingError, this.props.translation)}.\n${getTranslation(translations.alertMessages.missingFields, this.props.translation)}: ${missingFields}`, [
                    {
                        text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation), 
                        onPress: () => {console.log("OK pressed")}
                    }
                ])
            }
        } else {
            this.props.handleMoveToNextScreenButton()
        }
    };

    handleOnFocus = (event) => {
        this.scrollToInput(findNodeHandle(event.target))
    };

    scrollToInput (reactNode) {
        // Add a 'scroll' ref to your ScrollView
        this.scrollContactsSinglePersonal.props.scrollToFocusedInput(reactNode)
    };
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
    viewContainer: {
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
    container: {
        flex: 1,
        marginBottom: 10
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        contacts: state.contacts,
        cases: state.cases,
        translation: state.app.translation,
        referenceData: state.referenceData,
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(ContactsSinglePersonal);
