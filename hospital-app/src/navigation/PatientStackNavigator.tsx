import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PatientTabs from './PatientTabs';
import AgendarCitaScreen from '../screens/AgendarCitaScreen';

export type PatientStackParamList = {
  PatientTabs: undefined;
  AgendarCita: { pacienteId?: string; pacienteNombre?: string } | undefined;
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
    </Stack.Navigator>
  );
}
