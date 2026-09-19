import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import CustomButton from '../components/CustomButtom';
import { pacientes, pacienteActualId } from '../data/mockData';

interface PacienteHomeScreenProps {
  navigation?: any;
}

export default function PacienteHomeScreen({ navigation }: PacienteHomeScreenProps) {
  const pacienteActual = pacientes.find((p) => p.id === pacienteActualId) ?? pacientes[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Hola, {pacienteActual.nombre}</Text>
        <Text style={styles.subtitle}>¿Qué deseas hacer hoy?</Text>

        <CustomButton
          title="Agendar cita"
          onPress={() => navigation?.navigate('AgendarCita')}
          variant="primary"
          style={styles.button}
        />
        <CustomButton
          title="Ver perfil"
          onPress={() =>
            navigation?.navigate('Perfil', {
              rol: 'paciente',
              nombre: pacienteActual.nombre,
              usuario: pacienteActual.usuario,
              edad: pacienteActual.edad,
              telefono: pacienteActual.telefono,
            })
          }
          variant="secondary"
          style={styles.button}
        />
        <CustomButton
          title="Cerrar sesión"
          onPress={() => navigation?.navigate('Login')}
          variant="danger"
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
  },
});