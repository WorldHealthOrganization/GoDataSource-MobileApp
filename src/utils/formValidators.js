import {checkArrayAndLength, checkInteger} from "./typeCheckingFunctions";

export function formValidator(methods) {
    let message = ``;
    for (let method of methods) {
        if (checkArrayAndLength(method?.validation)) {
            message += `${message.length > 0 ? '\n' : ''}Page: ${method.page}\nCard: ${method.card}\n${method.messageTemplate}${method.skipAux ? null : method?.validation}\n`;
        }
    }

    return message;
}

// dataToBeValidated it's either array of object
// arrayOfFields is an array of object
export function validateRequiredFields(dataToBeValidated, arrayOfFields, customValidator, globalCheck) {
    let missingFields = [];

    if (!checkArrayAndLength(arrayOfFields)) {
        return missingFields;
    }

    if (checkArrayAndLength(dataToBeValidated) && !globalCheck) {
        for(let dataIndex=0; dataIndex<dataToBeValidated.length; dataIndex++) {
            let aux = validateSingleRequiredFields(dataToBeValidated[dataIndex], arrayOfFields, customValidator);
            if (checkArrayAndLength(aux)) {
                missingFields = missingFields.concat(aux.map((e) => `${e}(item ${dataIndex + 1})`));
            }
        }
    } else {
        missingFields = validateSingleRequiredFields(dataToBeValidated, arrayOfFields, customValidator)
    }

    return missingFields;
}
function validateSingleRequiredFields (dataToBeValidated, arrayOfFields, customValidator) {
    let missingFields = [];

    function defaultFunction(data, field) {
        if (field?.isRequired && !data?.[field?.id]) {
            return field?.label;
        }
        return null;
    }

    for (let i=0; i<arrayOfFields.length; i++) {
        try {
            if (customValidator) {
                let aux = customValidator.call(this, dataToBeValidated, arrayOfFields[i], defaultFunction);
                if(aux) {
                    missingFields.push(aux);
                }
            } else {
                let aux = defaultFunction(dataToBeValidated, arrayOfFields?.[i]);
                if (aux) {
                    missingFields.push(aux);
                }
            }
        } catch(errorMissing) {
            console.log("Error Missing Fields: ", errorMissing);
        }
    }

    return missingFields;
}

// dataValue int
// values = {min, max}
export function checkNumberIntervals(dataValue, values, message) {
    return !checkInteger(dataValue) || value?.min > dataValue || values?.max < dataValue ? message : false;
}

export function checkValidEmails (arrayToCheck, pathToObject) {
    // let invalidEmails = [];
    // if (checkArrayAndLength(arrayToCheck)) {
    //     for (let i = 0; i < arrayToCheck.length; i++) {
            let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return arrayToCheck?.[pathToObject] && !re.test(arrayToCheck?.[pathToObject]) ? arrayToCheck?.[pathToObject] : null;
            // if (arrayToCheck?.[i]?.[pathToObject] && !re.test(arrayToCheck?.[i]?.[pathToObject])) {
            //     invalidEmails.push(arrayToCheck?.[i]?.[pathToObject]);
            // }
    //     }
    // }
    // return invalidEmails;
}

export function prepareFields(config, outbreakFields, screen, configTab) {
    const configFields = Object.assign([],config.fields);
    let atLeastOneVisible = false;
    const result = configFields.map(cField =>{
        let newField = Object.assign({}, cField);
        let outbreakFieldKey;
        const cFieldId = newField.fieldId || newField.id;
        switch (configTab) {
            case 'address':
                if (screen === 'events' || screen === 'follow-ups'){
                    outbreakFieldKey = `address____${cFieldId}`;
                } else {
                    outbreakFieldKey = `addresses____${cFieldId}`;
                }
                break;
            case 'document':
                outbreakFieldKey = `documents____${cFieldId}`;
                break;
            case 'vaccinesReceived':
                outbreakFieldKey = `vaccinesReceived____${cFieldId}`;
                break;
            case 'dateRanges':
                outbreakFieldKey = `dateRanges____${cFieldId}`;
                break;
            default:
                outbreakFieldKey = cFieldId;
                break;
        }
        if (cFieldId.includes('.')){
            outbreakFieldKey = `${cFieldId.replace('.','[')}]`;
        }
        //default all are visible
        newField.invisible = false;
        if (outbreakFields[outbreakFieldKey]){
            newField.invisible = !outbreakFields[outbreakFieldKey].visible;
            if (!newField.isAlwaysRequired) {
                newField.isRequired = !!outbreakFields[outbreakFieldKey].mandatory;
            }
            if (!newField.invisible) {
                atLeastOneVisible = true;
            }
        } else if (!newField.isNotField) {
            newField.invisible = true;
        }
        if (newField.isRequired && newField.invisible) {
            newField.isRequired = false;
        }
        return newField;
    });
    return {fields: result, invisible: !atLeastOneVisible};
}

// returns parsed fields with correct visibility and isRequired properties, and a list of routes that shouldn't appear anymore
export function prepareFieldsAndRoutes (outbreak, screen, config) {
    let newConfig = Object.assign({},config);
    if (outbreak?.visibleAndMandatoryFields && outbreak?.visibleAndMandatoryFields[screen]){
        let outbreakFieldsClone = Object.assign({},outbreak.visibleAndMandatoryFields[screen]);
        if (screen === "contacts" && outbreak?.visibleAndMandatoryFields["relationships"]){
            outbreakFieldsClone = Object.assign(outbreakFieldsClone, outbreak?.visibleAndMandatoryFields["relationships"]);
        }
        for (const [key, value] of Object.entries(newConfig)) {
            let fieldTab = key;
            if (Array.isArray(value)){
                 newConfig[key] = value.map(
                    v => {
                        return Object.assign({}, prepareFields(v, outbreakFieldsClone, screen, fieldTab));
                    }
                )
            } else {
                newConfig[key] = Object.assign({}, prepareFields(value, outbreakFieldsClone, screen, fieldTab))
            }
        }
    }
    return newConfig;
}
