/**
 * Created by florinpopa on 14/06/2018.
 */
import errorTypes from './errorTypes';


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
// Second argument is the size of the screen (width/height) from the design. You can find it in the config file
// Third argument is the screen size (width/height)
export function calculateDimension (designResourceDimension, designScreenDimension, screenSize) {
    return (designResourceDimension * screenSize) / designScreenDimension;
}