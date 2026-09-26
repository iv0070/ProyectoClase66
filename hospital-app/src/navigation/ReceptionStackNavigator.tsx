import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ReceptionTabs from './ReceptionTabs';
import AgendarCitaScreen from '../screens/AgendarCitaScreen';

// tipos de las pantallas de este stack
// AgendarCita necesita el id y nombre del paciente que se selecciono
export type ReceptionStackParamList = {
  ReceptionTabs: undefined;
  AgendarCita: { pacienteId: string; pacienteNombre: string };
};

const Stack = createNativeStackNavigator<ReceptionStackParamList>();

// este stack envuelve las pestanas de recepcion (ReceptionTabs)
// y le agrega encima la pantalla de AgendarCita, que se abre completa
// (no como pestana) cuando recepcion le da a "Agendar cita" desde un paciente
export default function ReceptionStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* pantalla inicial: las pestanas de recepcion */}
      <Stack.Screen name="ReceptionTabs" component={ReceptionTabs} />

      {/* pantalla que se abre encima de las pestanas, con su propio header */}
      <Stack.Screen
        name="AgendarCita"
        component={AgendarCitaScreen}
        options={{ headerShown: true, title: 'Agendar cita' }}
      />
    </Stack.Navigator>
  );
}