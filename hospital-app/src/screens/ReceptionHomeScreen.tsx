import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButtom';
import { pacientes as pacientesIniciales } from '../data/mockData';
import { Paciente } from '../types';

interface ReceptionHomeScreenProps {
  navigation?: any;
}

export default function ReceptionHomeScreen({ navigation }: ReceptionHomeScreenProps) {
  const [busqueda, setBusqueda] = useState('');
  const [pacientes] = useState<Paciente[]>(pacientesIniciales);

  const resultados = pacientes.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const renderPaciente = ({ item }: { item: Paciente }) => (
    <View style={styles.card}>
      <Text style={styles.nombre}>{item.nombre}</Text>
      <Text style={styles.detalle}>Edad: {item.edad} · Tel: {item.telefono}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Recepción</Text>
        <Text style={styles.subtitle}>Buscar paciente por nombre</Text>

        <CustomInput
          label="Nombre del paciente"
          value={busqueda}
          onChangeText={setBusqueda}
          validationType="text"
          required={false}
          placeholder="Escribe para buscar..."
        />

        <FlatList
          data={resultados}
          keyExtractor={(item) => item.id}
          renderItem={renderPaciente}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {busqueda.trim() === ''
                ? 'Escribe un nombre para buscar'
                : 'No se encontró ningún paciente con ese nombre'}
            </Text>
          }
        />

        <CustomButton
          title="Crear paciente nuevo"
          onPress={() => navigation?.navigate('NuevoPaciente')}
          variant="primary"
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
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 16,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  nombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  detalle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 30,
  },
});