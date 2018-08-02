/**
 * Created by florinpopa on 14/06/2018.
 */
import errorTypes from './errorTypes';
import config from './config';


// This method is used for handling server responses. Please add here any custom error handling
export function handleResponse(response) {
    if (response.status === 200) {
        return response.json();
    }

    if (response.status === 204) {
        return {};
    }

    return response.json().then(response => {
        if (response.error && response.error.message && (typeof response.error.message === 'string')) {

            // TODO ERROR HANDLING

        }
        throw new Error(errorTypes.UNKNOWN_ERROR);
    });
};

// This method is used for calculating dimensions for components.
// Because the design is made only for one screen, this means that for other screen resolutions, the views will not be scaled
// To use the method
// First argument is the size of the component from the design
// Second argument is the size of the screen {width, height} from the design. You can find it in the config file
// Third argument is the screen size {width, height}
export function calculateDimension (designResourceDimension, isHeight, screenSize) {
    // Check phones with different aspect ratio
    let designScreenDimension = config.designScreenSize;
    let scaledHeight = designScreenDimension.height;
    if (designScreenDimension.height / designScreenDimension.width !== screenSize.height / screenSize.width) {
        scaledHeight = designScreenDimension.width * designScreenDimension.height / screenSize.width;
    }

    if (isHeight) {
        return (designResourceDimension * scaledHeight) / designScreenDimension.height;
    }

    return (designResourceDimension * screenSize.width) / designScreenDimension.width;
}

export function checkIfSameDay(date1, date2) {
    if (Object.prototype.toString.call(date1) !== '[object Date]' || Object.prototype.toString.call(date2) !== '[object Date]') {
        return false;
    }
    return date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
}

export function getAddress(address, returnString) {
    let addressArray = [];

    if (address) {
        addressArray = [address.addressLine1, address.addressLine2, address.city, address.country, address.postalCode];
        addressArray = addressArray.filter((e) => {return e});
    }

    return returnString ? addressArray.join(', ') : addressArray;
}

// This method returns the cases/events that a contact has been exposed to
// It can return either as a string or as an array of cases
export function handleExposedTo(contact, returnString, cases, events) {
    if (!contact || !contact.relationships || !Array.isArray(contact.relationships) || contact.relationships.length === 0) {
        return ' ';
    }

    let relationshipArray = [];

    let relationships = contact.relationships;

    for (let i=0; i<relationships.length; i++) {
        // Get only the persons that the contact has been exposed to
        let persons = relationships[i].persons.filter((e) => {return e.id !== contact.id});
        for (let j=0; j<persons.length; j++) {
            if (persons[j].type === 'case' && cases && Array.isArray(cases)) {
                let auxCase = cases[cases.map((e) => {return e.id}).indexOf(persons[j].id)];
                relationshipArray.push((auxCase.firstName || '') + " " + (auxCase.lastName || ''));
            } else {
                if (events && Array.isArray(events)) {
                    let auxEvent = events[events.map((e) => {
                        return e.id
                    }).indexOf(persons[j].id)];
                    if (auxEvent && auxEvent.name) {
                        relationshipArray.push(auxEvent.name);
                    }
                }
            }
        }
    }

    return returnString ? relationshipArray.join(", ") : relationshipArray;
};