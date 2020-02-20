import App from './src/App';
import './shim.js';

import { Sentry } from 'react-native-sentry';

Sentry.config('https://09a7e6433b214ecf9778175c1357cd9b@sentry.io/1473631').install();
Sentry.setTagsContext({
    "environment": "development",
    // "environment": "staging",
    // "environment": "production",
    "react": true
});

const app = new App();