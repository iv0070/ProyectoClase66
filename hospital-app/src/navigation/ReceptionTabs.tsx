import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import ReceptionHomeScreen from '../screens/ReceptionHomeScreen';
import NuevoPacienteScreen from '../screens/NuevoPacienteScreen';
import ProfileScreen from '../screens/ProfileScreen';

//tipos de las pantallas que van en las pestanas de recepcion
export type ReceptionTabsParamList = {
  Inicio: undefined;
  NuevoPaciente: undefined;
  Perfil: undefined;
};

const Tab = createBottomTabNavigator<ReceptionTabsParamList>();

//este es el navegador de pestanas (tabs) para el rol de recepcion
//tiene el mismo patron que ya usamos en PatientTabs
export default function ReceptionTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        //aqui se elige el icono de cada pestana segun el nombre de la ruta
        tabBarIcon: ({ color, size }) => {
          const iconos: Record<string, keyof typeof Ionicons.glyphMap> = {
            Inicio: 'home-outline',
            NuevoPaciente: 'person-add-outline',
            Perfil: 'person-outline',
          };
          return <Ionicons name={iconos[route.name]} size={size} color={color} />;
        },
      })}
    >
      {/*pestana 1: pantalla principal, buscar paciente */}
      <Tab.Screen name="Inicio" component={ReceptionHomeScreen} options={{ title: 'Recepcion' }} />

      {/*pestana 2: crear un paciente nuevo */}
      <Tab.Screen name="NuevoPaciente" component={NuevoPacienteScreen} options={{ title: 'Nuevo paciente' }} />

      {/*pestana 3: perfil de quien inicio sesion (usa el AuthContext) */}
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}