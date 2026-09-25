import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DoctorTabs from './DoctorTabs';
import DocumentoScreen from '../screens/DocumentoScreen';
import HistorialPacienteScreen from '../screens/HistorialPacienteScreen';

export type DoctorStackParamList = {
  DoctorTabs: undefined;
  Documento: {
    pacienteId: string;
    pacienteNombre: string;
    citaId: string;
    fecha: string;
    hora: string;
    sintomas: string;
    diagnostico: string;
    medicamento: string;
  };
  HistorialPaciente: {
    pacienteId: string;
    pacienteNombre: string;
  };
};

const Stack = createNativeStackNavigator<DoctorStackParamList>();

export default function DoctorStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DoctorTabs" component={DoctorTabs} />
      <Stack.Screen name="Documento" component={DocumentoScreen} />
      <Stack.Screen
        name="HistorialPaciente"
        component={HistorialPacienteScreen}
        options={{ headerShown: true, title: 'Historial' }}
      />
    </Stack.Navigator>
  );
}