import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { Provider } from 'react-redux';
import { createNavigationContainerRef } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import RootNavigator from './navigation/RootNavigator';
import App from './App';
import { store } from './App';

// Official React Navigation imperative ref. Exposes navigate/dispatch/goBack/
// canGoBack/isReady AND `.current` (the container), so navigationActions,
// navigationAdapter and the Wix compat shim can all drive navigation.
export const navigationRef = createNavigationContainerRef();

export default function Root() {
  useEffect(() => {
    new App();
  }, []);

  return (
    <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }} edges={Platform.OS === 'android' ? ['top', 'bottom', 'left', 'right']: ['left', 'right']}>
                <Provider store={store}>
                    <RootNavigator navigationRef={navigationRef} />
                </Provider>
            </SafeAreaView>
        </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
