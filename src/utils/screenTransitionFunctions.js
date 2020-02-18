/**
 * Created by florinpopa on 25/02/2019.
 */
import translations from './translations';
import {getItemByIdRequest} from './../actions/cases';
import lodashIntersection from 'lodash/intersection';
import {checkArrayAndLength} from './typeCheckingFunctions';
import {getTranslation, generatePermissionMessage} from "./functions";
import {Alert} from "react-native";
import get from "lodash/get";
import config from "./config";
import constants from './constants';

export function pushNewEditScreen(QRCodeInfo, navigator, user, translation, callback) {
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
                } else if (parsedData.targetResource === 'contact' || parsedData.targetResource === 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT') {
                    itemType = 'contact';
                    if (parsedData.resourceContext && parsedData.resourceContext !== undefined &&
                        parsedData.resourceContext.outbreakId && parsedData.resourceContext.outbreakId !== undefined &&
                        parsedData.resourceContext.contactId && parsedData.resourceContext.contactId !== undefined) {
                        itemId = parsedData.resourceContext.contactId;
                        outbreakId = parsedData.resourceContext.outbreakId;
                    }
                }
            }
        }
    }

    console.log('pushNewEditScreen', itemId, itemType, outbreakId);
    if (itemId && itemType && outbreakId && outbreakId === user.activeOutbreakId) {
        let itemPouchId = null;
        if (itemType === 'case') {
            itemPouchId = `${itemId}`
        } else if (itemType === 'contact') {
            itemPouchId = `${itemId}`
        }

        if (itemPouchId) {
            getItemByIdRequest(itemPouchId)
                .then((response) => {
                    console.log("*** getItemByIdRequest response: ", response);
                    return callback(null, itemType, response);
                })
                .catch((error) => {
                    console.log("*** getItemByIdRequest error: ", error);
                    return callback(translations.alertMessages.noItemAlert, itemType, {_id: itemPouchId});
                });
        } else {
            return callback(translations.alertMessages.wrongQR);
        }
    }
}

export function screenTransition(navigator, transition, nextScreen, passProps, userPermissions, requiredPermissions) {
    if (checkArrayAndLength(lodashIntersection(userPermissions, requiredPermissions))) {
        switch (transition) {
            case 'push':
                navigator.push({
                    screen: nextScreen,
                    animated: true,
                    // animationType: 'fade',
                    passProps: passProps
                });
                break;
            case 'showModal':
                navigator.showModal({
                    screen: nextScreen,
                    animated: true,
                    // animationType: 'fade',
                    passProps: passProps
                });
                break;
            default:
                break
        }
    }
}

export function handleQRSearchTransition (navigator, error, itemType, record, user, translation, userPermissions, ) {
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
                            navigator.push({
                                screen: 'CaseSingleScreen',
                                animated: true,
                                animationType: 'fade',
                                passProps: {
                                    case: Object.assign({}, record, {
                                        outbreakId: get(user, 'activeOutbreakId', null),
                                    }, config.caseBlueprint),
                                    forceNew: true
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
                        navigator.push({
                            screen: 'CaseSingleScreen',
                            animated: true,
                            animationType: 'fade',
                            passProps: {
                                case: record
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
                                onPress: () => {console.log('Ok pressed')}
                            }
                        ]
                    )
                }
            } else if (itemType === 'contact') {
                if (checkArrayAndLength(lodashIntersection([
                    constants.PERMISSIONS_CONTACT.contactAll,
                    constants.PERMISSIONS_CONTACT.contactView
                ], userPermissions))) {
                        navigator.push({
                            screen: 'ContactsSingleScreen',
                            animated: true,
                            animationType: 'fade',
                            passProps: {
                                contact: record
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
                                onPress: () => {console.log('Ok pressed')}
                            }
                        ]
                    )
                }
            }
        }
    }
}