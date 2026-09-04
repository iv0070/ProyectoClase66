import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import CustomButton from '../components/CustomButtom';
import { pacientes } from '../data/mockData';

interface PacienteHomeScreenProps {
  navigation?: any;
}

const pacienteActual = pacientes[0];

export default function PacienteHomeScreen({ navigation }: PacienteHomeScreenProps) {
  return (
    //se saluda en una de las pantallas con el nombre real
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