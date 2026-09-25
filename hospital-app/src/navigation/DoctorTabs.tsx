import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

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
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
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