import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import PacienteHomeScreen from '../screens/PacienteHomeScreen';
import ConsultasScreen from '../screens/ConsultasScreen';
import RecetasScreen from '../screens/RecetasScreen';
import FacturacionScreen from '../screens/FacturacionScreen';

export type PatientTabsParamList = {
  Inicio: undefined;
  Consultas: undefined;
  Recetas: undefined;
  Facturacion: undefined;
};

const Tab = createBottomTabNavigator<PatientTabsParamList>();

export default function PatientTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarIcon: ({ color, size }) => {
          const iconos: Record<string, keyof typeof Ionicons.glyphMap> = {
            Inicio: 'home-outline',
            Consultas: 'document-text-outline',
            Recetas: 'medkit-outline',
            Facturacion: 'cash-outline',
          };
          return <Ionicons name={iconos[route.name]} size={size} color={color} />;
        },
      })}
    >
      
{<Tab.Screen name="Inicio" component={PacienteHomeScreen} /> }
<Tab.Screen name="Recetas" component={RecetasScreen} />
{<Tab.Screen name="Consultas" component={ConsultasScreen} /> }
{<Tab.Screen name="Facturacion" component={FacturacionScreen} />}
    </Tab.Navigator>
  );
}