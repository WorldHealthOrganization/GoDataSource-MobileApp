import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { screenMap } from '../screens/screenMap';
import constants from '../utils/constants';
const Stack = createNativeStackNavigator();

import ThemeContext from 'react-native-material-ui/src/styles/themeContext';
import getTheme from 'react-native-material-ui/src/styles/getTheme';
import styles from '../styles';
import MainDrawerNavigator from '../navigation/MainDrawerNavigator';


const uiTheme = {
    palette: {
        primaryColor: styles ? styles.primaryColor : 'blue',
        accentColor: styles ? styles.secondaryColor : 'red',
    },
    // You can override other theme properties here
};

export default function RootNavigator({ navigationRef }) {
  const root = useSelector(state => state.app.root);

  return (
    <ThemeContext.Provider value={getTheme(uiTheme)}>
        <NavigationContainer ref={navigationRef}>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
            {root === 'login' ? (
            <Stack.Screen name={constants.appScreens.loginScreen} component={screenMap[constants.appScreens.loginScreen]} />
            ) : root === 'config' ? (
            <>
                <Stack.Screen name={constants.appScreens.firstConfigScreen} component={screenMap[constants.appScreens.firstConfigScreen]} />
                <Stack.Screen name={constants.appScreens.manualConfigScreen} component={screenMap[constants.appScreens.manualConfigScreen]} />
                <Stack.Screen name={constants.appScreens.qrScanScreen} component={screenMap[constants.appScreens.qrScanScreen]} />
            </>
            ) : root === 'after-login' ? (
            <Stack.Screen name="MainDrawer" component={MainDrawerNavigator} />
            ) : (
                // Default Loading/Splash or Config fallback
            <Stack.Screen name="Splash" component={screenMap[constants.appScreens.firstConfigScreen]} />
            )}
        </Stack.Navigator>
        </NavigationContainer>
    </ThemeContext.Provider>
  );
}
