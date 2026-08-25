import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';

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
        {/* Aquí se van a agregar DoctorStack, PatientTabs y ReceptionStack más adelante */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}