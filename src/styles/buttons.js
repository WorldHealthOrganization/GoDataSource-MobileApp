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
    backgroundColor: colors.primaryColorRgb,
    borderRadius: 4,
    color: colors.primaryColor,
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    justifyContent: 'center',
    lineHeight: 26,
    textAlign: 'center',
    width: '100%'
};

export default {
    primaryButton,
    secondaryButton,
    dangerButton,
    buttonTextActionsBar
}
