import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

import DoctorHomeScreen from '../screens/DoctorHomeScreen';
import NuevaConsultaScreen from '../screens/NuevaConsultaScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PacientesScreen from '../screens/PacientesScreen';

export type DoctorTabsParamList = {
  Agenda: undefined;
  Consulta: undefined;
  Historial: undefined;
  Perfil: undefined;
};

const Tab = createBottomTabNavigator<DoctorTabsParamList>();

export default function DoctorTabs() {
  const { colores } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: colores.fondoCard },
        headerTintColor: colores.texto,
        tabBarStyle: { backgroundColor: colores.fondoCard, borderTopColor: colores.borde },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: colores.textoSecundario,
        tabBarIcon: ({ color, size }) => {
          const iconos: Record<string, keyof typeof Ionicons.glyphMap> = {
            Agenda: 'calendar-outline',
            Consulta: 'document-text-outline',
            Historial: 'time-outline',
            Perfil: 'person-outline',
          };
          return <Ionicons name={iconos[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Agenda" component={DoctorHomeScreen} />
      <Tab.Screen name="Consulta" component={NuevaConsultaScreen} />
      <Tab.Screen name="Historial" component={PacientesScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}