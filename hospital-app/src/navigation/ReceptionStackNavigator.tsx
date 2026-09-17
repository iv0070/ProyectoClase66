import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ReceptionHomeScreen from '../screens/ReceptionHomeScreen';
import NuevoPacienteScreen from '../screens/NuevoPacienteScreen';
import AgendarCitaScreen from '../screens/AgendarCitaScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type ReceptionStackParamList = {
  ReceptionHome: undefined;
  NuevoPaciente: undefined;
  AgendarCita: { pacienteId: string; pacienteNombre: string };
  Perfil: { rol: string; nombre: string; usuario: string };
};

const Stack = createNativeStackNavigator<ReceptionStackParamList>();

export default function ReceptionStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ReceptionHome" component={ReceptionHomeScreen} />
      <Stack.Screen name="NuevoPaciente" component={NuevoPacienteScreen} />
      <Stack.Screen name="AgendarCita" component={AgendarCitaScreen} />
      <Stack.Screen name="Perfil" component={ProfileScreen} />
    </Stack.Navigator>
  );
}