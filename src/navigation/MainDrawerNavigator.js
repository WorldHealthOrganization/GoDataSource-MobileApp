import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { screenMap } from '../screens/screenMap';
import NavigationDrawer from '../screens/NavigationDrawer';
import constants from '../utils/constants';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// This stack contains all screens available after login
function MainStack() {
  return (
    <Stack.Navigator 
        initialRouteName={constants.appScreens.followUpScreen} // Default start
        screenOptions={{ 
            headerShown: false,
            animation: 'slide_from_right'
        }}
    >
      {Object.entries(screenMap).map(([name, Component]) => (
        <Stack.Screen 
            key={name} 
            name={name} 
            component={Component} 
        />
      ))}
    </Stack.Navigator>
  );
}

export default function MainDrawerNavigator() {
  return (
    <Drawer.Navigator
        drawerContent={(props) => <NavigationDrawer {...props} />}
        screenOptions={{ 
            headerShown: false, 
            drawerType: 'front',
            swipeEnabled: false // Controlled by header buttons usually
        }}
    >
      <Drawer.Screen name="CenterStack" component={MainStack} />
    </Drawer.Navigator>
  );
}
