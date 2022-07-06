/* Buttons */
import colors from './colors';

const primaryButton = {
    container: {
        backgroundColor: colors.primaryColor,
        borderRadius: 4,
        justifyContent: 'center',
        marginTop: 16,
        width: '100%'
    },
    text: {
        color: colors.backgroundColor,
        fontFamily: 'Roboto-Medium',
        fontSize: 14
    }
};

const secondaryButton = {
    container: {
        backgroundColor: colors.disabledColor,
        borderRadius: 4,
        justifyContent: 'center',
        marginTop: 16,
        width: '100%'
    },
    text: {
        color: colors.textColor,
        fontFamily: 'Roboto-Medium',
        fontSize: 14
    }
};

const dangerButton = {
    container: {
        backgroundColor: colors.dangerColor,
        borderRadius: 4,
        justifyContent: 'center',
        marginTop: 16,
        width: '100%'
    },
    text: {
        color: colors.backgroundColor,
        fontFamily: 'Roboto-Medium',
        fontSize: 14
    }
};

const buttonTextActionsBar = {
    color: colors.primaryColor,
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
    textAlign: 'center'
};

export default {
    primaryButton,
    secondaryButton,
    dangerButton,
    buttonTextActionsBar
}
