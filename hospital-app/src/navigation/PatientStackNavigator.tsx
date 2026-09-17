import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PatientTabs from './PatientTabs';
import AgendarCitaScreen from '../screens/AgendarCitaScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type PatientStackParamList = {
  PatientTabs: undefined;
  AgendarCita: { pacienteId?: string; pacienteNombre?: string } | undefined;
  Perfil: { rol: string; nombre: string; usuario: string; edad?: number; telefono?: string };
};

const Stack = createNativeStackNavigator<PatientStackParamList>();

export default function PatientStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PatientTabs" component={PatientTabs} />
      <Stack.Screen
        name="AgendarCita"
        component={AgendarCitaScreen}
        options={{ headerShown: true, title: 'Agendar cita' }}
      />
      <Stack.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{ headerShown: true, title: 'Mi perfil' }}
      />
    </Stack.Navigator>
  );
}