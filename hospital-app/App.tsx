import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import PatientTabs from './src/navigation/PatientTabs';

export default function App() {
  return (
    <NavigationContainer>
      <PatientTabs />
    </NavigationContainer>
  );
}