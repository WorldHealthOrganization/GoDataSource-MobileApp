/**
 * Created by florinpopa on 21/08/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {InteractionManager, ScrollView, StyleSheet, Text, View} from 'react-native';
import {calculateDimension, createDate, extractIdFromPouchId, getTranslation} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import CardComponent from './../components/CardComponent';
import {LoaderScreen} from 'react-native-ui-lib';
import translations from './../utils/translations'
import ElevatedView from 'react-native-elevated-view';
import _ from 'lodash';
import lodashGet from "lodash/get";
import {checkArray, checkArrayAndLength} from "../utils/typeCheckingFunctions";
import TopContainerButtons from "./../components/TopContainerButtons";
import PermissionComponent from './../components/PermissionComponent';
import constants, {PERMISSIONS_CONTACT_OF_CONTACT, PERMISSION_CREATE_CONTACT, PERMISSION_CREATE_CONTACT_OF_CONTACT, PERMISSION_EDIT_CONTACT, PERMISSION_EDIT_CONTACT_OF_CONTACT} from "./../utils/constants";
import {getTeamsForUserRequest} from './../queries/user';
import Button from './../components/Button';
import styles from './../styles';

class ContactsSinglePersonal extends Component {

    // This will be a container, so put as less business logic here as possible
    constructor(props) {
        super(props);
        this.state = {
            interactionComplete: false,
            teams: []
        };
    }

    // Please add here the react lifecycle methods that you need
    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            getTeamsForUserRequest((errorGetTeams, teams) => {
                this.setState({
                    interactionComplete: true,
                    teams: checkArrayAndLength(teams) ? teams.map((e) => Object.assign({}, e, {teamId: extractIdFromPouchId(e._id, 'team')})) : []
                })
            });
        })
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.routeKey === 'personal') {
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

        let permissionsList = [];
        if (this.props.isNew) {
            permissionsList = this.props.type === translations.personTypes.contactsOfContacts ? PERMISSION_CREATE_CONTACT_OF_CONTACT : PERMISSION_CREATE_CONTACT;
        } else {
            permissionsList = this.props.type === translations.personTypes.contactsOfContacts ? PERMISSION_EDIT_CONTACT_OF_CONTACT : PERMISSION_EDIT_CONTACT;
        }

        return (
            <View style={{flex: 1}}>
                <View style={style.viewContainer}>
                    <PermissionComponent
                        render={() => (
                            <TopContainerButtons
                                isNew={this.props.isNew}
                                isEditMode={this.props.isEditMode}
                                index={this.props.activeIndex}
                                numberOfTabs={this.props.numberOfTabs}
                                onPressEdit={this.props.onPressEdit}
                                onPressSaveEdit={this.props.onPressSaveEdit}
                                onPressCancelEdit={this.props.onPressCancelEdit}
                                onPressNextButton={this.props.onPressNextButton}
                            />
                        )}
                        permissionsList={permissionsList}
                    />

                    <ScrollView
                        style={style.containerScrollView}
                        contentContainerStyle={[style.contentContainerStyle, { paddingBottom: this.props.screenSize.height < 600 ? 70 : 16 }]}
                    >
                        <View style={style.container}>
                            {
                                this.props.preparedFields.personal.map((item, i) => {
                                    if(item.invisible) {
                                        return null;
                                    }
                                    return this.handleRenderItem(item, i)
                                })
                            }

                            {
                                this.props.preparedFields?.vaccinesReceived?.invisible ?
                                    null
                                    :
                                    <>
                                        <View style={style.container}>
                                            {
                                                checkArrayAndLength(_.get(this.props, 'contact.vaccinesReceived', [])) && _.get(this.props, 'contact.vaccinesReceived', []).map((item, index) => {
                                                    return this.handleRenderItemForVaccinesList(item, index)
                                                })
                                            }
                                        </View>
                                        {
                                            this.props.isEditMode ? (
                                                <View style={{alignSelf: 'flex-start', marginHorizontal: calculateDimension(16, false, this.props.screenSize)}}>
                                                    <Button
                                                        title={!_.get(this.props, 'contact.vaccinesReceived', null) || checkArray(this.props.contact.vaccinesReceived) && this.props.contact.vaccinesReceived.length === 0 ? getTranslation('Add vaccine', this.props.translation) : getTranslation('Add another vaccine', this.props.translation)}
                                                        onPress={this.props.onPressAddVaccine}
                                                        color={styles.backgroundColor}
                                                        titleColor={styles.textColor}
                                                        height={calculateDimension(35, true, this.props.screenSize)}
                                                        width={'100%'}
                                                        style={{marginVertical: calculateDimension(8, true, this.props.screenSize)}}
                                                    />
                                                </View>) : null
                                        }
                                    </>
                            }
                            {
                                this.props.preparedFields?.document?.invisible ?
                                    null
                                    :
                                    <>
                                        <View style={style.container}>
                                            {
                                                checkArray(_.get(this.props, 'contact.documents', [])) && _.get(this.props, 'contact.documents', []).map((item, index) => {
                                                    return this.handleRenderItemForDocumentsList(item, index)
                                                })
                                            }
                                        </View>
                                        {
                                            this.props.isEditMode ? (
                                                <View style={{ alignSelf: 'flex-start', marginHorizontal: calculateDimension(16, false, this.props.screenSize)}}>
                                                    <Button
                                                        title={!_.get(this.props, 'contact.documents', null) || checkArray(this.props.contact.documents) && this.props.contact.documents.length === 0 ? getTranslation(translations.caseSingleScreen.oneDocumentText, this.props.translation) : getTranslation(translations.caseSingleScreen.moreDocumentsText, this.props.translation)}
                                                        onPress={this.props.onPressAddDocument}
                                                        color={styles.backgroundColor}
                                                        titleColor={styles.textColor}
                                                        height={calculateDimension(35, true, this.props.screenSize)}
                                                        width={'100%'}
                                                        style={{marginVertical: calculateDimension(8, true, this.props.screenSize)}}
                                                    />
                                                </View>) : null
                                        }
                                    </>
                            }
                        </View>
                    </ScrollView>
                </View>
            </View>
        );
    };

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (item, i) => {
        let fields = item.fields.map((field) => {
            return Object.assign({}, field, { isEditMode:  this.props.isEditMode }, {key: i})
        });
        return this.renderItemCardComponent(fields, i);
    };

    handleRenderItemForDocumentsList = (item, index) => {
        let fields = this.props.preparedFields?.document?.fields?.map((field) => {
            return Object.assign({}, field, { isEditMode:  this.props.isEditMode })
        });
        return this.renderItemCardComponent(fields, index)
    };

    handleRenderItemForVaccinesList = (item, index) => {
        let fields = this.props.preparedFields.vaccinesReceived.fields.map((field) => {
            return Object.assign({}, field, { isEditMode: this.props.isEditMode })
        });
        return this.renderItemCardComponent(fields, index)
    };

    renderItemCardComponent = (fields, cardIndex = null) => {
        return (
            <ElevatedView key={cardIndex} elevation={5} style={[style.containerCardComponent, {
                marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                marginVertical: 6,
                minHeight: calculateDimension(72, true, this.props.screenSize),
                width: calculateDimension(config.designScreenSize.width - 32, false, this.props.screenSize)
            }, style.cardStyle]}>
                <ScrollView scrollEnabled={false} style={{flex: 1}} contentContainerStyle={{flexGrow: 1}}>
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

        if(item.id === 'pregnancyStatus' && (this.props.contact?.gender === translations.localTranslationTokens.male )) {
            return;
        }

        if (item.type === 'DropdownInput') {
            item.data = this.computeDataForContactsSingleScreenDropdownInput(item);
        } else if (item.type === 'ActionsBar') {
            if (item.objectType !== null && item.objectType !== undefined && item.objectType === 'Documents') {
                item.onPressArray = [this.props.onDeletePress];
            } else if (item.objectType !== null && item.objectType !== undefined && item.objectType === 'Vaccines') {
                item.onPressArray = [this.props.onPressDeleteVaccines]
            }
        }


        if (item.type === 'DatePicker' && item.objectType !== 'Address' && item.objectType !== 'Documents' && item.objectType !== 'Vaccines') {
            value = this.props.contact[item.id]
        } else if (item.type === 'SwitchInput' && this.props.contact[item.id] !== undefined) {
            value = this.props.contact[item.id]
        } else {
            value = this.computeValueForContactsSingleScreen(item, cardIndex);
        }

        if (this.props.selectedItemIndexForTextSwitchSelectorForAge !== null && this.props.selectedItemIndexForTextSwitchSelectorForAge !== undefined && item.objectType === 'Contact' && item.dependsOn !== undefined && item.dependsOn !== null) {
            let itemIndexInConfigTextSwitchSelectorValues = config[item.dependsOn].map((e) => { return e.value }).indexOf(item.id);
            if (itemIndexInConfigTextSwitchSelectorValues > -1) {
                if (itemIndexInConfigTextSwitchSelectorValues !== this.props.selectedItemIndexForTextSwitchSelectorForAge) {
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
                isEditModeForDropDownInput={this.props.isEditMode}
                selectedItemIndexForAgeUnitOfMeasureDropDown={this.props.selectedItemIndexForAgeUnitOfMeasureDropDown}
                onChangeextInputWithDropDown={this.props.onChangeTextInputWithDropDown}
                value={value}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                index={cardIndex}
                onChangeText={this.props.onChangeText}
                onChangeDate={this.props.onChangeDate}
                onChangeSwitch={this.props.onChangeSwitch}
                onChangeDropDown={this.props.onChangeDropDown}
                onChangeTextSwitchSelector={this.props.onChangeTextSwitchSelector}
                onFocus={this.handleOnFocus}
                onBlur={this.handleOnBlur}
                permissionsList={item.permissionsList}
                mask={this.props.type === translations.personTypes.contactsOfContacts ? this.props.outbreak?.contactOfContactIdMask : this.props.outbreak?.contactIdMask}
            />
        )
    };

    setDateValidations = (item) => {
        let minimumDate = undefined;
        let maximumDate = undefined;

        if (item.type === 'DatePicker') {
            if (item.id === 'dob' || item.id === 'dateOfReporting') {
                maximumDate = createDate(null);
            }
        }

        return { minimumDate, maximumDate };
    };

    computeValueForContactsSingleScreen = (item, index) => {
        if (index !== null || index >= 0) {
            if (item.objectType === 'Documents') {
                return checkArrayAndLength(_.get(this.props, 'contact.documents')) && _.get(this.props, `contact.documents[${index}][${item.id}]`) !== null ?
                    getTranslation(_.get(this.props, `contact.documents[${index}][${item.id}]`, null), this.props.translation) : '';
            }
            if (item.objectType === 'Vaccines') {
                return checkArrayAndLength(_.get(this.props, 'contact.vaccinesReceived')) && _.get(this.props, `contact.vaccinesReceived[${index}][${item.id}]`) !== null ?
                    getTranslation(_.get(this.props, `contact.vaccinesReceived[${index}][${item.id}]`, null), this.props.translation) : '';
            }
        }
        if (item.id === 'age') {
            if (this.props.contact && this.props.contact[item.id] !== null && this.props.contact[item.id] !== undefined) {
                return this.props.contact[item.id]
            }
        } else if (item.id === 'followUp.status'){
            if (this.props.contact && this.props.contact.followUp && lodashGet(this.props.contact, item.id) !== undefined) {
                return getTranslation(lodashGet(this.props.contact, item.id),this.props.translation);
            }
        } else if (item.id === 'followUpTeamId') {
            if (checkArrayAndLength(this.state.teams) && this.props.contact.followUpTeamId) {
                let teamName = this.state.teams.find((e) => e.teamId === _.get(this.props, 'contact.followUpTeamId', null));
                return (teamName && teamName.name) || null;
            }
        } else {
            // console.log('Missing: ', item.id, this.props.contact[item.id]);
            return getTranslation(lodashGet(this.props, `contact[${item.id}]`, ' '), this.props.translation);
            // return this.props.contact && this.props.contact[item.id] ? getTranslation(this.props.contact[item.id], this.props.translation) : '';
        }
    };

    computeDataForContactsSingleScreenDropdownInput = (item) => {
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

        if (item.id === 'followUpTeamId') {
            return checkArrayAndLength(_.get(this.state, 'teams', [])) ? this.state.teams.map((e) => {return {label: e.name, value: e.teamId}}) : []
        }
    };

    handleOnFocus = (event) => {
        // this.scrollToInput(findNodeHandle(event.target))
    };

    handleOnBlur = (event) => {
        // this.scrollContactsSinglePersonal.props.scrollToPosition(0, 0, false)
        // this.scrollToInput(findNodeHandle(event.target))
    };
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flex: 1
    },
    containerCardComponent: {
        backgroundColor: styles.backgroundColor,
        borderRadius: 4,
        paddingVertical: 8
    },
    subcontainerCardComponent: {
        alignItems: 'center',
        flex: 1
    },
    viewContainer: {
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
    }
});

function mapStateToProps(state) {
    return {
        screenSize: _.get(state, 'app.screenSize', config.designScreenSize),
        translation: _.get(state, 'app.translation', []),
        referenceData: _.get(state, 'referenceData', []),
        outbreak: _.get(state, 'outbreak', null)
    };
}

export default connect(mapStateToProps)(ContactsSinglePersonal);
