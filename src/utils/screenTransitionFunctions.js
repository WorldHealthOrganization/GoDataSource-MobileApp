/**
 * Created by florinpopa on 25/02/2019.
 */
import translations from './translations';
import {getItemByIdRequest} from './../actions/cases';
import lodashIntersection from 'lodash/intersection';
import {checkArrayAndLength} from './typeCheckingFunctions';
import {createStackFromComponent, generatePermissionMessage, getTranslation} from "./functions";
import {Alert} from "react-native";
import get from "lodash/get";
import isFunction from "lodash/isFunction";
import config from "./config";
import constants, {PERMISSIONS_CONTACT_OF_CONTACT} from './constants';
import {Navigation} from "react-native-navigation";
import {fadeInAnimation, fadeOutAnimation} from "./animations";

export function pushNewEditScreen(QRCodeInfo, componentId, user, outbreak, translation, callback) {
    console.log('pushNewEditScreen QRCodeInfo', QRCodeInfo);

    let itemId = null;
    let itemType = null;
    let outbreakId = null;

    if (QRCodeInfo && QRCodeInfo !== undefined && QRCodeInfo.data && QRCodeInfo.data !== undefined) {
        let parsedData = null;
        try {
            parsedData = JSON.parse(QRCodeInfo.data)
        } catch (err) {
            return callback(translations.alertMessages.errorOccuredMsg);
        }
        if (parsedData && parsedData !== undefined) {
            console.log('parsedData', parsedData);

            if (parsedData.targetResource && parsedData.targetResource !== undefined) {
                if (parsedData.targetResource === 'case' || parsedData.targetResource === 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE') {
                    itemType = 'case';
                    if (parsedData.resourceContext && parsedData.resourceContext !== undefined &&
                        parsedData.resourceContext.outbreakId && parsedData.resourceContext.outbreakId !== undefined &&
                        parsedData.resourceContext.caseId && parsedData.resourceContext.caseId !== undefined) {
                        itemId = parsedData.resourceContext.caseId;
                        outbreakId = parsedData.resourceContext.outbreakId
                    }
                } else if (parsedData.targetResource === 'event' || parsedData.targetResource === 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_EVENT') {{
                        itemType = 'event';
                        if (parsedData.resourceContext && parsedData.resourceContext !== undefined &&
                            parsedData.resourceContext.outbreakId && parsedData.resourceContext.outbreakId !== undefined &&
                            parsedData.resourceContext.eventId && parsedData.resourceContext.eventId !== undefined) {
                            itemId = parsedData.resourceContext.eventId;
                            outbreakId = parsedData.resourceContext.outbreakId
                        }
                    }
                } else if (parsedData.targetResource === 'contact' || parsedData.targetResource === 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT') {
                    itemType = 'contact';
                    if (parsedData.resourceContext && parsedData.resourceContext !== undefined &&
                        parsedData.resourceContext.outbreakId && parsedData.resourceContext.outbreakId !== undefined &&
                        parsedData.resourceContext.contactId && parsedData.resourceContext.contactId !== undefined) {
                        itemId = parsedData.resourceContext.contactId;
                        outbreakId = parsedData.resourceContext.outbreakId;
                    }
                } else if (parsedData.targetResource === 'contactOfContact' || parsedData.targetResource === translations.personTypes.contactsOfContacts) {
                    itemType = 'contactOfContact';
                    itemId = get(parsedData, 'resourceContext.contactOfContactId', null);
                    outbreakId = get(parsedData, 'resourceContext.outbreakId', null);
                }
            }
        }
    }

    console.log('pushNewEditScreen', itemId, itemType, outbreakId);
    if (itemId && itemType && outbreakId && outbreakId === outbreak._id) {
        // let itemPouchId = null;
        // if (itemType === 'case') {
        //     itemPouchId = `${itemId}`
        // } else if (itemType === 'contact') {
        //     itemPouchId = `${itemId}`
        // }

        if (itemId) {
            getItemByIdRequest(itemId)
                .then((response) => {
                    console.log("*** getItemByIdRequest response: ", response);
                    if (!response) {
                        return callback(translations.alertMessages.noItemAlert, itemType, {_id: itemId});
                    }
                    return callback(null, itemType, response);
                })
                .catch((error) => {
                    console.log("*** getItemByIdRequest error: ", error);
                    return callback(translations.alertMessages.noItemAlert, itemType, {_id: itemId});
                });
        } else {
            return callback(translations.alertMessages.wrongQR);
        }
    }
}

export function screenTransition(componentId, transition, nextScreen, passProps, userPermissions, requiredPermissions) {
    if (checkArrayAndLength(lodashIntersection(userPermissions, requiredPermissions))) {
        switch (transition) {
            case 'push':
                Navigation.push(componentId, {
                    component:{
                        name: nextScreen,
                        passProps: passProps
                    }
                });
                break;
            case 'showModal':
                Navigation.showModal(createStackFromComponent({
                    name: nextScreen,
                    passProps: passProps
                }));
                break;
            default:
                break
        }
    }
}

