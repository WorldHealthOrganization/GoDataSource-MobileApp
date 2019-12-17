/**
 * Created by florinpopa on 25/02/2019.
 */
import translations from './translations';
import {getItemByIdRequest} from './../actions/cases';
import lodashIntersection from 'lodash/intersection';
import {checkArrayAndLength} from './typeCheckingFunctions';

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