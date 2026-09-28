import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import { useTheme } from '../context/ThemeContext';

import ReceptionStackNavigator from './ReceptionStackNavigator';
import PatientStackNavigator from './PatientStackNavigator';
import RegistroPacienteScreen from '../screens/RegistroPacienteScreen';
import CambiarPasswordObligatorioScreen from '../screens/CambiarPasswordObligatorioScreen';
import DoctorStackNavigator from './DoctorStackNavigator';

export type RootStackParamList = {
  Login: undefined;
  RegistroPaciente: undefined;
  CambiarPasswordObligatorio: undefined;
  DoctorStack: undefined;
  PatientTabs: undefined;
  ReceptionStack: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { tema, colores } = useTheme();

  const navTheme = {
    ...(tema === 'oscuro' ? DarkTheme : DefaultTheme),
    colors: {
      ...(tema === 'oscuro' ? DarkTheme.colors : DefaultTheme.colors),
      background: colores.fondo,
      card: colores.fondoCard,
      text: colores.texto,
      border: colores.borde,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="RegistroPaciente" component={RegistroPacienteScreen} />
        <Stack.Screen name="CambiarPasswordObligatorio" component={CambiarPasswordObligatorioScreen} />
        <Stack.Screen name="DoctorStack" component={DoctorStackNavigator} />
        <Stack.Screen name="PatientTabs" component={PatientStackNavigator} />
        <Stack.Screen name="ReceptionStack" component={ReceptionStackNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}