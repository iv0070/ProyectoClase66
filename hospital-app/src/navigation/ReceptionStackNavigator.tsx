import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ReceptionHomeScreen from '../screens/ReceptionHomeScreen';
import NuevoPacienteScreen from '../screens/NuevoPacienteScreen';

export type ReceptionStackParamList = {
  ReceptionHome: undefined;
  NuevoPaciente: undefined;
};

const Stack = createNativeStackNavigator<ReceptionStackParamList>();

export default function ReceptionStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ReceptionHome" component={ReceptionHomeScreen} />
      <Stack.Screen name="NuevoPaciente" component={NuevoPacienteScreen} />
    </Stack.Navigator>
  );
}