export function handleQRSearchTransition (componentId, error, itemType, record, user, outbreak, translation, userPermissions, refresh) {
    if (!refresh || !isFunction(refresh)) {
        refresh = () => {console.log('Default refresh function for scan qrCode')}
    }
    if (error) {
        if (error === translations.alertMessages.noItemAlert && itemType === 'case' && record) {
            if (checkArrayAndLength(lodashIntersection([
                constants.PERMISSIONS_CASE.caseAll,
                constants.PERMISSIONS_CASE.caseCreate
            ], userPermissions))) {
                Alert.alert(getTranslation(translations.alertMessages.alertLabel, translation), `${getTranslation(error, translation)}.\n${getTranslation(translations.alertMessages.addMissingPerson, translation)}`, [
                    {
                        text: getTranslation(translations.alertMessages.cancelButtonLabel, translation),
                        onPress: () => {
                            console.log('Cancel pressed');
                        }
                    },
                    {
                        text: getTranslation(translations.alertMessages.yesButtonLabel, translation),
                        onPress: () => {
                            console.log('Yes pressed');
                            let caseToSave = Object.assign({}, record, {
                                outbreakId: get(outbreak, '_id', null),
                            }, config.caseBlueprint);

                            Navigation.push(componentId,{
                                component:{
                                    name: 'CaseSingleScreen',
                                    options:{
                                        animations:{
                                            push: fadeInAnimation,
                                            pop: fadeOutAnimation
                                        }
                                    },
                                    passProps: {
                                        case: caseToSave,
                                        forceNew: true,
                                        isNew: true,
                                        refresh: refresh
                                    }
                                }

                            })
                        }
                    },
                ])
            } else {
                // user doesn't have permission to create case
                Alert.alert(
                    getTranslation(translations.alertMessages.alertLabel, translation),
                    generatePermissionMessage(translations.helpScreen.addMessage, translations.personTypes.cases, translation),
                    [
                        {
                            text: getTranslation(translations.alertMessages.okButtonLabel),
                            onPress: () => {console.log('Ok pressed')}
                        }
                    ]
                )
            }
        } else {
            Alert.alert(getTranslation(translations.alertMessages.alertLabel, translation), getTranslation(error, translation), [
                {
                    text: getTranslation(translations.alertMessages.okButtonLabel, translation),
                    onPress: () => {
                        console.log('Ok pressed');
                    }
                }
            ])
        }
    } else {
        if (itemType && record) {
            if (itemType === 'case') {
                if (checkArrayAndLength(lodashIntersection([
                    constants.PERMISSIONS_CASE.caseAll,
                    constants.PERMISSIONS_CASE.caseView
                ], userPermissions))) {
                    Navigation.push(componentId, {
                        component: {
                            name: 'CaseSingleScreen',
                            options: {
                                animations: {
                                    push: fadeInAnimation,
                                    pop: fadeOutAnimation
                                }
                            },
                            passProps: {
                                case: record,
                                refresh: refresh
                            }
                        }
                    })
                } else {
                    // user doesn't have permission to view case
                    Alert.alert(
                        getTranslation(translations.alertMessages.alertLabel, translation),
                        generatePermissionMessage(translations.helpScreen.viewMessage, translations.personTypes.cases, translation),
                        [
                            {
                                text: getTranslation(translations.alertMessages.okButtonLabel),
                                onPress: () => {
                                    console.log('Ok pressed')
                                }
                            }
                        ]
                    )
                }
            } else if (itemType === 'contact') {
                if (checkArrayAndLength(lodashIntersection([
                    constants.PERMISSIONS_CONTACT.contactAll,
                    constants.PERMISSIONS_CONTACT.contactView
                ], userPermissions))) {
                    Navigation.push(componentId, {
                        component: {
                            name: 'ContactsSingleScreen',
                            options: {
                                animations: {
                                    push: fadeInAnimation,
                                    pop: fadeOutAnimation
                                }
                            },
                            passProps: {
                                contact: record,
                                refresh: refresh
                            }
                        }
                    })
                } else {
                    // user doesn't have permission to view contact
                    Alert.alert(
                        getTranslation(translations.alertMessages.alertLabel, translation),
                        generatePermissionMessage(translations.helpScreen.viewMessage, translations.personTypes.contacts, translation),
                        [
                            {
                                text: getTranslation(translations.alertMessages.okButtonLabel),
                                onPress: () => {
                                    console.log('Ok pressed')
                                }
                            }
                        ]
                    )
                }
            } else if (itemType === 'contactOfContact') {
                if (checkArrayAndLength(lodashIntersection([
                    PERMISSIONS_CONTACT_OF_CONTACT.contactsOfContactsAll,
                    PERMISSIONS_CONTACT_OF_CONTACT.contactsOfContactsView
                ], userPermissions))) {
                    Navigation.push(componentId, {
                        component: {
                            options: {
                                animations: {
                                    push: fadeInAnimation,
                                    pop: fadeOutAnimation
                                }
                            },
                            name: constants.appScreens.contactsOfContactsSingleScreen,
                            passProps: {
                                contact: record,
                                refresh: refresh
                            }
                        }
                    })
                } else if (itemType === 'labResult') {
                    if (checkArrayAndLength(lodashIntersection([
                        constants.PERMISSIONS_LAB_RESULT.labResultAll,
                        constants.PERMISSIONS_LAB_RESULT.labResultView
                    ], userPermissions))) {
                        Navigation.push(componentId, {
                            component: {
                                options: {
                                    animations: {
                                        push: fadeInAnimation,
                                        pop: fadeOutAnimation
                                    }
                                },
                                name: constants.appScreens.labResultsSingleScreen,
                                passProps: {
                                    contact: record,
                                    refresh: refresh
                                }
                            }
                        })
                    } else {
                        // user doesn't have permission to view contact
                        Alert.alert(
                            getTranslation(translations.alertMessages.alertLabel, translation),
                            generatePermissionMessage(translations.helpScreen.viewMessage, translations.personTypes.contactsOfContacts, translation),
                            [
                                {
                                    text: getTranslation(translations.alertMessages.okButtonLabel),
                                    onPress: () => {
                                        console.log('Ok pressed')
                                    }
                                }
                            ]
                        )
                    }
                }
            }
        }
    }
}