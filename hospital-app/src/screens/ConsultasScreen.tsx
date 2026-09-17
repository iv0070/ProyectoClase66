import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
<<<<<<< HEAD
import { useFocusEffect } from '@react-navigation/native';
import { consultas, doctores, pacientes } from '../data/mockData';
=======
import { consultas, doctores, pacientes, pacienteActualId } from '../data/mockData';
>>>>>>> origin/persona1-ashllycruz
import { Consulta } from '../types';

function nombreDoctor(doctorId: string): string {
  const doc = doctores.find((d) => d.id === doctorId);
  return doc ? doc.nombre : 'Doctor no encontrado';
}

function especialidadDoctor(doctorId: string): string {
  const doc = doctores.find((d) => d.id === doctorId);
  return doc ? doc.especialidad.replace('_', ' ') : '';
}

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
<<<<<<< HEAD
  const [misConsultas, setMisConsultas] = useState<Consulta[]>(() =>
    consultas.filter((c) => c.pacienteId === pacienteActual.id)
  );

  useFocusEffect(
    useCallback(() => {
      setMisConsultas(consultas.filter((c) => c.pacienteId === pacienteActual.id));
    }, [])
  );
=======
  const pacienteActual = pacientes.find((p) => p.id === pacienteActualId) ?? pacientes[0];
  const misConsultas = consultas.filter((c) => c.pacienteId === pacienteActual.id);
>>>>>>> origin/persona1-ashllycruz

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Mis consultas</Text>
        <Text style={styles.subtitle}>Historial de {pacienteActual.nombre}</Text>

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
  container: 
  { flex: 1, padding: 20 },
  title: 
  { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 20 },
  vacio: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 40 },
<<<<<<< HEAD
  card: 
  { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
=======
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
>>>>>>> origin/persona1-ashllycruz
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardFecha: { fontSize: 13, color: '#6B7280' },
  cardEspecialidad: { fontSize: 12, fontWeight: '600', color: '#2563EB', textTransform: 'capitalize' },
  cardDoctor: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 10 },
  cardLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  cardTexto: { fontSize: 14, color: '#374151' },
});