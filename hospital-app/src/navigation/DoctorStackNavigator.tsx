import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DoctorTabs from './DoctorTabs';
import NuevaConsultaScreen from '../screens/NuevaConsultaScreen';
import DocumentoScreen from '../screens/DocumentoScreen';

export type DoctorStackParamList = {
  DoctorTabs: undefined;
  NuevaConsulta: undefined;
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
};

const Stack = createNativeStackNavigator<DoctorStackParamList>();

export default function DoctorStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DoctorTabs" component={DoctorTabs} />
      <Stack.Screen name="NuevaConsulta" component={NuevaConsultaScreen} />
      <Stack.Screen name="Documento" component={DocumentoScreen} />
    </Stack.Navigator>
  );
}