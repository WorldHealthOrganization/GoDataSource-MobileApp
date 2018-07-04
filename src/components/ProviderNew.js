/**
 * Created by florinpopa on 03/07/2018.
 */
import { Provider } from 'react-redux';
import { COLOR, ThemeContext, getTheme } from 'react-native-material-ui';

// you can set your style right here, it'll be propagated to application
const uiTheme = {
    palette: {
        primaryColor: COLOR.green500,
    },
    toolbar: {
        container: {
            height: 50,
        },
    },
};

const ProviderNew = ({ store, children }) => (
    <Provider store={store}>
            {children}
    </Provider>
);

export default ProviderNew;