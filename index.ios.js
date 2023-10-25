/**
 * Created by mobileclarisoft on 13/07/2018.
 */
import App from './src/App';
import appConfig from './app.config';

import { Sentry } from 'react-native-sentry';

Sentry.config('https://09a7e6433b214ecf9778175c1357cd9b@sentry.io/1473631').install();
Sentry.setTagsContext({
    "environment": appConfig.env,
    "react": true
});


const app = new App();