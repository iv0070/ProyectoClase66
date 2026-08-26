import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import DoctorHomeScreen from '../screens/DoctorHomeScreen';
import NuevaConsultaScreen from '../screens/NuevaConsultaScreen';
import DocumentoScreen from '../screens/DocumentoScreen';

export type RootStackParamList = {
  Login: undefined;
  DoctorHome: undefined;
  NuevaConsulta: undefined;
  Documento: {
    fecha: string;
    hora: string;
    sintomas: string;
    diagnostico: string;
    medicamento: string;
  };
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
        <Stack.Screen name="DoctorHome" component={DoctorHomeScreen} />
        <Stack.Screen name="NuevaConsulta" component={NuevaConsultaScreen} />
        <Stack.Screen name="Documento" component={DocumentoScreen} />
        {/* PatientTabs y ReceptionStack se agregan más adelante */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}