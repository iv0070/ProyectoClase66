import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { consultas, doctores, pacientes } from '../data/mockData';
import { Consulta } from '../types';

const pacienteActual = pacientes[0];

function nombreDoctor(doctorId: string): string {
  const doc = doctores.find((d) => d.id === doctorId);
  return doc ? doc.nombre : 'Doctor no encontrado';
}

function especialidadDoctor(doctorId: string): string {
  const doc = doctores.find((d) => d.id === doctorId);
  return doc ? doc.especialidad.replace('_', ' ') : '';
}
//dibuja una tarjeta de consulta
function ConsultaCard({ consulta }: { consulta: Consulta }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardFecha}>{consulta.fecha} · {consulta.hora}</Text>
        <Text style={styles.cardEspecialidad}>{especialidadDoctor(consulta.doctorId)}</Text>
      </View>
      <Text style={styles.cardDoctor}>{nombreDoctor(consulta.doctorId)}</Text>
      <Text style={styles.cardLabel}>Diagnóstico</Text>
      <Text style={styles.cardTexto}>{consulta.diagnostico}</Text>
      <Text style={styles.cardLabel}>Medicamento</Text>
      <Text style={styles.cardTexto}>{consulta.medicamento}</Text>
    </View>
  );
}

export default function ConsultasScreen() {
  const misConsultas = consultas.filter((c) => c.pacienteId === pacienteActual.id);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Mis consultas</Text>
        <Text style={styles.subtitle}>Historial de {pacienteActual.nombre}</Text>
//si no hay ninguna consulta me muestra el mensaje
        {misConsultas.length === 0 ? (
          <Text style={styles.vacio}>Aún no tienes consultas registradas.</Text>
        ) : (
          <FlatList
            data={misConsultas}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ConsultaCard consulta={item} />}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 20 },
  vacio: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardFecha: { fontSize: 13, color: '#6B7280' },
  cardEspecialidad: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
    textTransform: 'capitalize',
  },
  cardDoctor: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 10 },
  cardLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  cardTexto: { fontSize: 14, color: '#374151' },
});