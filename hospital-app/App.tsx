import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import PatientStackNavigator from './src/navigation/PatientStackNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <PatientStackNavigator />
    </NavigationContainer>
  );
}