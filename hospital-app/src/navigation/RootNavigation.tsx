import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import DoctorStackNavigator from './DoctorStackNavigator';

import ReceptionStackNavigator from './ReceptionStackNavigator';

export type RootStackParamList = {
  Login: undefined;
  DoctorStack: undefined;
  PatientTabs: undefined;
  ReceptionStack: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="DoctorStack" component={DoctorStackNavigator} />
        <Stack.Screen name="ReceptionStack" component={ReceptionStackNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}