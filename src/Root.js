import React, { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import RootNavigator from './navigation/RootNavigator';
import App from './App';
import { store } from './App';

export const navigationRef = { current: null };

export default function Root() {
  const navRef = useRef(null);

  useEffect(() => {
    navigationRef.current = navRef.current;
    new App();
  }, []);

  return (
    <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
                <Provider store={store}>
                    <RootNavigator navigationRef={navRef} />
                </Provider>
            </SafeAreaView>
        </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
