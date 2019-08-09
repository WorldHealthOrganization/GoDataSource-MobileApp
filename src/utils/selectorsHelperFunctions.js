import {extractIdFromPouchId, getAddress, getTranslation} from "./functions";
import config from "./config";
import translations from "./translations";
import {setLoaderState} from './../actions/app';

export function prepareFirstComponentData(type, itemToRender, translation, locations) {
    let returnValues = {
        fullName: '',
        firstName: '',
        lastName: '',
        id: '',
        gender: '',
        age: '',
        visualId: '',
        addressString: '',
        primaryColor: 'black'
    };
    // Get followUp's contact
    let person = itemToRender || null;
    returnValues.fullName = person ? ((person.firstName ? person.firstName : ' ') + (person.lastName ? (" " + person.lastName) : ' ')) : '';
    returnValues.firstName = person && person.firstName ? person.firstName : '';
    returnValues.lastName = person && person.lastName ? person.lastName : '';
    let genderString = '';
    if (person && person.gender) {
        genderString = getTranslation(person.gender, translation);
        returnValues.genderId = person.gender;
    }

    returnValues.gender = person && genderString ? genderString.charAt(0) : '';
    if (person && person.age !== undefined && person.age !== null) {
        if (person.age.years !== undefined || person.age.months !== undefined) {
            if (person.age.years !== 0 && person.age.years !== null) {
                returnValues.age = person.age.years.toString() + getTranslation(config.localTranslationTokens.years, translation).charAt(0).toLowerCase()
            } else if (person.age.months !== 0 && person.age.months !== null) {
                returnValues.age = person.age.months.toString() + getTranslation(config.localTranslationTokens.months, translation).charAt(0).toLowerCase()
            }
        }
    }

    if (person && person.addresses && Array.isArray(person.addresses) && person.addresses.length > 0) {
        let personPlaceOfResidence = person.addresses.find((e) => {return e.typeId === config.userResidenceAddress.userPlaceOfResidence});
        if (personPlaceOfResidence) {
            returnValues.locationId = personPlaceOfResidence.locationId || null;
            returnValues.addressString = getTranslation(translations.addressFieldLabels.address, translation) + ": " + getAddress(personPlaceOfResidence, true, locations);
        }
    }

    if (person && person.visualId) {
        returnValues.visualId = person.visualId;
    }

    if (person && person._id) {
        returnValues.id = person._id;
    }

    return returnValues;
};