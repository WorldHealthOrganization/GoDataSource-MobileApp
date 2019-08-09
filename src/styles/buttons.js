/**
 * Created by florinpopa on 04/07/2018.
 */
import colors from './colors';
import styles from "./index";

const buttonGreen = {
    container: {
        backgroundColor: 'green',
    },
    text: {
        color: 'white'
    }
};

const buttonRed = {
    container: {
        backgroundColor: 'red'
    },
    text: {
        color: 'black'
    }
};

const buttonLogin = {
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        width: '100%',
        borderRadius: 5,
        justifyContent: 'space-evenly',
        marginVertical: 2.5
    },
    text: {
        fontFamily: 'Roboto-Medium',
        fontSize: 18,
        color: colors.colorLoginButtonText
    }
};

const buttonTextActionsBar = {
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
    color: colors.buttonGreen
};

export default {
    buttonGreen,
    buttonRed,
    buttonLogin,
    buttonTextActionsBar
}