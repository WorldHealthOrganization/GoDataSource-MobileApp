/**
 * Created by florinpopa on 04/07/2018.
 */
import colors from './colors';

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
        justifyContent: 'space-evenly'
    },
    text: {
        fontFamily: 'Roboto-Medium',
        fontSize: 18,
        color: colors.colorLoginButtonText
    }
};

export default {
    buttonGreen,
    buttonRed,
    buttonLogin
}