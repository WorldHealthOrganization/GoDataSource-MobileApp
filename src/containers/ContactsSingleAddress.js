/**
 * Created by florinpopa on 21/08/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, { PureComponent } from 'react';
import {
    View,
    Text,
    StyleSheet,
    InteractionManager,
    Alert,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
    findNodeHandle
} from 'react-native';
import { LoaderScreen } from 'react-native-ui-lib';
import { calculateDimension, getTranslation, extractIdFromPouchId, createDate } from './../utils/functions';
import config from './../utils/config';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Button from './../components/Button';
import styles from './../styles';
import Ripple from 'react-native-material-ripple';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CardComponent from './../components/CardComponent';
import translations from './../utils/translations'
import ElevatedView from 'react-native-elevated-view';
import _ from 'lodash';
import moment from 'moment';
import TopContainerButtons from "./../components/TopContainerButtons";

class ContactsSingleAddress extends PureComponent {

    // This will be a container, so put as less business logic here as possible
    constructor(props) {
        super(props);
        this.state = {
            interactionComplete: false
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

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.activeIndex === 1) {
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
                <LoaderScreen overlay={true} backgroundColor={'white'} />
            )
        }

        // console.log('ContactsSingleContainer render Address');

        return (
            <TouchableWithoutFeedback onPress={() => {
                Keyboard.dismiss()
            }} accessible={false}>
                <View style={style.viewContainer}>
                    {/*<View style={{ flexDirection: 'row' }}>*/}
                        {/*<Button*/}
                            {/*title={getTranslation(translations.generalButtons.backButtonLabel, this.props.translation)}*/}
                            {/*onPress={this.handleBackButton}*/}
                            {/*color={styles.buttonGreen}*/}
                            {/*titleColor={'white'}*/}
                            {/*height={calculateDimension(25, true, this.props.screenSize)}*/}
                            {/*width={calculateDimension(130, false, this.props.screenSize)}*/}
                            {/*style={{*/}
                                {/*marginVertical: calculateDimension(12.5, true, this.props.screenSize),*/}
                                {/*marginHorizontal: calculateDimension(16, false, this.props.screenSize),*/}
                            {/*}} />*/}
                        {/*<Button*/}
                            {/*title={getTranslation(translations.generalButtons.nextButtonLabel, this.props.translation)}*/}
                            {/*onPress={this.handleNextButton}*/}
                            {/*color={styles.buttonGreen}*/}
                            {/*titleColor={'white'}*/}
                            {/*height={calculateDimension(25, true, this.props.screenSize)}*/}
                            {/*width={calculateDimension(130, false, this.props.screenSize)}*/}
                            {/*style={{*/}
                                {/*marginVertical: calculateDimension(12.5, true, this.props.screenSize),*/}
                                {/*marginHorizontal: calculateDimension(16, false, this.props.screenSize),*/}
                            {/*}} />*/}
                    {/*</View>*/}

                    <TopContainerButtons
                        isNew={this.props.isNew}
                        isEditMode={this.props.isEditMode}
                        index={this.props.activeIndex}
                        numberOfTabs={this.props.numberOfTabs}
                        onPressEdit={this.props.onPressEdit}
                        onPressSaveEdit={this.props.onPressSaveEdit}
                        onPressCancelEdit={this.props.onPressCancelEdit}
                        onPressNextButton={this.props.onPressNextButton}
                        onPressPreviousButton={this.handleBackButton}
                    />

                    {/* <KeyboardAwareScrollView
                        style={style.containerScrollView}
                        contentContainerStyle={[style.contentContainerStyle, { paddingBottom: this.props.screenSize.height < 600 ? 70 : 20 }]}
                        keyboardShouldPersistTaps={'always'}
                        extraHeight={20 + 81 + 50 + 70}
                        innerRef={ref => {
                            this.scrollContactsSingleAddress = ref
                        }}
                    > */}
                    <ScrollView
                        style={style.containerScrollView}
                        contentContainerStyle={[style.contentContainerStyle, { paddingBottom: this.props.screenSize.height < 600 ? 70 : 20 }]}
                    >
                    <View style={style.container}>
                        {
                            this.props.contact && this.props.contact.addresses && this.props.contact.addresses.map((item, index) => {
                                return this.handleRenderItem(item, index)
                            })
                        }
                    </View>
                    {
                        this.props.isEditMode !== null && this.props.isEditMode !== undefined && this.props.isEditMode === true ? (
                            <View style={{ alignSelf: 'flex-start', marginHorizontal: calculateDimension(16, false, this.props.screenSize), marginVertical: 20 }}>
                                <Ripple
                                    style={{
                                        height: 25,
                                        justifyContent: 'center'
                                    }}
                                    onPress={this.props.onPressAddAdrress}
                                >
                                    <Text style={{ fontFamily: 'Roboto-Medium', fontSize: 12, color: styles.buttonGreen }}>
                                        {this.props.contact.addresses && this.props.contact.addresses.length === 0 ? getTranslation(translations.contactSingleScreen.oneAddressText, this.props.translation) : getTranslation(translations.contactSingleScreen.moreAddressesText, this.props.translation)}
                                    </Text>
                                </Ripple>
                            </View>
                        ) : null
                    }
                    </ScrollView>
                    {/* </KeyboardAwareScrollView> */}
                </View>
            </TouchableWithoutFeedback >
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (item, index) => {
        let fields = config.contactsSingleScreen.address.fields.map((field) => {
            return Object.assign({}, field, { isEditMode: this.props.isEditMode })
        });
        return this.renderItemCardComponent(fields, index)
    };

    renderItemCardComponent = (fields, cardIndex = null) => {
        return (
            <ElevatedView elevation={3} style={[style.containerCardComponent, {
                marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                width: calculateDimension(config.designScreenSize.width - 32, false, this.props.screenSize),
                marginVertical: 4,
                minHeight: calculateDimension(72, true, this.props.screenSize)
            }, style.cardStyle]}>
                <ScrollView scrollEnabled={false} style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
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
            <View style={[style.subcontainerCardComponent, { flex: 1 }]} key={index}>
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
            item.data = this.computeDataForContactsSingleScreenDropdownInput(item, cardIndex);
        } else if (item.type === 'ActionsBar') {
            item.onPressArray = [this.props.onDeletePress];
            if (this.props.isNew) {
                item.textsArray = [item.textsArray[0], translations.addressFieldLabels.copyAddress];
                item.textsStyleArray = [item.textsStyleArray[0], {color: styles.buttonGreen}];
                item.onPressArray = [item.onPressArray[0], this.props.onPressCopyAddress];
            }
        }

        if (item.type === 'DropDownSectioned') {
            if (this.props.contact && this.props.contact.addresses && Array.isArray(this.props.contact.addresses) && this.props.contact.addresses[cardIndex] && this.props.contact.addresses[cardIndex][item.id] && this.props.contact.addresses[cardIndex][item.id] !== "") {
                for (let location of this.props.locations) {
                    let myLocationName = this.getLocationNameById(location, this.props.contact.addresses[cardIndex][item.id])
                    if (myLocationName !== null) {
                        value = myLocationName
                        break
                    }
                }
            }
        } else {
            value = this.computeValueForContactsSingleScreen(item, cardIndex);
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
                isEditModeForDropDownInput={this.props.isEditMode}
                contact={this.props.contact}
                value={value}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                index={cardIndex}

                onChangeText={this.props.onChangeText}
                onChangeDate={this.props.onChangeDate}
                onChangeSwitch={this.props.onChangeSwitch}
                onChangeDropDown={this.props.onChangeDropDown}
                onChangeTextSwitchSelector={this.props.onChangeTextSwitchSelector}
                onChangeSectionedDropDown={this.props.onChangeSectionedDropDown}
                onDeletePress={this.props.onDeletePress}
                anotherPlaceOfResidenceWasChosen={this.props.anotherPlaceOfResidenceWasChosen}
                onFocus={this.handleOnFocus}
                onBlur={this.handleOnBlur}
            />
        )
    };

    getLocationNameById = (element, locationId) => {
        if (extractIdFromPouchId(element._id, 'location') === locationId) {
            return element.name;
        } else {
            if (element.children && element.children.length > 0) {
                let i;
                let result = null;

                for (i = 0; result === null && i < element.children.length; i++) {
                    result = this.getLocationNameById(element.children[i], locationId);
                }
                return result;
            }
        }
        return null;
    };

    computeValueForContactsSingleScreen = (item, index) => {
        if (index !== null || index >= 0) {
            if (item.id === 'lng') {
                return this.props.contact && this.props.contact.addresses && Array.isArray(this.props.contact.addresses) &&
                    this.props.contact.addresses[index] && this.props.contact.addresses[index].geoLocation &&
                    this.props.contact.addresses[index].geoLocation.coordinates &&
                    Array.isArray(this.props.contact.addresses[index].geoLocation.coordinates) ?
                    getTranslation(this.props.contact.addresses[index].geoLocation.coordinates[0], this.props.translation) : '';
            } else {
                if (item.id === 'lat') {
                    return this.props.contact && this.props.contact.addresses && Array.isArray(this.props.contact.addresses) &&
                        this.props.contact.addresses[index] && this.props.contact.addresses[index].geoLocation &&
                        this.props.contact.addresses[index].geoLocation.coordinates &&
                        Array.isArray(this.props.contact.addresses[index].geoLocation.coordinates) ?
                        getTranslation(this.props.contact.addresses[index].geoLocation.coordinates[1], this.props.translation) : '';
                } else {
                    return this.props.contact && this.props.contact.addresses && Array.isArray(this.props.contact.addresses) ?
                        getTranslation(this.props.contact.addresses[index][item.id], this.props.translation) : '';
                }
            }
        }
        return this.props.contact && this.props.contact[item.id] ? getTranslation(this.props.contact[item.id], this.props.translation) : '';
    };

    setDateValidations = (item) => {
        let minimumDate = undefined;
        let maximumDate = undefined;

        if (item.type === 'DatePicker') {
            if (item.objectType === 'Address' && item.id === 'date') {
                maximumDate = createDate(null);
            }
        }

        let dateValidation = { minimumDate, maximumDate }
        return dateValidation
    };

    computeDataForContactsSingleScreenDropdownInput = (item, index) => {
        if (item.id === 'typeId') {
            return _.filter(this.props.referenceData, (o) => { return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_ADDRESS_TYPE' })
                .sort((a, b) => { return a.order - b.order; })
                .map((o) => { return { value: getTranslation(o.value, this.props.translation), id: o.value } })
        }
    };

    handleNextButton = () => {
        if (this.props.isNew) {
            let missingFields = this.props.checkRequiredFieldsAddresses();
            if (missingFields && Array.isArray(missingFields) && missingFields.length === 0) {

                if (this.props.contact.addresses.length === 0 || (this.props.contact.addresses.length > 0 && this.props.hasPlaceOfResidence === true)) {
                    this.props.handleMoveToNextScreenButton(true)
                } else {
                    Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), getTranslation(translations.alertMessages.addressOfResidenceError, this.props.translation), [
                        {
                            text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                            onPress: () => { console.log("OK pressed") }
                        }
                    ])
                }
            } else {
                Alert.alert(getTranslation(translations.alertMessages.alertLabel, this.props.translation), `${getTranslation(translations.alertMessages.addressRequiredFieldsMissing, this.props.translation)}.\n${getTranslation(translations.alertMessages.missingFields, this.props.translation)}: ${missingFields}`, [
                    {
                        text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                        onPress: () => { console.log("OK pressed") }
                    }
                ])
            }
        } else {
            this.props.handleMoveToNextScreenButton(true)
        }
    };

    handleBackButton = () => {
        this.props.onPressPreviousButton();
    };

    handleOnFocus = (event) => {
        // this.scrollToInput(findNodeHandle(event.target))
    };

    handleOnBlur = (event) => {
        // this.scrollContactsSingleAddress.props.scrollToPosition(0, 0, false)
        // this.scrollToInput(findNodeHandle(event.target))
    }

    scrollToInput(reactNode) {
        // Add a 'scroll' ref to your ScrollView
        // this.scrollContactsSingleAddress.props.scrollToFocusedInput(reactNode)
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
        marginBottom: 30
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        contacts: state.contacts,
        cases: state.cases,
        translation: state.app.translation,
        referenceData: state.referenceData,
        locations: _.get(state, `locations.locations`, [])
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(ContactsSingleAddress);
