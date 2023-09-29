/**
 * Created by mobileclarisoft on 10/09/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React from 'react';
import {Alert, InteractionManager, ScrollView, StyleSheet, Text, View,} from 'react-native';
import {LoaderScreen} from 'react-native-ui-lib';
import {calculateDimension, createDate, extractIdFromPouchId, getTranslation} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import constants from './../utils/constants';
import CardComponent from './../components/CardComponent';
import Ripple from 'react-native-material-ripple';
import translations from './../utils/translations'
import ElevatedView from 'react-native-elevated-view';
import _ from 'lodash';
import TopContainerButtons from "../components/TopContainerButtons";
import PermissionComponent from './../components/PermissionComponent';
import {validateRequiredFields, checkValidEmails} from './../utils/formValidators';
import {checkArray, checkArrayAndLength} from "../utils/typeCheckingFunctions";
import styles from './../styles';
import get from "lodash/get";

class EventSingleAddressContainer extends React.Component {

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

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.isEditMode !== this.props.isEditMode || nextProps.routeKey === 'address') {
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
                <LoaderScreen
                    overlay={true}
                    loaderColor={styles.primaryColor}
                    backgroundColor={'rgba(255, 255, 255, 0.8)'} />
            )
        }
        return (
            <View style={{ flex: 1 }}>
                <View style={style.container}>

                    <PermissionComponent
                        render={() => (
                            <TopContainerButtons
                                isNew={this.props.isNew}
                                isEditMode={this.props.isEditMode}
                                index={this.props.index}
                                numberOfTabs={this.props.numberOfTabs}
                                onPressEdit={this.props.onPressEdit}
                                onPressSaveEdit={this.props.isNew ? this.props.onPressSave : this.props.onPressSaveEdit}
                                onPressCancelEdit={this.props.onPressCancelEdit}
                                onPressNextButton={this.handleNextButton}
                                onPressPreviousButton={this.handleBackButton}
                            />
                        )}
                        permissionsList={[
                            constants.PERMISSIONS_EVENT.eventAll,
                            constants.PERMISSIONS_EVENT.eventCreate,
                            constants.PERMISSIONS_EVENT.eventModify
                        ]}
                    />

                    <ScrollView
                        style={style.containerScrollView}
                        contentContainerStyle={[style.contentContainerStyle, { paddingBottom: this.props.screenSize.height < 600 ? 70 : 20 }]}
                    >
                        <View style={style.container}>
                            {
                                this.handleRenderItem(0)
                            }
                        </View>
                    </ScrollView>
                </View>
            </View >
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (index) => {
        if(this.props.preparedFields.address.invisible){
            return null;
        }
        let fields = this.props.preparedFields.address.fields.map((field) => {
            return Object.assign({}, field, { isEditMode: this.props.isEditMode })
        });
        return this.renderItemCardComponent(fields, index)
    };

    renderItemCardComponent = (fields, cardIndex = null) => {
        return (
            <ElevatedView elevation={5} key={cardIndex} style={[style.containerCardComponent, {
                marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                width: calculateDimension(config.designScreenSize.width - 32, false, this.props.screenSize),
                marginVertical: 6,
                minHeight: calculateDimension(72, true, this.props.screenSize)
            }, style.cardStyle]}>
                <ScrollView scrollEnabled={false} style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
                    {
                        fields && fields.map((item, index) => {
                            if(item.invisible){
                                return null;
                            }
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
            item.data = this.computeDataForEventsSingleScreenDropdownInput(item, cardIndex);
        } else if (item.type === 'ActionsBar') {
            item.onPressArray = [this.props.onDeletePress]
        }

        if (item.type === 'DropDownSectioned') {
            if (this.props.event && this.props.event.address  && this.props.event.address[item.id] && this.props.event.address[item.id] !== "") {
                for (let i = 0; i < this.props.locations.length; i++) {
                    let myLocationName = this.getLocationNameById(this.props.locations[i], this.props.event.address[item.id]);
                    if (myLocationName !== null) {
                        value = myLocationName;
                        break
                    }
                }
            }
        } else {
            value = this.computeValueForEventsSingleScreen(item, cardIndex);
        }

        if (item.type === 'DatePicker' && value === '') {
            value = null
        }

        if (item.type === 'SwitchInput' && item.id === 'geoLocationAccurate') {
            if (this.props.event && this.props.event.address &&  (this.props.event.address[item.id] === true || this.props.event.address[item.id] === false)) {
                value = this.props.event.address[item.id];
            }
        }

        let dateValidation = this.setDateValidations(item);
        minimumDate = dateValidation.minimumDate;
        maximumDate = dateValidation.maximumDate;

        return (
            <CardComponent
                item={item}
                isEditMode={this.props.isEditMode}
                isEditModeForDropDownInput={this.props.isEditMode}
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
                onFocus={this.handleOnFocus}
                onBlur={this.handleOnBlur}
                permissionsList={item.permissionsList}
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

    setDateValidations = (item) => {
        let minimumDate = undefined;
        let maximumDate = undefined;

        if (item.type === 'DatePicker') {
            if (item.objectType === 'Address' && item.id === 'date') {
                maximumDate = createDate(null);
            }
        }

        let dateValidation = { minimumDate, maximumDate };
        return dateValidation
    };

    computeDataForEventsSingleScreenDropdownInput = (item) => {
        if (item.categoryId) {
            return _.filter(this.props.referenceData, (o) => {
                return (o.active === true && o.categoryId === item.categoryId) && (
                    o.isSystemWide ||
                    !this.props.outbreak?.allowedRefDataItems ||
                    !this.props.outbreak.allowedRefDataItems[o.categoryId] ||
                    this.props.outbreak.allowedRefDataItems[o.categoryId][o.value]
                );
            })
                .sort((a, b) => { return a.order - b.order; })
                .map((o) => { return { value: getTranslation(o.value, this.props.translation), id: o.value } })
        }
    };

    computeValueForEventsSingleScreen = (item, index) => {
        if (index !== null || index >= 0) {
            if (item.objectType === 'Address') {
                if (item.id === 'lng') {
                    return getTranslation(_.get(this.props, `event.address.geoLocation.coordinates[0]`, ''), this.props.translation);
                } else {
                    if (item.id === 'lat') {
                        return getTranslation(_.get(this.props, `event.address.geoLocation.coordinates[1]`, ''), this.props.translation);
                    } else {
                        return getTranslation(_.get(this.props, `event.address[${item.id}]`, ''), this.props.translation);
                    }
                }
            }
        }
        return getTranslation(_.get(this.props, `event[${item.id}]`), this.props.translation);
    };

    handleNextButton = () => {
        let invalidEmails = validateRequiredFields(
            _.get(this.props, 'event.address', {}),
            config?.addressFields?.fields,
            (dataToBeValidated, fields, defaultFunction) => {
                if (fields.id === 'emailAddress') {
                    return checkValidEmails(dataToBeValidated, fields?.id);
                }
                return null;
            }
        );
        let missingFields = this.props.checkRequiredFieldsAddress();
        let checkPlaceOfResidence = validateRequiredFields(
            this.props?.event?.address,
            this.props.preparedFields.address.fields,
            (dataToBeValidated, fields, defaultFunction) => {
                if (fields.id === 'typeId') {
                    if (!Array.isArray(dataToBeValidated)){
                        return dataToBeValidated.typeId === translations.userResidenceAddress.userPlaceOfResidence;
                    }
                    return (checkArray(dataToBeValidated) && dataToBeValidated.length === 0) ||
                        (checkArrayAndLength(dataToBeValidated) && dataToBeValidated.find((e) => {
                            return e.typeId === translations.userResidenceAddress.userPlaceOfResidence
                        }));
                }
                return null;
            },
            true);
        let message = null;
        if (checkArrayAndLength(missingFields)) {
            message = `${getTranslation(translations.alertMessages.addressRequiredFieldsMissing, this.props.translation)}.\n${getTranslation(translations.alertMessages.missingFields, this.props.translation)}: ${missingFields}`;
        } else if (checkArrayAndLength(invalidEmails)) {
            message = `${getTranslation(translations.alertMessages.invalidEmails, this.props.translation)}: ${invalidEmails}`;
        } else if (!checkArrayAndLength(checkPlaceOfResidence)) {
            message = getTranslation(translations.alertMessages.addressOfResidenceError, this.props.translation);
        }

        if (message) {
            Alert.alert(
                getTranslation(translations.alertMessages.alertLabel, this.props.translation),
                message,
                [
                    {
                        text: getTranslation(translations.alertMessages.okButtonLabel, this.props.translation),
                        onPress: () => { console.log("OK pressed") }
                    }
                ])
        } else {
            this.props.onPressNextButton(true);
        }
    };

    handleBackButton = () => {
        this.props.handleMoveToPrevieousScreenButton()
    };

    handleOnFocus = (event) => {
        // this.scrollToInput(findNodeHandle(event.target))
    };

    handleOnBlur = (event) => {
        // this.scrollEventsSingleAddress.props.scrollToPosition(0, 0, false)
        // this.scrollToInput(findNodeHandle(event.target))
    };

    scrollToInput(reactNode) {
        // Add a 'scroll' ref to your ScrollView
        // this.scrollEventsSingleAddress.props.scrollToFocusedInput(reactNode)
    };
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    containerCardComponent: {
        backgroundColor: styles.backgroundColor,
        borderRadius: 4,
        paddingBottom: 8
    },
    subcontainerCardComponent: {
        alignItems: 'center',
        flex: 1
    },
    container: {
        alignItems: 'center',
        backgroundColor: styles.screenBackgroundColor,
        flex: 1
    },
    cardStyle: {
        flex: 1,
        marginVertical: 6
    },
    containerScrollView: {
        backgroundColor: styles.screenBackgroundColor,
        flex: 1
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
        outbreak: _.get(state, 'outbreak', null),
        locations: _.get(state, `locations.locations`, []),
    };

}

export default connect(mapStateToProps)(EventSingleAddressContainer);
